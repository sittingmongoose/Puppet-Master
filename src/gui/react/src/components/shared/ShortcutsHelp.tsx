import { Modal } from '@/components/ui';
import { SHORTCUTS_DATA } from '@/hooks/useKeyboardShortcuts';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Keyboard shortcuts help modal
 * 
 * Displays all available keyboard shortcuts organized by category.
 * Opened by pressing `?` key.
 */
export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="md"
    >
      <div className="space-y-lg">
        {SHORTCUTS_DATA.map((group) => (
          <div key={group.category}>
            <h3 className="font-display text-sm uppercase text-ink-faded mb-sm">
              {group.category}
            </h3>
            <div className="space-y-xs">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-xs border-b border-ink-faded/20"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="px-sm py-xs bg-paper-lined border-medium border-ink-faded font-mono text-sm min-w-[40px] text-center">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <p className="text-xs text-ink-faded text-center">
          Press <kbd className="px-xs bg-paper-lined border border-ink-faded font-mono">Esc</kbd> or click outside to close
        </p>
      </div>
    </Modal>
  );
}
