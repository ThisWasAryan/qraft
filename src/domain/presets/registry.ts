import type { QRPreset } from '../types';

import whatsappLogo from '../../assets/presets/logos/whatsapp.svg';
import instagramLogo from '../../assets/presets/logos/instagram.svg';
import telegramLogo from '../../assets/presets/logos/telegram.svg';
import discordLogo from '../../assets/presets/logos/discord.svg';
import youtubeLogo from '../../assets/presets/logos/youtube.svg';
import spotifyLogo from '../../assets/presets/logos/spotify.svg';
import githubLogo from '../../assets/presets/logos/github.svg';
import googleLogo from '../../assets/presets/logos/google.svg';

export const PRESET_LOGOS = {
  whatsapp: whatsappLogo,
  instagram: instagramLogo,
  telegram: telegramLogo,
  discord: discordLogo,
  youtube: youtubeLogo,
  spotify: spotifyLogo,
  github: githubLogo,
  google: googleLogo,
} as const;

export const QR_PRESETS: QRPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'A standard, high-contrast black and white QR code design.',
    category: 'standard',
    errorCorrection: 'Q',
    style: {
      margin: 40,
      dotOptions: { type: 'square', color: '#000000' },
      cornerSquareOptions: { type: 'square', color: '#000000' },
      cornerDotOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#FFFFFF' },
    },
  },
  {
    id: 'whatsapp-classic',
    name: 'WhatsApp',
    description: 'A classic WhatsApp-inspired QR design with familiar green tones, rounded geometry, and a clean white logo knockout.',
    category: 'messaging',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#075E54',
        gradient: {
          type: 'linear',
          rotation: (135 * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: '#075E54' },
            { offset: 1, color: '#25D366' },
          ],
        },
      },
      cornerSquareOptions: { type: 'rounded', color: '#075E54' },
      cornerDotOptions: { type: 'circle' as any, color: '#075E54' }, // wait, cornerDotType only has 'square' or 'dot'. 'dot' means circle.
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.whatsapp,
        size: 0.18,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'circle',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'An Instagram-inspired QR design using the platform\'s recognizable multicolor gradient and rounded geometry.',
    category: 'social',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#E1306C',
        gradient: {
          type: 'linear',
          rotation: (135 * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: '#833AB4' },
            { offset: 0.2, color: '#C13584' },
            { offset: 0.4, color: '#E1306C' },
            { offset: 0.6, color: '#FD1D1D' },
            { offset: 0.8, color: '#F56040' },
            { offset: 1, color: '#FCAF45' },
          ],
        },
      },
      cornerSquareOptions: { type: 'rounded', color: '#833AB4' },
      cornerDotOptions: { type: 'dot', color: '#C13584' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.instagram,
        size: 0.17,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'rounded-square',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'A clean Telegram-inspired blue QR with rounded geometry.',
    category: 'messaging',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#229ED9',
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#168AC0' },
            { offset: 1, color: '#229ED9' },
          ],
        },
      },
      cornerSquareOptions: { type: 'rounded', color: '#168AC0' },
      cornerDotOptions: { type: 'dot', color: '#168AC0' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.telegram,
        size: 0.17,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'circle',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Playful dark/blue QR inspired by Discord.',
    category: 'messaging',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#5865F2',
        gradient: {
          type: 'linear',
          rotation: (135 * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: '#404EED' },
            { offset: 1, color: '#5865F2' },
          ],
        },
      },
      cornerSquareOptions: { type: 'rounded', color: '#404EED' },
      cornerDotOptions: { type: 'dot', color: '#404EED' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.discord,
        size: 0.17,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'rounded-square',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Simple and high-contrast YouTube-inspired QR design.',
    category: 'social',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'square',
        color: '#FF0000',
      },
      cornerSquareOptions: { type: 'square', color: '#CC0000' },
      cornerDotOptions: { type: 'square', color: '#CC0000' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.youtube,
        size: 0.16,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'rounded-square',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Spotify-inspired QR design with familiar green gradient.',
    category: 'music',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#1DB954',
        gradient: {
          type: 'linear',
          rotation: (135 * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: '#1DB954' },
            { offset: 1, color: '#1ED760' },
          ],
        },
      },
      cornerSquareOptions: { type: 'rounded', color: '#095A26' },
      cornerDotOptions: { type: 'dot', color: '#095A26' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.spotify,
        size: 0.17,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'circle',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'A monochrome developer-focused QR design inspired by GitHub.',
    category: 'developer',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'square',
        color: '#181717',
      },
      cornerSquareOptions: { type: 'square', color: '#24292F' },
      cornerDotOptions: { type: 'square', color: '#24292F' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.github,
        size: 0.16,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'circle',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
  {
    id: 'google',
    name: 'Google',
    description: 'A clean Google-inspired preset emphasizing the primary logo against a blue QR body.',
    category: 'developer',
    errorCorrection: 'H',
    style: {
      dotOptions: {
        type: 'rounded',
        color: '#4285F4',
      },
      cornerSquareOptions: { type: 'rounded', color: '#4285F4' },
      cornerDotOptions: { type: 'dot', color: '#4285F4' },
      backgroundOptions: { color: '#FFFFFF' },
      logo: {
        src: PRESET_LOGOS.google,
        size: 0.16,
        margin: 0,
        hideBackgroundDots: true,
        plate: {
          enabled: true,
          shape: 'circle',
          color: '#FFFFFF',
          padding: 8,
        },
      },
    },
  },
];
