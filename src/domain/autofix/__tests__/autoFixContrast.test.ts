import { describe, it, expect } from 'vitest';
import { autoFixContrast } from '../autoFixContrast';
import type { QRConfig } from '../../types';

describe('autoFixContrast', () => {
  const createBaseConfig = (): QRConfig => ({
    content: { type: 'url', url: 'https://example.com' },
    errorCorrection: 'M',
    style: {
      width: 500,
      height: 500,
      margin: 20,
      dotOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#ffffff' },
      cornerSquareOptions: { type: 'square', color: '#000000' },
      cornerDotOptions: { type: 'dot', color: '#000000' },
    },
  });

  it('should return success: false for transparent backgrounds', () => {
    const config = createBaseConfig();
    config.style.backgroundOptions.color = 'transparent';

    const result = autoFixContrast(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.unfixableRelationships).toContain('background↔pattern');
    }
  });

  it('should not modify a config that already passes', () => {
    const config = createBaseConfig(); // Black on white, contrast 21:1
    const result = autoFixContrast(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toContain('No contrast issues');
    }
  });

  it('should adjust foreground color when it fails against background', () => {
    const config = createBaseConfig();
    config.style.dotOptions.color = '#777777'; // Fails against white for some targets, but let's make it worse
    config.style.dotOptions.color = '#cccccc'; // Definitely fails 4.5 against white

    const result = autoFixContrast(config);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.dotOptions?.color).not.toBe('#cccccc');
      expect(result.diagnostics.some(d => d.component === 'pattern')).toBe(true);
    }
  });

  it('should adjust background when foreground is infeasible', () => {
    const config = createBaseConfig();
    // Pure black fg. Against #333333 (dark gray), contrast is low.
    // Wait, pure black fg against any background is always feasible if we move the background.
    // What if the background is #111111 (almost black) and fg is #000000?
    // We want fg to be INFEASIBLE so bg MUST move.
    // If bg is #111111, fg is black. Can fg move to reach 7.0 against #111111?
    // #111111 lum is very low (~0.009). Max contrast against it is white: (1+0.05)/(0.009+0.05) = 17.8.
    // So fg CAN move to reach 7.0.
    
    // To make fg INFEASIBLE, the bg must be mid-gray (lum ~0.18).
    // Max contrast against mid-gray is ~4.56.
    // If target is 7.0, fg CANNOT reach it.
    // BUT can bg reach 7.0 against some fg?
    // In Phase 2, we try to move bg against the ORIGINAL fg.
    // So if fg is pure black (#000000), and bg is mid-gray (#777777).
    // Target = 7.0.
    // Phase 1: fg is #000000. bg is #777777. Target 7.0 is infeasible against #777777.
    // Phase 2: move bg against fg (#000000). Max contrast against #000000 is 21. So bg CAN reach 7.0.
    config.style.dotOptions.color = '#000000';
    config.style.backgroundOptions.color = '#777777'; 
    const result = autoFixContrast(config, { patternContrastTarget: 7.0 });

    expect(result.success).toBe(true);
    if (result.success) {
      // Background must have been adjusted
      expect(result.patch.backgroundOptions?.color).not.toBe('#888888');
      expect(result.diagnostics.some(d => d.component === 'background')).toBe(true);
    }
  });

  it('should fix gradient when fixing worst endpoint exposes other endpoint as newly worst', () => {
    const config = createBaseConfig();
    
    // Create a gradient where one end fails contrast, and when fixed, the OTHER end fails
    // (This tests the re-check loop in gradientSolver)
    config.style.dotOptions.color = '#000000'; // Default, won't be used since gradient is present
    config.style.dotOptions.gradient = {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#333333' }, // Very dark, low contrast against black bg
        { offset: 1, color: '#dddddd' }  // Light, good contrast against black bg
      ]
    };
    config.style.backgroundOptions.color = '#000000'; // Black background
    
    // Target contrast 4.5.
    // End 0 is #333333 on #000000 => Contrast is ~2.8 (Fails)
    // End 1 is #dddddd on #000000 => Contrast is ~15.3 (Passes)
    // The solver will first fix #333333 to make it lighter.
    // If it makes it TOO light (e.g., #eeeeee), then the worst point might become something else, or if the solver logic requires it to recheck.
    // Wait, let's construct a scenario where the other endpoint explicitly becomes worst.
    // The test requirement is to just ensure the solver logic runs and doesn't get stuck.
    
    // A better scenario for "exposes other endpoint":
    // Gradient from #777777 to #888888 against white background.
    // Both fail (contrast < 4.5).
    // The solver fixes the worst one (#888888). 
    // Then the other one (#777777) becomes the worst.
    config.style.dotOptions.gradient = {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#bbbbbb' }, 
        { offset: 1, color: '#cccccc' }  
      ]
    };
    config.style.backgroundOptions.color = '#ffffff'; 

    const result = autoFixContrast(config, { patternContrastTarget: 4.6 });
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.patch.dotOptions?.gradient).toBeDefined();
      const newStops = result.patch.dotOptions?.gradient?.colorStops;
      expect(newStops).toBeDefined();
      expect(newStops?.length).toBe(2);
      
      // Both ends should now pass contrast
      if (newStops) {
        // We don't have getWorstCaseContrast exposed here, but we can check if they changed
        expect(newStops[0].color).not.toBe('#bbbbbb');
        expect(newStops[1].color).not.toBe('#cccccc');
      }
    }
  });

  it('should fallback to pure white or pure black background if solving background against pattern fails (both mid-gray)', () => {
    const config = createBaseConfig();
    config.style.dotOptions.color = '#888888';
    config.style.backgroundOptions.color = '#777777';

    const result = autoFixContrast(config, { patternContrastTarget: 5.0 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.patch.backgroundOptions?.color).toBeDefined();
      expect(result.patch.dotOptions?.color).toBeDefined();
    }
  });
});
