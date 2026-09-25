import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { getPayloadString } from '../../../../lib/qrCodeStyling';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useToastStore } from '../../../../stores/toastStore';

export const PayloadPreview: React.FC = () => {
  const config = useQRStore((state) => state.config);
  const isValid = useQRStore((state) => state.isContentValid);
  const addToast = useToastStore((state) => state.addToast);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const payload = getPayloadString(config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      addToast('Payload copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Failed to copy payload', 'error');
    }
  };

  if (!isValid || !payload) return null;

  return (
    <div style={{ marginTop: 'var(--spacing-md)' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          cursor: 'pointer',
          padding: 'var(--spacing-xs) 0',
        }}
      >
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {isExpanded ? 'Hide Encoded Payload' : 'View Encoded Payload'}
      </button>

      {isExpanded && (
        <div style={{ 
          marginTop: 'var(--spacing-sm)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-md)',
        }}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Encoded Payload
          </h4>
          <textarea
            readOnly
            value={payload}
            style={{
              width: '100%',
              minHeight: '80px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--spacing-sm)',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
              resize: 'vertical',
              marginBottom: 'var(--spacing-sm)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                color: 'var(--color-text)',
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              Copy Payload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
