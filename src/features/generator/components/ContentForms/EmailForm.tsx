import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const EmailForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (content.type !== 'email') return null;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getError = (field: string) => {
    if (!touched[field]) return undefined;
    const err = contentErrors.find(e => e.field === field && e.severity === 'error');
    return err ? err.message : undefined;
  };

  const emailWarning = contentErrors.find(e => e.field === 'email' && e.severity === 'warning');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <Input
        label="To (Email Address)"
        placeholder="recipient@example.com"
        value={content.to}
        onChange={(e) => setContent({ to: e.target.value })}
        onBlur={() => handleBlur('to')}
        error={getError('to')}
        fullWidth
        type="email"
      />
      
      <Input
        label="Subject (Optional)"
        placeholder="Enter subject line"
        value={content.subject || ''}
        onChange={(e) => setContent({ subject: e.target.value })}
        fullWidth
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Body (Optional)
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
          placeholder="Pre-fill email body..."
          value={content.body || ''}
          onChange={(e) => setContent({ body: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Input
          label="CC (Optional)"
          placeholder="cc@example.com"
          value={content.cc || ''}
          onChange={(e) => setContent({ cc: e.target.value })}
          onBlur={() => handleBlur('cc')}
          error={getError('cc')}
          fullWidth
        />
        <Input
          label="BCC (Optional)"
          placeholder="bcc@example.com"
          value={content.bcc || ''}
          onChange={(e) => setContent({ bcc: e.target.value })}
          onBlur={() => handleBlur('bcc')}
          error={getError('bcc')}
          fullWidth
        />
      </div>

      {emailWarning && (
        <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
          {emailWarning.message}
        </span>
      )}
    </div>
  );
};
