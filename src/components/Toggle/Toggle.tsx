import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) => {
  return (
    <label className={`${styles.container} ${disabled ? styles.disabled : ''}`.trim()}>
      <div className={styles.toggleWrapper}>
        <input
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          role="switch"
          aria-checked={checked}
        />
        <div className={styles.track}>
          <div className={styles.thumb} />
        </div>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
