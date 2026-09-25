import React, { useRef } from 'react';
import { useQRStore } from '../../../../../stores/qrStore';
import { ImagePlus, Trash2, RotateCcw } from 'lucide-react';
import { Slider } from '../../../../../components/Slider/Slider';
import { Toggle } from '../../../../../components/Toggle/Toggle';
import { ColorPicker } from '../../../../../components/ColorPicker/ColorPicker';
import { Select } from '../../../../../components/Select/Select';

export const LogoSection: React.FC = () => {
  const logo = useQRStore((state) => state.config.style.logo);
  const setStyle = useQRStore((state) => state.setStyle);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setStyle({
        logo: {
          src,
          size: 0.2,
          margin: 0,
          hideBackgroundDots: true,
          opacity: 1,
          plate: {
            enabled: false,
            shape: 'rounded-square',
            color: '#FFFFFF',
            padding: 8,
          }
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setStyle({ logo: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (!logo?.src) return;
    setStyle({
      logo: {
        src: logo.src,
        size: 0.2,
        margin: 0,
        hideBackgroundDots: true,
        opacity: 1,
        plate: {
          enabled: false,
          shape: 'rounded-square',
          color: '#FFFFFF',
          padding: 8,
        }
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {!logo?.src ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--spacing-lg)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <ImagePlus size={32} style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }} />
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Upload a logo to center in your QR code
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Choose Image
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <img src={logo.src} alt="Logo preview" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Logo Uploaded</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                border: 'none',
                backgroundColor: 'rgba(var(--color-primary), 0.1)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
              title="Reset Logo Styles"
              aria-label="Reset logo styles"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={handleRemove}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                border: 'none',
                backgroundColor: 'rgba(var(--color-danger), 0.1)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
              title="Remove Logo"
              aria-label="Remove logo"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {logo?.src && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <Slider
            label="Logo Size"
            value={logo.size ?? 0.2}
            min={0.1}
            max={0.5}
            step={0.01}
            onChange={(val) => setStyle({ logo: { ...logo, size: val } })}
          />
          <Slider
            label="Logo Margin"
            value={logo.margin ?? 0}
            min={0}
            max={20}
            step={1}
            onChange={(val) => setStyle({ logo: { ...logo, margin: val } })}
          />
          <Slider
            label="Logo Opacity"
            value={logo.opacity ?? 1}
            min={0.1}
            max={1.0}
            step={0.1}
            onChange={(val) => setStyle({ logo: { ...logo, opacity: val } })}
          />
          <Toggle
            label="Remove dots behind logo"
            checked={logo.hideBackgroundDots ?? false}
            onChange={(checked) => setStyle({ logo: { ...logo, hideBackgroundDots: checked } })}
          />
          
          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <Toggle
              label="Background Plate"
              checked={logo.plate?.enabled ?? false}
              onChange={(checked) => setStyle({ 
                logo: { 
                  ...logo, 
                  plate: { 
                    ...(logo.plate || { shape: 'rounded-square', color: '#FFFFFF', padding: 8, enabled: false }), 
                    enabled: checked 
                  } 
                } 
              })}
            />
            {logo.plate?.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                <Select
                  label="Plate Shape"
                  value={logo.plate.shape}
                  options={[
                    { label: 'Circle', value: 'circle' },
                    { label: 'Square', value: 'square' },
                    { label: 'Rounded Square', value: 'rounded-square' },
                  ]}
                  onChange={(e) => setStyle({ logo: { ...logo, plate: { ...logo.plate!, shape: e.target.value as any } } })}
                />
                <ColorPicker
                  label="Plate Color"
                  color={logo.plate.color}
                  onChange={(color) => setStyle({ logo: { ...logo, plate: { ...logo.plate!, color } } })}
                />
                <Slider
                  label="Plate Padding"
                  value={logo.plate.padding}
                  min={0}
                  max={30}
                  step={1}
                  onChange={(val) => setStyle({ logo: { ...logo, plate: { ...logo.plate!, padding: val } } })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/svg+xml"
        style={{ display: 'none' }}
      />
    </div>
  );
};
