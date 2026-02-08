# Journeyman Project Retrospective

## 1. Wins, Losses, Misses, and Opportunities

### Wins
- **Core app works well.** The calculator handles mixed-number fraction arithmetic correctly, which is genuinely useful for woodworking. The Fraction.js library was the right choice for exact arithmetic.
- **iOS-style UI looks good.** The dark theme with orange accents, circular buttons, and clean layout is polished and mobile-friendly.
- **Feature velocity was high.** We went from zero to a functional calculator with dual units, metric conversion, keyboard support, fraction input, and persistent history relatively quickly.
- **GitHub Pages deployment pipeline works.** Automated CI/CD with GitHub Actions is solid infrastructure.
- **Supabase migration was clean.** Once we committed to it, the migration was fast and the result is simpler, smaller, and more reliable than the Firebase approach.

### Losses
- **~6 hours lost on Firebase.** We spent the majority of our time trying to make Firebase work with Vite. This was the single biggest time sink in the project, and the end result was ripping it out entirely.
- **Multiple failed deployments pushed to production.** Users (if there were any) would have seen broken builds repeatedly. We treated production as a testing environment.
- **Bundle size still large.** At 392KB, the app is heavier than it needs to be for a calculator. Supabase SDK accounts for most of this.

### Misses
- **The `saveToCloud` TDZ bug in our own code was there the entire time.** I identified it early but never actually verified the fix persisted across subsequent edits. It was the cause of at least some of the "Firebase" errors we were debugging. The error `Cannot access 'Ff' before initialization` from the CDN build (where Firebase wasn't even in the bundle) was almost certainly this bug, not Firebase.
- **I didn't test in a real browser.** I kept checking bundle contents with Node scripts and `grep`, but the error was a runtime JavaScript error. I should have served the build locally and opened it in a browser (or used a headless browser) to reproduce the actual error.
- **The `user.uid` vs `user.id` difference was predictable.** This is a well-known API difference between Firebase and Supabase. I should have caught it during the migration instead of after you tested it.
- **OAuth redirect URL was also predictable.** Any app hosted on a subpath (`/Journeyman/`) needs explicit redirect configuration. I should have set up `redirectTo` from the start.

### Opportunities
- **Method B (smart denominator presets) was never built.** This was in the original plan — a toggle between segmented input and quick-tap denominator buttons (1/8, 1/16, 1/32, etc.). This would be genuinely useful for the target audience.
- **PWA support is missing.** A service worker would allow offline use, which is critical for a construction-site tool where connectivity is unreliable.
- **No tests exist.** The fraction math utilities are perfect candidates for unit tests. The BigInt bug would have been caught immediately with a test like `expect(formatMixedNumber(parseFraction(3.01111))).not.toContain('0/1')`.
- **Cloud history isn't surfaced in the UI.** We have `cloudHistory` state but the HistoryPanel only shows local history. The two aren't merged.

---

## 2. Where You Could Have Prompted Better

**You actually prompted well in several key areas:**
- You gave clear UI expectations ("use the iOS calculator as inspiration")
- You pushed back when things weren't working ("I'M STILL SEEING IT" for the 0/1 bug)
- You asked me to stop and think ("Instead of beginning right into a fix, do some research online")

**Where prompts could have been sharper:**

1. **"Add a firebase integration"** — This was broad. A more specific prompt like "Add cloud persistence for calculation history. What backend options work well with Vite + React on GitHub Pages?" would have let me evaluate options before committing to Firebase, potentially avoiding the entire ordeal.

2. **Earlier during the Firebase debugging**, you could have said: "Stop. List every possible cause of this error, rank them by likelihood, and tell me how you'd test each one." This would have forced me to consider that the error might be in our own code (the `saveToCloud` TDZ) rather than assuming it was always Firebase.

3. **When providing error screenshots**, including the full console output (not just the error message) earlier would have helped. The screenshot you provided at the end showing `App.jsx:179:89` pointed directly to the line number, which made the `saveToCloud` fix trivial. The earlier screenshots showed minified stack traces that were harder to trace.

4. **"It feels like we're going in circles here"** — This was the most effective prompt in the entire session. It broke me out of a pattern of incremental fixes and forced a fundamentally different approach. You could have said this sooner.

---

## 3. Where I Could Have Guided You Better

1. **I should have warned about Firebase + Vite before starting.** This is a well-known incompatibility. When you said "add a firebase integration," I should have said: "Firebase has known bundling issues with Vite. Supabase, Pocketbase, or even a simple REST API would be more reliable. Here are the tradeoffs — which would you prefer?" Instead, I dove straight into Firebase implementation.

2. **I should have asked you to test locally before pushing to production.** Every Firebase "fix" was pushed to GitHub Pages and you tested on the live site. I should have said: "Run `npm run build && npx vite preview` and open http://localhost:4173/Journeyman/ to test before we push."

3. **I should have diagnosed the `saveToCloud` bug properly the first time.** I identified it, claimed to fix it, but then the fix was lost or incomplete in subsequent edits. I should have verified it was still fixed after each change.

4. **I should have explained the TDZ concept earlier.** Instead of repeatedly saying "circular dependency," I should have explained: "This error means a variable declared with `const` is being used before JavaScript reaches its declaration. This can happen in our code OR in library code. Let me check both." This would have set better expectations.

5. **I should have proposed the Supabase migration much sooner.** After the second Firebase fix failed, I should have said: "Firebase has a fundamental incompatibility with Vite's production bundler. We have three options: [A, B, C]. I recommend switching backends." Instead, I kept trying variations of the same approach through 5+ failed attempts.

---

## 4. Why We Were Going in Circles with Firebase

The core problem was a **misdiagnosis that compounded over time.**

**The actual situation was two bugs overlapping:**

1. **Firebase's internal circular dependencies** — Firebase SDK v9+ has circular module references between `@firebase/app`, `@firebase/auth`, and `@firebase/firestore`. When Rollup (Vite's production bundler) flattens these into a single scope, it uses `const` declarations and sometimes orders them incorrectly, creating TDZ violations. This is a real, documented issue.

