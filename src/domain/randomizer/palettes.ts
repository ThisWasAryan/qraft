import type { QRDesignPalette } from '../types';

export const RANDOMIZER_PALETTES: QRDesignPalette[] = [
  {
    id: 'sunset',
    name: 'Sunset Orange',
    dotOptions: {
      type: 'rounded',
      color: '#ea580c',
      gradient: {
        type: 'linear',
        rotation: 45 * (Math.PI / 180),
        colorStops: [
          { offset: 0, color: '#f97316' },
          { offset: 1, color: '#c2410c' },
        ],
      },
    },
    cornerSquareOptions: { type: 'extra-rounded', color: '#9a3412' },
    cornerDotOptions: { type: 'dot', color: '#7c2d12' },
    errorCorrection: 'H', // Force high correction for stylized QRs
  },
  {
    id: 'forest',
    name: 'Forest Green',
    dotOptions: {
      type: 'classy',
      color: '#16a34a',
      gradient: {
        type: 'radial',
        colorStops: [
          { offset: 0, color: '#22c55e' },
          { offset: 1, color: '#15803d' },
        ],
      },
    },
    cornerSquareOptions: { type: 'dot', color: '#166534' },
    cornerDotOptions: { type: 'dot', color: '#14532d' },
    errorCorrection: 'H',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    dotOptions: {
      type: 'classy-rounded',
      color: '#d946ef',
    },
    cornerSquareOptions: { type: 'square', color: '#8b5cf6' },
    cornerDotOptions: { type: 'square', color: '#06b6d4' },
    backgroundOptions: { color: '#0f172a' },
    errorCorrection: 'H',
  },
];
