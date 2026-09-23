import type { QRReliabilityCheck, QRLogo, ErrorCorrectionLevel } from '../types';

export function checkLogoSize(logo: QRLogo | undefined, ecLevel: ErrorCorrectionLevel): QRReliabilityCheck {
  if (!logo) {
    return {
      id: 'logo-size',
      factor: 'Logo Area',
      label: 'No Logo',
      passed: true,
      severity: 'good'
    };
  }

  const logoRatio = logo.size; // 0 to 0.4
  // Approximate area is size^2, but with plate and padding it might be larger.
  // For simplicity, we just use size * size as ratio of area.
  let areaRatio = logoRatio * logoRatio;
  
  if (logo.plate && logo.plate.enabled) {
    areaRatio *= 1.2; // plate adds ~20% more area roughly
  }
  
  const percentage = areaRatio * 100;

  if (percentage > 30) {
    return {
      id: 'logo-size',
      factor: 'Logo Area',
      label: 'Very Large Logo',
      passed: false,
      severity: 'danger',
      detail: `Logo obstructs ~${percentage.toFixed(0)}% of the QR code.`,
      recommendation: 'Reduce logo size to < 20%.'
    };
  } else if (percentage > 20) {
    return {
      id: 'logo-size',
      factor: 'Logo Area',
      label: 'Large Logo',
      passed: true,
      severity: ecLevel === 'H' ? 'warning' : 'danger',
      detail: `Logo obstructs ~${percentage.toFixed(0)}% of the QR code.`,
      recommendation: 'Use High (H) error correction.'
    };
  } else if (percentage > 10) {
    return {
      id: 'logo-size',
      factor: 'Logo Area',
      label: 'Moderate Logo Size',
      passed: true,
      severity: ecLevel === 'L' ? 'warning' : 'good',
      detail: `Logo obstructs ~${percentage.toFixed(0)}% of the QR code.`
    };
  }

  return {
    id: 'logo-size',
    factor: 'Logo Area',
    label: 'Small Safe Logo',
    passed: true,
    severity: 'good'
  };
}
