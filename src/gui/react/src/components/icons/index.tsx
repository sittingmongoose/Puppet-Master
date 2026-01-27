import type { ReactNode } from 'react';

/**
 * Base icon props - all icons accept these
 */
export interface IconProps {
  /** Size of the icon (default: "1em") */
  size?: string;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * Base icon component wrapper
 */
function IconWrapper({
  children,
  size = '1em',
  className = '',
  'aria-label': ariaLabel,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={ariaLabel}
      role="img"
    >
      {children}
    </svg>
  );
}

// ============================================
// Metadata Icons
// ============================================

/**
 * Folder icon - for projects/files
 */
export function FolderIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Folder'}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </IconWrapper>
  );
}

/**
 * Monitor/Computer icon - for platform/computer
 */
export function MonitorIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Monitor'}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </IconWrapper>
  );
}

/**
 * Clock icon - for duration/time
 */
export function ClockIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Clock'}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </IconWrapper>
  );
}

// ============================================
// File Type Icons
// ============================================

/**
 * Camera icon - for screenshots
 */
export function CameraIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Camera'}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </IconWrapper>
  );
}

/**
 * Document icon - for logs/documents
 */
export function DocumentIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Document'}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </IconWrapper>
  );
}

/**
 * Chart icon - for reports/charts
 */
export function ChartIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Chart'}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </IconWrapper>
  );
}

/**
 * Globe icon - for browser/trace
 */
export function GlobeIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Globe'}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconWrapper>
  );
}

/**
 * File icon - for file snapshots
 */
export function FileIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'File'}>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </IconWrapper>
  );
}

// ============================================
// Platform Icons
// ============================================

/**
 * Cursor icon - for Cursor platform
 */
export function CursorIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Cursor'}>
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </IconWrapper>
  );
}

/**
 * Robot icon - for Codex platform
 */
export function RobotIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Robot'}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="16" y1="11" x2="16" y2="16" />
    </IconWrapper>
  );
}

/**
 * Brain icon - for Claude platform
 */
export function BrainIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Brain'}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44L2 22v-4.5A2.5 2.5 0 0 1 4.5 15H7V9.5A2.5 2.5 0 0 1 9.5 7Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44L22 22v-4.5A2.5 2.5 0 0 0 19.5 15H17V9.5A2.5 2.5 0 0 0 14.5 7Z" />
    </IconWrapper>
  );
}

/**
 * Sparkle icon - for Gemini platform
 */
export function SparkleIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Sparkle'}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </IconWrapper>
  );
}

/**
 * Arm/Muscle icon - for Copilot platform
 */
export function ArmIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Arm'}>
      <path d="M17 11h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
      <path d="M5 11H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1" />
      <path d="M12 10v12" />
      <path d="M8 14h8" />
      <circle cx="12" cy="7" r="3" />
    </IconWrapper>
  );
}

/**
 * Package icon - for packages/platforms
 */
export function PackageIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Package'}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </IconWrapper>
  );
}

// ============================================
// Action Icons
// ============================================

/**
 * Lightbulb icon - for tips/suggestions
 */
export function LightbulbIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Lightbulb'}>
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 0 0 12" />
      <path d="M12 15v6" />
      <circle cx="12" cy="9" r="3" />
    </IconWrapper>
  );
}

/**
 * Refresh icon - for refresh actions
 */
export function RefreshIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Refresh'}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </IconWrapper>
  );
}

/**
 * Warning icon - for warnings/cautions
 */
export function WarningIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Warning'}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconWrapper>
  );
}

/**
 * Rocket icon - for start/launch actions
 */
export function RocketIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Rocket'}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </IconWrapper>
  );
}

// ============================================
// Tool Icons
// ============================================

/**
 * Wrench icon - for tools
 */
export function WrenchIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Wrench'}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </IconWrapper>
  );
}

/**
 * Gear icon - for settings/runtime
 */
export function GearIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Gear'}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364-4.243-4.243m-4.242 0L5.636 18.364m12.728 0-4.243-4.243m-4.242 0L5.636 5.636" />
    </IconWrapper>
  );
}

/**
 * Check icon - for success/check
 */
export function CheckIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Check'}>
      <path d="M20 6 9 17l-5-5" />
    </IconWrapper>
  );
}

/**
 * Clipboard icon - for clipboard/list
 */
export function ClipboardIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Clipboard'}>
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M9 4v4" />
    </IconWrapper>
  );
}

// ============================================
// Status Icons
// ============================================

/**
 * Checkmark icon - for checkmark symbol
 */
export function CheckmarkIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Checkmark'}>
      <polyline points="20 6 9 17 4 12" />
    </IconWrapper>
  );
}

/**
 * Cross icon - for error/close symbol
 */
export function CrossIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Close'}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconWrapper>
  );
}

/**
 * X icon - for fail/cross symbol
 */
export function XIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Error'}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconWrapper>
  );
}

/**
 * Info icon - for info symbol
 */
export function InfoIcon(props: IconProps) {
  return (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Info'}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconWrapper>
  );
}
