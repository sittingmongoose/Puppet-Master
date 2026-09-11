# Jujutsu research decisions

These optional additions and implementation tradeoffs came from the research. Existing safety and ownership rules remain settled. No answer has been recorded.

## Read-only repositories

Should Puppet Master support browsing a repository whose native storage cannot be written?

Why it came up: Native browsing can try to update metadata even when the repository is mounted read-only.

What you get: Inspection inside locked agent sandboxes and archival mounts.

Costs: Separate compatibility tests and possibly disposable local indexing storage.

Options:
- Add a supported read-only browsing mode
- Keep such repositories visibly unsupported until later

Recommendation: Keep it optional until a safe read path is demonstrated.

Answer: ____________________

## Named history markers

Should users be able to label important points in operation history?

Why it came up: Users of other tools ask for recognizable stopping points before experimental history edits.

What you get: Recognizable places to return to during experimental history editing.

Costs: Name storage, retention and missing-target behavior.

Options:
- Add named markers on existing checkpoints
- Use ordinary checkpoint and operation history only

Recommendation: Add lightweight labels only if they reuse existing checkpoint ownership.

Answer: ____________________

## Grouped history actions

Should a multi-step history edit appear as one group with a clearly bounded group undo?

Why it came up: One intentional workflow can produce many native operations, and a failure can leave only part of the sequence applied.

What you get: Less noisy operation history and easier reversal of an intentional sequence.

Costs: Grouping metadata, partial-failure rules and recovery previews.

Options:
- Group display and provide verified group undo
- Group display only
- Keep each native operation separate

Recommendation: Start with grouped display; add group undo only with exact recoverability proof.

Answer: ____________________

## Recent actions and redo

Should the Operation Log include a recent-actions menu and redo navigation?

Why it came up: Other tools expose recent actions and redo, while redo can become unavailable after new work.

What you get: Faster movement through recent reversible work.

Costs: Redo invalidation and branching-history behavior must be clear.

Options:
- Add recent actions and supported redo
- Add a recent-actions menu only
- Keep the current operation list

Recommendation: Add recent navigation first and expose redo only where the native state permits it.

Answer: ____________________

## Filter operation history

Should users be able to filter operation history to find meaningful actions among automatic snapshots?

Why it came up: Frequent snapshots can bury meaningful actions in a long operation list.

What you get: Faster inspection of long-running repositories.

Costs: Filter semantics and visible disclosure of omitted history.

Options:
- Add simple action and time filters
- Add an advanced operation query language
- Keep the full list

Recommendation: Prefer simple filters with an obvious clear-filter action.

Answer: ____________________

## Readable operation descriptions

Should operation history show richer application action descriptions?

Why it came up: Native operation descriptions often describe commands rather than the user’s intent.

What you get: History users can understand without decoding command output.

Costs: Description storage and correlation across external operations.

Options:
- Add structured descriptions from existing receipts
- Keep native descriptions with technical details

Recommendation: Reuse existing receipts and never create no-op history solely to add text.

Answer: ____________________

## History storage maintenance

How should Puppet Master manage a repository whose operation history becomes large?

Why it came up: Frequent snapshots and long operation histories can consume storage and slow repository work.

What you get: Predictable disk use and clearer maintenance guidance.

Costs: Pruning reduces recovery history and requires coordination with backups.

Options:
- Diagnose growth and offer explicit maintenance
- Offer a configurable retention policy
- Leave maintenance to external tools

Recommendation: Start with diagnosis and explicit maintenance; do not prune automatically.

Answer: ____________________

## Adopt existing workspaces

Should Puppet Master adopt and repair existing workspaces created by other tools?

Why it came up: Existing workspaces can have paths and registrations that differ between tools.

What you get: Less manual setup when bringing an established repository into the workbench.

Costs: Version-specific mapping, path repair and migration conflict handling.

Options:
- Add an explicit adoption and repair flow
- Support existing workspaces through open only

Recommendation: Keep adoption explicit and defer automatic synchronization.

Answer: ____________________

## Hide inactive workspaces

Should users be able to hide inactive workspaces without deleting them?

Why it came up: Other clients distinguish hiding a workspace from deleting it.

What you get: A calmer workspace list while preserving work.

Costs: A separate archived state and clear restore-to-list behavior.

