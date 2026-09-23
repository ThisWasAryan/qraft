import React, { useRef } from 'react';
import { useQRStore } from '../../../../../stores/qrStore';
import { ImagePlus, Trash2 } from 'lucide-react';

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
          size: 0.4,
          margin: 5,
          hideBackgroundDots: true,
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
            aria-label="Remove logo"
          >
            <Trash2 size={18} />
          </button>
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
