import React, { Suspense, lazy } from 'react';
import { useQRStore } from '../stores/qrStore';
import { useQRCompositor } from '../features/generator/hooks/useQRCompositor';
import { ContentTypeSelector } from '../features/generator/components/ContentTypeSelector';
import { ContentFormWrapper } from '../features/generator/components/ContentForms/ContentFormWrapper';
import { QRPreview } from '../features/generator/components/QRPreview';
import { ReliabilityIndicator } from '../features/generator/components/ReliabilityIndicator/ReliabilityIndicator';
import { ExportPanel } from '../features/generator/components/ExportPanel/ExportPanel';
import { QRScannerLoader } from '../components/Loading/QRScannerLoader';
import styles from './GeneratorPage.module.css';

// Lazy loaded heavy components
const StylePanel = lazy(() => import('../features/generator/components/StylePanel/StylePanel').then(m => ({ default: m.StylePanel })));
const HistoryPanel = lazy(() => import('../features/generator/components/HistoryPanel/HistoryPanel').then(m => ({ default: m.HistoryPanel })));

export const GeneratorPage: React.FC = () => {
  const config = useQRStore(state => state.config);
  
  // Create a shared compositor canvas reference to pass to ExportPanel
  const { canvas } = useQRCompositor(config);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.inputSection}>
        <ContentTypeSelector />
        <ContentFormWrapper />
      </div>
      
      <div className={styles.previewSection}>
        <div className={styles.stickyPanel}>
          <QRPreview config={config} />
          <ReliabilityIndicator />
          <ExportPanel canvas={canvas} />
          <div id="history-section" className={styles.historyWrapper}>
            <Suspense fallback={<QRScannerLoader />}>
              <HistoryPanel />
            </Suspense>
          </div>
        </div>
      </div>

      <div className={styles.styleSection}>
        <Suspense fallback={<QRScannerLoader />}>
          <StylePanel />
        </Suspense>
      </div>
    </div>
  );
};

