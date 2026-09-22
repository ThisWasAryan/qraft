# Qraft Testing Strategy

A practical, pragmatic testing strategy for the Qraft QR code generator. As a small-to-medium frontend application, our focus is on high confidence in core domain logic (encoders, validators, reliability checks) and critical user flows, without overengineering UI tests.

## Testing Stack

- **Unit/Component Tests**: Vitest + React Testing Library
- **End-to-End (E2E) Tests**: Playwright
- **Code Coverage**: V8 engine via Vitest

## Directory Structure

Tests are co-located with their implementation files for unit/component tests, while E2E tests live in a dedicated top-level directory.

```text
src/
├── domain/
│   ├── encoders/
│   │   ├── url.ts
│   │   └── __tests__/
│   │       └── url.test.ts
│   ├── validators/
│   │   ├── url.ts
│   │   └── __tests__/
│   │       └── url.test.ts
│   └── reliability/
│       ├── contrast.ts
│       └── __tests__/
│           └── contrast.test.ts
│
├── features/
│   ├── generator/
│   │   └── components/
│   │       ├── URLForm.tsx
│   │       └── __tests__/
│   │           └── URLForm.test.tsx
│
e2e/
├── generate-url.spec.ts
├── generate-text.spec.ts
├── generate-email.spec.ts
├── generate-phone.spec.ts
├── generate-wifi.spec.ts
├── customize.spec.ts
├── export.spec.ts
├── history.spec.ts
├── responsive.spec.ts
└── accessibility.spec.ts
```

## Unit Tests (Vitest)

Pure functions in the `domain/` directory are the highest priority. They represent the core business logic, have no dependencies on the DOM, and are the easiest and fastest to test.

### Encoders

For each content encoder (`url`, `text`, `email`, `phone`, `wifi`), verify:
- Correct payload formatting according to QR specifications.
- Special character escaping (crucial for formats like MECARD/WIFI).
- Edge cases (empty strings, unicode, very long input).
- **Wi-Fi**: all auth types (`WEP`, `WPA`, `nopass`), hidden networks, special characters in SSID/password.
- **Email**: combinations of subject, body, cc, bcc.
- **Phone**: various international and local formats.

> [!TIP]
> **Example Tests:**
> ```typescript
> describe('encodeURL', () => {
>   it('passes through well-formed URLs', () => {
>     expect(encodeURL({ type: 'url', url: 'https://example.com' }))
>       .toBe('https://example.com');
>   });
>   
>   it('preserves query parameters', () => {
>     expect(encodeURL({ type: 'url', url: 'https://example.com?q=hello world' }))
>       .toBe('https://example.com?q=hello world');
>   });
> });
> 
> describe('encodeWiFi', () => {
>   it('escapes semicolons in password', () => {
>     expect(encodeWiFi({ type: 'wifi', ssid: 'Net', password: 'pass;word', authType: 'WPA', hidden: false }))
>       .toBe('WIFI:T:WPA;S:Net;P:pass\\;word;;');
>   });
>   
>   it('handles nopass auth type', () => {
>     expect(encodeWiFi({ type: 'wifi', ssid: 'OpenNet', password: '', authType: 'nopass', hidden: false }))
>       .toBe('WIFI:T:nopass;S:OpenNet;;;');
>   });
> });
> ```

### Validators

For each input validator, ensure:
- Valid inputs pass successfully.
- Invalid inputs produce the correct, user-friendly error messages.
- Edge cases are handled properly without throwing unhandled exceptions.
- Warning-level issues are detected (e.g., syntactically valid but excessively long URLs).

### Reliability Analysis

- **Contrast:** Accurate calculation of foreground vs. background contrast ratios.
- **Threshold Boundaries:** Testing exact boundary values (e.g., when a warning turns into an error).
- **Logos:** Proper logo size calculations relative to the overall matrix.
- **Scoring:** Overall reliability score determination.
- **Combined Rules:** Ensuring multiple warnings and errors combine correctly without duplication.

### Presets and Serialization

