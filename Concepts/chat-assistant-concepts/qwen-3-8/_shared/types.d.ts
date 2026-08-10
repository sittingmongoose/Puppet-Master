export interface PMChatEnv {
  store: PMChatStore;
  demo: any;
  popups: typeof window.PMChatPopups;
  icons: typeof window.PMIcons;
  fmt: typeof window.PMFmt;
  labels: { MODEL: string; AGENT_SLUG: string };
  mountMode: "docked" | "popout";
  themeId: string;
  widthPx: number;
  railOpen: boolean;
  reducedMotion: boolean;
  hostApi: {
    openEditorTab(tab: { id: string; title: string; kind: string; detail: string }): void;
    toast(text: string): void;
    requestMountMode(mode: "docked" | "popout"): void;
    requestPair(windowId: string, threadId: string): void;
    switchThread(threadKey: string): void;
  };
}

export interface WindowHandle {
  update(patch: Partial<PMChatEnv>): void;
  unmount(): void;
  getOverlayRoot(): HTMLElement;
}

export interface WindowModule {
  id: string;
  label: string;
  mount(hostEl: HTMLElement, ctx: {
    env: PMChatEnv;
    threadSlotEl: HTMLElement;
    onRequestPopout(): void;
    onRequestDock(): void;
    onRequestClose(): void;
  }): WindowHandle;
}

export interface ThreadHandle {
  update(patch: Partial<PMChatEnv> & { contentWidthPx?: number }): void;
  unmount(): void;
  restoreScrollAnchor(anchorId?: string): void;
}

export interface ThreadModule {
  id: string;
  label: string;
  mount(slotEl: HTMLElement, ctx: { env: PMChatEnv; contentWidthPx: number }): ThreadHandle;
}

export interface PMChatStore {
  data: any;
  state: any;
  thread(key: string): any;
  activeThread(): any;
  mutate(fn: () => void): void;
  subscribe(fn: () => void): () => void;
  serializeState(): string;
  restoreState(snapshot: string): void;
  persistDrafts(): void;
  searchIndex: { query(q: string, scope: "thread" | "all", threadKey?: string): any[] };
}

declare global {
  interface Window {
    PMChatLabels: { MODEL: string; AGENT_SLUG: string };
    PMChatWindows: Record<string, WindowModule>;
    PMChatThreads: Record<string, ThreadModule>;
    PMChatHost: any;
    PMChatBridge: any;
    PMChatStore: any;
    PMChatPopups: any;
    PMChatWindowKit: any;
    PMChatThreadKit: any;
    PMChatShell: any;
    PMChatRegistry: any;
    PMChatDemoLoader: any;
    PMIcons: any;
    PMFmt: any;
    __pmChatState(): any;
  }
}
