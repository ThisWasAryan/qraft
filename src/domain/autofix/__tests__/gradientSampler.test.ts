import { describe, it, expect } from 'vitest';
import { sampleGradientAtPoint, findNearestStopIndex, findWorstContrastRegion } from '../gradientSampler';
import type { QRGradient } from '../../types';

describe('gradientSampler', () => {
  const linearGrad: QRGradient = {
    type: 'linear',
    rotation: 0, // left-to-right
    colorStops: [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#ffffff' }
    ]
  };

  const radialGrad: QRGradient = {
    type: 'radial',
    colorStops: [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#ffffff' }
    ]
  };

  describe('sampleGradientAtPoint', () => {
    it('should sample linear gradients correctly', () => {
      // Rotation 0 means x determines the blend
      const cLeft = sampleGradientAtPoint(linearGrad, 0, 0.5);
      const cRight = sampleGradientAtPoint(linearGrad, 1, 0.5);
      const cCenter = sampleGradientAtPoint(linearGrad, 0.5, 0.5);

      // t mapping: proj = x - 0.5. t = proj + 0.5 = x.
      expect(cLeft).toBe('#000000');
      expect(cRight).toBe('#ffffff');
      expect(cCenter).toBe('#808080'); // approximate middle
    });

    it('should sample radial gradients from center', () => {
      const cCenter = sampleGradientAtPoint(radialGrad, 0.5, 0.5);
      const cEdge = sampleGradientAtPoint(radialGrad, 1, 0.5);

      // Center is distance 0 (t=0)
      expect(cCenter).toBe('#000000');
      
      // Edge is distance 0.5, t = 0.5 * 2 = 1
      expect(cEdge).toBe('#ffffff');
    });
  });

  describe('findNearestStopIndex', () => {
    it('should find nearest stop for linear gradients', () => {
      expect(findNearestStopIndex(linearGrad, 0, 0.5)).toBe(0);
      expect(findNearestStopIndex(linearGrad, 0.2, 0.5)).toBe(0);
      expect(findNearestStopIndex(linearGrad, 0.8, 0.5)).toBe(1);
      expect(findNearestStopIndex(linearGrad, 1, 0.5)).toBe(1);
    });

    it('should find nearest stop for radial gradients', () => {
      expect(findNearestStopIndex(radialGrad, 0.5, 0.5)).toBe(0); // center
      expect(findNearestStopIndex(radialGrad, 1, 0.5)).toBe(1); // edge
    });
  });

  describe('findWorstContrastRegion', () => {
    it('should find worst contrast region accurately', () => {
      // Linear gradient black to white against solid black
      // The worst region should be near x=0 (t=0) where fg is black and bg is black
      const regions = findWorstContrastRegion(
        '#000000', linearGrad,
        '#000000', undefined
      );

      expect(regions.length).toBeGreaterThan(0);
      const worst = regions[0];
      
      // Black vs Black -> contrast ratio 1:1
      expect(worst.contrast).toBeCloseTo(1, 1);
      // The position should be on the left side (x near 0)
      expect(worst.x).toBeLessThan(0.2);
    });
  });
});
