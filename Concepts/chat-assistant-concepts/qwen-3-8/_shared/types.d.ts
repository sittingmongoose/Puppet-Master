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

export type BsdMode = "off" | "auto" | "on";
export type BsdScope = "turn" | "thread";
export type ConnStatus = "live" | "cached" | "synchronizing" | "offline" | "reconnecting" | "replaying" | "snapshot";
export type ConnectionKind = "API key" | "OAuth (CLI-owned)" | "Workspace";

export interface ModelSelection {
  provider: string;
  model: string;
  effort?: string;
  speed?: string;
  accountId?: string | null;
}

export interface EffectiveAccount {
  provider: string;
  accountId: string | null;
  accountLabel: string;
  connection: string;
}

export interface OutboxDraft {
  threadKey?: string;
  text?: string;
  attachments?: unknown[];
}

export interface NotificationSeed {
  id?: string;
  title?: string;
  body?: string;
  kind?: "approval" | "goal-blocked" | "update-available" | "collision" | "completion";
  at?: string;
  threadKey?: string | null;
}

export interface OperationalState {
  ports: Array<{ port: number; owner: string; threadKey?: string; worktree?: string; suggestion?: number; state: "conflict" | "resolved"; resolvedTo?: number }>;
  worktrees: Array<{ name: string; state: "isolated" | "waiting-writer" | "conflict" | "patch-preserved" | "cleanup-pending"; owner?: string }>;
  sessions: Array<{ kind: "browser" | "test" | "debug" | "logs" | "backup" | "snapshot"; label: string; state?: string }>;
}

