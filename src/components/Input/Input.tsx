import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
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

    const inputClass = [
      styles.input,
      error ? styles.inputError : '',
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
        <input ref={ref} id={id} className={inputClass} {...props} />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
