import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { QR_PRESETS } from '../../../../domain/presets/registry';
import { PresetCard } from './PresetCard';
import type { PresetCategory, QRPreset } from '../../../../domain/types';
import styles from './PresetBrowser.module.css';
import githubLightLogo from '../../../../assets/presets/logos/github-light.svg';

const CATEGORIES: { label: string; value: PresetCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Messaging', value: 'messaging' },
  { label: 'Social', value: 'social' },
  { label: 'Developer', value: 'developer' },
  { label: 'Music', value: 'music' },
];

function getThemedPreset(preset: QRPreset, theme: 'light' | 'dark'): QRPreset {
  if (theme === 'light') return preset;
  
  const p = structuredClone(preset);
  
  if (p.style.backgroundOptions) p.style.backgroundOptions.color = '#16171d';
  if (p.style.logo?.plate) {
    p.style.logo.plate.color = '#16171d';
  }

  if (p.id === 'github') {
    if (p.style.dotOptions) p.style.dotOptions.color = '#FFFFFF';
    if (p.style.cornerSquareOptions) p.style.cornerSquareOptions.color = '#F3F4F6';
    if (p.style.cornerDotOptions) p.style.cornerDotOptions.color = '#F3F4F6';
    if (p.style.logo) p.style.logo.src = githubLightLogo;
  }

  return p;
}

export const PresetBrowser: React.FC = () => {
  const activePresetId = useQRStore((state) => state.activePresetId);
  const basePresetId = useQRStore((state) => state.basePresetId);
  const resetPreset = useQRStore((state) => state.resetPreset);
  
  const [filter, setFilter] = useState<PresetCategory | 'all'>('all');
  const [presetTheme, setPresetTheme] = useState<'light' | 'dark'>('light');

  const filteredPresets = QR_PRESETS.filter(
    (preset) => filter === 'all' || preset.category === filter
  ).map((p) => getThemedPreset(p, presetTheme));

  const isModified = basePresetId && activePresetId === null;
  const currentPresetName = isModified 
    ? QR_PRESETS.find(p => p.id === basePresetId)?.name 
    : QR_PRESETS.find(p => p.id === activePresetId)?.name;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.title}>
            Start with a visual style
            <div className={styles.themeToggle}>
              <button 
                onClick={() => setPresetTheme('light')} 
                className={presetTheme === 'light' ? `${styles.themeBtn} ${styles.themeBtnActive}` : styles.themeBtn}
              >
                Light
              </button>
              <button 
                onClick={() => setPresetTheme('dark')} 
                className={presetTheme === 'dark' ? `${styles.themeBtn} ${styles.themeBtnActive}` : styles.themeBtn}
              >
                Dark
              </button>
            </div>
          </div>
          <p className={styles.subtitle}>
            Choose a preset and customize it further.
          </p>
        </div>
        
        {isModified && (
          <div className={styles.modifiedState}>
            <div className={styles.modifiedName}>
              {currentPresetName} (Modified)
            </div>
            <button onClick={resetPreset} className={styles.resetBtn}>
              Reset preset
            </button>
          </div>
        )}
      </div>

      <div className={styles.categoriesScroll}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={filter === cat.value ? `${styles.categoryBtn} ${styles.categoryBtnActive}` : styles.categoryBtn}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.presetsScroll}>
        {filteredPresets.map((preset, index) => (
          <PresetCard
            key={preset.id}
            index={index}
            preset={preset}
            isActive={activePresetId === preset.id}
            onApply={() => {
              const store = useQRStore.getState();
              store.setStyle(preset.style);
              store.setErrorCorrection(preset.errorCorrection ?? 'H');
              useQRStore.setState({ activePresetId: preset.id, basePresetId: preset.id });
            }}
          />
        ))}
      </div>
    </div>
  );
};
