import QRCodeStyling from 'qr-code-styling';
import type {
  Options,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
} from 'qr-code-styling';
import type { QRConfig } from '../domain/types';
import { validateQRContent } from '../domain/validators';
import { 
  encodeUrlPayload, 
  encodeTextPayload, 
  encodeEmailPayload, 
  encodePhonePayload, 
  encodeWifiPayload,
  encodeSmsPayload,
  encodeWhatsAppPayload,
  encodeVCardPayload,
  encodeUpiPayload
} from '../domain/encoders';

export function getPayloadString(config: QRConfig): string {
  const validation = validateQRContent(config.content);
  if (!validation.isValid) {
    return encodeUrlPayload('https://thiswasaryan.in');
  }

  switch (config.content.type) {
    case 'url':
      return encodeUrlPayload(config.content.url);
    case 'text':
      return encodeTextPayload(config.content.text);
    case 'email':
      return encodeEmailPayload({
        email: config.content.to,
        subject: config.content.subject,
        body: config.content.body,
        cc: config.content.cc,
        bcc: config.content.bcc,
      });
    case 'phone':
      return encodePhonePayload(config.content.number);
    case 'wifi':
      return encodeWifiPayload(config.content);
    case 'sms':
      return encodeSmsPayload(config.content);
    case 'whatsapp':
      return encodeWhatsAppPayload(config.content);
    case 'vcard':
      return encodeVCardPayload(config.content);
    case 'upi':
      return encodeUpiPayload(config.content);
    default:
      return '';
  }
}

export function mapQRConfigToStylingOptions(config: QRConfig, processedLogoSrc?: string): Options {
  const { style, errorCorrection } = config;
  const payload = getPayloadString(config);

  const options: Options = {
    width: style.width,
    height: style.height,
    data: payload,
    margin: style.margin,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte' as Mode,
      errorCorrectionLevel: errorCorrection as ErrorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: style.logo?.hideBackgroundDots ?? true,
      imageSize: style.logo?.size ?? 0.4,
      margin: style.logo?.margin ?? 0,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      color: style.dotOptions.color,
      type: style.dotOptions.type as DotType,
    },
    backgroundOptions: {
      color: style.backgroundOptions.color,
    },
    cornersSquareOptions: {
      color: style.cornerSquareOptions.color || style.dotOptions.color,
      type: style.cornerSquareOptions.type as CornerSquareType,
    },
    cornersDotOptions: {
      color: style.cornerDotOptions.color || style.cornerSquareOptions.color || style.dotOptions.color,
      type: style.cornerDotOptions.type as CornerDotType,
    },
  };

  // Gradients
  if (style.dotOptions.gradient) {
    options.dotsOptions!.gradient = {
      type: style.dotOptions.gradient.type,
      rotation: style.dotOptions.gradient.rotation ?? 0,
      colorStops: style.dotOptions.gradient.colorStops,
    };
  }

  if (style.cornerSquareOptions.gradient) {
    options.cornersSquareOptions!.gradient = {
      type: style.cornerSquareOptions.gradient.type,
      rotation: style.cornerSquareOptions.gradient.rotation ?? 0,
      colorStops: style.cornerSquareOptions.gradient.colorStops,
    };
  }

  if (style.cornerDotOptions.gradient) {
    options.cornersDotOptions!.gradient = {
      type: style.cornerDotOptions.gradient.type,
      rotation: style.cornerDotOptions.gradient.rotation ?? 0,
      colorStops: style.cornerDotOptions.gradient.colorStops,
    };
  }

  if (style.backgroundOptions.gradient) {
    options.backgroundOptions!.gradient = {
      type: style.backgroundOptions.gradient.type,
      rotation: style.backgroundOptions.gradient.rotation ?? 0,
      colorStops: style.backgroundOptions.gradient.colorStops,
    };
  }

  // Logo
  if (style.logo && style.logo.src) {
    options.image = processedLogoSrc || style.logo.src;
  }

  return options;
}

export function createQRCodeInstance(config: QRConfig, processedLogoSrc?: string): QRCodeStyling {
  const options = mapQRConfigToStylingOptions(config, processedLogoSrc);
  return new QRCodeStyling(options);
}
