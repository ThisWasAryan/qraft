import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const URLForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState(false);

  if (content.type !== 'url') return null;

  const urlError = contentErrors.find(e => e.field === 'url' && e.severity === 'error');
  const urlWarning = contentErrors.find(e => e.field === 'url' && e.severity === 'warning');

  const displayError = touched && urlError ? urlError.message : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <Input
        label="Website URL"
        placeholder="https://thiswasaryan.in"
        value={content.url}
        onChange={(e) => setContent({ url: e.target.value })}
        onBlur={() => setTouched(true)}
        error={displayError}
        fullWidth
        type="url"
      />
      {!displayError && urlWarning && (
        <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
          {urlWarning.message}
        </span>
      )}
    </div>
  );
};
