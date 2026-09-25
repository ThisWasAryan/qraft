import { create } from 'zustand';
import { temporal } from 'zundo';
import type { QRConfig, QRContent, QRContentType, QRStyle, ErrorCorrectionLevel } from '../domain/types';
import { DEFAULT_QR_CONFIG } from '../domain/types';
import { validateQRContent } from '../domain/validators';
import { analyzeReliability } from '../domain/reliability';
import { generateRandomPalette } from '../domain/randomizer/generateRandomPalette';
import { getMaxErrorCorrectionLevel } from '../utils/capacity';
import { QR_PRESETS } from '../domain/presets/registry';

interface QRState {
  config: QRConfig;
  
  activePresetId: string | null;
  basePresetId: string | null;

  // Validation state
  isContentValid: boolean;
  contentErrors: Array<{ field: string; message: string; severity: 'error' | 'warning' }>;

  // Actions
  setContent: (content: Partial<QRContent>) => void;
  setContentType: (type: QRContentType) => void;
  setStyle: (style: Partial<QRStyle>) => void;
  setErrorCorrection: (level: ErrorCorrectionLevel) => void;
  loadConfig: (config: QRConfig) => void;
  resetConfig: () => void;
  autoFixReliability: () => void;
  randomizeDesign: () => void;
  applyPreset: (presetId: string) => void;
  resetPreset: () => void;
}

// Initial content shells for fast switching
const initialContentByType: Record<QRContentType, QRContent> = {
  url: { type: 'url', url: '' },
  text: { type: 'text', text: '' },
  email: { type: 'email', to: '' },
  phone: { type: 'phone', number: '' },
  wifi: { type: 'wifi', ssid: '', password: '', authType: 'WPA', hidden: false },
  sms: { type: 'sms', number: '', message: '' },
  whatsapp: { type: 'whatsapp', number: '', message: '' },
  vcard: { type: 'vcard', firstName: '', lastName: '', organization: '', title: '', phone: '', email: '', url: '', street: '', city: '', state: '', zip: '', country: '', notes: '' },
  upi: { type: 'upi', payeeAddress: '', payeeName: '', amount: '', currency: 'INR', transactionNote: '', isFixedAmount: true },
};

