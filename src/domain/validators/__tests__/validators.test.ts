import { describe, it, expect } from 'vitest';
import { validateQRContent } from '../index';

describe('QR Validation', () => {
  describe('URL Validation', () => {
    it('accepts valid URLs', () => {
      const result = validateQRContent({ type: 'url', url: 'https://example.com' });
      expect(result.isValid).toBe(true);
    });

    it('auto-prepends https for naked domains', () => {
      const result = validateQRContent({ type: 'url', url: 'example.com' });
      expect(result.isValid).toBe(true);
    });

    it('rejects javascript: urls', () => {
      const result = validateQRContent({ type: 'url', url: 'javascript:alert(1)' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.severity === 'error')).toBe(true);
    });

    it('warns on long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(600);
      const result = validateQRContent({ type: 'url', url: longUrl });
      expect(result.isValid).toBe(true);
      expect(result.errors.some(e => e.severity === 'warning' && e.message.includes('Long URLs'))).toBe(true);
    });
  });

  describe('Text Validation', () => {
    it('accepts normal text', () => {
      const result = validateQRContent({ type: 'text', text: 'Hello World' });
      expect(result.isValid).toBe(true);
    });

    it('warns on text > 1000 chars', () => {
      const longText = 'a'.repeat(1001);
      const result = validateQRContent({ type: 'text', text: longText });
      expect(result.isValid).toBe(true);
      expect(result.errors.some(e => e.severity === 'warning')).toBe(true);
    });

    it('rejects empty text', () => {
      const result = validateQRContent({ type: 'text', text: '' });
      expect(result.isValid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('accepts valid email', () => {
      const result = validateQRContent({ type: 'email', to: 'test@example.com' });
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = validateQRContent({ type: 'email', to: 'not-an-email' });
      expect(result.isValid).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('accepts valid phone numbers', () => {
      const result = validateQRContent({ type: 'phone', number: '+1 555-123-4567' });
      expect(result.isValid).toBe(true);
    });

    it('rejects too short phone numbers', () => {
      const result = validateQRContent({ type: 'phone', number: '123' });
      expect(result.isValid).toBe(false);
    });

    it('warns if no + prefix', () => {
      const result = validateQRContent({ type: 'phone', number: '555-123-4567' });
      expect(result.isValid).toBe(true);
      expect(result.errors.some(e => e.severity === 'warning')).toBe(true);
    });
  });

  describe('WiFi Validation', () => {
    it('accepts valid WPA config', () => {
      const result = validateQRContent({ type: 'wifi', ssid: 'MyNet', authType: 'WPA', password: 'password123', hidden: false });
      expect(result.isValid).toBe(true);
    });

    it('rejects WPA with short password', () => {
      const result = validateQRContent({ type: 'wifi', ssid: 'MyNet', authType: 'WPA', password: 'short', hidden: false });
      expect(result.isValid).toBe(false);
    });

    it('accepts valid nopass config', () => {
      const result = validateQRContent({ type: 'wifi', ssid: 'FreeWifi', authType: 'nopass', password: '', hidden: false });
      expect(result.isValid).toBe(true);
    });

    it('rejects nopass with password', () => {
      const result = validateQRContent({ type: 'wifi', ssid: 'FreeWifi', authType: 'nopass', password: 'password123', hidden: false });
      expect(result.isValid).toBe(false);
    });
  });
});
