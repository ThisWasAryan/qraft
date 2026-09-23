import React from 'react';
import { useQRExport } from '../../hooks/useQRExport';
import { Button } from '../../../../components/Button/Button';
import { Download, Copy, Loader2 } from 'lucide-react';
import type { ExportFormat } from '../../../../utils/download';
import { useQRStore } from '../../../../stores/qrStore';
import { useToastStore } from '../../../../stores/toastStore';

interface ExportPanelProps {
  canvas: HTMLCanvasElement | null;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ canvas }) => {
  const { exportQR, copyQR, isExporting } = useQRExport();
  const addToast = useToastStore(state => state.addToast);
  const isValid = useQRStore(state => state.isContentValid);
  const content = useQRStore(state => state.config.content);

  const generateFilename = () => {
    let baseName = 'qrcode';
    
    try {
      switch (content.type) {
        case 'url':
          if (content.url) {
            try {
              const url = new URL(content.url.startsWith('http') ? content.url : `https://${content.url}`);
              baseName = url.hostname.replace(/^www\./, '');
            } catch {
              baseName = content.url.substring(0, 20);
            }
          }
          break;
        case 'text':
          if (content.text) {
            baseName = content.text.substring(0, 20);
          }
          break;
        case 'email':
          if (content.to) baseName = content.to;
          break;
        case 'phone':
          if (content.number) baseName = content.number;
          break;
        case 'wifi':
          if (content.ssid) baseName = content.ssid;
          break;
      }
    } catch (e) {
      // Fallback to defaults on any parsing error
    }
    
    // Clean up filename: keep alphanumeric, dots, hyphens, underscores, at-signs. Max 30 chars.
    baseName = baseName.replace(/[^a-zA-Z0-9.\-_@]/g, '').trim().substring(0, 30);
    
    if (!baseName) baseName = 'qrcode';
    
    return `${baseName}(created with QRaft)`;
  };

  const handleExport = async (format: ExportFormat) => {
    if (!canvas) return;
    const filename = generateFilename();
    await exportQR(canvas, format, filename);
    addToast(`Successfully exported as ${format.toUpperCase()}`, 'success');
  };

  const handleCopy = async () => {
    if (!canvas) return;
    await copyQR(canvas);
    addToast('Copied to clipboard!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Export</h3>
      
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
        <Button 
          variant="primary" 
          disabled={!canvas || isExporting || !isValid} 
          onClick={() => handleExport('png')}
          style={{ flex: 1, minWidth: '120px' }}
        >
          {isExporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          Download PNG
        </Button>
        <Button 
          variant="secondary" 
          disabled={!canvas || isExporting || !isValid} 
          onClick={() => handleExport('jpeg')}
          style={{ flex: 1, minWidth: '120px' }}
        >
          {isExporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          Download JPEG
        </Button>
        <Button 
          variant="secondary" 
          disabled={!canvas || isExporting || !isValid} 
          onClick={() => handleExport('webp')}
          style={{ flex: 1, minWidth: '120px' }}
        >
          {isExporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          Download WEBP
        </Button>
        <Button 
          variant="secondary" 
          disabled={!canvas || isExporting || !isValid} 
          onClick={() => handleExport('svg')}
          style={{ flex: 1, minWidth: '120px' }}
        >
          {isExporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          Download SVG
        </Button>
      </div>

      <Button 
        variant="ghost" 
        disabled={!canvas || isExporting || !isValid} 
        onClick={handleCopy}
      >
        <Copy size={16} />
        Copy to Clipboard
      </Button>
    </div>
  );
};
