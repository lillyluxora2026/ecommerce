import Link from 'next/link';

type AnnouncementBarProps = {
  text: string;
  linkLabel?: string;
  linkHref?: string;
  background: string;
  textColor: string;
};

export function AnnouncementBar({ text, linkLabel, linkHref, background, textColor }: AnnouncementBarProps) {
  if (!text.trim()) return null;

  return (
    <div
      className="border-b border-[#B7A596]/30 px-4 py-2.5 text-center text-[11px] font-sans uppercase tracking-[0.22em]"
      style={{ backgroundColor: background, color: textColor }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 md:flex-row">
        <span>{text}</span>
        {linkLabel && linkHref ? (
          <Link href={linkHref} className="underline underline-offset-4 opacity-90 hover:opacity-100">
            {linkLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
