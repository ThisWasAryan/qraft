# Qraft V1 — Requirements

## Product Vision

Qraft is a polished, browser-based QR code generator and designer. It runs entirely in the browser with no backend. It is aimed at developers, designers, and technical users who want fast, customizable, reliable QR code generation with real-time preview.

---

## Functional Requirements

### MUST HAVE (V1 Core)

#### QR Content Types
- **URL**: Generate QR codes from URLs with protocol validation
- **Plain Text**: Generate QR codes from arbitrary text
- **Email**: Generate QR codes with `mailto:` scheme (to, subject, body)
- **Phone**: Generate QR codes with `tel:` scheme (international format)
- **Wi-Fi**: Generate QR codes with WIFI: scheme (SSID, password, auth type, hidden)

#### Real-Time QR Generation
- QR code preview updates in real-time as user types/modifies input
- Debounced generation (avoid regenerating on every keystroke)
- Visual feedback during generation

#### QR Customization
- **Size**: Control output dimensions (px)
- **Foreground color**: Custom foreground/module color
- **Background color**: Custom background color
- **Error correction**: Select L / M / Q / H levels
- **Margin/quiet zone**: Control quiet zone width (0–10 modules)

#### QR Pattern Customization
- Multiple data-module shapes: square, rounded, dots, classy, classy-rounded, extra-rounded
- Visual shape picker in UI
- Pattern-specific scan-safety checks

#### Finder Eye Customization
- Independent eye frame (corner square) shape: square, dot, extra-rounded, dots, rounded, classy, classy-rounded
- Independent eye pupil (corner dot) shape: square, dot
- Independent color for eye frame and eye pupil
- Independent gradient for eye frame and eye pupil
- All three finder patterns styled identically (library limitation)

#### Advanced Color System
- Dot/module color (solid or gradient)
- Eye frame color (independent from dots)
- Eye pupil color (independent from frame)
- Background color (solid or gradient)
- Gradient support: linear and radial
- Gradient direction/angle control
- Gradient color stops (2-5 stops)
- Transparent background support

#### Logo System
- Logo upload (PNG, JPEG, WebP, SVG→rasterized)
- Logo size (5-40% of QR area)
- Logo margin
- Hide background dots behind logo
- Logo opacity (50-100%)
- Logo background plate (circle, rounded-square, square)
- Plate color
- Plate padding
- Error-correction-aware logo sizing warnings

#### Frame System
- Multiple frame styles: none, simple, rounded, badge, banner, ticket
- Frame color and background color
- Border width and border radius
- Frame padding (maintains quiet zone)
- CTA text on frame

#### CTA Text
- Custom text (SCAN ME, SCAN TO VISIT, VIEW MENU, etc.)
- Position: top or bottom
- Font family: Inter, JetBrains Mono, system
- Font weight, size, letter spacing
- Color and alignment
- Must not interfere with QR quiet zone

#### Undo/Redo
- Undo/redo for ALL style changes
- Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
- Debounced for slider interactions
- ~50 history steps

#### Presets
- Built-in presets for common styles (Default, High Contrast, Minimal, Dark, etc.)
- Applying a preset sets customization values but does not lock them
- User can modify any value after applying a preset

#### Scan Reliability Analysis
- Heuristic-based analysis of current QR configuration
- Evaluate: contrast ratio, quiet zone, error correction level, size
- Display warnings with severity levels and suggested fixes
- Do NOT claim mathematical scan probability

#### Validation
- Per-type input validation with user-facing error messages
- Real-time validation feedback (not only on submit)
- Validation must not be unnecessarily restrictive

#### Export
- **PNG export**: Download QR code as PNG at configurable resolution
- **SVG export**: Download QR code as SVG (vector, scalable)
- **Clipboard**: Copy QR code image to clipboard

#### History
- Store generated QR configurations locally (not images)
- Persist history across page refreshes
- Display history list with metadata (type, content preview, timestamp)
- Reuse/restore a history item to regenerate the QR
- Delete individual history items
- Clear all history

#### Theme
- Light and dark theme support
- System preference detection
- Manual toggle
- Persist theme preference

#### Responsive Design
- Desktop-first design with full mobile support
- Mobile layout must be independently designed, not a scaled-down desktop
- Touch-friendly controls on mobile

#### Accessibility
- Keyboard navigable
- Screen reader compatible
- Proper semantic HTML and ARIA labels
- Sufficient color contrast in both themes
- Focus indicators
- Respect `prefers-reduced-motion`

#### Client-Only
- No backend, no server calls, no analytics, no tracking in V1
- All processing happens in the browser
- QR content never leaves the user's device

---

### SHOULD HAVE (V1 Enhanced)

#### Advanced Visual Customization (where reliable)
- Module/dot shape styling (square, rounded, dots, etc.)
- Finder pattern (eye) styling
- Logo/image embedding in QR center
- Gradient foreground (linear/radial)
- Corner radius control

> These features depend on library support and scan reliability. They should be included where the chosen QR library supports them reliably, but must not compromise core scan functionality.

#### Design Randomizer ("Surprise Me")
- Curated palette randomization
- Pre-validated for contrast and scannability
- Forced high error correction
- Fully editable after application

#### Background Options
- Solid background
- Gradient background
- Transparent background
- Rounded background corners

