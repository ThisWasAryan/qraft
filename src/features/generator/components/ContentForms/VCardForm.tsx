import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const VCardForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (content.type !== 'vcard') return null;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getError = (field: string) => {
    if (!touched[field]) return undefined;
    const err = contentErrors.find(e => e.field === field && e.severity === 'error');
    return err ? err.message : undefined;
  };

  const notesWarning = contentErrors.find(e => e.field === 'notes' && e.severity === 'warning');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Input
          label="First Name"
          placeholder="John"
          value={content.firstName || ''}
          onChange={(e) => setContent({ firstName: e.target.value })}
          onBlur={() => handleBlur('firstName')}
          error={getError('firstName')}
          fullWidth
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={content.lastName || ''}
          onChange={(e) => setContent({ lastName: e.target.value })}
          onBlur={() => handleBlur('lastName')}
          error={getError('lastName')}
          fullWidth
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Input
          label="Organization"
          placeholder="Acme Corp"
          value={content.organization || ''}
          onChange={(e) => setContent({ organization: e.target.value })}
          fullWidth
        />
        <Input
          label="Title"
          placeholder="Developer"
          value={content.title || ''}
          onChange={(e) => setContent({ title: e.target.value })}
          fullWidth
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Input
          label="Phone Number"
          placeholder="+1 234 567 8900"
          value={content.phone || ''}
          onChange={(e) => setContent({ phone: e.target.value })}
          onBlur={() => handleBlur('phone')}
          error={getError('phone')}
          fullWidth
          type="tel"
        />
        <Input
          label="Email Address"
          placeholder="john@example.com"
          value={content.email || ''}
          onChange={(e) => setContent({ email: e.target.value })}
          onBlur={() => handleBlur('email')}
          error={getError('email')}
          fullWidth
          type="email"
        />
      </div>

      <Input
        label="Website URL"
        placeholder="https://example.com"
        value={content.url || ''}
        onChange={(e) => setContent({ url: e.target.value })}
        onBlur={() => handleBlur('url')}
        error={getError('url')}
        fullWidth
      />

      <div style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Address</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <Input
            label="Street"
            placeholder="123 Main St"
            value={content.street || ''}
            onChange={(e) => setContent({ street: e.target.value })}
            fullWidth
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Input
              label="City"
              placeholder="New York"
              value={content.city || ''}
              onChange={(e) => setContent({ city: e.target.value })}
              fullWidth
            />
            <Input
              label="State/Region"
              placeholder="NY"
              value={content.state || ''}
              onChange={(e) => setContent({ state: e.target.value })}
              fullWidth
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Input
              label="Zip/Postal Code"
              placeholder="10001"
              value={content.zip || ''}
              onChange={(e) => setContent({ zip: e.target.value })}
              fullWidth
            />
            <Input
              label="Country"
              placeholder="USA"
              value={content.country || ''}
              onChange={(e) => setContent({ country: e.target.value })}
              fullWidth
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Notes
        </label>
        <textarea
          style={{
            width: '100%',
            minHeight: '60px',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-md)',
            resize: 'vertical'
          }}
          placeholder="Additional notes..."
          value={content.notes || ''}
          onChange={(e) => setContent({ notes: e.target.value })}
        />
        {notesWarning && (
          <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
            {notesWarning.message}
          </span>
        )}
      </div>
    </div>
  );
};
