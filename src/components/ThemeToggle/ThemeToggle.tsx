import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../Button/Button';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { mode, setMode } = useThemeStore();

  const cycleTheme = (event: React.MouseEvent) => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    
    // Fallback if View Transitions API is not supported or reduced motion is preferred
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode(nextMode);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setMode(nextMode);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ],
        },
        {
          duration: 500,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  const getIcon = () => {
    if (mode === 'light') return <Sun size={18} />;
    return <Moon size={18} />;
  };

  const getAriaLabel = () => {
    if (mode === 'light') return 'Switch to dark theme';
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