export interface PMChatStore {
  /** Raw demo fixture (demoData.json + demo-extend). Opaque by design. */
  data: unknown;
  /** Live state tree: session, threads, extraThreads, connection, notifications, ui, running. */
  state: unknown;
  PROVIDER_MODEL: Record<string, string>;
  MODEL_PERSONA: Record<string, string>;
  demoThread(key: string): unknown;
  allThreads(): unknown[];
  thread(key: string): unknown;
  activeKey(): string;
  messages(key: string): unknown[];
  loadedMessages(key: string): unknown[];
  findMessage(key: string, msgId: string): unknown;
  mutate(fn: () => void): void;
  subscribe(fn: () => void): () => void;
  emit(): void;
  search(q: string, scope: "thread" | "all", threadKey?: string): unknown[];
  groupedSearch(q: string): unknown[];
  replyFor(key: string): unknown;
  send(text: string): boolean;
  stopRun(): void;
  isRunning(key: string): boolean;
  workedSeconds(run: unknown): number;
  togglePin(winId: string): void;
  isPinned(winId: string): boolean;
  statusForThread(t: unknown, running: unknown): { glyph: string; blocked: boolean; draw: boolean };
  setDraft(text: string): void;
  pushRevision(): void;
  restoreRevision(idx: number): void;
  clearDraft(): void;
  activeQuestionnaire(key: string): unknown;
  questRecords(key: string): unknown[];
  questIndex(quest: { id: string }, key?: string): number;
  questAnswer(quest: { id: string }, q: { id: string; kind: string }): unknown;
  questSetAnswer(quest: { id: string }, q: { id: string; kind: string }, value: unknown): void;
  questValid(quest: unknown): boolean;
  questGoTo(quest: { id: string }, idx: number): void;
  questSkip(quest: { id: string }): void;
  questSubmit(quest: { id: string }): void;
  questCancel(quest: { id: string }): void;
  lensToggle(msgId: string): void;
  lensSetMode(mode: "off" | "mute" | "focus" | "subcompact"): void;
  lensApplySubcompact(): void;
  lensClearMessage(msgId: string): void;
  lensShapeOf(msgId: string): "muted" | "focused" | "subcompacted" | null;
  lensHasShaping(): boolean;
  toggleLongMessage(msgId: string): void;
  isLongCollapsed(msg: { id: string; collapsedByDefault?: boolean }): boolean;
  setSession(patch: Record<string, unknown>): void;
  switchThread(key: string): void;
  goalEffectiveStatus(key: string): string | null;
  goalAct(key: string, action: "pause" | "resume" | "stop" | "clear" | "expand" | "collapse"): void;
  goalSaveObjective(key: string, text: string): void;
  serializeState(): string;
  restoreState(snapshot: string | object): void;
  resetForRestart(): void;
  persist(): void;
  setPin(winId: string, on: boolean): void;
  pinMode(winId: string): "full" | "compact";
  setPinMode(winId: string, mode: "full" | "compact"): void;
  artWs(winId: string): { open: boolean; activeId: string | null };
  artOpen(winId: string, artId?: string): void;
  artClose(winId: string): void;
  artSwitch(winId: string, artId: string): void;
  artStatusOf(key: string, artId: string): string;
  artSetStatus(key: string, artId: string, status: string, bump?: boolean): void;
  artEntry(key: string, artId: string): { status: string; version: number };
  threadArtifacts(key: string): unknown[];
  ACCESS_PROFILES: string[];
  effectiveSettings(key?: string): { provider: string; model: string; persona: string; mode: string; effort: string; speed: string; access: string; account?: string | null };
  setThreadSettings(key: string, patch: Record<string, unknown>, scope?: "session" | "thread"): void;
  accessNote(key: string): string | null;
  favoriteToggle(modelName: string): void;
  catalog(): unknown[];
  catalogModel(name: string): { provider: string; model: unknown } | null;
  modelConsequence(key: string, next: { provider: string; model: string }): unknown;
  applyModelChange(key: string, sel: ModelSelection, scope?: "session" | "thread"): void;
  attachRouteFor(key: string, attach: { id: string; kind?: string }): string;
  attachSetRoute(key: string, attachId: string, route: string, consented?: boolean): void;
  noSafeRoute(key: string, attach: { kind: string }): boolean;
  approvalInject(key: string, ap: Record<string, unknown>): string;
  approvalResolve(key: string, id: string, action: string): void;
  warningInject(key: string, w: Record<string, unknown>): string;
  warningResolve(key: string, id: string, action: string): void;
  restorePointCreate(key: string, msgId: string): string;
  rewindTo(key: string, rpId: string): void;
  rewindClear(key: string): void;
  branchFrom(key: string, msgId: string | null, opts?: { title?: string; model?: string; switchTo?: boolean }): string;
  threadRequestSend(targetKey: string, text: string): string;
  threadRequestReceive(key: string, reqId: string, responseText: string): void;
  spawnRelated(key: string, title?: string, intro?: string): string;
  redirectTurn(key: string, text: string): void;
  todoList(key: string): unknown;
  todoAdd(key: string, label: string): void;
  todoSetState(key: string, itemId: string, stt: string): void;
  subagentGroups(key: string): unknown[];
  subagentSpawn(key: string, agent: Record<string, unknown>): void;
  subagentSetStatus(key: string, name: string, status: string): void;
  goalPhases(key: string): unknown[] | null;
  goalPhaseIdx(key: string): number;
  goalAdvance(key: string): void;
  activityLive(key: string): unknown;
  activityAdvance(key: string, stage: Record<string, unknown>): void;
  activitySetStatus(key: string, status: string): void;
  diffGroups(key: string): unknown[];
  diffCreate(key: string, group: Record<string, unknown>): void;
  diffUpdate(key: string, groupId: string, path: string, added: number, removed: number): void;
  compactNow(key: string): void;
  crewSet(key: string, crew: unknown): void;
  crewOf(key: string): unknown;
  crossProjectWarn(key: string, targetProject: string, text?: string): string;
  spellAdd(word: string, dict?: "personal" | "project"): void;
  spellIgnoreDraft(key: string, word: string): void;
  spellSetDisabled(key: string, on: boolean): void;
  // v3 domains (final cumulative packet)
  bsdEffective(key?: string): { mode: BsdMode; scope: BsdScope; state: string; turnArmed: boolean };
  bsdSet(mode?: BsdMode, scope?: BsdScope): void;
  bsdEvalStart(key?: string): void;
  bsdResolve(state: string, adviceText?: string): void;
  bsdAdviceDismiss(key?: string): void;
  catalogAccount(accountId: string): { provider: string; account: { id: string; label: string; connection?: ConnectionKind } } | null;
  connectionKindOf(account: { label?: string; connection?: ConnectionKind } | null): ConnectionKind;
  effectiveAccount(key?: string): EffectiveAccount;
  setAccount(accountId: string | null, scope?: "session" | "thread"): void;
  connSetStatus(status: ConnStatus): void;
  connQueue(msgDraft: OutboxDraft): string;
  connReconnect(): void;
  connServerWork(goalKey?: string): void;
  connSnapshot(note?: string): void;
  notifyPush(n: NotificationSeed): string;
  notifyRead(id: string): void;
  notifyReadAll(): void;
  admissionOf(key?: string): unknown;
  admissionSet(key: string, admission: unknown): void;
  admissionRemove(key: string | null, idx: number): void;
  defaultAdmission(): unknown;
  operationalOf(key?: string): OperationalState;
  opsAddPort(key: string, portEntry: OperationalState["ports"][number]): void;
  portResolve(key: string, port: number, use?: number): void;
  opsAddWorktree(key: string, wt: OperationalState["worktrees"][number]): void;
  worktreeSetState(key: string, name: string, val: OperationalState["worktrees"][number]["state"]): void;
  opsAddSession(key: string, sess: OperationalState["sessions"][number]): void;
  attachResolve(attachmentId: string, route: string): void;
  attachConsentAlternate(attachmentId: string, target: string): void;
  attachStartJob(key: string, attachmentId: string, outputLabel?: string): void;
  artRetry(key: string, artId: string, winId?: string | null): void;
  contextSourceAdd(key: string, threadSource: string, msgId: string | null): void;
  approvalDetails(key: string, id: string): void;
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
