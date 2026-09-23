import { useEffect, useState, useRef } from 'react';
import type { QRConfig } from '../../../domain/types';
import { useQRCode } from './useQRCode';
import { createCompositeCanvas } from '../../../lib/compositor';

export function useQRCompositor(config: QRConfig, scale: number = 1) {
  const { qrCode, isGenerating: isQRGenerating, error: qrError } = useQRCode(config);
  const [isCompositing, setIsCompositing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // State for the final composed canvas to trigger re-renders
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  
  // Hidden container to mount the raw QR code
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create hidden container if it doesn't exist
    if (!hiddenContainerRef.current && typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);
      hiddenContainerRef.current = div;
    }

    return () => {
      if (hiddenContainerRef.current && hiddenContainerRef.current.parentNode) {
        hiddenContainerRef.current.parentNode.removeChild(hiddenContainerRef.current);
        hiddenContainerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!qrCode || isQRGenerating || !hiddenContainerRef.current) return;

    let isMounted = true;

    async function composite() {
      setIsCompositing(true);
      setError(null);
      
      try {
        if (!hiddenContainerRef.current || !qrCode) return;
        
        // Clear hidden container
        hiddenContainerRef.current.innerHTML = '';
        
        // Append raw QR
        qrCode.append(hiddenContainerRef.current);
        
        // We need to wait a tick for the canvas to be mounted by the library
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const rawCanvas = hiddenContainerRef.current.querySelector('canvas');
        if (!rawCanvas) {
          throw new Error('QR Code canvas not found');
        }

        const composed = await createCompositeCanvas(rawCanvas, config, scale);
        
        if (isMounted) {
          setCanvas(composed);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsCompositing(false);
        }
      }
    }

    composite();

    return () => {
      isMounted = false;
    };
  }, [qrCode, isQRGenerating, config, scale]);

  return {
    canvas,
    isGenerating: isQRGenerating || isCompositing,
    error: qrError || error,
  };
}
