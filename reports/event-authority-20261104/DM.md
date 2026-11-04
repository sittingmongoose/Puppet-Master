# DM — review round 2 fixes, 2026-11-04

Branch: `plans/ea-w2-small-owners-20261104`. Reviewed head: `81746599e17375fda60b8b51c8ac2bfd3c2b09d7`. Canonical fix commit: `6eb5a0ba62d6268406851a50e2d4243a38d3fdd4`. Worker: DM-FIX2, VM. Last fix round under the review cap; no new review started. Base remains `be4766513ff71776346fc73b84f2542990f955af`; no rebase, landing or main push.

**B1–B3 fixed; all five standing checks run across all ten assigned families.** Eight candidates self-grade prepared on every technical criterion, with membership intentionally ABSENT and six retention cells still PENDING for RT. Both Settings families stay stopped for Jared. This is a normative self-grade, not independent re-review, admission or native execution proof.

## Family grades before and after

Before uses the independent cycle-2 review, including its conflicts and missing-oracle grades. Twelve cells per family:

| Exact family | Before: cycle-2 review | After: fixed self-grade | Outcome |
|---|---|---|---|
| `format.applied` | 9 PASS, 2 PARTIAL, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `git.clone.completed` | 9 PASS, 2 PARTIAL, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `lsp.server.lifecycle_changed` | 9 PASS, 2 PARTIAL, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `model.catalog_refreshed` | 7 PASS, 2 PARTIAL, 2 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `project.added` | 9 PASS, 2 PARTIAL, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `project.created` | 9 PASS, 2 PARTIAL, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `settings.theme.updated` | 6 PARTIAL, 6 ABSENT | 6 PARTIAL, 6 ABSENT | stopped for Jared |
| `settings.updated` | 6 PARTIAL, 6 ABSENT | 6 PARTIAL, 6 ABSENT | stopped for Jared |
| `subagent.context_rehydrated` | 8 PASS, 1 PARTIAL, 2 CONFLICT, 1 ABSENT | 11 PASS, 1 ABSENT | prepared without admission |
| `subagent.context_shrunk` | 8 PASS, 1 PARTIAL, 2 CONFLICT, 1 ABSENT | 11 PASS, 1 ABSENT | prepared without admission |

## Review round 2: findings and responses

1. **B1 — fixed (`6eb5a0ba62d6268406851a50e2d4243a38d3fdd4`).** MS-199, PP-151/152 and CV-622..624/SP-602..604 independently adopt CV-366's exact `application@1:{hex(server_id)}:{hex(owner_operation_id)}`. Actual Server is frozen in each original owner's source; both complete UTF-8 components are lower-hex, without hash/trim/normalization. Project keys and event IDs remain unchanged. Former hash-key, missing/foreign Server, uppercase-hex, multiple Server, exact whitespace and composed/decomposed Unicode vectors run in the full checker. Verify the `Identity digest` line immediately before each application's `Exact envelope joins` paragraph and the canonical CV-366 key line.
2. **B2 — fixed (`6eb5a0ba62d6268406851a50e2d4243a38d3fdd4`).** The same three exact-family owners and schemas bind Storage's 16 KiB **encoded MessagePack byte** cap. Above it, the closed logical body moves to SP-337 packs; inline payload is `{}`, with the existing string `payload_ref` carrying a compact sorted JSON descriptor of BLAKE3 ID, uncompressed byte size and `application/msgpack` media type. Its logical fields retain the same payload schema and original-result joins after resolution. Pack/index durability precedes issuance. Each family's 16,383/16,384/16,385-byte and 128-ref matrices cover oversized-inline refusal, correct external publication/recovery and missing/unsynced/changed/unauthorized/deleted/held body or descriptor refusal. These are newly authored technical bindings under DL-045, not a new persisted value, retention rule or envelope widening. Verify each application's `Exact envelope joins` paragraph and `payload_boundary_cases` fixtures.
3. **B3 — fixed (`6eb5a0ba62d6268406851a50e2d4243a38d3fdd4`).** Every drafted family owns explicit `projector_replay_only` append and current-retry negatives with `replay_only_not_appendable`, checked before semantic resolution. Protected immutable historical reads remain separately tested, including genuine stored replay-only originals; the canonical semantic digest stays unchanged. Every one of the eleven delivered receipt fields is mutated and removed at **publication**, and unrelated receipt/authority negatives withhold success while preserving the existing durable frame. ATS-300..304 and all three supplements independently adopt these cases. Verify the exact-family lines below and the full checker.
4. **Standing LF check — fixed (`6eb5a0ba62d6268406851a50e2d4243a38d3fdd4`).** All 15 patterned payload fields across seven schemas now use a full-match guard and explicit CR/LF refusal; all have trailing-LF negatives under Python's actual validator. LSP has no patterned field and retains its full original-source joins. No schema shape was widened.
5. **Prior resolved findings and reconciliation — preserved.** Per-family existing redaction profiles, original actor/correlation/time/subject/payload joins, removal of unrelated sibling clauses and stopped Settings oracle grades remain. PJCT-072/073 still separate existing-content registration from new creation; SCS-085 remains ordinary Git clone before registration. Original producer-witness negatives pass; no new Project/Git decision is opened.