Options:
- Add hide and unhide
- Keep all discovered workspaces visible

Recommendation: Add only as a presentation state separate from removal.

Answer: ____________________

## Combine divergent versions

Should users get a guided action to combine divergent versions of the same change?

Why it came up: Concurrent rewrites can leave multiple versions of one change that need deliberate reconciliation.

What you get: A clearer recovery path after concurrent rewrites.

Costs: Heuristic choices, preview complexity and conflict handling.

Options:
- Add guided convergence when supported
- Offer exact version selection and existing rebase/abandon only

Recommendation: Keep it explicit and preview every selected version.

Answer: ____________________

## Duplicate a change

Should users be able to duplicate a change into a new independent change?

Why it came up: Other Jujutsu clients expose useful actions beyond the currently planned set.

What you get: Reuse an existing patch without sharing its identity.

Costs: New identity, destination and descendant behavior must be clear.

Options:
- Add a duplicate action
- Defer duplication

Recommendation: Defer until the core editing actions are proven.

Answer: ____________________

## Create a merge change

Should users be able to create a change with multiple selected parents?

Why it came up: Other Jujutsu clients expose useful actions beyond the currently planned set.

What you get: Join parallel lines of work explicitly.

Costs: Parent selection and resulting conflicts need a clear preview.

Options:
- Add a merge action
- Defer merge creation

Recommendation: Add after parent selection and conflict previews are reliable.

Answer: ____________________

## Absorb edits into earlier changes

Should users be able to distribute workspace edits automatically into the earlier changes they belong to?

Why it came up: Other Jujutsu clients expose useful actions beyond the currently planned set.

What you get: Reduce manual patch placement across a sequence of changes.

Costs: Automatic attribution can be ambiguous and requires a reviewable preview.

Options:
- Add absorption with preview
- Defer automatic absorption

Recommendation: Defer until each proposed placement can be reviewed.

Answer: ____________________

## Back out a change

Should users be able to create a new change that reverses a selected change?

Why it came up: Other Jujutsu clients expose useful actions beyond the currently planned set.

What you get: Reverse an earlier patch while retaining the intervening history.

Costs: Conflicts and scope must be distinguished from operation undo or restoring an old repository view.

Options:
- Add a back-out action
- Defer back-out

Recommendation: Add with exact selected change and a conflict preview.

Answer: ____________________

## Compare versions of a change

Should users be able to compare what changed between two versions of the same change?

Why it came up: Ordinary file comparisons do not directly show how one version of a change differs from another.

What you get: Easier review after rebases and amendments.

Costs: Precise parent normalization and selection rules.

Options:
- Add a version-to-version comparison
- Keep ordinary tree comparisons

Recommendation: Add when review workflows need it, with the compared versions clearly named.

Answer: ____________________

## Change evolution

Should users get a dedicated timeline of earlier versions of one change?

Why it came up: Other clients let users follow one change through its earlier versions.

What you get: A direct way to understand and inspect how a change evolved.

Costs: Historical visibility, predecessor loading and comparison semantics.

Options:
- Add a focused evolution view
- Keep rewrites visible in the main history graph

Recommendation: Add a bounded detail view if it reuses existing identities and routes.

Answer: ____________________

## Line attribution and file history

Should Source Control expose native line attribution and file history for Jujutsu?

Why it came up: Other clients provide line attribution and file history, with performance and rename limitations.

What you get: Users can trace where code came from without opening another tool.

Costs: Potentially expensive queries and rename-history limitations.

Options:
- Add bounded attribution and file history
- Keep ordinary change history only

Recommendation: Make it optional and expose unsupported rename cases honestly.

Answer: ____________________

## Review marks that survive edits

Should reviewed marks and notes follow a change through matching rewrites?

Why it came up: Other review tools preserve matching review state through edits, but the correspondence can be ambiguous.

What you get: Less repeated review after small edits and rebases.

Costs: Matching can be ambiguous, so stale and orphaned marks need visible handling.

Options:
- Add conservative matching with stale markers
- Keep review marks fixed to the exact reviewed version

Recommendation: Prefer exact-version marks until conservative matching is proven.

Answer: ____________________

## Scriptable partial changes

Should agents and scripts be able to request exact selected hunks through a structured interface?

