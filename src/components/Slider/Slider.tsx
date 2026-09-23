import styles from './Slider.module.css';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

export const Slider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  disabled = false,
}: SliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`.trim()}>
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
      )}
      <div className={styles.sliderWrapper}>
        <div 
          className={styles.trackFill} 
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={styles.input}
        />
      </div>
    </div>
  );
};
