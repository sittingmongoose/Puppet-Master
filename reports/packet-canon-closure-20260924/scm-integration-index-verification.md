# SCM repair integration and derived-index verification

Integrated source `c0a280db5aa9bc673f5808d3e5ba2a6ddc45ab16` as `ede7e44fd7` on the packet repair branch. Root independently read the complete eight-row/SCS-010 prose and test delta, resolved both existing required permission references, and reran all 28 SCM tests successfully.

The independent full index comparison confirms exactly 23 Source Control source hashes, SCS-010 canonical text, its document-card hash, timestamps and one new source-staleness diagnostic for `Plans/Source_Control_System.md`. Checkpoint schema/classes and fixtures, Touch, production wiring and Spec Lock remain unchanged. The separate reviewer also passed the old-owner regression ablation.

After integration, index validation exposed one pre-existing stale derived expectation from the Tour storage edit: `pnc019_source_hash_stale` for `Plans/storage_value_registry.json` already existed, and only its expected hash advances from `76813d70faa372b2c883f8042ee5295a8cca135ba788d3994cffdb5e41cb5640` to `56c227c81bb1006d9799dad3c99b3685588817380ed84ffc8d9b356ad29838c4`. The recorded actual binding remains `bf8cf1ceb33f175e144a44699996c0f981eda8a6cb6e05503ec281b9d6dc77dc`. Full in-memory comparison found no other stable generated change. Regeneration reproduces exactly that delta plus timestamps, and index validation passes 6,719 units / 26,220 acceptance units. Readiness remains `blocked_runtime_certification_incomplete`.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `server_forge_backup/scm-permission-pointer-independent-review.json`, SHA-256 `1277ad013a7f6be82b690916123b6d5e40fb3a2d6377ed1d2a9bd509c541b960`.
- `browser_scm_performance/scm-permission-pointer-repair-verification.json`, SHA-256 `19eabef1c699ede501b30b9576b1f51a87830ead18e5bb218684296d52cac7dc`.
- `scm-tour-goal-index-delta-before-regeneration.json`, SHA-256 `ceb10cf862660c607e81150e82662b4c5e2038bf24243e3cb7b5c20bdfbdb2b0`.

The repository PM planning skill governed full-delta checks and the no-premature-governance boundary. Existing immutable Event Authority input bytes were reused; no binding, baseline, Spec Lock or evidence seal was refreshed. No main landing, native permission proof or exhaustive packet closure is claimed. Request the designated owner's later reseal for the edited Source Control owner and existing Tour storage drift.
