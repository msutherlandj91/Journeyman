export default function Drawer({ isOpen, onClose, side = 'left', title, children }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isOpen ? 'bg-black/60' : 'bg-transparent'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} h-full w-[85vw] max-w-xs bg-[#1a1a1a]/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ${
          isOpen
            ? 'translate-x-0'
            : isLeft
              ? '-translate-x-full'
              : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-white text-lg font-light">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}
