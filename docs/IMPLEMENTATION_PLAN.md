# Qraft — Implementation Plan

This document is the step-by-step implementation roadmap for Qraft V1. Each phase has clear objectives, files involved, dependencies, acceptance criteria, and potential pitfalls.

---

## Phase 1 — Project Setup

### Objectives
- Initialize Vite + React + TypeScript project
- Configure development tooling
- Establish project structure

### Steps
1. Initialize Vite project: `pnpm create vite . --template react-ts`
2. Install production dependencies: `react-router`, `zustand`, `zundo`, `qr-code-styling`, `idb-keyval`, `zod`, `lucide-react`
3. Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `playwright`, `eslint`, `prettier`
4. Configure TypeScript (`tsconfig.json`) with strict mode, path aliases
5. Configure Vite (`vite.config.ts`) with path aliases
6. Configure ESLint and Prettier
7. Create directory structure per [ARCHITECTURE.md](./ARCHITECTURE.md)
8. Set up Git: `git init`, create `.gitignore`, initial commit
9. Add Google Fonts (Inter, JetBrains Mono) via `<link>` in `index.html`

### Files Created
```
vite.config.ts, tsconfig.json, .eslintrc.cjs, .prettierrc
package.json, pnpm-lock.yaml, .gitignore
index.html
src/main.tsx, src/App.tsx, src/vite-env.d.ts
src/domain/, src/features/, src/components/, src/stores/
src/hooks/, src/lib/, src/styles/, src/utils/
```

### Dependencies
- None (first phase)

### Acceptance Criteria
- `pnpm dev` starts dev server successfully
- `pnpm build` produces valid production build
- `pnpm tsc --noEmit` passes with no errors
- Directory structure matches architecture doc
- All dependencies installed and importable

### Pitfalls
- Path aliases must be configured in BOTH `tsconfig.json` and `vite.config.ts`
- Vite React plugin must be `@vitejs/plugin-react` (not -swc for maximum compatibility)

---

## Phase 2 — Design System & Global Styles

### Objectives
- Implement CSS custom properties (design tokens)
- Create global styles (reset, typography)
- Implement theme system (light/dark)
- Build foundational UI components

