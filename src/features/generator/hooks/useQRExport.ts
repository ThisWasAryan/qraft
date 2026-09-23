import { useState, useCallback } from 'react';
import { downloadDataUrl, copyBlobToClipboard } from '../../../utils/download';
import type { ExportFormat } from '../../../utils/download';
import { useHistoryStore } from '../../../stores/historyStore';
import { useQRStore } from '../../../stores/qrStore';
import type { QRFrame } from '../../../domain/types';
import { createQRCodeInstance } from '../../../lib/qrCodeStyling';
import { processLogo } from '../../../lib/logoProcessor';

function escapeXML(str: string) {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function wrapSVGWithFrame(baseSVG: string, frame: QRFrame, qrSize: number): string {
  const ctaHeight = frame.ctaText ? frame.ctaText.fontSize + 16 : 0;
  const totalWidth = qrSize + frame.padding * 2;
  const totalHeight = qrSize + frame.padding * 2 + ctaHeight;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">
    <rect width="${totalWidth}" height="${totalHeight}" rx="${frame.borderRadius}" 
          fill="${frame.backgroundColor}" stroke="${frame.color}" stroke-width="${frame.borderWidth}"/>
    <g transform="translate(${frame.padding}, ${frame.padding})">
      ${baseSVG}
    </g>
    ${frame.ctaText ? `<text x="${totalWidth/2}" y="${totalHeight - 12}" 
      text-anchor="middle" font-family="${frame.ctaText.fontFamily}" 
      font-weight="${frame.ctaText.fontWeight}" font-size="${frame.ctaText.fontSize}" 
      fill="${frame.ctaText.color}" letter-spacing="${frame.ctaText.letterSpacing}">
      ${escapeXML(frame.ctaText.text)}
    </text>` : ''}
  </svg>`;
}

export function useQRExport() {
  const [isExporting, setIsExporting] = useState(false);
  const saveConfig = useHistoryStore(state => state.saveConfig);
  const config = useQRStore(state => state.config);

  const getCanvasBlob = (canvas: HTMLCanvasElement, format: string, quality: number = 0.92): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), `image/${format}`, quality);
    });
  };

  const exportQR = useCallback(async (
    canvas: HTMLCanvasElement | null, 
    format: ExportFormat, 
    filename: string = 'qraft-qrcode'
  ) => {
    if (!canvas) return;
    
    setIsExporting(true);
    try {
      if (format === 'svg') {
        let processedLogoSrc: string | undefined = undefined;
        if (config.style.logo?.src) {
          processedLogoSrc = await processLogo(config.style.logo);
        }
        const qrCode = createQRCodeInstance(config, processedLogoSrc);
        const svgBlob = await qrCode.getRawData('svg');
        if (!svgBlob) throw new Error('Failed to generate SVG');
        
        let svgText = await svgBlob.text();
        
        if (config.style.frame && config.style.frame.style !== 'none') {
          svgText = wrapSVGWithFrame(svgText, config.style.frame, config.style.width);
        }
        
        const finalBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(finalBlob);
        downloadDataUrl(url, `${filename}.svg`);
        URL.revokeObjectURL(url);
      } else {
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, 1.0);
        downloadDataUrl(dataUrl, `${filename}.${format}`);
      }
      
      // Save to history on successful export
      saveConfig(config);
      
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [config, saveConfig]);

  const copyQR = useCallback(async (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    setIsExporting(true);
    try {
      const blob = await getCanvasBlob(canvas, 'png', 1.0);
      if (blob) {
        await copyBlobToClipboard(blob);
        // Save to history on successful copy
        saveConfig(config);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [config, saveConfig]);

  return { exportQR, copyQR, isExporting };
}