| Exact family | Owner / Contracts / Storage | Replay/refusal/receipt publication paragraph |
|---|---|---|
| `format.applied` | FS-075, CV-620, SP-600 | `Plans/Formatters_System.md:1131` |
| `lsp.server.lifecycle_changed` | LSPS-173, CV-621, SP-601 | `Plans/LSPSupport.md:7270` |
| `model.catalog_refreshed` | MS-199, CV-622, SP-602 | `Plans/Models_System.md:9929` |
| `subagent.context_rehydrated` | PP-151, CV-623, SP-603 | `Plans/Prompt_Pipeline.md:6064` |
| `subagent.context_shrunk` | PP-152, CV-624, SP-604 | `Plans/Prompt_Pipeline.md:6115` |
| `project.added` | PJCT-072, CV-625, SP-605 | `Plans/Project_System.md:1006` |
| `project.created` | PJCT-073, CV-626, SP-606 | `Plans/Project_System.md:1057` |
| `git.clone.completed` | SCS-085, CV-627, SP-607 | `Plans/Source_Control_System.md:2164` |

The preceding `Identity digest` and `Exact envelope joins` lines in each application row own B1/B2. `Plans/event_payloads/model_catalog_refreshed.schema.json`, `subagent_context_rehydrated.schema.json`, `subagent_context_shrunk.schema.json` annotate resolved-body byte admission. `scripts/pm-small-owner-events.py` owns the static `application_key`, `resolved_payload`, `publication`, `current_retry` and exact-family oracle execution. Fixture positives have explicit original operations/results and protected committed-value/receipt examples; none authorize native writes.

## All-ten standing audit

| Check | Eight prepared families | Two stopped Settings families |
|---|---|---|
| Replay-only append/retry | Explicit independent negatives and exact refusal; immutable historical read positive | Stopped; no current writer/oracle authored |
| CV-366 application key | Exact original-Server/operation bytes on all three application writers; five are Project-only | Stopped; no key inferred |
| Encoded Project partition | All Project positive custody and scope variants use Storage's `project~` base64url form | Stopped; no Project positive authored |
| 16 KiB inline / SP-337 | All inline positives bounded; all three reachable large-body families test exact boundaries and refs | Stopped; no payload representation selected |
| Pattern full-match / LF | Every patterned field guarded and tested; no LSP patterns | Stopped; no event schema authored |

`fix2/standing-checks.json` records all ten rows. All three owner copies agree per family apart from their role heading. Before-draft searches and exact negative evidence remain in DM-search.json; `review_round_2` records each family's checked authority and newly authored refinements. Existing reader IDs, SP-278 global checkpoint/CAS, nine-field durable token, SP-286/CV-339 first-receipt/full-value and SP-336/SP-347 group rules remain unchanged. No new reader, checkpoint, operation journal or registry row is introduced.

