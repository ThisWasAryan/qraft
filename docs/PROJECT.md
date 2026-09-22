# Qraft — Project Overview

## What is Qraft?

Qraft is a polished, browser-based QR code generator and designer. It runs entirely in the browser with no backend, no analytics, and no tracking. All QR generation and data processing happens locally on the user's device.

Qraft is aimed at developers, designers, and technical users who want fast, customizable, reliable QR code generation with real-time preview and professional visual output.

## Repository

- **GitHub**: https://github.com/ThisWasAryan/ORaft.git
- **Local path**: `/home/aryan/Projects/Antigravity/QRaft`

---

## V1 Scope

V1 is a fully functional, standalone QR code generator with advanced visual customization. It requires no backend.

### Content Types
- URL, Plain Text, Email, Phone, Wi-Fi

### Core Features
- Real-time QR generation with live preview
- Advanced pattern customization (6 dot shapes)
- Independent finder eye styling (frame + pupil shapes and colors)
- Gradient support (linear/radial) for dots, eyes, and background
- Logo embedding with plates, sizing, and excavation
- Decorative frames with CTA text ("SCAN ME", custom text)
- Preset system (16+ built-in presets across 4 categories)
- Design randomizer ("Surprise Me") with curated palettes
- Undo/redo for all style changes
- Scan reliability analysis (heuristic-based warnings)
- PNG and SVG export at configurable resolutions
- Clipboard copy
- Persistent local history (IndexedDB)
- Light/dark theme with system preference detection
- Fully responsive (desktop + tablet + mobile)
- Keyboard accessible, screen-reader friendly

### What V1 Does NOT Include
- No backend, no server calls
- No URL shortener
- No Pastebin
- No user accounts or cloud sync
- No analytics or telemetry

---

## V2 Direction

V2 will introduce server-side features while keeping the QR engine client-side:
- **URL Shortener**: Long URL → Short URL → QR Code
- **Pastebin**: Text → Public Paste URL → QR Code
- **New content types**: vCard, SMS, Calendar events
- **Cloud sync**: Cross-device history with authentication
- **Public API**: Programmatic QR generation

V1 architecture is designed to make these additions straightforward. See [V2_ROADMAP.md](./V2_ROADMAP.md).

---

## Core Principles

1. **Client-only in V1**: All processing happens in the browser. User data never leaves the device.
2. **Scan reliability first**: Advanced styling is supported but always comes with honest reliability warnings.
3. **Extensible content types**: Adding new QR content types (vCard, SMS) requires adding a type to the union, an encoder, a validator, and a form — not rewriting the system.
4. **Domain separation**: Business logic lives in `src/domain/` with no React imports. Pure TypeScript functions that are independently testable.
5. **Two-layer rendering**: qr-code-styling generates the base QR → Qraft's compositor adds frames, CTA text, and logo plates.
6. **Presets don't lock**: Applying a preset sets values but users can modify anything afterward.
7. **Privacy by default**: Zero telemetry, zero tracking, clear data controls.

---

## Tech Stack

| Category | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| QR Engine | qr-code-styling |
| State | Zustand + zundo |
| Persistence | idb-keyval (IndexedDB) |
| Validation | Zod |
| Styling | CSS Modules + CSS custom properties |
| Icons | Lucide React |
| Routing | React Router v7 |
| Testing | Vitest + RTL + Playwright |
| Deployment | Cloudflare Pages |

See [TECH_STACK.md](./TECH_STACK.md) for rationale.

---

## Key Architecture Decisions

| Decision | Summary |
|---|---|
| qr-code-styling | Best customization coverage; imperative API wrapped in React hooks |
| CSS Modules | Zero runtime, scoped, full CSS power, no config |
| Two-layer rendering | Library handles QR encoding; Qraft handles frames/CTA |
| Logo plate pre-composition | Off-screen canvas composites logo+plate before passing to library |
| zundo for undo/redo | Purpose-built for Zustand, debounce support, ~2KB |
| Curated randomizer | Pre-validated palettes, not pure random |
| SVG rasterization | Uploaded SVGs rasterized for security |
| Background images deferred | Too risky for V1 scan reliability |
| Per-eye individual styling deferred | Not supported by qr-code-styling |

See [DECISIONS.md](./DECISIONS.md) for full ADRs.

---

## Documentation Index

| Document | Description |
|---|---|
| [PROJECT.md](./PROJECT.md) | This file — high-level overview |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Functional & non-functional requirements |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Directory structure, components, data flow |
| [TECH_STACK.md](./TECH_STACK.md) | Technology choices and rationale |
| [DATA_MODEL.md](./DATA_MODEL.md) | TypeScript types, interfaces, schemas |
| [QR_ENCODING.md](./QR_ENCODING.md) | QR payload format per content type |
| [VALIDATION.md](./VALIDATION.md) | Input validation rules per type |
| [SCAN_RELIABILITY.md](./SCAN_RELIABILITY.md) | Heuristic scan safety analysis system |
| [PRESETS.md](./PRESETS.md) | Preset system design and built-in presets |
| [HISTORY.md](./HISTORY.md) | Local history persistence design |
| [EXPORT.md](./EXPORT.md) | PNG/SVG/Clipboard export architecture |
| [UI_UX.md](./UI_UX.md) | Interface design for desktop and mobile |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Typography, colors, components, tokens |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG checklist and accessibility requirements |
| [PERFORMANCE.md](./PERFORMANCE.md) | Bundle size, generation cost, optimization |
| [SECURITY.md](./SECURITY.md) | Security and privacy analysis |
| [TESTING.md](./TESTING.md) | Testing strategy (unit, component, E2E) |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment configuration and CI/CD |
| [V2_ROADMAP.md](./V2_ROADMAP.md) | Future features and extension points |
| [DECISIONS.md](./DECISIONS.md) | Architecture Decision Records |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Step-by-step implementation roadmap |
| [AGENTS.md](./AGENTS.md) | Instructions for coding agents |
| [CONTEXT.md](./CONTEXT.md) | Quick-start context for agents |

---

## Current Status

**Phase**: Architecture & Planning complete. Ready for implementation.

**Implemented**: Documentation and architecture only. No application code yet.

**Next step**: Begin implementation following [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
