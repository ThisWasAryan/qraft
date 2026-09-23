# Architecture Decision Records

This document records all significant architectural decisions for the Qraft project. It serves as a historical record of technical choices and prevents future debate over settled decisions.

### ADR-001: React + TypeScript + Vite
**Status**: Accepted
**Date**: 2024-09
**Context**: We need a modern, fast, and type-safe frontend stack to build the Qraft web application.
**Decision**: We will use React with TypeScript and Vite as the build tool.
**Alternatives Considered**: Create React App (deprecated and slow), Next.js (overkill for a purely client-side application without SSR needs).
**Consequences**: Vite provides extremely fast Hot Module Replacement (HMR) and optimized builds. TypeScript ensures robust type safety across our QR config domain model, reducing runtime errors. Since the app is client-only, this stack minimizes deployment complexity while maintaining a modern developer experience.

### ADR-002: qr-code-styling as QR Engine
**Status**: Accepted
**Date**: 2024-09
**Context**: The application requires a robust QR code generation engine that supports advanced styling, logos, and multiple output formats.
**Decision**: We will use the `qr-code-styling` library as the core generation engine.
**Alternatives Considered**: `qrcode.react` (limited styling capabilities), `react-qr-code` (SVG only, no logo support), `awesome-qr` (abandoned/unmaintained), and `qrcode` (no React integration, lacks advanced styling).
**Consequences**: `qr-code-styling` offers extensive customization including 6 dot types, 7 corner square types, 2 corner dot types, independent colors/gradients, logo integration with dot excavation, and both SVG and Canvas output options. 
*Tradeoffs*: The API is imperative, requiring a React wrapper (using `useRef` and `useEffect`) to integrate smoothly. Additionally, logos are always centered and per-eye individual styling is not natively supported. These limitations are acceptable for V1.

### ADR-003: CSS Modules for Styling
**Status**: Accepted
**Date**: 2024-09
**Context**: We need a styling solution that provides scoped styles without runtime overhead or excessive configuration.
**Decision**: We will use CSS Modules along with CSS custom properties for theming.
**Alternatives Considered**: Tailwind CSS (can lead to utility class bloat and offers less control for a highly custom design system), CSS-in-JS like Styled Components (adds runtime overhead and ecosystem is declining), Vanilla Extract (steeper learning curve).
**Consequences**: CSS Modules provide locally scoped classes, zero runtime cost, and full access to standard CSS features. Vite supports CSS Modules out-of-the-box, requiring zero configuration. Theming (light/dark mode) will be handled via CSS custom properties and a `data-theme` attribute.

### ADR-004: Zustand for State Management
**Status**: Accepted
**Date**: 2024-09
**Context**: The app features a complex configuration state for QR codes that updates frequently during design interactions.
**Decision**: We will use Zustand for global state management.
**Alternatives Considered**: React Context (prone to re-render performance issues with frequent, deep updates), Jotai (overkill for mostly localized/flat state), Redux (too heavy and boilerplate-intensive).
**Consequences**: Zustand provides a lightweight (~2KB), hook-based API with fine-grained selectors that prevent unnecessary re-renders. It also integrates seamlessly with persistence middlewares and devtools. We will complement it with the `zundo` middleware for undo/redo functionality (adding ~2KB).

### ADR-005: idb-keyval for Persistence
**Status**: Accepted
**Date**: 2024-09
**Context**: User designs, history, and application state need to be persisted locally in the browser to prevent data loss between sessions.
**Decision**: We will use `idb-keyval` to interact with IndexedDB for most persistence needs.
**Alternatives Considered**: Raw `localStorage` (synchronous API blocks the main thread, limited to 5MB, not suitable for larger histories or image data), raw IndexedDB (overly verbose and complex API).
**Consequences**: `idb-keyval` provides a tiny (~600B), asynchronous, promise-based wrapper over IndexedDB with practically unlimited storage capacity. 
*Exception*: `localStorage` will be used ONLY for saving the user's theme preference, as this requires synchronous reading during initial page load to prevent a flash of unstyled content (FOUC).

