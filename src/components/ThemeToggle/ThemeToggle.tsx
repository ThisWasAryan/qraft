import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../Button/Button';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { mode, setMode } = useThemeStore();

  const cycleTheme = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  const getIcon = () => {
    if (mode === 'light') return <Sun size={18} />;
    if (mode === 'dark') return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  const getAriaLabel = () => {
    if (mode === 'light') return 'Switch to dark theme';
    if (mode === 'dark') return 'Switch to system theme';
    return 'Switch to light theme';
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={styles.toggle}
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {getIcon()}
    </Button>
  );
};
