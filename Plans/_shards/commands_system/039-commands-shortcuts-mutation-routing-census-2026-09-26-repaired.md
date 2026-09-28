# Shard 039: Commands & Shortcuts Mutation-Routing Census — 2026-09-26 (repaired)

Source: `Plans/Commands_System.md`

Source lines: L6370-L6791

Source SHA256: `77462728111ffd030850ed210f27021477eb348397be1a0c880b33563f117bb5`

---

## Commands & Shortcuts Mutation-Routing Census — 2026-09-26 (repaired)

This addendum is the Commands owner lane for finding G4 of
`reports/concept-packet-integration-20260926/settings.md`
("Commands & Shortcuts typed mutation routing incomplete"): a per-control action-routing census
over §6.1 (scope, create, edit, delete, save validation), §6.2 (dry-run preview), and §1
(invocation surfaces), bound to the exact controls of the selected Settings manager
(`Concepts/pm7-tools/settings_refresh/managers/24-commands.js`, selected
`Concepts/TestOpus5.5PmConcept.html` `commands-shortcuts` behavior). Selected manager behavior
leads: every selected mutating control routes to a typed action below, every selected
presentation control is classified view-only, and no selected control closes through an
unadmitted placeholder. It mints no `cmd.*` UICommand, registers no EventRecord family, admits
no storage family, and proves no native runtime or readiness fact. Machine companions are
`Plans/commands_shortcuts_contracts.schema.json` and
`Plans/commands_shortcuts_contract_fixtures.json`; prose below is authoritative and the companions
must match it exactly.

The first 2026-09-26 five-action draft (`commands.save_new`, `commands.save_override`,
`commands.save_existing`, `commands.delete`, `commands.preview` with `New Command`,
`Save as project override`, `Save globally`, `Delete`, `Preview` labels) is superseded by this
census and MUST NOT be reused: its save labels do not exist in the selected manager (creation
commits with `Create command`; edits apply immediately per field), its preview executed shell and
read files, and its project file identity collided across projects. Those five spellings are
retired owner-local history, not aliases for the actions below.

### Census scope, file-backed identity, and the two scope systems

A User Command is a file-backed preset (§1.1, CS-010/CS-012), not a UICommand (§1.2, CS-011).
File mutations in this census are therefore typed owner file actions in the Commands-owned local
namespace `commands.*`, never a per-preset or per-binding `cmd.*` alias. The following are
explicitly NOT admitted and must fail closed wherever they appear as a route target: per-name
`cmd.user_command.*` aliases, per-binding `cmd.keybinding.*` aliases, any per-command-name or
per-shortcut command ID minted from preset or binding identity, and the eight already-rejected
packet tokens `cmd.commands.custom.create`, `cmd.commands.custom.update`, `cmd.commands.custom.delete`,
`cmd.commands.custom.dry_run`, `cmd.shortcuts.bind`, `cmd.shortcuts.import`, `cmd.shortcuts.export`,
and `cmd.shortcuts.reset` (SSYS-023 `rejected_with_reason`). Reuse of a rejected token spelling
for a new route is resurrection and is forbidden; no route label may be a `cmd.*` token spelling
(schema-enforced).

Two scope systems coexist and MUST NOT be confused:

- Command-file roots (§2) keep both scopes: `global` is exactly
  `~/.config/puppet-master/commands/` (the single authorized global root) and `project` is
  exactly `<active project root>/.puppet-master/commands/`, bound to the active `project_id`
  plus the storage-owner `root_generation` and `logical_root_fingerprint` (§0.2). Project
  file identity is `(project_id, root generation/fingerprint, scope, name)`; a bare
  `(scope, name)` pair never identifies a project file.
- Settings values are Project-only per SSYS-002, which supersedes the legacy `global` scope
  vocabulary still printed on `extensions.commands.*` inventory rows. Every
  settings-transaction binding in this census addresses a Project-scoped value and requires an
  active project, including shortcut bindings, the hints toggle, and reset/backup rows.

### Owned local file actions and their exact selected controls

Manager route for every row: `route:settings/commands-shortcuts`. Control labels are the exact
selected-manager strings. There are eight Commands-owned local file actions; the local namespace
is exactly this closed set and only this document may extend it.

