# Qraft Accessibility Guidelines

This document outlines the accessibility standards and implementation guidelines for the **Qraft** QR code generator. Our goal is to achieve strong **WCAG 2.1 AA compliance**, ensuring the application is usable by everyone, regardless of their abilities or the assistive technologies they use.

---

## Keyboard Navigation

All application features must be fully operable via a keyboard interface without requiring specific timings for individual keystrokes.

- **Focusability:** All interactive elements must be focusable and operable via keyboard.
- **Logical Order:** Tab order must follow a logical reading order (left-to-right, top-to-bottom).
- **Tab Sequence:** The expected tab flow should be: 
  `Content Type Tabs → Form Fields → Customization Controls → Export/Action Buttons`.
- **Keyboard Traps:** Ensure there are no keyboard traps. A user must always be able to navigate away from an element using standard keyboard navigation.
- **Key Bindings:**
  - `Escape`: Closes dialogs, dropdowns, and overlays.
  - `Enter` / `Space`: Activates buttons, links (Enter), and toggles.
  - `Arrow Keys`: Navigates within tab groups, sliders, and segmented controls.

## Focus States

Clear visible focus is crucial for keyboard users to know which element is currently active.

- **Indicator Design:** Custom focus indicator using a `2px` solid accent color with a `2px` offset.
- **Focus-Visible:** Apply focus rings only on keyboard navigation (not on mouse click) using the `:focus-visible` pseudo-class.
- **Contrast:** The focus ring must have sufficient contrast against all background variations (light/dark modes).
- **Modal Management:**
  - Dialogs must **trap focus** within the modal until it is explicitly closed.
  - On open, focus automatically moves to the first focusable element inside the dialog.
  - On close, focus returns to the trigger element that opened the dialog.

## Screen Readers

Proper context and announcements are necessary for screen reader users.

- **Forms:** All form inputs must have explicitly associated `<label>` elements.
- **Icon Buttons:** Icon-only buttons (e.g., theme toggles) must have descriptive `aria-label`s (e.g., `aria-label="Toggle dark mode"`).
- **QR Preview:** The generated QR code image must include a descriptive label: `aria-label="Generated QR code for [content summary]"`.
- **Tabs:** Content type tabs must implement standard tab roles: `role="tablist"`, `role="tab"`, and `role="tabpanel"`. Active tabs must have `aria-selected="true"`.
- **Validation:** 
  - Validation errors must use `aria-describedby` to link the input field to the error message element.
  - Invalid fields must include `aria-invalid="true"`.
- **Live Announcements:**
  - **Loading States:** Announced with `aria-live="polite"`.
  - **QR Generation:** Completion announced with `aria-live="polite"`.
  - **Exports:** Success/failure messages announced with `aria-live="assertive"`.
- **Lists:** History or saved QR lists must use native `<ul>` and `<li>` elements, or `role="listbox"`.
- **Reliability Indicator:** The QR scan reliability indicator must have a descriptive `aria-label` summarizing the current scannability status.

## Semantic HTML

Using native HTML elements correctly provides built-in accessibility and reduces reliance on ARIA.

- **Landmarks:** Use semantic landmarks: `<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`.
- **Headings:**
  - Use `<h1>` for the application title (strictly one per page).
  - Use `<h2>` for main section headings (e.g., Input, Customization, Preview, History).
- **Actions & Links:** 
  - Use `<button>` for actions (do not use `<div>` or `<span>` with click handlers).
  - Use `<a>` strictly for navigation/links to other URLs.
- **Forms & Inputs:**
  - Use `<fieldset>` and `<legend>` to group related form controls.
  - Use `<select>` for dropdowns where native behavior is sufficient.
  - Use `<input type="color">` for color pickers (can be visually hidden behind a custom UI overlay).
  - Use `<input type="range">` for customization sliders.
- **Modals:** Use the native `<dialog>` element for modal dialogs.

## ARIA Patterns

When native elements fall short, use standardized ARIA design patterns.

