import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';

export const TextForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState(false);

  if (content.type !== 'text') return null;

  const textError = contentErrors.find(e => e.field === 'text' && e.severity === 'error');
  const textWarning = contentErrors.find(e => e.field === 'text' && e.severity === 'warning');

  const displayError = touched && textError ? textError.message : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {/* TODO: If we had a textarea component we would use it here. We'll use Input for now, or just regular textarea with styles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Plain Text
        </label>
        <textarea
          style={{
            width: '100%',
            minHeight: '120px',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${displayError ? 'var(--color-danger)' : 'var(--color-border)'}`,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-md)',
            resize: 'vertical'
          }}
          placeholder="Enter text, notes, or IDs here..."
          value={content.text}
          onChange={(e) => setContent({ text: e.target.value })}
          onBlur={() => setTouched(true)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {displayError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
                {displayError}
              </div>
            )}
            {!displayError && textWarning && (
              <div style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
                {textWarning.message}
              </div>
            )}
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap', marginLeft: 'var(--spacing-md)' }}>
            {new Blob([content.text]).size} / 2953 bytes
          </span>
        </div>
      </div>
    </div>
  );
};
