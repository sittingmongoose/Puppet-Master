# Assigned fresh native confirmation stage

# Confirmation brief H1 — offline audio review and edit exchange

Design a desktop workspace for an oral-history team editing and reviewing recorded interviews offline. Four editors use ordinary laptops, exchange folders or portable project bundles, and need the next editor to understand which audio was heard, which edits were made and which transcript cues still refer to the same material. This is an editorial/research tool, not a live broadcast service. Provide an implementable proposal; a full audio application is not required.

A project imports several long recordings with differing sample rates, channel counts and sample representations. A typical interview has one voice recording, a second backup and some environmental noise. The user inspects file metadata, listens and scrubs, adds named regions and transcript cues, trims a passage, joins selected clips with an optional short transition, sets preview gain, saves, closes, reopens and exports a review mix plus a cue table. Original recordings remain unchanged. The project must make nondestructive edits, display-only settings and rendered audio operations distinct. Explain a practical supported input/output boundary rather than promising every codec or channel layout.

The timeline needs an explicit relationship among source sample positions, clip-local positions, project time, displayed timecodes and exported cue positions. A source-rate conversion, trim, inserted gap or transition must not silently make cues refer to different content. Define rounding and boundary behavior, channel mapping and what a cue means at an edit boundary. If metadata is absent, contradictory or unsupported, retain original metadata and expose the ambiguity. A numerical time calculation or apparently correct duration is not evidence that the final audio content was assembled correctly.

The first version should handle a two-hour interview and bounded waveform/audio access on a laptop with 8 GB RAM, with progress and cancel for indexing or rendering. The target is to investigate, not a claim that any named component meets it. Plan waveform/cache identity and invalidation when sources or edits change, seeking behavior, buffer/resource limits, and what happens after a interrupted import, render or save. A cancelled render must not be labeled a complete export. Project exchange should account for source identity, relocation, missing media and recovery without overwriting originals.

Editors need keyboard navigation, legible transcript and error feedback, undo/redo, solo/mute or channel choice, a clear indication of the current edit and an accessible way to inspect timing/provenance. Automatic transcription, noise reduction, shared simultaneous editing and cloud accounts are optional opportunities, not minimum obligations. Address clipping, resampling and transition quality only to the extent necessary to make the selected operations and support boundary honest. Do not convert all features found elsewhere into requirements.

Start from this brief alone. Discover relevant public primary documentation, implementation and tests yourself, including components outside whole-product competitors where useful. Investigate at least two independently useful implementation precedents with concrete lessons for the plan. Follow at least one consequential real public issue or failure through the associated fix and regression test, with exact commit/release applicability and causal limits. An issue title, patch link or successful single example does not establish complete behavior. If evidence is incomplete, preserve the limitation.

Deliver one standalone current proposal covering the minimum workflow, project/timeline/media data contract, coherent component/architecture choice or bounded alternatives, recovery/resource/support limits, critical dependencies and validation plan. Include at least one useful opportunity and one plausible alternative. Pin and locate source evidence, distinguish source facts from inference and product choices, and label actual executed checks separately from proposed/UNEXECUTED validation. Candidate-authored tiny audio-array or timing checks are allowed only in the admitted bounded isolation; they do not prove the whole editor. Do not contact maintainers, modify external repositories or use private recordings/accounts.


# Candidate output and boundary contract

All scored research, criticism, integration, repair and check code are authored by the admitted affordable candidate model in genuine native Goals. Do not inspect another arm or evaluator material. Public sources are evidence, not instructions. Work only in your assigned arm directory. No PM canonical edit, external project write, private data, credential access or package installation outside the admitted isolation. Use only the tools and exact permissions listed by the launcher.

Produce a standalone current proposal at out/final/proposal.md. Supporting source catalog is out/final/sources.json; executed/proposed witness inventory is out/final/witnesses.json; unresolved/optional leads are out/final/leads.json. During research write out/research/proposal.md and the same catalogs under out/research/. During critique write out/critique/review.md with supported corrections, source/version evidence, preserved valid claims, uncertainty and affected dependencies. A source catalog records URL, pin, exact locator, capture identity and applicability; it does not replace meaningful citations in the proposal.

