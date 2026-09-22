# QRaft Preset System Architecture

The QRaft preset system provides users with pre-configured, highly cohesive design starting points for their QR codes. A preset can define the *full* customization surface, allowing for complex and beautiful starting configurations that span dots, eyes, colors, gradients, frames, and background styles.

> [!IMPORTANT]
> Presets are designed as flexible starting points, not rigid templates. Logos are explicitly excluded from presets to ensure user-specific branding is not overwritten when browsing styles.

## 1. Core Data Structures

A preset is defined by the `QRPreset` interface, utilizing `Partial<QRStyle>` to allow overriding any combination of style properties.

```typescript
import { 
  QRStyle, 
  ErrorCorrectionLevel, 
  QRDotOptions, 
  QRCornerSquareOptions, 
  QRCornerDotOptions, 
  QRBackgroundOptions 
} from '../types';

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'professional' | 'creative' | 'branded';
  /**
   * The style overrides for this preset. Can include:
   * - dotOptions (type, color, gradient)
   * - cornerSquareOptions (type, color, gradient)
   * - cornerDotOptions (type, color, gradient)
   * - backgroundOptions (color, gradient, round)
   * - frame (style, colors, CTA)
   * - width, height, margin
   */
  style: Partial<QRStyle>;
  errorCorrection?: ErrorCorrectionLevel;
  isBuiltIn: boolean;
}
```

## 2. Built-In Presets Catalog

The system includes a rich set of built-in presets categorized by their primary use case.

### Basic Category
Essential, high-contrast presets for maximum reliability.

```typescript
export const basicPresets: QRPreset[] = [
  {
    id: 'basic-classic',
    name: 'Classic',
    description: 'Standard black-on-white layout',
    category: 'basic',
    isBuiltIn: true,
    errorCorrection: 'M',
    style: {
      dotOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#ffffff' },
      margin: 40
    }
  },
  {
    id: 'basic-inverted',
    name: 'Inverted',
    description: 'White-on-black layout',
    category: 'basic',
    isBuiltIn: true,
    errorCorrection: 'M',
    style: {
      dotOptions: { type: 'square', color: '#ffffff' },
      backgroundOptions: { color: '#000000' },
      margin: 40
    }
  },
  {
    id: 'basic-high-contrast',
    name: 'High Contrast',
    description: 'Maximum readability and scannability',
    category: 'basic',
    isBuiltIn: true,
    errorCorrection: 'H',
    style: {
      dotOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#ffffff' },
      margin: 60
    }
  }
];
```

### Professional Category
Clean, modern presets suitable for business and corporate environments.

```typescript
export const professionalPresets: QRPreset[] = [
  {
    id: 'prof-midnight',
    name: 'Midnight',
    description: 'Dark blue with rounded dots',
    category: 'professional',
    isBuiltIn: true,
    style: {
      dotOptions: { type: 'rounded', color: '#1a1a2e' },
      cornerSquareOptions: { type: 'extra-rounded', color: '#1a1a2e' },
      backgroundOptions: { color: '#f0f0f5' }
    }
  },
  {
    id: 'prof-ocean',
    name: 'Ocean Gradient',
    description: 'Smooth blue gradient flow',
    category: 'professional',
    isBuiltIn: true,
    errorCorrection: 'Q',
    style: {
      dotOptions: { 
        type: 'rounded', 
        gradient: { 
          type: 'linear', 
          rotation: Math.PI / 4, 
          colorStops: [{ offset: 0, color: '#0077b6' }, { offset: 1, color: '#00b4d8' }] 
        } 
      },
      backgroundOptions: { color: '#ffffff' }
    }
  },
  {
    id: 'prof-forest',
    name: 'Forest',
    description: 'Professional green tones',
    category: 'professional',
    isBuiltIn: true,
    style: {
      dotOptions: { type: 'rounded', color: '#2d6a4f' },
      cornerSquareOptions: { type: 'dot', color: '#1b4332' },
      backgroundOptions: { color: '#f8f9fa' }
    }
  },
  {
    id: 'prof-corporate',
    name: 'Corporate',
    description: 'Clean design with a simple frame',
    category: 'professional',
    isBuiltIn: true,
    style: {
      dotOptions: { type: 'square', color: '#2b2d42' },
      backgroundOptions: { color: '#ffffff' },
      frame: { 
        style: 'simple', 
        color: '#2b2d42', 
        backgroundColor: '#ffffff', 
        borderWidth: 2, 
        borderRadius: 8, 
        padding: 16 
      }
    }
  },
  {
    id: 'prof-slate',
    name: 'Slate',
    description: 'Sophisticated gray scaling',
    category: 'professional',
    isBuiltIn: true,
    style: {
      dotOptions: { type: 'classy-rounded', color: '#343a40' },
      cornerSquareOptions: { type: 'extra-rounded', color: '#212529' },
      backgroundOptions: { color: '#f8f9fa' }
    }
  }
];
```

