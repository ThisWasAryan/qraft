# QRaft

QRaft is a privacy-first QR code generator and designer built for precise control over both QR content and visual presentation.

Create QR codes for URLs, text, email, phone numbers, SMS, WhatsApp, contacts, Wi-Fi networks, and UPI payments, then customize their modules, finder patterns, colors, gradients, logos, frames, typography, margins, and error correction. QRaft also continuously analyzes designs for potential scanability issues and provides targeted recommendations and automatic fixes.

Everything required for QR generation and customization runs locally in the browser. QR payloads are not sent to a QRaft server, and the application does not use analytics or tracking.

## Core Philosophy

- **Privacy:** QR payloads are processed locally without requiring an account or sending content to a QRaft backend.
- **Control:** Every major visual component of the QR code can be configured independently.
- **Reliability:** Customization should not come at the cost of scanability. QRaft continuously evaluates potential reliability issues.
- **Reversibility:** Experiment freely with undo, redo, persistent history, presets, and randomized designs.
- **Precision:** Structured payloads, validation, capacity handling, and export controls are treated as first-class features.

## Features

### Supported Content Types

QRaft provides dedicated structured forms and encoders for common QR use cases:

- **URL:** Encode websites and web applications with URL-specific validation.
- **Text:** Encode arbitrary plain text.
- **Email:** Create `mailto:` payloads with recipient, subject, body, CC, and BCC fields.
- **Phone:** Encode telephone numbers with international number validation and normalization.
- **SMS:** Create pre-filled SMS payloads with phone numbers and messages.
- **WhatsApp:** Generate WhatsApp links containing phone numbers and pre-filled messages.
- **Contact:** Generate structured vCard payloads containing names, organizations, job titles, contact information, addresses, websites, and notes.
- **Wi-Fi:** Generate Wi-Fi configuration payloads supporting WPA, WEP, open networks, passwords, SSIDs, and hidden networks.
- **UPI:** Generate UPI payment payloads with payee address, payee name, amount, currency, transaction notes, and fixed or variable payment amounts.

Each payload type has content-specific validation rather than relying on a generic text field.

### Advanced QR Styling

QRaft exposes the visual components of a QR code as independently configurable elements.

#### Modules

- Square
- Dots
- Rounded
- Classy
- Classy Rounded
- Extra Rounded
- Independent module colors
- Solid colors
- Linear gradients
- Radial gradients
- Configurable gradient color stops
- Configurable linear-gradient rotation

#### Finder Patterns

Finder-pattern frames and centers can be styled independently.

**Frame shapes:**

- Square
- Dot
- Extra Rounded
- Dots
- Rounded
- Classy
- Classy Rounded

**Center shapes:**

- Square
- Dot

Both components support independent colors and gradient styling.

#### Background

- Solid colors
- Transparent backgrounds
- Linear gradients
- Radial gradients
- Configurable background rounding

#### Quiet Zone

The QR margin can be configured independently, allowing control over the clear space surrounding the QR symbol.

### Logo Support

QRaft supports placing custom images inside the QR code.

- PNG, JPEG, and SVG logo support
- Adjustable logo size
- Adjustable logo margin
- Adjustable logo opacity
- Optional module excavation beneath the logo
- Optional logo background plate
- Circle, rounded-square, and square logo plates
- Independent plate color
- Configurable plate padding
- Dedicated logo style reset control

Logo configuration is incorporated into the reliability analysis and error-correction logic.

### Frames and Call-to-Action Text

QR codes can be wrapped in custom presentation frames without altering the underlying payload.

Supported frame styles:

- None
- Simple
- Rounded
- Badge
- Banner
- Ticket

Frame configuration includes:

- Border color
- Background color
- Border width
- Border radius
- Padding

Frames can optionally include call-to-action text such as `SCAN ME`, `VIEW MENU`, or `PAY HERE`.

CTA controls include:

- Text
- Top or bottom positioning
- Font family
- Font weight
- Font size
- Letter spacing
- Text color
- Left, center, or right alignment

### Error Correction and Capacity

QRaft supports all standard QR error-correction levels:

- **L**
- **M**
- **Q**
- **H**

The application evaluates payload capacity when determining which correction levels are viable for the current content.