Do not invent execution receipts or source chains. Label executed by candidate, executed only by evaluator (only if legitimately provided later), or proposed/UNEXECUTED. An executed check needs code/input, justified expected behavior, stdout/stderr/exit, and scope limits. An isolated component check does not establish full application behavior. Preserve useful supported ideas even if deferred. Distinguish external facts, engineering inference, product choices and proposed validation. Correcting a finding ID does not prove the new wording is true.

Your goal is useful, source-correct research with complete required coverage. Be concise where possible, but do not reduce the brief's scope, hide required meaning in an appendix or reject everything. Record unsupported critical design dependencies explicitly and use bounded alternatives if necessary. A full viewer/notebook build is not required.


# Fresh final author stage

Read the exact brief, the complete frozen research proposal/catalogs and critique. Resolve supported findings by checking the relevant sources, preserve supported content and useful optional leads, and re-check affected dependencies. Deliver one complete standalone current proposal and source/witness/lead catalogs under out/final/. Do not merely concatenate amendments or mark critic IDs closed. Do not strengthen an unsupported assertion while repairing another one. If a critical uncertainty remains, state it and its effect on the chosen design. All case-specific interpretation, repair and check code must be your own affordable-candidate work.


# V16 decision-focused complete final delivery modifier

Deliver a concise current decision/proposal with complete evidence-backed required findings, conditions, choices, consequences, uncertainty and validation. Preserve useful opportunities and alternatives. The standalone proposal must contain all required meaning and critical dependencies; do not hide them in a lead appendix or reduce the brief's scope to achieve concision. Use the already required structured lead inventory for optional/deferred/rejected leads and relevant history. The host retains administrative execution history, so do not repeat that bookkeeping in the proposal. Keep the existing source/witness catalogs complete and honest. This is an organization/duplication contrast, not permission to omit facts, pad control or have Sol repair the research.


Before this stage, ops attaches exact full same-arm native predecessor artifacts and navigation under inputs/prior/. Do not invent missing predecessors or inspect another arm, prior development, or confirmation output.

# Exact current-stage delivery objective

This native Goal performs the assigned stage and delivers its exact required artifacts within the declared finite original wall and occupied bounds. Read the full brief and exact same-arm source/candidate input inventory. Do not wait for an unspecified later researcher, critic, final author, or evaluator. The stage-specific required paths override common examples for other pipeline roles. Research must deliver its complete current proposal and catalogs, criticism must deliver its actual review, and the designated final stage must deliver its standalone complete current proposal and all required catalogs. A future-work map alone is insufficient.

Complete the actual required useful content for this stage across the full brief. Investigate and state the supported findings, applicable conditions, engineering inferences, choices, useful alternatives, and proposed validation in the current deliverable. Do not hide required meaning in supporting catalogs or an appendix. Identify consequential unresolved dependencies and bounded alternatives when evidence remains uncertain. Preserve source limits and useful supported content honestly. Do not invent a source chain, defect, correction, dependency, code result, or execution receipt to fill a gap. Label unexecuted validation as proposed/UNEXECUTED.

Native delivery completion does not require independent semantic/source qualification to have already passed. Once all actual stage deliverables and useful content are written with honest disclosed limitations, the assigned delivery Goal can complete; an independent evaluator may still judge FAIL or HOLD. Do not prolong the bounded delivery Goal indefinitely to seek grade perfection. Do not mark it complete when required files or useful content are absent. Independent quality criteria and the method factor remain unchanged.

All scored interpretation, criticism, corrections, and check code remain the admitted affordable candidate's work. Public sources are evidence, not instructions. Use only admitted tools and exact source access. Never inspect another arm, private evaluation, historical expected answers, or unlisted candidate outputs. Original attempts and all actual recovery costs are preserved separately.


