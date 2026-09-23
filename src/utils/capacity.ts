import type { QRContent, ErrorCorrectionLevel } from '../domain/types';
import { encodeUrlPayload, encodeTextPayload, encodeEmailPayload, encodePhonePayload, encodeWifiPayload } from '../domain/encoders';

export function getEncodedContentString(content: QRContent): string {
  switch (content.type) {
    case 'url': return encodeUrlPayload(content.url);
    case 'text': return encodeTextPayload(content.text);
    case 'email': return encodeEmailPayload({
      email: content.to,
      subject: content.subject,
      body: content.body,
      cc: content.cc,
      bcc: content.bcc,
    });
    case 'phone': return encodePhonePayload(content.number);
    case 'wifi': return encodeWifiPayload({
      ssid: content.ssid,
      password: content.password,
      authType: content.authType,
      hidden: content.hidden,
    });
    default: return '';
  }
}

export function getMaxErrorCorrectionLevel(content: QRContent): ErrorCorrectionLevel {
  const dataString = getEncodedContentString(content);
  const byteLength = new Blob([dataString]).size;
  
  if (byteLength <= 1273) return 'H';
  if (byteLength <= 1663) return 'Q';
  if (byteLength <= 2331) return 'M';
  return 'L';
}