Why it came up: Existing tools demonstrate structured hunk selection for agents, while content hashes alone do not bind a native revision.

What you get: More precise automated split and squash workflows.

Costs: Selection receipts, duplicate matching, truncation and stale-input checks.

Options:
- Add a structured hunk selection interface
- Keep partial selection in the GUI

Recommendation: Add only through the same command and revision checks as user actions.

Answer: ____________________

## New line endings in mixed-ending text

Which line ending should the editor use for newly inserted lines in a file that mixes line-ending styles?

Why it came up: Existing line endings are already preserved on Save; mixed-ending text still needs a convention for newly inserted lines.

What you get: Predictable newly inserted lines while existing line endings remain preserved.

Costs: A per-line convention and clear handling of pasted or replaced text.

Options:
- Use the nearest existing line ending for each new line
- Use the dominant line ending for new lines
- Ask the user to choose a convention for new lines

Recommendation: Use the nearest existing line ending; preserve existing endings on ordinary Save.

Answer: ____________________

## Use an external diff or merge editor

Should users be able to hand a comparison or conflict to an external editor?

Why it came up: External editors offer familiar workflows but have separate launch, save, exit and cleanup boundaries.

What you get: Access to familiar specialized editing tools, including selected remote setups.

Costs: Tool packaging, session authentication, temporary files, remote forwarding and cancellation.

Options:
- Support explicitly configured qualified tools
- Keep resolution inside Puppet Master

Recommendation: Keep in-app workflows primary; add qualified external tools only when needed.

Answer: ____________________

## How the adapter runs

Should the Jujutsu adapter drive the included command-line tool or embed native libraries?

Why it came up: Existing clients use different integration approaches, each with a different maintenance burden.

What you get: A clear balance between native behavior, responsiveness and maintenance.

Costs: Command-line execution needs lifecycle/parsing work; embedding needs version-coupled semantic parity; a private service adds protocol upkeep.

Options:
- Drive the included qualified tool
- Embed qualified native libraries
- Own a separate internal service

Recommendation: Start with the least complex qualified adapter; avoid a private fork unless a measured need justifies it.

Answer: ____________________

## Reuse a diff library

Should Puppet Master reuse an existing Rust diff library for its comparison engine?

Why it came up: An existing Rust library provides reusable comparison behavior independently of its application shell.

What you get: Potentially faster delivery of syntax, word and side-by-side diff behavior.

Costs: Dependency upkeep, license review and byte/type fidelity testing.

Options:
- Evaluate the reusable library behind an adapter
- Keep an independently owned diff implementation

Recommendation: Evaluate the library on exact file-type and performance fixtures before adopting it.

Answer: ____________________

## Connect external IDEs

Should external IDEs be able to use Puppet Master’s source-control adapter?

Why it came up: External IDE integrations demonstrate demand for the same history workflows outside a dedicated workbench.

What you get: Consistent history actions across the workbench and an existing editor.

Costs: Plugin maintenance, authenticated sessions and per-IDE behavior testing.

Options:
- Add selected external IDE clients
- Keep source-control interaction in Puppet Master

Recommendation: Defer until the primary workbench adapter is proven.

Answer: ____________________

## Shared source-control service

Should a reusable service support multiple repositories and external clients?

Why it came up: Other products reuse one service across clients and repositories, adding lifecycle and isolation responsibilities.

What you get: Reusable connections and centralized observation for larger setups.

Costs: Service lifecycle, resource isolation and authenticated remote access.

Options:
- Add a separately scoped service later
- Use existing owner services only

Recommendation: Use existing owner services first and add a public client surface only with a clear need.

Answer: ____________________

## Connect other agent tools

Should other agent tools be able to invoke the same source-control actions through a standard connection?

Why it came up: An adjacent product advertises connections for external agent tools, but its full behavior is not established.

What you get: Interoperability with agents outside the workbench.

Costs: A new authenticated surface and schema/version support.

Options:
- Design a narrow MCP client surface
- Keep existing internal agent routes

Recommendation: Defer until the adapter and its permission boundary are complete.

Answer: ____________________

## Publish unresolved conflicts

Should users ever be able to publish a change that still contains native conflicts?

Why it came up: Jujutsu can retain conflicts inside local history, while Git-only tools may not understand published conflicted changes.