export const useQRStore = create<QRState>()(
  temporal(
    (set) => ({
      config: DEFAULT_QR_CONFIG,
      activePresetId: null,
      basePresetId: null,
      
      isContentValid: true,
      contentErrors: [],

      setContent: (contentUpdate) => {
        set((state) => {
          let newContent: QRContent;
          if (contentUpdate.type && contentUpdate.type !== state.config.content.type) {
            newContent = { ...initialContentByType[contentUpdate.type], ...contentUpdate } as QRContent;
          } else {
            newContent = { ...state.config.content, ...contentUpdate } as QRContent;
          }
          
          const validation = validateQRContent(newContent);
          
          let newErrorCorrection = state.config.errorCorrection;
          const maxLevel = getMaxErrorCorrectionLevel(newContent);
          const rank: Record<ErrorCorrectionLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
          
          if (rank[newErrorCorrection] > rank[maxLevel]) {
            newErrorCorrection = maxLevel;
          }
          
          let newStyle = { ...state.config.style };
          
          if (newStyle.autoAdjustMargins !== false) {
             const tempConfig = {
               ...state.config,
               content: newContent,
               errorCorrection: newErrorCorrection,
             };
             const report = analyzeReliability(tempConfig);
             
             const quietZoneCheck = report.checks.find(c => c.id === 'quiet-zone');
             if (quietZoneCheck && (quietZoneCheck.severity === 'warning' || quietZoneCheck.severity === 'danger')) {
               newStyle.margin = 40;
             }
             
             const framePaddingCheck = report.checks.find(c => c.id === 'quiet-zone-frame');
             if (framePaddingCheck && (framePaddingCheck.severity === 'warning' || framePaddingCheck.severity === 'danger') && newStyle.frame) {
               newStyle.frame = { ...newStyle.frame, padding: 40 };
             }
          }
          
          return {
            config: {
              ...state.config,
              content: newContent,
              style: newStyle,
              errorCorrection: newErrorCorrection,
            },
            isContentValid: validation.isValid,
            contentErrors: validation.errors,
          };
        });
      },

      setContentType: (type) => {
        set((state) => {
          // Avoid resetting if we're already on this type
          if (state.config.content.type === type) return state;

          const newContent = initialContentByType[type];
          const validation = validateQRContent(newContent);

          let newErrorCorrection = state.config.errorCorrection;
          const maxLevel = getMaxErrorCorrectionLevel(newContent);
          const rank: Record<ErrorCorrectionLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
          
          if (rank[newErrorCorrection] > rank[maxLevel]) {
            newErrorCorrection = maxLevel;
          }

          let newStyle = { ...state.config.style };
          
          if (newStyle.autoAdjustMargins !== false) {
             const tempConfig = {
               ...state.config,
               content: newContent,
               errorCorrection: newErrorCorrection,
             };
             const report = analyzeReliability(tempConfig);
             
             const quietZoneCheck = report.checks.find(c => c.id === 'quiet-zone');
             if (quietZoneCheck && (quietZoneCheck.severity === 'warning' || quietZoneCheck.severity === 'danger')) {
               newStyle.margin = 40;
             }
             
             const framePaddingCheck = report.checks.find(c => c.id === 'quiet-zone-frame');
             if (framePaddingCheck && (framePaddingCheck.severity === 'warning' || framePaddingCheck.severity === 'danger') && newStyle.frame) {
               newStyle.frame = { ...newStyle.frame, padding: 40 };
             }
          }

          return {
            config: {
              ...state.config,
              content: newContent,
              style: newStyle,
              errorCorrection: newErrorCorrection,
            },
            isContentValid: validation.isValid,
            contentErrors: validation.errors,
          };
        });
      },

      setStyle: (styleUpdate) => {
        set((state) => {
          let newStyle = { ...state.config.style, ...styleUpdate };
          
          if (styleUpdate.autoAdjustMargins === true) {
            // Instantly evaluate when toggled ON
             const tempConfig = {
               ...state.config,
               style: newStyle,
             };
             const report = analyzeReliability(tempConfig);
             
             const quietZoneCheck = report.checks.find(c => c.id === 'quiet-zone');
             if (quietZoneCheck && (quietZoneCheck.severity === 'warning' || quietZoneCheck.severity === 'danger')) {
               newStyle.margin = 40;
             }
             
             const framePaddingCheck = report.checks.find(c => c.id === 'quiet-zone-frame');
             if (framePaddingCheck && (framePaddingCheck.severity === 'warning' || framePaddingCheck.severity === 'danger') && newStyle.frame) {
               newStyle.frame = { ...newStyle.frame, padding: 40 };
             }
          }
          
          return {
            activePresetId: null,
            config: {
              ...state.config,
              style: newStyle,
            },
          };
        });
      },

      setErrorCorrection: (level) => {
        set((state) => ({
          activePresetId: null,
          config: {
            ...state.config,
            errorCorrection: level,
          },
        }));
      },

      resetConfig: () => {
        set({
          config: DEFAULT_QR_CONFIG,
          activePresetId: null,
          basePresetId: null,
          isContentValid: true,
          contentErrors: [],
        });
      },

      loadConfig: (config) => {
        set({
          config,
          activePresetId: null,
          basePresetId: null,
          isContentValid: true,
          contentErrors: [],
        });
      },

      autoFixReliability: () => {
        set((state) => {
          const report = analyzeReliability(state.config);
          const hasIssues = report.overallScore === 'warning' || report.overallScore === 'danger';
          if (!hasIssues) return state;

          const newConfig = { ...state.config };
          const newStyle = { ...newConfig.style };
          let changed = false;

          for (const check of report.checks) {
            if (check.severity === 'good') continue;

            if (check.id === 'contrast' || check.id === 'gradient-contrast') {
              // Smart Tiered Auto-Fix
              // Tier 1: Try setting background to pure white
              const tier1Style = { 
                ...newStyle, 
                backgroundOptions: { ...newStyle.backgroundOptions, color: '#FFFFFF', gradient: undefined } 
              };
              const tier1Fails = analyzeReliability({ ...newConfig, style: tier1Style }).checks.some(c => 
                (c.id === 'contrast' || c.id === 'gradient-contrast') && (c.severity === 'warning' || c.severity === 'danger')
              );

              if (!tier1Fails) {
                newStyle.backgroundOptions = tier1Style.backgroundOptions;
              } else {
                // Tier 2: Try setting background to pure black
                const tier2Style = { 
                  ...newStyle, 
                  backgroundOptions: { ...newStyle.backgroundOptions, color: '#000000', gradient: undefined } 
                };
                const tier2Fails = analyzeReliability({ ...newConfig, style: tier2Style }).checks.some(c => 
                  (c.id === 'contrast' || c.id === 'gradient-contrast') && (c.severity === 'warning' || c.severity === 'danger')
                );

                if (!tier2Fails) {
                  newStyle.backgroundOptions = tier2Style.backgroundOptions;
                } else {
                  // Tier 3: Nuke
                  newStyle.dotOptions = { ...newStyle.dotOptions, color: '#000000', gradient: undefined };
                  newStyle.backgroundOptions = { ...newStyle.backgroundOptions, color: '#FFFFFF', gradient: undefined };
                }
              }
              changed = true;
            }
            if (check.id === 'eye-contrast') {
              newStyle.cornerSquareOptions = { ...newStyle.cornerSquareOptions, color: '#000000', gradient: undefined };
              newStyle.cornerDotOptions = { ...newStyle.cornerDotOptions, color: '#000000', gradient: undefined };
              changed = true;
            }
            if (check.id === 'quiet-zone' || check.id === 'quiet-zone-frame') {
              newStyle.margin = Math.max(newStyle.margin ?? 0, 40);
              if (newStyle.frame && newStyle.frame.style !== 'none') {
                newStyle.frame = { ...newStyle.frame, padding: Math.max(newStyle.frame.padding ?? 0, 40) };
              }
              changed = true;
            }
            if (check.id === 'error-correction-logo' || check.id === 'error-correction') {
              newConfig.errorCorrection = 'H';
              changed = true;
            }
            if (check.id === 'logo-size') {
              if (newStyle.logo) {
                newStyle.logo = { ...newStyle.logo, size: 0.2 };
                changed = true;
              }
            }
            if (check.id === 'module-shape') {
              newStyle.dotOptions = { ...newStyle.dotOptions, type: 'square' };
              changed = true;
            }
            if (check.id === 'corner-shape') {
              newStyle.cornerSquareOptions = { ...newStyle.cornerSquareOptions, type: 'square' };
              newStyle.cornerDotOptions = { ...newStyle.cornerDotOptions, type: 'dot' };
              changed = true;
            }
            if (check.id === 'output-size') {
              newStyle.width = Math.max(newStyle.width, 1000);
              newStyle.height = Math.max(newStyle.height, 1000);
              changed = true;
            }
          }

          if (changed) {
            newConfig.style = newStyle;
            return { config: newConfig, activePresetId: null };
          }
          
          return state;
        });
      },

      randomizeDesign: () => {
        set((state) => {
          const randomPalette = generateRandomPalette();
          return {
            activePresetId: null,
            config: {
              ...state.config,
              errorCorrection: state.config.errorCorrection,
              style: {
                ...state.config.style,
                dotOptions: { ...state.config.style.dotOptions, ...randomPalette.dotOptions },
                cornerSquareOptions: { ...state.config.style.cornerSquareOptions, ...randomPalette.cornerSquareOptions },
                cornerDotOptions: { ...state.config.style.cornerDotOptions, ...randomPalette.cornerDotOptions },
                backgroundOptions: { ...state.config.style.backgroundOptions, ...randomPalette.backgroundOptions },
              },
            },
          };
        });
      },

      applyPreset: (presetId: string) => {
        set((state) => {
          const preset = QR_PRESETS.find(p => p.id === presetId);
          if (!preset) return state;

          return {
            activePresetId: preset.id,
            basePresetId: preset.id,
            config: {
              ...state.config,
              errorCorrection: preset.errorCorrection ?? state.config.errorCorrection,
              style: {
                ...state.config.style,
                ...preset.style,
              },
            },
          };
        });
      },

      resetPreset: () => {
        set((state) => {
          if (!state.basePresetId) return state;
          const preset = QR_PRESETS.find(p => p.id === state.basePresetId);
          if (!preset) return state;

          return {
            activePresetId: preset.id,
            config: {
              ...state.config,
              errorCorrection: preset.errorCorrection ?? state.config.errorCorrection,
              style: {
                ...state.config.style,
                ...preset.style,
              },
            },
          };
        });
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({ 
        config: state.config, 
        activePresetId: state.activePresetId, 
        basePresetId: state.basePresetId 
      }),
      handleSet: (handleSet) => {
        let timeout: ReturnType<typeof setTimeout>;
        return (state) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => handleSet(state), 500);
        };
      },
    }
  )
);
