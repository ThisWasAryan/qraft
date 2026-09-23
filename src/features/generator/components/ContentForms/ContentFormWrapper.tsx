import React from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { URLForm } from './URLForm';
import { TextForm } from './TextForm';
import { EmailForm } from './EmailForm';
import { PhoneForm } from './PhoneForm';
import { WiFiForm } from './WiFiForm';

export const ContentFormWrapper: React.FC = () => {
  const type = useQRStore((state) => state.config.content.type);

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      {type === 'url' && <URLForm />}
      {type === 'text' && <TextForm />}
      {type === 'email' && <EmailForm />}
      {type === 'phone' && <PhoneForm />}
      {type === 'wifi' && <WiFiForm />}
    </div>
  );
};
