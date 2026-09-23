import { z } from 'zod';

export const urlSchema = z.object({
  type: z.literal('url'),
  url: z.string()
    .min(1, 'Please enter a URL')
    .transform(val => val.trim())
    .transform(val => {
      if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine((val) => {
      try {
        if (val.toLowerCase().startsWith('javascript:')) return false;
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL'),
});

export const textSchema = z.object({
  type: z.literal('text'),
  text: z.string()
    .min(1, 'Please enter some text')
    .refine((val) => new Blob([val]).size <= 2953, 'Text exceeds maximum QR code capacity (2953 bytes)'),
});

export const emailSchema = z.object({
  type: z.literal('email'),
  to: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  subject: z.string().optional(),
  body: z.string().optional(),
  cc: z.string().email('Invalid CC email').optional().or(z.literal('')),
  bcc: z.string().email('Invalid BCC email').optional().or(z.literal('')),
});

export const phoneSchema = z.object({
  type: z.literal('phone'),
  number: z.string() // It is named 'number' in types.ts (PhoneContent), not 'phone'
    .min(1, 'Phone number is required')
    .refine(
      (val) => val.replace(/\D/g, '').length >= 7,
      'Please enter a valid phone number (at least 7 digits)'
    ),
});

export const wifiSchema = z.object({
  type: z.literal('wifi'),
  ssid: z.string().min(1, 'SSID is required').max(32, 'SSID cannot exceed 32 characters'),
  authType: z.enum(['WPA', 'WEP', 'nopass']), // named 'authType' in types.ts
  password: z.string().optional().default(''), // password may not exist
  hidden: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.authType === 'WPA' && (!data.password || data.password.length < 8 || data.password.length > 63)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be 8-63 characters for WPA',
      path: ['password'],
    });
  } else if (data.authType === 'WEP') {
    const len = data.password.length;
    if (![5, 10, 13, 26].includes(len)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'WEP key must be 5, 10, 13, or 26 characters',
        path: ['password'],
      });
    }
  } else if (data.authType === 'nopass' && data.password.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be empty for open networks',
      path: ['password'],
    });
  }
});