### Steps
1. Create `src/styles/variables.css` with all CSS custom properties from [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
2. Create `src/styles/global.css` with reset, typography, base styles
3. Create `src/styles/animations.css` with shared keyframes
4. Implement theme system: `data-theme` on `<html>`, media query detection
5. Create `src/stores/themeStore.ts` with localStorage persistence
6. Build foundational components:
   - `Button` (primary, secondary, ghost, icon variants)
   - `Input` (text, textarea, number)
   - `Select`
   - `Toggle`
   - `Slider` (range input)
   - `Card`
   - `Badge`
   - `Tooltip`
   - `Dialog` (using `<dialog>` element)
   - `Toast` (notification system)
7. Create `src/components/Layout/Header.tsx`
8. Create `src/components/ThemeToggle/ThemeToggle.tsx`

### Files Created
```
src/styles/variables.css, global.css, animations.css
src/stores/themeStore.ts
src/components/Button/, Input/, Select/, Toggle/, Slider/
src/components/Card/, Badge/, Tooltip/, Dialog/, Toast/
src/components/Layout/Header.tsx
src/components/ThemeToggle/
```

### Dependencies
- Phase 1 complete

### Acceptance Criteria
- Both light and dark themes render correctly
- Theme persists across page reload
- System preference detected on first visit
- All components render with correct styles in both themes
- Components are accessible (keyboard, focus states, ARIA)
- `prefers-reduced-motion` respected

### Pitfalls
- Must set `data-theme` attribute BEFORE React hydration to prevent flash
- Color picker components may need custom implementation over native `<input type="color">`

---

## Phase 3 — QR Domain Model

### Objectives
- Implement all TypeScript types from [DATA_MODEL.md](./DATA_MODEL.md)
- Define constants and defaults
- This is the foundation everything else builds on

### Steps
1. Create `src/domain/types.ts` — all interfaces and types
2. Create `src/domain/constants.ts` — defaults, limits, enums
3. Write unit tests for type guards and default factories

### Files Created
```
src/domain/types.ts
src/domain/constants.ts
src/domain/__tests__/types.test.ts
```

### Dependencies
- Phase 1 complete (just TypeScript setup)

### Acceptance Criteria
- All types compile with strict TypeScript
- Default config factory produces valid QRConfig
- Type discriminants work correctly (QRContent union)
- Constants match specification values

### Pitfalls
- Gradient rotation is in **radians** for qr-code-styling but users think in degrees — conversion needed in UI layer
- QRLogo.src must be data URL for persistence, but blob URL during session — handle conversion

---

## Phase 4 — QR Payload Encoders

### Objectives
- Implement encoder for each content type
- Handle special character escaping
- Follow standards from [QR_ENCODING.md](./QR_ENCODING.md)

### Steps
1. Create `src/domain/encoders/url.ts`
2. Create `src/domain/encoders/text.ts`
3. Create `src/domain/encoders/email.ts`
4. Create `src/domain/encoders/phone.ts`
5. Create `src/domain/encoders/wifi.ts`
6. Create `src/domain/encoders/index.ts` — dispatcher
7. Write comprehensive unit tests for each encoder

### Files Created
```
src/domain/encoders/*.ts
src/domain/encoders/__tests__/*.test.ts
```

### Dependencies
- Phase 3 (types)

### Acceptance Criteria
- URL encoder ensures protocol prefix
- Email encoder produces valid mailto: URI with percent-encoding
- Phone encoder produces tel: URI in E.164 format
- Wi-Fi encoder escapes special characters (`;:,\"`) correctly
- Wi-Fi encoder ends with `;;`
- Text encoder passes through content as-is
- All edge cases from QR_ENCODING.md covered by tests

### Pitfalls
- Wi-Fi special character escaping is the most error-prone area — test thoroughly
- Email body newlines must be `%0D%0A` not `%0A`
- Phone numbers: strip formatting characters before encoding

---

## Phase 5 — Input Validation

### Objectives
- Implement Zod validation schemas per content type
- Create validation result system
- Follow rules from [VALIDATION.md](./VALIDATION.md)

### Steps
1. Create Zod schemas in `src/domain/validators/` for each type
2. Create `src/domain/validators/index.ts` — dispatcher
3. Implement warning-level validation (not just errors)
4. Write unit tests

### Files Created
```
src/domain/validators/*.ts
src/domain/validators/__tests__/*.test.ts
```

### Dependencies
- Phase 3 (types)

### Acceptance Criteria
- URL validation uses `URL()` constructor (not regex)
- Email validation accepts plus addressing and subdomains
- Phone validation accepts international formats
- Wi-Fi validation enforces WPA password length (8-63)
- Warnings for long content (>500 chars URL, >1000 chars text)
- All validators return `QRValidationResult` with severity levels

### Pitfalls
- Don't be overly restrictive — legitimate URLs/emails should not be rejected
- `javascript:` URLs should be rejected (security)

---

## Phase 6 — QR Generation Engine

### Objectives
- Wrap qr-code-styling in React-friendly hooks
- Implement real-time preview generation
- Implement logo plate pre-composition

### Steps
1. Create `src/lib/qrCodeStyling.ts` — factory and config mapping
2. Create `src/lib/logoProcessor.ts` — logo resize, plate composition
3. Create `src/features/generator/hooks/useQRCode.ts` — main QR hook
4. Create `src/features/generator/hooks/useDebounce.ts`
5. Create `src/features/generator/components/QRPreview.tsx`
6. Map QRStyle to qr-code-styling options

### Files Created
```
src/lib/qrCodeStyling.ts
src/lib/logoProcessor.ts
src/features/generator/hooks/useQRCode.ts, useDebounce.ts
src/features/generator/components/QRPreview.tsx, QRPreview.module.css
```

### Dependencies
- Phase 3 (types), Phase 4 (encoders)

### Acceptance Criteria
- QR code renders in browser from valid QRConfig
- Preview updates within 300ms of config change (debounced)
- All dot shapes render correctly (6 types)
- Corner square and dot styles render correctly
- Colors and gradients apply correctly
- Logo embeds with excavation
- Logo plate pre-composition works (circle, rounded-square, square)
- Empty state shown when no content
- Error state handles generation failures gracefully

### Pitfalls
- qr-code-styling uses `append()` to mount to DOM — manage with useRef
- `update()` can update in place but may need `recreate` for some property changes
- Logo must be data URL or accessible URL (CORS issues with external URLs)
- Gradient rotation is radians, not degrees

---

## Phase 7 — Content Forms & Input Panel

### Objectives
- Build input forms for each content type
- Integrate validation with real-time feedback
- Build content type selector

### Steps
1. Create `src/features/generator/components/ContentTypeSelector.tsx`
2. Create content forms:
   - `URLForm.tsx`
   - `TextForm.tsx`
   - `EmailForm.tsx`
   - `PhoneForm.tsx`
   - `WiFiForm.tsx`
3. Create `src/stores/qrStore.ts` — main QR configuration store
4. Wire forms to store with validation
5. Implement "touched" field tracking for error display

### Files Created
```
src/features/generator/components/ContentTypeSelector.tsx
src/features/generator/components/ContentForms/*.tsx
src/stores/qrStore.ts
```

### Dependencies
- Phase 2 (UI components), Phase 5 (validation), Phase 6 (preview)

### Acceptance Criteria
- All 5 content types have functional forms
- Tab switching between content types works smoothly
- Validation errors appear after field is touched
- QR preview updates as user types (debounced)
- Wi-Fi form shows/hides password field based on auth type

### Pitfalls
- Don't validate on every keystroke — debounce or validate on blur
- Content type switching should preserve previous input (user might switch back)

---

## Phase 8 — Customization Panel

### Objectives
- Build the full style customization UI
- Accordion sections for organized controls
- Integrate with QR store

### Steps
1. Create `src/features/generator/components/StylePanel/StylePanel.tsx`
2. Build sections:
   - `PatternSection.tsx` — dot shape picker (visual grid)
   - `EyeSection.tsx` — corner square + dot shapes and colors
   - `ColorSection.tsx` — dot color, background color pickers
   - `GradientSection.tsx` — gradient type, rotation, color stops
   - `SizeSection.tsx` — width, margin, error correction
   - `ErrorCorrectionSection.tsx` — segmented control with tooltips
   - `LogoSection.tsx` — upload, size, plate configuration
   - `FrameSection.tsx` — frame style, colors, CTA text
3. Create `ColorPicker` shared component (enhanced native input)
4. Create accordion/disclosure component for collapsible sections
5. Wire all controls to qrStore

### Files Created
```
src/features/generator/components/StylePanel/*.tsx
src/components/ColorPicker/
src/components/Accordion/
```

### Dependencies
- Phase 2 (UI components), Phase 6 (QR generation), Phase 7 (QR store)

### Acceptance Criteria
- All customization options from REQUIREMENTS.md are present
- Visual shape pickers work (pattern grid, eye grid)
- Color pickers update preview in real-time
- Gradient controls show/hide based on toggle
- Logo upload, resize, and plate work
- Frame style selection with CTA text input works
- Accordion sections expand/collapse smoothly
- Advanced sections (gradient, logo, frame) start collapsed

### Pitfalls
- Color picker debouncing is critical — dragging produces many events
- Gradient color stops need add/remove UI
- Logo upload must handle large files (resize before processing)
- Frame controls should be disabled when frame style is "none"

---

## Phase 9 — Frame & CTA Compositor

### Objectives
- Build the two-layer composition system
- Implement frame rendering (Canvas + SVG)
- Implement CTA text rendering

### Steps
1. Create `src/lib/compositor.ts` — Canvas and SVG composition functions
2. Create `src/lib/fontLoader.ts` — font loading utilities
3. Create `src/features/generator/hooks/useQRCompositor.ts`
4. Integrate compositor into QRPreview (show frame in preview)
5. Ensure preview matches export output

### Files Created
```
src/lib/compositor.ts
src/lib/fontLoader.ts
src/features/generator/hooks/useQRCompositor.ts
```

### Dependencies
- Phase 6 (QR generation), Phase 8 (frame/CTA controls)

### Acceptance Criteria
- Frames render around QR code with correct padding
- All frame styles work (simple, rounded, badge, banner, ticket)
- CTA text renders at correct position with correct font
- Frame preserves quiet zone
- Preview shows complete composite (QR + frame + CTA)
- Canvas and SVG outputs match visually

### Pitfalls
- MUST `await document.fonts.ready` before canvas text rendering
- SVG composition requires proper namespace handling
- Frame dimensions calculation must account for border width
- CTA text alignment requires manual calculation on canvas

---

## Phase 10 — Presets

### Objectives
- Implement preset system from [PRESETS.md](./PRESETS.md)
- Build preset selector UI
- Implement design randomizer

### Steps
1. Create `src/domain/presets/builtInPresets.ts` — all 16+ preset definitions
2. Create `src/domain/presets/index.ts` — preset application logic
3. Create `src/domain/randomizer/palettes.ts` — curated design palettes
4. Create `src/domain/randomizer/index.ts` — randomizer logic
5. Create `src/features/generator/components/PresetSelector.tsx`
6. Create `src/features/generator/components/RandomizeButton.tsx`

### Files Created
```
src/domain/presets/
src/domain/randomizer/
src/features/generator/components/PresetSelector.tsx
src/features/generator/components/RandomizeButton.tsx
```

### Dependencies
- Phase 3 (types), Phase 8 (customization panel)

### Acceptance Criteria
- All built-in presets are valid and render correctly
- Applying preset updates preview immediately
- User can modify values after applying preset
- Preset selector shows category tabs
- Active preset highlighted
- Randomizer produces visually coherent designs
- Randomized designs pass scan reliability checks (EC forced to H)
- "Shuffle" button generates a new design each click

### Pitfalls
- Preset `Partial<QRStyle>` merge must not overwrite user's logo
- Randomizer must not produce low-contrast combinations
- All curated palettes must be pre-validated

---

## Phase 11 — Scan Reliability Analysis

### Objectives
- Implement heuristic scan reliability system from [SCAN_RELIABILITY.md](./SCAN_RELIABILITY.md)
- Build reliability indicator UI

### Steps
1. Implement reliability checks in `src/domain/reliability/`:
   - `contrast.ts` — WCAG luminance contrast
   - `quietZone.ts` — margin analysis
   - `errorCorrection.ts` — EC level assessment
   - `logo.ts` — logo size + plate analysis
   - `moduleStyle.ts` — dot shape impact
   - `gradient.ts` — gradient contrast sampling
   - `frame.ts` — frame quiet zone check
   - `index.ts` — orchestrator, compound risk
2. Create `src/utils/color.ts` — color parsing, luminance calculation
3. Create `src/features/generator/components/ReliabilityIndicator.tsx`
4. Write unit tests for each check

### Files Created
```
src/domain/reliability/*.ts
src/domain/reliability/__tests__/*.test.ts
src/utils/color.ts
src/features/generator/components/ReliabilityIndicator.tsx
```

### Dependencies
- Phase 3 (types), Phase 6 (QR generation)

### Acceptance Criteria
- Contrast calculation is accurate (sRGB linearization)
- All checks from SCAN_RELIABILITY.md implemented
- Compound risk works (3+ warnings → danger)
- Indicator shows correct severity badge (good/warning/danger)
- Expandable detail view shows individual checks
- Recommendations are actionable
- Analysis updates in real-time with config changes

### Pitfalls
- sRGB linearization is NOT the same as simple division by 255
- Gradient contrast must sample multiple points along the gradient path
- Don't block UI thread with analysis — it's fast math but run after render

---

## Phase 12 — Undo/Redo

### Objectives
- Implement undo/redo for QR style changes
- Add keyboard shortcuts

### Steps
1. Add zundo middleware to `src/stores/qrStore.ts`
2. Configure: max 50 states, 500ms debounce for slider interactions
3. Create undo/redo buttons in header
4. Create `src/hooks/useKeyboardShortcut.ts`
5. Wire Ctrl+Z / Ctrl+Shift+Z

### Files Modified
```
src/stores/qrStore.ts (add zundo)
src/components/Layout/Header.tsx (add undo/redo buttons)
src/hooks/useKeyboardShortcut.ts (new)
```

### Dependencies
- Phase 7 (QR store exists)

### Acceptance Criteria
- Undo reverts last style change
- Redo re-applies undone change
- Slider drags are grouped into single undo step (debounced)
- Keyboard shortcuts work
- Buttons disabled when no history in that direction

### Pitfalls
- zundo debounce is critical for sliders — without it, a single slider drag creates dozens of history entries
- Content changes (typing in URL field) should probably NOT be part of undo/redo — only style changes

---

## Phase 13 — History

### Objectives
- Implement persistent history from [HISTORY.md](./HISTORY.md)
- Build history panel UI

### Steps
1. Create `src/lib/storage.ts` — idb-keyval wrapper
2. Create `src/stores/historyStore.ts` with persist middleware
3. Create `src/domain/history/serialization.ts` — migration logic
4. Create history UI:
   - `HistoryPanel.tsx`
   - `HistoryItem.tsx`
   - `HistoryEmpty.tsx`
5. Implement auto-save (debounced, after generation stabilizes)
6. Implement restore, delete, clear-all

### Files Created
```
src/lib/storage.ts
src/stores/historyStore.ts
src/domain/history/
src/features/history/components/*.tsx
```

### Dependencies
- Phase 7 (QR store)

### Acceptance Criteria
- Config auto-saves to history after generation stabilizes
- History persists across page refresh
- Restore loads full QRConfig into generator
- Delete removes single item
- Clear all with confirmation dialog
- Max 100 items (FIFO eviction)
- Duplicate consecutive configs not saved
- Corrupted data recovers gracefully (empty state)
- History panel shows type icon, label, relative timestamp

### Pitfalls
- Logo data URLs in history can be large — warn on large logos
- Blob URLs cannot be persisted — must convert to data URL before saving
- IndexedDB operations are async — handle loading state

---

## Phase 14 — Export

### Objectives
- Implement PNG, SVG, and clipboard export from [EXPORT.md](./EXPORT.md)
- Ensure exports include frames and CTA text

### Steps
1. Create `src/features/generator/hooks/useQRExport.ts`
2. Implement PNG export with resolution options
3. Implement SVG export
4. Implement clipboard copy with browser detection
5. Create `src/utils/download.ts` — file download utility
6. Create `src/utils/clipboard.ts` — clipboard API wrapper
7. Create `src/features/generator/components/ExportActions.tsx`

### Files Created
```
src/features/generator/hooks/useQRExport.ts
src/utils/download.ts, clipboard.ts
src/features/generator/components/ExportActions.tsx
```

### Dependencies
- Phase 6 (QR generation), Phase 9 (compositor)

### Acceptance Criteria
- PNG exports at selected resolution (512/1024/2048/4096)
- SVG exports as valid standalone SVG document
- Exports include frames and CTA text when present
- Clipboard copy works on HTTPS/localhost
- Clipboard fallback when API unavailable
- Success/error toasts for all export actions
- Loading state during export
- Filenames follow convention: `qraft-{type}-{timestamp}.{ext}`

### Pitfalls
- Must revoke object URLs after download to prevent memory leaks
- SVG export with CTA text needs font embedding or path conversion
- Canvas export must await fonts before text rendering
- Clipboard API requires user gesture in some browsers

---

## Phase 15 — Generator Page Assembly

### Objectives
- Assemble the complete generator page layout
- Wire all panels together
- Implement responsive layout

### Steps
1. Create `src/features/generator/components/GeneratorPage.tsx`
2. Implement 3-column desktop layout
3. Implement 2-column tablet layout
4. Implement single-column mobile layout
5. Set up React Router with generator as default route
6. Wire input panel, customization panel, and preview panel

### Files Created/Modified
```
src/features/generator/components/GeneratorPage.tsx
src/App.tsx (router setup)
```

### Dependencies
- Phases 7-14

### Acceptance Criteria
- Desktop: 3-column layout (input | customization | preview)
- Tablet: 2-column layout (input+customization | preview)
- Mobile: single column (preview → input → customization)
- Preview is sticky on desktop and tablet
- Customization panel scrolls independently
- All panels communicate via Zustand stores
- Layout transitions are smooth

### Pitfalls
- Sticky positioning can conflict with overflow: auto on containers
- Mobile layout must put preview FIRST (most important element)
- History panel needs to overlay/push content on mobile

---

## Phase 16 — Accessibility & Polish

### Objectives
- Implement accessibility checklist from [ACCESSIBILITY.md](./ACCESSIBILITY.md)
- Polish transitions, animations, empty states
- Handle edge cases

### Steps
1. Audit keyboard navigation (tab order, focus management)
2. Add ARIA labels and roles throughout
3. Implement focus-visible styles
4. Add screen reader announcements for QR generation and export
5. Implement `prefers-reduced-motion` support
6. Polish empty states and error states
7. Add tooltips for technical controls (error correction levels)
8. Ensure 44x44px minimum touch targets on mobile
9. Run Lighthouse accessibility audit

### Dependencies
- Phase 15

### Acceptance Criteria
- Full keyboard navigation through entire app
- Screen reader announces form labels, errors, and status changes
- Focus-visible indicators on all interactive elements
- Lighthouse accessibility score ≥ 90
- Both themes meet WCAG AA contrast ratios
- Reduced motion respects user preference
- All empty states have helpful messages

---

## Phase 17 — Testing

### Objectives
- Write tests per [TESTING.md](./TESTING.md)
- Achieve coverage targets

### Steps
1. Unit tests for all domain functions (encoders, validators, reliability)
2. Component tests for forms, controls, preview, history
3. E2E tests for primary user flows
4. Configure Playwright for E2E
5. Set up coverage reporting

### Dependencies
- Phase 15 (app complete enough to test)

### Acceptance Criteria
- Domain logic: > 90% coverage
- Components: > 70% coverage
- E2E: all 5 content types, export, history persistence
- All tests pass in CI

---

## Phase 18 — Deployment

### Objectives
- Deploy to Cloudflare Pages
- Configure CI/CD

### Steps
1. Create `public/_redirects` for SPA routing
2. Configure Cloudflare Pages (or alternative)
3. Set up GitHub Actions for CI: lint → typecheck → test → build → deploy
4. Configure security headers
5. Configure caching headers
6. Verify production build works correctly

### Dependencies
- Phase 17

### Acceptance Criteria
- Production build deploys successfully
- SPA routing works (direct URL access, refresh)
- HTTPS enabled
- Lighthouse performance score ≥ 90
- All security headers in place

---

## Implementation Order Summary

```
Phase 1:  Project Setup              [no dependencies]
Phase 2:  Design System              [Phase 1]
Phase 3:  Domain Model               [Phase 1]
Phase 4:  Encoders                   [Phase 3]
Phase 5:  Validation                 [Phase 3]
Phase 6:  QR Generation Engine       [Phase 3, 4]
Phase 7:  Content Forms              [Phase 2, 5, 6]
Phase 8:  Customization Panel        [Phase 2, 6, 7]
Phase 9:  Frame & CTA Compositor     [Phase 6, 8]
Phase 10: Presets                    [Phase 3, 8]
Phase 11: Scan Reliability           [Phase 3, 6]
Phase 12: Undo/Redo                  [Phase 7]
Phase 13: History                    [Phase 7]
Phase 14: Export                     [Phase 6, 9]
Phase 15: Generator Page Assembly    [Phase 7-14]
Phase 16: Accessibility & Polish     [Phase 15]
Phase 17: Testing                    [Phase 15]
Phase 18: Deployment                 [Phase 17]
```

Phases 3-5 can be done in parallel (all depend only on Phase 1/3).
Phases 10-13 can be done in parallel (all depend on Phase 7/8).
Phase 16-17 can be done in parallel.

---

## Unresolved Decisions

These items require implementation-time judgment:

1. **Color picker component**: Custom implementation vs. lightweight library (e.g., react-colorful). Decide during Phase 8.
2. **Frame rendering precision**: Canvas rounded rect implementation (native `roundRect()` vs. manual arc paths). Decide during Phase 9 based on browser support.
3. **Gradient color stop UI**: Draggable stops on a bar vs. simple input list. Decide during Phase 8 based on complexity.
4. **History auto-save timing**: Exact debounce duration (1s? 2s? 3s?). Tune during Phase 13 based on user feel.
5. **Export SVG font handling**: Embed fonts as base64, convert text to paths, or accept system font substitution. Decide during Phase 14 based on complexity.
