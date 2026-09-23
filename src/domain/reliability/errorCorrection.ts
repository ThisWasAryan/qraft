import type { QRReliabilityCheck, ErrorCorrectionLevel, QRLogo } from '../types';

export function checkErrorCorrection(ecLevel: ErrorCorrectionLevel, logo?: QRLogo): QRReliabilityCheck {
  if (logo) {
    return {
      id: 'error-correction-logo',
      factor: 'Error Correction',
      label: 'Logo Requires High EC',
      passed: true,
      severity: ecLevel === 'H' ? 'good' : (ecLevel === 'Q' ? 'warning' : 'danger'),
      detail: 'Logos obstruct data modules. High error correction is recommended.',
      recommendation: ecLevel !== 'H' ? 'Set Error Correction to H.' : undefined
    };
  }

  return {
    id: 'error-correction',
    factor: 'Error Correction',
    label: `Level ${ecLevel}`,
    passed: true,
    severity: 'good',
    detail: `Error correction level ${ecLevel} is adequate.`
  };
}
