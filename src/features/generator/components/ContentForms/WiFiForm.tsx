import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const WiFiForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (content.type !== 'wifi') return null;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getError = (field: string) => {
    if (!touched[field]) return undefined;
    const err = contentErrors.find(e => e.field === field && e.severity === 'error');
    return err ? err.message : undefined;
  };

  const getWarning = (field: string) => {
    const err = contentErrors.find(e => e.field === field && e.severity === 'warning');
    return err ? err.message : undefined;
  };

  const ssidWarning = getWarning('ssid');
  const passwordWarning = getWarning('password');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <Input
        label="Network Name (SSID)"
        placeholder="My Network"
        value={content.ssid}
        onChange={(e) => setContent({ ssid: e.target.value })}
        onBlur={() => handleBlur('ssid')}
        error={getError('ssid')}
        fullWidth
      />
      {ssidWarning && (
        <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
          {ssidWarning}
        </span>
      )}

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Security
          </label>
          <select
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'inherit',
              fontSize: 'var(--font-size-md)'
            }}
            value={content.authType}
            onChange={(e) => setContent({ authType: e.target.value as any })}
          >
            <option value="WPA">WPA/WPA2/WPA3</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None (Open Network)</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', alignSelf: 'flex-end', paddingBottom: 'var(--spacing-sm)' }}>
          <input
            type="checkbox"
            checked={content.hidden}
            onChange={(e) => setContent({ hidden: e.target.checked })}
            style={{ width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>Hidden Network</span>
        </label>
      </div>

      {content.authType !== 'nopass' && (
        <React.Fragment>
          <Input
            label="Password"
            placeholder="Network password"
            type="text" // Keep as text to show what they type, or provide a toggle
            value={content.password}
            onChange={(e) => setContent({ password: e.target.value })}
            onBlur={() => handleBlur('password')}
            error={getError('password')}
            fullWidth
          />
          {passwordWarning && (
            <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
              {passwordWarning}
            </span>
          )}
        </React.Fragment>
      )}
    </div>
  );
};
