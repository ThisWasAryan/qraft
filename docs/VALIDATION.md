# QRaft Content Validation

This document outlines the validation rules and architecture for the various QR code content types supported by QRaft. We use [Zod](https://zod.dev/) for robust, schema-based validation.

## Principle

**Validation must not be unnecessarily restrictive.** 
A valid URL is a valid URL, even if it doesn't match a simplistic regex. Our goal is to guide the user towards creating scannable and functional QR codes without artificially blocking valid, edge-case inputs.

---

## Content Type Validation Rules

### URL Validation
* **Required:** Non-empty string.
* **Protocol Handling:** Auto-prepend `https://` if no protocol prefix is detected.
* **Schemes:** Accept `http://`, `https://`, and other schemes (e.g., `ftp://`).
* **Validation Method:** Use the browser-native `URL()` constructor for validation (RFC 3986 compliant).
* **Warnings:** 
  * Warn (do not reject) for very long URLs (>500 chars).
  * Warn for URLs without a Top-Level Domain (TLD) as localhost and IP addresses are technically valid.
  * Warn for `data:` URLs.
* **Errors:**
  * Reject `javascript:` URLs for security reasons.
  * Trailing spaces should be trimmed automatically.
* **Error Messages:** "Please enter a valid URL."

```typescript
const urlSchema = z.object({
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
```

### Plain Text Validation
* **Required:** Non-empty string.
* **Limits:**
  * Error when text exceeds **2953 bytes** (the theoretical maximum capacity of a Version 40 QR code with low error correction).
  * Warn when text exceeds ~1000 characters (the resulting QR code may be too dense for some scanners).
* **Restrictions:** No character restrictions. Unicode and emoji are fully valid.
* **Error Messages:** "Please enter some text."

```typescript
const textSchema = z.object({
  type: z.literal('text'),
  text: z.string()
    .min(1, 'Please enter some text')
    .refine((val) => new Blob([val]).size <= 2953, 'Text exceeds maximum QR code capacity (2953 bytes)'),
});
```

### Email Validation
* **Fields:** 
  * `to` (required): Must be a valid email format.
  * `subject`, `body`, `cc`, `bcc` (optional).
* **Validation Method:** Use Zod's `.email()` or an equivalent reasonable check. Do not reject valid but unusual emails (e.g., plus addressing, subdomains).
* **Warnings:** Warn if the total generated `mailto:` URI length exceeds ~500 characters.
* **Error Messages:** "Please enter a valid email address."

```typescript
const emailSchema = z.object({
  type: z.literal('email'),
  to: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  subject: z.string().optional(),
  body: z.string().optional(),
  cc: z.string().email('Invalid CC email').optional().or(z.literal('')),
  bcc: z.string().email('Invalid BCC email').optional().or(z.literal('')),
});
```

### Phone Validation
* **Required:** Non-empty string.
* **Format:** Accept digits, `+`, `-`, spaces, and parentheses. (Note: Formatting characters should be stripped during the actual URI encoding).
* **Validation:** Require at least 7 digits in total.
* **Warnings:** Warn if there is no country code (`+XX`). Do not reject valid international formats.
* **Error Messages:** "Please enter a valid phone number."

```typescript
const phoneSchema = z.object({
  type: z.literal('phone'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => val.replace(/\D/g, '').length >= 7,
      'Please enter a valid phone number (at least 7 digits)'
    ),
});
```

### Wi-Fi Validation
* **SSID:** Required, 1-32 characters.
* **Auth Type:** Must be one of `WPA`, `WEP`, `nopass`.
* **Password:** 
  * Required if auth type is `WPA` or `WEP`.
  * Must be empty if auth type is `nopass`.
  * `WPA` password: 8-63 characters.
  * `WEP` key: 5, 13, 10, or 26 characters (depending on key type).
* **Hidden:** Boolean, optional (defaults to `false`).
* **Warnings:** Warn about special characters in SSID/password, as they work but require proper escaping in the generated string.
* **Error Messages:** "SSID is required", "Password must be 8-63 characters for WPA".

```typescript
const wifiSchema = z.object({
  type: z.literal('wifi'),
  ssid: z.string().min(1, 'SSID is required').max(32, 'SSID cannot exceed 32 characters'),
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
  password: z.string(),
  hidden: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.encryption === 'WPA' && (data.password.length < 8 || data.password.length > 63)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be 8-63 characters for WPA',
      path: ['password'],
    });
  } else if (data.encryption === 'WEP') {
    const len = data.password.length;
    if (![5, 10, 13, 26].includes(len)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'WEP key must be 5, 10, 13, or 26 characters',
        path: ['password'],
      });
    }
  } else if (data.encryption === 'nopass' && data.password.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be empty for open networks',
      path: ['password'],
    });
  }
});
```

---

## Validation Architecture

### Validation Result Type

To provide a consistent interface for the UI, all validation schemas should map their outputs/errors to a unified state type. This allows the UI to distinguish between critical errors (which block generation) and warnings.

```typescript
interface QRFieldError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface QRValidationResult {
  isValid: boolean; // true if no 'error' severity items are present
  errors: QRFieldError[];
}
```

### Real-Time Validation UX

* **Validation Timing:** Validate on every change, debounced with user input.
* **Error Display:** Only show `error` severity messages *after* a field has been touched (i.e., on `blur` or attempted submit) to avoid yelling at the user while they type.
* **Warning Display:** Warnings can be shown immediately, as they act as helpful hints rather than hard blocks.
* **Generation Blocker:** Do not prevent QR generation for warnings. Only block generation if there are active `error` severity items.

### User-Facing Error Messages

* **Tone:** Keep messages short, polite, and actionable.
* **Language:** Use sentence case.
* **Clarity:** Never show technical jargon, raw regex patterns, or stack traces.
* **Guidance:** Provide suggestions where possible (e.g., "Phone number needs at least 7 digits").

### Validation States

The form UI should reflect the following states based on validation feedback:

| State | Description | QR Generation |
| :--- | :--- | :--- |
| **Empty** | No input yet | Blocked (show empty state) |
| **Incomplete** | Partial input (user is typing, field not touched) | Blocked (show hint/placeholder) |
| **Invalid** | Validation error (after touch/blur) | Blocked (show error message) |
| **Warning** | Valid but potentially problematic (e.g., long string) | Allowed (show warning message) |
| **Valid** | All checks pass | Allowed |
