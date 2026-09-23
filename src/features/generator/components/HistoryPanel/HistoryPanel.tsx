import React from 'react';
import { useHistoryStore } from '../../../../stores/historyStore';
import { useQRStore } from '../../../../stores/qrStore';
import { Clock, Trash2 } from 'lucide-react';

export const HistoryPanel: React.FC = () => {
  const { items, deleteItem, clearAll } = useHistoryStore();
  const loadConfig = useQRStore(state => state.loadConfig);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) var(--spacing-md)', color: 'var(--color-text-muted)' }}>
        <Clock size={32} style={{ margin: '0 auto var(--spacing-sm)', opacity: 0.5 }} />
        <p>No history yet.</p>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>QR codes you export will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>History</h3>
        <button 
          onClick={clearAll}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-error)', 
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500
          }}
        >
          Clear All
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {items.map(item => (
          <div 
            key={item.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
            onClick={() => loadConfig(item.config)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-size-md)' }}>{item.label}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 'var(--spacing-xs)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
