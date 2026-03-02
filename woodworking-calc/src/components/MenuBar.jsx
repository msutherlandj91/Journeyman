export default function MenuBar({ showMetric, onToggleMetric, onHistoryClick, onSettingsClick }) {
  return (
    <div className="flex items-center justify-between px-[7px] pt-[7px]">
      {/* History button */}
      <button
        onClick={onHistoryClick}
        className="w-16 h-16 rounded-[16px] border border-white/20 flex items-center justify-center"
        aria-label="History"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* Imperial/Metric toggle */}
        <button
          onClick={onToggleMetric}
          className="w-16 h-16 rounded-[16px] flex items-center justify-center"
          aria-label={showMetric ? 'Switch to imperial' : 'Switch to metric'}
        >
          <span className="text-white/70 text-base font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
            {showMetric ? 'met' : 'imp'}
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="w-16 h-16 rounded-[16px] border border-white/20 flex items-center justify-center"
          aria-label="Settings"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
