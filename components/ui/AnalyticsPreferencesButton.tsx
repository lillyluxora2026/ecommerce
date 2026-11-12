'use client';

const OPEN_PREFERENCES_EVENT = 'lily-luxora:analytics-preferences-open';

export function AnalyticsPreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
      className="hover:text-[#382F2A] transition-colors"
    >
      Cookie Preferences
    </button>
  );
}
