# Qraft — Context for Agents

> **Quick-start context file. Read this first, then dive into specific docs.**

## What are we building?

**Qraft** — a polished, browser-based QR code generator and designer. No backend. Runs entirely in the browser. Advanced visual customization with scan reliability analysis.

## Why?

A developer/designer-oriented QR tool that offers professional-level customization (comparable to QRFY) while being fully client-side, privacy-respecting, and open source.

## What is currently implemented?

**Documentation and architecture only.** No application code exists yet. The `docs/` directory contains the complete technical blueprint.

## What is V1?

A standalone, client-only QR code generator with:
- 5 content types (URL, Text, Email, Phone, Wi-Fi)
- Advanced visual customization (patterns, eyes, colors, gradients, logos, frames, CTA text)
- Real-time preview, scan reliability analysis, presets, history, export (PNG/SVG/clipboard)
- Undo/redo, design randomizer
- Light/dark theme, responsive, accessible

## What is explicitly V2?

- URL shortener (requires backend)
- Pastebin (requires backend)
- User accounts / cloud sync
- New content types (vCard, SMS, Calendar)
- Background images behind QR
- Per-eye individual styling (different style per finder pattern)
- Public API

**Do not implement V2 features.** V1 architecture is designed to accommodate them later.

## Important architectural decisions

1. **Tech**: React 19 + TypeScript + Vite + qr-code-styling + Zustand + CSS Modules
2. **Two-layer rendering**: qr-code-styling handles base QR → Qraft compositor handles frames/CTA/logo plates
3. **Domain separation**: Business logic in `src/domain/` (no React imports)
4. **Feature modules**: Each feature (generator, history, settings) in `src/features/`
5. **Library abstraction**: qr-code-styling and idb-keyval wrapped in `src/lib/`
6. **Undo/redo**: zundo middleware on Zustand QR store
7. **Presets don't lock**: Applying a preset sets values; user modifies freely after

See [DECISIONS.md](./DECISIONS.md) for full records. **Do not re-debate settled decisions.**

## Where should an agent look for more detail?

| Need | Document |
|---|---|
| Overall project | [PROJECT.md](./PROJECT.md) |
| What to build | [REQUIREMENTS.md](./REQUIREMENTS.md) |
| How to structure code | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| TypeScript types | [DATA_MODEL.md](./DATA_MODEL.md) |
| QR payload formats | [QR_ENCODING.md](./QR_ENCODING.md) |
| How to implement | [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) |
| Agent rules | [AGENTS.md](./AGENTS.md) |
| Styling tokens | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| Testing plan | [TESTING.md](./TESTING.md) |
