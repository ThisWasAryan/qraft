import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

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
  number: z.string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        const parsed = parsePhoneNumberFromString(val);
        return parsed ? parsed.isValid() : val.replace(/\D/g, '').length >= 7;
      },
      'Please enter a valid international phone number'
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

export const smsSchema = z.object({
  type: z.literal('sms'),
  number: z.string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        const parsed = parsePhoneNumberFromString(val);
        return parsed ? parsed.isValid() : val.replace(/\D/g, '').length >= 7;
      },
      'Please enter a valid international phone number'
    ),
  message: z.string().optional(),
});

export const whatsappSchema = z.object({
  type: z.literal('whatsapp'),
  number: z.string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        const parsed = parsePhoneNumberFromString(val);
        return parsed ? parsed.isValid() : val.replace(/\D/g, '').length >= 7;
      },
      'Please enter a valid international phone number'
    ),
  message: z.string().optional(),
});

export const vcardSchema = z.object({
  type: z.literal('vcard'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional().refine(val => !val || (() => {
    const parsed = parsePhoneNumberFromString(val);
    return parsed ? parsed.isValid() : val.replace(/\D/g, '').length >= 7;
  })(), 'Please enter a valid international phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.firstName || data.lastName, {
  message: "At least a first or last name is required",
  path: ['firstName']
});

export const upiSchema = z.object({
  type: z.literal('upi'),
  payeeAddress: z.string()
    .min(1, 'Payee Address (UPI ID) is required')
    .regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format (e.g., name@bank)'),
  payeeName: z.string().min(1, 'Payee Name is required'),
  amount: z.string().optional().refine(val => {
    if (!val) return true;
    return /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0;
  }, 'Amount must be greater than 0 with up to 2 decimal places'),
  currency: z.string().min(1, 'Currency is required').default('INR'),
  transactionNote: z.string().max(50, 'Note must not exceed 50 characters').optional(),
  isFixedAmount: z.boolean().default(true),
});
