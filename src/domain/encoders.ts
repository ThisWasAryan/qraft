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
    // encodeURIComponent encodes \n as %0A, but we specifically need %0D%0A (CRLF) for some email clients per RFC 6068
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

export function encodePhonePayload(phoneNumber: string): string {
  if (!phoneNumber) return '';
  // Strip visual separators: spaces, hyphens, parentheses
  let cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  return `tel:${cleaned}`;
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
