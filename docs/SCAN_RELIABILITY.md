# Scan Safety / Reliability Analysis

This document outlines the design and implementation details for the Scan Safety / Reliability Analysis system in the QRaft project. This system is a heuristic engine that evaluates a user's QR code configuration and warns them about choices that may reduce QR scannability.

## Core Principle

**Do NOT claim to calculate exact scan probability.** This system provides a heuristic based on measurable configuration properties. Its purpose is to guide users toward creating functional and aesthetically pleasing QR codes without making definitive guarantees about real-world scanning success.

## Factors to Analyze

The analysis evaluates multiple configuration properties and assigns a status (`good`, `warning`, or `danger`) to each.

### 1. Contrast Ratio
- **Metric**: Calculates WCAG luminance contrast ratio between foreground and background colors.
- **Formula**: `(L1 + 0.05) / (L2 + 0.05)` where `L1` is the relative luminance of the lighter color and `L2` is the relative luminance of the darker color.
- **Relative Luminance**: `0.2126 * R + 0.7152 * G + 0.0722 * B` (assuming sRGB linearized values).
- **Thresholds**:
  - `≥ 7:1` → Excellent (good)
  - `≥ 4.5:1` → Adequate (good)
  - `≥ 3:1` → Low contrast (warning)
  - `< 3:1` → Very low contrast (danger)
- **Special Cases**:
  - Identical or near-identical colors automatically result in `danger`.

### 2. Gradient Contrast (Expanded)
- **Methodology**: Sample gradient at multiple points (`0%`, `25%`, `50%`, `75%`, `100%`) along the gradient path.
- **Application**:
  - Linear gradients: Sample along the vector line.
  - Radial gradients: Sample center and edges.
  - Corner square/dot gradients: Check independently.
- **Evaluation**: Calculate contrast at each sample point against the background. The worst contrast among the sample points determines the severity of the contrast check based on standard contrast thresholds.

### 3. Eye Color Contrast
- **Requirement**: Eyes (finder patterns) are critical for scanner detection, necessitating higher contrast standards.
- **Threshold**: Requires a contrast ratio of `≥ 4.5:1`.
- **Methodology**: If eye colors (corner square and corner dot) are set independently of the main modules, check each against the background.

### 4. Background Transparency
- **Transparent background**: Scanning depends entirely on what's placed behind the QR code (warning).
- **Transparent background AND light foreground color**: danger (extremely high risk of becoming invisible on common light backgrounds).

### 5. Quiet Zone (Margin) & Frame Quiet Zone Check
- **Basic Margin Metric**: The number of modules (data squares) used for the margin around the QR code.
  - `≥ 4` → Adequate (good)
  - `2 - 3` → Narrow (warning)
  - `0 - 1` → Insufficient (danger)
- **Frame padding**: If a frame is enabled, verify that frame padding provides an adequate quiet zone. Frame padding should be at least 4 module-widths equivalent.
  - Frame padding `≥ 16px` (for 300px QR): good
  - Frame padding `8-15px`: warning
  - Frame padding `< 8px`: danger
- **Note**: Call-to-Action (CTA) text embedded in frames must not encroach on the quiet zone.

### 6. Logo Size & Logo Plate Impact
- **Metric**: The surface area of the logo (and its plate) as a percentage of the total QR code area.
- **Logo Plate Impact**: The logo plate increases the effective logo obstruction area. Include plate size + padding in the logo area calculation. The plate adds to the 'hidden' area even if `hideBackgroundDots` is disabled.
- **Thresholds**:
  - `≤ 10%` → Small, safe (good)
  - `11% - 20%` → Moderate (warning if EC < H)
  - `21% - 30%` → Large (warning, recommend EC=H)
  - `> 30%` → Very large (always danger regardless of EC)

### 7. Logo + Error Correction Interaction
- **Logo present + EC=L**: danger
- **Logo present + EC=M**: warning if logo > 10%
- **Logo present + EC=Q**: warning if logo > 20%
- **Logo present + EC=H**: warning if logo > 25%

### 8. Module Shape Impact (Expanded)
- **Square** → No impact (good)
- **Rounded** → Minimal impact (good)
- **Dots** → Slight reduction, especially at small sizes (warning if size < 200px)
- **Classy** → Moderate impact (warning if EC < Q)
- **Classy-rounded** → Similar to classy (warning if EC < Q)
- **Extra-rounded** → Moderate impact (warning if EC < Q)

