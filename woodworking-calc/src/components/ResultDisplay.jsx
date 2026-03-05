import {
  parseFraction,
  formatMixedNumber,
  isStandardDenominator,
  roundToStandardFraction,
  toMixedNumber,
  PRECISION
} from '../utils/fractionUtils';

const INCHES_TO_CM = 2.54;

function formatNearestFraction(inches) {
  try {
    const frac = parseFraction(Math.abs(inches));
    const mixed = toMixedNumber(frac);
    const sign = inches < 0 ? '-' : '';

    if (mixed.denominator === 1 || isStandardDenominator(mixed.denominator)) {
      return null;
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

function formatMetric(inches) {
  const cm = inches * INCHES_TO_CM;
  if (Math.abs(cm) >= 100) {
    const m = cm / 100;
    return `${m.toFixed(2)} m`;
  }
  return `${cm.toFixed(2)} cm`;
}

function FractionDisplay({ inches }) {
  try {
    const absInches = Math.abs(inches);
    const sign = inches < 0 ? '-' : '';
    const frac = parseFraction(absInches);
    const { whole, numerator, denominator } = toMixedNumber(frac);

    if (numerator === 0) {
      return <span className="text-[30px]">{sign}{whole}</span>;
    } else if (whole === 0) {
      return <span className="text-[20px]">{sign}{numerator}/{denominator}</span>;
    } else {
      return (
        <>
          <span className="text-[30px]">{sign}{whole}</span>
          <span className="text-[20px]">-{numerator}/{denominator}</span>
        </>
      );
    }
  } catch {
    return <span className="text-[30px]">{String(inches)}</span>;
  }
}

export default function ResultDisplay({ displayValue, resultInches, expression, unit, showMetric }) {
  const numericValue = resultInches !== null ? resultInches : (parseFloat(displayValue) || 0);
  const unitSymbol = unit === 'ft' ? '\u2032' : '\u2033';

  const showFraction = numericValue !== 0;
  const nearestFraction = showFraction ? formatNearestFraction(numericValue) : null;

  // For metric, convert the value in inches
  const metricDisplay = showMetric && numericValue !== 0 ? formatMetric(numericValue) : null;

  return (
    <div className="text-right px-4 py-4" style={{ fontFamily: "'Chivo Mono', monospace" }}>
      {/* Top row: exact and nearest fractions */}
      {(showFraction || nearestFraction) && (
        <div className="flex items-center justify-end gap-3 mb-2">
          {showFraction && (
            <span className="text-white/80 text-xl font-normal">
              <FractionDisplay inches={numericValue} />
              <span className="text-[20px] text-white/50">{unitSymbol}</span>
            </span>
          )}
          {nearestFraction && (
            <span
              className="text-white/80 text-lg px-3 py-1 rounded-full"
              style={{ background: 'var(--glass-operator)' }}
            >
              ≈ {nearestFraction}{unitSymbol}
            </span>
          )}
        </div>
      )}

      {/* Metric conversion */}
      {metricDisplay && (
        <div className="text-white/40 text-[18px] font-thin tracking-tight mb-1">
          {metricDisplay}
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
        {displayValue}<span className="text-white/40">{unitSymbol}</span>
      </div>
    </div>
  );
}
