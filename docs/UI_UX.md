# Qraft - UI/UX Design Document

This document outlines the user interface and user experience design for Qraft, a browser-based QR code generator.

## Design Philosophy
- **Technical, premium, minimal, modern, developer-oriented**
- **Clean and functional** — not flashy or dashboard-like
- **Every UI element serves a purpose**
- **Efficient use of space**
- **Information density without clutter**

## Responsive Layouts

### Desktop Layout (>= 1024px)
A 3-column layout separating input, customization, and preview. The header includes history, theme, undo/redo, and a randomize button.

```text
┌──────────────────────────────────────────────────────────────┐
│  [Logo] Qraft   [↩][↪] [Shuffle] [History] [Theme]  │
├─────────────────┬────────────────────────┬───────────────────┤
│                 │                        │                   │
│  INPUT PANEL    │    CUSTOMIZATION       │   PREVIEW PANEL   │
│                 │    (scrollable)        │   (sticky)        │
│ [URL|Text|...]  │                        │  ┌─────────────┐ │
│                 │  ▼ Presets             │  │ ┌─────────┐ │ │
│ ┌───────────┐   │  [preset1][preset2]... │  │ │ Frame   │ │ │
│ │ Content   │   │                        │  │ │ ┌─────┐ │ │ │
│ │ Form      │   │  ▼ Pattern             │  │ │ │ QR  │ │ │ │
│ │ (per type)│   │  [■][●][◤][◣]...     │  │ │ └─────┘ │ │ │
│ └───────────┘   │                        │  │ │ CTA    │ │ │
│                 │  ▶ Eyes                │  │ └─────────┘ │ │
│                 │  ▶ Colors              │  └─────────────┘ │
│                 │  ▶ Gradient            │                   │
│                 │  ▶ Size & Layout       │  Reliability      │
│                 │  ▶ Logo                │  [✓ Good]         │
│                 │  ▶ Frame & CTA         │                   │
│                 │                        │  [PNG][SVG][Copy] │
└─────────────────┴────────────────────────┴───────────────────┘
```
- **Left:** Input panel (content type tabs + form)
- **Center:** Customization panel (presets + style controls). Taller, scrollable, with accordion sections.
- **Right:** Preview panel (sticky, QR preview with frame + reliability + export)
- *Note:* History opens as a side panel/drawer from the right edge.

### Tablet Layout (768px - 1023px)
- **2-column layout:** Left (input + customization combined, scrollable) | Right (preview + export, sticky)
- History functions as a side drawer.

### Mobile Layout (< 768px)
A single-column stacked layout prioritizing the QR preview.

```text
┌────────────────────┐
│ [Logo] [↩][↪][🎲][☰] │
├────────────────────┤
│  ┌──────────────┐  │
│  │  QR + Frame  │  │
│  └──────────────┘  │
│  [PNG] [SVG] [Copy]│
│  Reliability       │
├────────────────────┤
│ [URL|Text|Email...]│
│ Content Form       │
├────────────────────┤
│ Presets [scroll]   │
├────────────────────┤
│ ▶ Pattern          │
│ ▶ Eyes             │
│ ▶ Colors           │
│ ▶ Size & Layout    │
│ ▶ Logo             │
│ ▶ Frame & CTA      │
└────────────────────┘
```
Key mobile differences:
- QR preview is at the **TOP (sticky)**.
- Export buttons and Reliability are immediately below the preview.
- Content type tabs scroll horizontally.
- Customization uses collapsible accordions. Presets are always visible at the top.
- History is a full-screen overlay/drawer accessible via hamburger menu.

---

## Component Breakdown

### Header
- **Logo:** Qraft branding — left.
- **Undo/Redo:** `[↩]` (undo) and `[↪]` (redo) icon buttons. Disabled when no history in that direction. Tooltips: 'Undo (Ctrl+Z)' / 'Redo (Ctrl+Shift+Z)'.
- **Shuffle/Randomize:** `[🎲]` icon button. Applies a random curated palette and shuffles on subsequent clicks.
- **History Toggle:** Button.
- **Theme Toggle:** Sun/moon icon.
- **Mobile:** Includes hamburger menu `[☰]` for history/options.

### Content Type Selector
- **Tab-style selector:** URL | Text | Email | Phone | Wi-Fi.
- Each tab features an icon (Lucide: Link, Type, Mail, Phone, Wifi).
- Active tab is highlighted with an accent color.
- **Desktop:** Horizontal tabs.
- **Mobile:** Horizontal scrolling pill buttons.

