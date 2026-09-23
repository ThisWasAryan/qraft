import type { ElementType } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';
import type { ToastVariant } from '../../stores/toastStore';
import styles from './Toast.module.css';

const icons: Record<ToastVariant, ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => {
        const Icon = icons[toast.variant];
        return (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`}>
            <Icon size={18} className={styles.icon} />
            <span className={styles.message}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className={styles.closeButton}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
