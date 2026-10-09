# ER11 A-M09-A treatment research — Discovery (S09 plugin-workbench, M09 v1)

Method: M09 v1 analogical-outline-interviews. One investigator context, same tools/time, no added
scouts. Brief-only investigation; plan not read (plan-root-only.md untouched at discovery time).
Case: S09 plugin-workbench — desktop workbench for librarians to import, clean and compare small
metadata collections; third-party transformation extensions useful without unrestricted host access;
reproducible preview, undo, offline export, future extension version upgrades.

Access window (UTC): 2026-10-09T19:08–19:24. Source IDs S01–S12 immutable; see source-map.json.
Bounded excerpts in sources/ with navigable sources/index.md. Usage/billing unobserved: null.

## 1. Two analogous real workflows / product feature taxonomies

### A1. OpenRefine — librarian/data-cleaning workbench (primary workflow analogue)

Retrieved taxonomy (from S01, S02, S09, S11):

- Run model: local web server on 127.0.0.1:3333 (default; flags -p/-i/-H), browser UI; no internet
  required for basic functions; multiple projects in tabs; autosave every 5 min by default
  (`refine.autosave`), also on clean exit; workspace dir configurable (-d / refine.data_dir);
  memory flags (-m/REFINE_MEMORY, min 256M default, example 1400M).
