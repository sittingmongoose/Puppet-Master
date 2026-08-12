/**
 * Documentation / editor aid only — not loaded at runtime.
 * Contracts for Concepts/chat-assistant-concepts/grok-4-5/ host composition.
 */

type ThemeId =
  | 'friendly-dark'
  | 'friendly-light'
  | 'retro-dark'
  | 'retro-light'
  | 'basic-light'
  | 'basic-dark'
  | 'glass-dark'
  | 'glass-light';

type MountMode = 'docked' | 'popout';

type WindowId = 'w1' | 'w2' | 'w3' | 'w4' | 'w5' | 'w6' | 'w7' | 'w8';

type ThreadId = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8';

type LensOp =
  | { kind: 'mute'; ids: string[] }
  | { kind: 'focus'; ids: string[] }
  | { kind: 'subcompact'; ids: string[]; summary?: string }
  | { kind: 'clear' };

type ChatHostEvent =
  | { type: 'thread.select'; threadKey: string }
  | { type: 'thread.create' }
  | { type: 'composer.send'; text: string }
  | { type: 'composer.stop' }
  | { type: 'search.query'; query: string; scope: 'current' | 'all' }
  | { type: 'search.jump'; threadKey: string; messageId: string }
  | {
      type: 'selector.change';
      key: 'persona' | 'model' | 'mode' | 'worktree' | 'effort';
      value: string;
    }
  | { type: 'lens.apply'; op: LensOp }
  | { type: 'mount.toggle'; mode: MountMode }
  | { type: 'shell.rail'; open: boolean }
  | { type: 'ui.local'; path: string; value: unknown };

interface HostEnv {
  modelLabel: 'Grok 4.5';
  theme: ThemeId;
  reducedMotion: boolean;
  chatWidthPx: number;
  railOpen: boolean;
  mountMode: MountMode;
  store: ChatSemanticStore;
  emit(event: ChatHostEvent): void;
  toast(msg: string): void;
}

interface WindowMountProps {
  env: HostEnv;
  threadSlotEl: HTMLElement;
  onRequestPopout(): void;
  onRequestDock(): void;
  onRequestClose(): void;
}

interface WindowHandle {
  update(props: Partial<WindowMountProps> & { env?: HostEnv }): void;
  unmount(): void;
  getOverlayRoot(): HTMLElement;
}

/** Window owns chrome around the thread; not transcript/message DOM. */
interface WindowModule {
  id: WindowId;
  label: string;
  mount(hostEl: HTMLElement, props: WindowMountProps): WindowHandle;
}

interface ThreadMountProps {
  env: HostEnv;
  contentWidthPx: number;
}

interface ThreadHandle {
  update(props: Partial<ThreadMountProps> & { env?: HostEnv }): void;
  unmount(): void;
  restoreScrollAnchor(): void;
}

/** Thread owns transcript, surfaces, questionnaire, composer, collapse UI. */
interface ThreadModule {
  id: ThreadId;
  label: string;
  mount(slotEl: HTMLElement, props: ThreadMountProps): ThreadHandle;
}

interface ComposerDraft {
  text: string;
  attachments: { id: string; name: string; path: string }[];
  updatedAt: string;
}

interface ContextLensState {
  mode: 'off' | 'mute' | 'focus' | 'subcompact';
  selectionIds: string[];
  mutedIds: string[];
  focusedIds: string[];
  subcompacts: { id: string; sourceIds: string[]; summary: string }[];
}

interface ThreadUiState {
  scrollAnchor: { messageId: string; offsetPx: number } | null;
  stickToBottom: boolean;
  expandedMessageIds: Record<string, boolean>;
  expandedThoughtIds: Record<string, boolean>;
  expandedSubagentIds: Record<string, boolean>;
  goalExpanded: boolean;
  todoCollapsed: boolean;
  threadHistoryQuery: string;
  threadHistoryFilter: string;
}

/** Message / goal / todo / subagent / activity shapes are demo-data opaque here. */
interface Message {
  id: string;
  [key: string]: unknown;
}

interface GoalState {
  [key: string]: unknown;
}

interface TodoItem {
  id: string;
  [key: string]: unknown;
}

interface SubagentGroup {
  id: string;
  [key: string]: unknown;
}

interface DiffSurface {
  id: string;
  [key: string]: unknown;
}

interface ActivityState {
  [key: string]: unknown;
}

interface Questionnaire {
  id: string;
  [key: string]: unknown;
}

interface RunDemoState {
  [key: string]: unknown;
}

type AccessProfile = 'ask' | 'auto-edits' | 'auto' | 'full';
type SpeedMode = 'normal' | 'fast';
type BsdMode = 'off' | 'auto' | 'on';
type BsdScope = 'turn' | 'thread';
type BsdVisual =
  | 'off'
  | 'auto-idle'
  | 'auto-active'
  | 'on'
  | 'silent'
  | 'advice'
  | 'dup-suppressed'
  | 'timed-out'
  | 'unavailable'
  | 'quota-limited';

type SyncState =
  | 'live'
  | 'cached'
  | 'synchronizing'
  | 'offline'
  | 'reconnecting'
  | 'replay'
  | 'snapshot'
  | 'server-work-continuing';

type OutboxKind = 'send' | 'question' | 'redirect' | 'approval' | 'goal' | 'thread-request';
type OutboxStatus = 'queued' | 'sending' | 'acked' | 'failed';
type NotificationTone = 'info' | 'warn' | 'error' | 'success';

