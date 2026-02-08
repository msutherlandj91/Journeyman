/**
 * Precision Selector Component - Compact iOS style
 */
export default function PrecisionSelector({ precision, onChange }) {
  const options = [
    { value: 16, label: '16' },
    { value: 32, label: '32' },
    { value: 64, label: '64' }
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-light text-gray-400 whitespace-nowrap">1/</label>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-xs rounded-full transition-all font-light ${
              precision === option.value
                ? 'bg-[#FF9F0A] text-white'
                : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
