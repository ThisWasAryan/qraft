import React from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { RANDOMIZER_PALETTES } from '../../../../domain/randomizer/palettes';
import { Sparkles } from 'lucide-react';

export const RandomizeButton: React.FC = () => {
  const setStyle = useQRStore((state) => state.setStyle);
  const setErrorCorrection = useQRStore((state) => state.setErrorCorrection);
  
  const handleRandomize = () => {
    // Pick a random palette
    const randomIndex = Math.floor(Math.random() * RANDOMIZER_PALETTES.length);
    const palette = RANDOMIZER_PALETTES[randomIndex];
    
    // Apply styles
    setStyle({
      dotOptions: {
        ...useQRStore.getState().config.style.dotOptions,
        ...palette.dotOptions
      },
      ...(palette.cornerSquareOptions && {
        cornerSquareOptions: {
          ...useQRStore.getState().config.style.cornerSquareOptions,
          ...palette.cornerSquareOptions
        }
      }),
      ...(palette.cornerDotOptions && {
        cornerDotOptions: {
          ...useQRStore.getState().config.style.cornerDotOptions,
          ...palette.cornerDotOptions
        }
      }),
      ...(palette.backgroundOptions && {
        backgroundOptions: {
          ...useQRStore.getState().config.style.backgroundOptions,
          ...palette.backgroundOptions
        }
      })
    });
    
    if (palette.errorCorrection) {
      setErrorCorrection(palette.errorCorrection);
    }
  };

  return (
    <button
      onClick={handleRandomize}
      title="Surprise Me!"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-xs)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        backgroundColor: 'var(--color-surface-hover)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--color-text)',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: 'var(--font-size-sm)',
        transition: 'all var(--transition-fast)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
        e.currentTarget.style.color = 'var(--color-primary)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
        e.currentTarget.style.color = 'var(--color-text)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <Sparkles size={16} />
      <span>Surprise Me</span>
    </button>
  );
};