| # | Exact selected control | Typed owner action | Effect |
|---|---|---|---|
| F1 | `Create command` (New-command dialog commit; scope `project` or `global` from the dialog) | `commands.create` | Creates one command file; asserts the target is absent. |
| F2 | Hero-sheet immediate fields: `Text`, `Arguments hint`, `One line`, `Scope`, `Persona`, `Mode`, `Model`, `Permissions profile`, `Enabled` | `commands.update` | Mutates one field of one command file; asserts exact current content. `Scope` moves the file across roots (target absent + source verified, atomic with rollback). |
| F3 | `Delete command` (hero sheet; danger confirmation modal naming the target) | `commands.delete` | Unlinks one command file; carries modal proof naming the target; resolution reveal follows §2.3. |
| F4 | `Preview (dry run)` (hero-sheet primary) | `commands.preview` | No mutation. Sample-argument substitution only with inert file/shell placeholders (§6.2/CS-035). |
| F5 | `Import commands` (file choice) | `commands.import_preview` | No mutation. Parses the picked file and binds a create/update/skip plan. |
| F6 | `Import` (import-dialog commit after reviewing the plan) | `commands.import_commit` | Applies one bound plan; shares the file-mutation contract per entry. |
| F7 | `Export commands` | `commands.export` | No command-state mutation. Collects a bounded nonsecret manifest of command files. |
| F8 | `Reset commands and shortcuts` (quiet row; confirmation modal with counts) | `commands.reset_all` | Removes user command files and restores shortcut/pref defaults; composite file + settings route with rollback. |

Autosave is the selected interaction model and this census keeps it: hero-sheet fields commit on
edit (no explicit save control exists, and no fictional `Save`/`Save globally` label is routed);
the New-command dialog commits once with `Create command`; shortcut dialogs commit with
`Use these keys` / `Add shortcut` / `Import`. Draft state is the live GUI field content; there is
no separate draft object to save or discard, and closing a sheet or dialog without committing
changes nothing.

### Settings-transaction bindings (actual Settings-owned values only)

These selected controls mutate Project-scoped Settings values, so they reuse the Settings-owned
`cmd.settings.transaction.preview` → `cmd.settings.transaction.apply` route (SSYS-009) instead of
minting `commands.*` actions. The census binds control to exact setting ID; the transaction
envelope, restore point, and result stay Settings-owned.

| # | Exact selected control | Setting ID | Operation |
|---|---|---|---|
| S1 | `Add shortcut`, `Change shortcut`, `Use these keys` (shortcut dialogs, incl. clearing keys to remove a command binding) | `extensions.commands.keyboard-shortcuts` | Preview + apply the bindings-delta write. |
| S2 | `Remove shortcut` (per-row trash; immediate) | `extensions.commands.keyboard-shortcuts` | Preview + apply the binding removal. |
| S3 | `Reset all shortcuts` (confirmation modal) | `extensions.commands.keyboard-shortcuts` | Preview + apply restoring defaults (`extensions.commands.reset-shortcuts` is the reset row). |
| S4 | `Import` / `Export` for shortcuts | `extensions.commands.keyboard-shortcuts` | Import parses a picked backup, shows the merge/replace plan, then preview + apply; export collects the nonsecret delta + defaults (`extensions.commands.backup-shortcuts` is the backup row). No typed paths: the file comes from the OS picker as an opaque handle. |
| S5 | `Show shortcut hints` | `extensions.commands.shortcut-hints` | Preview + apply the toggle. |
| S6 | `Keyboard layout` | `extensions.commands.keyboard-layout` | Preview + apply the Project-scoped layout select; `Auto-detect` is a stored choice whose effective layout follows the system. The browser fixture applies it locally. |
| S7 | `Show your commands in the command palette` | `extensions.commands.command-palette-visibility` | Preview + apply the Project-scoped toggle (`true` ↔ `on`, `false` ↔ `off`); it scopes user commands in the palette only, not UICommand registration or execution permission. |
| S8 | `When two actions share keys` (Warn me / Keep the older one / The newer one wins; added 2026-09-27) | `extensions.commands.conflict-handling` | Preview + apply the Project-scoped choice; `warn` is the default. |