## Questions for Jared — stopped

- **`settings.theme.updated`:** Should current emission of the old exact family be explicitly retired, preserving historical bytes and using `settings.layer.changed` for committed atomic theme-pair changes, or remain a distinct current event obligation? Startup/onboarding read-only previews remain event-silent. Recommendation remains explicit retirement; **not applied**. UI_Command_Catalog's retained old effects and current UCC-108 preview/transaction rules still coexist; SSYS-010/060 and DL-300 grant no alias or universal retirement.
- **`settings.updated`:** Should a new narrow ruling make `settings.layer.changed` the single future generic history, superseding DL-041's future name and retained memory auto-save expectation, or do both families remain independently required? Preserve `app.agent_rules.dry_method_default_guard`, transaction identity and historical bytes. Recommendation remains a single future layer history only after Jared's ruling; **not applied**. Its valid setting-ID/writer mapping is a separate technical hold; prove it or keep it disabled, never equate it with `memory.assembly.dry-method-guard`.

DL-041's premise is still current in Settings_System, storage-plan and UI_Command_Catalog; DL-300 admits only the layer family. DL-076's durable-token premise is current. Case L-3 still assigns Runtime/run/node/attempt 365 days after completion to the two context families; the other six retain `PENDING_RETENTION_DECISION` for RT. No failed old-decision premise was applied and no deletion/retention choice was made. Stopped oracle cells stay ABSENT with `static_checks_seen=[]`.

## Verification and limitations

- **PASS:** final exact-family checker (4,158 assertions); all-ten standing audit; review's independent mutation probe on the fixed tree; 22 deliberately weakened-checker mutations caught by the full family suite; shard generate/check; index generate/validate (parsed top-level status); Storage recovery self-tests; whitespace, scope/ID and current evidence-quote checks.
- **Existing integration issue:** optional Storage profile check exits 1 with 41 missing application profiles. Running the exact reviewed-head checker against byte-identical reviewed-head registry input reports the same 41 rows. No Storage profile or registry was edited; this is outside DM and is recorded, not repaired.
- **Dependencies:** the checker uses `jsonschema` and `blake3` (tested with blake3 1.0.11). Verification used a temporary venv with system packages plus `pip install blake3==1.0.11`; it is removed at cleanup. Recreate a temporary environment with those packages to rerun the exact commands; no machine-specific path is embedded in canonical code.
- **NOT_RUN:** native owner acceptance, filesystem sync/crash recovery, protected restore authority, concurrent CAS and action spies. Fixture pack/durability/source facts are synthetic and authorize no writer or native success. No source can be reconstructed from the global index.

Exact commands, exits, evidence paths and SHA-256 digests are in DM-checks.json. All raw outputs and audit/probe sources are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/fix2/`. Reports/self-grade copies overwrite the lane delivery directory. No governance reseal or aggregate admission gate was attempted.

## Scope, IDs and cleanup

Existing IDs amended: FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620..627, SP-600..607, ATS-300..304. **New IDs: none.** CV-628/629 and SP-608/609 remain unused. Shared-file edits are confined to those Contracts/Storage/ATS units and the three independent ATS supplements. Generated shard changes belong only to edited configured documents; index artifacts were regenerated with the 15 copied currentness files SHA-256 verified.

Entry resources: 13 GiB available memory and 125 GiB free root disk (above 6/50 GiB stop thresholds); later check: 15/108 GiB. Sparse detached worktree from the specified branch/head. No pm-mail, subagents, admission, registry append, Decision Log entry, frozen-validator edit, tests edit, governance update, main push, browser or server. Source and report steps are pushed separately; the literal `/home/sittingmongoose/pm-worktrees/DM-fix2` worktree and temporary venv/edit helpers are removed after delivery.