- Project model: import parsers (TSV/CSV/*SV, Excel, JSON, XML, MARC via extensions), persistent
  project store; history saved WITH project data and restored on restart and on archive re-import.
- History (Undo/Redo): every data-changing activity tracked from project creation; persisted;
  operations extractable as JSON recipe (Undo/Redo tab → Extract) and re-appliable to another
  project ("Export operations" / "Apply"); column-dependency validation added over time (3.10 line).
- Cleaning: facets/filters (list-facet limit default 2000, page sizes [5,10,25,50]), clustering
  (key-collision/Daitch-Mokotoff/nearest-neighbor-Levenshtein; choices limit default 5000),
  GREL/Python/Jython expressions, reconciliation (Wikidata/Wikibase), single-cell edit.
- Export: current-view-scoped for many formats (filters/facets applied) with dataset-vs-view choice;
  CSV/TSV, HTML table, XLS/XLSX, ODS, Google Sheets upload (auth), custom tabular exporter
  (column reorder, per-column recon output: match name/id/cell value), SQL exporter, templating
  exporter (JSON default, recipes for other formats); project archive export (.tar.gz, full project
  + history, NO views/facets; recon info preserved but services must be re-added on import).
  Confidentiality rule: archive contains prior-step data — must NOT share when anonymizing.
- Extensions: server-side Java extensions run in-process under OpenRefine's JVM; extension's
  duplicate libraries lose to OpenRefine's versions (rdf-transform README note); extension points
  include importers/exporters, GREL functions, clustering distances/encoders (3.2+), recon services,
  Wikibase support. Consequence: NO sandbox boundary — a malicious/buggy extension has host
  process privileges. Cross-version migration cost is real: 3.2 Jackson-for-org.json swap forced
  most extensions to migrate (S11).
- Offline: core runs offline; Google Sheets/reconciliation/Wikidata paths need network+auth.

### A2. VS Code Extension Host + Marketplace — sandboxed third-party extensions (primary runtime analogue)

Retrieved taxonomy (from S03, S04, S05, S12):

- Packaging: extension = manifest (package.json) + code; unique id publisher.name; `main` (Node
  host) and/or `browser` (web host) entry; `engines.vscode` = minimum host version (caret
  forward-compatible); Activation Events (onCommand etc.; since 1.74 declared commands auto-activate),
  Contribution Points (static declares), VS Code API (runtime calls).
- Hosts: (a) desktop Node Extension Host — full user fs/network/process power, process wall is a
  STABILITY boundary, not a security sandbox; (b) web extension host — browser WebWorker sandbox,
  NO Node APIs/module loading, single-file bundle required, only require('vscode') shim,
  workspace access only via vscode.workspace.fs on virtual fs, web fetch only with CORS,
  no child processes/executables; desktop can also run the web runtime (portable-safe subset).
- Trust: Workspace Trust centralizes the "treat workspace content as code?" decision; manifest
  `capabilities.untrustedWorkspaces`: true (works in Restricted Mode) / false (disabled until
  trust; ALSO the default when undeclared) / 'limited' + description + restrictedConfigurations[]
  (workspace values for listed settings withheld until trust); runtime API workspace.isTrusted +
  onDidGrantWorkspaceTrust + context key isWorkspaceTrusted for when-clauses; debug/tasks blocked
  by core in Restricted Mode so those providers can often declare true.
- Distribution/lifecycle: Marketplace + Open VSX protocol; offline via .vsix (zip with
  extension.vsixmanifest + extension/ + package.json with engines match); `code
  --install-extension file.vsix` / "Install from VSIX…"; vsce package validates manifest and runs
  vscode:prepublish; updates carry version + engine-compat gate.
- Supply-chain (not sandbox): signing-at-install, malware scanning, verified publishers,
  blocklists, enterprise allow-lists — administrative controls around a trusted-host model.

## 2. Four inquiry lenses (derived from A1 × A2 + brief)

- L1 Original user obligations (brief-led): import/clean/compare small metadata collections;
  reproducible preview; undo; offline export; extension version upgrades; third-party transforms
  useful-but-bounded. (Required lens; owns O1–O6 mapping.)
- L2 Plugin runtime sandbox & capability boundaries: how far each analogue's boundary goes
  (none / declarative-trust / real sandbox), filesystem/network mediation, defaults and overrides.
- L3 Reproducibility / provenance / migration: operation history as replayable recipe, preview
  determinism, archive portability, extension/host version migration and breakage handling.
- L4 Distribution / lifecycle / failure handling: install/update/rollback offline, failure
  isolation, issue→fix→release evidence, degraded/offline behavior.

Lens derivation note: L1 comes from the brief alone. L2 comes from the A1-vs-A2 contrast (in-process
Java vs WebWorker sandbox vs Deno/Wasmtime deny-by-default — the gap the brief's "useful without
unrestricted host access" points at). L3 comes from A1's history/recipe/archive mechanics. L4 comes
from A2's packaging/trust/update mechanics plus A1's release history.

## 3. Grounded answer-conditioned follow-up inquiry per lens

Each chain shows Q1 → sourced A1 → Q2 conditioned on A1 → sourced A2 → Q3 conditioned on A2.
Irrelevant analogy categories explicitly rejected at the end of each lens.

### L1 — Original obligations

- L1-Q1: What does a librarian cleaning workbench actually persist so "undo" survives restart and
  sharing? L1-A1: OpenRefine persists operation history WITH project data; restart restores it;
  project archive (.tar.gz) carries full history but not views/facets; operations export as JSON
  recipe for re-application (S01 History section; S02 Export-a-project + Export-operations).
- L1-Q2 (uses A1: history-with-data + JSON recipe): if history is the durable artifact, what breaks
  recipe replay across datasets/versions — are operations validated before apply? L1-A2: yes, this
  became a correctness boundary: 3.10 line validates column dependencies before applying operations
  ("history: Validate column dependencies of operations before applying them", S09-search release
  note); older recipes can fail on renamed/missing columns — replay is NOT unconditional.
- L1-Q3 (uses A2: conditional replay): what export/preview semantics must the workbench promise so
  "reproducible preview" is checkable? L1-A3: OpenRefine distinguishes view-scoped vs dataset export
  (many exporters honor current facets/filters; some offer both), plus per-column recon output modes
  (match name vs id vs cell value) and a templating exporter with JSON default (S02). So a
  reproducible preview must name: input snapshot id + operation recipe hash + facet/filter state +
  exporter + per-column output mode. "Preview" without that tuple is not reproducible.
- L1 rejected analogy categories: OpenRefine's reconciliation/Wikidata/Wikibase network services,
  Google Sheets/Drive upload+OAuth, and multi-project tab UX are rejected as non-obligations for the
  offline-first small-collections brief (kept only as explicitly optional network capabilities).
  VS Code's language/debug/test/SCM contribution points are rejected except as packaging patterns.

### L2 — Sandbox & capability boundaries

- L2-Q1: Do either primary analogues actually sandbox third-party code? L2-A1: No (A1) / Only in the
  web runtime (A2). OpenRefine Java extensions run in-process with host privileges (S11). Desktop
  Node extensions have the user's fs/network; the host split is stability, not security (S04 vs S05
  contrast; secondary statement in search corroborated by web-extensions doc framing). The REAL
  sandbox in A2 is the web extension host: WebWorker, no Node APIs, single bundle, fs only via
  vscode.workspace.fs, fetch+CORS only, no subprocesses (S04).
- L2-Q2 (uses A1: only-web-runtime-sandbox): what does a deny-by-default runtime look like as an
  alternative for THIS brief's transforms — exact flags and scoping units? L2-A2: Deno: no fs/net/
  env/subprocess unless granted; --allow-read/--allow-write take PATH lists (comma-separated,
  directory = subtree), --allow-net takes host[:port] list, --allow-env takes var names;
  --deny-* overrides --allow-* (e.g. --allow-read --deny-read=/etc); bare --allow-net grants the
  whole category (over-broad); -A/--allow-all disables the sandbox entirely (Node-equivalent, use
  with caution); refused ops throw NotCapable (catchable); TTY prompts interactively unless
  --no-prompt/non-TTY; symlink reads check the LINK location (target-outside-readable) EXCEPT
  /proc|/dev|/sys need --allow-all, */environ needs --allow-env, and CREATING symlinks needs full
  (non-path-scoped) read+write (S06, S07). Wasmtime: no fs/net/env unless granted; fs via --dir /
  --mapdir preopens (options MUST precede the wasm file; anything after is guest argv); network only
  via explicit WASI socket/http grants; WASI imports auto-hooked, other imports fail instantiation
  (S08). Both are deny-by-default; both scope to explicit roots.
- L2-Q3 (uses A2: deny-by-default with explicit roots): what should the workbench's extension
  boundary be, given librarians and offline? L2-A3: neither "Node-equivalent trusted" (A2-desktop,
  S04) nor "JVM in-process" (A1, S11) satisfies "useful without unrestricted host access". The
  conditioned finding: transforms should run with NO host fs/net by default, receiving rows via
  stdin/argv/dataframe handle and returning rows, with optional declared capabilities
  (read-only input dir, named-host fetch, temp scratch) approved at install/update time — i.e. the
  Deno/Wasmtime shape (S06–S08), or equivalently A2's web-runtime shape (virtual fs + mediated API,
  S04). Workspace-Trust-style declarative gating (S03: true/false/limited + restrictedConfigurations)
  is a useful UX layer ON TOP but is not itself a sandbox and must not be presented as one.
