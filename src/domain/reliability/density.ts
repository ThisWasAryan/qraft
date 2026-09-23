import type { QRReliabilityCheck, QRConfig } from '../types';
import { getEncodedContentString } from '../../utils/capacity';

export function checkDensity(config: QRConfig): QRReliabilityCheck {
  const dataString = getEncodedContentString(config.content);
  const byteLength = new Blob([dataString]).size;
  
  if (byteLength > 1500) {
    return {
      id: 'density',
      factor: 'Density',
      label: 'QR Code is Extremely Dense',
      passed: false,
      severity: 'danger',
      detail: 'The massive amount of text makes the QR code modules very tiny.',
      recommendation: 'Shorten the text or ensure the physical printed size is very large.'
    };
  } else if (byteLength > 800) {
    return {
      id: 'density',
      factor: 'Density',
      label: 'High Density',
      passed: true,
      severity: 'warning',
      detail: 'The QR code contains a lot of data and will be dense.',
      recommendation: 'Ensure high contrast and print at a larger size.'
    };
  }

  return {
    id: 'density',
    factor: 'Density',
    label: 'Normal Density',
    passed: true,
    severity: 'good',
    detail: 'The data amount is reasonable for reliable scanning.'
  };
}
