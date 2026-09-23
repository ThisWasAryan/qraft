import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const PhoneForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState(false);

  if (content.type !== 'phone') return null;

  const phoneError = contentErrors.find(e => e.field === 'number' && e.severity === 'error');
  const phoneWarning = contentErrors.find(e => e.field === 'number' && e.severity === 'warning');

  const displayError = touched && phoneError ? phoneError.message : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <Input
        label="Phone Number"
        placeholder="+1 555-123-4567"
        value={content.number}
        onChange={(e) => setContent({ number: e.target.value })}
        onBlur={() => setTouched(true)}
        error={displayError}
        fullWidth
        type="tel"
      />
      {!displayError && phoneWarning && (
        <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
          {phoneWarning.message}
        </span>
      )}
    </div>
  );
};
