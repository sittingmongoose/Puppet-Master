# Project dictionary owner decision — 2026-09-25

Status: DL-099 is reconciled into the passive-spelling owner prose and ACD-468 on the repair branch. This is not native dictionary synchronization, storage admission, main landing or whole-packet closure.

## Authority and exact change

Jared's `Deny with changes` answer makes dictionaries per Project, following that Project across installations and visible to other people using the Project. The immutable answer is `/mnt/Cursor/PuppetMaster-Evidence/packet-canon-closure-20260924/decision-card-answers-20260925/ANSWERS-REMAINING-BOUNDARIES.md`, SHA-256 `a39649b88e31ac133bfd1e57fcc8be14c8d77166c5f3902c573687a5f0b4efd5`; the frozen card and decision-record details remain in `remaining-boundary-answers-20260925.md`.

Only `Plans/assistant-chat-design.md`'s passive-spelling section and ACD-468 change. User-managed custom words belong to the Project dictionary. Affirmative separate Personal dictionary management/domain claims are removed; the historical exact token remains only in a negative sentence that admits no independent custom-word store or sharing identity. Built-in/System language dictionaries, source selection, local-only spellcheck, explicit edits, provider-consent boundaries, and unrelated newer Assistant/Full Thread/Help/Teacher text remain unchanged. No synchronization protocol, permission change, old-word migration, storage family/key, setting ID, command or event is introduced.

## Independent authoring and review

External job: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/project-dictionary-reconcile/`.

- Zcode native Goal completed on `builtin:zai-coding-plan/GLM-5.3-Flash`, variant `max`, 40 model calls and zero model errors; session `sess_2ae422d5-60a0-4d67-ac52-d7c14a000f6f`, objective SHA-256 `2c377cbcef46acb02b75bd73f1009e3f4a2bc8be8dfc2474a2d42acec18322a1`.
- Sol-high independent `REVIEW.md`, SHA-256 `e67997e50e43ce9765c4458bc5740fb30020373eb0fbfe0e0bfbb63c5c882778`, rejected the author's retained separate-personal wording and supplied the narrow detached correction. Reviewer wording is not attributed to the external model.
- Root applied only `REVIEWED.patch`, SHA-256 `d80cb6bc2483bebccaa89d344ec227381c6fc46c9b55a24125c7c54705bca240`, after reading the touched current owner text. The native original patch/report are historical, not integration authority.
- Owner preimage SHA-256 `a3fea5b5d0104d239eb54477da4e9c42ad6a1f4719a7e78d29a2e6f9ada9c52f`; root postimage exactly matches reviewed candidate `e38d81d68a249d6ee2fcf6f79aed41e29d037257cc9451d8d8f84c6e7244c48f`.

## Verification and remaining scope

The four existing source-preservation tests passed before the change. Root added a fifth test for Project scope, other-Project-user visibility, absent retired affirmative phrases, unchanged built-in sources and the DL-099 canonical/acceptance references. It failed against the old owner with ten assertions and passes after the reviewed patch: **5/5 PASS**. Sol-high independently reviewed the test delta and reran all five successfully. Test SHA-256: `d44c334461ac838d0ca5651f0c1a3d15d35d3bb8f51992bb05bcb6ba53366c09`.

These tests prove prose preservation and the approved scope correction only. Typed mutation/permission/persistence bindings and native spelling/synchronization/accessibility proof remain separate; no fixture or source check is represented as those implementations. Governance bindings, evidence, baseline and Spec Lock were not refreshed. Current-main reconciliation must preserve newer unrelated Chat text and resolve the separately recorded older decision-ID collision.

Derived regeneration and shard verification pass: 99 documents / 2,761 shards. Index generation passes with 6,743 PlanUnits / 26,523 acceptance units, no unit IDs added or removed. All 467 changed existing index rows are owned by the one edited Assistant Chat document (including its source-hash propagation); no other owner's derived shard changed. `git diff --check` passes. Aggregate governance/current-main landing checks are not claimed by these focused results.
