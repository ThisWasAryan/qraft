import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      options,
      error,
      fullWidth = false,
      id: externalId,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const id = externalId || internalId;

    const containerClass = [
      styles.container,
      fullWidth ? styles.fullWidth : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const selectClass = [
      styles.select,
      error ? styles.selectError : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClass}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select ref={ref} id={id} className={selectClass} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.icon} size={16} />
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