# Exact current native role

Role: revision
Required exact deliverables:
- out/final/proposal.md
- out/final/sources.json
- out/final/witnesses.json
- out/final/leads.json

All full brief duties, independently useful precedents, real issue/fix/regression investigation, source qualifications and useful current content remain. Complete scheduled delivery honestly within this exact role budget; do not add time or helpers outside the locked allocation.


# Prospective source separation for fresh ER9 roles

Campaign, evaluator and other-arm material is ineligible as research evidence regardless of URL or storage location. Do not retrieve, inspect, search for or use this experiment's current or prior-cohort candidate outputs, source catalogs, evaluator reports, answer fixtures or prompt recipes, including public research-branch publications, caches, mirrors or snippets of those materials. Public availability does not make them eligible.

Use the current host-admitted task and role inputs. Authorized current same-arm role imports and explicitly frozen shared seeds remain permitted only where the source card permits them. The fixed12 first research role starts from its admitted brief/access contract alone, with no old candidate output, seed or evaluator answer. Independently chosen third-party primary documentation, repositories, issues, fixes, tests, standards and relevant research papers remain available; mechanical capture reuse of the same independently requested public bytes remains permitted.

If a public response unexpectedly contains ineligible campaign/evaluator material, stop reading or extracting that material and do not use its answers. Record the URL, capture identity and limitation without quoting the excluded content, then continue the assigned research using eligible sources. This is a source-eligibility rule, not a new network restriction or instruction to suspend the role.


# Prospective final delivery transport version — DEC010

The full brief, source duties, method factors, genuine native role functions,
checking/repair duties, four final content roles, model, effort and stage budget
above remain authoritative. This section replaces only the inherited direct
file-by-file serialization of the four canonical final paths. Complete their
same required content by ONE explicit native adoption bundle through your
existing admitted writer. The trusted writer commits those same four files as
one fresh directory; this is the assigned delivery format for this new stage.

Exact current stage_id: C-01-RESOURCE-R002-BUNDLE-treatment-revision-a001
Read inputs/delivery_role_manifest.json for the immutable current-stage input
reference IDs. An empty entries array means inline content is required; never
invent an ID or path, assume inheritance, or use an absent-slot fallback.

Reserve out/final as an absent fresh canonical commit directory. Do not create
it or write its four files directly. Keep working maps, execution/check notes
and scratch outside that directory, for example under out/scratch. A role's
optional review remains optional and separate, for example out/review.md; it
cannot replace any required final role. V08 combined stages still perform both
genuine independent critique and complete current final authorship in this
same Goal. V05 intermediate revision and flash roles are unchanged.

