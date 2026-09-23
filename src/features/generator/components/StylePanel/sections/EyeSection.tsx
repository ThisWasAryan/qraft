import React from 'react';
import { useQRStore } from '../../../../../stores/qrStore';
import type { QRCornerSquareType, QRCornerDotType } from '../../../../../domain/types';

const SQUARE_TYPES: { id: QRCornerSquareType; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Dot' },
  { id: 'extra-rounded', label: 'Extra Rounded' },
];

const DOT_TYPES: { id: QRCornerDotType; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Dot' },
];

export const EyeSection: React.FC = () => {
  const squareType = useQRStore((state) => state.config.style.cornerSquareOptions.type);
  const dotType = useQRStore((state) => state.config.style.cornerDotOptions.type);
  const setStyle = useQRStore((state) => state.setStyle);

  const handleSquareChange = (type: QRCornerSquareType) => {
    setStyle({ cornerSquareOptions: { ...useQRStore.getState().config.style.cornerSquareOptions, type } });
  };

  const handleDotChange = (type: QRCornerDotType) => {
    setStyle({ cornerDotOptions: { ...useQRStore.getState().config.style.cornerDotOptions, type } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Eye Frame Shape
        </label>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {SQUARE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSquareChange(type.id)}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                border: `1px solid ${squareType === type.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                backgroundColor: squareType === type.id ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-surface)',
                color: squareType === type.id ? 'var(--color-primary)' : 'var(--color-text)',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Eye Center Shape
        </label>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {DOT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleDotChange(type.id)}
              style={{
                flex: 1,
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

    </div>
  );
};
