# QRaft

QRaft is a privacy-first QR code generator and design tool engineered for precise control over both QR content and visual presentation.

Built entirely as a local-first application, QRaft allows users to create structured payloads, customize visual components, and export high-fidelity matrices without relying on external servers. The platform continuously analyzes designs using a heuristic reliability engine, providing targeted recommendations and automatic perceptual color corrections to ensure maximum scanability.

Everything required for generation and customization runs locally in the browser. QR payloads are not sent to a backend, and the application does not use analytics or tracking.

---
<img width="1103" height="940" alt="image" src="https://github.com/user-attachments/assets/a54e43f4-c2bf-444c-945e-9871020a0296" />

---

<div>
  <img src="https://github.com/user-attachments/assets/9b61156c-c447-4322-a951-2bba6d474aab" height="500" />
  <img src="https://github.com/user-attachments/assets/758102d3-93cb-4512-b7f8-45b1e0b0a41e" height="500" />
  <img src="https://github.com/user-attachments/assets/0513dc16-6e0e-4ccf-8cc9-f734ba8ff1a7" height="500" />
</div>

---

## Core Philosophy

- Privacy: Payloads are processed locally without requiring an account or server transmission.
- Control: Every major visual component can be configured independently.
- Reliability: Customization should not compromise scanability. QRaft actively evaluates and autocorrects potential issues.
- Reversibility: Experiment freely with persistent history, presets, randomized designs, and full undo/redo capabilities.
- Precision: Structured payloads, capacity handling, and scalable exports are treated as first-class features.

## Core Capabilities

### Supported Content Types
QRaft provides dedicated structured forms and encoders for common QR use cases, each featuring strict validation rather than relying on generic text fields:

- URL: Encode websites and web applications with URL-specific validation.
- Text: Encode arbitrary plain text.
- Email: Create mailto payloads with recipient, subject, body, CC, and BCC fields.
- Phone: Encode telephone numbers with international number validation and normalization.
- SMS: Create pre-filled SMS payloads with phone numbers and messages.
- WhatsApp: Generate WhatsApp links containing phone numbers and pre-filled messages.
- Contact: Generate structured vCard payloads containing names, organizations, job titles, contact information, addresses, websites, and notes.
- Wi-Fi: Generate Wi-Fi configuration payloads supporting WPA, WEP, open networks, passwords, SSIDs, and hidden networks.
- UPI: Generate UPI payment payloads with payee address, payee name, amount, currency, transaction notes, and payment constraints.

### Advanced Styling Engine
QRaft exposes the visual components of a QR code as independently configurable elements.

Modules:
- Supported Shapes: Square, Dots, Rounded, Classy, Classy Rounded, Extra Rounded.
- Coloration: Independent module colors, solid fills, linear gradients, and radial gradients.
- Configuration: Adjustable gradient color stops and rotation angles.

Finder Patterns:
- Frames and centers can be styled independently.
- Frame Shapes: Square, Dot, Extra Rounded, Dots, Rounded, Classy, Classy Rounded.
- Center Shapes: Square, Dot.
- Coloration: Both components support independent colors and gradient styling.

Background and Quiet Zone:
- Backgrounds support solid colors, transparency, linear gradients, radial gradients, and configurable rounding.
- Dedicated margin controls allow independent sizing of the clear space surrounding the matrix.

Logo Composition:
- PNG, JPEG, and SVG support.
- Adjustable size, margin, and opacity.
- Configurable logo background plates (Circle, Rounded-Square, Square) with independent padding and color.
- Optional module excavation beneath the logo.

Frames and Typography:
- Supported Frames: Simple, Rounded, Badge, Banner, Ticket.
- Border and background colors, border width, radius, and padding are fully configurable.
- Call-to-action text (e.g., "SCAN ME") supports custom typography, weights, sizing, tracking, and alignment.

## Reliability and Engineering

### Scan Reliability Analysis
QRaft includes a heuristic reliability engine that continuously evaluates the current QR configuration in real-time. The analyzer checks foreground/background contrast, finder-pattern contrast, quiet-zone size, error-correction level, logo size, module geometry, output dimensions, gradient contrast, and payload density.

### Advanced Contrast Autofix Engine
When the reliability analyzer detects scanability risks (such as poor contrast), QRaft provides an automatic issue-fixing system. 
- Perceptual Color Spaces: The fixing engine operates in the Oklch color space to ensure mathematically accurate perceptual contrast adjustments, guaranteeing WCAG 2.1 AAA compliance (ratio > 4.6).
- Multi-Phase Solvers: The engine attempts to preserve the user's design intent by utilizing multi-phase solvers (adjusting foregrounds, then backgrounds, then applying ripple effects).
- Interactive Diagnostics: The UI displays clear, deduplicated diagnostic panels showcasing exact contrast shifts before and after the fix, mapped to intuitive grid layouts.

### Error Correction and Capacity Handling
QRaft supports all standard QR error-correction levels (L, M, Q, H). The application actively evaluates payload capacity when determining viable correction levels. This prevents the selection of configurations that cannot accommodate the encoded payload. Error correction is also dynamically re-evaluated when customizing modules, finder patterns, and logos.

### Performance and Architecture
QRaft is built for speed and responsiveness, utilizing aggressive code-splitting and isolated chunking strategies.
- Lazy Loading: Heavy dependencies (like international phone number parsers) are isolated into independent chunks and lazy-loaded only when requested by the user, drastically reducing initial payload sizes.
- Real-Time Compositing: The responsive preview is derived directly from the active configuration and updates immediately as content or styling changes, without requiring manual regeneration steps.

## Workflow and UX

### Preset Library
QRaft includes a beautifully designed, horizontally scrolling preset library categorized into Messaging, Social, Developer, and Music templates. Presets apply non-destructively, meaning they intelligently adapt to the chosen application theme (Light/Dark mode) while leaving the actual QR payload content entirely separate and untouched.

### History and State Management
- Undo/Redo: Maintains a temporal configuration history for non-destructive editing, fully accessible via keyboard shortcuts.
- Persistent History: Exported and copied configurations are stored in IndexedDB. Previous designs can be restored, edited, labeled, and deleted across browser sessions.
- Input Validation: Content validation distinguishes between errors and warnings, surfacing issues natively as the payload data changes.

### Export Pipeline
Generated matrices can be exported as PNG, JPEG, WEBP, or SVG formats. SVG exports are generated natively from the configuration and fully support QRaft's frame and call-to-action composition. Outputs can also be copied directly to the clipboard.

## Technology Stack

Core Frameworks:
- React
- TypeScript
- Vite

State and Persistence:
- Zustand (Global State)
- Zundo (Temporal History)
- IndexedDB via idb-keyval

Data and Parsing:
- qr-code-styling (Core Matrix Generation)
- Zod (Schema Validation)
- libphonenumber-js (International Phone Validation)

Interface:
- Lucide React
- CSS Modules
- Custom CSS variable-based design system

Tooling:
- Vitest, React Testing Library, Playwright, Oxlint, Prettier

## Why QRaft?
QRaft was built around the principle that generating a QR code is not merely producing a matrix. A QR code can contain complex structured data, require a carefully constructed visual identity, introduce scanability risks, and demand multiple iterations before production.

QRaft unifies these requirements. Create the payload, shape the visual identity, inspect the raw encoded string, experiment freely via presets, analyze the matrix for reliability, automatically correct perceptual contrast issues, and export the finished graphic — all within a highly optimized, completely local environment.
