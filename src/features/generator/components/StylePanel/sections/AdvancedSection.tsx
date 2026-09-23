import React from 'react';
import { useQRStore } from '../../../../../stores/qrStore';
import { Select } from '../../../../../components/Select/Select';
import { getMaxErrorCorrectionLevel } from '../../../../../utils/capacity';
import type { ErrorCorrectionLevel } from '../../../../../domain/types';

const errorCorrectionOptions = [
  { value: 'L', label: 'Low (7%) - Best for simple URLs' },
  { value: 'M', label: 'Medium (15%) - Standard' },
  { value: 'Q', label: 'Quartile (25%) - Good for logos' },
  { value: 'H', label: 'High (30%) - Maximum reliability' },
];

export const AdvancedSection: React.FC = () => {
  const content = useQRStore(state => state.config.content);
  const errorCorrection = useQRStore(state => state.config.errorCorrection);
  
  const maxLevel = getMaxErrorCorrectionLevel(content);
  const rank: Record<ErrorCorrectionLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
  
  const dynamicOptions = errorCorrectionOptions.map(opt => ({
    ...opt,
    disabled: rank[opt.value as ErrorCorrectionLevel] > rank[maxLevel],
    label: rank[opt.value as ErrorCorrectionLevel] > rank[maxLevel] ? `${opt.label} (Text too long)` : opt.label,
  }));
  
  const setErrorCorrection = useQRStore(state => state.setErrorCorrection);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div>
        <Select
          label="Error Correction Level"
          value={errorCorrection}
          options={dynamicOptions}
          onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
        />
        {maxLevel !== 'H' && (
          <div style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Higher error correction levels are disabled because your content is too long to fit.
          </div>
        )}
      </div>
    </div>
  );
};
