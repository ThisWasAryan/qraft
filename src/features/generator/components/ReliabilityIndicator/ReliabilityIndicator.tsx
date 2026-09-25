import React from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { analyzeReliability } from '../../../../domain/reliability';
import { TriangleAlert, CheckCircle, XCircle } from 'lucide-react';
import type { ReliabilitySeverity } from '../../../../domain/types';

export const ReliabilityIndicator: React.FC = () => {
  const config = useQRStore((state) => state.config);
  const autoFix = useQRStore((state) => state.autoFixReliability);
  const contentErrors = useQRStore((state) => state.contentErrors);
  const report = analyzeReliability(config);
  
  const hasFatalError = contentErrors.some(e => e.severity === 'error');

  if (hasFatalError) {
    return null;
  }

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
              onClick={autoFix}
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
            >
              Auto-Fix Issues
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
    </div>
  );
};