### 9. Corner Square Shape Impact
- **Square** → No impact (good)
- **Dot** → Minimal, most scanners handle well (good)
- **Extra-rounded** → Minimal impact (good)
- **Classy/classy-rounded** → Some scanners may struggle (warning)

### 10. Output Size
- **Metric**: The pixel dimension of the exported QR code.
- **Thresholds** (For Digital Use):
  - `≥ 200px` → Safe (good)
  - `100px - 199px` → Warning (may be too small for some camera focal lengths)
  - `< 100px` → Danger

## Scoring Algorithm

The analysis runs synchronously using the active `QRConfig` object.

### Compound Risk
Multiple warnings compound risk. If 3 or more warnings are present across different checks, the overall score is upgraded to `danger`, even if no individual check resulted in a danger state.

```typescript
type Status = 'good' | 'warning' | 'danger';

interface ReliabilityCheck {
  id: string;
  name: string;
  status: Status;
  message: string;
  recommendation?: string;
}

interface QRReliabilityReport {
  overallScore: Status;
  checks: ReliabilityCheck[];
}

function analyzeReliability(config: QRConfig): QRReliabilityReport {
  const checks: ReliabilityCheck[] = [
    checkContrast(config.style.dotOptions, config.style.backgroundOptions),
    checkEyeContrast(config.style.cornerSquareOptions, config.style.cornerDotOptions, config.style.backgroundOptions),
    checkQuietZone(config.style.margin, config.style.frame),
    checkErrorCorrection(config.errorCorrection, config.style.logo),
    checkLogoSize(config.style.logo, config.errorCorrection),
    checkLogoPlate(config.style.logo),
    checkModuleShape(config.style.dotOptions, config.errorCorrection),
    checkCornerShape(config.style.cornerSquareOptions),
    checkOutputSize(config.style.width),
    checkGradientContrast(config.style),
    checkBackgroundTransparency(config.style.backgroundOptions, config.style.dotOptions),
  ];

  const warningCount = checks.filter(c => c.status === 'warning').length;
  let overallScore = determineOverall(checks);
  
  // Compound risk: 3+ warnings = danger
  if (warningCount >= 3 && overallScore !== 'danger') {
    overallScore = 'danger';
  }
  
  return { overallScore, checks };
}

function determineOverall(checks: ReliabilityCheck[]): Status {
  if (checks.some(c => c.status === 'danger')) return 'danger';
  if (checks.some(c => c.status === 'warning')) return 'warning';
  return 'good';
}
```

## User-Facing Display

The UI should display an aggregated summary block that highlights the overall health of the configuration, followed by a list of passed checks, warnings, and dangers.

### Good state:
```text
✓ SCAN RELIABILITY: Excellent
✓ Strong contrast (12.5:1)
✓ Adequate quiet zone
✓ Error correction: M
```

### Warning state (Frame + Logo):
```text
⚠ SCAN RELIABILITY: Good with caveats
✓ Strong contrast
⚠ Thin frame padding (12px) — Consider increasing frame padding to 16px+
✓ Error correction: H
⚠ Large logo (22%) — Logo is large but error correction is high
```

### Danger state (Gradient + Transparency + Compound):
```text
✖ SCAN RELIABILITY: May have issues
✖ Transparent background with light dots — High risk of being invisible on light surfaces
⚠ Low gradient contrast at edges (2.8:1) — Ensure all parts of the gradient contrast with background
⚠ Module shape: Dots — Small size (<200px) may make dots hard to read
⚠ Thin margin — Consider increasing margin to 4+
ℹ (Danger triggered by compound risk: 3+ warnings detected)
```

## Implementation Notes

1. **Synchronous Execution**: The reliability checks only perform basic mathematics and condition matching. They should run synchronously on the main thread and re-run immediately whenever `QRConfig` changes.
2. **Contrast Math**: 
   - Ensure RGB values are linearized before calculating relative luminance.
   - For an sRGB color component `C` (where `C` is R, G, or B normalized to `0-1`):
     - if `C <= 0.03928` then `c = C / 12.92`
     - else `c = ((C + 0.055) / 1.055) ^ 2.4`
     (Apply this to R, G, and B separately before multiplying by the luminance coefficients).
3. **Gradient Contrast Sampling**: Sample the generated color at multiple stops (`0%`, `25%`, `50%`, `75%`, `100%`) along the vector line (linear) or radii (radial). Check corner square and dot gradient options independently.
4. **Logo Size Math**: The logo area percentage can be approximated quickly using linear proportions, remembering to include the plate size + padding.
