import { describe, it, expect } from 'vitest';
import {
  encodeUrlPayload,
  encodeTextPayload,
  encodeEmailPayload,
  encodePhonePayload,
  encodeWifiPayload,
} from '../encoders';

describe('QR Payload Encoders', () => {
  describe('encodeUrlPayload', () => {
    it('returns url as is without prepending', () => {
      expect(encodeUrlPayload('example.com')).toBe('example.com');
      expect(encodeUrlPayload('www.example.com/path')).toBe('www.example.com/path');
    });

    it('keeps existing protocols', () => {
      expect(encodeUrlPayload('https://example.com')).toBe('https://example.com');
      expect(encodeUrlPayload('ftp://example.com')).toBe('ftp://example.com');
    });

    it('trims whitespace', () => {
      expect(encodeUrlPayload('  https://example.com  ')).toBe('https://example.com');
    });

    it('returns empty string if falsy', () => {
      expect(encodeUrlPayload('')).toBe('');
    });
  });

  describe('encodeTextPayload', () => {
    it('returns exact string', () => {
      expect(encodeTextPayload('Hello World\nNew Line')).toBe('Hello World\nNew Line');
    });
  });

  describe('encodeEmailPayload', () => {
    it('formats basic mailto', () => {
      expect(encodeEmailPayload({ email: 'test@example.com' })).toBe('mailto:test@example.com');
    });

    it('percent encodes subject and body', () => {
      expect(
        encodeEmailPayload({
          email: 'test@example.com',
          subject: 'Hello World',
          body: 'Line 1\nLine 2',
        })
      ).toBe('mailto:test@example.com?subject=Hello%20World&body=Line%201%0D%0ALine%202');
    });

    it('includes cc and bcc', () => {
      expect(
        encodeEmailPayload({
          email: 'test@example.com',
          cc: 'cc@example.com',
          bcc: 'bcc@example.com',
        })
      ).toBe('mailto:test@example.com?cc=cc%40example.com&bcc=bcc%40example.com');
    });

    it('returns empty string if no email', () => {
      expect(encodeEmailPayload({ email: '' })).toBe('');
    });
  });

  describe('encodePhonePayload', () => {
    it('strips visual separators', () => {
      expect(encodePhonePayload('+1 (555) 123-4567')).toBe('tel:+15551234567');
      expect(encodePhonePayload('1 800 123 4567')).toBe('tel:18001234567');
    });

    it('returns empty string if empty', () => {
      expect(encodePhonePayload('')).toBe('');
    });
  });

  describe('encodeWifiPayload', () => {
    it('formats basic WPA', () => {
      expect(
        encodeWifiPayload({
          ssid: 'My Network',
          password: 'password123',
          authType: 'WPA',
        })
      ).toBe('WIFI:T:WPA;S:My Network;P:password123;;');
    });

    it('formats nopass', () => {
      expect(
        encodeWifiPayload({
          ssid: 'Free WiFi',
          authType: 'nopass',
        })
      ).toBe('WIFI:T:nopass;S:Free WiFi;;');
    });

    it('formats hidden networks', () => {
      expect(
        encodeWifiPayload({
          ssid: 'HiddenNet',
          password: 'password123',
          authType: 'WPA',
          hidden: true,
        })
      ).toBe('WIFI:T:WPA;S:HiddenNet;P:password123;H:true;;');
    });

    it('escapes special characters', () => {
      expect(
        encodeWifiPayload({
          ssid: 'My;Net\\work:1',
          password: 'pass"word,2',
          authType: 'WPA',
        })
      ).toBe('WIFI:T:WPA;S:My\\;Net\\\\work\\:1;P:pass\\"word\\,2;;');
    });

    it('returns empty string if no ssid', () => {
      expect(encodeWifiPayload({ ssid: '', authType: 'nopass' })).toBe('');
    });
  });
});
