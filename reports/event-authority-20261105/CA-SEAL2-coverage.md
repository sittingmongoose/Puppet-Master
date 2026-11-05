# CA-SEAL2 round 6 coverage

Tested code commit `90c0eacee18e0862e067f0f54b9e79a11ea331f8`. Validator remains `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`.

**327/327 classified: 286 syntax sites and 41 semantic expansions; zero uncovered or stale rows.** The test regenerates the inventory from the validator AST and the CA-SEAL base, deriving every added/touched function and inserted line from the diff. It also regenerates field, nested-object, authority-argument, flag and error-collection expansions.

| Site outcome | Rows |
|---|---:|
| **killed by** | 197 |
| **structural** | 57 |
| **implied** | 20 |
| **same-predicate duplicate** | 3 |
| **frozen-input only** | 50 |
| **Unclassified** | 0 |

Syntax counts include wrappers and child expressions separately. Wrapper sensitivity never proves its children. Structural site dispositions include type/routing interruptions and 16 fixed data-return sites, which Astra lists as data projections rather than independent input guards; each says which kind it is. No data-return disposition is reported as an accepting guard proof. Both regex boundaries, each forbidden path component and each span bound retain separate narrow-cut evidence.

Original 84 survivor rows carry over separately: 28 negative added, five same-predicate duplicate, 16 implied, 22 frozen-input only, 13 structural. The two additional type-protection invariants are recorded with concrete JSON inputs and AttributeError witnesses.

Corpus **158/158**; 17 new negatives plus the inventory test; all 140 prior complete records unchanged. Every one of the 17 mandatory cuts loses only its own negative, retaining 157 exact peer records. Original removal replay: 126 killed, 56 outcome-classified, 0 unclassified, over 182 variants. All 221 Astra variants are accounted for.

**Coverage-test demonstration:** remove one row in scratch: the test fails and names the missing site. Add a stale row: the test fails and names it. Intact and restored tables pass. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/coverage-demo.json`, SHA-256 `860ad5afbbafbf922fbdf9ae1d7d82d98a028a43e67840ba4e8cc49f16dc9114`.

Full machine-readable rows, named failing tests, cuts, same-field survivor reasons and path/SHA-256 evidence are in `CA-SEAL2-coverage.json`. This is regression coverage, not a seal or admission.

Round 7 (lead fix for Sol cycle 7): sites 18 and 19 (`recount_anchor`, `v.get('path') == path`) and sites 190 and 191 (`recount_outcomes`, `outcome == 'excluded'`) move from structural to killed by `negative_wrong_fourth_anchor_path` and `negative_exclusion_unknown_outcome_tag`. Each narrow cut fails only its own negative, and the other 159 records stay identical (`drafts/CA-SEAL2/fix7/`).

Astra round 4 (record update by the lead):
- Sites 183 and 184 (`recount_outcomes`, `outcome == 'registered'`) are killed by `negative_outcome_unknown_outcome`, per Sol cycle 7.
- Wrapper sites 20 and 179 carry a mixed-child scope note.
- `outside_walker_sites` records the completion gate `state["complete"] = not issues` (`V:1074`), which Astra 4 showed the walker does not enumerate. It is killed by `negative_aggregate_input_issue` and `negative_aggregate_receipt_issue`.
- `walker_limits` lists the predicate forms the walker does not enumerate. **The regenerated site list is complete only over the walker's supported forms, not over every possible predicate.** Whether that is acceptable for this gate is pending a neutral Astra review.
