import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrchestratorStore } from '@/stores/orchestratorStore';

export interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}

interface UseKeyboardShortcutsOptions {
  onShowHelp?: () => void;
  onCommandPalette?: () => void;
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts hook
 * 
 * Provides keyboard navigation per GUI_SPEC.md Section 7:
 * - Space: Start/Pause toggle
 * - Escape: Stop execution
 * - R: Retry current item
 * - G: Go to current item
 * - L: Open logs
 * - D: Open doctor
 * - C: Open capabilities
 * - B: Open budgets
 * - M: Open memory/AGENTS
 * - ?: Show help
 * - 1-4: Jump to tier view
 * - /: Open command palette
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onShowHelp, onCommandPalette, enabled = true } = options;
  const navigate = useNavigate();
  const { status, setStatus } = useOrchestratorStore();
  
  // Track if we're currently in an input element
  const isInputFocused = useRef(false);

  // Define shortcuts - memoized to prevent unnecessary re-renders
  const shortcuts = useMemo<Shortcut[]>(() => [
    {
      key: ' ',
      description: 'Start/Pause toggle',
      action: () => {
        if (status === 'running') {
          setStatus('paused');
        } else if (status === 'paused' || status === 'idle') {
          setStatus('running');
        }
      },
    },
    {
      key: 'Escape',
      description: 'Stop execution',
      action: () => {
        if (status === 'running' || status === 'paused') {
          setStatus('idle');
        }
      },
    },
    {
      key: 'r',
      description: 'Retry current item',
      action: () => {
        // Would trigger retry API call
        console.log('[Shortcuts] Retry current item');
      },
    },
    {
      key: 'g',
      description: 'Go to current item',
      action: () => {
        navigate('/tiers');
      },
    },
    {
      key: 'l',
      description: 'Open logs',
      action: () => {
        navigate('/history');
      },
    },
    {
      key: 'd',
      description: 'Open doctor',
      action: () => {
        navigate('/doctor');
      },
    },
    {
      key: 'c',
      description: 'Open capabilities',
      action: () => {
        navigate('/doctor');
      },
    },
    {
      key: 'b',
      description: 'Open budgets',
      action: () => {
        navigate('/config?tab=budgets');
      },
    },
    {
      key: 'm',
      description: 'Open memory/AGENTS',
      action: () => {
        navigate('/config?tab=memory');
      },
    },
    {
      key: '?',
      description: 'Show help',
      action: () => {
        onShowHelp?.();
      },
    },
    {
      key: '1',
      description: 'Jump to Phase view',
      action: () => {
        navigate('/tiers?level=phase');
      },
    },
    {
      key: '2',
      description: 'Jump to Task view',
      action: () => {
        navigate('/tiers?level=task');
      },
    },
    {
      key: '3',
      description: 'Jump to Subtask view',
      action: () => {
        navigate('/tiers?level=subtask');
      },
    },
    {
      key: '4',
      description: 'Jump to Iteration view',
      action: () => {
        navigate('/tiers?level=iteration');
      },
    },
    {
      key: '/',
      description: 'Open command palette',
      action: () => {
        onCommandPalette?.();
      },
    },
  ], [status, setStatus, navigate, onShowHelp, onCommandPalette]);

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        isInputFocused.current = true;
        return;
      }
      isInputFocused.current = false;

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        if (s.key !== event.key) return false;
        if (s.modifiers?.ctrl && !event.ctrlKey) return false;
        if (s.modifiers?.shift && !event.shiftKey) return false;
        if (s.modifiers?.alt && !event.altKey) return false;
        if (s.modifiers?.meta && !event.metaKey) return false;
        return true;
      });

      if (shortcut) {
        // Prevent default for space to avoid scrolling
        if (shortcut.key === ' ') {
          event.preventDefault();
        }
        // Prevent default for slash to avoid browser search
        if (shortcut.key === '/') {
          event.preventDefault();
        }
        shortcut.action();
      }
    },
    [enabled, shortcuts]
  );

  // Add global event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts,
    isInputFocused: isInputFocused.current,
  };
}

/**
 * Shortcut display data for help modal
 */
export const SHORTCUTS_DATA = [
  { category: 'Execution', shortcuts: [
    { key: 'Space', description: 'Start/Pause toggle' },
    { key: 'Esc', description: 'Stop execution' },
    { key: 'R', description: 'Retry current item' },
  ]},
  { category: 'Navigation', shortcuts: [
    { key: 'G', description: 'Go to current item' },
    { key: 'L', description: 'Open logs/history' },
    { key: 'D', description: 'Open doctor' },
    { key: 'C', description: 'Open capabilities' },
    { key: 'B', description: 'Open budgets' },
    { key: 'M', description: 'Open memory/AGENTS' },
  ]},
  { category: 'Tier Views', shortcuts: [
    { key: '1', description: 'Phase view' },
    { key: '2', description: 'Task view' },
    { key: '3', description: 'Subtask view' },
    { key: '4', description: 'Iteration view' },
  ]},
  { category: 'General', shortcuts: [
    { key: '?', description: 'Show this help' },
    { key: '/', description: 'Command palette' },
  ]},
];
