# Discovery — plugin-workbench (S09), A-M09-A control/research

Brief-led investigation only. The case plan was NOT read before this file was
frozen (see plan-reveal.json after reveal). All findings below come from the
brief text plus independently chosen public primary sources listed in
source-map.json ([S01]–[S14]). No campaign, history, evaluator, or counterpart
material was read.

Workbench brief in one line: desktop app for librarians to import, clean and
compare small metadata collections; third-party transformation extensions must
be useful without unrestricted host access; reproducible preview, undo, offline
export, and future extension version upgrades are required.

## O1 — Useful unfamiliar tools, products, materially different approaches

### A. WebAssembly + WASI capability runtimes (Wasmtime) [S09, S11]

Wasmtime runs untrusted guest modules with WASI deny-by-default: no preopened
directories, no environment, no arguments, no sockets unless the host grants
them. Filesystem access is by explicit preopen mapping on the CLI
(`wasmtime --dir <host-path> <guest.wasm>` mounts only that subtree) and by
capability handles in the embed API. This is a materially different boundary
from path-prefix checks: a guest cannot name what it was never given, and
symlink/`..` escape out of a preopen is denied by the capability system
("The sandbox says no"). For a metadata workbench, the natural shape is: each
transformation extension ships as a WASM module/component exposing a pure
`transform(rows) -> rows` function, with zero preopens for pure transforms and
one scratch-dir preopen only for extensions that must spill to disk.

The `wasmtime::Config` surface (v51.0.0-dev docs) exposes the resource dials a
host needs for hostile-ish plugins: `consume_fuel` (deterministic instruction
budgets), `epoch_interruption` (wall-clock preemption of runaway guests),
`max_wasm_stack`, `memory_guard_size`, `memory_reservation(_for_growth)`,
plus GC-heap controls. Applicability: fuel/epoch directly bound "preview must
terminate"; reservation/guard-size bound memory blowup on large imports.

### B. Deno permission sandbox (deny-by-default flags) [S01]

Deno runs code with no filesystem, network, environment, or subprocess access
unless granted via `--allow-*` flags, most of them scopable to resources:
`--allow-net=example.com`, `--allow-read=./data`, `--allow-env=API_KEY`. Key
governing behaviors observed in the primary security doc:

- Refused operations throw a catchable `Deno.errors.NotCapable` error.
- `--deny-*` overrides `--allow-*` (`--allow-read --deny-read=/etc`).
- `-A/--allow-all` turns the sandbox off entirely (Node-equivalent access).
- `--allow-run` and `--allow-ffi` bypass the sandbox: a subprocess has its own
  OS privileges (`--allow-run=deno` can re-launch with `--allow-all`), and FFI
  machine code issues syscalls directly past the JS-layer enforcement.
- The initial static module graph (literal-specifier imports) loads without
  permission checks; only runtime behavior is gated. Dynamic `import(variable)`
  is checked against `--allow-read/--allow-import`.
- Code can inspect/request/revoke its own permissions (`Deno.permissions.*`).

For the workbench, Deno is the "JS extensions with a real boundary" option:
transforms run with no flags (pure compute over host-supplied row batches via
stdin/worker message), and only explicitly trusted extensions get scoped
`--allow-read/--allow-net`. The static-graph exemption is the sharp edge: an
extension's dependency closure loads freely, so supply-chain auditing still
matters even with tight runtime flags.

### C. V8 isolates for JS plugins (isolated-vm) [S03]

`isolated-vm` exposes V8's `Isolate` interface to Node: each plugin gets a
fresh JS environment with none of Node's capabilities. Governing numbers from
the main-branch README:

- `memoryLimit` in megabytes, default 128 MB, minimum 8 MB; documented as a
  guideline, not a hard cap ("a determined attacker could use 2–3x this limit
  before termination").
- `isolate.cpuTime` / `isolate.wallTime` in nanoseconds for budgeting.
- Compatibility is lockstep with Node majors (Node 22 → ivm 5.x/4.x, Node 24
  → 6.x/5.x, Node 26 → 7.x); odd Node versions unsupported; Node ≥ 20
  requires `--no-node-snapshot`.
- Project status is explicitly *maintenance mode*; the experimental rewrite
  branch is "certainly not ready for serious applications."

Applicability: correct granularity for per-extension CPU/memory budgets and
per-preview timeouts, with structured transfer (`ExternalCopy`) across the
boundary. The maintenance-mode status and Node-version lockstep are adoption
risks for a desktop app with a multi-year support horizon.

### D. Negative result: in-process JS sandboxes are not a boundary [S02, S10]

Node's own `vm` documentation states: "**The `node:vm` module is not a
security mechanism. Do not use it to run untrusted code.**" Context separation
(different global object) is not isolation. This rules out the cheapest
implementation (load extension JS into `vm.createContext` and call it) for any
extension the workbench does not fully trust. See O3 for the vm2 collapse
chain that proves the point with CVEs.

### E. OpenRefine: operation history as undo + reproducible recipe (closest analog) [S04, S12]

OpenRefine is the closest real product to the brief: a librarian-adjacent data
cleaning workbench (runs offline as a local server on 127.0.0.1:3333; "does
not require internet access to run its basic functions"). Its history design
answers the brief's reproducible-preview and undo requirements together:

- Every data-changing activity is tracked from project creation; history is
  saved with project data, survives quit/restart, and travels with exported
  project archives.
- The Undo/Redo tab lists ordered steps; step 0 (project creation) cannot be
  undone. Clicking an earlier step undoes in order (later steps grey out, still
  redo-able); performing a new operation while greyed-out steps exist erases
  them permanently. The tab shows position as `m/n` ("4/5").
- Reproducibility: Extract… encodes selected operations as JSON (3.6+ can
  download it directly, issue #4498); Apply pastes that JSON into another
  project to replay the recipe.
- Durability default: autosave every 5 minutes and on clean exit (Ctrl+C).

This is the pattern to copy: preview = dry-run of the operation log prefix;
undo = step pointer over an append-only operation log; reproducibility = the
log itself serialized as JSON. It also bounds extension power nicely:
extensions contribute *operations* (declarative, serializable, replayable),
not arbitrary host calls.

### F. VS Code extension host: version-compat model + trust declarations, but no sandbox [S05, S06]

Two mechanisms worth borrowing, one warning:

- `engines` in package.json is REQUIRED and cannot be `*` (e.g.
  `"engines": {"vscode": "^0.10.5"}` declares the minimum host version). This
  is the standard answer to "future extension version upgrades": the host
  refuses to activate extensions whose engine range it does not satisfy.
- Workspace Trust lets extensions declare `supportUntrustedWorkspaces`, and
  Restricted Mode disables extensions that have not opted in.
- Warning: extensions are NOT sandboxed — they run with full user privileges.
  Workspace Trust is a declaration + disable list, not a boundary; a 2026
  bypass report showed a crafted local VSIX claiming untrusted-workspace
  support could install without a meaningful warning. For the workbench, "VS
  Code-style extensions" must therefore be paired with a real runtime boundary
  (A/B/C), not copied as the whole story.

### G. Tauri capabilities/permissions: explicit per-command privileges for desktop webviews [S07]

Tauri v2 models desktop-app privilege as named permissions over commands
("Permissions are descriptions of explicit privileges of commands"), assembled
into capabilities per window/platform, plus command scopes, asset-protocol
scope, and CSP. The mental model transfers directly: the workbench host should
expose a small command surface (read cells, propose edit, request export) and
grant extensions named permissions per command, default-deny, rather than one
ambient "plugin API object" with everything attached. (Observed from the
permissions doc structure and identifier/config examples; deep command-scope
syntax was not pulled.)

### H. Zotero translators: a bibliographic import-plugin corpus model [S13]

Zotero's import/export path is a large community corpus of small translator
scripts (`detectWeb/doWeb/doImport/doExport/doSearch` entry points, shared
scraping helpers, Scaffold test harness). For a librarian workbench this is
the proven social shape for "small metadata collections": many tiny
single-format transforms, each independently testable, with import/export as
symmetric entry points. Zotero translators run inside the app's trust domain,
so the corpus *shape* is the takeaway, not its sandbox (there is none) —
pair with A/B/C.

### I. BagIt (RFC 8493): offline export with integrity, from the library world [S08]

BagIt is an IETF Informational RFC authored by California Digital Library,
Stanford Libraries, and Library of Congress staff — the brief's own
professional community. Required elements: `bagit.txt` declaration,
`data/` payload directory, `manifest-<algorithm>.txt` payload manifest
(checksum per file); optional: `tagmanifest-*.txt`, `bag-info.txt` metadata,
`fetch.txt` (references to remote files — deliberately excludable for an
offline export), other tag files. The RFC distinguishes *complete* (all
expected files present) from *valid* (complete + checksums verify). For the
brief's offline export: emit each export as a Bag with SHA-512 manifests plus
a `bag-info.txt` recording workbench version, extension IDs/versions, and the
operation-log hash — making exports self-verifying and reproducible without
network access.

## O2 — Consequential code/default/exception/applicability details

| # | Mechanism [source] | Default | Units / types / limits | Exception / failure behavior | Workbench applicability |
|---|---|---|---|---|---|
| 1 | WASI preopens [S09] | deny all (no dirs/env/args/sockets) | `--dir host[:guest]` mappings; unforgeable handles | capability denial ("sandbox says no"); symlink/`..` confined | pure transforms get zero preopens; spill dir only when declared |
| 2 | Wasmtime fuel/epoch [S11] | off unless configured | fuel units (per-operator cost), epoch ticks, bytes for memory settings | trap on fuel exhaustion / epoch deadline | preview timeouts that always terminate |
| 3 | Deno flags [S01] | no I/O at all | paths/hosts/env-names scoping; `--deny-*` wins over `--allow-*` | `NotCapable` thrown, catchable | per-extension least privilege; static-graph loads ungated (audit deps) |
| 4 | Deno bypass perms [S01] | denied | `--allow-run=<exe>`, `--allow-ffi` | subprocess/FFI escape the sandbox entirely | never grant to third-party transforms; gate behind explicit user consent + warning |
| 5 | Node vm [S02] | no boundary at all | contexts share process | n/a (not a boundary) | REJECT for untrusted extensions |
| 6 | isolated-vm [S03] | 128 MB, fresh globals | MB (min 8, ~2–3x soft); CPU/wall ns; Node-major lockstep | OOM-ish termination (soft), maintenance-mode risk | per-preview budgets; version pinning burden |
| 7 | OpenRefine history [S04] | autosave 5 min + clean exit | ordered steps, step 0 pinned; `m/n` position | new op erases greyed redo tail | copy: op-log + pointer + JSON recipe |
| 8 | VS Code engines [S05] | required, no `*` | semver range on host version | host refuses activation outside range | extension manifest declares min host; host declares max extension API |
| 9 | Tauri perms [S07] | default-deny, named grants | permission identifiers → command lists → capabilities | unlisted command denied | host command surface with named per-extension grants |
| 10 | BagIt export [S08] | checksums mandatory for validity | `manifest-<algo>.txt`, hex digests; complete ≠ valid | checksum mismatch = invalid bag | offline self-verifying export + provenance tags |

Cross-cutting default worth stating: every sound boundary found here is
deny-by-default (WASI, Deno, Tauri, BagIt-validity). The one famous
allow-by-default model (VS Code extensions, full user privileges) is exactly
the one with repeated trust-bypass reports. The workbench should treat
"extension works with zero grants" as the conformance baseline: a transform
that needs host access to do pure row math is over-privileged by construction.

## O3 — Issue / fix / regression / release chains

### Chain 1 (deep): vm2 — from standard sandbox to deprecated, unpatchable, and gone [S10, S02, S03]

- **Use:** vm2 was the de-facto npm library for running untrusted JS in Node
  (~1.2M weekly downloads cited in 2026 coverage).
- **Deprecation:** the package was deprecated around June 2023; maintainers and
  downstream auditors recommend removing it entirely and migrating to
  `isolated-vm` or locked-down workers, not merely upgrading.
- **Representative flaw → fix:** CVE-2026-22709 — `Promise.prototype.then/catch`
  callback sanitization bypass: `localPromise.prototype.then` callbacks were
  sanitized but `globalPromise.prototype.then` was not, and async-function
  returns are global Promises, permitting sandbox escape and host RCE. Fixed
  in 3.10.2.
- **Fix incompleteness pattern:** CVE-2026-92937 is documented as an incomplete
  fix for GHSA-m283-3h24-438v — the capability-bearing rejection rebuild ran
  only through the direct Promise-handler path, so call/apply indirection
  bypassed it. CVE-2026-92948 (NodeVM builtin allowlist bypass via `node:test`
  on Node ≥ 24, CVSS up to 9.9) and CVE-2026-92944/92956 (Node 26
  `Promise.prototype.finally`/V8-14.6 protector staleness) show the same
  treadmill: each V8/Node release re-opens the boundary because the sandbox is
  implemented as wrappers around mutable intrinsics rather than as true
  isolation.
- **End state:** at access time (2026-10-09T19:0xZ) both the original
  `github.com/patriksletmo/vm2` and the successor-path `github.com/vm2js/vm2`
  returned HTTP 404, and the npm registry page returned 403 to a plain fetch;
  downstream advisories (e.g. a Superset `npm audit` issue) now treat any
  remaining vm2 as "remove entirely." One downstream (flow-wiser) explicitly
  records vm2 3.11.5 as the FINAL release of a deprecated package whose escapes
  are "blocked by configuration, not by the library."
- **Workbench consequence:** never build the extension boundary on
  same-process JS wrapping. The two honest successors are V8 isolates [S03]
  (with the maintenance-mode caveat) or a WASM/WASI boundary [S09] (no shared
  intrinsics to wrap). Node's own doc [S02] agrees: `node:vm` is not a
  security mechanism.

### Chain 2 (supporting): VS Code Workspace Trust bypass via self-declared support [S06]

A 2026 report (Remedio) demonstrated a one-click attack where a crafted local
VSIX *declares* untrusted-workspace support, so the install path's single
trust check — which only fires when the manifest admits non-support — never
fires, and the extension executes with full user privileges. Lesson: trust
declarations made by the extension itself, enforced only by install-time
branching, are not a boundary. If the workbench adopts manifest-declared
capabilities, the host must enforce them at every call (Tauri-style [S07]),
not merely at install.

### Chain 3 (supporting): OpenRefine operation-history portability improvements [S12]

OpenRefine 3.6 made the JSON operation history directly downloadable (issue
#4498) instead of copy-paste-only, and raised the floor to Java 11. Lesson for
the workbench: treat the operation-log JSON as a versioned artifact from day
one (schema version field, host-min-version gate à la engines [S05]), because
"replay my recipe next year" is a compatibility promise, not just a file
format.

### Absent / inapplicable evidence

- No vm2-style escape chain was found against WASI capability isolation or
  Deno's permission enforcement in the sources consulted; absence here reflects
  the search scope, not a claim of invulnerability.
- No public issue/fix history exists for the workbench itself (it is
  greenfield); chains above are analogical, from the closest real mechanisms.
- Usage/billing telemetry for any source: unobserved (null) — all sources are
  public docs/RFCs/repos with no billing surface.

## Cross-cutting findings (for post-reveal comparison, not dispositions)

1. Deny-by-default everywhere is the only consistently surviving posture.
2. Pure transforms need no host authority at all; design the API so zero-grant
   operation is the norm and any grant is conspicuous.
3. Undo + reproducible preview are one mechanism (append-only operation log
   with pointer + JSON serialization), proven by OpenRefine.
4. Version upgrades need two independent gates: extension-manifest engine
   range (VS Code style) AND operation-log schema version (OpenRefine style).
5. Offline export should be self-verifying (BagIt) and record the exact
   extension set + operation hash that produced it.
6. Filesystem/network boundaries must be enforced at call time by the host
   (capabilities/preopens/flags), never by extension self-declaration.
7. Every JS-in-process shortcut (vm, vm2) has a documented collapse; budget
   for a real isolate/WASM boundary or restrict extensions to fully trusted
   authors only — a product decision, not a technical detail.

## Uncertainty going into plan comparison

- U1: Whether the intended host stack is Rust, Electron/Node, or Tauri changes
  which boundary (WASM vs Deno vs isolates) is cheapest — unknown pre-reveal.
- U2: Exact threat model for "unrestricted host access" (malicious vs buggy
  extensions?) — brief says "without gaining unrestricted host access," which
  admits both readings.
- U3: Scale of "small metadata collections" (hundreds vs hundred-thousands of
  rows) affects whether WASM-linear-memory or streaming batches are required.
- U4: Whether extensions may fetch controlled vocabularies over the network
  (reconciliation like OpenRefine) or must be fully offline.
- U5: isolated-vm maintenance mode vs WASM component-model churn: both
  successors carry evolution risk; no zero-risk option was found.

## Validations: executed vs proposed (O6, pre-reveal half)

Executed (read-only, no runtime available): fetched and quoted the primary
sources in source-map.json; recorded HTTP status codes including the vm2 404s
and npm 403; cross-checked deprecation claims across four independent
downstream reporters. No code was executed: no qualified sandbox exists in
this environment, so no witness runs were attempted and none are claimed.

Proposed (discriminating, for the build phase):

- V1 (boundary denial): run a transform that attempts `read(/etc/passwd)`,
  socket connect, and `..`-escape from its scratch dir; must fail closed with
  a catchable typed error under each boundary candidate. Discriminates
  capability vs prefix-check implementations.
- V2 (preview termination): extension with an infinite loop and one with
  exponential memory growth; host must preempt within the advertised budget
  (fuel/epoch/timeout) and report which budget fired. Discriminates soft
  (isolated-vm ~2–3x) vs hard (fuel) enforcement.
- V3 (recipe round-trip): extract operation JSON, re-import into a fresh
  collection, byte-compare resulting tables; then replay after an extension
  minor upgrade. Discriminates schema-version discipline.
- V4 (offline export verify): produce BagIt export with network disabled,
  independently re-verify manifests + provenance tags on a second machine.
  Discriminates genuine offline capability from "usually offline."
- V5 (upgrade refusal): install an extension declaring a newer engine range
  than the host; host must refuse activation with a naming error, not crash or
  half-load. Discriminates manifest enforcement at activation vs install only.
- V6 (supply-chain): publish a test extension whose dependency tries a
  runtime-gated call at import time vs at run time; confirm static-graph
  exemption behavior is understood and audited. Deno-specific.