- **Presets:** All built-in presets are valid `QRPreset` objects; applying a preset merges correctly with existing styles without leaving unexpected `undefined` values.
- **Serialization:** Ensure `QRConfig` can round-trip through JSON correctly. Test history migration functions and graceful handling of corrupted `localStorage` data.

## Component Tests (Vitest + RTL)

Test UI components for correct rendering and user interaction, but avoid testing implementation details.

### Content Forms (URL, Text, Email, Phone, WiFi)
- Renders the correct input fields for the content type.
- Accepts and registers user input correctly.
- Shows validation errors on invalid input.
- Does *not* show errors before a field is touched (onBlur/onChange).
- Calls `onChange` with the appropriately structured content payload.

### Style Controls
- Color pickers update the style configuration store.
- Sliders correctly update numerical values.
- Preset selectors apply the expected style properties.
- Error correction level selectors work and update state.

### QR Preview
- Renders a valid QR code when the config is complete and valid.
- Shows an empty/placeholder state when no content is provided.
- Shows a loading state during generation, if applicable.

### History Panel & Reliability Indicator
- **History:** Renders items, shows empty states, handles delete actions, restores configuration on click, and clears all items with confirmation.
- **Reliability:** Shows the correct severity badge (Good, Warning, Error), expands to show detail items, and renders correct checkmarks/warning icons based on the analysis state.

## E2E Tests (Playwright)

End-to-End tests verify that the major user flows work completely from a user's perspective, running in a real browser.

### Content Generation Flows
- `generate-url.spec.ts`: Enter URL → QR appears; Clear URL → empty state; Invalid URL → error, no QR; Long URL → warning, but QR generated.
- `generate-text.spec.ts`: Enter text → QR appears; multiline works; unicode/emoji renders properly.
- `generate-email.spec.ts`: Enter email → QR appears; adding subject/body updates QR; invalid email blocks generation.
- `generate-phone.spec.ts`: Validates formatting and generation for phone numbers.
- `generate-wifi.spec.ts`: Enter SSID/password → QR appears; switching to `nopass` hides password field and updates QR.

### Core App Features
- `customize.spec.ts`: Change foreground color → QR updates; Apply preset → UI and QR updates; Manual modification after preset works; Changing EC level updates the reliability score.
- `export.spec.ts`: Test downloading PNG, downloading SVG, and copying to clipboard (success toast).
- `history.spec.ts`: Generating a QR adds to history; Clicking history item restores config; Deleting an item removes it; Clear all removes everything after confirming; Reloading the page persists history.

### Layout & Accessibility
- `responsive.spec.ts`: Desktop viewport uses 3-column layout; Mobile viewport uses single column with QR on top; Tab/Bottom navigation works on mobile.
- `accessibility.spec.ts`: Axe audit ensures form fields have labels; Verify keyboard tab navigation works through the entire app; Color contrast passes standard Lighthouse checks.

## Edge Case Scenarios

Ensure the following tricky scenarios are explicitly tested:
- Wi-Fi SSID with semicolons, backslashes, and colons.
- Email with plus addressing (`user+tag@example.com`).
- Phone number with only digits vs formatted (e.g., `1234567890` vs `+1 (234) 567-890`).
- URLs that are just a protocol (`https://`).
- Restoring an empty or malformed history state.
- Dealing with corrupted `localStorage` gracefully on load.
- Very rapid input changes (verifying debounce/throttling works without dropping the final state).

## Coverage Targets

We use coverage as a tool to spot missing critical tests, not as a strict vanity metric.
- **Domain Logic:** `> 90%` (Core algorithms must be robust).
- **Components:** `> 70%` (Focus on interactions, not styling).
- **Overall:** `> 75%`.
- **E2E:** Must cover all primary user flows successfully.

## CI Integration

These commands should be run in the continuous integration (CI) pipeline on every Pull Request:

```bash
# Type checking
npx tsc --noEmit

# Linting
npx eslint src/

# Unit + Component tests with Coverage
npx vitest run --coverage

# E2E tests
npx playwright test
```