- L2 rejected analogy categories: Deno KV/caches/localStorage disk-without-permission carve-outs,
  Deno FFI/subprocess, Wasmtime serve/HTTP-proxy experimental hosting, and VS Code remote/SSH
  extension-host placement are rejected as out of scope for local row-transform extensions (noted,
  not adopted).

### L3 — Reproducibility / provenance / migration

- L3-Q1: What makes an OpenRefine-style history replayable across machines? L3-A1: persisted
  operation list + project archive portability (.tar.gz with history; S02) + JSON recipe
  extract/apply (S02); autosave cadence (default 5 min, configurable; S01) bounds loss; BUT replay
  is conditional (column-dependency validation, L1-A2) and archives leak prior-step data (S02
  caution) — provenance and privacy are in tension.
- L3-Q2 (uses A1: recipe+archive with conditional replay): how do extension/host upgrades break
  replay, and what is the migration mechanism? L3-A2: two independent mechanisms observed. (i) A1:
  host library upgrades break extensions in-process — 3.2 org.json→Jackson forced most extensions
  to migrate (S11); A1 also pins extensions to host library versions at runtime (S11). (ii) A2:
  `engines.vscode` minimum-host gate + versioned API with proposed-API staging; old hosts refuse new
  extensions, and web/Desktop dual entry (main+browser) lets authors ship degraded-but-working web
  behavior (S04, S05). Neither is automatic migration: A1 needs extension rebuilds; A2 needs
  author-declared compat + host-side refusal.
- L3-Q3 (uses A2: no automatic migration): what migration contract should the workbench offer?
  L3-A3: conditioned finding — (a) pin every saved recipe/preview to extension id+version AND host
  API version (A2 engines-shape, S05); (b) refuse to silently replay across a major API bump —
  require explicit re-validate/re-run with diff preview (A1 validation-shape, L1-A2); (c) keep
  prior extension version runnable side-by-side until the user re-pins (rollback, L4); (d) treat
  archive privacy (S02 caution) as a first-class export gate: "share recipe only" vs "share archive
  with prior data" must be distinct actions with a warning.
- L3 rejected analogy categories: OpenRefine's autosave-interval tuning, JVM heap sizing, and
  Google-Drive archive upload are rejected as deployment detail, not provenance semantics; VS Code's
  proposed-API/insiders staging cadence is noted but rejected as too heavyweight for this scope
  (kept as optional capability).

### L4 — Distribution / lifecycle / failure handling

