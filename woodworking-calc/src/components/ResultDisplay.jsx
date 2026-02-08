import {
  parseFraction,
  formatMixedNumber,
  isStandardDenominator,
  roundToStandardFraction,
  toMixedNumber
} from '../utils/fractionUtils';

/**
 * Format an inch value as a standard fraction string
 */
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

/**
 * Format inches as feet + inches string
 * e.g., 27.375 → 2' 3-3/8"
 */
function formatAsFeetInches(totalInches, precision) {
  const absInches = Math.abs(totalInches);
  const sign = totalInches < 0 ? '-' : '';
  const feet = Math.floor(absInches / 12);
  const remaining = absInches - (feet * 12);

  const inchStr = formatInchValue(remaining, precision);

  if (feet === 0) {
    return `${sign}${inchStr}"`;
  }
  if (remaining === 0 || inchStr === '0') {
    return `${sign}${feet}'`;
  }
  return `${sign}${feet}' ${inchStr}"`;
}

const INCHES_TO_CM = 2.54;

/**
 * Format inches as metric string
 * Uses cm for < 100 cm, meters + cm otherwise
 */
function formatMetric(inches) {
  const cm = Math.abs(inches) * INCHES_TO_CM;
  const sign = inches < 0 ? '-' : '';

  if (cm < 100) {
    return `${sign}${cm.toFixed(2)} cm`;
  }

  const meters = Math.floor(cm / 100);
  const remainingCm = cm - (meters * 100);

  if (remainingCm < 0.01) {
    return `${sign}${meters} m`;
  }
  return `${sign}${meters} m ${remainingCm.toFixed(2)} cm`;
}

/**
 * Result Display Component - iOS Calculator style
 * Shows result in both inches and feet when applicable
 * Optional metric conversion toggle
 */
export default function ResultDisplay({ displayValue, operation, precision, unit, resultInches, showMetric, onToggleMetric }) {
  const numericValue = parseFloat(displayValue) || 0;

  // For the fraction line: show fraction of current display value
  let fractionText = '';
  let approximateText = '';
  let showApproximation = false;
  let mixed = null;

  try {
    const fraction = parseFraction(numericValue);
    mixed = toMixedNumber(fraction);

    fractionText = formatMixedNumber(fraction, true);

    if (mixed.denominator !== 1 && !isStandardDenominator(mixed.denominator)) {
      const rounded = roundToStandardFraction(fraction, precision);
      approximateText = formatMixedNumber(rounded, true);

      if (approximateText !== fractionText) {
        showApproximation = true;
      }
    }
  } catch (err) {
    fractionText = 'Error';
  }

  // Build dual-unit display when we have a result
  const hasResult = resultInches !== null;
  const absResultInches = hasResult ? Math.abs(resultInches) : 0;

  // Format result in inches
  const inchesDisplay = hasResult ? `${formatInchValue(resultInches, precision)}"` : null;

  // Format result in feet+inches (only if >= 12 inches)
  const feetDisplay = hasResult && absResultInches >= 12
    ? formatAsFeetInches(resultInches, precision)
    : null;

  // Metric conversion
  const metricDisplay = hasResult && showMetric
    ? formatMetric(resultInches)
    : null;

  // For non-result display, also compute metric from current input
  const inputMetric = !hasResult && showMetric && numericValue !== 0
    ? formatMetric(unit === 'ft' ? numericValue * 12 : numericValue)
    : null;

  const unitSymbol = unit === 'in' ? '"' : "'";

  return (
    <div className="text-right px-6 py-8">
      {/* Fraction line - only show if there's a fractional part */}
      {numericValue !== 0 && mixed && mixed.numerator !== 0 && !hasResult && (
        <div className="text-2xl text-gray-500 mb-2 font-light">
          {fractionText}
          {showApproximation && (
            <span className="text-amber-400 ml-3">
              ≈ {approximateText}
            </span>
          )}
        </div>
      )}

      {/* Metric for current input (before equals) */}
      {inputMetric && (
        <div className="text-lg text-purple-400 mb-2 font-light">
          = {inputMetric}
        </div>
      )}

      {/* Dual unit display for results */}
      {hasResult && (
        <div className="mb-2 space-y-1">
          {/* Inches display */}
          {inchesDisplay && (
            <div className="text-2xl text-teal-400 font-light">
              {inchesDisplay}
            </div>
          )}
          {/* Feet display - only if >= 12 inches */}
          {feetDisplay && (
            <div className="text-2xl text-teal-400 font-light">
              {feetDisplay}
            </div>
          )}
          {/* Metric display */}
          {metricDisplay && (
            <div className="text-2xl text-purple-400 font-light">
              {metricDisplay}
            </div>
          )}
        </div>
      )}

      {/* Main display (decimal value) */}
      <div className="text-7xl text-white font-light tracking-tight break-all">
        {displayValue}
        {!hasResult && <span className="text-4xl text-gray-500 ml-1">{unitSymbol}</span>}
        {operation && <span className="text-gray-500 ml-2 text-4xl">{operation}</span>}
      </div>

      {/* Metric toggle button */}
      <button
        onClick={onToggleMetric}
        className={`mt-3 text-xs px-3 py-1 rounded-full transition-all ${
          showMetric
            ? 'bg-purple-500/20 text-purple-400'
            : 'bg-[#333333] text-gray-500 hover:text-gray-400'
        }`}
      >
        {showMetric ? 'cm/m ✓' : 'cm/m'}
      </button>
    </div>
  );
}
