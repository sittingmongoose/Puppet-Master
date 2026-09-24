# SCS-010 permission pointer repair

Base: `52c7c8924115075bbdd6672f63369f2795e6e0c4`.

The eight ordinary routes in the SCS-010 table incorrectly pointed at the checkpoint permission decision, whose existing classes are only checkpoint inspect/mutate. Their error/permission cells now point to the existing required request `permission_snapshot_ref` and `file_safe_decision_ref`. SCS-010 canonical text describes that same required context. No permission policy or new class is introduced.

Schema, fixtures, SCS-008 checkpoint declaration, command identities, sole handlers, production wiring, Touch registry and governance bindings are unchanged. The adjacent checkpoint class-to-command validation question is not part of this repair.

Verification:

- New eight-route pointer regression failed all eight subcases before the prose repair.
- `python3 -m unittest discover -s tests -p 'test_pm_source_control*.py' -v`: 28 tests pass, including required-ref resolution and preservation of all three checkpoint bindings/classes.
- `python3 scripts/pm-new-contracts-verify.py`: 31 pairs, 1,068 positives and 3,505 negatives pass; no findings.
- Shard generation and check: 99 documents / 2,721 shards, no failures. `Source_Control_System.md` is not in the existing sharding configuration, so no shard bytes changed; the configuration was not expanded.
- Plan index regeneration passed with 6,719 units and 26,220 acceptance units. Complete semantic delta: 23 SCS source hashes, SCS-010 canonical text, one Source Control document-card hash and one expected `event_authority_currentness_source_drift` on `Plans/Source_Control_System.md`. Coverage/dependencies change timestamps only; acceptance units are unchanged. No unrelated semantic drift.
- Readiness remains `blocked_runtime_certification_incomplete`. A later designated governance reseal must account for the edited owner; no binding was refreshed here.

The PM planning workflow skill governed regeneration and claim boundaries. The existing immutable Event Authority input snapshot was reused through an ignored local symlink; its validator receipt SHA-256 is `af0bce7c65932afb2165cf64c0bd06c69f65e9a4b2007dd6ccc0125b56368f0e`. No input refresh or governance seal occurred.

External proposal: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/scm-permission-pointer-repair-proposal.json`, SHA-256 `1c37902aab120450c18817dc3418c7d827ca902f9d0f0080522adbe20306f0b9`. Full probe and verification are beside it in `scm-permission-companion-bounds-probe.json` and `scm-permission-pointer-repair-verification.json`.

Static reference correction only. Native permission enforcement, SCM execution/recovery, GUI completion, readiness admission and whole-packet closure remain unproven.
