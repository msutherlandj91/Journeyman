/**
 * Unit Selector Component
 * Toggle between inches and feet
 */
export default function UnitSelector({ unit, onChange }) {
  const units = [
    { value: 'in', label: 'in' },
    { value: 'ft', label: 'ft' }
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      <label className="text-sm font-light text-gray-400">Unit:</label>
      <div className="flex gap-1">
        {units.map((u) => (
          <button
            key={u.value}
            onClick={() => onChange(u.value)}
            className={`px-5 py-2 text-sm rounded-full transition-all font-light ${
              unit === u.value
                ? 'bg-[#FF9F0A] text-white'
                : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
