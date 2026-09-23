import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../lib/storage';
import type { QRHistoryItem, QRConfig } from '../domain/types';

interface HistoryState {
  items: QRHistoryItem[];
  saveConfig: (config: QRConfig, presetId?: string) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

const HISTORY_LIMIT = 50;

function generateLabel(config: QRConfig): string {
  switch (config.content.type) {
    case 'url': return config.content.url;
    case 'text': return config.content.text.substring(0, 30) + (config.content.text.length > 30 ? '...' : '');
    case 'email': return `Email: ${config.content.to}`;
    case 'phone': return `Phone: ${config.content.number}`;
    case 'wifi': return `WiFi: ${config.content.ssid}`;
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