### ADR-006: Zod for Validation
**Status**: Accepted
**Date**: 2024-09
**Context**: Form inputs and complex QR configuration payloads require strict runtime validation and type inference.
**Decision**: We will use Zod for schema validation.
**Alternatives Considered**: Custom validation logic (error-prone for edge cases and harder to maintain), browser native validation (poor UX and limited capabilities).
**Consequences**: Zod (~12KB) offers a TypeScript-first approach, allowing us to infer TS types directly from our schemas. This creates a single source of truth for both type definitions and runtime validation, while providing robust custom error messaging.

### ADR-007: Two-Layer Rendering Architecture
**Status**: Accepted
**Date**: 2024-09
**Context**: Generating a final image involves combining the core QR code with decorative elements like frames and Call-to-Action (CTA) text.
**Decision**: We will implement a two-layer rendering architecture. Layer 1 uses `qr-code-styling` to generate the base QR (dots, eyes, colors, gradients, logo, background). Layer 2 (the Qraft compositor) wraps this base with frames, CTA text, and logo plates.
**Alternatives Considered**: Attempting to fork or heavily modify the core QR library to handle frames internally.
**Consequences**: Separating concerns makes the system much cleaner: the library focuses purely on QR encoding and styling, while the app handles presentation and composition. The export pipeline will use this exact same composition pipeline at higher resolutions, ensuring the on-screen preview perfectly matches the exported file.

### ADR-008: Frame and CTA as Composition Layer
**Status**: Accepted
**Date**: 2024-09
**Context**: Users need to wrap their QR codes in decorative frames with text.
**Decision**: Frames and CTAs are strictly part of the composition layer (Layer 2) and are NOT encoded within the QR matrix itself.
**Alternatives Considered**: Using a third-party library for framing.
**Consequences**: For Canvas export, we will draw the frame, then the QR code, then the CTA text. For SVG export, we will wrap the generated QR SVG within a parent SVG containing the frame elements. Frame padding logic will explicitly preserve the QR code's quiet zone. We will write custom Canvas/SVG composition code rather than relying on an external dependency.

### ADR-009: Logo Plate Pre-Composition
**Status**: Accepted
**Date**: 2024-09
**Context**: We want to support background plates behind logos for better visibility, but `qr-code-styling` doesn't natively support this.
**Decision**: We will pre-composite the logo and its background plate onto an off-screen canvas, export it as a data URL, and pass that resulting image to the library.
**Alternatives Considered**: Modifying the library to draw plates natively, or trying to inject SVG nodes post-render.
**Consequences**: This approach is simple, robust, and allows the QR library to handle the complex math of centering the combined logo and excavating the correct number of dots behind it.

### ADR-010: Mathematical Generative Randomizer
**Status**: Accepted
**Date**: 2024-09
**Context**: We want a "randomize" or "surprise me" feature to help users discover styles quickly.
**Decision**: We will use a true mathematical generative engine (`generateRandomPalette.ts`) using HSL constraints to generate infinite vibrant color combinations and gradients.
**Alternatives Considered**: A curated array of static JSON palettes (initially implemented, but rejected because it felt highly repetitive and users received the exact same designs).
**Consequences**: Pure randomization can sometimes generate clashing colors. To prevent unscannable QR codes, we paired this generative engine with an absolute matrix contrast check (`getWorstCaseContrast()`) that strictly filters out any gradients or colors that do not meet WCAG contrast thresholds. When randomized, we force the error correction level to 'H'. The randomizer alters dot types, corner types, colors, and gradients, but intentionally EXCLUDES the logo, frame, and CTA, as these are highly user/brand-specific.

