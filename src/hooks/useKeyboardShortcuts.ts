import { useEffect } from 'react';

interface KeyboardShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrlKey = false,
          metaKey = false,
          shiftKey = false,
          altKey = false,
          action,
          preventDefault = true
        } = shortcut;

        const matchesKey = event.key.toLowerCase() === key.toLowerCase();
        const matchesCtrl = event.ctrlKey === ctrlKey;
        const matchesMeta = event.metaKey === metaKey;
        const matchesShift = event.shiftKey === shiftKey;
        const matchesAlt = event.altKey === altKey;

        if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
          if (preventDefault) {
            event.preventDefault();
          }
          action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts
export const KEYBOARD_SHORTCUTS = {
  RUN_INFERENCE: {
    key: 'Enter',
    ctrlKey: true,
    description: 'Run type inference (Ctrl+Enter)'
  },
  CLOSE_MODAL: {
    key: 'Escape',
    description: 'Close modal/dialog (Esc)'
  },
  FOCUS_INPUT: {
    key: '/',
    description: 'Focus expression input (/)'
  },
  CLEAR_INPUT: {
    key: 'Backspace',
    ctrlKey: true,
    shiftKey: true,
    description: 'Clear expression input (Ctrl+Shift+Backspace)'
  },
  TOGGLE_COMPARE: {
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    description: 'Toggle compare mode (Ctrl+Shift+C)'
  },
  EXPORT_RESULTS: {
    key: 'e',
    ctrlKey: true,
    description: 'Export results (Ctrl+E)'
  },
  SHARE_LINK: {
    key: 's',
    ctrlKey: true,
    description: 'Share current state (Ctrl+S)'
  }
} as const;