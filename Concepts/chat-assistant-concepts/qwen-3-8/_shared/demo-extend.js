window.PMChatDemoExtend = (() => {
  function apply(data) {
    const t03 = data.threads.find(t => t.id === "thread-03");
    if (t03) { const m = t03.messages.find(x => x.id === "t03-m0005"); if (m) m.collapsedByDefault = true; }
    const t01 = data.threads.find(t => t.id === "thread-01");
    if (t01) { const m = t01.messages.find(x => x.id === "t01-m0014"); if (m && m.runtime) m.runtime.totalElapsedSeconds = (m.runtime.workedSeconds || 94) + 31; }
    const t02 = data.threads.find(t => t.id === "thread-02");
    if (t02) { const m = t02.messages.find(x => x.id === "t02-m0003"); if (m && m.runtime) m.runtime.totalElapsedSeconds = (m.runtime.workedSeconds || 12) + 12; }
    const t13 = data.threads.find(t => t.id === "thread-13");
    if (t13 && !t13.messages.find(m => m.id === "t13-m0021")) {
      const last = t13.messages[t13.messages.length - 1];
      const sentAt = new Date(new Date(last.sentAt).getTime() + 60000).toISOString();
      const rich =
        "Here is the brief, formatted so it reads as a document.\n\n" +
        "### Acceptance\n\n" +
        "- Sustained conversation must stay readable at **520 px**.\n" +
        "- Long answers collapse to a bounded preview; search still reaches the *full text*, e.g. the `recipe_mapper.rs` rule.\n" +
        "- Goal, task, subagent and diff state stay visible without crowding the transcript.\n\n" +
        "A one-line summary of the measure cap:\n\n" +
        "```css\n.body { max-width: 72ch; }\n```\n\n" +
        "And the data flow the renderer relies on:\n\n" +
        "```mermaid\ngraph TD\n  A[Stored history] --> B[Search index]\n  B --> C[Exact jump]\n```\n\n" +
        "> The preview strip never carries raw markers, even when the body is rich.\n\n" +
        "A tiny nested plan:\n\n" +
        "- Ship the renderer\n" +
        "  - tables and quotes\n" +
        "  - nested lists\n" +
        "- Wire the [concept workspace](https://example.invalid/pm)\n\n" +
        "| surface | owner |\n| --- | --- |\n| transcript | thread kit |\n| chrome | window kit |\n";
      t13.messages.push({
        id: "t13-m0021", role: "assistant", body: rich, sentAt: sentAt,
        runtime: { provider: "Alibaba", model: "Qwen 3.8", persona: "Interface engineer", mode: "Agent", effort: "High", workedSeconds: 31, totalElapsedSeconds: 31, tokenCount: 1620, contextUsed: 21000, contextLimit: 128000, estimatedCost: 0.04 },
        eligibleForEdit: false, collapsedByDefault: false
      });
    }
    const t09 = data.threads.find(t => t.id === "thread-09");
    if (t09 && !t09.__humanized) {
      const openers = ["Quick one — ", "Following up — ", "On the archive — ", "One more — ", "Note — ", "Re this — ", "Checking — ", "Aside — ", "Heads up — ", "On review — ", "Small thing — ", "Worth confirming — "];
      t09.messages.forEach((m, i) => { m.body = openers[i % openers.length] + m.body; });
      t09.__humanized = true;
    }
    if (!data.threads.find(t => t.id === "thread-16")) data.threads.push(buildShowcase());
    if (!data.threads.find(t => t.id === "thread-17")) data.threads.push(buildRedesign());
    if (!data.threads.find(t => t.id === "thread-18")) data.threads.push(buildOfflineCatchup());
    seedPinHistory(data);
    if (!data.catalog) data.catalog = buildCatalog();
    enrichStates(data);
    return data;
  }

  function buildCatalog() {
    return [
      { id: "alibaba", provider: "Alibaba", accounts: [
          { id: "ali-work", label: "Workspace key" }, { id: "ali-pers", label: "Personal key" } ],
        models: [
          { name: "Qwen 3.8", accounts: ["ali-work", "ali-pers"], effort: ["Low", "Medium", "High", "Max"], fast: true, caps: { video: false, vision: true }, context: 128000 },
          { name: "Qwen 3.8 Mini", accounts: ["ali-work"], effort: ["Low", "Medium", "High"], fast: true, caps: { video: false, vision: false }, context: 64000 }
        ] },
      { id: "anthropic", provider: "Anthropic", accounts: [
          { id: "ant-pro", label: "Pro plan" }, { id: "ant-cli", label: "Claude CLI OAuth" } ],
        models: [
          { name: "Opus 5", accounts: ["ant-pro", "ant-cli"], effort: ["Low", "Medium", "High", "Max"], fast: false, caps: { video: false, vision: true }, context: 200000 },
          { name: "Opus 5 Fast", accounts: ["ant-pro"], effort: ["Medium", "High"], fast: true, caps: { video: false, vision: true }, context: 128000, disabledReason: null }
        ] },
      { id: "openai", provider: "OpenAI", setupState: "update-available", accounts: [ { id: "oa-team", label: "Team workspace" } ],
        models: [
          { name: "GPT-5.6 Pro", accounts: ["oa-team"], effort: ["Low", "Medium", "High", "Max"], fast: true, caps: { video: true, vision: true }, context: 192000 },
          { name: "GPT-5.6 Mini", accounts: ["oa-team"], effort: ["Low", "Medium"], fast: true, caps: { video: false, vision: true }, context: 96000, disabled: true, disabledReason: "Credential expired · re-sign in from Settings" }
        ] },
      { id: "moonshot", provider: "Moonshot", accounts: [ { id: "ms-dev", label: "Developer key" } ],
        models: [
          { name: "Kimi K3", accounts: ["ms-dev"], effort: ["Medium", "High"], fast: false, caps: { video: true, vision: true }, context: 128000 }
        ] },
      { id: "google", provider: "Google", setupState: "install-required", sub: "Official Google release artifact · install for this host", accounts: [ { id: "g-cloud", label: "Cloud key" } ],
        models: [
          { name: "Gemini 3 Pro", accounts: ["g-cloud"], effort: ["Low", "Medium", "High"], fast: true, caps: { video: true, vision: true }, context: 1000000, disabled: true, disabledReason: "Provider Setup Required — install from the official Google source." },
          { name: "Gemini 3 Flash", accounts: ["g-cloud"], effort: ["Low", "Medium"], fast: true, caps: { video: true, vision: true }, context: 500000, disabled: true, disabledReason: "Provider Setup Required — install from the official Google source." }
        ] }
    ];
  }

  function enrichStates(data) {
    const set = (id, patch) => { const t = data.threads.find(x => x.id === id); if (t) Object.assign(t, patch); };
    set("thread-09", { pinned: true });
    set("thread-15", { archived: true });
    set("thread-10", { threadState: "running" });
    set("thread-13", { threadState: "idle" });
    set("thread-05", { threadState: "running" });
  }

  /* Pinned-history fixture source for thread-17: the 18 manifest history_rows,
     appended after the existing threads so every window's pin column lists them.
     Stub rows are real threads (one message each) so search, switch and rename
     all work against them; nothing existing is dropped or renamed. */
  function seedPinHistory(data) {
    const rows = [
      "Settings redesign bakeoff", "Usage feature review", "Planning Wizard audit",
      "PRD Builder source intake", "Provider multi-account routing", "Claude CLI profile isolation",
      "Antigravity CLI headless update", "Free models catalog refresh", "Models.dev capability sync",
      "Context Lens motion study", "Compact Now and branching", "MCP July specification review",
      "Memory degradation audit", "Persona context-footprint audit", "Crew capacity planning",
      "Worktree collision recovery", "Slint 1.17.1 port notes", "Assistant Chat visual testing"
    ];
    rows.forEach((title, i) => {
      const id = "hist-17-" + String(i + 1).padStart(2, "0");
      if (data.threads.find(t => t.title === title || t.id === id)) return;
      const sentAt = new Date(new Date("2026-08-04T13:00:00Z").getTime() - i * 5400000).toISOString();
      data.threads.push({
        id: id, title: title, project: "Puppet Master", pinned: false, archived: false,
        threadState: "idle", updatedAt: sentAt, initialVisibleMessageCount: 1,
        scriptedReplyIds: [], scriptedReplyCursor: 0,
        messages: [
          { id: id + "-m0001", role: "assistant", body: "Summary of “" + title + "” — pinned-history row for the redesign showcase.", sentAt: sentAt, eligibleForEdit: false, collapsedByDefault: false }
        ],
        activeGoal: null, todo: null, subagentGroups: [], diffGroups: [], questionnaires: [], artifacts: [],
        browserSessions: [], draftState: null,
        tags: ["pin-history"]
      });
    });
  }

  const PROV = ["Alibaba", "Anthropic", "OpenAI", "Moonshot"];
  const MODEL = { Alibaba: "Qwen 3.8", Anthropic: "Opus 5", OpenAI: "GPT-5.6 Pro", Moonshot: "Kimi K3" };
  const PERS = { Alibaba: "Interface engineer", Anthropic: "Product designer", OpenAI: "Systems reviewer", Moonshot: "Research analyst" };

  function rt(i, worked) {
    const p = PROV[i % PROV.length];
    return {
      provider: p, model: MODEL[p], persona: PERS[p], mode: i % 5 === 0 ? "Plan" : "Agent", effort: i % 2 ? "High" : "Medium",
      workedSeconds: worked, totalElapsedSeconds: worked, tokenCount: 600 + i * 137,
      contextUsed: 9000 + i * 1450, contextLimit: 128000, estimatedCost: [0.01, 0.02, 0.03, 0.04][i % 4]
    };
  }

  function msg(i, role, body, extra) {
    const sentAt = new Date(new Date("2026-07-30T09:00:00Z").getTime() + i * 95000).toISOString();
    return Object.assign({
      id: "t16-m" + String(i + 1).padStart(4, "0"), role: role, body: body, sentAt: sentAt,
      runtime: rt(i, 8 + (i % 6) * 4), eligibleForEdit: false, collapsedByDefault: false
    }, extra || {});
  }

  function buildShowcase() {
    const longBody =
      "The real problem at narrow width is not that the messages are wide; it is that the eye has no anchor when a run " +
      "spills across many turns. Once you scroll past the third tool call you cannot tell whether the paragraph above you " +
      "is the answer or the preamble to the answer, and the metadata that would tell you (who, which model, how long) is " +
      "either always on (noise) or always hidden (you hunt for it on hover). Both extremes fail the same person: the one " +
      "who reads the conversation like a document rather than watching it stream. So the fix has to work for the reader who " +
      "arrives after the fact, not only the one who sat through it. Concretely that means a stable measure so lines do not " +
      "stretch into unreadable ribbons on a wide pane, a quiet but present sense of who is speaking, and a hover row that " +
      "carries the runtime without competing with the prose. It also means long answers collapse to a bounded preview with a " +
      "single obvious expand control, and that the full text is still the thing search and copy operate on, so nothing is " +
      "truly hidden from the person who wants it. There is a marker here for the search demo, amber waypoint seven, placed " +
      "deliberately deep in the collapsed region so we can prove the index reaches past the preview. If the collapse, the " +
      "search, and the hover metadata all agree on the same canonical text, the conversation stays honest at every width, and " +
      "the narrow case stops being a place where information goes to disappear.";
    const mdBody =
      "Three changes move the needle, roughly in order of cost.\n\n" +
      "- Cap the measure so wide panes stop producing unreadable ribbons.\n" +
      "- Keep the speaker legible without a permanent metadata strip.\n" +
      "- Make long answers collapse to a bounded preview with one expand control.\n\n" +
      "The cheapest win is the measure cap, about one line:\n\n" +
      "```css\n.pmq-body { max-width: 72ch; }\n```\n\n" +
      "Everything else is *composition*: where the runtime row sits, and how the collapse state is stored so a re-render does not lose it.";
    const messages = [
      msg(0, "user", "I keep losing the thread when a run goes long. Can we make the conversation itself easier to follow at narrow widths, without hiding the goal and subagent state?"),
      msg(1, "assistant", mdBody),
      msg(2, "user", "Yes, but keep the long messages readable too. Do not just truncate them and make me hunt for the rest."),
      msg(3, "assistant", longBody, { collapsedByDefault: true }),
      msg(4, "user", "Good. I dropped notes in `chat-redesign-notes.md` and the streaming side lives in `message_stream.rs`. Keep both in scope."),
      msg(5, "assistant", "Will do. I will treat those two as the source of truth and open the brief in an editor tab when I need the full document rather than pasting it into the chat."),
      msg(6, "user", "One more thing: when I am mid-run and I start typing, the send button must not secretly turn into a stop."),
      msg(7, "assistant", "Agreed, and that is the rule I will hold: empty composer while the agent works shows Stop; the moment you type it becomes Send, and pressing Send appends your message instead of cancelling the run. Stop stays a single control in the composer, never a per-message action."),
      msg(8, "user", "And make the default view an actual conversation, not a checklist of requirements."),
      msg(9, "assistant", "That is exactly this thread. Sustained back and forth, a real snippet, one long answer that collapses, and a search target hidden inside it so the narrow case can be checked honestly."),
      msg(10, "user", "How does search behave on the collapsed answer?"),
      msg(11, "assistant", "It searches the canonical full text, not the preview. So the hidden marker is findable, the result jumps you to the message and briefly highlights it, and the collapse state is left exactly as it was. The same holds for Context Lens shaping: human search sees the real history regardless of what the lens is doing to the view."),
      msg(12, "user", "And the genuinely long thread, the one with a hundred turns?"),
      msg(13, "assistant", "Only the newest window renders at first; older turns load as you scroll up, and the scroll anchor stays put so you do not get yanked. Concepts like dense rows and chapters exist precisely for that case, turning a hundred turns into something you can scan instead of something you endure."),
      msg(14, "user", "Ship it. Open the brief whenever you are ready.", { eligibleForEdit: true }),
      msg(15, "assistant", "On it. I will open the brief in an editor tab, keep the inline shortcut in the thread, and leave the goal and subagent surfaces where they are so nothing about the work hides behind the conversation.")
    ];
    return {
      id: "thread-16", title: "Chat redesign — live conversation", project: "Puppet Master", pinned: true,
      threadState: "idle", updatedAt: "2026-07-30T09:30:00Z", archived: false, initialVisibleMessageCount: 50,
      scriptedReplyIds: ["reply-04", "reply-05"], scriptedReplyCursor: 0, messages: messages,
      activeGoal: null, todo: null, subagentGroups: [], diffGroups: [], questionnaires: [], artifacts: [], browserSessions: [], draftState: null,
      tags: ["showcase", "sustained", "markdown", "long message", "search", "narrow width"]
    };
  }

  function r17(i, worked) {
    return {
      provider: "Alibaba", model: "Qwen 3.8", persona: "Interface engineer", mode: "Agent", effort: "High",
      workedSeconds: worked, totalElapsedSeconds: worked, tokenCount: 500 + i * 120,
      contextUsed: 12000 + i * 1600, contextLimit: 128000, estimatedCost: [0.02, 0.03, 0.04, 0.05][i % 4]
    };
  }

  function m17(i, role, body, extra) {
    const sentAt = new Date(new Date("2026-08-04T14:00:00Z").getTime() + i * 140000).toISOString();
    return Object.assign({
      id: "t17-m" + String(i + 1).padStart(4, "0"), role: role, body: body, sentAt: sentAt,
      runtime: r17(i, 6 + (i % 5) * 5), eligibleForEdit: role === "user", collapsedByDefault: false
    }, extra || {});
  }

  function buildRedesign() {
    const messages = [
      m17(0, "user", "Audit the provider settings and Assistant Chat controls, improve multi-account routing and access warnings, preserve Slint portability, test every theme, and produce an implementation handoff without editing PMConcept7."),
      m17(1, "assistant", "I will start with an audit of the current selector and access surfaces, then map requested versus effective routes per account. Before I change anything, three quick questions so the redesign targets the right ownership."),
      m17(2, "assistant", "Answers received — Settings owns policy, cache loss emphasizes Branch, and the concept must demonstrate diff, preview, test report and handoff states. I am folding those into the goal now."),
      m17(3, "user", "Start the goal. Keep me able to pause or replan it at any point, and do not let a model switch in the selector retarget a running goal."),
      m17(4, "assistant", "Goal started with six phases: Audit, Research, Prototype, Implement, Verify, Handoff. Its runtime settings are frozen at start; a selector change afterwards only affects future turns unless you explicitly update the goal, which replans at the next safe boundary."),
      m17(5, "assistant", "Eight tasks are on the board, from auditing the current picker to writing the implementation-impact handoff. I will mark them as I go; blocked items will say exactly why."),
      m17(6, "assistant", "Retrieved six related project threads and the provider routing notes from the Planning Wizard handoff. Provenance is in the Context Lens breakdown, not copied into this prompt."),
      m17(7, "assistant", "Exploring the current surfaces and comparing four external approval implementations before editing.", {
        activityGroup: {
          id: "t17-ag1", status: "complete", workedSeconds: 94, compactLabel: "13 tools used",
          stages: [
            { kind: "thought", label: "Thinking for 4s", durationSeconds: 4, summary: "The selector conflates provider, account and model; access profile is missing entirely. Rewrite as three axes." },
            { kind: "exploration", label: "Exploring 7 files", count: 7, durationSeconds: 18, items: ["app/settings/providerPage.tsx", "threads/provider-selector.js", "threads/access-controls.css", "Plans/assistant-chat-design.md", "Concepts/CONCEPT_RULES.md", "verification/interaction-probes.mjs", "shared/modelCatalog.ts"] },
            { kind: "fetch", label: "Compared 4 provider implementations", count: 4, durationSeconds: 26, summary: "Approval granularity differs; only one models requested-vs-effective route." },
            { kind: "browser", label: "Checked pinning at 4 widths", count: 4, durationSeconds: 22, summary: "Pinned compact engages below 820px; chat never drops under its floor." },
            { kind: "edit", label: "Made 1 create, 3 edits", added: 184, removed: 67, durationSeconds: 19, items: ["threads/provider-selector.js", "threads/access-controls.css", "verification/interaction-probes.mjs", "components/billing/PlanCard.tsx"] },
            { kind: "completion", label: "Passed interaction and reduced-motion checks", durationSeconds: 5, summary: "All targeted probes green on friendly, glass, retro, basic." }
          ]
        }
      }),
      m17(8, "assistant", "Collision: the visual-test server wants port 3000, but checkout redesign in another worktree already owns it. I will take 3001 and leave theirs running — the safe alternative is recorded in the warning card above."),
      m17(9, "user", "Spin up help for the research and the Slint review, but do not flood the run — capacity matters."),
      m17(10, "assistant", "Three specialists requested. Current usage is likely to finish two at a time, so PM will run two waves and reserve capacity for the final synthesis. The interface systems auditor finished on Fable; the provider adapter researcher is mid-run on Kimi K3; the Slint and test reviewer failed once on a sandbox timeout and is retrying on Qwen 3.8."),
      m17(11, "assistant", "The auditor's findings are in: provider and account must be separate choices, favorites first, and the effort submenu stays nested. The reviewer's first attempt died on a port bind; the retry uses the safe port."),
      m17(12, "assistant", "Diff updated as the edits landed — three files so far, with the PlanCard create counted separately in the activity index."),
      m17(13, "assistant", "Browser verification pass: pinned history, question flow, approvals and the left artifact workspace exercised at minimum, normal, wider and wide; reduced motion reaches every end state."),
      m17(14, "assistant", "Two decisions need you before I continue: the test-suite commands, and whether to switch this thread to Opus 5 for the final review pass."),
      m17(15, "assistant", "Four artifacts are ready to inspect in the left workspace: the change set, a rendered preview, the verification report and the handoff document."),
      m17(16, "user", "Open the change set on the left and keep this conversation visible while I read it."),
      m17(17, "assistant", "Done — the change set is open to the left of the chat; the transcript scroll and your draft are untouched. Switching between the four artifacts does not reopen the workspace."),
      m17(18, "assistant", "Final summary: provider selector rebuilt around provider, account and model as separate choices with favorites and recents; four access profiles separate from mode; cache and privacy warnings tiered with Branch offered; pinned history and artifact workspace share one governor. All targeted interaction probes passed. Worked for 1m 34s."),
      m17(19, "user", "One correction: the handoff must call out that Compact Now never rewrites the canonical transcript. Branch this thread and add that section there.", { eligibleForEdit: true })
    ];
    return {
      id: "thread-17", title: "Provider settings and Chat access redesign", project: "Puppet Master", pinned: true,
      threadState: "running", updatedAt: "2026-08-04T15:10:00Z", archived: false, initialVisibleMessageCount: 50,
      scriptedReplyIds: ["reply-04", "reply-05"], scriptedReplyCursor: 0, messages: messages,
      activeGoal: {
        id: "goal-17", title: "Redesign provider controls and Chat access flow",
        objective: "Multi-account routing, access warnings and pinned geometry without touching PMConcept7.",
        status: "running", workedSeconds: 94, totalElapsedSeconds: 128,
        canEdit: true, canPause: true, canResume: true, canStop: true, canClear: true, expanded: false,
        phases: ["Audit", "Research", "Prototype", "Implement", "Verify", "Handoff"],
        progress: { complete: 4, total: 8, subgoalsActive: 2 }
      },
      todo: {
        id: "todo-17",
        items: [
          { id: "t17-1", label: "Audit the current model and account picker", state: "complete" },
          { id: "t17-2", label: "Map requested and effective provider routes", state: "complete" },
          { id: "t17-3", label: "Design pinned-history geometry", state: "complete" },
          { id: "t17-4", label: "Implement the four access profiles", state: "running" },
          { id: "t17-5", label: "Add cache and attachment route warnings", state: "pending" },
          { id: "t17-6", label: "Add the left artifact workspace", state: "complete" },
          { id: "t17-7", label: "Run theme, width, keyboard, and reduced-motion tests", state: "blocked" },
          { id: "t17-8", label: "Write the implementation-impact handoff", state: "pending" }
        ]
      },
      subagentGroups: [
        { id: "sg-17", label: "Redesign specialists", state: "running", counts: null, agents: [
          { name: "Interface systems auditor", task: "Audit selector and access surfaces", currentActivity: "Findings delivered", status: "completed", route: "Qwen 3.8", workedSeconds: 41 },
          { name: "Provider adapter researcher", task: "Compare external approval models", currentActivity: "Reading adapter docs", status: "running", route: "Kimi K3", workedSeconds: 33 },
          { name: "Slint and test reviewer", task: "Portability and probe review", currentActivity: "Retrying after sandbox timeout", status: "retrying", route: "Qwen 3.8", workedSeconds: 0, failedAttempt: { reason: "sandbox timeout", at: "2026-08-04T14:47:00Z" } },
          { name: "Capacity verifier", task: "Verify wave reserves hold", currentActivity: "Blocked on port 3000", status: "blocked", route: "Qwen 3.8", workedSeconds: 12 },
          { name: "Handoff writer", task: "Draft impact handoff", currentActivity: "Stopped by user", status: "stopped", route: "Opus 5 Fast", workedSeconds: 8 }
        ] }
      ],
      diffGroups: [
        { id: "dg-17", label: "Assistant Chat change set", hiddenFileCount: 0, files: [
          { path: "threads/provider-selector.js", added: 92, removed: 18, status: "modified" },
          { path: "threads/access-controls.css", added: 61, removed: 39, status: "modified" },
          { path: "verification/interaction-probes.mjs", added: 31, removed: 10, status: "modified" }
        ] }
      ],
      questionnaires: [
        { id: "q17-redesign", status: "incomplete", createdAt: "2026-08-04T14:03:00Z", currentQuestionIndex: 0, questions: [
          { id: "q17-1", prompt: "Where should provider and account policy be managed?", kind: "single select", required: true, options: ["Settings owns policy; Chat chooses the current route", "Chat owns everything", "Split policy between both surfaces"] },
          { id: "q17-2", prompt: "When a model switch will lose provider cache, what should PM emphasize first?", kind: "single select", required: false, options: ["Continue here", "Branch with the new model", "Start a clean chat", "Ask every time"] },
          { id: "q17-3", prompt: "Which artifact states must the concept demonstrate?", kind: "multi select", required: true, options: ["Multi-file diff", "Rendered preview", "Test report", "Provider-flow document"] }
        ] }
      ],
      artifacts: [
        { id: "artifact-diff", title: "Assistant Chat change set", kind: "multi_file_diff", projectPath: "Tastebook · threads/", files: [
          { path: "threads/provider-selector.js", added: 92, removed: 18 },
          { path: "threads/access-controls.css", added: 61, removed: 39 },
          { path: "verification/interaction-probes.mjs", added: 31, removed: 10 }
        ] },
        { id: "artifact-preview", title: "Provider selector preview", kind: "visual_preview", projectPath: "Tastebook · previews/", caption: "Provider rail, account grouping and favorites at normal width." },
        { id: "artifact-test", title: "Interaction verification report", kind: "test_report", projectPath: "Tastebook · verification/" },
        { id: "artifact-handoff", title: "Implementation impact handoff", kind: "document", projectPath: "Tastebook · docs/" }
      ],
      browserSessions: [],
      draftState: { currentText: "", attachments: ["screen-capture.mp4"], revisionHistory: [] },
      seedAttachRoutes: { "screen-capture.mp4": { route: "unsupported", consented: false, reeval: false, lineage: "screen-capture.mp4", job: null } },
      operational: {
        ports: [ { port: 3000, owner: "checkout redesign in another worktree", threadKey: "thread-17", worktree: "checkout-redesign", suggestion: 3001, state: "conflict" } ],
        worktrees: [
          { name: "checkout-redesign", state: "waiting-writer", owner: "checkout redesign" },
          { name: "qwen-3-8-concepts", state: "isolated", owner: "this thread" }
        ],
        sessions: [
          { kind: "browser", label: "Browser Program capture · smoke pass", state: "running" },
          { kind: "debug", label: "Debug session · provider-selector.js", state: "attached" },
          { kind: "backup", label: "Backup · nightly snapshot", state: "complete" },
          { kind: "snapshot", label: "Snapshot · catch-up from Home Server", state: "pending" }
        ]
      },
      admission: {
        included: [
          { label: "Current objective", kind: "goal", size: "0.4k", provenance: "thread-17", removable: false },
          { label: "Recent messages", kind: "history", size: "18.2k", provenance: "thread-17", removable: false },
          { label: "Scoped project instructions", kind: "instructions", size: "2.1k", provenance: "Puppet Master", removable: false },
          { label: "Persona capsule", kind: "persona", size: "0.8k", provenance: "Interface engineer", removable: false },
          { label: "Selected tools", kind: "tools", size: "3.4k", provenance: "session", removable: false },
          { label: "Prior-thread excerpt · routing table", kind: "excerpt", size: "1.1k", provenance: "thread-04", removable: true },
          { label: "Prior-thread excerpt · pinned geometry", kind: "excerpt", size: "0.9k", provenance: "thread-11", removable: true },
          { label: "Attachment representation · screen-capture.mp4", kind: "attachment", size: "0.6k", provenance: "draft", removable: true }
        ],
        omitted: [
          { label: "Older messages", reason: "summary-represented" },
          { label: "17 unused tool schemas", reason: "not selected for this thread" },
          { label: "Unrelated logs", reason: "below relevance threshold" },
          { label: "Below-threshold memories", reason: "relevance below threshold" }
        ],
        cache: { state: "warm", note: "Provider cache warm; replay not required." },
        pressure: 0.42
      },
      bsdAdvice: { id: "bsd-adv-17", text: "Consider running the verification wave before the handoff draft — two roles in wave three depend on wave-two results.", at: "2026-08-04T14:52:00Z" },
      bsdEvents: [
        { mode: "auto", scope: "thread", result: "silent", at: "2026-08-04T14:31:00Z", note: "BSD Auto evaluated the turn and stayed silent." },
        { mode: "on", scope: "thread", result: "advice", at: "2026-08-04T14:52:00Z", note: "Manual On produced one suggestion, shown as an advice card." }
      ],
      seedApprovals: [
        { id: "ap-17-run", question: "Run 2 commands?", scope: "Workspace only · Needed to run the test suite", resolved: null,
          details: [ { k: "Commands", v: "node verification/run-matrix.mjs --suite=v2 · node verification/static-server.mjs --port 0" }, { k: "Files touched", v: "verification/results/run-*/" }, { k: "Network", v: "localhost only" }, { k: "Persistence", v: "none" } ],
          safer: "Run with --suite=v2 and SHOT=0 to skip screenshots" }
      ],
      seedWarnings: [
        { id: "wr-17-port", tier: "confirm", kind: "collision", resolved: null,
          text: "Port 3000 is owned by checkout redesign in another worktree.",
          detail: "Requested 3000 for the visual-test server. The safe alternative is 3001; taking it does not disturb the other worktree.",
          choices: ["Use 3001", "Cancel"] },
        { id: "wr-17-route", tier: "confirm", kind: "route", resolved: null,
          text: "Switching models replays this conversation without the current provider cache.",
          detail: "Requested route Anthropic / Opus 5 uses a separate paid connection. Provider cache and prompt pricing do not carry over; Usage records the replay separately.",
          pending: { provider: "Anthropic", model: "Opus 5" },
          choices: ["Continue here", "Switch here", "Branch with this model", "Start new chat", "Cancel"] },
        { id: "wr-17-cap", tier: "confirm", kind: "capacity", resolved: null,
          text: "Requested specialists: 6 · Recommended concurrent: 2 · 3 waves.",
          detail: "Reason: provider allowance and verification reserve. Required independent roles cannot be dropped. Forecast, not guarantee.",
          forecast: { requested: 6, recommended: 2, waves: 3, reason: "provider allowance and verification reserve" },
          choices: ["Start waves", "Cancel"] },
        { id: "wr-17-xproj", tier: "modal", kind: "cross-project", resolved: null,
          text: "This task will read Project A and modify Project B.",
          detail: "Cross-project work is off by default. Choose a scope: allow once, allow for this Goal, or review Settings. This choice never persists silently.",
          projectRead: "Project A", projectWrite: "Project B",
          choices: ["Cancel", "Allow once", "Allow for this Goal", "Open Settings"] },
        { id: "wr-17-attach", tier: "confirm", kind: "attachment", resolved: null,
          text: "This model cannot read video.",
          pendingAttach: "screen-capture.mp4",
          choices: ["Cancel", "Extract in PM", "Use Gemini"] }
      ],
      seedRequests: [
        { id: "tr-17-1", target: "thread-04", text: "Send the provider routing decisions table to this redesign thread.", status: "answered",
          response: "Routing table quoted in the child thread; requested-vs-effective columns confirmed per account.", at: "2026-08-04T14:40:00Z" }
      ],
      crew: {
        title: "Redesign crew", summary: "5 requested · 2 concurrent · 3 waves",
        members: [
          { role: "Interface systems auditor", route: "Qwen 3.8 · workspace key", state: "completed" },
          { role: "Provider adapter researcher", route: "Kimi K3 · developer key", state: "running" },
          { role: "Slint and test reviewer", route: "Qwen 3.8 · workspace key", state: "retrying" },
          { role: "Capacity verifier", route: "Qwen 3.8 · workspace key", state: "blocked" },
          { role: "Handoff writer", route: "Opus 5 Fast · Pro plan", state: "stopped" }
        ],
        note: "Crew is scoped to this thread; the parent synthesizes after wave three."
      },
      tags: ["showcase", "providers", "access", "goal", "subagents", "diff", "artifacts", "approvals", "warnings"]
    };
  }

  function r18(i, worked) {
    return {
      provider: "Alibaba", model: "Qwen 3.8", persona: "Interface engineer", mode: "Agent", effort: "Medium",
      workedSeconds: worked, totalElapsedSeconds: worked, tokenCount: 320 + i * 90,
      contextUsed: 6000 + i * 900, contextLimit: 128000, estimatedCost: [0.01, 0.02][i % 2]
    };
  }

  function m18(i, role, body, extra) {
    const sentAt = new Date(new Date("2026-08-06T08:30:00Z").getTime() + i * 150000).toISOString();
    return Object.assign({
      id: "t18-m" + String(i + 1).padStart(4, "0"), role: role, body: body, sentAt: sentAt,
      runtime: r18(i, 5 + (i % 4) * 4), eligibleForEdit: false, collapsedByDefault: false
    }, extra || {});
  }

  function buildOfflineCatchup() {
    const messages = [
      m18(0, "user", "Sync the usage ledger while I am on the train — the connection is flaky. Queue anything that cannot go through immediately."),
      m18(1, "assistant", "I will batch the ledger sync and queue each step with a durable client ID, so a reconnect replays every entry exactly once."),
      m18(2, "assistant", "Connection dropped. Two requests are now in the outbox; their IDs are the idempotency keys for the replay."),
      m18(3, "assistant", "Working from cache while offline: the ledger summary, last verified totals and the pending reconciliations are all readable locally.", {
        activityGroup: {
          id: "t18-ag1", status: "complete", workedSeconds: 41, compactLabel: "6 tools used",
          stages: [
            { kind: "read", label: "Read cached ledger", count: 2, durationSeconds: 9, summary: "Local snapshot is 3 hours old but complete." },
            { kind: "search", label: "Searched queued entries", count: 3, durationSeconds: 11, summary: "Two outbox entries pending replay." },
            { kind: "web", label: "Checked provider status page", count: 1, durationSeconds: 7, summary: "No incident reported; local link suspected." }
          ]
        }
      }),
      m18(4, "user", "Send the reconciliation note to the home server as soon as we are back online."),
      m18(5, "assistant", "Queued. The outbox now holds three entries in original order; each carries its queued-at timestamp and a stable ID."),
      m18(6, "assistant", "Reconnecting… replaying the outbox. Each entry is sent exactly once — already-replayed entries are skipped, never duplicated."),
      m18(7, "assistant", "Replay complete: three queued messages delivered in order, receipts matched by entry ID. The sync strip returned to Live."),
      m18(8, "user", "Did anything get sent twice during the flap?"),
      m18(9, "assistant", "No. The durable client IDs make every entry idempotent; the server acknowledges by ID, so a retry of the same entry is a no-op."),
      m18(10, "assistant", "Snapshot catch-up: the Home Server pushed one compressed summary of work that happened while we were offline — applied without rewriting any message."),
      m18(11, "user", "Good — keep the outbox visible until it drains, and label anything that replayed."),
      m18(12, "assistant", "Done. Replayed messages carry a receipt line; the title-bar strip shows Live with zero queued. The ledger is fully reconciled.")
    ];
    return {
      id: "thread-18", title: "Offline catch-up and reconnect", project: "Puppet Master", pinned: false,
      threadState: "waiting for reconnect", updatedAt: "2026-08-06T09:20:00Z", archived: false, initialVisibleMessageCount: 50,
      scriptedReplyIds: ["reply-04", "reply-05"], scriptedReplyCursor: 0, messages: messages,
      activeGoal: null, todo: null, subagentGroups: [], diffGroups: [], questionnaires: [], artifacts: [],
      browserSessions: [], draftState: null,
      seedWarnings: [
        { id: "wr-18-sync", tier: "confirm", kind: "collision", resolved: null,
          text: "Snapshot catch-up pending from Home Server.",
          detail: "One compressed summary will be applied on reconnect; it never rewrites canonical messages.",
          choices: ["Apply on reconnect", "Cancel"] }
      ],
      tags: ["offline", "outbox", "reconnect", "replay", "snapshot"]
    };
  }

  return { apply: apply };
})();