- L4-Q1: How do the analogues install/update extensions offline with compat gates? L4-A1: A2 ships
  offline .vsix (zip: vsixmanifest + extension/package.json with engines match) installable via UI
  or `code --install-extension` (S12, secondary — needs primary confirm); vsce package validates the
  manifest and runs vscode:prepublish (S12). A1 extensions install as server-side jars/dirs into the
  OpenRefine tree (S11) with NO compat gate observed beyond documentation — fragility (cf. L3-A2).
- L4-Q2 (uses A1: gated .vsix vs ungated jars): what failure evidence exists that an ungated/gated
  choice matters — concrete issue→fix→release? L4-A2: OpenRefine #5581: "Cluster and edit changes
  space character in values to nbsp" — clicking a hyperlinked cluster option rewrote plain spaces to
  U+00A0 nbsp in merged values (data corruption via UI path), reported with forum link + repro steps;
  maintainer (wetneb) self-identified the cause within a day (nbsp inserted in dialog rendering to
  disambiguate space-variants, but merge read values back from the DOM); fix PR #5584
  (commit 4d7571d "Do not insert non-breaking space in clustered values. Closes #5581"), closed
  2023-01-26, milestone 3.7; Chromium-only reproduction noted (Firefox handles nbsp differently)
  (S09). Second chain (release-note level): 3.10-beta1 history column-dependency validation (S09
  search). Both chains show UI-path data corruption and recipe-apply fragility as the failure modes
  this brief must regression-test.