### Content Forms
Each content type utilizes a specific form structure with inline validation errors below fields:
- **URL Form:** Single input field with URL placeholder.
- **Text Form:** Textarea with character count.
- **Email Form:** To, Subject, Body, CC, BCC fields.
- **Phone Form:** Phone number input with country code hint.
- **Wi-Fi Form:** SSID, Password, Auth type dropdown, Hidden checkbox.

### Style Panel (Customization)
Organized into labeled sections (Advanced sections start collapsed to prevent overwhelming users):
1. **Presets:** Always visible at top. Horizontal scrollable grid with mini previews.
2. **Pattern:** Visual grid of 6 dot shapes (square, rounded, dots, classy, classy-rounded, extra-rounded). Each shown as a small 3x3 grid preview. Active shape highlighted with accent border. Tooltip shows shape name.
3. **Eyes:**
   - Corner frame shape picker (7 options). Visual previews of corner square shapes.
   - Corner pupil shape picker (2 options: square, dot). Visual previews of corner dot shapes.
   - Independent color pickers for frame and pupil.
   - Shows a composite eye preview.
4. **Colors:**
   - Dot/module color picker.
   - Background color picker.
   - Toggle for solid / gradient mode (replaces solid color with gradient config).
5. **Gradient:** (when enabled)
   - Type: Linear | Radial (segmented control).
   - Angle/Rotation: Circular dial or slider (0-360° for linear, hidden for radial).
   - Color stops: Visual bar with draggable stops. Min 2 stops, can add up to 5. Each stop has a color picker and position input.
   - Apply to: Dots | Background (tabs or toggles).
6. **Size & Layout:**
   - Width slider (200-1000px).
   - Margin/quiet zone slider (0-80px).
   - Error correction segmented control (L|M|Q|H).
7. **Logo:**
   - Upload area (drag & drop + click).
   - Once uploaded: Size slider (5-40%), Margin slider (0-20px), Hide background dots toggle, Opacity slider (50-100%), Remove logo button.
   - Plate subsection: Enable plate toggle. Shape picker (circle, rounded-square, square), Plate color picker, Plate padding slider.
8. **Frame & CTA:**
   - Frame style visual picker: none | simple | rounded | badge | banner | ticket.
   - When frame selected: Frame color picker, Background color picker, Border width slider (0-4px), Border radius slider (0-24px), Padding slider (8-40px).
   - CTA Text subsection: Text input (placeholder: 'SCAN ME'), Position (top | bottom), Font picker (Inter | JetBrains Mono | system), Weight slider (regular | medium | semibold | bold), Size slider, Letter spacing slider, Color picker, Alignment (left | center | right).

### QR Preview
- Shows the QR code and the Frame (if enabled).
- Centered on a subtle checkerboard or solid background.
- Background indicates transparency vs. actual background color.
- Subtle transition on QR updates (fade or morph).
- Shuffle action applies a subtle animation on the QR preview.
- **Empty state:** Ghost QR outline with 'Enter content to generate'.
- **Error state:** Previous QR with overlay message.
- **Loading state:** Subtle pulse animation.

### Reliability Indicator
- Compact display located below or beside the preview.
- Traffic light icon (green/yellow/red circle) with label.
- Expandable to show detailed checks list.
- Each check shows ✓/⚠/✖ with label and detail.

### Export Actions
- 3 primary buttons: `Download PNG` | `Download SVG` | `Copy`.
- PNG button includes a dropdown for resolution selection.
- Copy button displays a success/error toast.
- Buttons are in a disabled state when no QR is generated.

### History Panel
- Side panel (desktop) or full-screen drawer (mobile).
- Displays a list of history items.
- **Item layout:** Type icon, label, relative time, delete button.
- Clicking an item restores the settings/content.
- 'Clear all' button at the bottom.
- **Empty state:** 'No history yet'.

---

## Empty States

| Context | Message |
| --- | --- |
| No content entered | 'Enter a URL, text, or other content to generate a QR code' |
| No history | 'No history yet. Generated QR codes will appear here.' |
| Clipboard unavailable | 'Clipboard requires HTTPS. Try downloading instead.' |

## Error States

| Context | Behavior |
| --- | --- |
| Invalid input | Inline error below field, red border |
| QR generation failure | Toast notification, keep previous preview |
| Storage failure | Console warning, app continues normally |
| Export failure | Toast with error message |

---

## Transitions & Animations
- **QR preview:** Fade transition on update (150ms).
- **Panel open/close:** Slide + fade (200ms).
- **Tab switch:** Content cross-fade (150ms).
- **Button hover:** Subtle scale (1.02) + color shift.
- **Toast:** Slide in from top, auto-dismiss after 3s.
- **History item:** Slide-in stagger on load.
- **Accessibility:** Respect `prefers-reduced-motion` media query by disabling all non-essential animations.
