import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRConfig } from '../../../domain/types';
import { createQRCodeInstance } from '../../../lib/qrCodeStyling';
import { processLogo } from '../../../lib/logoProcessor';

export function useQRCode(config: QRConfig) {
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep track of previous config to optimize updates
  const prevConfig = useRef<QRConfig | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function generate() {
      setIsGenerating(true);
      setError(null);

      try {
        let processedLogoSrc: string | undefined = undefined;

        if (config.style.logo?.src) {
          processedLogoSrc = await processLogo(config.style.logo);
        }

        if (isMounted) {
          // Always create a fresh instance to avoid qr-code-styling internal cache issues
          // (e.g. gradients from previous presets getting stuck)
          const newQrCode = createQRCodeInstance(config, processedLogoSrc);
          setQrCode(newQrCode);
          prevConfig.current = config;
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    }

    generate();

    return () => {
      isMounted = false;
    };
  }, [config]);

  return {
    qrCode,
    isGenerating,
    error,
  };
}
