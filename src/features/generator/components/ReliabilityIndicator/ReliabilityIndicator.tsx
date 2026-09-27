import React, { useState, useEffect, useRef } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { analyzeReliability } from '../../../../domain/reliability';
import { TriangleAlert, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ReliabilitySeverity } from '../../../../domain/types';
import type { FixDiagnostic } from '../../../../domain/autofix';

const formatComponent = (component: string) => {
  switch (component) {
    case 'pattern': return 'Pattern Color';
    case 'eyeFrame': return 'Corner Frame Color';
    case 'eyeCenter': return 'Corner Center Color';
    case 'background': return 'Background Color';
    case 'margin': return 'QR Margin';
    case 'errorCorrection': return 'Error Correction';
    case 'logoSize': return 'Logo Size';
    case 'shape': return 'Element Shapes';
    case 'size': return 'Output Size';
    default: return component;
  }
};

export const ReliabilityIndicator: React.FC = () => {
  const config = useQRStore((state) => state.config);
  const autoFix = useQRStore((state) => state.autoFixReliability);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [isFixing, setIsFixing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<FixDiagnostic[] | null>(null);
  const lastAutoFixedConfig = useRef<any>(null);

  // Clear diagnostics when the user manually changes the configuration
  useEffect(() => {
    if (config !== lastAutoFixedConfig.current) {
      setDiagnostics(null);
    }
  }, [config]);

  // If the user's content is empty/invalid, fall back to the default URL so the analysis doesn't break
  const hasFatalError = contentErrors.some(e => e.severity === 'error');
  const effectiveConfig = hasFatalError ? { 
    ...config, 
    content: { type: 'url', url: 'https://thiswasaryan.in/' } as const
  } : config;
  
  const report = analyzeReliability(effectiveConfig);

  const handleAutoFix = async () => {
    setIsFixing(true);
    setDiagnostics(null);
    
    // Yield to allow React to render the loading state
    await new Promise(r => setTimeout(r, 150));
    
    const result = autoFix();
    lastAutoFixedConfig.current = useQRStore.getState().config;
    
    if (result && result.length > 0) {
      setDiagnostics(result);
    }
    
    setIsFixing(false);
  };

  const getIcon = (severity: ReliabilitySeverity) => {
    switch (severity) {
      case 'good': return <CheckCircle size={16} color="var(--color-success)" />;
      case 'warning': return <TriangleAlert size={16} color="var(--color-warning)" />;
      case 'danger': return <XCircle size={16} color="var(--color-danger)" />;
    }
  };

  const getTitle = (severity: ReliabilitySeverity) => {
    switch (severity) {
      case 'good': return 'Excellent';
      case 'warning': return 'Good with caveats';
      case 'danger': return 'May have issues';
    }
  };

  return (
    <div style={{
      marginTop: 'var(--spacing-lg)',
      padding: 'var(--spacing-md)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
            <div style={{ marginTop: 2 }}>{getIcon(report.overallScore)}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                Scan Reliability
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {getTitle(report.overallScore)}
              </span>
            </div>
          </div>
          {(report.overallScore === 'warning' || report.overallScore === 'danger') && (
            <button
              onClick={handleAutoFix}
              disabled={isFixing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: isFixing ? 'wait' : 'pointer',
                fontWeight: 500,
                opacity: isFixing ? 0.7 : 1,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => { if(!isFixing) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)' }}
              onMouseOut={(e) => { if(!isFixing) e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)' }}
            >
              {isFixing && <Loader2 size={14} className="animate-spin" />}
              {isFixing ? 'Fixing...' : 'Auto-Fix Issues'}
            </button>
          )}
        </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        {report.checks.map((check) => (
          <li key={check.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
            <div style={{ marginTop: 2 }}>
              {getIcon(check.severity)}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>{check.label}</span>
              {check.detail && <span style={{ color: 'var(--color-text-muted)' }}> — {check.detail}</span>}
              {check.recommendation && (
                <div style={{ marginTop: 2, color: 'var(--color-text)', fontStyle: 'italic' }}>
                  Recommendation: {check.recommendation}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {diagnostics && diagnostics.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-success)' }}>
            <CheckCircle size={14} /> Auto-fixed {diagnostics.length} {diagnostics.length === 1 ? 'issue' : 'issues'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-xs)' }}>
            {diagnostics.map((diag, i) => {
              const isContrast = diag.contrastBefore !== undefined && diag.contrastAfter !== undefined;
              
              let beforeStr = diag.before;
              let afterStr = diag.after;
              
              if (isContrast) {
                // Truncate to strictly show if it was under 4.6
                const beforeVal = Math.floor(diag.contrastBefore! * 10) / 10;
                const afterVal = Math.floor(diag.contrastAfter! * 10) / 10;
                beforeStr = beforeVal.toFixed(1);
                afterStr = afterVal.toFixed(1);
              }

              return (
                <div 
                  key={i} 
                  title={isContrast 
                    ? `Improved contrast against ${diag.relationship.replace('bg ↔ ', '')}` 
                    : `Fixed ${diag.relationship}`}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{formatComponent(diag.component)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    <span>{isContrast ? 'Contrast improved' : 'Adjusted'}</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-danger)' }}>
                      {beforeStr}
                    </span>
                    <span>→</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      {afterStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
