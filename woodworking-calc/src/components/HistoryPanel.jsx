import {
  parseFraction,
  formatMixedNumber,
  isStandardDenominator,
  roundToStandardFraction,
  toMixedNumber
} from '../utils/fractionUtils';

function formatInchValue(inches, precision) {
  try {
    const frac = parseFraction(Math.abs(inches));
    const mixed = toMixedNumber(frac);
    const sign = inches < 0 ? '-' : '';

    if (!isStandardDenominator(mixed.denominator) && mixed.denominator !== 1) {
      const rounded = roundToStandardFraction(frac, precision);
      return sign + formatMixedNumber(rounded, false);
    }
    return sign + formatMixedNumber(frac, false);
  } catch {
    return String(inches);
  }
}

function formatAsFeetInches(totalInches, precision) {
  const absInches = Math.abs(totalInches);
  const sign = totalInches < 0 ? '-' : '';
  const feet = Math.floor(absInches / 12);
  const remaining = absInches - (feet * 12);
  const inchStr = formatInchValue(remaining, precision);

  if (feet === 0) return `${sign}${inchStr}"`;
  if (remaining === 0 || inchStr === '0') return `${sign}${feet}'`;
  return `${sign}${feet}' ${inchStr}"`;
}

/**
 * History Panel Component
 * Shows persistent calculation history stored in localStorage
 */
export default function HistoryPanel({ history, onClearHistory, onUseValue, precision }) {
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-600 py-6 text-sm">
        No calculations yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-400">History</span>
        <button
          onClick={onClearHistory}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {history.slice().reverse().map((entry, i) => {
          const inches = parseFloat(entry.resultInches || entry.resultDecimal);
          const absInches = Math.abs(inches);
          const inchDisplay = `${formatInchValue(inches, precision || 16)}"`;
          const feetDisplay = absInches >= 12 ? formatAsFeetInches(inches, precision || 16) : null;

          return (
            <button
              key={i}
              onClick={() => onUseValue(entry.resultInches || entry.resultDecimal)}
              className="w-full text-right px-4 py-3 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
            >
              <div className="text-xs text-gray-500">
                {entry.expression}
              </div>
              <div className="text-lg text-white font-light">
                {inchDisplay}
              </div>
              {feetDisplay && (
                <div className="text-sm text-teal-400 font-light">
                  {feetDisplay}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