2. **Our own `saveToCloud` TDZ bug** — `handleEquals` referenced `saveToCloud` in its `useCallback` dependency array before `saveToCloud` was declared. This is a straightforward JavaScript bug that would cause a TDZ error regardless of Firebase.

**Why we couldn't distinguish them:**

- Both errors produce the exact same message: `ReferenceError: Cannot access 'X' before initialization`
- In minified production builds, the variable name is mangled (`ge`, `Qt`, `Ql`, `Ff`, `Pf`, `Zg`), hiding whether it's a Firebase variable or `saveToCloud`
- I kept assuming every error was Firebase-related because that's what we'd been debugging
- I never built unminified AND tested in a browser to see the real variable name until very late
- When I did build unminified, I analyzed the bundle with scripts rather than actually running it

**The circular pattern was:**

```
1. Try a Firebase bundling fix
2. Build succeeds (no compile errors)
3. Push to production
4. User reports TDZ error
5. Assume it's still Firebase
6. Go to step 1
```

**What would have broken the cycle:**

- Building unminified AND running in a browser on attempt #2 (would have shown `saveToCloud` as the variable name)
- Removing Firebase entirely and testing if the app loads (would have proven whether Firebase was the sole cause)
- Fixing the `saveToCloud` ordering AND a Firebase fix simultaneously, then testing

---

## 5. Single Prompt That Could Have Reached This Endpoint

