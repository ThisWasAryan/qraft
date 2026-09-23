import React from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { BUILT_IN_PRESETS } from '../../../../domain/presets/builtInPresets';
import type { QRPreset } from '../../../../domain/types';

export const PresetSelector: React.FC = () => {
  const setStyle = useQRStore((state) => state.setStyle);
  
  const handleApplyPreset = (preset: QRPreset) => {
    setStyle(preset.style);
  };

  return (
    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>Quick Presets</h3>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', overflowX: 'auto', paddingBottom: 'var(--spacing-xs)', scrollbarWidth: 'none' }}>
        {BUILT_IN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <div style={{
               width: 32,
               height: 32,
               borderRadius: '50%',
               marginBottom: 'var(--spacing-xs)',
               background: preset.style.dotOptions?.color || '#000000',
               border: `2px solid ${preset.style.backgroundOptions?.color || '#FFFFFF'}`,
               boxShadow: '0 0 0 1px var(--color-border)'
            }} />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, textAlign: 'center' }}>
              {preset.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
