import React, { useState } from 'react';
import { useQRStore } from '../../../../stores/qrStore';
import { Input } from '../../../../components/Input/Input';

export const UPIForm: React.FC = () => {
  const content = useQRStore((state) => state.config.content);
  const setContent = useQRStore((state) => state.setContent);
  const contentErrors = useQRStore((state) => state.contentErrors);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (content.type !== 'upi') return null;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getError = (field: string) => {
    if (!touched[field]) return undefined;
    const err = contentErrors.find(e => e.field === field && e.severity === 'error');
    return err ? err.message : undefined;
  };

  const amountWarning = contentErrors.find(e => e.field === 'isFixedAmount' && e.severity === 'warning');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <Input
        label="Payee Address (UPI ID)"
        placeholder="name@bank"
        value={content.payeeAddress}
        onChange={(e) => setContent({ payeeAddress: e.target.value })}
        onBlur={() => handleBlur('payeeAddress')}
        error={getError('payeeAddress')}
        fullWidth
      />
      
      <Input
        label="Payee Name"
        placeholder="Aryan Raj"
        value={content.payeeName}
        onChange={(e) => setContent({ payeeName: e.target.value })}
        onBlur={() => handleBlur('payeeName')}
        error={getError('payeeName')}
        fullWidth
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) 0' }}>
        <input 
          type="checkbox" 
          id="isFixedAmount" 
          checked={content.isFixedAmount}
          onChange={(e) => {
            setContent({ isFixedAmount: e.target.checked });
            if (!e.target.checked) {
              setContent({ amount: '' }); // Clear amount if payer enters
            }
          }}
        />
        <label htmlFor="isFixedAmount" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
          Fixed Amount
        </label>
      </div>

      {amountWarning && (
        <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
          {amountWarning.message}
        </span>
      )}

      {content.isFixedAmount ? (
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <Input
            label="Amount (INR)"
            placeholder="500.00"
            value={content.amount || ''}
            onChange={(e) => setContent({ amount: e.target.value })}
            onBlur={() => handleBlur('amount')}
            error={getError('amount')}
            fullWidth
            type="number"
            step="0.01"
            min="0"
          />
        </div>
      ) : (
        <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            The payer will manually enter the amount while scanning the QR code.
          </span>
        </div>
      )}
      
      <Input
        label="Transaction Note (Optional)"
        placeholder="Payment for photography"
        value={content.transactionNote || ''}
        onChange={(e) => setContent({ transactionNote: e.target.value })}
        onBlur={() => handleBlur('transactionNote')}
        error={getError('transactionNote')}
        fullWidth
      />
    </div>
  );
};