What you get: Advanced collaboration on intentionally conflicted work.

Costs: Git-only tools and forges may display unfamiliar conflict trees.

Options:
- Block publication while conflicts remain
- Allow a separately confirmed advanced capability

Recommendation: Block by default; add an advanced path only for qualified compatible targets.

Answer: ____________________

## Resolve a conflicted bookmark

Should conflicted bookmarks have a guided target-selection workflow?

Why it came up: A bookmark can have competing local or remote targets that are difficult to understand from a single label.

What you get: An easier way to understand competing bookmark targets and choose one.

Costs: Additional previews and careful local-versus-remote wording.

Options:
- Add a guided picker using existing actions
- Use existing bookmark details and move actions

Recommendation: Add a guided picker only if it clarifies rather than hides the target states.

Answer: ____________________

## Prioritize graph lanes

Should users be able to keep selected branches or stacks near the leading edge of the graph?

Why it came up: Wide graphs become easier to navigate when important branches keep a predictable position.

What you get: More predictable navigation through a wide history.

Costs: Layout preferences and hidden-revision edge cases.

Options:
- Add explicit lane priorities
- Use the default stable graph layout

Recommendation: Offer a simple preference only if it remains stable across refreshes.

Answer: ____________________

## Help with history queries

Should advanced history filters provide autocomplete and inline syntax help?

Why it came up: Advanced history queries are powerful but easy to mistype and can request expensive work.

What you get: Fewer invalid queries and easier use of powerful filters.

Costs: Version-specific syntax support and bounded-query safeguards.

Options:
- Add native query assistance
- Keep simple built-in filters

Recommendation: Start with simple filters and add assistance for advanced users later.

Answer: ____________________

## Edit history by dragging

Should users be able to reorder or rebase selected changes by dragging them in the graph?

Why it came up: Other clients use direct graph manipulation, with subtle rebase and selection failure cases.

What you get: A faster visual workflow for arranging history.

Costs: Preview complexity, multi-selection rules, accessibility and native rebase parity tests.

Options:
- Add previewed drag actions and keyboard equivalents
- Keep menu and command actions

Recommendation: Add only after precise previews and equivalent keyboard actions exist.

Answer: ____________________

## Keep comparison context visible

Should the comparison view offer pinned revisions and richer selected-change details?

Why it came up: Users can lose comparison context while moving through a wide or changing history.

What you get: Less repeated navigation while comparing versions or wide graphs.

Costs: Additional selection state and clear stale/untracked context.

Options:
- Add pinned comparison and selected-change details
- Keep the basic comparison view

Recommendation: Prioritize pinning and explicit bookmark details without adding a separate panel.

Answer: ____________________

## Review a workspace with AI

Should Source Control offer a dedicated AI review action for the current workspace?

Why it came up: Other clients offer a shortcut to review a single workspace with AI.

What you get: A direct starting point for reviewing uncommitted work.

Costs: Review scope, model cost and exact snapshot handoff need clear handling.

Options:
- Add a workspace review entrypoint
- Use existing chat review workflows

Recommendation: Prefer existing review handoffs unless a dedicated action removes substantial friction.

Answer: ____________________

## Store or rebuild history indexes

Should backups store derived history indexes or rebuild them when verifying a restore?

Why it came up: Native history indexes can be rebuilt, creating a tradeoff between stored bytes and verification time.

What you get: A balance between backup size and restore speed.

Costs: Rebuilding takes time; storing requires consistent capture and version checks.

Options:
- Rebuild indexes during isolated verification
- Store indexes as a performance aid and still verify native objects

Recommendation: Prefer rebuilding correctness-critical indexes in the isolated drill; keep captured indexes only as an optional speed aid.

Answer: ____________________

## Complete missing repository data

Should users be able to explicitly fetch missing history or large-file data for a verified backup?

Why it came up: Some repositories contain references to history or large-file data that is not present locally.

What you get: A path from incomplete repositories to full recoverable backups.

Costs: Network cost, remote availability, credentials and potentially large downloads.

Options:
- Add a separately authorized completion workflow
- Block incomplete backups with clear missing-data details

Recommendation: Keep blocking truthful; add explicit completion only with full retained-history reachability proof.

