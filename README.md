# QRaft

QRaft is a privacy-first, local-only, advanced QR code generator built with React and Vite. It provides an unlimited canvas for styling QR codes with complex gradients, custom logos, dynamic patterns, varied content types, and advanced reliability checks — executing entirely within your browser. 

No data is sent to external servers, and no tracking is involved.

## 🚀 Core Philosophy
- **Privacy-First Architecture:** 100% client-side generation. Your data never leaves your device.
- **Limitless Customization:** If you can imagine a QR style, you can build it.
- **Reliability:** Beautiful QR codes shouldn't sacrifice scanability. Real-time checks keep your codes functional.

## ✨ Expansive Feature List

### 📝 Supported Content Types (Payloads)
QRaft supports a vast array of specialized payloads to create highly functional QR codes.
- **URL**: Link directly to websites or web applications.
- **Text**: Standard plain text payloads.
- **Email**: Pre-fill email addresses, subjects, CCs, BCCs, and body text.
- **Phone**: Initiate phone calls immediately with normalized international number formatting.
- **Wi-Fi**: Automatically connect to Wi-Fi networks (WPA/WEP/nopass) including hidden networks.
- **SMS**: Pre-fill text messages to specific numbers.
- **WhatsApp**: Launch direct WhatsApp conversations with pre-filled messages.
- **vCard (Contact)**: Share comprehensive contact details including names, organization, job titles, multiple addresses, emails, phones, URLs, and custom notes.
- **UPI (Unified Payments Interface)**: Create direct payment links supporting payee address, payee name, transaction notes, and fixed currency amounts.

### 🎨 Advanced Styling Engine
QRaft includes a deeply customizable styling engine allowing pixel-perfect control over every element of the QR code.

#### Modules (Dots)
- **Shapes**: Choose from `square`, `dots`, `rounded`, `classy`, `classy-rounded`, or `extra-rounded`.
- **Colors**: Solid hex colors or complex gradients.
- **Gradients**: Linear (with custom rotation) and Radial gradients supported.

#### Eyes (Finder Patterns)
Separate styling for both the Eye Frame (Corner Square) and the Eye Pupil (Corner Dot).
- **Eye Frame Shapes**: `square`, `dot`, `extra-rounded`, `dots`, `rounded`, `classy`, `classy-rounded`.
- **Eye Pupil Shapes**: `square`, `dot`.
- **Independent Colors**: Frame and pupil can share colors or be customized independently with solid colors or gradients.

#### Backgrounds
- **Fill**: Solid colors, transparent backgrounds, or rich gradients.
- **Rounding**: Configurable border radius for smooth background edges.

#### Logos & Branding
- **Logo Upload**: Add your own brand logo to the center of the QR code.
- **Size & Margin**: Fine-tune the scale (up to 40% of the code) and the margin around the logo.
- **Background Plates**: Optional protective plates behind the logo (circle, rounded-square, square) with customizable padding and colors.
- **Excavation**: Toggle the visibility of QR modules hidden beneath the logo to improve aesthetics and scannability.
- **Opacity**: Adjust logo transparency.

#### Frames & Call To Action (CTA)
Wrap your QR code in beautiful custom frames to drive engagement.
- **Styles**: `none`, `simple`, `rounded`, `badge`, `banner`, or `ticket`.
- **Customization**: Independent control over frame color, background color, border width, border radius, and padding.
- **CTA Text**: Add dynamic text like "SCAN ME" or "VIEW MENU".
- **Typography**: Customize fonts (e.g., Inter, JetBrains Mono), font weights, font sizes, letter spacing, text color, and alignment (top/bottom, left/center/right).

### 🛠 Reliability & Error Correction
QRaft ensures that your highly customized codes remain perfectly scannable.
- **Dynamic Error Correction**: Adjust EC levels (L, M, Q, H) to compensate for logos or damage.
- **Smart Reliability Engine**: 
  - Real-time checks for contrast ratios between foreground and background.
  - Quiet zone (margin) validation.
  - Density checks ensuring the chosen EC level matches the payload capacity.
- **Tiered Auto-Fix**: A smart system that automatically resolves quiet-zone and contrast issues while preserving as much of your design intent as possible. Generates a "Scan Reliability Score" as you customize.

### 🎲 Generative Design & Presets
- **Design Randomizer**: Click the randomize button to let the engine mathematically generate vibrant, unique, and aesthetically pleasing design combinations on the fly.
- **Visual Preset Browser**: A beautifully designed, horizontally scrolling preset library. Start your designs instantly by choosing from categorized templates (Messaging, Social, Developer, Music). 
- **Adaptive Light/Dark Presets**: Presets intelligently adapt to your chosen style. Toggle between Light and Dark mode styles directly in the browser to instantly see how presets look with inverted high-contrast backgrounds and white-out logos (like the dark-mode GitHub preset).
- **Non-Destructive Application**: Applying a preset sets up your colors, logos, and geometry, but leaves you in complete control to customize it further.

### ⚡ Developer Experience & UI Nuances
- **Payload Preview**: An expandable UI panel that lets you inspect the exact raw string encoded into the QR matrix, complete with a one-click copy-to-clipboard button.
- **Keyboard Shortcuts**: Robust shortcut support with context-aware listeners (e.g., safely disabled when typing). Quickly `Ctrl+Z` to undo and `Ctrl+Shift+Z` to redo.
- **Strict Payload Validation**: Uses Zod schemas to rigorously validate all content forms in real-time, ensuring emails, phone numbers, and URLs are structurally correct before rendering.
- **Theme System**: Full support for Dark Mode, Light Mode, and System Preference synchronization dynamically saved and loaded without flashing.
- **Integrated Toast Notifications**: Non-intrusive feedback on user actions (successful exports, copied payloads, validation errors) powered by a lightweight global store.
- **Accessible Custom UI Components**: Built from the ground up with custom, highly accessible UI primitives: Accordions, Dialogs, Sliders, Color Pickers, Badges, and Tooltips, elegantly styled with CSS Modules and a global CSS variable system.

### ⏱ History & State Management
- **Time Travel**: Features a full undo/redo stack. You can freely experiment without fear of losing your previous design iterations.
- **Persistent History**: Your generated QR codes are automatically saved to your browser's local IndexedDB. You can view, reload, and manage your past creations across sessions.

### ⚡ Performance Optimization
- **Lazy Loading & Code Splitting**: Heavy UI components like the Style Panel and History Panel are lazy-loaded dynamically using React's `Suspense` and `lazy()`. This drastically reduces the initial JavaScript bundle size, ensuring blazing fast load times and a rapid first paint.

### 💾 High-Resolution Export
- **Formats**: Export your creations in SVG, PNG, or JPEG formats.
- **Quality**: Supports ultra-high-resolution exports suitable for both digital use and large-format physical printing.
