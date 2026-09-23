import React, { useState } from 'react';
import styles from './ColorPicker.module.css';
import { ColorPicker } from './ColorPicker';
import type { QRGradient } from '../../domain/types';

interface AdvancedColorPickerProps {
  label: string;
  color: string;
  gradient?: QRGradient;
  onChange: (color: string, gradient?: QRGradient) => void;
}

export const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  label,
  color,
  gradient,
  onChange,
}) => {
  const [mode, setMode] = useState<'solid' | 'gradient'>(gradient ? 'gradient' : 'solid');

  React.useEffect(() => {
    setMode(gradient ? 'gradient' : 'solid');
  }, [gradient]);

  const handleModeChange = (newMode: 'solid' | 'gradient') => {
    setMode(newMode);
    if (newMode === 'solid') {
      onChange(color, undefined);
    } else {
      // Default gradient
      onChange(color, {
        type: 'linear',
        rotation: 45 * (Math.PI / 180),
        colorStops: [
          { offset: 0, color: color },
          { offset: 1, color: '#000000' }
        ]
      });
    }
  };

  const handleGradientTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!gradient) return;
    onChange(color, { ...gradient, type: e.target.value as 'linear' | 'radial' });
  };

  const handleStopColorChange = (index: number, newColor: string) => {
    if (!gradient) return;
    const newStops = [...gradient.colorStops];
    newStops[index].color = newColor;
    onChange(color, { ...gradient, colorStops: newStops });
  };

  return (
    <div className={styles.advancedContainer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className={styles.label}>{label}</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', backgroundColor: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button 
            style={{ padding: '4px 8px', fontSize: '12px', border: 'none', background: mode === 'solid' ? 'var(--color-primary)' : 'transparent', color: mode === 'solid' ? 'white' : 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => handleModeChange('solid')}
          >
            Solid
          </button>
          <button 
            style={{ padding: '4px 8px', fontSize: '12px', border: 'none', background: mode === 'gradient' ? 'var(--color-primary)' : 'transparent', color: mode === 'gradient' ? 'white' : 'var(--color-text)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => handleModeChange('gradient')}
          >
            Gradient
          </button>
        </div>
      </div>

      {mode === 'solid' && (
        <ColorPicker 
          label="Solid Color" 
          color={color} 
          onChange={(newColor) => onChange(newColor, undefined)} 
        />
      )}

      {mode === 'gradient' && gradient && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Type</label>
              <select 
                value={gradient.type} 
                onChange={handleGradientTypeChange}
                style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>
            {gradient.type === 'linear' && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Angle</label>
                <input 
                  type="range" 
                  min="0" max="360" 
                  value={Math.round((gradient.rotation || 0) * (180 / Math.PI))}
                  onChange={(e) => onChange(color, { ...gradient, rotation: parseInt(e.target.value) * (Math.PI / 180) })}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ColorPicker 
                label="Start Color" 
                color={gradient.colorStops[0].color} 
                onChange={(c) => handleStopColorChange(0, c)} 
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ColorPicker 
                label="End Color" 
                color={gradient.colorStops[1].color} 
                onChange={(c) => handleStopColorChange(1, c)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