#### Scan Reliability — Advanced Factors
- Logo obstruction analysis
- Module styling impact warnings
- Gradient contrast warnings
- Finder pattern modification warnings

#### UX Polish
- Empty states with guidance
- Smooth transitions/animations
- Keyboard shortcuts for common actions (export, copy)
- Tooltip/help text for technical options (error correction levels, etc.)
- Loading/generating states

#### Performance
- Code splitting (lazy load history, settings)
- Efficient re-renders (memoize QR generation)
- Fast initial load (<2s on 3G)

---

### NICE TO HAVE (V1 Stretch) / V2

- Color picker with hex/RGB input
- QR code comparison (before/after preset)
- Batch generation
- QR template gallery
- Print-optimized view
- Share configuration via URL parameters
- PWA support (offline, installable)
- Undo/redo for configuration changes
- **Background Images**: Background image behind QR — too risky for V1 scan reliability (future enhancement)
- **Per-Eye Individual Styling**: Different styles per finder pattern — not supported by qr-code-styling (potential V2 feature if library adds support or we fork)

---

## Non-Functional Requirements

### Performance
- Initial page load: < 1.5s on fast 3G
- QR generation latency: < 100ms for typical payloads
- Smooth 60fps UI interactions
- Bundle size target: < 200KB gzipped (excluding QR library)

### Browser Support
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile Chrome and Safari (iOS 15+, Android 10+)

### Security
- No external network requests for QR generation
- Sanitize all user inputs rendered in DOM
- Safe SVG handling (no script execution)
- No sensitive data in localStorage without user awareness

### Privacy
- Zero telemetry in V1
- All data stays on device
- History stored locally only
- Clear data controls available to user

### Reliability
- Graceful degradation if browser APIs unavailable
- Clipboard API fallback behavior
- LocalStorage/IndexedDB error handling
- Invalid input produces clear errors, never crashes

---

## User Flows

### Primary Flow: Generate QR Code
```
1. User opens Qraft
2. Selects QR content type (URL default)
3. Enters content (e.g., URL)
4. QR code generates in real-time preview
5. (Optional) Adjusts customization
6. (Optional) Applies preset
7. Reviews scan reliability indicator
8. Exports as PNG/SVG or copies to clipboard
9. QR configuration saved to history automatically
```

### Secondary Flow: Restore from History
```
1. User opens history panel
2. Browses previous QR configurations
3. Selects one to restore
4. Configuration loads into generator
5. User can modify and re-export
```

### Settings Flow
```
1. User toggles theme (light/dark)
2. Theme persists across sessions
3. (Future: additional settings)
```

---

## Core Entities

| Entity | Description |
|---|---|
| QRContentType | Enum: url, text, email, phone, wifi |
| QRContent | Type-discriminated content payload |
| QRStyle | Visual configuration (colors, size, margin, module shape, frame, CTA, etc.) |
| QRConfig | Complete configuration = content + style + error correction |
| QRPreset | Named style configuration with metadata |
| QRHistoryItem | Timestamped QRConfig with ID and metadata |
| QRValidationResult | Per-field validation state |
| QRReliabilityReport | Heuristic scan analysis result |

---

## State Requirements

| State | Scope | Persistence |
|---|---|---|
| Active QR content type | Generator | Session |
| Active QR content data | Generator | Session |
| Active QR style | Generator | Session |
| Active frame state | Generator | Session |
| Active CTA state | Generator | Session |
| Selected preset | Generator | Session |
| Generated QR output | Generator | Transient |
| Validation state | Generator | Transient |
| Reliability report | Generator | Transient |
| History list | Global | LocalStorage/IDB |
| Undo/Redo stack | Generator | Session |
| Theme | Global | LocalStorage |
| UI state (panels, mobile menu) | UI | Transient |

---

## Technical Constraints

- V1 is entirely client-side (no Node.js server, no API calls)
- Must work offline once loaded (static assets only)
- QR generation must happen synchronously or near-synchronously in browser
- SVG export must produce valid, standalone SVG documents
- PNG export must handle high-resolution output (2x, 3x)
- Clipboard API requires secure context (HTTPS or localhost)
- File download requires creating and revoking object URLs

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| QR library doesn't support all customization features | Medium | Choose library with best feature coverage; gracefully hide unsupported options |
| Advanced styling makes QR unscannable | High | Scan reliability system warns users; conservative defaults |
| Logo embedding covers too much QR data | High | Warn when logo area exceeds ~15% of QR; require high error correction |
| Wi-Fi QR encoding edge cases (special chars) | Medium | Thorough testing; reference ZXing spec |
| Clipboard API not available in all browsers | Low | Feature detection; fallback to download |
| LocalStorage quota exceeded | Low | Limit history size; handle gracefully |
| QR generation blocks main thread | Medium | Debounce input; consider web worker for complex codes |

---

## V2 Extensibility Requirements

V1 architecture must accommodate future additions without major refactoring:

1. **New content types** (vCard, SMS, calendar) — content type system must be extensible
2. **URL shortener integration** — QR generation must accept any URL payload, including shortened URLs
3. **Pastebin integration** — QR generation must accept paste URLs
4. **Backend coexistence** — architecture must not assume client-only forever
5. **New routes** — router must support adding new pages (shortener UI, paste UI)
6. **Shared QR engine** — QR generation must be decoupled from input forms
7. **API consumption** — QR config model must be serializable for future API use
