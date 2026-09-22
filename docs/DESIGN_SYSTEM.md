# Qraft Design System

A lightweight, technical, premium, and minimal design system tailored for the Qraft QR code generator. Built with modern, developer-oriented aesthetics, it avoids excessive glassmorphism and gradients in favor of clean lines, sharp typography, and purposeful contrast.

## 1. Typography

The typographic scale uses a sensible rem-based hierarchy to maintain readability and structural clarity.

- **Primary Font**: `Inter` (Google Fonts) — Clean, technical, excellent readability.
- **Monospace Font**: `JetBrains Mono` (Google Fonts) — Used for code-like elements and QR data displays.

### Font Variables

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Font Sizes (rem-based, assuming 16px base) */
  --font-xs: 0.75rem;    /* 12px */
  --font-sm: 0.8125rem;  /* 13px */
  --font-base: 0.875rem; /* 14px */
  --font-md: 1rem;       /* 16px */
  --font-lg: 1.125rem;   /* 18px */
  --font-xl: 1.5rem;     /* 24px */
  --font-2xl: 2rem;      /* 32px */

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-body: 1.5;
  --line-height-heading: 1.2;
}
```

## 2. Spacing Scale

Based on a 4px grid for precise, mathematical alignment.

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

## 3. Borders, Radii, and Shadows

Subtle structural elements designed to ground the interface without distracting from the core tooling.

```css
:root {
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px; /* pill shape */

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* Borders */
  --border-width: 1px;
  --border-color: var(--color-border);
  --border-style: solid;
}
```

## 4. Color System

Semantic, high-contrast, dual-theme definitions avoiding overly saturated generic dashboard palettes.

### Light Theme
```css
[data-theme='light'] {
  /* Backgrounds */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #f1f3f5;
  --color-bg-elevated: #ffffff;
  
  /* Text */
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #495057;
  --color-text-tertiary: #868e96;
  --color-text-inverse: #ffffff;
  
  /* Borders */
  --color-border: #dee2e6;
  --color-border-strong: #adb5bd;
  
  /* Accent / Brand */
  --color-accent: #4361ee;
  --color-accent-hover: #3a56d4;
  --color-accent-subtle: rgba(67, 97, 238, 0.08);
  
  /* Semantic */
  --color-success: #2d6a4f;
  --color-success-bg: #d8f5e3;
  --color-warning: #e67700;
  --color-warning-bg: #fff3cd;
  --color-danger: #c92a2a;
  --color-danger-bg: #fde8e8;
  --color-info: #1971c2;
  --color-info-bg: #d0ebff;
}
```

### Dark Theme
```css
[data-theme='dark'] {
  /* Backgrounds */
  --color-bg-primary: #0f0f14;
  --color-bg-secondary: #16161d;
  --color-bg-tertiary: #1e1e28;
  --color-bg-elevated: #1e1e28;
  
  /* Text */
  --color-text-primary: #e9ecef;
  --color-text-secondary: #adb5bd;
  --color-text-tertiary: #6c757d;
  --color-text-inverse: #0f0f14;
  
  /* Borders */
  --color-border: #2a2a35;
  --color-border-strong: #3d3d4a;
  
  /* Accent / Brand */
  --color-accent: #5a7cf7;
  --color-accent-hover: #6d8cf9;
  --color-accent-subtle: rgba(90, 124, 247, 0.12);
  
  /* Semantic */
  --color-success: #40c057;
  --color-success-bg: rgba(64, 192, 87, 0.12);
  --color-warning: #fcc419;
  --color-warning-bg: rgba(252, 196, 25, 0.12);
  --color-danger: #ff6b6b;
  --color-danger-bg: rgba(255, 107, 107, 0.12);
  --color-info: #4dabf7;
  --color-info-bg: rgba(77, 171, 247, 0.12);
}
```

## 5. Component Specifications

### Buttons
- **Shared Properties**: `36px` height, `--font-sm`, `--space-4` horizontal padding, focus state adds a `2px` accent outline offset by `2px`. Disabled state applies `50%` opacity and `cursor: not-allowed`.
- **Primary**: Accent background, white text, `--radius-md`.
- **Secondary**: Transparent background, border matching `--color-text-primary` or `--color-border-strong`, text color matching primary text, `--radius-md`.
- **Ghost**: No background, no border, primary text color. Hover triggers a subtle background.
- **Icon**: `36x36px` square (or circle), centered icon, uses ghost style properties.

### Inputs
- **Shared Properties**: Height `36px`, horizontal padding `--space-3`, border `1px solid var(--color-border)`, border radius `--radius-md`. Placeholder color `--color-text-tertiary`.
- **Focus State**: Accent border combined with a subtle accent shadow.
- **Error State**: Danger border combined with danger text below the input.
- **Textarea**: Minimum height `80px`, restricted to vertical resize only.

### Cards
- **Background**: `--color-bg-elevated`
- **Border**: `1px solid var(--color-border)`
- **Border Radius**: `--radius-lg`
- **Padding**: `--space-6`
- **Shadow**: `--shadow-sm`

### Tabs / Segmented Control
- Pill style with a rounded background container.
- **Active tab**: Accent background, white text.
- **Inactive tab**: Transparent, secondary text.
- **Animation**: Smooth `150ms` background color transition between states.

### Tooltips
- **Background**: `--color-bg-tertiary` (light mode) / `--color-bg-elevated` (dark mode)
- **Text**: `--font-xs`
- **Border Radius**: `--radius-sm`
- **Padding**: `--space-2` (vertical), `--space-3` (horizontal)
- **Shadow**: `--shadow-md`
- **Details**: Requires an arrow pointing to the trigger element. `300ms` delay on show, immediate hide on mouse leave.

### Badges
- Small pill-shaped labels (`--radius-full`).
- **Typography**: `--font-xs`
- **Padding**: `2px` top/bottom, `8px` left/right.
- **Variants**: Default, Success, Warning, Danger.

### Dialogs
- Centered modal behavior overlaid on a backdrop.
- **Backdrop**: `rgba(0,0,0,0.5)`
- **Container**: Max-width `480px`, padding `--space-8`, border radius `--radius-xl`.
- **Close Action**: Integrated top-right close button.
- **Accessibility**: Built on the native HTML `<dialog>` element.

### Toast / Notifications
- Fixed to the top-center position.
- Animates sliding in from the top edge.
- Auto-dismisses after `3` seconds.
- Includes an icon mapping to the variant (success, error, info), message text, and an optional close button.

## 6. Utilities & Motion

```css
:root {
  /* Transitions */
  --transition-default: 150ms ease;
  --transition-panel: 200ms ease-in-out;
  --transition-color: 150ms ease;

  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}

/* Respect Reduced Motion Preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
