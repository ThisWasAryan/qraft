import React, { Suspense, lazy } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { QRScannerLoader } from '../../../../components/Loading/QRScannerLoader';

const URLForm = lazy(() => import('./URLForm').then(m => ({ default: m.URLForm })));
const TextForm = lazy(() => import('./TextForm').then(m => ({ default: m.TextForm })));
const EmailForm = lazy(() => import('./EmailForm').then(m => ({ default: m.EmailForm })));
const PhoneForm = lazy(() => import('./PhoneForm').then(m => ({ default: m.PhoneForm })));
const WiFiForm = lazy(() => import('./WiFiForm').then(m => ({ default: m.WiFiForm })));
const SMSForm = lazy(() => import('./SMSForm').then(m => ({ default: m.SMSForm })));
const WhatsAppForm = lazy(() => import('./WhatsAppForm').then(m => ({ default: m.WhatsAppForm })));
const VCardForm = lazy(() => import('./VCardForm').then(m => ({ default: m.VCardForm })));
const UPIForm = lazy(() => import('./UPIForm').then(m => ({ default: m.UPIForm })));

export const ContentFormWrapper: React.FC = () => {
  const type = useQRStore((state) => state.config.content.type);

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      <Suspense fallback={<QRScannerLoader />}>
        {type === 'url' && <URLForm />}
        {type === 'text' && <TextForm />}
        {type === 'email' && <EmailForm />}
        {type === 'phone' && <PhoneForm />}
        {type === 'wifi' && <WiFiForm />}
        {type === 'sms' && <SMSForm />}
        {type === 'whatsapp' && <WhatsAppForm />}
        {type === 'vcard' && <VCardForm />}
        {type === 'upi' && <UPIForm />}
      </Suspense>
    </div>
  );
};
