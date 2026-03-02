import {
  parseFraction,
  formatMixedNumber,
  isStandardDenominator,
  roundToStandardFraction,
  toMixedNumber
} from '../utils/fractionUtils';

const PRECISION = 32;

function formatExactFraction(inches) {
  try {
    const frac = parseFraction(Math.abs(inches));
    const sign = inches < 0 ? '-' : '';
    return sign + formatMixedNumber(frac, false);
  } catch {
    return String(inches);
  }
}

function formatNearestFraction(inches) {
  try {
    const frac = parseFraction(Math.abs(inches));
    const mixed = toMixedNumber(frac);
    const sign = inches < 0 ? '-' : '';

    if (mixed.denominator === 1 || isStandardDenominator(mixed.denominator)) {
      return null; // Already exact, no approximation needed
    }

    const rounded = roundToStandardFraction(frac, PRECISION);
    const result = sign + formatMixedNumber(rounded, false);
    const exact = sign + formatMixedNumber(frac, false);

    if (result === exact) return null;
    return result;
  } catch {
    return null;
  }
}

export default function ResultDisplay({ displayValue, resultInches, expression }) {
  const numericValue = resultInches !== null ? resultInches : (parseFloat(displayValue) || 0);
  const hasResult = resultInches !== null;

  const exactFraction = numericValue !== 0 ? formatExactFraction(numericValue) : null;
  const nearestFraction = numericValue !== 0 ? formatNearestFraction(numericValue) : null;

  return (
    <div className="text-right px-4 py-4" style={{ fontFamily: "'Chivo Mono', monospace" }}>
      {/* Top row: exact and nearest fractions */}
      {(exactFraction || nearestFraction) && (
        <div className="flex items-center justify-end gap-3 mb-2">
          {exactFraction && (
            <span className="text-white/80 text-xl font-normal">
              {exactFraction.split(' ').length > 1 ? (
                <>
                  <span className="text-[30px]">{exactFraction.split('-')[0]}</span>
                  {exactFraction.includes('-') && (
                    <span className="text-[20px] ml-1">{exactFraction.split('-').slice(1).join('-')}</span>
                  )}
                </>
              ) : exactFraction.includes('/') ? (
                <span className="text-[20px]">{exactFraction}</span>
              ) : (
                <span className="text-[30px]">{exactFraction}</span>
              )}
            </span>
          )}
          {nearestFraction && (
            <span
              className="text-white/80 text-lg px-3 py-1 rounded-full"
              style={{ background: 'var(--glass-operator)' }}
            >
              ≈ {nearestFraction}
            </span>
          )}
        </div>
      )}

      {/* Expression line (e.g. "5" + ") */}
      {expression && (
        <div className="text-white/40 text-[20px] font-thin tracking-tight mb-1">
          {expression}
        </div>
      )}

      {/* Current input value - always visible */}
      <div className="text-white/80 text-[36px] font-thin tracking-tight break-all leading-tight">
        {displayValue}
      </div>
    </div>
  );
}
