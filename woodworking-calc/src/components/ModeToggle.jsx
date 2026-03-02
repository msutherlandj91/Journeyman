export default function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="w-full bg-[rgba(0,0,0,0.64)] rounded-[20px] flex p-1" style={{ fontFamily: 'Inter, sans-serif' }}>
      <button
        onClick={() => onModeChange('decimal')}
        className={`flex-1 py-3 rounded-[16px] text-base transition-all ${
          mode === 'decimal'
            ? 'bg-[rgba(86,226,172,0.16)] text-white/80'
            : 'text-white/40'
        }`}
      >
        Decimal
      </button>
      <button
        onClick={() => onModeChange('fraction')}
        className={`flex-1 py-3 rounded-[16px] text-base transition-all ${
          mode === 'fraction'
            ? 'bg-[rgba(86,226,172,0.16)] text-white/80'
            : 'text-white/40'
        }`}
      >
        Fraction
      </button>
    </div>
  );
}
