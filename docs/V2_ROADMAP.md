# V2 Roadmap and Extensibility

This document outlines the planned features for QRaft V2 and describes how the V1 architecture has been designed to support these future enhancements without requiring full rewrites.

## V2 Features

### URL Shortener
```text
User enters long URL
  → API call to Qraft shortener backend
  → Returns short URL (e.g., qr.aft/abc123)
  → Short URL fed to QR generator
  → QR code for short URL
```
- Requires a backend (Node.js or serverless).
- Requires a database for URL mappings.
- Features: analytics (click tracking), custom short codes, and expiration/TTL.

### Pastebin
```text
User enters text/code
  → API call to Qraft paste backend
  → Returns paste URL (e.g., qr.aft/p/abc123)
  → Paste URL fed to QR generator
  → QR code for paste URL
```
- Requires a backend for storage.
- Features: syntax highlighting on the paste viewing page, expiration, and optional password protection.

### New QR Content Types
- **vCard:** Rich contact cards.
- **SMS:** Pre-filled text messages.
- **Calendar Events:** iCal format event generation.
- **Payments:** Bitcoin/Ethereum address formats.
- **App Store Links:** Dynamic routing based on device OS.

### Cloud Sync
- User authentication (Sign in with Google, GitHub, etc.).
- Sync history across multiple devices.
- Cloud-stored presets and custom design profiles.

### Developer API
- Public REST/GraphQL API for programmatic QR generation.
- Rate limiting and usage quotas.
- API keys for developers.

---

## V1 → V2 Extension Points

The V1 codebase establishes patterns specifically designed to ease the V2 transition:

1. **Content Type System**: The content payload is modeled as a discriminated union. To add new types (like vCard or Calendar events), developers simply add new types to the union and implement the corresponding encoder, validator, and form components.
2. **QR Engine Decoupling**: QR generation is decoupled from the content input logic. It accepts any valid string payload. Thus, a shortened URL or a pastebin URL can be seamlessly piped into the existing generator.
3. **Router**: React Router is integrated from day one. New routes like `/shorten` or `/paste` can be added cleanly.
4. **Backend Integration**: The current architecture expects external data sources. A future `lib/api.ts` module will serve as the API client, while Zustand stores continue managing client-side generation state.
5. **State Management**: Local state (Zustand) is kept isolated from server state, allowing tools like React Query or SWR to be dropped in later for managing API requests.

---

## Architecture Changes Required for V2

| Change | V1 Preparation | V2 Implementation |
|---|---|---|
| **Backend API** | N/A | Node.js serverless functions / edge compute |
| **Authentication** | N/A | Firebase Auth, Auth.js, or Supabase |
| **Database** | N/A | PostgreSQL, Redis, or KV store |
| **New routes** | React Router in place | Add new route components to router config |
| **New content types** | Extensible type system | Add types, encoders, and validation logic |
| **API client** | N/A | Add `lib/api.ts` and React Query |

---

## What V1 Must NOT Do

To maintain a clean and lightweight foundation, V1 strictly enforces these constraints:
- **Do not** introduce backend dependencies or server frameworks.
- **Do not** add authentication scaffolding or user management.
- **Do not** create API routes (Next.js/Vite server routes).
- **Do not** add any database schemas or ORMs.
- **Do not** implement the URL shortening logic.
- **Do not** implement pastebin functionality.

## What V1 Must Do for V2 Readiness

- Keep **QR generation decoupled** from content input mechanisms.
- Keep **content types extensible** (via a strict discriminated union pattern).
- Use **React Router** for all routing (even if there is only a single meaningful route in V1).
- Keep **state management modular** (separate Zustand stores for UI, Config, and Content).
- Keep **business logic** in the `domain/` folder as pure, easily testable functions.