> I want to build a mobile-first woodworking measurement calculator as a React + Vite app deployed to GitHub Pages. Here's what it needs:
>
> **Core functionality:**
> - iOS calculator-style UI (dark theme, circular buttons, orange accent for operations)
> - Enter decimals and see results as mixed-number fractions (e.g., 5-3/8")
> - Standard woodworking denominators only: 2, 4, 8, 16, 32, 64
> - Show nearest standard fraction approximation in amber when result has non-standard denominator
> - Support inches and feet with mixed-unit arithmetic (e.g., 5ft + 3in)
> - Metric conversion toggle (cm/m)
> - Keyboard input support for desktop
>
> **Input methods:**
> - Default: segmented fraction input (whole / numerator / denominator fields)
> - Toggle: smart denominator preset buttons
>
> **Persistence:**
> - Local calculation history with localStorage
> - Cloud sync via Supabase (NOT Firebase — it has bundling issues with Vite)
> - Google and GitHub OAuth sign-in
>
> **Tech stack:**
> - React 19 + Vite 5
> - Tailwind CSS v4
> - Fraction.js for exact arithmetic
> - Supabase for auth and database
> - GitHub Actions for deployment to GitHub Pages (repo name: Journeyman, so base path is /Journeyman/)
>
> **Important implementation notes:**
> - Fraction.js returns BigInt for `.n` and `.d` — always wrap in `Number()`
> - Tailwind v4 uses `@import "tailwindcss"` and `@tailwindcss/postcss`
> - Vite base path must be `/Journeyman/` for GitHub Pages
> - Supabase user objects use `user.id` not `user.uid`
> - OAuth redirectTo must include the full path: `window.location.origin + window.location.pathname`
> - Never reference a `useCallback` variable in a dependency array before its declaration
>
> Build the complete app, create the Supabase schema SQL, a setup guide for configuring OAuth providers, and the GitHub Actions workflow. Provide a `.env.example` for the Supabase credentials.

---

## 6. How the App Actually Functions

### Architecture

```
User → GitHub Pages (static hosting)
         ↓
    React SPA (single index.html + JS bundle)
         ↓
    Supabase (auth + PostgreSQL database)
```

### Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI framework |
| React DOM | 19.2.0 | DOM rendering |
| Vite | 5.4.21 | Build tool and dev server |
| @vitejs/plugin-react | 4.7.0 | React JSX transform for Vite |
| Fraction.js | 5.3.4 | Exact fraction arithmetic (avoids floating-point errors) |
| @supabase/supabase-js | 2.95.3 | Supabase client (auth + database) |
| Tailwind CSS | 4.1.18 | Utility-first CSS framework |
| @tailwindcss/postcss | 4.1.18 | Tailwind PostCSS integration for v4 |
| autoprefixer | 10.4.24 | CSS vendor prefix automation |

### File Structure

```
woodworking-calc/
├── index.html                    # Entry point
├── vite.config.js               # Vite config (base: /Journeyman/)
├── postcss.config.js            # Tailwind v4 PostCSS setup
├── supabase-schema.sql          # Database schema for Supabase
├── src/
│   ├── main.jsx                 # React entry + ErrorBoundary
│   ├── App.jsx                  # Main app component (all calculator state)
│   ├── index.css                # Tailwind imports
│   ├── supabase.js              # Supabase client, auth, and DB functions
│   ├── contexts/
│   │   └── AuthContext.jsx      # React context for auth state
│   ├── components/
│   │   ├── Calculator.jsx       # iOS-style button grid
│   │   ├── ResultDisplay.jsx    # Main display (decimal, fraction, units, metric)
│   │   ├── InputMethodA.jsx     # Segmented fraction input (whole/num/den)
│   │   ├── PrecisionSelector.jsx # 1/16, 1/32, 1/64 selector
│   │   ├── UnitSelector.jsx     # Inches/feet toggle
│   │   ├── HistoryPanel.jsx     # Calculation history list
│   │   └── AuthPanel.jsx        # Sign-in/sign-out UI
│   ├── hooks/
│   │   └── useLocalStorage.js   # localStorage persistence hook
│   └── utils/
│       └── fractionUtils.js     # Fraction math engine (wraps Fraction.js)
```

### Data Flow

1. **Number entry:** User taps buttons → `handleNumberInput` builds display string → `displayValue` state updates → ResultDisplay renders
2. **Operations:** User taps +/-/×/÷ → current value converted to inches internally → stored in `storedInches` → operation saved
3. **Equals:** Previous value and current value computed via Fraction.js → result shown in display → entry added to local history → if signed in, saved to Supabase
4. **Display:** ResultDisplay parses the decimal value, converts to mixed number, checks if denominator is standard (power of 2), shows approximation in amber if not
5. **Units:** All math happens in inches internally. Feet values are converted to inches on input. Results show both inches and feet+inches when >= 12 inches.
6. **Auth:** Supabase OAuth opens popup → user authenticates → token returned in URL hash → Supabase client picks up token → AuthContext provides user to all components

### Database Schema

```sql
calculations (
  id          UUID PRIMARY KEY,
  user_id     UUID → auth.users(id),
  expression  TEXT,           -- e.g., "5\" + 3\""
  result_inches NUMERIC,     -- result in inches
  result_decimal TEXT,        -- decimal string
  result_fraction TEXT,       -- formatted fraction string
  timestamp   BIGINT,        -- Date.now()
  created_at  TIMESTAMPTZ
)
```

Row Level Security ensures users can only read/write their own rows.

---

## 7. Optimization, Simplification, and Reliability Improvements

### High Priority

1. **Merge local and cloud history.** Currently `history` (localStorage) and `cloudHistory` (Supabase) are separate state arrays, and the UI only shows local history. They should be merged into a single source of truth — use Supabase when signed in, localStorage when not.

2. **Add error handling for Supabase connection failures.** If Supabase is unreachable (free tier paused, network down), the app should gracefully fall back to localStorage-only mode instead of throwing errors.

3. **Fix the `esbuild` dev dependency.** It's still in `package.json` from the Firebase prebundling attempt but is no longer used. Remove it.

4. **Remove unused `cloudHistory` state if not displayed.** It's being fetched but never rendered in the UI. Either wire it up or remove the dead code.

5. **The `user.displayName` and `user.photoURL` properties in AuthPanel.jsx may not exist on Supabase user objects.** Supabase stores these under `user.user_metadata.full_name` and `user.user_metadata.avatar_url`. The sign-in panel likely shows a blank name after authenticating.

### Medium Priority

6. **Add unit tests for `fractionUtils.js`.** This is the mathematical core of the app. Test cases should cover: standard fractions, non-standard fractions, BigInt handling, zero values, negative values, and the rounding/approximation logic.

7. **Lazy-load Supabase.** The Supabase SDK is ~170KB of the 392KB bundle. Since most users won't sign in immediately, it could be dynamically imported only when the auth panel is interacted with.

8. **Implement the Method B input (denominator presets).** This was in the original plan and would be genuinely useful — quick-tap buttons for 1/8, 1/16, 1/32, etc.

9. **Add PWA support.** A service worker + manifest would allow offline use and "Add to Home Screen" on mobile. Critical for a construction-site tool.

10. **The `handleEquals` dependency array includes `precision` but `precision` isn't used inside the callback.** It's used indirectly via `formatResult`, but `formatResult` isn't wrapped in `useCallback`. This means `handleEquals` recreates on every precision change unnecessarily. Either memoize `formatResult` or remove `precision` from the deps.

### Low Priority

11. **Remove the `vite.svg` favicon reference** in `index.html` and replace with a custom icon.

12. **The `handleOperation` function recreates on every render** because `expressionParts` is in its dependency array and it spreads `expressionParts` into a new array. Consider using a ref for expression tracking instead.

13. **Consider replacing Vite 5 with Vite 6 or 7.** We downgraded from Vite 7 to 5 during the Firebase debugging. Now that Firebase is gone, there's no reason to stay on v5. However, test thoroughly before upgrading.

14. **The app title is still "woodworking-calc"** in `index.html`. Should be "Journeyman" or "Journeyman Calculator."

15. **Add `<meta>` tags** for description, theme-color (for mobile browser chrome), and Open Graph tags for link previews.

---

*This retrospective reflects an honest assessment. The Firebase detour was the project's biggest lesson: when a library has a fundamental incompatibility with your build tool, switch libraries early rather than working around the symptoms repeatedly.*
