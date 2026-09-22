# QR Code Payload Encoding Standards

This document outlines the exact data formats and encoding rules required to generate reliable, widely-compatible QR code payloads in the Qraft project. It serves as the specification for the implementation agents building the payload generator functions.

## Summary

| Content Type | URI Scheme / Format | Key Encoding Rule |
|--------------|---------------------|-------------------|
| **URL** | `https://[domain][path]` | Auto-prepend `https://` if missing. |
| **Plain Text** | Raw UTF-8 String | Passed as-is. |
| **Email** | `mailto:[email]?subject=...` | RFC 3986 percent-encoding (spaces as `%20`). |
| **Phone** | `tel:[number]` | E.164 format (no visual separators, `+` prefix). |
| **Wi-Fi** | `WIFI:T:[type];S:[ssid];;` | Backslash-escape specific special characters. |

---

## 1. URL

URLs must be perfectly formed to ensure scanners immediately recognize them as web links and prompt the user to open a browser.

*   **Format**: `[protocol]://[domain][path]`
*   **Protocol**: The protocol prefix (`http://` or `https://`) is **REQUIRED** for reliable scanning.
    *   *Auto-prepend*: If the user inputs a URL without a protocol, Qraft must automatically prepend `https://`.
*   **Special Characters**: Use standard URL encoding (percent-encoding).
*   **IDN (Internationalized Domain Names)**: Should use Punycode for maximum compatibility across older scanners.
*   **Capacity Limits**: Maximum practical length is ~300 characters for reliable mobile scanning (theoretical maximum is 2,953 bytes).
*   **Example**: `https://example.com/path?query=hello%20world`

## 2. Plain Text

Used for sharing arbitrary text, notes, or codes.

*   **Format**: Raw text, no prefix required.
*   **Encoding**: UTF-8.
*   **Multiline**: Supported using standard `\n` (LF) line breaks.
*   **Capacity Limits**: Maximum practical length is ~1,000 characters for reliable scanning.
*   **Example**: 
    ```text
    Hello world!
    This is multiline.
    ```

## 3. Email (`mailto:`)

Generates an email template when scanned.

*   **Format**: `mailto:[email]?subject=[subject]&body=[body]&cc=[cc]&bcc=[bcc]`
*   **Encoding**: Follows RFC 6068 / RFC 3986. Standard URI percent-encoding must be applied to all query parameters.
    *   **Spaces**: Must be encoded as `%20` (do **NOT** use `+`).
    *   **Newlines**: Must be encoded as `%0D%0A` (CRLF) in the body parameter.
*   **Multiple Recipients**: Comma-separated email addresses.
*   **Example**: `mailto:user@example.com?subject=Hello&body=Hi%20there%0D%0A%0D%0AHow%20are%20you%3F`

## 4. Phone (`tel:`)

Initiates a phone call.

*   **Format**: `tel:[phone_number]`
*   **Encoding**: Follows RFC 3966.
*   **Formatting**: Use E.164 international format: `+[country_code][number]`.
    *   **NO visual separators**: Hyphens `-`, spaces ` `, and parentheses `()` must be stripped from the user's input.
*   **Example**: `tel:+14155552671`

## 5. Wi-Fi

Automatically connects the scanner's device to a specific Wi-Fi network.

*   **Format**: `WIFI:T:[auth_type];S:[ssid];P:[password];H:[hidden];;`
*   **Auth Types (`T`)**: `WPA` (covers WPA/WPA2/WPA3), `WEP`, or `nopass`.
*   **Hidden Flag (`H`)**: Set to `true` if the network is hidden. Omit the parameter entirely or set to `false` if visible.
*   **Ending**: MUST end with a double semicolon `;;`.
*   **Special Character Escaping**: This is critical. Inside the SSID (`S`) and password (`P`) fields, the following characters **must** be escaped with a backslash `\`:
    *   Semicolon `;` → `\;`
    *   Colon `:` → `\:`
    *   Comma `,` → `\,`
    *   Backslash `\` → `\\`
    *   Double quote `"` → `\"`
*   **Example** (For SSID `My Network` and password `Pass;word\123`):
    `WIFI:T:WPA;S:My Network;P:Pass\;word\\123;;`

---

## Encoding Responsibility Split

It is critical to distinguish what the Qraft application logic does versus what the QR generation library (`qr-code-styling`) handles.

### 1. Qraft (Application Code)
Qraft is strictly responsible for **constructing the correct payload string** for the given content type. 
*   Constructing `mailto:` URIs with correct percent-encoding.
*   Constructing `tel:` URIs with strict E.164 formatting (stripping spaces/dashes).
*   Constructing `WIFI:` strings with manual backslash escaping for special characters.
*   Ensuring URLs have valid protocol prefixes.

### 2. QR Library (`qr-code-styling`)
The library is responsible for **encoding the payload string into physical QR modules** per the ISO 18004 standard. It handles:
*   Data encoding mode selection (numeric, alphanumeric, byte, kanji).
*   Error correction codewords generation.
*   Module placement.
*   Masking pattern selection.

---

## Implementation Signatures

The implementation agent should expose exact encoder functions with the following TypeScript signatures to encapsulate the Qraft payload responsibilities:

```typescript
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

// Generates correct https://... format
export function encodeUrlPayload(url: string): string;

// Passthrough for UTF-8 string
export function encodeTextPayload(text: string): string;

// Handles percent-encoding, %20 for spaces, %0D%0A for newlines
export function encodeEmailPayload(params: EmailPayload): string;

// Strips visual characters, ensures E.164 + format
export function encodePhonePayload(phoneNumber: string): string;

// Handles specific backslash escaping (\;, \:, \\, etc.)
export function encodeWifiPayload(params: WifiPayload): string;
```

---

## Future Types

When extending the application, future content types will follow similar strict standardizations:
*   **vCard (Contacts)**: `BEGIN:VCARD\nVERSION:3.0\n...\nEND:VCARD`
*   **SMS**: `SMSTO:[phone]:[message]`
*   **Calendar**: iCalendar standard format (RFC 5545)
