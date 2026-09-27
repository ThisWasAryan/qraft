import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../lib/storage';
import type { QRHistoryItem, QRConfig } from '../domain/types';

interface HistoryState {
  items: QRHistoryItem[];
  saveConfig: (config: QRConfig, presetId?: string) => void;
  updateItemLabel: (id: string, newLabel: string) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

const HISTORY_LIMIT = 50;

function generateLabel(config: QRConfig): string {
  switch (config.content.type) {
    case 'url': return config.content.url || 'URL';
    case 'text': return config.content.text ? (config.content.text.substring(0, 30) + (config.content.text.length > 30 ? '...' : '')) : 'Text';
    case 'email': return config.content.to || 'Email';
    case 'phone': return config.content.number || 'Phone';
    case 'wifi': return config.content.ssid || 'WiFi';
    case 'sms': return config.content.number || 'SMS';
    case 'whatsapp': return config.content.number || 'WhatsApp';
    case 'vcard': return config.content.firstName || config.content.lastName ? `${config.content.firstName} ${config.content.lastName}`.trim() : 'Contact';
    case 'upi': return config.content.payeeName || config.content.payeeAddress || 'UPI';
    default: return 'QR Code';
  }
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      
      saveConfig: (config, presetId) => set((state) => {
        // Create new item
        const newItem: QRHistoryItem = {
          id: crypto.randomUUID(),
          config: JSON.parse(JSON.stringify(config)), // deep copy
          createdAt: Date.now(),
          label: generateLabel(config),
          presetId
        };
        
        // Add to front, enforce limit
        const newItems = [newItem, ...state.items].slice(0, HISTORY_LIMIT);
        
        return { items: newItems };
      }),
      
      updateItemLabel: (id, newLabel) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, label: newLabel } : item
        )
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'qraft-history',
      storage: createJSONStorage(() => idbStorage),
      version: 1,
    }
  )
);
