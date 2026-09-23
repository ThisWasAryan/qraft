import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './Dialog.module.css';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    if (isOpen && !dialogElement.open) {
      dialogElement.showModal();
    } else if (!isOpen && dialogElement.open) {
      dialogElement.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialogElement.addEventListener('cancel', handleCancel);
    return () => dialogElement.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdropClick}
    >
      <div className={styles.container}>
        <header className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <Button
              variant="icon"
              size="sm"
              onClick={onClose}
              aria-label="Close dialog"
              className={styles.closeBtn}
            >
              <X size={16} />
            </Button>
          </header>
        <div className={styles.content}>{children}</div>
      </div>
    </dialog>
  );
};
