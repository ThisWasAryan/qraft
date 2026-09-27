import React, { useState, useRef, useEffect } from 'react';
import { useHistoryStore } from '../../../../stores/historyStore';
import { useQRStore } from '../../../../stores/qrStore';
import { useToastStore } from '../../../../stores/toastStore';
import { 
  Clock, Trash2, Edit2, Palette, Link as LinkIcon, Type, 
  Mail, Phone, Wifi, MessageSquare, MessageCircle, User, 
  CreditCard, ArrowUpRight
} from 'lucide-react';
import type { QRContentType, QRHistoryItem } from '../../../../domain/types';
import styles from './HistoryPanel.module.css';

const ContentIcon = ({ type }: { type: QRContentType }) => {
  switch (type) {
    case 'url': return <LinkIcon size={18} />;
    case 'text': return <Type size={18} />;
    case 'email': return <Mail size={18} />;
    case 'phone': return <Phone size={18} />;
    case 'wifi': return <Wifi size={18} />;
    case 'sms': return <MessageSquare size={18} />;
    case 'whatsapp': return <MessageCircle size={18} />;
    case 'vcard': return <User size={18} />;
    case 'upi': return <CreditCard size={18} />;
    default: return <LinkIcon size={18} />;
  }
};

const HistoryItemRow = ({ item }: { item: QRHistoryItem }) => {
  const { deleteItem, updateItemLabel } = useHistoryStore();
  const { loadConfig, setStyle } = useQRStore();
  const addToast = useToastStore(state => state.addToast);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (editValue.trim() !== '') {
      updateItemLabel(item.id, editValue.trim());
    } else {
      setEditValue(item.label || ''); // Reset if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setEditValue(item.label || '');
      setIsEditing(false);
    }
  };

  const handleCopyStyle = () => {
    setStyle(item.config.style);
    addToast('Style applied from history', 'success');
  };

  const handleLoadFull = () => {
    loadConfig(item.config);
    addToast('QR loaded from history', 'success');
  };

  return (
    <div className={styles.item}>
      <div className={styles.itemContent}>
        <div className={styles.iconWrapper} title={`Type: ${item.config.content.type}`}>
          <ContentIcon type={item.config.content.type} />
        </div>
        
        <div className={styles.info}>
          {isEditing ? (
            <div className={styles.labelWrapper}>
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className={styles.labelInput}
              />
            </div>
          ) : (
            <div className={styles.labelWrapper}>
              <span className={styles.label} title={item.label} onDoubleClick={() => setIsEditing(true)}>
                {item.label}
              </span>
            </div>
          )}
          <div className={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        {!isEditing && (
          <>
            <div className={styles.actionGroup}>
              <button 
                className={styles.actionBtn} 
                onClick={handleLoadFull}
                title="Load Config"
              >
                <ArrowUpRight size={16} />
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.secondaryAction}`} 
                onClick={handleCopyStyle}
                title="Apply Style Only"
              >
                <Palette size={16} />
              </button>
            </div>
            
            <div className={styles.actionGroup}>
              <button 
                className={styles.actionBtn} 
                onClick={() => setIsEditing(true)}
                title="Rename"
              >
                <Edit2 size={16} />
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.delete} ${styles.secondaryAction}`} 
                onClick={() => deleteItem(item.id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const HistoryPanel: React.FC = () => {
  const { items, clearAll } = useHistoryStore();

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Clock size={32} className={styles.emptyIcon} />
        <p className={styles.emptyText}>No history yet.</p>
        <p className={styles.emptySubtext}>QR codes you export will appear here.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>History</h3>
        <button className={styles.clearAllBtn} onClick={clearAll}>
          Clear All
        </button>
      </div>
      
      <div className={styles.list}>
        {items.map(item => (
          <HistoryItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
