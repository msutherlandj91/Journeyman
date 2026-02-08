# Woodworking Measurement Calculator - App Plan

## Project Overview

**Purpose**: A mobile-first measurement calculator for woodworking and construction that handles mixed numbers (e.g., 5-3/8") and decimals, with seamless conversion between formats.

**Target Users**: Woodworkers, carpenters, and construction professionals who work primarily in imperial measurements with fractional precision.

**Technical Term**: Mixed numbers (whole number + proper fraction)

---

## Core Features

### 1. Dual Input Methods (Toggleable)

#### Method A: Segmented Input (Default)
Three separate input fields for whole number, numerator, and denominator:
```
[5] [3] [8]  →  5-3/8"
 ↑   ↑   ↑
whole num denom
```

**Features**:
- Auto-focus between fields after entry
- Smart parsing: accepts "5 3 8", "5-3/8", or "5 3/8"
- Live preview below inputs showing formatted result
- Empty fields default to 0 for whole/numerator, 1 for denominator
- Validation to prevent invalid fractions (e.g., 0/0, 5/0)

#### Method B: Smart Denominator Presets
Single input field with quick-select denominator buttons:
```
┌─────────────────┐
│ 5 3 / ?         │  ← user types "5 3"
└─────────────────┘
┌─────────────────────────────────────┐
│ /16  /8  /4  /2  /32  /64  Custom   │  ← tap to set denominator
└─────────────────────────────────────┘
```

**Features**:
- Common denominators as one-tap buttons (16, 8, 4, 2, 32, 64)
- "Custom" option opens numeric input for unusual denominators
- Accepts decimal input directly (5.375 auto-converts)
- Smart parsing handles space-separated input

**Toggle**: Button to switch between Method A and Method B (persists user preference)

### 2. Decimal Input & Conversion
- Separate decimal input field OR smart detection in Method B
- Instant conversion to mixed number at selected precision
- Display both forms side-by-side for verification

### 3. Precision Selector
User-selectable precision levels:
- **1/16"** (default - standard tape measure)
- **1/32"** (fine woodworking)
- **1/64"** (precision work)

Affects decimal-to-fraction conversion rounding.

### 4. Calculator Mode
Chain arithmetic operations:
```
5-3/8" + 2-1/4" - 1/2" = 7-1/8"
```

**Operations**: Add, subtract, multiply, divide
**Display**: Running total + operation history
**Result**: Shown in both mixed number and decimal

### 5. Unit Conversion (Future Enhancement)
- Inches ↔ Feet ↔ Yards
- Keep fractional display in inches (e.g., "2 feet 3-1/2 inches")

---

## Technical Stack

### Frontend Framework
**React** (Create React App or Vite)
- Progressive Web App (PWA) for mobile + desktop
- Single codebase, no app store dependencies
- Offline-capable via service workers

### Core Library
**Fraction.js**
- Handles mixed number arithmetic with arbitrary precision
- Eliminates floating-point errors
- Native support for mixed number notation: `new Fraction("5 3/8")`
- All operations: add, subtract, multiply, divide, simplify

### UI Framework
**Tailwind CSS** (mobile-first utility classes)
- Responsive design out of the box
- Fast prototyping
- Small bundle size

### State Management
**React Context** or **useState** (simple app, no Redux needed)

### Storage
**localStorage** for user preferences:
- Input method preference (A or B)
- Precision level (16, 32, 64)
- Calculation history

---

## UI/UX Design Considerations

### Mobile-First Layout
1. **Large touch targets** (min 44x44px) for input fields and buttons
2. **Numeric keyboard** triggers automatically on mobile
3. **Clear visual hierarchy**: Input → Result → History
4. **Swipe gestures** for switching input methods (optional)

### Accessibility
- ARIA labels for screen readers
- High contrast mode support
- Keyboard navigation for desktop users
- Clear error messages for invalid inputs

### Color Scheme
- Clean, minimal design (workshop-tool aesthetic)
- High contrast for outdoor/bright workshop use
- Consider dark mode for indoor work

---

## Implementation Phases

### Phase 1: MVP (Core Functionality)
- [x] Project setup (React + Vite + Fraction.js)
- [ ] Method A: Segmented input (3 fields)
- [ ] Fraction.js integration for calculations
- [ ] Display result as mixed number
- [ ] Basic addition/subtraction calculator
- [ ] Decimal input with conversion
- [ ] Precision selector (16, 32, 64)

### Phase 2: Enhanced Input
- [ ] Method B: Smart denominator presets
- [ ] Toggle between Method A and B
- [ ] localStorage for user preferences
- [ ] Input validation and error handling

### Phase 3: Calculator Features
- [ ] Full arithmetic operations (×, ÷)
- [ ] Operation history display
- [ ] Clear/reset functionality
- [ ] Dual display (fraction + decimal)

### Phase 4: Polish & PWA
- [ ] Responsive design refinement
- [ ] PWA setup (manifest, service worker)
- [ ] Offline support
- [ ] Install prompt for mobile
- [ ] Performance optimization

### Phase 5: Future Enhancements
- [ ] Unit conversion (in/ft/yd)
- [ ] Calculation history persistence
- [ ] Export measurements
- [ ] Material calculator (board feet, etc.)

---

## File Structure

```
woodworking-calc/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── components/
│   │   ├── InputMethodA.jsx   # Segmented input
│   │   ├── InputMethodB.jsx   # Smart denominator presets
│   │   ├── Calculator.jsx     # Main calculator logic
│   │   ├── ResultDisplay.jsx  # Show mixed number + decimal
│   │   ├── PrecisionSelector.jsx
│   │   ├── HistoryPanel.jsx   # Operation history
│   │   └── ToggleSwitch.jsx   # Method A/B toggle
│   ├── utils/
│   │   ├── fractionUtils.js   # Fraction.js wrappers
│   │   ├── conversion.js      # Decimal ↔ mixed number
│   │   └── validation.js      # Input validation
│   ├── hooks/
│   │   └── useLocalStorage.js # Persist preferences
│   ├── App.jsx                # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind imports
├── package.json
└── vite.config.js
```

---

## Key Decisions & Rationale

1. **React over React Native**: PWA gives us mobile + desktop without app store friction, and the UI is simple enough that native performance isn't critical.

2. **Fraction.js**: Purpose-built for exact fraction arithmetic. Prevents floating-point errors that would be unacceptable in measurement work.

3. **Method A as default**: Woodworkers are fraction-literate and will appreciate the speed. Method B available for users who prefer it.

4. **localStorage over database**: Simple preference storage, no backend needed. Keeps app lightweight and private.

5. **Tailwind CSS**: Mobile-first utilities make responsive design trivial. Small bundle size matters for mobile.

---

## Success Criteria

- [ ] Accurate fraction arithmetic (no floating-point errors)
- [ ] Sub-second response time for calculations
- [ ] Works offline as PWA
- [ ] Usable with one hand on mobile
- [ ] Input method toggle persists across sessions
- [ ] Matches tape measure precision expectations (1/16" default)

---

## Open Questions

1. Should we support metric conversion (mm/cm/m) or stay imperial-only?
2. Do users want to save/name specific calculations (e.g., "table leg height")?
3. Should we include a tape measure visual reference?
4. Any specific branding/naming preferences for the app?

---

## Next Steps

1. Initialize React + Vite project
2. Install Fraction.js: `npm install fraction.js`
3. Set up Tailwind CSS
4. Build Method A (segmented input) first
5. Integrate Fraction.js for basic add/subtract
6. Test on mobile device early and often
