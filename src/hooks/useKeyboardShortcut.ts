import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
};

export function useKeyboardShortcut(combo: KeyCombo, callback: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return; // Do not trigger shortcuts when typing
      }

      const isKeyMatch = event.key.toLowerCase() === combo.key.toLowerCase();
      const isCtrlMatch = combo.ctrlKey ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const isShiftMatch = combo.shiftKey ? event.shiftKey : !event.shiftKey;
      const isAltMatch = combo.altKey ? event.altKey : !event.altKey;

      if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [combo, callback]);
}
