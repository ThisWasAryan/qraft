import { describe, it, expect } from 'vitest';
import { solveSolidContrast, isForegroundInfeasible } from '../solidSolver';
import { getContrastRatio } from '../../../utils/color';

describe('solidSolver', () => {
  describe('isForegroundInfeasible', () => {
    it('should identify when a foreground target is achievable', () => {
      // White background, target 4.5
      // Black foreground will give 21:1, so it is achievable
      expect(isForegroundInfeasible(1, 4.5)).toBe(false);
    });

    it('should identify when a foreground target is impossible', () => {
      // Background luminance 0.18 (middle gray)
      // Pure black (0) against 0.18 gives (0.18+0.05)/(0+0.05) = 4.6
      // Pure white (1) against 0.18 gives (1+0.05)/(0.18+0.05) = 4.56
      // So a target of 7.0 is impossible
      expect(isForegroundInfeasible(0.18, 7.0)).toBe(true);
    });
  });

  describe('solveSolidContrast', () => {
    it('should return null if target is infeasible', () => {
      const result = solveSolidContrast('#888888', '#888888', 21); // Target 21 against mid-gray is impossible
      expect(result).toBeNull();
    });

    it('should return the original color if already passing', () => {
      const fg = '#000000';
      const bg = '#ffffff';
      const result = solveSolidContrast(fg, bg, 4.5);
      expect(result?.hex).toBe('#000000');
    });

    it('should adjust a failing color to meet the target', () => {
      const fg = '#777777';
      const bg = '#ffffff';
      // Contrast of #777777 vs #ffffff is ~4.48 (almost passing 4.5)
      // Let's ask for 7.0
      const result = solveSolidContrast(fg, bg, 7.0);
      
      expect(result).not.toBeNull();
      if (result) {
        const achieved = getContrastRatio(result.hex, bg);
        expect(achieved).toBeGreaterThanOrEqual(7.0);
      }
    });

    it('should adjust gracefully with minimal hue shift', () => {
      // Light blue against white (fails)
      const fg = '#3498db';
      const bg = '#ffffff';
      const result = solveSolidContrast(fg, bg, 4.5);

      expect(result).not.toBeNull();
      if (result) {
        const achieved = getContrastRatio(result.hex, bg);
        expect(achieved).toBeCloseTo(4.5, 1);
        // It should become a darker blue, not a completely different hue
        // Just checking that it didn't turn black
        expect(result.hex).not.toBe('#000000');
      }
    });
  });
});
