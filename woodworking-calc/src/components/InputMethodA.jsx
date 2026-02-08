import { useRef, useEffect } from 'react';

/**
 * Method A: Segmented Input - iOS Calculator style
 * Three separate fields for whole, numerator, denominator
 */
export default function InputMethodA({ value, onChange, onSubmit }) {
  const wholeRef = useRef(null);
  const numeratorRef = useRef(null);
  const denominatorRef = useRef(null);

  const handleInputChange = (field, newValue) => {
    // Parse as integer, default to 0 for whole/numerator, 1 for denominator
    const parsed = parseInt(newValue) || (field === 'denominator' ? 1 : 0);

    const updated = {
      ...value,
      [field]: parsed
    };

    onChange(updated);
  };

  const handleKeyDown = (e, currentField) => {
    // Auto-advance on Enter or Tab
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();

      if (currentField === 'whole') {
        numeratorRef.current?.focus();
      } else if (currentField === 'numerator') {
        denominatorRef.current?.focus();
      } else if (currentField === 'denominator') {
        // Submit on Enter from last field
        if (e.key === 'Enter' && onSubmit) {
          onSubmit();
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 justify-center">
        {/* Whole number */}
        <div className="flex-1 max-w-[80px]">
          <label className="block text-xs text-gray-400 mb-2 text-center">Whole</label>
          <input
            ref={wholeRef}
            type="number"
            inputMode="numeric"
            value={value.whole || ''}
            onChange={(e) => handleInputChange('whole', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'whole')}
            className="w-full px-3 py-3 text-xl bg-[#505050] text-white rounded-full text-center focus:bg-[#606060] focus:outline-none font-light"
            placeholder="0"
          />
        </div>

        {/* Numerator */}
        <div className="flex-1 max-w-[80px]">
          <label className="block text-xs text-gray-400 mb-2 text-center">Num</label>
          <input
            ref={numeratorRef}
            type="number"
            inputMode="numeric"
            value={value.numerator || ''}
            onChange={(e) => handleInputChange('numerator', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'numerator')}
            className="w-full px-3 py-3 text-xl bg-[#505050] text-white rounded-full text-center focus:bg-[#606060] focus:outline-none font-light"
            placeholder="0"
          />
        </div>

        <div className="text-3xl text-gray-500 mt-6 font-light">/</div>

        {/* Denominator */}
        <div className="flex-1 max-w-[80px]">
          <label className="block text-xs text-gray-400 mb-2 text-center">Den</label>
          <input
            ref={denominatorRef}
            type="number"
            inputMode="numeric"
            value={value.denominator || ''}
            onChange={(e) => handleInputChange('denominator', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'denominator')}
            className="w-full px-3 py-3 text-xl bg-[#505050] text-white rounded-full text-center focus:bg-[#606060] focus:outline-none font-light"
            placeholder="1"
          />
        </div>
      </div>
    </div>
  );
}