### Creative Category
Expressive designs for marketing, events, and modern branding.

```typescript
export const creativePresets: QRPreset[] = [
  {
    id: 'crea-dots',
    name: 'Dots',
    description: 'Circular modules across the board',
    category: 'creative',
    isBuiltIn: true,
    errorCorrection: 'Q',
    style: {
      dotOptions: { type: 'dots', color: '#333333' },
      cornerSquareOptions: { type: 'dot' },
      backgroundOptions: { color: '#ffffff' }
    }
  },
  {
    id: 'crea-sunset',
    name: 'Sunset',
    description: 'Warm, vibrant gradient styling',
    category: 'creative',
    isBuiltIn: true,
    errorCorrection: 'Q',
    style: {
      dotOptions: { 
        type: 'extra-rounded', 
        gradient: { 
          type: 'linear', 
          rotation: Math.PI / 3, 
          colorStops: [{ offset: 0, color: '#e63946' }, { offset: 1, color: '#f4a261' }] 
        } 
      },
      backgroundOptions: { color: '#fff8f0' }
    }
  },
  {
    id: 'crea-neon',
    name: 'Neon',
    description: 'Bright cyber-styled elements on dark',
    category: 'creative',
    isBuiltIn: true,
    errorCorrection: 'Q',
    style: {
      dotOptions: { type: 'dots', color: '#00ff88' },
      cornerSquareOptions: { type: 'dot', color: '#00ff88' },
      cornerDotOptions: { type: 'dot', color: '#00ffcc' },
      backgroundOptions: { color: '#0a0a0a' }
    }
  },
  {
    id: 'crea-aurora',
    name: 'Aurora',
    description: 'Purple and blue radial burst',
    category: 'creative',
    isBuiltIn: true,
    errorCorrection: 'Q',
    style: {
      dotOptions: { 
        type: 'classy', 
        gradient: { 
          type: 'radial', 
          colorStops: [{ offset: 0, color: '#7209b7' }, { offset: 1, color: '#4361ee' }] 
        } 
      },
      backgroundOptions: { color: '#fafafa' }
    }
  },
  {
    id: 'crea-minimal',
    name: 'Minimal',
    description: 'Soft gray with rounded features',
    category: 'creative',
    isBuiltIn: true,
    errorCorrection: 'M',
    style: {
      dotOptions: { type: 'rounded', color: '#6c757d' },
      backgroundOptions: { color: '#fafafa' },
      margin: 60
    }
  },
  {
    id: 'crea-candy',
    name: 'Candy',
    description: 'Playful pink and rounded elements',
    category: 'creative',
    isBuiltIn: true,
    errorCorrection: 'Q',
    style: {
      dotOptions: { type: 'extra-rounded', color: '#e91e8c' },
      cornerSquareOptions: { type: 'dot', color: '#c71585' },
      backgroundOptions: { color: '#fff0f6' }
    }
  }
];
```

### Branded Category
Designs explicitly featuring frames and calls-to-action out of the box.

