import React from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { URLForm } from './URLForm';
import { TextForm } from './TextForm';
import { EmailForm } from './EmailForm';
import { PhoneForm } from './PhoneForm';
import { WiFiForm } from './WiFiForm';
import { SMSForm } from './SMSForm';
import { WhatsAppForm } from './WhatsAppForm';
import { VCardForm } from './VCardForm';
import { UPIForm } from './UPIForm';

export const ContentFormWrapper: React.FC = () => {
  const type = useQRStore((state) => state.config.content.type);

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      {type === 'url' && <URLForm />}
      {type === 'text' && <TextForm />}
      {type === 'email' && <EmailForm />}
      {type === 'phone' && <PhoneForm />}
      {type === 'wifi' && <WiFiForm />}
      {type === 'sms' && <SMSForm />}
      {type === 'whatsapp' && <WhatsAppForm />}
      {type === 'vcard' && <VCardForm />}
      {type === 'upi' && <UPIForm />}
    </div>
  );
};
