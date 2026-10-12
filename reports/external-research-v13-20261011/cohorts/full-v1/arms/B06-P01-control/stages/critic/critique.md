# Independent critic review — extension isolation for a diagram editor

## Scope and review method

I read the assigned brief, the complete investigator `discovery.md`, `draft.md`, and `source-map.json`, the released `revealed-plan.md`, and the carried `sources/index.md`. The released-plan metadata identifies this plan as a single-use reveal and records the discovery and plan hashes. I followed the carried index and independently opened the governing primary documentation, advisories, issue history, and pinned repository sources listed under C01–C17 in this stage's source map. The earlier S01–S20 identifiers retain their investigator meanings and are linked without rebinding.

This is a critique, not a repaired proposal. No extension was installed or executed, no implementation or security test was run, and no production audit was performed.

## Overall assessment

The draft is a strong and substantially faithful response to the released plan. It correctly separates worker liveness/crash containment from enforceable resource permissions; rejects file-path handoff as filesystem authority; limits network by default; protects built-in commands; defines a validate-preview-conflict-commit path; retains unresolved owner choices; and expands the proposed tests while labeling them as unrun. Its alternatives cover declarative transforms, in-process WASM, WASM in a worker, a restricted native worker, an unrestricted worker, and an iframe/message pattern. WIT and framed JSON/CBOR are both considered as exchange contracts.

The central security corrections are supported by the reviewed primary evidence. VS Code explicitly says its extension host has the editor's file, network, and process permissions (C06). Wasmtime describes imports as the core WebAssembly boundary and capability-based WASI filesystem access, while still leaving embedder choices (C09). The cited platform mechanisms have real configuration and compatibility conditions: Landlock recommends runtime ABI detection and retains authority associated with already opened descriptors (C12), while AppContainer grants resource access by policy and still permits some always-available resources (C13). Zed's archive advisory and tagged source illustrate why a WASM label alone does not secure host filesystem bridges or package extraction (C14–C16).

Two material gaps remain before the draft fully answers the brief: the user-facing interaction for permissions and failed operations is not specified concretely, and the proposed integration/validation work is not organized into phases with gates. These are omissions in the draft, not evidence that its core corrections are wrong.

## Findings requiring attention

### M1 — Material incomplete: permission and failure presentation

**Draft locators:** “Optional file”; “Network”; “Grants”; and “Responsiveness and resource limits.”  
**Brief evidence:** The brief requires explaining how users see permission requests and failed operations without needing to understand sandbox internals.

The draft specifies what the host should enforce and says to prompt again for additional capability, publisher-identity changes, or scope changes. It also says a failed worker should produce a “recoverable error” and leave the document untouched. It does not describe the user's visible permission flow or explain what the prompt communicates: which extension is asking, what diagram/file data it can read, why it needs it, whether access is one-request or persistent, and how the user can decline or later revoke it. The file picker is a useful boundary, but it does not explain the accompanying extension-specific consent.

Likewise, “recoverable error” is an implementation outcome rather than a user-facing explanation. The draft does not say how a user is told that a transformation timed out, crashed, was rejected, or conflicted, what the user can do next, or how the UI confirms that no changes were applied. The discovery document has a more useful list of understandable failure classes, but that detail did not carry into the proposal. The permission and failure presentation is a brief-level requirement; leaving it implicit is material.

### M2 — Material incomplete: no phased integration and validation plan

**Draft locators:** “Recommendation”; “Startup mode”; “Packages and updates”; “Validation record.”  
**Brief evidence:** The brief explicitly asks for a phased integration and validation plan.

The draft presents useful components and a substantial proposed test inventory, but it does not order them into phases or give phase-entry/exit conditions. “Start with” per-request workers and “prototype” alternatives are individual choices, not a complete rollout sequence. In particular, the draft does not distinguish a declarative-only baseline, a cross-platform boundary prototype, adversarial policy/transaction validation, and any later limited release, nor state what evidence must pass before moving between them. This leaves the requested integration plan and the relationship between proposed checks and release decisions incomplete. The draft should present a staged sequence and gates before it is treated as complete; this review does not supply that sequence.

## Brief coverage

