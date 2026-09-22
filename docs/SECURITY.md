# Qraft Security and Privacy

This document outlines the security architecture and privacy considerations for the Qraft QR code generator application. 

## Core Security Principle

> [!IMPORTANT]
> **Qraft V1 is entirely client-side.** No user data leaves the browser. This is a fundamental privacy guarantee built into the architecture.

## Privacy Summary

| Data | Stored? | Where? | Sent Externally? |
| --- | --- | --- | --- |
| QR Content (URLs, text, etc.) | Yes (history) | IndexedDB | Never |
| Wi-Fi Passwords | Yes (history)* | IndexedDB | Never |
| Uploaded Logos | Yes (history) | IndexedDB | Never |
| Theme Preference | Yes | `localStorage` | Never |
| Generated QR Images | No | Transient (Memory) | Never |
| Usage Analytics | No | N/A | Never |
| Error Reports | No | N/A | Never |

*\* Note: See [Local Storage Security](#local-storage-security) regarding Wi-Fi passwords.*

## User-Entered QR Data

- All QR content (URLs, text, emails, phone numbers, Wi-Fi credentials) is entered directly by the user.
- This data is encoded into QR codes locally within the browser.
- Data may be stored in browser `IndexedDB` for the history feature.
- **This data is NEVER sent to any server.**

> [!WARNING]
> Wi-Fi passwords are particularly sensitive. Because they are stored in the local history, the user must be aware.
> **Recommendation for Implementation:** Show a subtle privacy notice in the Wi-Fi form stating, *"Passwords are stored locally on your device."*

## Uploaded Logos

Users can upload custom logo images to embed within their QR codes.

- Logos are read via the `FileReader` API as data URLs.
- Logos are stored in `IndexedDB` as Base64 data URLs (linked to history items).
- **Logos are NEVER uploaded to any server.**

### Risks and Mitigations

*   **Risk:** Malicious image files (e.g., specially crafted PNGs that exploit browser image decoders).
    *   *Mitigation:* Browser image decoders are heavily sandboxed. This is inherently a browser-level security concern, not an application-level one.
*   **Risk:** Excessively large uploads consuming memory and causing denial-of-service (DoS) on the client side.
    *   *Mitigation:* Implement a hard limit on upload sizes (e.g., 2MB max) and resize images to reasonable dimensions before processing.
    *   *Recommendation:* Validate file types strictly on the client side. Accept only `image/png`, `image/jpeg`, `image/svg+xml`, `image/gif`, and `image/webp`.

## SVG Handling (CRITICAL)

SVG files can contain embedded JavaScript, creating a significant Cross-Site Scripting (XSS) vector.

```xml
<!-- Example of malicious SVG -->
<svg onload="alert('xss')">
<svg><script>alert('xss')</script></svg>
```

### Risks
1.  **SVG Logo Upload:** If a user uploads an SVG logo, it could contain malicious scripts.
2.  **SVG Export:** Generated SVGs should not inadvertently contain executable user content.
3.  **SVG Rendering in DOM:** If an SVG is rendered via `innerHTML` or `dangerouslySetInnerHTML`, embedded scripts could execute within the app's context.

### Mitigations
1.  **SVG Logo Uploads:** 
    *   *Option A:* Convert the SVG to a PNG (rasterize it to a `<canvas>`) before use. This completely eliminates script risks.
    *   *Option B:* Sanitize the SVG (strip `<script>` tags, event handlers, and `javascript:` URLs).
    *   *Implementation Decision:* **Option A** is recommended. Rasterize uploaded SVGs to a canvas, then use the result as a standard image. It is simpler and more secure.
2.  **SVG Export:** `qr-code-styling` generates clean SVGs natively. We must verify that no raw user content appears inside executable attributes.
3.  **SVG Rendering:** Always use standard `<img src="...">` tags for SVG display. The browser sandboxes SVGs loaded this way, preventing script execution. Avoid inline SVGs if the source is untrusted.

## XSS Risks

### User Input in the DOM
- Content form values are rendered as text in the UI. React's JSX auto-escapes these by default.
- History labels derived from user content are also safely auto-escaped by React.
- **Rule:** Never use `dangerouslySetInnerHTML` with user-derived content.
- Tooltip content should strictly be text-only.

### URL Content
- Users enter URLs that are encoded into QR codes.
- **Rule:** Do NOT render user-entered URLs as clickable `<a>` links in the UI without strict validation.
- If displaying a URL in the history list, display it as plain text, not as an active link.
- `javascript:` URLs should be aggressively rejected during form validation.

### QR Payload Injection
- Could a malicious user craft QR content that exploits the application itself? No. The content is simply encoded as a string payload into the QR image.
- The QR payload is consumed by the *scanner device*, not by Qraft itself.
- *Recommendation:* Provide a warning to users if they are generating QR codes with suspicious content (e.g., `javascript:` URLs) to protect the end-users scanning the codes.

## Local Storage Security

- `IndexedDB` data is origin-scoped governed by the browser's Same-Origin Policy.
- Data persists until the user explicitly clears it from the app or clears their browser data.
- **Data is NOT encrypted at rest** (this is a fundamental browser API limitation).
- Wi-Fi passwords stored in history reside in plaintext within `IndexedDB`.

**Recommendations for Implementation:**
*   Document clearly (e.g., in an About/Privacy page) that history contains unencrypted local data.
*   Provide an easily accessible **"Clear All History"** function.
*   *Design Consideration:* Exclude Wi-Fi passwords from history payloads. Store the SSID and authentication type, but drop the password. Alternatively, prompt the user with a checkbox: *"Include password in history?"*

## Downloaded Filenames

- Export filenames are generated procedurally by Qraft, not controlled directly by the user.
- Format: `qraft-{type}-{timestamp}.{ext}`
- Because there is no user content embedded in the filenames, path traversal or injection risks during file saving are prevented.
- If user-derived filename components are ever introduced, they must be strictly sanitized.

## Clipboard API

- The modern Clipboard API requires a secure context (HTTPS or localhost).
- Qraft uses a write-only operation (we do not read from the user's clipboard).
- The QR image is written as a PNG `Blob`.
- No sensitive data is exposed via the clipboard beyond what the user explicitly chooses to copy.

## Content Security Policy (CSP)

For production deployment, the following CSP headers are recommended to enforce strict resource loading:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
```

**Notes on CSP Rules:**
- `'unsafe-inline'` for `style-src`: Required if using CSS-in-JS libraries or generating inline styles from the `qr-code-styling` canvas.
- `data:` and `blob:` for `img-src`: Necessary for rendering logo data URLs and the QR code preview itself.
- `object-src 'none'`: Prevents legacy Flash or plugin embedding vectors.
- `eval` is strictly forbidden and unneeded.

## Third-Party Dependencies

- Dependencies must be regularly audited for known vulnerabilities using `npm audit`.
- **`qr-code-styling`**: Pure computation, no network calls.
- **`idb-keyval`**: Pure local storage, no network calls.
- **`zustand`**: Pure state management, no network calls.
- **`zod`**: Pure validation logic, no network calls.
- All core dependencies are computation-only. The application performs no external API calls.

## Future Backend Boundaries (V2)

Qraft V1 establishes a secure client-side baseline. Future iterations (V2) will introduce backend features like a URL shortener and Pastebin functionality. 

> [!CAUTION]
> Integrating a backend fundamentally changes the security profile.

- V2 features **WILL** make network calls.
- V2 must use HTTPS exclusively.
- V2 API calls must strictly validate all server responses to prevent spoofing or injection.
- V2 must not expose any other user QR data to third-party endpoints without explicit consent.
- The V1 architecture must not accidentally create or adopt patterns that implicitly assume network safety once a backend is introduced.