Per-binding-ID semantics stay with each action's owner: this census routes the manager control,
not the bound actions. Command bindings (`cmd:<command-id>`) are Commands-owned; every other
binding ID is owned by its action's owner. The resolved-list projection drops bindings whose
command is absent, so a deleted command's binding dangles harmlessly until the manager clears
its delta key (the selected delete interaction issues `commands.delete` first, then clears the
`cmd:<id>` delta key through S1/S2; file unlink never waits on the settings commit).
Conflict display (`Conflicts with …` pills, the shortcuts attention note, clash toasts) is a
projection of the delta under `extensions.commands.conflict-handling`, `warn` by default: both
bindings persist and the clash is surfaced, never silently resolved. From 2026-09-27 (user decision)
the manager exposes the policy as `When two actions share keys` (S8): `hide` (Keep the older one)
leaves the older binding active and flags the newer one, `override` (The newer one wins) does the
reverse; neither deletes a binding, and the clash stays listed until it is resolved.

### View-only selected controls (no dispatch)

These stay presentation-only in the CS-079 `LOCAL_PRESENTATION` sense: `New command` (opens the
four-step New command helper, Start, Write, How it runs and Try it, decided 2026-09-27; only its
finishing `Create command` dispatches; `Add shortcut` likewise opens a short helper that picks the
action, then captures the keys), command-row opens, the `Scope selector`
display, the resolved command list, built-in command rows, `Where command files live`,
`Reserved shortcuts`, `Open cheat sheet` and the cheat sheet itself, `How commands work`,
`Search shortcuts` (run-scoped, `extensions.commands.search-shortcuts`), dry-run `Sample input`,
the resolved prompt, `How it will run`, `Back to command`, and every confirmation modal itself
(acceptance is evidence carried by the committing action, not a dispatch). The browser concept
applies fixture state through `saveState()` for all of the above; fixture mutation proves
nothing about native action availability, which is projected only by `ActionAvailability`
records.

### Request envelope, actor, currentness, and replay (F1–F3, F6, F8)

Every mutating file request carries `action_id`, `request_id`, `actor_ref` (non-secret actor
identity), `permission_snapshot_id` (the Permissions-owned snapshot the handler revalidates;
stale snapshots fail with `permission_snapshot_stale`), `idempotency_key`, `project_id`
(nullable; required exactly when a project-scope file is addressed), `target` (`scope`, `name`),
`expected_list_generation` (the resolved-list generation the user acted on), and, for
project-scope targets, `expected_root_generation` plus `expected_root_fingerprint` binding the
exact project root. Action-specific assertions: F1 asserts target absence; F2 carries
`expected_file_sha256` (and asserts destination absence for `Scope` moves). A Scope move additionally carries `destination_target` with the same name and requested destination scope, `expected_destination_root_generation`, and `expected_destination_root_fingerprint`; `expected_root_generation`/`expected_root_fingerprint` always bind its source independently, even for a global source. `project_id` is nonnull whenever either endpoint is Project-scoped. A successful move result identifies the destination root and file, with `moved_from` identifying the source; F3 carries
`expected_file_sha256` plus `confirmation: {modal_accepted: true, confirmed_name}` where
`confirmed_name` is the name the danger modal displayed (the selected modal names the target
but requires no typing); F6 binds `plan_id` + `plan_hash` from its F5 plan plus per-entry
assertions; F8 carries `confirmation: {modal_accepted: true, confirmed_command_count,
confirmed_shortcut_count}` matching the current counts.

Currentness fails closed with no write and no automatic retry. A list-generation mismatch
returns `stale_projection`; a root-generation/fingerprint mismatch returns `stale_project_root`;
content-assertion mismatches return `target_changed`, `target_exists`, or `source_changed`; a
modal subject or count that does not match returns `confirmation_mismatch`; a plan hash that
does not match returns `plan_mismatch`. Replay is keyed by `idempotency_key`: the same key with
the same effective payload returns the recorded result and recorded file identity without a
second write; the same key with a different effective payload returns `idempotency_conflict`
with no write. Unknown, missing, or malformed currentness state blocks the mutation rather than
substituting a cached projection, a visible enabled control, or a label.

### FileSafe mutation contract (F1–F3, F6, F8)

Every file mutation consumes the actor/permission identity above plus FileSafe write-scope
enforcement (FileSafe consumed, not re-owned):

- Authorized roots: `global` resolves only under `~/.config/puppet-master/commands/`;
  `project` resolves only under `<active project root>/.puppet-master/commands/` for the
  request's bound `project_id` at the bound root generation/fingerprint. No other root is
  writable from this census, and raw filesystem paths are never authority: callers address
  `(scope, name)` and the handler resolves.
