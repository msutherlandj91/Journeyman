import { useRef, useState, useCallback } from 'react';

export default function ModeToggle({ mode, onModeChange }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(null);
  const startXRef = useRef(0);
  const startModeRef = useRef(mode);

  const getMaxOffset = () => {
    if (!containerRef.current) return 0;
    const containerW = containerRef.current.offsetWidth;
    const padding = 4; // p-1
    const indicatorW = (containerW - padding * 2) / 2;
    return indicatorW;
  };

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startModeRef.current = mode;
    setDragging(true);
    setDragX(null);
  }, [mode]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const delta = touch.clientX - startXRef.current;
    const maxOffset = getMaxOffset();
    const baseOffset = startModeRef.current === 'fraction' ? maxOffset : 0;
    const clamped = Math.max(0, Math.min(maxOffset, baseOffset + delta));
    setDragX(clamped);
  }, [dragging]);

  const handleTouchEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (dragX !== null) {
      const maxOffset = getMaxOffset();
      const newMode = dragX > maxOffset / 2 ? 'fraction' : 'decimal';
      if (newMode !== mode) onModeChange(newMode);
    }
    setDragX(null);
  }, [dragging, dragX, mode, onModeChange]);

  const getTransform = () => {
    if (dragging && dragX !== null) {
      return `translateX(${dragX}px)`;
    }
    return mode === 'fraction' ? 'translateX(100%)' : 'translateX(0)';
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-[rgba(0,0,0,0.64)] rounded-[20px] flex p-1 relative touch-none"
      style={{ fontFamily: 'Inter, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding indicator */}
      <div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[rgba(86,226,172,0.16)] rounded-[16px] ${
          dragging ? '' : 'transition-transform duration-[240ms] ease-[cubic-bezier(0.25,0,0.2,1)]'
        }`}
        style={{ transform: getTransform() }}
      />

      <button
        onClick={() => onModeChange('decimal')}
        className={`flex-1 py-3 rounded-[16px] text-base relative z-10 ${
          mode === 'decimal' ? 'text-white/80' : 'text-white/40'
        }`}
      >
        Decimal
      </button>
      <button
        onClick={() => onModeChange('fraction')}
        className={`flex-1 py-3 rounded-[16px] text-base relative z-10 ${
          mode === 'fraction' ? 'text-white/80' : 'text-white/40'
        }`}
      >
        Fraction
      </button>
    </div>
  );
}
