import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
// Let's just redefine the payload types here or import them. Since they are in types.ts we can import from there.
// Actually, previously encoders.ts had `EmailPayload` and `WifiPayload` locally defined.
// Let's redefine local payload types for clarity or use the ones from types.ts directly if they match.
export interface EmailPayload {
  email: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}

export interface WifiPayload {
  ssid: string;
  password?: string;
  authType: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface SMSPayload {
  number: string;
  message?: string;
}

export interface WhatsAppPayload {
  number: string;
  message?: string;
}

export interface VCardPayload {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
}

export interface UPIPayload {
  payeeAddress: string;
  payeeName: string;
  amount?: string;
  currency: string;
  transactionNote?: string;
}

export function encodeUrlPayload(url: string): string {
  if (!url) return '';
  return url.trim();
}

export function encodeTextPayload(text: string): string {
  return text;
}

export function encodeEmailPayload(params: EmailPayload): string {
  if (!params.email) return '';
  
  let mailto = `mailto:${params.email}`;
  const queryParams: string[] = [];

  if (params.subject) {
    queryParams.push(`subject=${encodeURIComponent(params.subject)}`);
  }
  if (params.body) {
    const bodyEncoded = encodeURIComponent(params.body).replace(/%0A/g, '%0D%0A');
    queryParams.push(`body=${bodyEncoded}`);
  }
  if (params.cc) {
    queryParams.push(`cc=${encodeURIComponent(params.cc)}`);
  }
  if (params.bcc) {
    queryParams.push(`bcc=${encodeURIComponent(params.bcc)}`);
  }

  if (queryParams.length > 0) {
    mailto += `?${queryParams.join('&')}`;
  }

  return mailto;
}

// Normalizes a phone number to international format (e.g. +919876543210).
// If invalid, returns the original stripped of spaces/hyphens as fallback.
export function normalizePhoneNumber(number: string): string {
  if (!number) return '';
  const parsed = parsePhoneNumberFromString(number);
  if (parsed && parsed.isValid()) {
    return parsed.format('E.164'); // '+919876543210'
  }
  return number.replace(/[\s\-()]/g, '');
}

export function encodePhonePayload(phoneNumber: string): string {
  const norm = normalizePhoneNumber(phoneNumber);
  if (!norm) return '';
  return `tel:${norm}`;
}

export function encodeWifiPayload(params: WifiPayload): string {
  if (!params.ssid) return '';

  const escapeSpecialChars = (str: string) => {
    return str.replace(/([\\;:,"])/g, '\\$1');
  };

  const escapedSsid = escapeSpecialChars(params.ssid);
  let wifiStr = `WIFI:T:${params.authType};S:${escapedSsid};`;

  if (params.password && params.authType !== 'nopass') {
    wifiStr += `P:${escapeSpecialChars(params.password)};`;
  }

  if (params.hidden) {
    wifiStr += `H:true;`;
  }

  wifiStr += ';';
  return wifiStr;
}

export function encodeSmsPayload(params: SMSPayload): string {
  const norm = normalizePhoneNumber(params.number);
  if (!norm) return '';
  let uri = `sms:${norm}`;
  if (params.message) {
    uri += `?body=${encodeURIComponent(params.message)}`;
  }
  return uri;
}

export function encodeWhatsAppPayload(params: WhatsAppPayload): string {
  const norm = normalizePhoneNumber(params.number);
  let uri = 'https://wa.me/';
  
  if (norm) {
    // WhatsApp requires number without '+'
    uri += norm.replace('+', '');
  }
  
  if (params.message) {
    const sep = norm ? '?' : '?';
    uri += `${sep}text=${encodeURIComponent(params.message)}`;
  }
  
  return uri;
}

// vCard 3.0 specific escaping
function escapeVCardValue(value: string): string {
  if (!value) return '';
  // According to vCard 3.0: 
  // commas, semicolons, and backslashes must be escaped with a backslash.
  // newlines must be \n.
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n');
}

export function encodeVCardPayload(params: VCardPayload): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0'
  ];

  // N: LastName;FirstName;MiddleName;Prefix;Suffix
  const fn = escapeVCardValue(params.firstName || '');
  const ln = escapeVCardValue(params.lastName || '');
  lines.push(`N:${ln};${fn};;;`);
  
  // FN is required in vCard
  let fullName = `${params.firstName || ''} ${params.lastName || ''}`.trim();
  if (!fullName) fullName = 'Contact';
  lines.push(`FN:${escapeVCardValue(fullName)}`);

  if (params.organization) {
    lines.push(`ORG:${escapeVCardValue(params.organization)}`);
  }
  if (params.title) {
    lines.push(`TITLE:${escapeVCardValue(params.title)}`);
  }
  if (params.phone) {
    // we can normalize the phone number as well
    const norm = normalizePhoneNumber(params.phone);
    lines.push(`TEL;TYPE=CELL:${norm}`);
  }
  if (params.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(params.email)}`);
  }
  if (params.url) {
    lines.push(`URL:${escapeVCardValue(params.url)}`);
  }

  // Address: Post Office Box; Extended Address; Street; Locality(City); Region(State); Postal Code; Country Name
  if (params.street || params.city || params.state || params.zip || params.country) {
    const street = escapeVCardValue(params.street || '');
    const city = escapeVCardValue(params.city || '');
    const state = escapeVCardValue(params.state || '');
    const zip = escapeVCardValue(params.zip || '');
    const country = escapeVCardValue(params.country || '');
    lines.push(`ADR;TYPE=HOME:;;${street};${city};${state};${zip};${country}`);
  }

  if (params.notes) {
    lines.push(`NOTE:${escapeVCardValue(params.notes)}`);
  }

  lines.push('END:VCARD');
  
  return lines.join('\n');
}

export function encodeUpiPayload(params: UPIPayload): string {
  if (!params.payeeAddress || !params.payeeName) return '';
  
  const query = new URLSearchParams();
  query.set('pa', params.payeeAddress);
  query.set('pn', params.payeeName);
  
  if (params.amount) {
    query.set('am', params.amount);
  }
  
  query.set('cu', params.currency || 'INR');
  
  if (params.transactionNote) {
    query.set('tn', params.transactionNote);
  }
  
  return `upi://pay?${query.toString()}`;
}
