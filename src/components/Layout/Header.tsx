import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { Undo2, Redo2, Dices, History } from 'lucide-react';
import { useQRStore } from '../../stores/qrStore';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import styles from './Header.module.css';
import { useState, useEffect } from 'react';
import { useStore } from 'zustand';

export const Header = () => {
  const { undo, redo, pastStates, futureStates } = useStore(useQRStore.temporal, (state) => state);
  const randomizeDesign = useQRStore(state => state.randomizeDesign);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUndo = () => { if (pastStates.length > 0) undo(); };
  const handleRedo = () => { if (futureStates.length > 0) redo(); };

  useKeyboardShortcut({ key: 'z', ctrlKey: true, shiftKey: false }, handleUndo);
  useKeyboardShortcut({ key: 'z', ctrlKey: true, shiftKey: true }, handleRedo);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.blurWrapper}>
        <div className={styles.blurInner}></div>
      </div>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img src="/logo.png" width={24} height={24} alt="QRaft Logo" style={{ borderRadius: '2px' }} />
          </div>
          <span className={styles.title}>QRaft</span>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={handleUndo} 
            disabled={pastStates.length === 0}
            className={styles.actionBtn}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={handleRedo} 
            disabled={futureStates.length === 0}
            className={styles.actionBtn}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={18} />
          </button>
          <button 
            onClick={randomizeDesign}
            className={styles.actionBtn}
            title="Randomize Design"
          >
            <Dices size={18} />
          </button>
          <button 
            onClick={() => {
              const historySection = document.getElementById('history-section');
              if (historySection) {
                historySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }}
            className={styles.actionBtn}
            title="History"
          >
            <History size={18} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
