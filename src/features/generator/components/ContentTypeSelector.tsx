import React, { useState, useRef, useEffect } from 'react';
import { useQRStore } from '../../../stores/qrStore';
import type { QRContentType } from '../../../domain/types';
import { Link, Type, Mail, Phone, Wifi, MessageSquare, MessageCircle, Contact, IndianRupee, ChevronDown } from 'lucide-react';
import styles from './ContentTypeSelector.module.css';

const TYPES: Array<{ id: QRContentType; label: string; icon: React.ReactNode }> = [
  { id: 'url', label: 'URL', icon: <Link size={18} /> },
  { id: 'text', label: 'Text', icon: <Type size={18} /> },
  { id: 'email', label: 'Email', icon: <Mail size={18} /> },
  { id: 'phone', label: 'Phone', icon: <Phone size={18} /> },
  { id: 'sms', label: 'SMS', icon: <MessageSquare size={18} /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={18} /> },
  { id: 'vcard', label: 'Contact', icon: <Contact size={18} /> },
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={18} /> },
  { id: 'upi', label: 'UPI', icon: <IndianRupee size={18} /> },
];
const PRIMARY_TYPES = TYPES.slice(0, 3);
const SECONDARY_TYPES = TYPES.slice(3);

export const ContentTypeSelector: React.FC = () => {
  const currentType = useQRStore((state) => state.config.content.type);
  const setContentType = useQRStore((state) => state.setContentType);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.selector}>
      {PRIMARY_TYPES.map((type) => (
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

      {/* Desktop items (hidden on mobile) */}
      {SECONDARY_TYPES.map((type) => (
        <button
          key={type.id}
          className={`${styles.tab} ${styles.desktopOnly} ${currentType === type.id ? styles.active : ''}`}
          onClick={() => setContentType(type.id)}
          type="button"
        >
          {type.icon}
          <span>{type.label}</span>
        </button>
      ))}

      {/* Mobile dropdown (hidden on desktop) */}
      <div className={`${styles.dropdownContainer} ${styles.mobileOnly}`} ref={dropdownRef}>
        <button
          className={`${styles.tab} ${styles.iconOnly} ${SECONDARY_TYPES.some(t => t.id === currentType) ? styles.active : ''}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          type="button"
          title="More options"
        >
          <ChevronDown size={20} />
        </button>
        
        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            {SECONDARY_TYPES.map((type) => (
              <button
                key={type.id}
                className={`${styles.dropdownItem} ${currentType === type.id ? styles.activeItem : ''}`}
                onClick={() => {
                  setContentType(type.id);
                  setIsDropdownOpen(false);
                }}
                type="button"
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