| Brief obligation | Assessment |
|---|---|
| Keep the host responsive to loops, crashes, invalid output | Addressed with off-UI worker execution, time/resource/response caps, termination, and proposal discard. Numeric budgets remain prototype inputs, appropriately not asserted as results. |
| Component boundary and capability model | Addressed through immutable bounded snapshots, narrow imports/brokers, no live model references, and a clear statement that a manifest or process is not enforcement. |
| Active-diagram read scope and optional selected file | Addressed conservatively; selection versus whole diagram, whether file input ships, and bytes versus a one-file broker capability remain explicit owner choices. |
| Do not silently overwrite concurrent edits | Addressed with base revision, touched fields/objects, preconditions, conflict handling, whole-result validation, preview, and transactional application. The analogy to VS Code is properly limited: its API promises all-or-nothing for text-only edits, while resource edits have different failure behavior (C07); the draft does not claim that this guarantees a new diagram engine's semantics. |
| Explain permission requests and failed operations to users | **Material incomplete (M1).** Policy is detailed, but the user-visible prompt, decline/revoke path, failure wording, and next action are not. |
| Windows and Linux; languages undecided | Addressed as alternatives and conditions, not as demonstrated compatibility. AppContainer and Landlock are identified as candidates requiring platform-specific tests and fail-closed handling. |
| No blanket filesystem/network, no installer execution | Addressed. A selected path is rejected as authority; network is omitted from the v1 SDK recommendation; host-managed package processing replaces custom installers. |
| Preserve built-ins if loading fails | Addressed in the recommendation and plan disposition. |
| Compare execution/data-exchange choices with limits and burden | Substantially addressed: six execution patterns are compared, and WIT versus framed JSON/CBOR is discussed. The draft correctly says WIT defines a contract rather than runtime behavior. Some tradeoffs remain hypotheses for the proposed prototype, not established measurements. |
| Phased integration and validation | **Material incomplete (M2).** Proposed validation cases are extensive, but no ordered phases or pass gates are given. |
| Research-backed proposal; no install or production audit claim | Addressed and accurately bounded. The draft separates proposed validation from executed work. |

## Released-plan disposition review

| Released-plan clause | Review of draft disposition |
|---|---|
| Separate process and serialized selected-object snapshot/revision | Correctly keeps a worker for liveness and responsiveness while rejecting process separation as sufficient permission isolation. Selected-object scope is retained as a conservative default with the whole-diagram question open. |
| Return proposed patch; validate before preview | Correctly preserves proposal-only exchange and expands validation to schema, limits, IDs, references, values, preconditions, and operation permissions. Rejecting the complete proposal on any invalid operation is consistent with the brief. |
| Changed revision means retry or explicit review | Correctly refines this into conflict checks on touched state and preconditions, with recomputation or explicit review rather than silent commit. |
| Built-ins are independent of extension startup | Correctly accepted. |
| Manifest declares file/network; selected file path; network API omitted in v1 | Correctly distinguishes declarations from enforcement, rejects path-as-authority, retains optional user file input behind a broker, and recommends no network API in v1. |
| Process sufficiency assumption; OS restrictions unselected | Correctly rejected. This is the plan's most important correction. It is supported by the host-permission and OS/runtime evidence (C06, C09, C12–C13). |
| Per-extension remembered prompts; grant inheritance/file boundary unspecified | Correctly refines grants by identity/version/scope and makes added grants re-prompted; it leaves persistence/revocation of unchanged grants as an owner choice. The remaining gap is the visible prompt/revocation design in M1. |
| Timeout, response cap, terminate failed worker | Correctly accepted and broadened to memory, CPU/fuel, host calls, logs, input, and concurrency; the source caveat that limits must be checked against the pinned runtime is accurate (C10–C11). |
| Measure launch overhead and large selections; choose worker mode later | Correctly preserved as a measurement/engineering choice, not a claimed result. |
| Host unpacks known package; no custom installer | Correctly expanded to safe staging, archive defenses, atomic activation, and rollback. Zed's archive history is used as a bounded precedent, not a vendor audit (C14–C16). |
| Proposed tests; no install/isolation test executed | Correctly expanded and explicitly labeled proposed. No result is represented as executed. |
| Separate responsiveness from permissions and retain residual risks | Correctly accepted. The draft identifies runtime, host bridge, policy, update, and platform risks without claiming a production audit. |

No material wrong correction was found. In particular, the draft does not overstate VS Code's resource-edit behavior as universal atomicity, does not claim signatures or prompts are sandbox enforcement, and does not claim the cited Zed/Wasmtime examples certify this proposal. No unsupported factual claim consequential to the recommendation was identified in the portions directly checked. The identity and locator limitations in the inherited source map remain visible rather than silently upgraded: e.g., S05 records that its direct open timed out, and S18/S19 use release tags without claiming an independently retrieved full commit SHA.

## Open questions that are honestly unresolved external input

These are owner or product/environment decisions, not corrections a critic can make from the cited sources:

1. Does “active diagram” mean selection only or whole-diagram read, and what contextual fields may accompany selected objects?
2. Is a user-selected file required in v1; are bounded bytes adequate; what limits and retention behavior apply?
3. Is no-network v1 acceptable, and what later product need could justify brokered network access?
4. Which Windows and Linux versions/kernel capabilities must be supported, and is disabling procedural extensions when the required control is absent acceptable?
5. Must procedural extensions support native code, or can a WASM-only tier meet the product need?
6. How should unchanged grants persist across versions, and what identity changes require renewed trust?
7. What update confirmation, revocation, rollback, and retention behavior is expected?
8. What launch and large-selection latency is acceptable before considering persistent workers?

## Validation record

**Executed for this critic stage:** read the listed brief/package/reveal; navigated the carried index; directly opened and checked the primary sources indexed as C01–C16, with details and limitations recorded in this stage's source map. This was source review, not product validation.

**Not executed:** no extension install or execution, implementation, benchmark, sandbox/policy experiment, automated test, or production security audit. All draft validation scenarios remain proposals.