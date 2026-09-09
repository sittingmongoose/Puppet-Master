# Independent review: proposed P10 user and agent input scope

Disposition: PASS for the external proposal. No necessary correction identified. The patch remains unapplied; canonical landing is authorized only after the D3 commit/report boundary specified by the parent. This receipt neither reopens D3 review nor claims runtime acceptance, governance regeneration or broad validation.

The actual answer is **Block user and agent input**, recorded in ledger001 q-0001/dec-0005/atom-0014/evt-0009 and the cited source snapshot. The presented choice included an explicit blocked result for agents, continued output and unchanged separate interrupt/terminate controls. The proposal faithfully compiles that answer under DL-038 while preserving DL-035 approval and DL-037's exact verified same-session persistence/replacement-starts-unlocked policy.

Verified substance:

- SMPFS-165 requires the shared input owner to block user typing/paste and agent input before any child write, including command-mediated insertion, with explicit blocked results for agents. No implicit unlock, bypass, silent queue or replay of a blocked attempt on unlock is allowed.
- Output continues and the process is not suspended. Existing independent interrupt, terminate, close/kill and emergency authority remain distinct; protection does not expand or remove those powers.
- Same verified live session retains protection through reconnect/reopen; replacement starts unlocked, layout/history cannot establish liveness, and unlock retains identity. No new pane preference or discretionary persistence policy is introduced.
- FinalGUI, Settings, Testing, Catalog and Wiring consumers agree on both-input scope and owner-derived feedback. Candidate registration/handler evidence remains unavailable; the patch adds no command, handler, production row, event, implementation or runtime result.
- Current agent-scope holds are removed from all seven affected feature units. DL-037 retains its earlier pending chronology as historical wording and points to the later explicit DL-038 decision, rather than retroactively claiming it decided scope.
- Every existing PlanUnit outside the seven intended product units and DL-037 is byte-identical under in-memory application, including all D3 units present in these files. DL-038 is the only added PlanUnit; DL-035's prose is cross-referenced, not re-decided.

Independent mechanical review applied the unified hunks to in-memory copies only, checking every old/context line against current canonical bytes. All eight before/proposed SHA-256 values match map.md; changed/new YAML bodies parse and retain gui_related. No repository file was modified or generated, and no gate runner was invoked.

Snapshot time: 2026-09-09T05:29:19.018060+00:00

Proposal SHA-256: `a14d83c5cf088547c1077aaa2c7ba6f6254aba0b25669e3977f4f045930a22a0`

Source SHA-256: `62c2a70c6dee2ac26090b3652d8957aa61788d19fc57fb0630acc6910b1587b9`

| File | Reviewed base SHA-256 | Proposed SHA-256 |
|---|---|---|
| Plans/Decision_Log.md | f2c3172403a8527d79557af92602a89f0d13a1cfeda3f58e5460c1824060fce5 | bb138f4e1c94fabebbb99c3ae94c4555c20b8f939bb82a4cd1c05a919144698c |
| Plans/Section15_MVP_Promoted_Features_Spec.md | 7250d986422931f2b4e32230bbd652911a38b56120ce96766ead21d3553122e0 | 559160bb3bfde9675074338b19188675dd6bed3c1fd583b4ba96ee33d88775fe |
| Plans/FinalGUISpec.md | f5b21402df46ff126d41d8e7bf1df9cd7abca50781dd488f37bd8142d3ddbdd0 | 591078a9b4278418910a1b885ac9ccaefd33ebb90be2f089326015f4779b25cc |
| Plans/Settings_System.md | b5700e07b47d6a7f3f8ec8cd72ea5795b3cea952a9b665edba383da877cd4cc4 | 44f98f5cc1b8e153a94cbb7f54b17d7ad5af9b1e04fcb8588ccf791aa195cbde |
| Plans/Automated_Testing_System.md | d0ae60188cd3a5f898f77268b57da589bfbf5766c2d9930804cb5610af756664 | 99e9295576a0806699baa2862eeca645961d89d26cba8087c6426f2e5394fc42 |
| Plans/UI_Command_Catalog.md | 7aed74d84ce5b3e2da03f93850838c17c0a5a5ad53cc4cde22d052616f88308c | e02f9d04e5aa520520fec7f17f4eb4599908cbde992aa06c07eb11d967e63195 |
| Plans/UI_Wiring_Rules.md | 093d6659d6368cade8f4ac4de2ee184684fe902b0d34f8b387698fb29e74d9fb | d986040d92b297ae8682fa6569fd2cc6c25faa26497c785130c4b3e475fb195d |
| Plans/Wiring_Matrix.md | 743575229a1904be87e97f373d3008c87c49c09262317303d46cb25a421e4f01 | a5618e70307d7cea21f0bd3b1e968b4c8f36357504ff35e589d7db1be3bb3c18 |
