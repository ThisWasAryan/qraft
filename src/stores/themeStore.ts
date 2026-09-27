import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const getInitialMode = (): ThemeMode => {
  const savedMode = localStorage.getItem('qraft-theme') as ThemeMode | null;
  return savedMode || 'dark';
};

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.setAttribute('data-theme', mode);
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
