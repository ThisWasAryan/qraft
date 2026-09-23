// === Content Types ===
export type QRContentType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

export type QRContent = URLContent | TextContent | EmailContent | PhoneContent | WiFiContent;

export interface URLContent { type: 'url'; url: string; }
export interface TextContent { type: 'text'; text: string; }
export interface EmailContent { type: 'email'; to: string; subject?: string; body?: string; cc?: string; bcc?: string; }
export interface PhoneContent { type: 'phone'; number: string; }
export interface WiFiContent { type: 'wifi'; ssid: string; password: string; authType: 'WPA' | 'WEP' | 'nopass'; hidden: boolean; }

// === Error Correction ===
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

// === Module/Dot Shapes ===
export type QRDotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';

// === Corner Square (Eye Frame) Shapes ===
export type QRCornerSquareType = 'square' | 'dot' | 'extra-rounded' | 'dots' | 'rounded' | 'classy' | 'classy-rounded';

// === Corner Dot (Eye Pupil) Shapes ===
export type QRCornerDotType = 'square' | 'dot';

// === Gradient ===
export interface QRGradient {
  type: 'linear' | 'radial';
  rotation?: number;  // radians for linear gradient
  colorStops: Array<{ offset: number; color: string }>;  // offset 0-1
}

// === Dot/Module Options ===
export interface QRDotOptions {
  type: QRDotType;
  color: string;       // hex color
  gradient?: QRGradient;
}

// === Corner Square (Eye Frame) Options ===
export interface QRCornerSquareOptions {
  type: QRCornerSquareType;
  color?: string;       // defaults to dot color if not set
  gradient?: QRGradient;
}

// === Corner Dot (Eye Pupil) Options ===
export interface QRCornerDotOptions {
  type: QRCornerDotType;
  color?: string;       // defaults to corner square color if not set
  gradient?: QRGradient;
}

// === Background Options ===
export interface QRBackgroundOptions {
  color: string;         // hex color, or 'transparent'
  gradient?: QRGradient;
  round?: number;        // border-radius in px for rounded background
}

// === Logo / Image ===
export interface QRLogoPlate {
  enabled: boolean;
  shape: 'circle' | 'rounded-square' | 'square';
  color: string;       // plate background color
  padding: number;     // padding around logo within plate (px)
}

export interface QRLogo {
  src: string;                   // data URL (for persistence) or blob URL (session)
  size: number;                  // 0-0.4 ratio relative to QR size
  margin: number;                // px margin around logo/plate
  hideBackgroundDots: boolean;   // excavate modules behind logo
  opacity?: number;              // 0-1, default 1
  plate?: QRLogoPlate;           // optional background plate
}

// === Frame ===
export type QRFrameStyle = 'none' | 'simple' | 'rounded' | 'badge' | 'banner' | 'ticket';

export interface QRFrame {
  style: QRFrameStyle;
  color: string;          // frame border/line color
  backgroundColor: string; // frame fill color
  borderWidth: number;     // px
  borderRadius: number;    // px
  padding: number;         // px between frame edge and QR
  ctaText?: QRCTAText;    // optional call-to-action text
}

// === CTA Text ===
export interface QRCTAText {
  text: string;                   // e.g., 'SCAN ME', 'VIEW MENU'
  position: 'top' | 'bottom';    // relative to QR within frame
  fontFamily: 'Inter' | 'JetBrains Mono' | 'system';  // limited to loaded fonts
  fontWeight: 400 | 500 | 600 | 700;
  fontSize: number;               // px
  letterSpacing: number;           // px
  color: string;                   // hex
  alignment: 'left' | 'center' | 'right';
}

// === Complete QR Style ===
export interface QRStyle {
  // Size & Layout
  width: number;          // px, e.g., 300
  height: number;         // px, usually same as width
  margin: number;         // quiet zone in px (not modules)
  
  // Dots/Modules
  dotOptions: QRDotOptions;
  
  // Finder Pattern Eyes
  cornerSquareOptions: QRCornerSquareOptions;
  cornerDotOptions: QRCornerDotOptions;
  
  // Background
  backgroundOptions: QRBackgroundOptions;
  
  // Logo
  logo?: QRLogo;
  
  // Frame (Qraft wrapper, not qr-code-styling native)
  frame?: QRFrame;
}

// === Complete QR Config ===
export interface QRConfig {
  content: QRContent;
  style: QRStyle;
  errorCorrection: ErrorCorrectionLevel;
}

// === Presets ===
export interface QRPreset {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'professional' | 'creative' | 'branded';
  style: Partial<QRStyle>;   // partial overrides
  errorCorrection?: ErrorCorrectionLevel;
  isBuiltIn: boolean;
}

// === History ===
export interface QRHistoryItem {
  id: string;              // crypto.randomUUID()
  config: QRConfig;
  createdAt: number;       // Unix timestamp ms
  label?: string;          // auto-generated from content
  presetId?: string;
}

export interface PersistedHistory {
  version: number;
  items: QRHistoryItem[];
}

// === Validation ===
export interface QRFieldError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface QRValidationResult {
  isValid: boolean;
  errors: QRFieldError[];
}

// === Reliability ===
export type ReliabilitySeverity = 'good' | 'warning' | 'danger';

export interface QRReliabilityCheck {
  id: string;
  factor: string;
  label: string;
  passed: boolean;
  severity: ReliabilitySeverity;
  detail?: string;
  recommendation?: string;
}

export interface QRReliabilityReport {
  overallScore: ReliabilitySeverity;
  checks: QRReliabilityCheck[];
}

// === Design Randomizer ===
export interface QRDesignPalette {
  id: string;
  name: string;
  dotOptions: Partial<QRDotOptions>;
  cornerSquareOptions?: Partial<QRCornerSquareOptions>;
  cornerDotOptions?: Partial<QRCornerDotOptions>;
  backgroundOptions?: Partial<QRBackgroundOptions>;
  errorCorrection?: ErrorCorrectionLevel;
}

export const DEFAULT_QR_CONFIG: QRConfig = {
  content: { type: 'url', url: '' },
  errorCorrection: 'Q',
  style: {
    width: 1000,
    height: 1000,
    margin: 0,
    dotOptions: { type: 'square', color: '#000000' },
    cornerSquareOptions: { type: 'square', color: '#000000' },
    cornerDotOptions: { type: 'square', color: '#000000' },
    backgroundOptions: { color: '#FFFFFF' },
  },
};