| Component | ARIA Attributes / Roles |
| :--- | :--- |
| **Tabs** | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| **Theme Toggle** | `role="switch"`, `aria-checked` |
| **Disclosure (Collapsible)** | `aria-expanded`, `aria-controls` |
| **Tooltip** | `role="tooltip"`, `aria-describedby` on the trigger element |
| **Toast / Notification** | `role="alert"`, `aria-live="assertive"` |
| **Slider** | `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` |
| **Combobox** | Full combobox pattern if custom dropdowns are required |

## Color & Contrast

Color should never be the sole method of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

- **Contrast Ratios (WCAG AA):**
  - Normal text (under 18px): **≥ 4.5:1**
  - Large text (18px+ or 14px+ bold): **≥ 3:1**
  - UI components and graphical objects: **≥ 3:1**
- **State Indicators:**
  - Error states must not rely solely on color (always pair with an icon and text).
  - Success, warning, and danger states must use an icon + text + color combination.
- **Theming:** The theme toggle must work correctly, and contrast ratios must be verified across both light and dark themes.
- **QR Customization:** When using color pickers for the QR code, the *Reliability Indicator* should warn the user if the selected foreground/background colors have poor contrast, affecting scannability.

## Motion & Animation

Animations must be respectful of user preferences to prevent triggering vestibular disorders.

- **Reduced Motion:** Always respect the `prefers-reduced-motion: reduce` media query.
- **Behavior:** When reduced motion is requested, disable transitions and use instant state changes.
- **Flashing:** No content should flash more than 3 times per second.
- **Decorative:** Animations should be purely decorative and not bear critical information.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Touch Targets

Ensure the application is highly usable on touch devices (tablets and mobile).

- **Minimum Size:** Minimum `44x44px` touch target size for all mobile interactive elements.
- **Spacing:** Maintain adequate spacing between touch targets (`≥ 8px`).
- **Interactive Areas:**
  - Color picker hit areas must be large enough for finger interaction.
  - Slider handles must be large enough to easily grab and drag on touch screens.

## Form Errors

Form validation feedback must be clear, associative, and immediately perceivable.

- **Placement:** Errors should be displayed inline, immediately below the invalid field.
- **Visuals:** Error text uses a danger color combined with a recognizable error icon. The field border should also change to the danger color.
- **Association:** The error message must be linked to the field via `aria-describedby`.
- **Announcements:** Errors must be announced to screen readers via an `aria-live` region.
- **Simplicity:** For Qraft's relatively simple forms, inline validation is sufficient (a top-level error summary is not strictly required).

## Images & Non-Text Content

Provide text alternatives for all non-text content.

- **QR Preview:** The main generated QR code must have an `aria-label` describing the content it holds.
- **Logo Uploads:** Logo upload mechanisms must use an accessible file input with a clearly associated label.
- **Icons:** 
  - **Decorative icons:** Use `aria-hidden="true"`.
  - **Informational icons:** Must have an `aria-label` or be accompanied by visually hidden text (`.sr-only`).

---

## Testing Checklist

Use this practical checklist during development and before any major release to ensure compliance:

### Keyboard Interaction
- [ ] Tab through the entire app — ensure all interactive elements are reachable.
- [ ] `Shift + Tab` works cleanly in reverse order.
- [ ] Tab order logically follows the reading order.
- [ ] No keyboard traps exist anywhere in the app.
- [ ] `Enter` or `Space` activates all buttons and links.
- [ ] `Escape` successfully closes all modals, dropdowns, and overlays.
- [ ] Dialog focus management traps focus inside when open and returns focus to the trigger when closed.

### Screen Readers & Semantics
- [ ] Screen readers (e.g., NVDA, VoiceOver, or Chrome screen reader) announce all content accurately.
- [ ] All form fields have programmatically associated labels.
- [ ] Validation errors are announced immediately.
- [ ] Live regions (`aria-live`) announce successful exports and background generation tasks.

### Visual Accessibility
- [ ] Color contrast passes WCAG AA in both Light and Dark themes (verify using Lighthouse or axe DevTools).
- [ ] Application remains functional and readable with browser zoom set up to 200%.
- [ ] Form errors use both color and icons/text to convey invalid states.

### Mobile & Motion
- [ ] Reduced motion preference is respected (animations are disabled when OS setting is on).
- [ ] Touch targets are at least `44x44px` on mobile viewports.
