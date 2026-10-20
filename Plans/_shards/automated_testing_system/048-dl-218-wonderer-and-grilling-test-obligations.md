# Shard 048: DL-218 Wonderer and grilling test obligations

Source: `Plans/Automated_Testing_System.md`

Source lines: L6591-L6674

Source SHA256: `0df46c702538197544f5100167ca0b32a163eeb10822dfe4b981cac4d79305de`

---

## DL-218 Wonderer and grilling test obligations

| Owner | Required proof beyond the positive path |
|---|---|
| CWR-041 | A first pass at start and at most two requested repeats; 3 to 5 leads per pass; missing/blank tether, missing sources, missing disposition reason or recorder, pass 4, substantiation without evidence and set-aside without reason are rejected. Preserve the separation of disposition and research status. |
| CWR-041, PART-011..015 | Join each vote's current participant identity to its roster/attempt; Wonderer casts no support, oppose or abstain vote record. Displayed Abstained never contributes to either denominator. A changed ordinary role may vote only through its new current attempt; historical Wonderer evidence is never converted. |
| CWR-041 | No blind proposer can read a Wonderer lead; release after all proposals. Crew split and room round 1 receive the first pass; recorded failed/timed-out/unavailable Wonderer outcomes let the run continue. BrainStorm/Crew synthesis waits for dispositions and research results; Chat Room summary/end never waits and lists undecided leads as not taken up. |
| CWR-041, UCC-205 | Check It accepts any disposition in running/waiting Crew, BrainStorm and Chat Room, rejects other kinds/states and Wonderer self-dispatch, and the BrainStorm alias reaches the same operation with one receipt on replay. Test all three canonical surfaces and legacy source normalization. |
| CWR-042 | Grill Me adds no spec, model, Persona, lane, wave slot or vote. Questions go only to the user. Same-round questions have settled prerequisites. Facts route to research; only dependent questions wait. Reuse prior answers, keep the shared counter and apply base + extension in BrainStorm and extension alone in Crew/Chat Room. |
| CWR-042, APR-072 | Frontier-empty, Wrap up and cap end questioning in What we agreed. Crew split, room round 1, BrainStorm proposals and Plan writes wait for Confirm. Keep going keeps history and count; exhaustion cannot bypass confirmation or admit another new question. Stale identity, denial, duplicate submit and restart preserve the gate. |
| CWR-043, ACD-503 | Numbered questions, preselected recommended answers, accepting the whole round, Wrap up, all answered/open decisions, Confirm and Keep going render truthfully. No preselection auto-submits. Grill Me marks only the existing coordinator/moderator. Lead rows show tether, source, disposition, reason, recorder and research status. Keyboard and pointer use the same controls and disabled reasons. |
| CW section 17, MIG-021 | Migrate a legacy Grill Me slot to the switch once. Preserve transcript attribution, Usage, answers and ordinary historical votes. Repeating or restarting migration changes nothing twice; ambiguous ownership quarantines rather than guessing. |

The static fixture gate proves schemas and its explicit roster join only. Protocol, attempt fencing, actual questionnaire behavior, native storage, visual, restart and provider proof remain future runtime obligations, not inferred from a passing shape check.

### ATS-078 - Wonderer Passes And Grilling Confirmation Obligations

```yaml
plan_unit_id: ATS-078
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DL-218 adds explicit test obligations for CWR-041, CWR-042, CWR-043 and APR-072. Validate WondererPass
  numbers 1..3 and three to five leads; each WondererLead needs a tether and source_refs, every non-null
  disposition needs its reason and recorder, substantiated needs evidence_refs and a null set_aside_reason,
  and set_aside needs its reason. The fixture-only roster join in scripts/pm-new-contracts-verify.py rejects
  every Wonderer vote, including an abstain record, while the displayed Abstained state remains outside
  both vote denominators. Test blind isolation, failed-pass continuation, reasoned dispositions, Crew/BrainStorm
  synthesis gates, a nonblocking Chat Room and all Check It kinds and alias paths. Grill Me has no participant
  or Persona; test user-only frontier rounds, fact routing, prior-answer reuse, one counter and the safety
  cap. Numbered recommended drafts and accept-the-round reuse the questionnaire. Wrap up and frontier/cap
  completion show What we agreed; Confirm alone releases the consumer gate and Keep going preserves history
  and count. Test stale or repeated actions, restart and MIG-021 attribution preservation. Static schema/fixture
  success proves no native handler, migration execution, UI, provider or recovery behavior.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- CWR-041
- CWR-042
- CWR-043
- APR-072
- ACD-503
- ATS-062
unblocks: []
acceptance_criteria:
- All named negative fixtures are rejected for their stated constraint.
- No Wonderer attempt casts a vote or self-dispatches research.
- No staged grilling answer reaches a consumer before Confirm.
- Runtime proof is reported separately from static shape proof.
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: wonderer_grilling_contract_coverage
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/collaborative_workflows_contract_fixtures.json
- Plans/assistant_chat_contract_fixtures.json
- scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md DL-218
- /mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce
preserved_exact_tokens:
- CWR-041
- CWR-042
- CWR-043
- APR-072
- WondererPass
- WondererLead
- MIG-021
negative_constraints:
- Do not count displayed Wonderer abstention as a vote record.
- Do not label static fixtures as native or visual proof.
owner_hints:
- Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
