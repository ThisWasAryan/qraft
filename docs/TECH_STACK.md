# Qraft Technology Stack & Architecture Decisions

This document details all technology choices for the Qraft project — a browser-based QR code generator built with React + TypeScript + Vite.

## Decision Summary

| Domain | Selected Technology | Primary Rationale |
|---|---|---|
| **Core Framework** | React 19 + TypeScript + Vite | Standard modern frontend stack, fast dev server, type safety |
| **QR Generation** | `qr-code-styling` | Comprehensive customization (SVG/Canvas, dot shapes, eyes, gradients, logos) |
| **Styling** | CSS Modules | Zero runtime overhead, scoped classes, design tokens via CSS custom properties |
| **Icons** | Lucide React | Tree-shakeable, consistent aesthetic, TypeScript support |
| **State Management** | Zustand | Lightweight, hook-based, fine-grained selectors, built-in persistence |
| **Undo/Redo** | zundo | Temporal state middleware for Zustand, small size (~2KB), handles debounce |
| **Persistence** | idb-keyval (IndexedDB) | Async (non-blocking), large storage limits, simple API |
| **Validation** | Zod | TypeScript-first schema validation, type inference |
| **Routing** | React Router v7 | Prepares for future multi-page features (URL shortener, Pastebin) |
| **Testing** | Vitest + React Testing Library + Playwright | Shared config with Vite, robust component and E2E testing |
| **Deployment** | Cloudflare Pages | Unlimited bandwidth, global edge network, SPA routing |
| **Package Manager**| pnpm | Fast, disk-efficient, strict dependency resolution |

---

## Key Decisions from Research

### Core Framework: React 19 + TypeScript + Vite
- **Standard modern frontend stack**
- **Vite** for fast dev server and builds
- **TypeScript** for type safety

### QR Generation Library: `qr-code-styling`
- **Primary choice**: `qr-code-styling` — provides the most comprehensive customization
  - SVG and Canvas output
  - Module/dot shape styling (square, rounded, dots, fluid, classy, etc.)
  - Finder pattern (eye) customization (shapes and colors)
  - Gradient foreground support (linear and radial)
  - Logo/image embedding with automatic background clearing
  - Error correction level control
  - ~15-20KB minified
  - TypeScript types included
  - Imperative API (requires React wrapper)
- **Why not `qrcode.react`**: Limited to square modules and basic colors. No gradients, no dot shapes, no eye styling.
- **Why not `react-qr-code`**: SVG only, no logo support, no advanced styling.
- **Why not `awesome-qr`**: Abandoned, unmaintained.
- **React integration**: We'll build a custom React hook `useQRCode` and component `QRPreview` that wraps the imperative API using `useRef` + `useEffect`.
- **Export strategy**: Use `qr-code-styling`'s built-in `getRawData('png')` and `getRawData('svg')` methods for export. For clipboard, convert to Blob.

### qr-code-styling Capabilities vs. Qraft Wrapper

| Feature | qr-code-styling native | Qraft wrapper |
|---|---|---|
| Dot shapes | ✓ (6 types) | — |
| Corner square shapes | ✓ (7 types) | — |
| Corner dot shapes | ✓ (2 types) | — |
| Independent dot/eye colors | ✓ | — |
| Gradients (dot, eye, bg) | ✓ | — |
| Logo centering + excavation | ✓ | — |
| Background color/gradient | ✓ | — |
| Background border-radius | ✓ | — |
| Error correction | ✓ | — |
| Transparent background | ✓ | — |
| **Frames** | — | ✓ (Canvas/SVG composition) |
| **CTA text** | — | ✓ (Canvas fillText / SVG text) |
| **Logo plates** | — | ✓ (off-screen canvas composite) |
| **Per-eye individual styling** | — | Not in V1 |
| **Background images** | — | Future (V2+) |

### Canvas/SVG Composition
- Frame rendering is custom code, not a third-party library
- Canvas composition: draw frame → draw QR → draw CTA text
- SVG composition: nest QR SVG in parent SVG with frame elements
- No additional dependency needed

### Font Loading
- Use document.fonts API (native) to ensure fonts are loaded before canvas text rendering
- No library needed
- Critical for CTA text export: `await document.fonts.ready` before `ctx.fillText()`

### Styling: CSS Modules
- **Choice**: CSS Modules (`.module.css` files) with CSS custom properties for theming.
- **Rationale**:
  - Zero runtime overhead (unlike CSS-in-JS)
  - Scoped class names prevent style collisions
  - CSS custom properties enable light/dark theming without JS runtime
  - Vite has built-in CSS Modules support — zero config
  - Allows full CSS power (media queries, animations, pseudo-elements)
  - Design tokens via CSS custom properties in a root stylesheet
  - No dependency to install or configure
