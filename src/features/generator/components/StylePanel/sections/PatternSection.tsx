import React from 'react';
import { useQRStore } from '../../../../../stores/qrStore';
import type { QRDotType } from '../../../../../domain/types';
import { Slider } from '../../../../../components/Slider/Slider';

const DOT_TYPES: { id: QRDotType; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dots', label: 'Dots' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'classy', label: 'Classy' },
  { id: 'classy-rounded', label: 'Classy Rounded' },
  { id: 'extra-rounded', label: 'Extra Rounded' },
];

export const PatternSection: React.FC = () => {
  const dotType = useQRStore((state) => state.config.style.dotOptions.type);
  const margin = useQRStore((state) => state.config.style.margin);
  const setStyle = useQRStore((state) => state.setStyle);

  const handleTypeChange = (type: QRDotType) => {
    setStyle({ dotOptions: { ...useQRStore.getState().config.style.dotOptions, type } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
          Pattern Shape
        </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--spacing-sm)' }}>
        {DOT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            style={{
              padding: 'var(--spacing-sm)',
              border: `1px solid ${dotType === type.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              backgroundColor: dotType === type.id ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-surface)',
              color: dotType === type.id ? 'var(--color-primary)' : 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
          >
            {type.label}
          </button>
        ))}
      </div>
      </div>
      
      <Slider
        label="Quiet Zone (Margin) in px"
        value={margin ?? 0}
        min={0}
        max={200}
        step={5}
        onChange={(val) => setStyle({ margin: val })}
      />
    </div>
  );
};
