import React from 'react';
import { useQRStore } from '../../../stores/qrStore';
import type { QRContentType } from '../../../domain/types';
import { Link, Type, Mail, Phone, Wifi } from 'lucide-react';
import styles from './ContentTypeSelector.module.css';

const TYPES: Array<{ id: QRContentType; label: string; icon: React.ReactNode }> = [
  { id: 'url', label: 'URL', icon: <Link size={18} /> },
  { id: 'text', label: 'Text', icon: <Type size={18} /> },
  { id: 'email', label: 'Email', icon: <Mail size={18} /> },
  { id: 'phone', label: 'Phone', icon: <Phone size={18} /> },
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={18} /> },
];

export const ContentTypeSelector: React.FC = () => {
  const currentType = useQRStore((state) => state.config.content.type);
  const setContentType = useQRStore((state) => state.setContentType);

  return (
    <div className={styles.selector}>
      {TYPES.map((type) => (
        <button
          key={type.id}
          className={`${styles.tab} ${currentType === type.id ? styles.active : ''}`}
          onClick={() => setContentType(type.id)}
          type="button"
        >
          {type.icon}
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
};
