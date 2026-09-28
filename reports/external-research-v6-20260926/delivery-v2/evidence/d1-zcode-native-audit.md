# D1 zcode native protocol audit

The original native Goal completed; the frozen structural result remains **failed** because `current_history_separation` is false. This audit supplies mechanical evidence and a location diagnosis; it does not change that predicate, rescore the answer, repair an artifact or assign a semantic grade.

Native readback and all 17 model-request records identify GLM-5.3-Flash / max in session `sess_1f117795-9a6f-4e90-bf1b-67fbbb2df005`. Receipt: 17 responses, 219.6 native seconds, 223.656 host seconds, 300-second/48-response caps; process exit 0, normal Goal completion. Actual candidate tools: **8 Write, 7 Read**, no Edit or other tool. All 15 tool calls use the same original Goal turn. The seventeenth native request is the existing same-session `target_completion_verification`, with the same model/max and no tool calls; no host retry or replacement is observed.

Each successful payload acknowledgment appears in the request that emits its marker. Native lifecycle completion precedes marker start. All four exact receipts were read, followed by aggregate status after invalid and final attempts. Invalid status read shows Alpha INVALID, red VALID_UNVERIFIED, complete false; final status read shows two valid current findings and complete true. Four payload snapshots and four marker snapshots equal the original native Write bytes and their saved state hashes; marker bytes are exactly `submit\n`. No duplicate Write path, overwrite, external file target, shell/web/network tool, input mutation or tool-result error is observed. Native Goal control/verification is existing application behavior. See the JSON for every request ID, tool-call ID, stdout line/event sequence and snapshot path/hash.

| Attempt | Payload Write ID | Marker Write ID | Receipt Read ID |
| --- | --- | --- | --- |
| new--alpha | call_e4f1f2abcef14f5e9905052b | call_34db4400d93441e4be9fa5a2 | call_e26e798b420d4f82b4d3c5b1 |
| new--red | call_c750abecf2934befb2de190e | call_6f8b80b02f26444083c8ed0f | call_1b284b0872ff4c53aba7b114 |
| F0001--invalid | call_6817c8e5b1ad424ab7f8dc41 | call_907f8a05018c452dba7038de | call_5c8a1af02a7d445b9ac50d3e |
| F0001--fixed | call_9d262756489d41bfa844704d | call_fa96507fa613448fbfbceaa5 | call_e33d638d39d74b2b9adcc5ec |

The exact old-token occurrence is `store/current.md:53`, in `F0002_NON_FINDING`: “revisions 1–2, markers ALPHA_V1/ALPHA_V2”. It comes from the original independent `new--red` payload (model-io line 5, `call_c750abecf2934befb2de190e`), describing the scope of the synthetic source. The current Alpha assertion at `store/current.md:9` uses ALPHA_V2; ALPHA_PENDING is absent. ALPHA_V1 is absent from all current assertion parts. This distinguishes a source-scope reference from stale Alpha assertion fallback. The predeclared full-current literal-token test is still false, and `structural_checks_passed` remains false. The recorded result has 14 true checks out of 15; useful protocol observations do not erase that failure.

This is a read-only mechanical audit of frozen native evidence, not semantic validation, enforced filesystem isolation, or a research/evaluator qualification. Requested reviewer role: GPT-6 Sol / high; effective settings are not independently observable. No native/model/account calls, network probes, edits to frozen output, or rescue were performed.

Raw evidence is VM-only. Absolute root: `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926`. Key identities:

| File | SHA-256 |
| --- | --- |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/native/zcode-model-io.jsonl | 30690b2110730b738cc364dca2798df92f7597c9014c7e2c3d398a68e56e29d6 |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/native/zcode-stdout.jsonl | 6118ad125c14348c3a84732b17804266f4630c791baa0f3a3cc3679acd5cdc3d |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/native/receipt.json | b55c5ae83b5467604f7ffcaeb77a80f6a6e65289bc8370493632356f254902ac |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/result.json | fb625b3dc8025763824afda347fe368e3da33099e68b47866b72c209298b63b0 |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/store/current.md | 7e5a3d47e408987951bcdb39d785d6770527032f0f02a00fd7bac52ef0ffa721 |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/store/current.json | cf3422d7e73ac89afcf2a3c5f929d45d25280d40eca95f751d930139d920b44b |
| /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/d1-20260928/zcode/store/state.json | 08048e8754b76df11024909d43e769f3c0a4892326a4a627438352b5efc8c46f |

Full compact audit: `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/delivery-v2/evidence/d1-zcode-native-audit.json`; SHA-256 `cacdf822d36f74b2e6e8e237d587842c3eceb586978d2ddc93da299e8cdc89e5`.
