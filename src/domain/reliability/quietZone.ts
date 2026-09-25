import type { QRReliabilityCheck, QRFrame } from '../types';

export function checkQuietZone(margin: number, frame: QRFrame | undefined, byteLength: number): QRReliabilityCheck {
  // Base margin check
  if (margin < 20) {
    return {
      id: 'quiet-zone',
      factor: 'Quiet Zone',
      label: 'Insufficient Margin',
      passed: false,
      severity: 'danger',
      detail: 'Margin is too thin or zero.',
      recommendation: 'Increase margin to at least 20px, preferably 40px.'
    };
  } else if (margin < 40) {
    return {
      id: 'quiet-zone',
      factor: 'Quiet Zone',
      label: 'Narrow Margin',
      passed: true,
      severity: 'warning',
      detail: 'Margin is below the recommended 40px.',
      recommendation: 'Increase margin to 40px for best reliability.'
    };
  } else if (margin > 100 && byteLength > 800) {
    return {
      id: 'quiet-zone',
      factor: 'Quiet Zone',
      label: 'Excessive Margin',
      passed: true,
      severity: 'warning',
      detail: 'Because the text is very long, a massive margin shrinks the QR matrix too much.',
      recommendation: 'Decrease margin to 40px to ensure the QR code remains readable.'
    };
  }
  
  // Frame padding check
  if (frame && frame.style !== 'none') {
    if (frame.padding < 20) {
      return {
        id: 'quiet-zone-frame',
        factor: 'Quiet Zone',
        label: 'Insufficient Frame Padding',
        passed: false,
        severity: 'danger',
        detail: 'Frame padding is too thin.',
        recommendation: 'Increase frame padding to at least 20px, preferably 40px.'
      };
    } else if (frame.padding < 40) {
      return {
        id: 'quiet-zone-frame',
        factor: 'Quiet Zone',
        label: 'Narrow Frame Padding',
        passed: true,
        severity: 'warning',
        detail: 'Frame padding is narrow.',
        recommendation: 'Increase frame padding to 40px.'
      };
    } else if (frame.padding > 100 && byteLength > 800) {
      return {
        id: 'quiet-zone-frame',
        factor: 'Quiet Zone',
        label: 'Excessive Frame Padding',
        passed: true,
        severity: 'warning',
        detail: 'Because the text is very long, a massive padding shrinks the QR matrix too much.',
        recommendation: 'Decrease frame padding to 40px to ensure the QR code remains readable.'
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
