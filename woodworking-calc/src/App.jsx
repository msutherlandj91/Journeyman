import { useState, useEffect, useCallback } from 'react';
import InputMethodA from './components/InputMethodA';
import Calculator from './components/Calculator';
import ResultDisplay from './components/ResultDisplay';
import PrecisionSelector from './components/PrecisionSelector';
import UnitSelector from './components/UnitSelector';
import HistoryPanel from './components/HistoryPanel';
import AuthPanel from './components/AuthPanel';
import useLocalStorage from './hooks/useLocalStorage';
import { useAuth } from './contexts/AuthContext';
import { saveCalculation, getCalculations } from './firebase';
import { parseFraction, toMixedNumber, formatMixedNumber, roundToStandardFraction, isStandardDenominator } from './utils/fractionUtils';

function App() {
  const { user, loading: authLoading } = useAuth();

  const [displayValue, setDisplayValue] = useState('0');
  const [operation, setOperation] = useState(null);
  // Store previous value always in inches internally
  const [storedInches, setStoredInches] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Persisted settings
  const [precision, setPrecision] = useLocalStorage('wc-precision', 16);
  const [unit, setUnit] = useLocalStorage('wc-unit', 'in');
  const [history, setHistory] = useLocalStorage('wc-history', []);
  const [showMetric, setShowMetric] = useLocalStorage('wc-metric', false);
  const [cloudHistory, setCloudHistory] = useState([]);

  // Track the result in inches so display always shows both units
  const [resultInches, setResultInches] = useState(null);

  // Expression tracking for history
  const [expressionParts, setExpressionParts] = useState([]);

  // UI state
  const [showManualInput, setShowManualInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [manualInput, setManualInput] = useState({
    whole: 0,
    numerator: 0,
    denominator: 1
  });

  const toInches = (value, fromUnit) => {
    return fromUnit === 'ft' ? value * 12 : value;
  };

  const formatResult = (value) => {
    try {
      const frac = parseFraction(value);
      const mixed = toMixedNumber(frac);
      if (!isStandardDenominator(mixed.denominator) && mixed.denominator !== 1) {
        const rounded = roundToStandardFraction(frac, precision);
        return formatMixedNumber(rounded, true);
      }
      return formatMixedNumber(frac, true);
    } catch {
      return String(value);
    }
  };

  const performOperation = (prevInches, currentInches, op) => {
    try {
      const prev = parseFraction(prevInches);
      const current = parseFraction(currentInches);

      let result;
      switch (op) {
        case '+':
          result = prev.add(current);
          break;
        case '-':
          result = prev.sub(current);
          break;
        case '×':
          result = prev.mul(current);
          break;
        case '÷':
          if (current.valueOf() === 0) {
            throw new Error('Cannot divide by zero');
          }
          result = prev.div(current);
          break;
        default:
          return currentInches;
      }

      return result.valueOf();
    } catch (err) {
      console.error('Calculation error:', err);
      return currentInches;
    }
  };

  const handleNumberInput = useCallback((num) => {
    if (waitingForOperand) {
      setDisplayValue(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? String(num) : displayValue + num);
    }
    // Clear result display when entering new number
    setResultInches(null);
  }, [displayValue, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (displayValue.indexOf('.') === -1) {
      setDisplayValue(displayValue + '.');
    }
    setResultInches(null);
  }, [displayValue, waitingForOperand]);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (displayValue.length <= 1 || displayValue === '0') {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  }, [displayValue, waitingForOperand]);

  const handleOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(displayValue);
    const inputInInches = toInches(inputValue, unit);
    const unitSymbol = unit === 'in' ? '"' : "'";

    if (storedInches === null) {
      setStoredInches(inputInInches);
      setExpressionParts([`${inputValue}${unitSymbol}`]);
    } else if (operation) {
      const newInches = performOperation(storedInches, inputInInches, operation);
      setStoredInches(newInches);
      setExpressionParts([...expressionParts, operation, `${inputValue}${unitSymbol}`]);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setResultInches(null);
  }, [displayValue, storedInches, operation, unit, expressionParts]);

  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(displayValue);

    if (storedInches !== null && operation) {
      const inputInInches = toInches(inputValue, unit);
      const totalInches = performOperation(storedInches, inputInInches, operation);

      const unitSymbol = unit === 'in' ? '"' : "'";
      const fullExpression = [...expressionParts, operation, `${inputValue}${unitSymbol}`].join(' ');

      // Store result in inches for dual display
      setResultInches(totalInches);

      // Show the result in inches as the display value
      setDisplayValue(String(totalInches));

      // Add to history
      const entry = {
        expression: fullExpression,
        resultInches: totalInches,
        resultDecimal: String(totalInches),
        resultFraction: formatResult(totalInches),
        timestamp: Date.now()
      };
      setHistory([...history, entry]);

      // Save to cloud if user is signed in
      saveToCloud(entry);

      setStoredInches(null);
      setOperation(null);
      setExpressionParts([]);
      setWaitingForOperand(true);
    }
  }, [displayValue, storedInches, operation, unit, expressionParts, history, precision, saveToCloud]);

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setStoredInches(null);
    setOperation(null);
    setWaitingForOperand(false);
    setResultInches(null);
    setExpressionParts([]);
  }, []);

  const handleToggleSign = useCallback(() => {
    const value = parseFloat(displayValue);
    setDisplayValue(String(value * -1));
  }, [displayValue]);

  const handlePercent = useCallback(() => {
    const value = parseFloat(displayValue);
    setDisplayValue(String(value / 100));
  }, [displayValue]);

  const handleManualInputSubmit = () => {
    try {
      const fraction = parseFraction(
        null,
        manualInput.whole,
        manualInput.numerator,
        manualInput.denominator
      );
      setDisplayValue(String(fraction.valueOf()));
      setResultInches(null);
      setShowManualInput(false);
    } catch (err) {
      console.error('Invalid input:', err);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleUseHistoryValue = (value) => {
    setDisplayValue(String(value));
    setResultInches(parseFloat(value));
    setShowHistory(false);
  };

  // Save new calculation to cloud if user is signed in
  const saveToCloud = useCallback(async (entry) => {
    if (user) {
      try {
        await saveCalculation(user.uid, entry);
        // Reload cloud history
        const calcs = await getCalculations(user.uid);
        setCloudHistory(calcs);
      } catch (error) {
        console.error('Error saving to cloud:', error);
      }
    }
  }, [user]);

  // Load cloud history when user signs in
  useEffect(() => {
    if (user && !authLoading) {
      const loadCloudHistory = async () => {
        try {
          const calcs = await getCalculations(user.uid);
          setCloudHistory(calcs);
        } catch (error) {
          console.error('Error loading cloud history:', error);
        }
      };
      loadCloudHistory();
    } else {
      setCloudHistory([]);
    }
  }, [user, authLoading]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        handleNumberInput(parseInt(key));
      } else if (key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+') {
        e.preventDefault();
        handleOperation('+');
      } else if (key === '-') {
        e.preventDefault();
        handleOperation('-');
      } else if (key === '*') {
        e.preventDefault();
        handleOperation('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, handleDecimal, handleOperation, handleEquals, handleClear, handleBackspace]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Display area */}
        <div className="mb-6">
          <ResultDisplay
            displayValue={displayValue}
            operation={operation}
            precision={precision}
            unit={unit}
            resultInches={resultInches}
            showMetric={showMetric}
            onToggleMetric={() => setShowMetric(!showMetric)}
          />
        </div>

        {/* Auth Panel */}
        <div className="mb-4">
          <AuthPanel />
        </div>

        {/* Settings row */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <PrecisionSelector precision={precision} onChange={setPrecision} />
          <UnitSelector unit={unit} onChange={setUnit} />
        </div>

        {/* Toggle buttons row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => { setShowManualInput(!showManualInput); setShowHistory(false); }}
            className={`text-sm transition-colors ${showManualInput ? 'text-[#FF9F0A]' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Fraction Input
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => { setShowHistory(!showHistory); setShowManualInput(false); }}
            className={`text-sm transition-colors ${showHistory ? 'text-[#FF9F0A]' : 'text-gray-400 hover:text-gray-300'}`}
          >
            History ({history.length})
          </button>
        </div>

        {/* Manual input (collapsible) */}
        {showManualInput && (
          <div className="mb-4 bg-[#1a1a1a] rounded-2xl p-4">
            <InputMethodA
              value={manualInput}
              onChange={setManualInput}
              onSubmit={handleManualInputSubmit}
            />
            <button
              onClick={handleManualInputSubmit}
              className="w-full mt-3 py-2 bg-[#FF9F0A] text-white rounded-full text-sm font-light"
            >
              Use This Value
            </button>
          </div>
        )}

        {/* History panel (collapsible) */}
        {showHistory && (
          <div className="mb-4 bg-[#1a1a1a] rounded-2xl p-4">
            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onUseValue={handleUseHistoryValue}
              precision={precision}
            />
          </div>
        )}

        {/* Calculator buttons */}
        <div className="mt-4">
          <Calculator
            onNumberInput={handleNumberInput}
            onDecimal={handleDecimal}
            onOperation={handleOperation}
            onEquals={handleEquals}
            onClear={handleClear}
            onToggleSign={handleToggleSign}
            onPercent={handlePercent}
            currentOperation={operation}
          />
        </div>

        {/* Keyboard hint for desktop */}
        <div className="text-center mt-4 text-xs text-gray-600">
          <span className="hidden sm:inline">Keyboard: 0-9, +, -, *, /, Enter, Esc, Backspace</span>
        </div>
      </div>
    </div>
  );
}

export default App;