- L4-Q3 (uses A2: UI-path corruption + recipe fragility): what lifecycle/failure rules follow?
  L4-A3: conditioned finding — (a) extension install/update is an explicit trust decision showing
  requested capabilities (L2-A3) + engines-compat result (S05) BEFORE activation; (b) updates never
  auto-rewrite saved recipes — old version stays runnable until re-pin (L3-A3); (c) every transform
  ships with a golden input→output pair run on install/upgrade/offline (discriminating validation);
  (d) UI display values and merge/commit values must come from the same model object, never
  re-read from rendered DOM (regression rule from #5581); (e) offline is the default test posture —
  network-dependent transforms must declare it and degrade to explicit error, not silent wrong data.
- L4 rejected analogy categories: Marketplace malware-scanning/publisher-verification/enterprise
  allow-lists (S03-context) are rejected as operational controls the small workbench cannot run
  itself (noted as "rely on OS/store signature IF distributed that way", not a designed subsystem);
  OpenRefine's multi-tab concurrency and reconciliation-service re-adding are rejected as
  non-obligations.

## 4. Obligation mapping (O1–O6, brief-led; plan comparison comes post-reveal in draft.md)

- O1 (unfamiliar tools/approaches beyond thin plan): Catmandu Fix language (S10) — declarative
  per-record transform scripts (`upcase(title); add_field(...)`), Importer→Fix→Exporter/Store
  streaming over MARC/MODS/JSON/CSV, created by/for librarians — a genuinely different approach
  from OpenRefine's GUI-history model: script-as-recipe instead of clicks-as-recipe. Deno
  permissions (S06/S07) and Wasmtime/WASI preopens (S08) as the sandbox shape neither analogue
  workbench provides. VS Code web-extension runtime (S04) as the proven "useful-but-bounded"
  packaging shape. MarcEdit noted but NOT claimed (not independently verified this run).
- O2 (consequential code/defaults/limits/applicability): defaults captured with units/types —
  autosave minutes (5), memory MB/M (256M min default), facet limit count (2000), page-size arrays,
  clustering choices (5000), recon timeouts (microseconds 180000), wikibase maxLag (seconds 5);
  Deno allow/deny scoping units (paths/hosts/vars; directory=subtree; comma lists); Wasmtime
  --dir/--mapdir preopens + arg-order rule; VS Code trust tri-state + restrictedConfigurations +
  isTrusted/onDidGrantWorkspaceTrust; web-runtime limits (single bundle, no Node globals, fs via
  API, CORS fetch, no subprocess). Applicability: Deno/Wasmtime apply to row-transform isolation;
  Workspace Trust applies to UX gating only, not isolation.
- O3 (issue/fix/regression/release chain): primary chain #5581→#5584→3.7 milestone with commit
  4d7571d, Chromium-only note, and UI-readback root cause (S09). Supporting: 3.2 Jackson migration
  breakage (S11), 3.10 column-dependency validation (release note). Absent/inapplicable honestly
  noted: no VS Code CVE/bypass chain independently verified this run; S12 offline-VSIX mechanics
  are secondary-snippet level and need primary confirmation (proposed validation).
- O4 (per-P comparison): deferred to draft.md after reveal; discovery frozen before reveal per gate.
- O5 (retain alternatives/conditions/disagreement/uncertainty): alternatives retained — (i) trusted
  in-process extensions (A1-shape, simplest, violates brief sandbox clause); (ii) declarative-trust
  gating only (A2-desktop-shape, violates sandbox clause alone); (iii) deny-by-default capability
  sandbox (recommended; Deno/Wasmtime/web-runtime shape); (iv) script-recipe (Catmandu Fix) vs
  GUI-history-recipe (OpenRefine) vs hybrid. Disagreement noted: brief wants BOTH offline-first AND
  future upgrades — upgrade checks need network; resolution is versioned offline bundles + explicit
  online check, never silent auto-update. Uncertainty: exact host language/runtime for the workbench
  (Tauri/Electron/native + which sandbox) is NOT decided by this research.
- O6 (validations; executed vs proposed): executed this run — doc/code-read checks only (fetch +
  excerpt; no runtime available; no witness sandbox used). Proposed discriminating validations are
  specified in §6 and will be split executed-vs-proposed again in draft.md.

## 5. Criticism and revision (ordinary full criticism applied)

- C1 "Workspace Trust = sandbox" — REJECTED on revision. Initial attraction (declarative, cheap)
  fails L2-A1: trust gates activation, it does not bound a running extension's fs/net. Kept only
  as UX layer over a real sandbox.
- C2 "Operation history alone = reproducibility" — REVISED. History needs the full tuple (snapshot
  + recipe hash + facet/filter + exporter + column modes) plus version pins (L1-A3, L3-A3);
  otherwise replay is ambiguous and archives leak (S02 caution).
- C3 "Offline means no versions" — REVISED. Offline-first still needs versioned bundles,
  engines-gates, and golden pairs runnable offline; the network is needed only for fetching new
  bundles, as an explicit user action (L4-A3).
- C4 "One recipe format fits all" — HELD AS OPEN. Catmandu Fix scripts and OpenRefine JSON recipes
  are materially different (hand-authorable+diffable vs GUI-derived); the workbench should support
  a canonical JSON recipe with a human-readable projection, but the exact grammar is a user decision
  (carried to draft).
- C5 "Secondary snippets suffice for VSIX" — FLAGGED. S12 is weaker evidence; draft must either
  confirm against primary packaging docs/source or mark the offline-bundle format as provisional.

## 6. Proposed discriminating validations (none executed as runtime; no runtime available)

- V1 Sandbox escape attempt: transform tries to read /etc/hosts (or %SYSTEM%/drivers/etc/hosts),
  open a socket, and write outside scratch — must fail with capability error (Deno NotCapable-shape
  / WASI deny), while the same transform on granted paths succeeds. Discriminates real sandbox (L2)
  from trust-gating theatre (C1).
- V2 Recipe replay determinism: fixed input snapshot + recipe hash + facet/filter + exporter +
  column modes ⇒ byte-identical preview across two runs and after restart; mutated facet state MUST
  change the preview visibly. Discriminates tuple-pinned preview (L1-A3) from history-only claims.
- V3 Version-bump refusal: recipe pinned to ext v1 replays; after ext v2 install, replay without
  re-pin is refused or diff-previewed, never silently rewritten (L3-A3). Discriminates pinned
  migration from silent upgrade.
- V4 Golden-pair gate: each transform's golden input→output runs on install/upgrade and offline;
  failure blocks activation with the diff shown (L4-A3). Discriminates tested lifecycle from
  install-and-hope (A1-shape).
- V5 UI-readback regression (from #5581): cluster/merge option containing spaces, nbsp, and
  lookalike unicode merges WITHOUT altering unselected characters; committed value equals model
  value, not DOM text. Discriminates model-commit from render-readback.
- V6 Offline export parity: all offline-capable exports byte-identical with network on vs
  network-off (cable pulled / DNS blocked); network-needing transforms error explicitly (L4-A3e).
- V7 Archive privacy gate: "recipe-only share" contains no row data; "archive share" warns it
  contains prior-step data (S02 caution) and requires confirm. Discriminates privacy-aware export
  from naive dump.

## 7. Discovery freeze statement

This file plus source-map.json constitute the pre-reveal discovery. Next step per assignment: run
the reveal gate (reveal-plan.py) to freeze this discovery and reveal the exact own-case plan, then
read revealed-plan.md and produce draft.md with exact per-P disposition. This file will NOT be
rewritten after reveal.
