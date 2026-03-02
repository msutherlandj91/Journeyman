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

  const Button = ({ children, onClick, variant = 'number', disabled = false }) => {
    const baseClasses = "w-[81px] h-[81px] rounded-[16px] flex items-center justify-center text-[28px] font-normal transition-all active:scale-95";

    const variantStyles = {
      number: { background: 'var(--glass-number)', color: 'white' },
      modifier: { background: 'var(--glass-modifier)', color: 'white' },
      operator: { background: 'var(--glass-operator)', color: 'white' },
    };

    const style = variantStyles[variant] || variantStyles.number;

    return (
      <div className="w-[97px] h-[97px] flex items-center justify-center">
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
  };

  // Ruler icon button showing current unit
  const RulerButton = () => (
    <div className="w-[97px] h-[97px] flex items-center justify-center">
      <button
        onClick={onUnitToggle}
        className="w-[81px] h-[81px] rounded-[16px] flex items-center justify-center transition-all active:scale-95"
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

  return (
    <div className="flex flex-col items-center">
      {/* Row 1: AC, Ruler, /, ÷ */}
      <div className="flex">
        <Button variant="modifier" onClick={onClear}>AC</Button>
        <RulerButton />
        <Button
          variant="number"
          onClick={isFraction ? onFractionSlash : undefined}
          disabled={!isFraction}
        >
          /
        </Button>
        <Button variant="operator" onClick={() => onOperation('÷')}>÷</Button>
      </div>

      {/* Row 2: 7, 8, 9, × */}
      <div className="flex">
        <Button onClick={() => onNumberInput(7)}>7</Button>
        <Button onClick={() => onNumberInput(8)}>8</Button>
        <Button onClick={() => onNumberInput(9)}>9</Button>
        <Button variant="operator" onClick={() => onOperation('×')}>×</Button>
      </div>

      {/* Row 3: 4, 5, 6, - */}
      <div className="flex">
        <Button onClick={() => onNumberInput(4)}>4</Button>
        <Button onClick={() => onNumberInput(5)}>5</Button>
        <Button onClick={() => onNumberInput(6)}>6</Button>
        <Button variant="operator" onClick={() => onOperation('-')}>−</Button>
      </div>

      {/* Row 4: 1, 2, 3, + */}
      <div className="flex">
        <Button onClick={() => onNumberInput(1)}>1</Button>
        <Button onClick={() => onNumberInput(2)}>2</Button>
        <Button onClick={() => onNumberInput(3)}>3</Button>
        <Button variant="operator" onClick={() => onOperation('+')}>+</Button>
      </div>

      {/* Row 5: 0, ./-, ⌫, = */}
      <div className="flex">
        <Button onClick={() => onNumberInput(0)}>0</Button>
        {isFraction ? (
          <Button onClick={onFractionDash}>-</Button>
        ) : (
          <Button onClick={onDecimal}>.</Button>
        )}
        <Button variant="modifier" onClick={onBackspace}>⌫</Button>
        <Button variant="operator" onClick={onEquals}>=</Button>
      </div>
    </div>
  );
}