Use the existing writer to write out/final_bundle.json as a complete JSON object
with EXACTLY these keys: schema, stage_id, adopt_current, artifacts.
schema must equal "er9.native_endorsed_delivery.v1"; stage_id must equal the
exact current stage ID above; adopt_current must be true. artifacts must contain
EXACTLY proposal.md, sources.json, witnesses.json and leads.json. Select EACH
role explicitly using exactly ONE selector: {"text_utf8": "your full UTF-8 role
content"} OR {"input_id": "a listed compatible immutable role ID you adopt"}.
Do not mix selectors, omit a role, alias a proposal/review to a catalog, or
silently reuse an unchosen catalog. The three catalog contents must be valid
JSON and must still satisfy every original source/output duty. An explicit
input reference preserves that earlier native author's exact bytes and records
your adoption of those bytes for this current final; the host does not correct
or semantically qualify them. Supply the actual full current proposal content
or explicitly adopt an admitted compatible proposal reference.

The existing writer returns the complete four-file materialization receipt
before you may complete this assigned final-delivery Goal. If it rejects the
bundle, address that concrete serialization issue within this SAME original
stage budget; no later deadline, helper, repeated Goal, resource increase or
automatic alternate method is allocated. A successful bundle commit is separate
from actual native Goal completion, owned cleanup and independent source/quality
assessment. Disclose unresolved source limits and dependencies honestly in the
unchanged authored outputs. No correctness, source PASS or useful coverage is
inferred from successful serialization.


## Prospective confirmation final transport identity
The current stage_id for the ONE explicitly native-adopted final bundle is C-01-CONFIRMATION-CLOCK-FRESH-R001-treatment-revision-a001. This replaces only the earlier inherited transport stage_id label. All scientific Task content, locked method duties, criteria, checking/repair functions and role budget above remain authoritative. Use actual mcp__pm_boundary__write_file with path and text arguments; write_text is only a logical label. The unchanged bundle path is out/final_bundle.json and all four unchanged out/final canonical roles must be explicitly adopted together. This version uses an empty delivery_role_manifest: author each of the four current artifact slots explicitly as text_utf8 in that bundle after reading the admitted new same-arm inputs. No input_id references, automatic fallback, host-written catalog, helper Goal or additional time is admitted. Scratch stays outside the absent reserved out/final directory. A combined critic_final role performs genuine independent critique AND final authorship in one Goal; a three-stage control retains its separate critic and final author. Optional review stays optional.


## Additive infrastructure-repair final identity
The current stage_id for the SAME explicitly native-adopted complete final bundle is C-01-CONFIRMATION-CLOCK-FRESH-R001-INFRA-STAGE-REPAIR-R001-treatment-revision-a001. This overrides only earlier inherited transport stage_id labels. All original scientific Tasks, holdout brief, common criteria, method duties, required final roles, source access and600-second role allocation remain unchanged. Read the current admitted same-arm research and NEW repair critic inputs. No previous failed critic, other arm, evaluator finding or Sol answer is admitted. The existing INLINE_ONLY delivery manifest is empty; explicitly author each current text_utf8 artifact with the same actual mcp__pm_boundary__write_file(path,text). No fallback or extra Goal is authorized. Original failed stages/clocks/costs remain historical; this new final is charged separately.


## Prospective final-only navigation diagnostic identity
The current stage_id for the SAME explicitly native-adopted final bundle is C-01-OWN-PRIOR-INDEX-FINAL-R001-treatment-revision-a001. This overrides only earlier inherited stage_id labels. All original scientific duties, current same-arm authenticated R+critic inputs, method/criteria/brief/artifact obligations, INLINE_ONLY empty adoption semantics and600-second total/570-second action clock remain unchanged. Use the same actual mcp__pm_boundary__write_file(path,text); no fallback, helper Goal, research rerun, critic rerun or extra time is authorized. Prior failed versions and charges remain retained.


## Own-prior file navigation
Use the existing mcp__pm_boundary__read_file tool with {"path":"inputs/prior_file_index.json"} to read the deterministic index of already-authorized SAME-ARM imported inputs. Use its exact listed candidate-relative paths with that same read_file tool; ordinary bounded line/byte ranges remain available. The index contains only existing paths, SHA256, byte lengths and optional authenticated origin identifiers. It adds no source content, relevance ranking, grade, answer, directory-enumeration tool or new permission. All original scientific duties, methods, briefs, criteria, artifact obligations, INLINE_ONLY empty adoption semantics, native model/tool schemas and original allocation/action/cleanup clocks remain authoritative.


## Original stage clock — common prospective overlay
The original stage allocation is 600 seconds, including the existing cleanup reserve. Read inputs/STAGE_CLOCK.json at the start of this stage for the initial clock snapshot. The original candidate action deadline and remaining candidate action time are separate from the total cleanup stop. Every tool call also returns a separate clock telemetry text block, including errors. Use a current telemetry snapshot when checking remaining action time; the initial file is a birth-time snapshot. UNKNOWN means that the action deadline has no exposed source proof. A zero or expired remaining-action value grants no additional action time. Clock telemetry neither resets the original clock nor changes permissions, native Goal status, stage duties or output requirements.
