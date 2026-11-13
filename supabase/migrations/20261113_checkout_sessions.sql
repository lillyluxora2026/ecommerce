-- ============================================================================
-- Checkout sessions (abandoned checkout recovery)
--
-- The storefront saves a checkout session as soon as a shopper enters an email
-- or phone number at checkout. If they leave without paying, the ERP lists the
-- session under "Abandoned Checkouts" and can send a recovery link that
-- restores the cart and the details they already typed.
--
-- Safe to run more than once.
-- ============================================================================

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  -- Unguessable token used in the recovery link: /checkout?recover=<token>
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'open' check (status in ('open', 'completed')),

  user_id uuid references auth.users(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  email text,
  phone text,
  full_name text,
  shipping_address jsonb not null default '{}'::jsonb,

  -- Snapshot of the cart: [{ id, variantId, name, variantLabel, price, quantity, image, slug }]
  items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0,
  subtotal numeric(12,2) not null default 0,
  coupon_code text,

  -- Set when the shopper reaches the payment step and an order is created.
  order_id uuid references public.orders(id) on delete set null,

  recovery_emails_sent integer not null default 0,
  last_recovery_email_at timestamptz,
  -- Set when the shopper opens a recovery link.
  recovered_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checkout_sessions_status_updated_idx
  on public.checkout_sessions (status, updated_at desc);

create index if not exists checkout_sessions_order_idx
  on public.checkout_sessions (order_id)
  where order_id is not null;

create index if not exists checkout_sessions_email_idx
  on public.checkout_sessions (lower(email))
  where email is not null;

-- Contains customer contact details, so no public policies: only the service
-- role (storefront API routes and ERP server actions) can read or write.
alter table public.checkout_sessions enable row level security;

-- ----------------------------------------------------------------------------
-- Close the session automatically when its order is paid, however the payment
-- is confirmed (browser callback, Razorpay webhook, or marked paid in the ERP).
-- ----------------------------------------------------------------------------
create or replace function public.complete_checkout_session_on_order_paid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.financial_status, '')) = 'paid'
     and lower(coalesce(old.financial_status, '')) <> 'paid' then
    update public.checkout_sessions
       set status = 'completed',
           completed_at = now(),
           updated_at = now()
     where order_id = new.id
       and status = 'open';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_complete_checkout_session on public.orders;

create trigger orders_complete_checkout_session
  after update of financial_status on public.orders
  for each row
  execute function public.complete_checkout_session_on_order_paid();

-- ----------------------------------------------------------------------------
-- Summary numbers for the ERP "Abandoned Checkouts" page.
-- A session counts as abandoned once it has been idle for p_idle_minutes.
-- ----------------------------------------------------------------------------
create or replace function public.get_checkout_recovery_stats(
  p_days integer default 30,
  p_idle_minutes integer default 30
)
returns table (
  abandoned_count bigint,
  abandoned_value numeric,
  recovered_count bigint,
  recovered_value numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (
      where status = 'open'
        and updated_at < now() - make_interval(mins => p_idle_minutes)
    ) as abandoned_count,
    coalesce(sum(subtotal) filter (
      where status = 'open'
        and updated_at < now() - make_interval(mins => p_idle_minutes)
    ), 0) as abandoned_value,
    count(*) filter (
      where status = 'completed' and recovered_at is not null
    ) as recovered_count,
    coalesce(sum(subtotal) filter (
      where status = 'completed' and recovered_at is not null
    ), 0) as recovered_value
  from public.checkout_sessions
  where created_at >= now() - make_interval(days => p_days)
    and (email is not null or phone is not null);
$$;

revoke all on function public.get_checkout_recovery_stats(integer, integer) from public, anon, authenticated;
grant execute on function public.get_checkout_recovery_stats(integer, integer) to service_role;
