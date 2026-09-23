import type { QRContent, QRValidationResult, QRFieldError } from '../types';
import { urlSchema, textSchema, emailSchema, phoneSchema, wifiSchema } from './schemas';

export function validateQRContent(content: QRContent): QRValidationResult {
  let warnings: QRFieldError[] = [];
  const errors: QRFieldError[] = [];

  const handleResult = (result: any) => {
    if (!result.success && result.error) {
      const issues = result.error.issues || result.error.errors || [];
      issues.forEach((err: any) => {
        errors.push({
          field: err.path.join('.'),
          message: err.message,
          severity: 'error'
        });
      });
    }
  };

  switch (content.type) {
    case 'url': {
      const result = urlSchema.safeParse(content);
      handleResult(result);
      if (result.success) {
        const urlStr = result.data.url;
        if (urlStr.length > 500) {
          warnings.push({ field: 'url', message: 'Long URLs may result in dense QR codes that are hard to scan.', severity: 'warning' });
        }
        try {
          const parsedUrl = new URL(urlStr);
          if (!parsedUrl.hostname.includes('.') && parsedUrl.hostname !== 'localhost' && !parsedUrl.hostname.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
            warnings.push({ field: 'url', message: 'URL appears to be missing a top-level domain.', severity: 'warning' });
          }
        } catch {}
      }
      break;
    }
    case 'text': {
      const result = textSchema.safeParse(content);
      handleResult(result);
      if (result.success && content.text.length > 1000) {
        warnings.push({ field: 'text', message: 'Text over 1000 characters may result in a very dense QR code.', severity: 'warning' });
      }
      break;
    }
    case 'email': {
      const result = emailSchema.safeParse(content);
      handleResult(result);
      if (result.success) {
        // approximate length of the generated mailto URI
        const mailtoLen = 7 + content.to.length + (content.subject?.length || 0) + (content.body?.length || 0) + (content.cc?.length || 0) + (content.bcc?.length || 0);
        if (mailtoLen > 500) {
          warnings.push({ field: 'email', message: 'Long email templates may result in dense QR codes.', severity: 'warning' });
        }
      }
      break;
    }
    case 'phone': {
      const result = phoneSchema.safeParse(content);
      handleResult(result);
      if (result.success) {
        if (!content.number.includes('+')) {
          warnings.push({ field: 'number', message: 'Consider using an international format starting with + for better compatibility.', severity: 'warning' });
        }
      }
      break;
    }
    case 'wifi': {
      const result = wifiSchema.safeParse(content);
      handleResult(result);
      if (result.success) {
        if (/[;:,\\"]/.test(content.ssid)) {
          warnings.push({ field: 'ssid', message: 'SSID contains special characters which may not be supported by all older scanners.', severity: 'warning' });
        }
        if (content.password && /[;:,\\"]/.test(content.password)) {
          warnings.push({ field: 'password', message: 'Password contains special characters which may not be supported by all older scanners.', severity: 'warning' });
        }
      }
      break;
    }
    default:
      return { isValid: false, errors: [{ field: 'type', message: 'Unknown content type', severity: 'error' }] };
  }

  return {
    isValid: errors.length === 0,
    errors: [...errors, ...warnings]
  };
}

export * from './schemas';
