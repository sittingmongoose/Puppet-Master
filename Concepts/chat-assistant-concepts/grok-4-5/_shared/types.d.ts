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

interface ThreadRecord {
  key: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  messages: Message[];
  unloadedOlderIds: string[];
  draft: ComposerDraft;
  draftRevisions: ComposerDraft[];
  lens: ContextLensState;
  goal: GoalState | null;
  todos: TodoItem[];
  subagents: SubagentGroup[];
  diffs: DiffSurface[];
  activity: ActivityState;
  questionnaireQueue: Questionnaire[];
  historyMeta: { renamed?: string; branches?: string[] };
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
    personaId: string;
    modelId: string;
    modeId: string;
    effortId: string;
    worktreeId: string | null;
    keepThoughtExpandedWhileActive: boolean;
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