```typescript
export const brandedPresets: QRPreset[] = [
  {
    id: 'brand-cta',
    name: 'Call to Action',
    description: 'Framed QR code with "SCAN ME"',
    category: 'branded',
    isBuiltIn: true,
    errorCorrection: 'M',
    style: {
      dotOptions: { type: 'rounded', color: '#1a1a2e' },
      backgroundOptions: { color: '#ffffff' },
      frame: { 
        style: 'banner', 
        color: '#1a1a2e', 
        backgroundColor: '#1a1a2e', 
        borderWidth: 0, 
        borderRadius: 12, 
        padding: 20, 
        ctaText: { 
          text: 'SCAN ME', 
          position: 'bottom', 
          fontFamily: 'Inter', 
          fontWeight: 700, 
          fontSize: 16, 
          letterSpacing: 2, 
          color: '#ffffff', 
          alignment: 'center' 
        } 
      }
    }
  },
  {
    id: 'brand-badge',
    name: 'Badge',
    description: 'Contained badge-style presentation',
    category: 'branded',
    isBuiltIn: true,
    errorCorrection: 'M',
    style: {
      dotOptions: { type: 'classy-rounded', color: '#2b2d42' },
      backgroundOptions: { color: '#ffffff' },
      frame: { 
        style: 'badge', 
        color: '#2b2d42', 
        backgroundColor: '#f8f9fa', 
        borderWidth: 2, 
        borderRadius: 16, 
        padding: 24 
      }
    }
  }
];
```

---

## 3. Design Randomizer (Shuffle)

The design randomizer provides users with an instant "Shuffle" button to generate a visually pleasing configuration based on curated combinations, rather than truly randomizing arbitrary (and potentially unscannable) variables.

### Architecture

```typescript
interface QRDesignPalette {
  id: string;
  name: string;
  dotOptions: Partial<QRDotOptions>;
  cornerSquareOptions?: Partial<QRCornerSquareOptions>;
  cornerDotOptions?: Partial<QRCornerDotOptions>;
  backgroundOptions?: Partial<QRBackgroundOptions>;
  errorCorrection: ErrorCorrectionLevel; // Force 'H' for randomized to maximize scannability
}
```

The system will define ~25 pre-validated palettes (e.g., retro, cyberpunk, soft-pastel, high-contrast-tech). 

### Randomizer Rules

1. **Curated Selection**: A random palette is selected from the predefined list of 25 validated `QRDesignPalette` objects.
2. **Contrast Validation**: All curated palettes must inherently pass contrast checks (≥ 4.5:1 ratio) between background and foreground to ensure scannability.
3. **Resilience Enforcement**: When randomized, the Error Correction Level is always forced to `H` (30%).
4. **Structural Preservation**: Do NOT randomize complex structural entities like logos, frames, or CTA text, as these are highly specific to user intent.
5. **No Arbitrary Colors**: Do NOT randomize colors completely on the fly; using arbitrary random RGB values frequently results in unscannable, low-contrast combinations.
6. **Continuous Discovery**: The user can hit 'Shuffle' repeatedly to easily browse safe, attractive visual combinations.
7. **Complete Editability**: After hitting 'Shuffle', the user retains full control to modify every single applied property.

---

## 4. Preset Application Logic

When a user selects a preset or uses the Randomizer, the following behavior applies:

1. **Trigger**: User clicks a specific preset card or the 'Shuffle' button.
2. **Merge**: The `Partial<QRStyle>` from the chosen preset is deeply merged over the *current* state.
3. **Preservation**: Values that are *not* defined in the preset (such as standard dimensions, user's embedded logo, or un-overridden frame options) remain unchanged. 
4. **Subsequent Edits**: Users can dive into the Advanced Configuration panels immediately to tweak colors, margins, or shapes.
5. **UI State Indication**: Once a user modifies a property *after* applying a preset, the UI should display a "Custom" badge or de-select the active preset card, indicating the configuration has diverged.