### ADR-011: Undo/Redo via zundo
**Status**: Accepted
**Date**: 2024-09
**Context**: Users need the ability to easily revert design changes, especially when using the randomizer or tweaking sliders.
**Decision**: We will use the `zundo` middleware for Zustand to implement undo/redo.
**Alternatives Considered**: Custom command pattern implementation (overkill), `use-undo` hook (doesn't integrate natively with our global Zustand store).
**Consequences**: `zundo` is purpose-built for Zustand and handles state snapshots efficiently. We will configure it to keep a maximum of 50 history states and apply a 500ms debounce to prevent slider interactions from flooding the history stack. This will cover all QR style changes globally.

### ADR-012: Lucide React for Icons
**Status**: Accepted
**Date**: 2024-09
**Context**: The UI requires consistent, high-quality iconography.
**Decision**: We will use `lucide-react`.
**Alternatives Considered**: React Icons (known tree-shaking issues leading to large bundle sizes), Heroicons (smaller icon set), Phosphor (heavier library).
**Consequences**: Lucide is highly tree-shakeable (~1KB per used icon), offers over 1,000 icons, and maintains a clean, consistent stroke-based aesthetic that fits modern design systems perfectly.

### ADR-013: React Router v7
**Status**: Accepted
**Date**: 2024-09
**Context**: Though V1 is essentially a single-page app, we need to plan for future expansion.
**Decision**: We will implement React Router v7 using hash-based routing.
**Alternatives Considered**: No router, or using standard browser history routing.
**Consequences**: While minimal for V1, having a router in place prepares the architecture for V2 features like a URL shortener or Pastebin which will require distinct routes. Hash-based routing (`/#/path`) ensures seamless compatibility with static hosting environments like Cloudflare Pages without requiring rewrite rules.

### ADR-014: Cloudflare Pages for Deployment
**Status**: Accepted
**Date**: 2024-09
**Context**: The application needs a reliable, fast, and cost-effective static hosting provider.
**Decision**: The app will be deployed on Cloudflare Pages.
**Alternatives Considered**: Vercel (more restrictive free tier limits), Netlify (slower CDN response times in some regions compared to Cloudflare).
**Consequences**: Cloudflare Pages offers unlimited bandwidth, one of the fastest edge networks globally, and zero-configuration support for Vite builds. Deployment instructions will document alternatives if team preferences shift later.

### ADR-015: SVG Logo Rasterization
**Status**: Accepted
**Date**: 2024-09
**Context**: Allowing users to upload SVG logos presents a potential Cross-Site Scripting (XSS) vulnerability if the SVG contains malicious scripts.
**Decision**: We will rasterize all uploaded SVGs to a `<canvas>` element before using them in the QR code.
**Alternatives Considered**: Implementing complex SVG sanitization libraries (e.g., DOMPurify).
**Consequences**: Rasterization is inherently more secure and simpler than sanitization. Once the SVG is drawn to a canvas and extracted as a data URL, no script execution is possible.

### ADR-016: WiFi Passwords in History
**Status**: Accepted
**Date**: 2024-09
**Context**: Generating Wi-Fi QR codes requires inputting the network password, which is sensitive data.
**Decision**: We will store Wi-Fi passwords in the local design history by default, but we will explicitly display a privacy notice in the Wi-Fi form.
**Alternatives Considered**: Never storing Wi-Fi passwords (leads to poor UX when recalling past designs).
**Consequences**: Users are informed that data stays local, and they have the option to clear their history at any time. A future enhancement (V2) may include a toggle to explicitly exclude passwords from being saved.

### ADR-017: Domain-Driven Code Organization
**Status**: Accepted
**Date**: 2024-09
**Context**: We need to keep business logic separate from UI concerns to ensure long-term maintainability and testability.
**Decision**: We will structure business logic in a `src/domain/` directory with strictly NO React imports.
**Alternatives Considered**: Standard feature-based or component-based folder structures that mix UI and logic.
**Consequences**: Encoders, validators, reliability analysis, and preset generation will remain pure TypeScript functions. This ensures they are easily testable in isolation and framework-independent. UI components will remain thin, focusing only on rendering state and dispatching actions.

### ADR-018: Background Images Deferred to V2
**Status**: Accepted
**Date**: 2024-09
**Context**: Users often want to put background images behind their QR codes.
**Decision**: Background image support is deferred to V2 and will not be included in V1.
**Alternatives Considered**: Attempting to hack background support into V1.
**Consequences**: Background images introduce significant scan reliability risks. Since `qr-code-styling` does not natively support them well, implementing them requires complex composition logic and robust real-time reliability analysis to ensure the code remains readable. This is out of scope for the initial release.

### ADR-019: Per-Eye Individual Styling Deferred
**Status**: Accepted
**Date**: 2024-09
**Context**: Advanced designs sometimes call for the three finder patterns (eyes) to have different styles or colors from one another.
**Decision**: Per-eye individual styling is deferred to V2.
**Alternatives Considered**: Forking `qr-code-styling` or running complex SVG post-processing routines.
**Consequences**: The current library applies styles uniformly to all three finder patterns. Supporting individual styles would add significant technical debt and complexity for V1. We will document this limitation and consider it for future iterations if user demand is high.
