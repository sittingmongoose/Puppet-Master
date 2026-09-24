# Forge review wiring owner joins

Repair base: `c9f5d5f945e8069f83c12a717cf4c43fc6893c31`.

The exact existing `catalog.forge_review_create` and `catalog.forge_review_merge` production-intent rows now bind `Plans/forge_integration_contracts.schema.json#/$defs/command_request`, `command_result` and `command_receipt`. Their previous navigation/dispatch-only alternatives no longer stand in for a remote effect or terminal success. Accepted work is not success; success requires a separate terminal provider result and receipt. Both future provider-owner handler routes remain unavailable without separate native admission/evidence. No new command, handler, persisted event, binding or governance admission is created.

The complete parsed wiring delta contains only those two rows. Existing provider-derived review nouns, null-capability unavailability, exact state/disabled selectors, protected remote-merge permission, and distinction from Chat thread/worktree commands remain unchanged. `expected_event_types=[]` remains unchanged. No owner schema or authored owner fixture was changed.

Authority: `Plans/Forge_Integrations.md` §3.3 (SHA-256 `f0f8de3bb61d4c4e7829e1e28dc97b3b91ad38ca098a8be92b577514803ea93a`) and its actual request/result conditionals in `Plans/forge_integration_contracts.schema.json` (SHA-256 `9b0471d75b5a35fe58f5f757cf7945879c41b13a2ecd51b406bfc9ba00ccd835`). This repairs C005-03 from the named-consumer review, not every Forge command or packet clause.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `forge-review-wiring-red.json`, SHA-256 `325f6a40722692c274b6ce40bedc0e71ff78e8956589b3670d7e77c18f8f23b6`: original two rows fail four join/effect assertions, with no test errors.
- `forge-review-wiring-green-v2.json`, SHA-256 `dab7a9c8fa2f5881630157a31b76f5bf2e1de6e11f0f7478cfb6109e5dbe0539`: complete before/after row objects and all check output; six focused tests, 17 vocabulary tests, five adjacent Project tests, wiring validator and whitespace pass. Focused tests exercise actual existing schema rejection for invented create-review identity, missing merge identity/confirmation, missing terminal success result/receipt, missing accepted-work identity and a route-only outcome. They do not resolve reference authenticity or execute remote operations.
- `provider-doctor-forge-full-contracts.json`, SHA-256 `2a3bce72148e2cbf46a5b03746c17a018ac6689b6dcccf0ebdfedba7dbbddf87`: full static contract report at the Doctor commit plus exact wiring bytes; 32 contract pairs, 1,180 positives, 4,051 negatives and 12 internal self-tests pass with zero findings. This is not the repository-wide landing aggregate or main-relative failure-key delta.
- `server_forge_backup/forge-review-wiring-independent-review.json`, SHA-256 `d013f546674e9793111d49c4f2e21c19c22276ede92c682b70d2bb97993edb11`: independent full two-row/test review and six-test execution, no findings; all eight request/result/receipt refs resolve, all unrelated JSON is unchanged, and owner authority/effect boundaries remain intact.

Native/provider behavior, terminal receipt resolution, GUI rendering, pending Forge repository-create contracts, remaining packet closure and main landing remain unproved. No governance baseline or binding was refreshed.