- Target containment with symlink guard: canonicalize the authorized existing root and parent
  directory, verify containment, and resolve existing path components without following an
  untrusted symlink. For an existing source or replacement leaf, verify that exact leaf too;
  for creation, import creation, or a Scope-move destination, require an absent leaf using
  no-follow checks under the verified parent. The intentionally absent new leaf is not passed
  to a must-exist canonicalization call. Recheck parent/root identity, containment and leaf
  absence or asserted content after temp creation and immediately before rename/promote or
  unlink. Any escape, changed identity, symlink substitution or unresolved existing component
  denies with `filesafe_denied`; no `canonicalize` fallback is permitted. Name patterns match §2.5 exactly (`^[a-z][a-z0-9_-]{0,48}[a-z0-9]$`); anything else
  is `invalid_name_format` before any filesystem touch.
- Expected content: the handler serializes the exact expected file bytes from the validated
  draft through the §3.2 GUI↔file mapping (no silent normalization beyond the mapping),
  compares the pre-write bytes against `expected_file_sha256` (or asserts absence), and only
  then writes.
- Atomic write with durable readback: replacement writes use same-directory temp files,
  `temp → fsync → rename`, then re-read the bytes and compare hashes; mismatch fails the
  action. Delete performs a single verified unlink. The resolved-list generation advances only
  after the durable write plus re-list. Pre-write bytes are retained (bounded by the bulk caps
  below) so a post-write failure rolls back to the asserted prior state and the error still
  attests `wrote: false`; only a failed rollback returns `recovery_required` (the sole error
  that may attest `wrote: true`, naming the fenced state).
- Scope moves (F2 `Scope`) are one idempotent action: verify source bytes, assert destination
  absence, write + read back the destination, unlink the source, re-list. Any failure rolls
  back the destination write and re-verifies the source.
- Bulk caps: F6/F7/F8 address at most 200 files and 2 MiB total; single templates are bounded
  at 65536 bytes, `argumentsHint` at 200 chars, shortcut key strings at 120 chars. Over-cap
  requests fail with `collection_too_large` before any write.

All file mutations require `storage_access_mode = writer` evaluated before any other check; in
`viewer` mode each returns `storage_read_only`, and an unknown or missing access result blocks
with no write (CS-054 consumed). There is no approval ask-flow for file save/delete: unwritable
targets fail as typed `permission_denied` (OS-level), `filesafe_denied`, or storage I/O errors,
never as prompts. Deleting a project shadow reveals the global version and deleting an
unshadowed global removes the name entirely (§6.1.5/CS-032); deleting a global file while a
project shadow exists removes only the global file and the name keeps resolving to the shadow
per §2.3, reported via `resolution_after`. Only the addressed file is ever touched, so removing
a global catalog-installed file can never silently delete a shadowing user-authored project
override (CS-026 consumed). A delete whose target is referenced by an open edit session is
refused with `target_in_use` (CS-026 consumed). Results identify files by non-secret root-bound
refs — `command_file:global:<name>` or `command_file:project:<project_id>:<name>` — plus
`file_sha256`, `root_generation`, and `root_fingerprint`; raw filesystem paths stay
display/local-handoff data and never appear in results, receipts, or exports.

### Validation (F1–F2, F6 entries)

Every create, update, and import-commit entry validates exactly the CS-033 set before any write:
`reserved name collision` (§2.4 incl. `override_builtin` limits), `invalid name format` (§2.5),
`missing description` (required, max 200 chars), `invalid mode value`, `invalid model format`,
and `override_builtin` misuse (`override_builtin: true` against a reserved Assistant Chat slash
command). F2 validates the single edited field plus the resulting whole file. Inline errors name
the failing check; the commit stays blocked until all resolve. Validation failure writes nothing
and consumes no idempotency.

### Preview containment (F4)

`commands.preview` substitutes caller-supplied sample arguments into the unsaved draft and
returns the rendered prompt with highlighted substitutions plus inert file/shell placeholders.
It performs no file write, no Settings write, no permission evaluation, no file read, no
execution, no agent submission, and no run launch (`persisted: false`, `submitted: false`,
`executed: false`; output is local-only and never persisted or exported). There is no
`bash`/`read` ask-flow in preview by construction (§6.2/CS-035 carry the same rule), so viewer
and writer modes render identically: no degradation branch exists because there is nothing to
degrade. Preview carries `actor_ref` for audit but no `permission_snapshot_id` (no permission
is evaluated), no idempotency key, and no list generation; it is re-runnable and idempotent.

