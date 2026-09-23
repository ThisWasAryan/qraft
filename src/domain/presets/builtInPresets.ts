import type { QRPreset } from '../types';

export const BUILT_IN_PRESETS: QRPreset[] = [
  {
    id: 'classic',
    name: 'Classic Black',
    description: 'The standard, highly reliable black and white QR code.',
    category: 'basic',
    isBuiltIn: true,
    style: {
      dotOptions: { type: 'square', color: '#000000' },
      cornerSquareOptions: { type: 'square', color: '#000000' },
      cornerDotOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#FFFFFF' },
    },
    errorCorrection: 'M',
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'A friendly, rounded design with a soft blue gradient.',
    category: 'professional',
    isBuiltIn: true,
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#2563eb',
        gradient: {
          type: 'linear',
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#1d4ed8' },
          ],
        },
      },
      cornerSquareOptions: { type: 'extra-rounded', color: '#1e40af' },
      cornerDotOptions: { type: 'dot', color: '#1e40af' },
      backgroundOptions: { color: '#f8fafc' },
    },
    errorCorrection: 'Q',
  },
  {
    id: 'minimal-dots',
    name: 'Minimal Dots',
    description: 'Clean and airy dotted matrix design.',
    category: 'creative',
    isBuiltIn: true,
    style: {
      dotOptions: { type: 'dots', color: '#475569' },
      cornerSquareOptions: { type: 'dot', color: '#334155' },
      cornerDotOptions: { type: 'dot', color: '#334155' },
      backgroundOptions: { color: '#ffffff' },
    },
    errorCorrection: 'Q',
  },
];
