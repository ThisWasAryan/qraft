import type { QRReliabilityCheck, QRFrame } from '../types';

export function checkQuietZone(margin: number, frame?: QRFrame): QRReliabilityCheck {
  // Base margin check
  if (margin < 2) {
    return {
      id: 'quiet-zone',
      factor: 'Quiet Zone',
      label: 'Insufficient Margin',
      passed: false,
      severity: 'danger',
      detail: 'Margin is too thin or zero.',
      recommendation: 'Increase margin to at least 2, preferably 4.'
    };
  } else if (margin < 4) {
    return {
      id: 'quiet-zone',
      factor: 'Quiet Zone',
      label: 'Narrow Margin',
      passed: true,
      severity: 'warning',
      detail: 'Margin is below the recommended 4 modules.',
      recommendation: 'Increase margin to 4 for best reliability.'
    };
  }
  
  // Frame padding check
  if (frame && frame.style !== 'none') {
    if (frame.padding < 8) {
      return {
        id: 'quiet-zone-frame',
        factor: 'Quiet Zone',
        label: 'Insufficient Frame Padding',
        passed: false,
        severity: 'danger',
        detail: 'Frame padding is too thin.',
        recommendation: 'Increase frame padding to at least 16px.'
      };
    } else if (frame.padding < 16) {
      return {
        id: 'quiet-zone-frame',
        factor: 'Quiet Zone',
        label: 'Narrow Frame Padding',
        passed: true,
        severity: 'warning',
        detail: 'Frame padding is narrow.',
        recommendation: 'Increase frame padding to 16px+.'
      };
    }
  }

  return {
    id: 'quiet-zone',
    factor: 'Quiet Zone',
    label: 'Adequate Margin',
    passed: true,
    severity: 'good',
    detail: 'Quiet zone is sufficient for scanning.'
  };
}
