# Context Lens per-Apply source preservation

Source `cb7c695053fcc1c3557d8501c435e9be79776a48` extends existing ACD-460 above integration base `ad9b8c10c861d0c39a639fe2c2d7855ea1bbce75`. Root independently read the original fixed-product, original handoff and machine requirement clauses. All three prescribe up to 25 messages per Subcompact Apply; multiple operations may cumulatively cover more than 25 messages in a thread. The rule is not a Mute/Focus selection limit or a summarization byte cap/algorithm.

Root regenerated shards and indexes, then compared all 87 source-commit paths, allowing only generated timestamps to differ. All match. Of 467 affected Assistant PlanUnit rows, ACD-460 alone changes semantics; the rest change only source hash/location. The complete non-ACD-460 acceptance records are preserved except source locations. ACD-460 adds exactly one criterion; all prior criteria survive. Readiness diagnostics are unchanged.

Verification:

- Eight static Lens/spelling prose tests pass.
- Plan index: 6,719 units, 26,225 acceptance criteria, zero failures.
- Shard check: 99 documents, 2,721 shards, zero failures.
- Whitespace check passes. No owner other than Assistant Chat or unrelated derived content changes.
- Full contract gate is unchanged by this prose-only step; the immediately preceding integrated run remains 32 pairs, 1,163 positive and 4,024 negative cases, zero findings. The broader landing aggregates were not run here.

Root scope/regeneration evidence: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/lens-cap-root-integration-review.json`, SHA-256 `331599d9827f7c29076438cffd8c17f607223982dc4a08bcdb98baa3e9ba6513`. The comparator initially stopped on the newly added `preserved_exact_tokens` key; its comparison was corrected to handle added keys without changing repository content, then the full comparison passed.

Independent review: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/context-lens-cap-prose-independent-review.json`, SHA-256 `f5c84d940bb6e3c539d9194e4d4f1114e2b073c8c79ee118f01cf16c389c424b`. No findings; eight tests, index and shard checks pass. The four new tests run against old owner bytes produce seven expected failed assertions/subtests and zero errors. Only shard 068 changes body; other shard changes are source metadata and derived index locations.

No native implementation, command companion, summary algorithm, mode-switch/overlap decision, physical storage or event admission, binding refresh, governance reseal, readiness unlock or main landing is claimed. Context Lens mode-switch and overlap decisions remain separate pending user questions. The Settings disposition hash drift recorded in the JJ integration report remains unresolved and its binding is unchanged.

The PM planning-ledger skill guided source fidelity, explicit unresolved decisions and the separation between derived regeneration and governance sealing.
