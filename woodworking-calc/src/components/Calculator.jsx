/**
 * Calculator Component - iOS Calculator style
 * Circular buttons with dark gray for numbers, orange for operations
 */
export default function Calculator({
  onNumberInput,
  onDecimal,
  onOperation,
  onEquals,
  onClear,
  onToggleSign,
  onPercent,
  currentOperation
}) {
  // Button component for consistent styling
  const Button = ({ children, onClick, variant = 'number', size = 'normal' }) => {
    const baseClasses = "flex items-center justify-center text-3xl font-light transition-all active:scale-95";

    const variantClasses = {
      number: "bg-[#333333] text-white hover:bg-[#404040]",
      operation: currentOperation === children
        ? "bg-white text-[#FF9F0A]"
        : "bg-[#FF9F0A] text-white hover:bg-[#FFB340]",
      utility: "bg-[#A5A5A5] text-black hover:bg-[#B5B5B5]"
    };

    const sizeClasses = {
      normal: "w-20 h-20 rounded-full",
      wide: "w-[168px] h-20 rounded-full" // For double-wide buttons if needed
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Utilities and division */}
      <div className="flex gap-3 justify-center">
        <Button variant="utility" onClick={onClear}>AC</Button>
        <Button variant="utility" onClick={onToggleSign}>+/−</Button>
        <Button variant="utility" onClick={onPercent}>%</Button>
        <Button variant="operation" onClick={() => onOperation('÷')}>÷</Button>
      </div>

      {/* Row 2: 7, 8, 9, Multiply */}
      <div className="flex gap-3 justify-center">
        <Button variant="number" onClick={() => onNumberInput(7)}>7</Button>
        <Button variant="number" onClick={() => onNumberInput(8)}>8</Button>
        <Button variant="number" onClick={() => onNumberInput(9)}>9</Button>
        <Button variant="operation" onClick={() => onOperation('×')}>×</Button>
      </div>

      {/* Row 3: 4, 5, 6, Subtract */}
      <div className="flex gap-3 justify-center">
        <Button variant="number" onClick={() => onNumberInput(4)}>4</Button>
        <Button variant="number" onClick={() => onNumberInput(5)}>5</Button>
        <Button variant="number" onClick={() => onNumberInput(6)}>6</Button>
        <Button variant="operation" onClick={() => onOperation('-')}>−</Button>
      </div>

      {/* Row 4: 1, 2, 3, Add */}
      <div className="flex gap-3 justify-center">
        <Button variant="number" onClick={() => onNumberInput(1)}>1</Button>
        <Button variant="number" onClick={() => onNumberInput(2)}>2</Button>
        <Button variant="number" onClick={() => onNumberInput(3)}>3</Button>
        <Button variant="operation" onClick={() => onOperation('+')}>+</Button>
      </div>

      {/* Row 5: 0, decimal, Equals */}
      <div className="flex gap-3 justify-center">
        <Button variant="number" size="wide" onClick={() => onNumberInput(0)}>0</Button>
        <Button variant="number" onClick={onDecimal}>.</Button>
        <Button variant="operation" onClick={onEquals}>=</Button>
      </div>
    </div>
  );
}
