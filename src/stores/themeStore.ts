import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const getInitialMode = (): ThemeMode => {
  const savedMode = localStorage.getItem('qraft-theme') as ThemeMode | null;
  return savedMode || 'system';
};

const applyTheme = (mode: ThemeMode) => {
  if (mode === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', mode);
  }
};

export const useThemeStore = create<ThemeState>((set) => {
  const initialMode = getInitialMode();
  
  // Need to apply immediately on initial load to avoid flash
  if (typeof window !== 'undefined') {
    applyTheme(initialMode);
  }

  return {
    mode: initialMode,
    setMode: (mode: ThemeMode) => {
      localStorage.setItem('qraft-theme', mode);
      applyTheme(mode);
      set({ mode });
    },
  };
});

// Listener for system theme changes if mode is 'system'
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentMode = useThemeStore.getState().mode;
    if (currentMode === 'system') {
      applyTheme('system');
    }
  });
}