- **Why not Tailwind**: The project specification explicitly asks to choose based on requirements. CSS Modules give better control for a design-system-first approach, avoid className string bloat, and don't require learning utility conventions. For a mid-sized app with a custom design system, CSS Modules are more maintainable.
- **Why not CSS-in-JS**: Runtime overhead, moving away from industry favor.
- **Structure**: 
  - `src/styles/variables.css` — design tokens as CSS custom properties
  - `src/styles/global.css` — resets, typography, global styles
  - `src/components/ComponentName/ComponentName.module.css` — per-component

### Icons: Lucide React
- Tree-shakeable individual icon imports
- Consistent stroke-based aesthetic fits developer-oriented design
- ~1KB per icon (only imported icons in bundle)
- Native TypeScript support
- Large icon set (1000+)

### State Management: Zustand
- Lightweight (~2KB)
- Hook-based API, no providers needed
- Fine-grained selectors prevent unnecessary re-renders
- Built-in `persist` middleware for localStorage/IndexedDB
- Devtools integration
- **Stores**:
  - `useQRStore` — active QR content, style, config
  - `useHistoryStore` — QR history (persisted)
  - `useThemeStore` — theme preference (persisted)
  - `useUIStore` — transient UI state (panels, modals)

### Undo/Redo Approach
- **Decision**: `zundo` middleware on Zustand QR store
- **Alternatives considered**: custom command pattern, use-undo hook
- **Reason**: `zundo` is purpose-built for Zustand, handles debounce for slider interactions, ~2KB
- **Config**: max 50 history states, 500ms debounce for grouped changes

### Design Randomizer Approach
- **Decision**: Curated palettes, not pure random
- **Reason**: Pure random produces unscannable combinations (poor contrast, conflicting styles)
- **Implementation**: ~20-30 curated color+style palettes stored as JSON
- Each palette pre-validated for contrast and scan reliability
- Forced EC=H for all randomized designs

### Persistence: idb-keyval (IndexedDB)
- Asynchronous (doesn't block main thread)
- Practically unlimited storage
- Simple get/set API matching localStorage ergonomics
- ~600 bytes minified
- Used for history storage
- LocalStorage used only for theme preference (tiny, synchronous read needed to prevent flash)

### Validation: Zod
- TypeScript-first schema validation
- Infers types from schemas (single source of truth)
- Custom error messages
- ~12KB minzipped
- Used for QR content validation per type
- Also validates preset configs, import data

### Router: React Router v7
- Minimal routing needed for V1 (single page with potential settings)
- V2 will need routes for URL shortener, Pastebin
- React Router provides the extension path
- Hash-based routing for static deployment compatibility

### Testing
- **Unit/Component**: Vitest + React Testing Library
  - Vitest shares Vite config, fast
  - RTL for component-level tests
- **E2E**: Playwright
  - Multi-browser support
  - Better architecture than Cypress
  - Free parallelization
- **Coverage**: c8/v8 via Vitest

### Deployment: Cloudflare Pages
- Unlimited bandwidth on free tier
- Fastest global edge network
- Excellent SPA routing support
- Zero-config Vite integration
- Alternative: Vercel (if team prefers)

### Package Manager: pnpm
- Fast, disk-efficient
- Strict dependency resolution

---

## Complete Dependency List

### Production Dependencies
| Package | Purpose | Size (approx.) |
|---|---|---|
| `react`, `react-dom` | UI framework | ~45KB |
| `qr-code-styling` | QR generation & styling | ~15-20KB |
| `zustand` | State management | ~2KB |
| `zundo` | Undo/redo middleware | ~2KB |
| `idb-keyval` | IndexedDB wrapper | ~600B |
| `zod` | Validation | ~12KB |
| `lucide-react` | Icons | ~1KB/icon |
| `react-router` | Routing | ~15KB |

### Development Dependencies
| Package | Purpose |
|---|---|
| `typescript` | Type checking |
| `vite` | Build tool |
| `@vitejs/plugin-react` | React Fast Refresh |
| `vitest` | Testing |
| `@testing-library/react` | Component testing |
| `@testing-library/jest-dom` | DOM matchers |
| `@testing-library/user-event` | User interaction simulation |
| `playwright` | E2E testing |
| `eslint` | Linting |
| `prettier` | Code formatting |

### Estimated Total Bundle Size
- **Dependencies**: ~95-120KB gzipped
- **App code (expanded customization)**: ~40-60KB
- **Total**: ~140-180KB gzipped (within 200KB target)
