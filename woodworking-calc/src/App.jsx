import { useState, useEffect, useCallback, useRef } from 'react';
import MenuBar from './components/MenuBar';
import Calculator from './components/Calculator';
import ResultDisplay from './components/ResultDisplay';
import ModeToggle from './components/ModeToggle';
import Drawer from './components/Drawer';
import HistoryPanel from './components/HistoryPanel';
import SettingsDrawer from './components/SettingsDrawer';
import useLocalStorage from './hooks/useLocalStorage';
import { useAuth } from './contexts/AuthContext';
import { HistoryService } from './services/historyService';
import { parseFraction, toMixedNumber, formatMixedNumber, roundToStandardFraction, isStandardDenominator } from './utils/fractionUtils';

const PRECISION = 32;

function App() {
  const { user, loading: authLoading } = useAuth();

  const [displayValue, setDisplayValue] = useState('0');
  const [operation, setOperation] = useState(null);
  const [storedInches, setStoredInches] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Persisted settings
  const [unit, setUnit] = useLocalStorage('wc-unit', 'in');
  const [showMetric, setShowMetric] = useLocalStorage('wc-metric', false);
  const [mode, setMode] = useLocalStorage('wc-mode', 'decimal');

  // Unified history state
  const [unifiedHistory, setUnifiedHistory] = useState([]);
  const [historySyncStatus, setHistorySyncStatus] = useState('idle');
  const historyServiceRef = useRef(null);

  // Drawer state
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Track the result in inches
  const [resultInches, setResultInches] = useState(null);

  // Expression tracking for history and display
  const [expressionParts, setExpressionParts] = useState([]);

  const toInches = (value, fromUnit) => {
    return fromUnit === 'ft' ? value * 12 : value;
  };

  const formatResult = (value) => {
    try {
      const frac = parseFraction(value);
      const mixed = toMixedNumber(frac);
      if (!isStandardDenominator(mixed.denominator) && mixed.denominator !== 1) {
        const rounded = roundToStandardFraction(frac, PRECISION);
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

  // Parse fraction display value like "1-3/4" into inches
  const parseFractionDisplay = (str) => {
    try {
      // Handle formats: "3/4", "1-3/4", "5", "0"
      const cleaned = str.trim();
      if (cleaned === '' || cleaned === '0') return 0;

      // If it contains a dash, split into whole and fraction
      if (cleaned.includes('-')) {
        const parts = cleaned.split('-');
        const whole = parseInt(parts[0]) || 0;
        const fracPart = parts[1];
        if (fracPart && fracPart.includes('/')) {
          const [num, den] = fracPart.split('/');
          const frac = parseFraction(null, whole, parseInt(num) || 0, parseInt(den) || 1);
          return frac.valueOf();
        }
        // Just "5-" with no fraction yet, treat as whole number
        return whole;
      }

      // If it contains a slash, it's just a fraction
      if (cleaned.includes('/')) {
        const [num, den] = cleaned.split('/');
        const frac = parseFraction(null, 0, parseInt(num) || 0, parseInt(den) || 1);
        return frac.valueOf();
      }

      // Plain number
      return parseFloat(cleaned) || 0;
    } catch {
      return 0;
    }
  };

  const getCurrentValueInInches = useCallback(() => {
    if (mode === 'fraction') {
      const value = parseFractionDisplay(displayValue);
      return toInches(value, unit);
    }
    const value = parseFloat(displayValue) || 0;
    return toInches(value, unit);
  }, [displayValue, mode, unit]);

  const handleNumberInput = useCallback((num) => {
    if (waitingForOperand) {
      setDisplayValue(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? String(num) : displayValue + num);
    }
    setResultInches(null);
  }, [displayValue, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (mode === 'fraction') return; // No decimal in fraction mode
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (displayValue.indexOf('.') === -1) {
      setDisplayValue(displayValue + '.');
    }
    setResultInches(null);
  }, [displayValue, waitingForOperand, mode]);

  const handleFractionSlash = useCallback(() => {
    if (mode !== 'fraction') return;
    if (waitingForOperand) {
      setDisplayValue('/');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('/')) {
      setDisplayValue(displayValue + '/');
    }
    setResultInches(null);
  }, [displayValue, waitingForOperand, mode]);

  const handleFractionDash = useCallback(() => {
    if (mode !== 'fraction') return;
    if (waitingForOperand) {
      setDisplayValue('-');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('-')) {
      setDisplayValue(displayValue + '-');
    }
    setResultInches(null);
  }, [displayValue, waitingForOperand, mode]);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (displayValue.length <= 1 || displayValue === '0') {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  }, [displayValue, waitingForOperand]);

  const handleOperation = useCallback((nextOperation) => {
    const inputInInches = getCurrentValueInInches();
    const unitSymbol = unit === 'in' ? '"' : "'";

    if (storedInches === null) {
      setStoredInches(inputInInches);
      setExpressionParts([`${displayValue}${unitSymbol}`]);
    } else if (operation) {
      const newInches = performOperation(storedInches, inputInInches, operation);
      setStoredInches(newInches);
      setExpressionParts([...expressionParts, operation, `${displayValue}${unitSymbol}`]);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setResultInches(null);
  }, [displayValue, storedInches, operation, unit, expressionParts, getCurrentValueInInches]);

  // Initialize and manage history service
  useEffect(() => {
    historyServiceRef.current = new HistoryService(user?.id);

    const loadHistory = async () => {
      setHistorySyncStatus('syncing');
      const history = await historyServiceRef.current.getHistory();
      setUnifiedHistory(history);
      setHistorySyncStatus('synced');
    };

    loadHistory();
  }, [user]);

  // On sign-in, merge local into cloud
  useEffect(() => {
    if (user && !authLoading) {
      const mergeHistory = async () => {
        setHistorySyncStatus('syncing');
        const merged = await historyServiceRef.current.mergeOnSignIn(user.id);
        setUnifiedHistory(merged);
        setHistorySyncStatus('synced');
      };
      mergeHistory();
    }
  }, [user, authLoading]);

  const handleEquals = useCallback(() => {
    if (storedInches !== null && operation) {
      const inputInInches = getCurrentValueInInches();
      const totalInches = performOperation(storedInches, inputInInches, operation);

      const unitSymbol = unit === 'in' ? '"' : "'";
      const fullExpression = [...expressionParts, operation, `${displayValue}${unitSymbol}`].join(' ');

      setResultInches(totalInches);
      setDisplayValue(String(totalInches));

      // Save to history
      const entry = {
        expression: fullExpression,
        resultInches: totalInches,
        resultDecimal: String(totalInches),
        resultFraction: formatResult(totalInches),
        timestamp: Date.now()
      };

      historyServiceRef.current.saveCalculation(entry);
      setUnifiedHistory([...unifiedHistory, entry]);

      setStoredInches(null);
      setOperation(null);
      setExpressionParts([]);
      setWaitingForOperand(true);
    }
  }, [displayValue, storedInches, operation, unit, expressionParts, unifiedHistory, getCurrentValueInInches]);

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setStoredInches(null);
    setOperation(null);
    setWaitingForOperand(false);
    setResultInches(null);
    setExpressionParts([]);
  }, []);

  const handleUnitToggle = useCallback(() => {
    setUnit(unit === 'in' ? 'ft' : 'in');
  }, [unit, setUnit]);

  // Build expression string for display
  const currentExpression = (() => {
    if (expressionParts.length === 0 && !operation) return null;
    const parts = [...expressionParts];
    if (operation) {
      parts.push(operation);
    }
    return parts.join(' ');
  })();

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
        if (mode === 'fraction') {
          handleFractionDash();
        } else {
          handleOperation('-');
        }
      } else if (key === '*') {
        e.preventDefault();
        handleOperation('×');
      } else if (key === '/') {
        e.preventDefault();
        if (mode === 'fraction') {
          handleFractionSlash();
        } else {
          handleOperation('÷');
        }
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Escape') {
        e.preventDefault();
        if (historyDrawerOpen || settingsDrawerOpen) {
          setHistoryDrawerOpen(false);
          setSettingsDrawerOpen(false);
        } else {
          handleClear();
        }
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, handleDecimal, handleOperation, handleEquals, handleClear, handleBackspace, handleFractionSlash, handleFractionDash, mode, historyDrawerOpen, settingsDrawerOpen]);

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <div className="w-full max-w-sm min-h-screen flex flex-col justify-between px-[7px] pb-[7px]">
        {/* Top: Menu bar */}
        <MenuBar
          showMetric={showMetric}
          onToggleMetric={() => setShowMetric(!showMetric)}
          onHistoryClick={() => setHistoryDrawerOpen(true)}
          onSettingsClick={() => setSettingsDrawerOpen(true)}
        />

        {/* Bottom group: readout + calculator + toggle */}
        <div className="flex flex-col">
          <ResultDisplay
            displayValue={displayValue}
            resultInches={resultInches}
            expression={currentExpression}
          />

          <div className="h-3" />

          <Calculator
            mode={mode}
            unit={unit}
            onNumberInput={handleNumberInput}
            onOperation={handleOperation}
            onClear={handleClear}
            onEquals={handleEquals}
            onBackspace={handleBackspace}
            onUnitToggle={handleUnitToggle}
            onFractionSlash={handleFractionSlash}
            onFractionDash={handleFractionDash}
            onDecimal={handleDecimal}
            currentOperation={operation}
          />

          <div className="h-3" />

          <ModeToggle
            mode={mode}
            onModeChange={setMode}
          />
        </div>
      </div>

      {/* History Drawer (left) */}
      <Drawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        side="left"
        title="History"
      >
        <HistoryPanel
          history={unifiedHistory}
          onClearHistory={() => {
            historyServiceRef.current.clearHistory();
            setUnifiedHistory([]);
          }}
          onUseValue={(value) => {
            setDisplayValue(String(value));
            setResultInches(parseFloat(value));
            setWaitingForOperand(true);
            setHistoryDrawerOpen(false);
          }}
          precision={PRECISION}
        />
      </Drawer>

      {/* Settings Drawer (right) */}
      <Drawer
        isOpen={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        side="right"
        title="Settings"
      >
        <SettingsDrawer />
      </Drawer>
    </div>
  );
}

export default App;
