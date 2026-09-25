import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const SMSForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (content.type !== 'sms') return null;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getError = (field: string) => {
    if (!touched[field]) return undefined;
    const err = contentErrors.find(e => e.field === field && e.severity === 'error');
    return err ? err.message : undefined;
  };

  const messageWarning = contentErrors.find(e => e.field === 'message' && e.severity === 'warning');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <Input
        label="Phone Number"
        placeholder="+1 234 567 8900"
        value={content.number}
        onChange={(e) => setContent({ number: e.target.value })}
        onBlur={() => handleBlur('number')}
        error={getError('number')}
        fullWidth
        type="tel"
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Message (Optional)
        </label>
        <textarea
          style={{
            width: '100%',
            minHeight: '80px',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-md)',
            resize: 'vertical'
          }}
          placeholder="Enter text message..."
          value={content.message || ''}
          onChange={(e) => setContent({ message: e.target.value })}
        />
        {messageWarning && (
          <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
            {messageWarning.message}
          </span>
        )}
      </div>
    </div>
  );
};
