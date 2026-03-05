const baseClasses = "w-full aspect-square rounded-[16px] flex items-center justify-center text-[clamp(18px,6vw,28px)] font-normal transition-all active:scale-95";

const variantStyles = {
  number: { background: 'var(--glass-number)', color: 'white' },
  modifier: { background: 'var(--glass-modifier)', color: 'white' },
  operator: { background: 'var(--glass-operator)', color: 'white' },
};

function CalcButton({ children, onClick, variant = 'number', disabled = false, active = false }) {
  const base = variantStyles[variant] || variantStyles.number;
  const style = active ? { background: 'white', color: '#111' } : base;
  return (
    <div className="p-[3px]">
      <button
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        style={{
          ...style,
          fontFamily: 'Inter, sans-serif',
          opacity: disabled ? 0.25 : 1,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {children}
      </button>
    </div>
  );
}

function RulerButton({ onUnitToggle, unit }) {
  return (
    <div className="p-[3px]">
      <button
        onClick={onUnitToggle}
        className="w-full aspect-square rounded-[16px] flex items-center justify-center transition-all active:scale-95"
        style={{ background: 'var(--glass-modifier)', fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex flex-col items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h20v16H2z" />
            <path d="M6 4v6M10 4v4M14 4v6M18 4v4" />
          </svg>
          <span className="text-white text-xs mt-0.5">{unit}</span>
        </div>
      </button>
    </div>
  );
}

export default function Calculator({
  mode,
  unit,
  onNumberInput,
  onOperation,
  onClear,
  onEquals,
  onBackspace,
  onUnitToggle,
  onFractionSlash,
  onFractionDash,
  onDecimal,
  currentOperation
}) {
  const isFraction = mode === 'fraction';

  return (
    <div className="grid grid-cols-4 w-full">
      {/* Row 1: AC, Ruler, /, ÷ */}
      <CalcButton variant="modifier" onClick={onClear}>AC</CalcButton>
      <RulerButton onUnitToggle={onUnitToggle} unit={unit} />
      <CalcButton
        variant="number"
        onClick={isFraction ? onFractionSlash : undefined}
        disabled={!isFraction}
      >
        /
      </CalcButton>
      <CalcButton variant="operator" active={currentOperation === '÷'} onClick={() => onOperation('÷')}>÷</CalcButton>

      {/* Row 2: 7, 8, 9, × */}
      <CalcButton onClick={() => onNumberInput(7)}>7</CalcButton>
      <CalcButton onClick={() => onNumberInput(8)}>8</CalcButton>
      <CalcButton onClick={() => onNumberInput(9)}>9</CalcButton>
      <CalcButton variant="operator" active={currentOperation === '×'} onClick={() => onOperation('×')}>×</CalcButton>

      {/* Row 3: 4, 5, 6, - */}
      <CalcButton onClick={() => onNumberInput(4)}>4</CalcButton>
      <CalcButton onClick={() => onNumberInput(5)}>5</CalcButton>
      <CalcButton onClick={() => onNumberInput(6)}>6</CalcButton>
      <CalcButton variant="operator" active={currentOperation === '-'} onClick={() => onOperation('-')}>−</CalcButton>

      {/* Row 4: 1, 2, 3, + */}
      <CalcButton onClick={() => onNumberInput(1)}>1</CalcButton>
      <CalcButton onClick={() => onNumberInput(2)}>2</CalcButton>
      <CalcButton onClick={() => onNumberInput(3)}>3</CalcButton>
      <CalcButton variant="operator" active={currentOperation === '+'} onClick={() => onOperation('+')}>+</CalcButton>

      {/* Row 5: 0, ./-, ⌫, = */}
      <CalcButton onClick={() => onNumberInput(0)}>0</CalcButton>
      {isFraction ? (
        <CalcButton onClick={onFractionDash}>-</CalcButton>
      ) : (
        <CalcButton onClick={onDecimal}>.</CalcButton>
      )}
      <CalcButton variant="modifier" onClick={onBackspace}>⌫</CalcButton>
      <CalcButton variant="operator" onClick={onEquals}>=</CalcButton>
    </div>
  );
}
