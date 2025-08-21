import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsConfig {
  onRunInference?: () => void;
  onClearInput?: () => void;
  onFocusInput?: () => void;
  onShare?: () => void;
  onToggleCompare?: () => void;
  onCloseModal?: () => void;
  disabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onRunInference,
  onClearInput,
  onFocusInput,
  onShare,
  onToggleCompare,
  onCloseModal,
  disabled = false
}: KeyboardShortcutsConfig) => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs/textareas or when disabled
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
    
    if (disabled) return;

    // Handle shortcuts
    const isCtrl = event.ctrlKey;
    const isShift = event.shiftKey;
    const key = event.key.toLowerCase();

    // Ctrl+Enter - Run type inference
    if (isCtrl && key === 'enter' && onRunInference) {
      event.preventDefault();
      onRunInference();
      return;
    }

    // Esc - Close modals/dialogs
    if (key === 'escape' && onCloseModal) {
      event.preventDefault();
      onCloseModal();
      return;
    }

    // / - Focus expression input (only when not in input)
    if (key === '/' && !isInputFocused && onFocusInput) {
      event.preventDefault();
      onFocusInput();
      return;
    }

    // Ctrl+Shift+Backspace - Clear input
    if (isCtrl && isShift && key === 'backspace' && onClearInput) {
      event.preventDefault();
      onClearInput();
      return;
    }

    // Ctrl+S - Share current state
    if (isCtrl && key === 's' && onShare) {
      event.preventDefault();
      onShare();
      return;
    }

    // Ctrl+Shift+C - Toggle compare mode
    if (isCtrl && isShift && key === 'c' && onToggleCompare) {
      event.preventDefault();
      onToggleCompare();
      return;
    }
  }, [onRunInference, onClearInput, onFocusInput, onShare, onToggleCompare, onCloseModal, disabled]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, disabled]);

  // Helper function to get shortcut display text
  const getShortcutText = useCallback((shortcut: string) => {
    const shortcuts = {
      'run': 'Ctrl+Enter',
      'clear': 'Ctrl+Shift+Backspace', 
      'focus': '/',
      'share': 'Ctrl+S',
      'compare': 'Ctrl+Shift+C',
      'close': 'Esc'
    };
    return shortcuts[shortcut as keyof typeof shortcuts] || '';
  }, []);

  return { getShortcutText };
};

// Hook for displaying keyboard shortcuts help
export const useKeyboardShortcutsHelp = () => {
  const shortcuts = [
    { key: 'Ctrl+Enter', description: 'Run type inference' },
    { key: 'Esc', description: 'Close modals/dialogs' },
    { key: '/', description: 'Focus expression input' },
    { key: 'Ctrl+Shift+Backspace', description: 'Clear input' },
    { key: 'Ctrl+S', description: 'Share current state' },
    { key: 'Ctrl+Shift+C', description: 'Toggle compare mode' }
  ];

  return shortcuts;
};