interface ThreadLocalState {
  providerId: string;
  accountId: string;
  connectionId: string;
  modelId: string;
  personaId: string;
  effortId: string;
  speedMode: SpeedMode;
  modeId: string;
  accessProfile: AccessProfile;
  bsd: {
    mode: BsdMode;
    scope: BsdScope;
    visual: BsdVisual;
    adviceId: string | null;
  };
  crewId: string;
  worktreeId: string | null;
  spellcheckEnabled: boolean;
  frozen: boolean;
}

interface RestorePoint {
  id: string;
  threadId: string;
  messageId: string;
  label: string;
  createdAt: string;
  messageIndex: number;
}

interface OutboxItem {
  id: string;
  kind: OutboxKind;
  payload: unknown;
  status: OutboxStatus;
  createdAt: string;
  ackedAt?: string;
}

interface SessionNotification {
  id: string;
  title: string;
  body: string;
  tone: NotificationTone;
  read: boolean;
  createdAt: string;
}

interface AttachmentResolveResult {
  class: 'native' | 'pm-transformed' | 'alternate' | 'unsupported';
  lineage: string[];
  choices: { id: string; label: string }[];
  file: { name: string; [key: string]: unknown };
}

interface ThreadRecord {
  id: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  state: string | null;
  tags: string[];
  project: unknown;
  updatedAt: string | null;
  messages: Message[];
  draft: ComposerDraft;
  draftRevisions: ComposerDraft[];
  lens: ContextLensState;
  goal: GoalState | null;
  todos: TodoItem[] | null;
  subagentGroups: SubagentGroup[];
  diffGroups: DiffSurface[];
  activity: ActivityState[] | ActivityState;
  questionnaires: Questionnaire[];
  artifacts: unknown[];
  browserSessions: unknown[];
  scriptedReplyIds: string[];
  scriptedReplyCursor: number;
  initialVisibleMessageCount: number;
  localState: ThreadLocalState;
  restorePoints: RestorePoint[];
}

/**
 * Shared semantic store — survives Window/Thread remount and docked↔popout.
 * Geometry (mountMode, widths) lives on the host, not here.
 */
interface ChatSemanticStore {
  version: 1;
  modelLabel: 'Grok 4.5';

  session: {
    activeThreadKey: string;
    /** Defaults for newly created threads */
    personaId: string;
    modelId: string;
    defaultModelId: string;
    threadModelOverride: string | null;
    modeId: string;
    effortId: string;
    speedMode: SpeedMode;
    accessProfile: AccessProfile;
    providerId: string;
    accountId: string;
    connectionId: string;
    crewId: string;
    worktreeId: string | null;
    keepThoughtExpandedWhileActive: boolean;
    historyPinned: boolean;
    historyMode: 'closed' | 'peek' | 'pinned_compact' | 'pinned_full';
    artifactWorkspace: {
      open: boolean;
      artifactId: string | null;
      status: string;
      queue: unknown[];
      scrollTop: number;
      errorMessage: string | null;
    };
    favoritesModelIds: string[];
    approval: unknown;
    warning: unknown;
    compactNow: { status: string; progress: number };
    spellcheckEnabled: boolean;
    accessLimitedBy: string | null;
    sync: { state: SyncState; routeLabel: string; cursor: number };
    outbox: OutboxItem[];
    notifications: SessionNotification[];
  };

  threads: Record<string, ThreadRecord>;

  search: {
    query: string;
    scope: 'current' | 'all';
    selectedResultId: string | null;
    focusedTargetMessageId: string | null;
    highlightUntil: number | null;
  };

  ui: {
    perThread: Record<string, ThreadUiState>;
  };

  demo: {
    replyCursorByThread: Record<string, number>;
    runningByThread: Record<string, RunDemoState | null>;
  };

  subscribe(fn: () => void): () => void;
  getSnapshot(): ChatSemanticStore;
  setThreadLocal(threadId: string, patch: Partial<ThreadLocalState>): ThreadLocalState;
  getThreadLocal(threadId: string): ThreadLocalState;
  getActiveLocal(): ThreadLocalState;
  setBsd(threadId: string, opts: { mode?: BsdMode; scope?: BsdScope }): ThreadLocalState['bsd'];
  setBsdVisual(threadId: string, visual: BsdVisual): BsdVisual;
  createRestorePoint(threadId: string, messageId: string, label?: string): string;
  rewindTo(threadId: string, messageIdOrRestorePointId: string): { messageId: string; via: string; removedCount: number };
  redirectActiveTurn(threadId: string, text: string): { attemptId: string; messageId: string; partialBody: string };
  enqueueOutbox(item: Partial<OutboxItem> & { id?: string }): OutboxItem;
  replayOutbox(): string[];
  setSyncState(state: SyncState): SyncState;
  pushNotification(n: Partial<SessionNotification>): SessionNotification;
  markNotificationRead(id: string): boolean;
  resolveAttachment(fileMeta: unknown): AttachmentResolveResult;
}

declare global {
  interface Window {
    PMChatLabels: { MODEL: string; AGENT_SLUG: string };
    PMChatMotion: {
      isReduced(): boolean;
      setReduced(on: boolean): void;
    };
    PMChatWindows: Record<WindowId, WindowModule>;
    PMChatThreads: Record<ThreadId, ThreadModule>;
    PMChatHost: {
      boot(opts?: {
        windowId?: WindowId;
        threadId?: ThreadId;
        mountMode?: MountMode;
      }): void;
      setPair(windowId: WindowId, threadId: ThreadId): void;
      setMountMode(mode: MountMode): void;
      getStore(): ChatSemanticStore;
    };
  }
}

export {};