### Import preview/commit (F5–F6) and export collection (F7)

F5 parses the picked file and binds an immutable plan (`plan_id`, `plan_hash`, list generation,
per-entry scope/name/intent with create-absence or update-expected-sha assertions, skip reasons
for unchanged/invalid entries). It writes nothing. F6 applies exactly one bound plan: plan-hash
and generation mismatches fail with `plan_mismatch`/`plan_stale` before any write, then every
entry executes under the same FileSafe mutation contract as F1/F2 (same gates, same atomicity,
same rollback), and the generation advances once after all entries plus re-list. The picked file
arrives as an opaque OS-picker handle with byte size and hash — never a typed path — and plans
are bounded by the bulk caps above. The F5 result carries `reviewed_plan`: actor, Project,
pre-dispatch list generation, picked-file SHA-256, and the full ordered entries (including template,
frontmatter, target scope/name, intent and every expected-file/absence assertion). `plan_hash` is
SHA-256 of RFC 8785 canonical JSON of that exact object. F6 must match the full witness and its
actor/Project/generation, not just the display summary or a client-repeated hash. The native owner
resolves the immutable plan independently before writing. Static stale-generation cases designate a
same-request, same-Project `GenerationWitness` observed `before_dispatch`; it is test evidence only,
never client authorization. A changed expectation rejects mutation regardless of the result generation.

F7 collects a bounded manifest of `{ref, sha256, byte_size}` entries (project entries require
project context) with a nonsecret attestation: entries carry refs and hashes only, never raw
paths or secret material, and collection truncates with `collection_too_large` rather than
silently dropping files. Export writes nothing to command state; delivery goes through the OS
save picker. F7 needs no idempotency key; it is a read.

### Reset composite (F8)

`commands.reset_all` restores factory state: it removes user command files (global always;
project only with an active project) and restores shortcut/pref defaults through the S1–S7
settings route. It requires project context (settings values are Project-bound), carries the
count confirmation above, and pre-reads all doomed file bytes within the bulk caps; any failure
rolls back file removals from those bytes and rolls back the settings half through the
transaction rollback token, so the error still attests `wrote: false` unless rollback itself
fails (`recovery_required`).

### Resurrection guard and the retired draft

The eight SSYS-023-rejected packet tokens, per-name `cmd.user_command.*` aliases, per-binding
`cmd.keybinding.*` aliases, and any ID minted from preset or binding identity remain forbidden
as route targets; so are the five retired first-draft spellings (`commands.save_new`,
`commands.save_override`, `commands.save_existing`, the draft `commands.delete` shape, and the
draft `commands.preview` shape). `commands.delete` and `commands.preview` are re-admitted here
only with their repaired selected-control semantics (F3/F4); the draft shapes are history, not
aliases. Catalog lifecycle (§6.6 install/update/uninstall) is consumed only as the F3
`target_in_use`/no-silent-override boundary; lifecycle mutations are not Settings-manager
controls and gain no routes. Shortcut behavior below is owned by this census from the selected
controls — it is not inferred from heading-only §6.3 (CS-036 still holds for that span).

### Results, availability, errors, and the sole native owner handler

Save results return `mutated` with the root-bound file ref, `file_sha256`, `root_generation`,
`root_fingerprint`, new `list_generation`, `project_shadows_global`, `updated_field` (F2),
`moved_from` (F2 scope moves, else null), and `replayed`. Delete results return `mutated` with
`resolution_after.visible_scope ∈ {project, global, none}` and `replayed`. Import-preview
results bind the immutable plan; import-commit results list per-entry refs, shas, and the new
generation; export results carry the bounded manifest plus the nonsecret attestation; reset
results list removed refs, restored defaults, and both generation and settings-revision
evidence. Preview results carry `preview_only` with `persisted: false`, `submitted: false`,
`executed: false`, highlighted argument substitutions, and inert file/shell placeholders only.
Every error record carries `outcome: rejected`, a closed `error_id`, and `wrote: false` —
except `recovery_required`, the sole post-rollback-failure error, which attests `wrote: true`
and names the fenced state. Nothing auto-retries, ever.

