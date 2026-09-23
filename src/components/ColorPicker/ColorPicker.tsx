import React from 'react';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  color,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.controls}>
        <div 
          className={styles.swatchWrapper} 
          style={{ backgroundColor: color }}
        >
          <input
            type="color"
            className={styles.colorInput}
            value={color}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Choose ${label} color`}
          />
        </div>
        <input
          type="text"
          className={styles.hexInput}
          value={color.toUpperCase()}
          onChange={(e) => {
            const val = e.target.value;
            // Let the user type, we'll only update if it's a valid hex or let them finish
            if (/^#[0-9A-F]{0,6}$/i.test(val)) {
              onChange(val);
            }
          }}
          onBlur={(e) => {
            // Force valid hex on blur
            let val = e.target.value;
            if (!/^#[0-9A-Fa-f]{6}$/i.test(val)) {
              onChange('#000000'); // Fallback or could just not update
            }
          }}
        />
      </div>
    </div>
  );
};
