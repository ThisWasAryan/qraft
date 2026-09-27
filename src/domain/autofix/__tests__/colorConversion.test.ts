import { describe, it, expect } from 'vitest';
import { hexToOklch, oklchToHex } from '../colorConversion';

describe('colorConversion', () => {
  it('should convert hex to oklch and back with high fidelity', () => {
    const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#888888', '#3498db', '#e74c3c'];

    for (const hex of colors) {
      const oklch = hexToOklch(hex);
      const roundTripHex = oklchToHex(oklch.L, oklch.C, oklch.H);
      expect(roundTripHex.toLowerCase()).toBe(hex.toLowerCase());
    }
  });

  it('should clamp out-of-gamut colors to valid sRGB hex', () => {
    // Arbitrary OKLCH values that are known to be far outside sRGB
    const crazyOklch = { L: 0.9, C: 0.8, H: 120 }; // extremely bright, impossible chroma green
    const hex = oklchToHex(crazyOklch.L, crazyOklch.C, crazyOklch.H);

    // Should return a valid hex code without throwing
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
