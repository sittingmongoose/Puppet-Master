# Notification metadata and NamedPlan identity integration

Integrated repair HEAD: `9368afd622`, following metadata commit `f8c26a3fab` and source NamedPlan commit `6b03febcb3b1f66e8a7e969660cda69bbae1846e`. Both repairs are on the repair branch, not main.

NamedPlan now checks separately validated normalized request/result-or-error identities and exact original request/result replay through a closed validation-only input. Root read the full helper, schema/dispatcher/test changes, all fixture values and compact report. Original runtime definitions and all original fixtures are unchanged. Fifteen focused tests and 22 additional root-authored schema-valid causal counterexamples pass through the actual aggregate dispatcher. Six outcome/receipt/retry questions remain in the source report; static consistency is not authenticated originals, resolved receipt ownership, runtime idempotency or atomic mutation.

Independent root review: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/named-plan-identity-root-independent-review.json`, SHA-256 `0b6300aca90bec5dbe29bd4bebe980fe3a89baebbc5aeab7b9c2ebc38ac41137`.

Fresh integrated verification:

- All seven NamedPlan source-commit files are byte-identical after integration.
- NamedPlan 15 tests, notification/sound metadata 5 tests, adjacent Project wiring 5 tests: pass.
- Production wiring, shard body/path check and whitespace: pass.
- Complete static contract aggregate: 32 pairs, 1,180 positives, 4,049 negatives, 12 internal self-tests, zero findings.

Focused report: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/notification-named-identity-integrated-focused.json`, SHA-256 `9a50168c86027722c6b7d6bd5e55943d6ec40c3b99cedf966bd06ed3dac589fb`.

Full aggregate report: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/notification-named-identity-integrated-full-contracts.json`, SHA-256 `65e1e4c6e8c576fc38481ac93157d5fec0091e041800af05f04419022493a6c3`.

The metadata repair's separately recorded baseline/candidate Touch comparison retains exactly one existing Settings fixture-hash drift. This aggregate pass is not the repository-wide landing check or its required full failure-key delta against current main. No lock was acquired, main was not changed, and no governance binding, baseline or exception scope was refreshed. Full packet semantic closure and non-GUI repairs remain in progress. The PM planning-ledger skill constrained source authority and completion claims.