This prevents users from selecting correction configurations that cannot accommodate the encoded payload.

Error correction is also considered when evaluating customized modules, finder patterns, and logos.

### Scan Reliability Analysis

QRaft includes a heuristic reliability engine that continuously evaluates the current QR configuration.

The analyzer checks:

- Foreground/background contrast
- Finder-pattern contrast
- Quiet-zone size
- Error-correction level
- Logo size
- Module shape
- Finder-pattern shape
- Output size
- Gradient contrast
- Payload density

Each check is classified as:

- Good
- Warning
- Danger

Individual checks provide contextual information and recommendations rather than presenting only a single opaque result.

The reliability analysis is heuristic and cannot guarantee successful scanning under every real-world condition such as poor lighting, damaged prints, camera limitations, reflections, or extreme physical sizes.

### Automatic Reliability Fixes

QRaft provides an automatic issue-fixing system designed to resolve reliability problems while preserving the existing design wherever practical.

Depending on the detected issues, the fixer can adjust:

- Foreground/background contrast
- Finder-pattern colors
- Quiet-zone margin
- Frame padding
- Error correction
- Logo size
- Module shape
- Finder-pattern shape
- Output dimensions

The fixing process uses a tiered approach rather than immediately replacing the entire design with a default configuration.

After changes are applied, the resulting configuration is analyzed again.

### Design Randomizer

QRaft includes a design randomizer backed by curated design palettes.

Randomization can modify combinations of:

- Module styling
- Pattern colors
- Finder-pattern styling
- Background colors
- Error-correction configuration

This allows users to explore different visual directions without manually configuring every property.

### Presets

QRaft includes built-in visual presets organized into categorized templates (Messaging, Social, Developer, Music). 

- **Visual Preset Browser**: A beautifully designed, horizontally scrolling preset library. Start your designs instantly by exploring available templates.
- **Adaptive Light/Dark Variants**: Presets intelligently adapt to your chosen application theme. Toggle between Light and Dark mode styles directly in the browser to instantly see how presets look with inverted high-contrast backgrounds and white-out SVG logos (like the dark-mode GitHub preset).
- **Non-Destructive Application**: Applying a preset changes the design configuration (colors, logos, geometry, and error-correction) while keeping your actual QR payload content entirely separate and untouched. It leaves you in complete control to customize it further.

### Payload Preview

The encoded QR payload can be inspected through an expandable payload viewer.

This allows users to verify the exact string being encoded rather than relying only on the visual QR representation.

The payload can also be copied directly to the clipboard.

### Undo and Redo

QRaft maintains temporal configuration history for non-destructive editing.

Users can move backward and forward through design changes using:

- Undo
- Redo
- `Ctrl + Z`
- `Ctrl + Shift + Z`

Keyboard handling is context-aware so editing shortcuts do not interfere with normal text input.

### Persistent History

Exported and copied QR configurations are stored in persistent browser storage.

History entries contain the QR configuration itself rather than only an exported image, allowing previous designs to be restored and edited again.

History supports:

- Loading previous configurations
- Automatic labels
- Timestamps
- Individual deletion
- Clearing all history
- Persistence across refreshes and browser sessions

History is backed by IndexedDB.

### Export

QRaft supports multiple export formats:

- PNG
- JPEG
- WEBP
- SVG

SVG exports are generated from the QR configuration and can include QRaft frame and CTA composition.

Generated QR images can also be copied directly to the clipboard.

Successful exports and clipboard operations are recorded in history.

### Input Validation

QRaft uses structured validation for its content forms.

Validation is performed continuously as payload data changes and distinguishes between errors and warnings.

Validation covers content-specific requirements such as:

- URL structure
- Email addresses
- Phone numbers
- Wi-Fi configuration
- UPI information
- Contact fields
- Payload length
- Payload capacity

### Theme System

QRaft supports:

- Light theme
- Dark theme
- System preference

Theme preferences are persisted locally and restored when the application is reopened.

### Toast Notifications

A lightweight notification system provides contextual feedback for actions such as:

- Successful exports
- Clipboard operations
- Validation failures
- Configuration changes
- Other application events

### Custom UI System

The interface uses reusable custom UI primitives including:

