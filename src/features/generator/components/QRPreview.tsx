import React, { useEffect, useRef } from 'react';
import { useQRCompositor } from '../hooks/useQRCompositor';
import { useDebounce } from '../hooks/useDebounce';
import type { QRConfig } from '../../../domain/types';
import styles from './QRPreview.module.css';

interface QRPreviewProps {
  config: QRConfig;
  debounceMs?: number;
}

export const QRPreview: React.FC<QRPreviewProps> = ({ config, debounceMs = 300 }) => {
  const debouncedConfig = useDebounce(config, debounceMs);
  const { canvas, isGenerating, error } = useQRCompositor(debouncedConfig);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (canvas && containerRef.current) {
      // clear the container before appending
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(canvas);
    }
  }, [canvas]); // Re-append when canvas changes

  const getFriendlyErrorMessage = (errMsg: string) => {
    if (errMsg.toLowerCase().includes('code length overflow')) {
      return 'The content is too long for the current Error Correction level. Try lowering the Error Correction in the Advanced settings, or shorten the text.';
    }
    return errMsg;
  };

  return (
    <div className={styles.previewContainer}>
      {isGenerating && <div className={styles.loadingOverlay}>Generating...</div>}
      {error && (
        <div className={styles.errorOverlay}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Error generating QR Code</div>
          <div style={{ fontSize: '0.85em', opacity: 0.9, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4 }}>
            {getFriendlyErrorMessage(error.message)}
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={styles.qrWrapper} 
        aria-label="QR Code Preview"
      />
    </div>
  );
};
