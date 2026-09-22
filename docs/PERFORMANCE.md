# QRaft Performance Considerations

This document outlines the performance considerations, targets, and optimization strategies for the QRaft project—a browser-based QR code generator built with React, TypeScript, and Vite.

## Bundle Size Analysis

Keeping the initial payload small is critical for fast load times. Since QRaft is a client-side application, we aim to minimize our dependency footprint.

### Dependency Budget

| Package | Estimated Size (gzipped) | Purpose |
|---|---|---|
| `react` + `react-dom` | ~45KB | Core UI framework |
| `qr-code-styling` | ~15-20KB | QR code generation and styling |
| `zustand` | ~2KB | State management |
| `idb-keyval` | ~600B | IndexedDB wrapper for history |
| `zod` | ~12KB | Form and schema validation |
| `lucide-react` | ~1KB / icon | UI iconography (tree-shaken) |
| `react-router` | ~15KB | Client-side routing |
| **Total Dependencies** | **~95-115KB** | |
| **Application Code** | **~30-50KB** | |
| **Total Initial Load** | **~130-165KB** | |

**Target:** `< 200KB` gzipped total. We are comfortably within our budget.

## QR Generation Cost

The core function of the app is rendering QR codes. 
- `qr-code-styling` renders QR codes to Canvas or SVG.
- **Generation is synchronous on the main thread.**
- **Typical URL QR:** < 5ms generation time.
- **Complex QR:** (High error correction, large size, custom logo) ~20-50ms.
- **Heavy Styling:** (Gradient + specific dot styles) potentially ~50-100ms.

### Mitigations
1. **Debounce Input:** Apply a 300ms debounce to configuration inputs so the user triggers at most ~3 generations per second.
2. **Yield to Browser:** Use `requestAnimationFrame` or `setTimeout(0, ...)` to ensure the browser has a chance to render the UI before triggering heavy generation tasks.
3. **Web Worker Consideration:** If profiling indicates that generation frequently blocks the main thread for >100ms, we may offload QR generation to a Web Worker (likely a V2 optimization).

## Re-render Optimization

### Problem Areas
1. **QR Preview re-renders on every config change:** Expected behavior, but the underlying generation must be debounced to prevent stuttering.
2. **Customization panel re-renders when QR store changes:** Unnecessary renders if the panel doesn't depend on every single state field.
3. **History list re-renders on every save:** Can cause jank if the history list grows large.
4. **Content form re-renders on validation:** Frequent typing could trigger expensive validation cycles.

### Solutions
- **Zustand Selectors:** Use fine-grained selectors (e.g., `useQRStore(state => state.style.foregroundColor)`) so components only re-render when their specific dependent values change.
- **React.memo:** Apply `React.memo` to expensive or frequently rendered components (e.g., `QRPreview`, `HistoryItem`).
- **useMemo:** Memoize derived values like reliability analysis or encoded payload sizes.
- **useCallback:** Keep event handlers stable when passing them to memoized child components.

## History Loading

- **IndexedDB:** History reads using `idb-keyval` are asynchronous and non-blocking.
- **Hydration:** History hydration happens on app mount.
- **UI State:** Show a skeleton or loading state while hydrating.
- **Data Size:** Max 100 items * ~2KB per item = ~200KB total. This is trivial to parse and load into memory. No major performance concern is anticipated.

## Image/Logo Processing

Uploading custom logos for QR codes requires careful handling to prevent memory issues and state bloat.

- **File Reading:** Logos are read via `FileReader` as data URLs.
- **Client-Side Resizing:** Large logos (>1MB) must be resized client-side before storage. Consider resizing on a Canvas to a maximum of 256x256px before saving to state.
- **Image Processing:** Use `createImageBitmap()` where possible for efficient image processing off the main thread.
- **Validation:** Warn the user if a logo file is excessively large (>500KB).
- **Storage Impact:** Unoptimized data URLs will significantly bloat the history storage size.

## Mobile Performance

Mobile devices typically have slower CPUs, making main-thread blocking more noticeable.

- **Debouncing:** Essential for maintaining a responsive UI on mobile.
- **Touch Interactions:** Sliders and color pickers must remain smooth. Debounce color updates if necessary.
- **CSS Animations:** Use `will-change: transform` sparingly. Avoid layout thrashing (e.g., animating height or width) when opening/closing panels.
- **Testing:** Profile and test the application on mid-range Android devices, not just high-end iPhones.

## Code Splitting

Vite handles code splitting automatically for dynamic imports, but we need to structure our app to take advantage of it.

### What to Split
1. **History Panel:** Load lazily via `React.lazy(() => import('./features/history'))` as it isn't required for the initial paint.
2. **Settings:** Lazy load the settings view if it becomes a dedicated route or heavy modal.
3. **Advanced Customization:** Potentially lazy load heavy styling sections (e.g., gradient builders) if they bring in extra dependencies.

### What NOT to Split
- **Generator Page:** This is the critical initial load.
- **QR Generation Library:** `qr-code-styling` is needed immediately for the first render.
- **Design Tokens / Global Styles:** Must be loaded upfront to prevent FOUC (Flash of Unstyled Content).

### Route-Based Splitting
- React Router natively supports lazy routes.
- Future V2 routes (e.g., link shortener management, pastebin) will be naturally code-split.

## Performance Metrics Targets

| Metric | Target | Description |
|---|---|---|
| **FCP** (First Contentful Paint) | < 1s | Time until the first UI element renders. |
| **LCP** (Largest Contentful Paint) | < 1.5s | Time until the main QR preview renders. |
| **TTI** (Time to Interactive) | < 2s | Time until the app is fully usable. |
| **CLS** (Cumulative Layout Shift) | < 0.05 | Visual stability (prevent UI jumping). |
| **INP** (Interaction to Next Paint) | < 100ms | Responsiveness to user input. |
| **QR Generation Latency** | < 100ms | Max time spent generating a new QR code. |
| **Export Time** | < 500ms | Time to render and prompt download. |

## Potential Bottlenecks

| Bottleneck | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **QR generation blocking main thread** | Medium | Jank during typing | Debounce inputs, use `requestAnimationFrame`. |
| **Large logo data URLs in history** | Medium | Slow history load / OOM | Resize logos client-side, limit storage size. |
| **CSS animations on low-end mobile** | Low | Dropped frames | Respect `prefers-reduced-motion`, use `will-change` correctly. |
| **Many history items in DOM** | Low | Slow scrolling | Implement virtualized list if >100 items. |
| **Color picker re-renders** | Medium | Jank during dragging | Debounce color state updates during drag. |

## Recommendations

1. **Don't Prematurely Optimize:** Build the core features first, then profile.
2. **Monitor Continuously:** Use React DevTools Profiler during development to catch render cascades early.
3. **Real Device Testing:** Profile on real mid-range mobile devices before release.
4. **Implement Debouncing Early:** It is a functional requirement for a smooth UX.
5. **CI/CD Integration:** Use Lighthouse CI in the deployment pipeline to track Core Web Vitals regressions.
6. **Preloading:** Consider preloading critical assets (like Google Fonts) with `<link rel="preload">`.