Answer: ____________________

## Very large repository backends

Should Puppet Master pursue specialized storage for very large repositories?

Why it came up: Upstream roadmaps propose specialized storage for workloads beyond ordinary repositories.

What you get: Potentially lower checkout and large-file costs.

Costs: Major backend, filesystem and recovery complexity.

Options:
- Defer specialized storage
- Evaluate one backend for a demonstrated workload

Recommendation: Defer until ordinary qualified repositories show a measured need.

Answer: ____________________

## Export operation diagnostics

Should users be able to export a sanitized operation-history report?

Why it came up: Users need ways to share operation diagnostics without exposing credentials or private context.

What you get: Easier support and review without manually copying terminal output.

Costs: Sanitization, private path/content handling and export scope.

Options:
- Add explicit sanitized export
- Use existing technical details and artifact sharing

Recommendation: Add only with a reviewed export scope and no credential-bearing diagnostics.

Answer: ____________________

## View source-control commands

Should users have a readable log of the source-control commands behind their actions?

Why it came up: Other interfaces let users inspect the commands behind visible source-control actions.

What you get: Easier troubleshooting and confidence about what ran.

Costs: Noise and careful secret/path presentation.

Options:
- Add an optional technical log view
- Keep command details inside individual receipts

Recommendation: Prefer an optional view over existing receipts.

Answer: ____________________

## Publish a stack of reviews

Should users be able to publish related changes as an ordered stack of reviews?

Why it came up: Other products publish dependent changes as linked reviews, while the hosting services have different rules.

What you get: Less manual setup for reviewing dependent changes.

Costs: Forge-specific base links, partial failures and updates after rewrites.

Options:
- Add stack submission for selected forges
- Keep single-review publication

Recommendation: Add one explicitly supported forge workflow at a time.

Answer: ____________________

## Additional review services

Should Puppet Master add review services beyond its current supported providers?

Why it came up: Native and adjacent tools support review services outside the current provider set.

What you get: Access to workflows such as Gerrit without leaving the workbench.

Costs: Provider-specific authentication, identity, submit and recovery support.

Options:
- Design one additional provider explicitly
- Keep the existing provider set

Recommendation: Add only for a concrete user workflow and keep local history independent.

Answer: ____________________

## Custom actions around publishing

Should users be able to configure custom actions around Jujutsu publication?

Why it came up: An adjacent client proposes custom publishing hooks, but their side effects need their own clear contract.

What you get: Integration with team checks or preparation steps.

Costs: External process effects, failure ordering and recovery complexity.

Options:
- Add a qualified explicit extension point
- Keep publication within existing adapter behavior

Recommendation: Defer third-party hooks until effect and permission boundaries are designed.

Answer: ____________________

## Reverse one selected operation

Should users be able to reverse one selected historical operation while keeping later work?

Why it came up: Native history distinguishes reversing one action from sequential undo and restoring an entire old view.

What you get: More precise recovery than stepping backward or restoring an entire old view.

Costs: Additional previews, root and merge restrictions, and conflicts when later work overlaps.

Options:
- Add a separately labeled reverse-selected-operation action
- Keep the existing Undo and Restore actions

Recommendation: Add only if this targeted recovery workflow is needed.

Answer: ____________________

## Preview a rewrite before applying it

Should users be able to inspect a complex rewrite in a separate native preview before choosing to apply it?

Why it came up: Native operations can be prepared without publishing them, suggesting a separate preview-and-apply workflow.

What you get: A reviewable result before changing the active repository view.

Costs: Preview storage, cleanup, currentness checks and separately admitted application.

Options:
- Add an explicitly managed rewrite preview and apply workflow
- Keep the existing command previews

Recommendation: Keep it optional until isolation, cleanup and later application are proven.

Answer: ____________________

## Browse an earlier repository state

Should users be able to browse the repository as it looked at a selected earlier operation?

Why it came up: Other clients identify browsing an earlier repository view as a distinct history feature.

What you get: Inspection of historical graph and content without restoring it.

Costs: Historical query isolation, retention gaps and clear indication of the viewed state.

Options:
- Add a clearly labeled earlier-state browsing mode
- Keep the existing operation details and recovery controls

Recommendation: Add only if operation details do not provide enough context.

Answer: ____________________
