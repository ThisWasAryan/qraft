import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { QRPreset, QRConfig } from '../../../../domain/types';
import { QRPreview } from '../QRPreview';
import { DEFAULT_QR_CONFIG } from '../../../../domain/types';
import styles from './PresetBrowser.module.css';

interface PresetCardProps {
  preset: QRPreset;
  isActive: boolean;
  onApply: (presetId: string) => void;
  index: number;
}

const PREVIEW_PAYLOAD = 'https://qraft.app/preset-preview';

export const PresetCard: React.FC<PresetCardProps> = ({ preset, isActive, onApply, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const previewConfig: QRConfig = useMemo(() => {
    const originalMargin = preset.style.margin ?? DEFAULT_QR_CONFIG.style.margin ?? 0;
    const scale = 120 / 1000;
    const scaledMargin = Math.round(originalMargin * scale);

    return {
      content: { type: 'url', url: PREVIEW_PAYLOAD },
      errorCorrection: preset.errorCorrection ?? 'H',
      style: {
        ...DEFAULT_QR_CONFIG.style,
        ...preset.style,
        width: 120,
        height: 120,
        margin: scaledMargin,
      },
    };
  }, [preset.errorCorrection, preset.style]);

  return (
    <button
      ref={cardRef}
      onClick={() => onApply(preset.id)}
      className={isActive ? `${styles.presetCard} ${styles.presetCardActive}` : styles.presetCard}
      aria-pressed={isActive}
    >
      <div className={styles.previewWrapper}>
        {isVisible ? (
          <QRPreview config={previewConfig} debounceMs={0} isThumbnail={true} />
        ) : (
          <div className={styles.previewPlaceholder}></div>
        )}
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.cardTitleWrapper}>
          {preset.style.logo && (
            <img 
              src={preset.style.logo.src} 
              alt="" 
              loading="lazy"
              style={{ width: 16, height: 16, objectFit: 'contain' }} 
            />
          )}
          <span className={styles.presetName}>{preset.name}</span>
        </div>
      </div>
    </button>
  );
};