- Accordions
- Badges
- Buttons
- Cards
- Color pickers
- Dialogs
- Inputs
- Select controls
- Sliders
- Tooltips
- Loading states

The components share a centralized CSS-variable-based design system for consistent spacing, typography, surfaces, borders, colors, and interaction states.

### Responsive Preview

The QR preview is derived directly from the active configuration and updates as content or styling changes.

Changes to payload, colors, shapes, gradients, error correction, logos, frames, margins, and output size are reflected in the preview without requiring a separate manual generation step.

### Density Analysis

QRaft analyzes encoded payload size to identify dense QR configurations.

Large payloads can produce denser QR matrices with smaller individual modules, so the system surfaces density warnings and recommendations when appropriate.

### Performance

QRaft uses lazy loading and code splitting for heavier application areas.

Large UI sections such as the Style Panel and History Panel can be loaded independently, reducing the initial application payload while retaining the full editing experience.

## Privacy

QRaft follows a local-first architecture.

QR payloads are processed inside the browser rather than being submitted to a QRaft backend.

This is particularly important for payloads containing sensitive information such as:

- Wi-Fi passwords
- Contact information
- Phone numbers
- Email addresses
- Private text
- UPI payment information

No QRaft account is required, and the application does not include an analytics or tracking layer.

## Architecture

QRaft separates QR-specific domain logic from application state, rendering, persistence, and interface components.

```text
src/
├── components/
│   ├── Accordion/
│   ├── Badge/
│   ├── Button/
│   ├── Card/
│   ├── ColorPicker/
│   ├── Dialog/
│   ├── Input/
│   ├── Layout/
│   ├── Loading/
│   ├── Select/
│   ├── Slider/
│   └── ...
│
├── domain/
│   ├── encoders/
│   ├── presets/
│   ├── randomizer/
│   ├── reliability/
│   ├── validators/
│   └── types.ts
│
├── features/
│   └── generator/
│       ├── components/
│       │   ├── ContentForms/
│       │   ├── ExportPanel/
│       │   ├── HistoryPanel/
│       │   ├── PresetSelector/
│       │   ├── ReliabilityIndicator/
│       │   ├── StylePanel/
│       │   └── QRPreview.tsx
│       └── hooks/
│
├── lib/
│   ├── compositor.ts
│   ├── fontLoader.ts
│   ├── logoProcessor.ts
│   ├── qrCodeStyling.ts
│   └── storage.ts
│
├── pages/
├── stores/
├── styles/
└── utils/
```
The project is organized into focused layers that keep QR logic, application state, rendering, persistence, and interface concerns separate.

The domain layer handles QR-specific logic including payload encoding, validation, reliability analysis, presets, and design randomization.

The feature layer contains the generator workflow, editor components, previews, panels, and feature-specific hooks.

The library layer provides the underlying QR rendering, logo processing, composition, font handling, and browser storage utilities.

Application state is managed through dedicated stores for QR configuration, history, theme, and notifications, keeping transient UI state separate from persistent QR data.

## Technology

### Core

- React
- TypeScript
- Vite

### State & Persistence

- Zustand
- Zundo
- IndexedDB
- `idb-keyval`

### QR & Data

- `qr-code-styling`
- Zod
- `libphonenumber-js`

### Interface

- Lucide React
- CSS Modules
- Custom CSS variable design system

### Testing & Tooling

- Vitest
- React Testing Library
- Playwright
- Oxlint
- Prettier

## Documentation

QRaft includes an extensive documentation set covering both the product requirements and implementation details.

Documentation covers:

- Architecture
- Requirements
- Data model
- QR encoding
- Payload validation
- Scan reliability
- Automatic reliability fixes
- Export pipeline
- Persistent history
- Presets
- Design randomization
- Accessibility
- Performance
- Security
- Testing
- UI/UX
- Design system
- Implementation decisions

## Why QRaft?

QRaft is built around the idea that generating a QR code should not end with producing a matrix.

A QR code can contain structured data, have a carefully designed visual identity, introduce scanability risks, and require multiple iterations before it is ready to use.

QRaft brings those concerns into one workflow.

Create the payload, shape the design, inspect exactly what is being encoded, experiment freely, analyze the result for potential reliability issues, automatically correct problems when possible, and export the finished QR code — all while keeping the underlying data local to the browser.