Availability is projected per action + target from the gates above; the closed disabled-reason
set is `stale_projection`, `stale_project_root`, `target_changed`, `target_exists`,
`target_missing`, `source_changed`, `no_project_context`, `storage_read_only`,
`storage_unavailable`, `target_in_use`, `confirmation_missing`, `confirmation_mismatch`,
`validation_failed`, `idempotency_conflict`, `permission_denied`, `permission_snapshot_stale`,
`filesafe_denied`, `invalid_args`, `owner_unavailable`, `plan_stale`, `plan_mismatch`, and
`collection_too_large`. `available: true` carries zero reasons; `available: false` carries at
least one.

The local actions above are NOT UICommand catalog entries and never gain catalog rows or
production wiring rows. Their sole native owner handler is
`handlers::commands::apply_local_action`: the only native handler authorized to execute
`commands.*` file actions, and the exact `handler_owner` every filesystem-touching row in this
census names. Settings-transaction bindings (S1–S7) execute only through the Settings-owned
`handlers::settings::transaction_preview` / `handlers::settings::transaction_apply` /
`handlers::settings::transaction_rollback` handlers. Naming the handler specifies dispatch
custody; it proves no implementation, runtime, or readiness fact.

### Fixture boundary and semantic checks

Fixtures prove contract shape, payload/result exactness, gate coverage, and cross-record
counterexamples only. They prove no native handler, dispatcher, filesystem,
permission-enforcement, storage, provider, GUI, or readiness fact; native availability remains
projected, never claimed. Schema-invalid records test shape rejection; cross-record semantics
(confirmation binding, staleness, replay, permission/FileSafe denial, preview inertness,
collision warn, reset counts, plan binding, hint round-trip, project-identity binding, alias
absence) are tested only by the named semantic checks over schema-valid records — never by
redundant schema assertions. The check names and case IDs live in the fixtures'
`semantic_cases` array and the owner report hands them to root verbatim.

ContractRef: ContractName:Plans/Commands_System.md#GUI-COMMANDS, ContractName:Plans/Commands_System.md#DRY-RUN, ContractName:Plans/Commands_System.md#DEF-USER-COMMAND, ContractName:Plans/Commands_System.md#DEF-UICOMMAND-DISTINCTION, ContractName:Plans/Settings_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

### CS-081 - Commands Shortcuts Mutation-Routing Census

