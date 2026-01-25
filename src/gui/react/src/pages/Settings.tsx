import { useState, useEffect } from 'react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import type { Theme, Platform } from '@/types';

interface SettingsState {
  // Appearance
  theme: Theme;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  
  // Notifications
  soundEnabled: boolean;
  desktopNotifications: boolean;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  
  // Editor
  defaultEditor: string;
  autoSave: boolean;
  
  // Advanced
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  dataRetentionDays: number;
  
  // Platform preferences
  defaultPlatform: Platform | 'auto';
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'light',
  fontSize: 'medium',
  animations: true,
  soundEnabled: true,
  desktopNotifications: false,
  notifyOnComplete: true,
  notifyOnError: true,
  defaultEditor: 'cursor',
  autoSave: true,
  debugMode: false,
  logLevel: 'info',
  dataRetentionDays: 30,
  defaultPlatform: 'auto',
};

/**
 * Settings page - global app preferences
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const { theme, setTheme } = useUIStore();

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // In production, this would call the API
        // const data = await api.getSettings();
        
        // Load from localStorage for now
        const stored = localStorage.getItem('rwm-settings');
        if (stored) {
          const parsed = JSON.parse(stored) as SettingsState;
          setSettings(parsed);
        } else {
          // Use current theme from store
          setSettings((prev) => ({ ...prev, theme }));
        }
      } catch (err) {
        console.error('[Settings] Failed to load settings:', err);
      }
    };
    loadSettings();
  }, [theme]);

  // Update a setting
  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaved(false);
    
    // Apply theme change immediately
    if (key === 'theme') {
      setTheme(value as Theme);
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      // In production, this would call the API
      // await api.saveSettings(settings);
      
      // Save to localStorage for now
      localStorage.setItem('rwm-settings', JSON.stringify(settings));
      
      setIsDirty(false);
      setSaved(true);
      
      // Clear saved message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[Settings] Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setTheme(DEFAULT_SETTINGS.theme);
    setIsDirty(true);
  };

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Settings</h1>
        <div className="flex items-center gap-sm">
          {saved && (
            <span className="text-neon-green text-sm">✓ Settings saved</span>
          )}
          <Button variant="ghost" onClick={handleReset}>
            RESET TO DEFAULTS
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!isDirty}
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <Panel title="Appearance">
        <div className="space-y-md">
          <SettingRow label="Theme" description="Choose your preferred color scheme">
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value as Theme)}
              className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none min-w-[150px]"
              aria-label="Theme selection"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </SettingRow>

          <SettingRow label="Font Size" description="Adjust text size throughout the app">
            <select
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value as 'small' | 'medium' | 'large')}
              className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none min-w-[150px]"
              aria-label="Font size selection"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </SettingRow>

          <SettingRow label="Animations" description="Enable or disable UI animations">
            <ToggleSwitch
              checked={settings.animations}
              onChange={(checked) => updateSetting('animations', checked)}
              label="Enable animations"
            />
          </SettingRow>
        </div>
      </Panel>

      {/* Notifications */}
      <Panel title="Notifications">
        <div className="space-y-md">
          <SettingRow label="Sound Effects" description="Play sounds for events">
            <ToggleSwitch
              checked={settings.soundEnabled}
              onChange={(checked) => updateSetting('soundEnabled', checked)}
              label="Enable sound effects"
            />
          </SettingRow>

          <SettingRow label="Desktop Notifications" description="Show browser notifications">
            <ToggleSwitch
              checked={settings.desktopNotifications}
              onChange={(checked) => updateSetting('desktopNotifications', checked)}
              label="Enable desktop notifications"
            />
          </SettingRow>

          <SettingRow label="Notify on Complete" description="Alert when tasks complete">
            <ToggleSwitch
              checked={settings.notifyOnComplete}
              onChange={(checked) => updateSetting('notifyOnComplete', checked)}
              label="Notify on completion"
            />
          </SettingRow>

          <SettingRow label="Notify on Error" description="Alert when errors occur">
            <ToggleSwitch
              checked={settings.notifyOnError}
              onChange={(checked) => updateSetting('notifyOnError', checked)}
              label="Notify on error"
            />
          </SettingRow>
        </div>
      </Panel>

      {/* Editor */}
      <Panel title="Editor Preferences">
        <div className="space-y-md">
          <SettingRow label="Default Editor" description="Preferred code editor">
            <select
              value={settings.defaultEditor}
              onChange={(e) => updateSetting('defaultEditor', e.target.value)}
              className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none min-w-[150px]"
              aria-label="Default editor selection"
            >
              <option value="cursor">Cursor</option>
              <option value="vscode">VS Code</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
              <option value="other">Other</option>
            </select>
          </SettingRow>

          <SettingRow label="Auto-Save" description="Automatically save changes">
            <ToggleSwitch
              checked={settings.autoSave}
              onChange={(checked) => updateSetting('autoSave', checked)}
              label="Enable auto-save"
            />
          </SettingRow>
        </div>
      </Panel>

      {/* Platform Preferences */}
      <Panel title="Platform Preferences">
        <div className="space-y-md">
          <SettingRow label="Default Platform" description="Preferred AI platform for new tasks">
            <select
              value={settings.defaultPlatform}
              onChange={(e) => updateSetting('defaultPlatform', e.target.value as Platform | 'auto')}
              className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none min-w-[150px]"
              aria-label="Default platform selection"
            >
              <option value="auto">Auto (based on tier config)</option>
              <option value="cursor">Cursor</option>
              <option value="codex">Codex</option>
              <option value="claude">Claude Code</option>
            </select>
          </SettingRow>
        </div>
      </Panel>

      {/* Advanced */}
      <Panel title="Advanced">
        <div className="space-y-md">
          <SettingRow label="Debug Mode" description="Enable debug logging and features">
            <ToggleSwitch
              checked={settings.debugMode}
              onChange={(checked) => updateSetting('debugMode', checked)}
              label="Enable debug mode"
            />
          </SettingRow>

          <SettingRow label="Log Level" description="Minimum log level to display">
            <select
              value={settings.logLevel}
              onChange={(e) => updateSetting('logLevel', e.target.value as 'error' | 'warn' | 'info' | 'debug')}
              className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none min-w-[150px]"
              aria-label="Log level selection"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </SettingRow>

          <SettingRow label="Data Retention" description="Days to keep history and logs">
            <input
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value, 10) || 30)}
              min={7}
              max={365}
              className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none w-24"
              aria-label="Data retention days"
            />
            <span className="ml-sm text-ink-faded">days</span>
          </SettingRow>
        </div>
      </Panel>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-md py-sm border-b border-ink-faded/30">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-sm text-ink-faded">{description}</div>
      </div>
      <div className="flex items-center gap-sm">{children}</div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors
        ${checked ? 'bg-electric-blue' : 'bg-ink-faded'}
      `}
    >
      <span
        className={`
          absolute top-1 left-1 w-4 h-4 rounded-full bg-paper-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );
}
