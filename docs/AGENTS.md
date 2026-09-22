# Qraft — Agent Instructions

> **Read this if you are a coding agent about to implement Qraft.**

## What is Qraft?

A browser-based QR code generator and designer. See [CONTEXT.md](./CONTEXT.md) for quick overview, [PROJECT.md](./PROJECT.md) for full details.

## Where is the documentation?

All architecture and planning documentation is in this `docs/` directory. Start with:
1. [CONTEXT.md](./CONTEXT.md) — quick orientation
2. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — step-by-step build sequence
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — code structure and data flow
4. [DATA_MODEL.md](./DATA_MODEL.md) — TypeScript types

## Architectural Rules

These are non-negotiable. Do not deviate without documenting a new ADR in [DECISIONS.md](./DECISIONS.md).

### 1. Domain Separation
- All business logic goes in `src/domain/` with **NO React imports**
- Encoders, validators, reliability analysis, presets = pure TypeScript functions
- UI components call domain functions; they don't contain business logic

### 2. Feature-Based Organization
- Features go in `src/features/{feature}/` (generator, history, settings)
- Shared/reusable UI components go in `src/components/`
- Hooks that are feature-specific go in `src/features/{feature}/hooks/`
- Shared hooks go in `src/hooks/`

### 3. Library Abstraction
- External libraries (qr-code-styling, idb-keyval) are wrapped in `src/lib/`
- Feature code imports from `src/lib/`, never directly from npm packages
- This allows swapping libraries without touching feature code

### 4. Two-Layer Rendering
- qr-code-styling generates the base QR (dots, eyes, gradients, logo, background)
- Qraft's compositor (`src/lib/compositor.ts`) adds frames and CTA text
- Preview and export use the **same** pipeline

### 5. State Management
- Zustand stores in `src/stores/`
- Use selectors to prevent unnecessary re-renders
- zundo middleware on qrStore for undo/redo
- Theme in localStorage (synchronous read), everything else in IndexedDB

### 6. Styling
- CSS Modules (`.module.css`) for component styles
- Design tokens as CSS custom properties in `src/styles/variables.css`
- Theme switching via `data-theme` attribute on `<html>`
- Follow [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for all visual specifications

## Coding Conventions

### TypeScript
- Strict mode enabled
- Use interfaces for object shapes, types for unions/aliases
- Use discriminated unions for QRContent (type field)
- All types defined in `src/domain/types.ts`
- No `any` — use `unknown` and narrow

### React
- Functional components only
- Hooks for all logic
- `React.memo` on expensive components
- No `dangerouslySetInnerHTML` with user content
- Use `<dialog>` for modals, not custom overlays

### CSS
- CSS Modules with camelCase class names
- Use CSS custom properties from design system
- Mobile-first media queries
- `prefers-reduced-motion` respected everywhere

### Naming
- Components: PascalCase (`QRPreview.tsx`)
- Hooks: camelCase with `use` prefix (`useQRCode.ts`)
- Domain functions: camelCase (`encodeURL.ts`)
- CSS Modules: camelCase (`styles.container`)
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase

### File Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
└── __tests__/
    └── ComponentName.test.tsx
```

## Things That Must Not Be Changed Casually

1. **Data model types** (`src/domain/types.ts`) — these are the contract. Changes cascade everywhere.
2. **QR encoding formats** — these follow standards (RFC 6068, RFC 3966, ZXing WIFI spec). Don't invent custom formats.
3. **Two-layer rendering architecture** — frames/CTA are composition, not part of the QR library.
4. **Security boundaries** — SVG rasterization, no `dangerouslySetInnerHTML`, no external requests.
5. **Persistence schema version** — bump version when changing persisted data shape, add migration function.

## Testing Expectations

- Domain functions: **must** have unit tests (>90% coverage)
- Components: should have basic render + interaction tests (>70% coverage)
- E2E: cover all 5 content types + export + history
- Run `npx vitest run` before considering work complete
- See [TESTING.md](./TESTING.md) for full strategy

## V1 / V2 Boundaries

**V1 only:**
- Client-side QR generation
- 5 content types (URL, Text, Email, Phone, Wi-Fi)
- All visual customization documented in REQUIREMENTS.md
- Local history, local presets, local theme

**V2 (DO NOT IMPLEMENT):**
- Backend API
- URL shortener
- Pastebin
- User authentication
- Cloud sync
- vCard/SMS/Calendar content types
- Background images
- Per-eye individual styling

If you find yourself needing backend infrastructure, **stop**. That's V2.

## Updating Documentation

When making architectural changes:
1. Update the relevant doc in `docs/`
2. If it's a significant decision, add an ADR to [DECISIONS.md](./DECISIONS.md)
3. Keep [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) current
4. Keep types in `src/domain/types.ts` as the source of truth (docs may reference them but code is authoritative)

## Build & Run

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type checking
pnpm tsc --noEmit

# Lint
pnpm lint

# Unit + component tests
pnpm test

# E2E tests
pnpm test:e2e

# Production build
pnpm build
```