```yaml
plan_unit_id: CS-081
unit_type: integration_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Settings Commands & Shortcuts manager routes eight Commands-owned typed local owner
  actions over route:settings/commands-shortcuts: commands.create (Create command asserting
  target absence), commands.update (immediate hero-sheet field mutation asserting exact current
  content, with atomic cross-root Scope moves), commands.delete (Delete command with danger-modal
  proof naming the target and §2.3 reveal), commands.preview (side-effect-free dry-run render:
  sample-argument substitution only, inert file/shell placeholders, no bash/read ask-flow, no
  read, no execution, no submit, identical in viewer and writer modes),
  commands.import_preview/commands.import_commit (bound-plan import sharing the file-mutation
  contract), commands.export (bounded nonsecret manifest collection), and commands.reset_all
  (count-confirmed file + settings composite reset with rollback). Shortcut add/change/remove/
  reset, shortcuts backup, the hints toggle, the clash-handling choice
  (extensions.commands.conflict-handling), the keyboard layout select
  (extensions.commands.keyboard-layout), and the palette toggle
  (extensions.commands.command-palette-visibility) reuse the Settings-owned settings.transaction
  route against registered Project-scoped inventory rows; remaining
  selected controls are view-only. Every file mutation consumes actor plus permission snapshot,
  binds project roots by id, generation, and fingerprint, resolves targets under FileSafe
  containment with symlink guard, asserts expected content and list generation, fails closed on
  stale or mismatched state with no automatic retry, replays only on idempotency-key plus
  identical payload, validates the exact CS-033 set before any write, requires storage writer
  mode, writes atomically with durable readback, and identifies files by root-bound non-secret
  refs. The sole native owner handler is handlers::commands::apply_local_action; local actions
  are not UICommand catalog entries.
gui_related: true
gui_classification_reason: The census routes every selected mutating control of the Commands & Shortcuts Settings manager, binds Settings-valued controls to their transaction route, and classifies presentation controls as view-only.
depends_on: [CS-010, CS-011, CS-012, CS-013, CS-014, CS-026, CS-027, CS-028, CS-030, CS-031, CS-032, CS-033, CS-034, CS-035, CS-036, CS-041, CS-054, CS-079]
unblocks: []
acceptance_criteria:
  - The census admits exactly commands.create, commands.update, commands.delete, commands.preview, commands.import_preview, commands.import_commit, commands.export, and commands.reset_all; no ninth action and no cmd.* route.
  - Every F1-F3/F6/F8 request carries actor, permission snapshot, idempotency key, list generation, root binding for project scope, and its action-specific content assertion; stale_projection, stale_project_root, target_changed, target_exists, confirmation_mismatch, plan_mismatch, and idempotency_conflict fail closed with no write and no automatic retry.
  - Every create, update, and import entry validates reserved name collision, invalid name format, missing description, invalid mode value, invalid model format, and override_builtin misuse, blocks on any failure, and writes nothing.
  - Preview substitutes sample arguments only, renders @file and !shell as inert placeholders with no bash/read ask-flow, no file read, no execution, and no agent submission, and renders identically in viewer and writer modes.
  - Mutations require storage writer mode, resolve targets under FileSafe containment with symlink guard, write atomically with durable readback and rollback, advance generation only after durable write plus re-list, and identify files by root-bound non-secret refs without raw paths.
  - Shortcut, backup, hints, clash-handling, layout, and palette controls reuse the Settings-owned transaction route against Project-scoped values, with the layout select bound to extensions.commands.keyboard-layout and the palette toggle to extensions.commands.command-palette-visibility; per-binding-ID semantics stay with each action owner and conflicts pin the warn policy.
  - Per-name cmd.user_command.* and per-binding cmd.keybinding.* aliases, the eight rejected packet tokens, the five retired draft spellings, and catalog lifecycle gain no route.
  - The sole native owner handler for commands.* file actions is handlers::commands::apply_local_action; settings bindings execute only through the Settings-owned transaction handlers.
  - Machine companions Plans/commands_shortcuts_contracts.schema.json and Plans/commands_shortcuts_contract_fixtures.json match this prose exactly, including cross-record semantic cases.
  - No native runtime, EventRecord, storage-family, or readiness fact is claimed by this census or its fixtures.
validation_surfaces:
  - Plans/commands_shortcuts_contracts.schema.json
  - Plans/commands_shortcuts_contract_fixtures.json
risk_class: commands_shortcuts_routing_drift_or_alias_resurrection
reasoning_tier: high
context_scope: commands_shortcuts_mutation_routing
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_shortcuts_mutation_routing_contract_only
  create_worknodes: false
source_lineage:
  - Plans/Commands_System.md#GUI-COMMANDS
  - Plans/Commands_System.md#DRY-RUN
  - reports/concept-packet-integration-20260926/settings.md#G4
  - Concepts/pm7-tools/settings_refresh/managers/24-commands.js (selected controls lead)
  - Concepts/TestOpus5.5PmConcept.html (selected commands-shortcuts behavior leads)
preserved_exact_tokens:
  - "commands.create"
  - "commands.update"
  - "commands.delete"
  - "commands.preview"
  - "commands.import_preview"
  - "commands.import_commit"
  - "commands.export"
  - "commands.reset_all"
  - "handlers::commands::apply_local_action"
  - "route:settings/commands-shortcuts"
  - "Create command"
  - "Delete command"
  - "Preview (dry run)"
  - "Reset commands and shortcuts"
  - "Use these keys"
  - "stale_projection"
  - "stale_project_root"
  - "target_changed"
  - "target_exists"
  - "confirmation_mismatch"
  - "plan_mismatch"
  - "idempotency_conflict"
  - "storage_read_only"
  - "no_project_context"
  - "filesafe_denied"
  - "permission_snapshot_stale"
  - "recovery_required"
  - "command_file:project:"
  - "command_file:global:"
  - "permission_snapshot_id"
negative_constraints:
  - "Do not mint cmd.* routes for command-file mutations from this census."
  - "Do not admit per-name cmd.user_command.* or per-binding cmd.keybinding.* aliases."
  - "Do not resurrect rejected packet tokens cmd.commands.custom.* or cmd.shortcuts.*."
  - "Do not reuse the retired first-draft commands.save_* spellings."
  - "Do not infer shortcut behavior from heading-only §6.3; it is owned by this census from selected controls."
  - "Do not evaluate permissions, read files, or execute shell in preview."
  - "Do not claim a native runtime, EventRecord, storage family, or readiness fact."
owner_hints:
  - Plans/Commands_System.md
```
