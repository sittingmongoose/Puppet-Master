# R012 current-only assessment — quality failure

Capped certification: **partial** (`complete_coverage=false`). Every supplied final artifact and all six prospective facets were read and adjudicated (`material_coverage_complete=true`), but final consistency validation/save exceeded the 20-minute cap. The first complete draft was saved at 19m51s. No acquisition/history was opened and no scope was narrowed.

Report SHA-256: `18349e1b6eb33bc2091dc11e9d7779263abc1f600bc156f13536b8f7eb0beda2`
Artifact-set SHA-256: `0a346577caf4852725ae35bad6f8aaa9fc1572a274ee09af93dd0e387bd86c09`

Artifacts: current-report.md, verification.json, negative-checks.json. Missing: none.

186 exact-locator current-assertion records and 85 atomic source/plan assertion families are saved in the JSON. Report paragraphs, JSON reasons/dispositions, and all R012 negative checks/replacements/additions/non-findings are included.

| Facet | Coverage | Reason |
|---|---|---|
| OME05-C01 | full | Version/namespace admission and hierarchy consistency are explicit. Compatibility is bounded rather than legacy-reinterpreted. |
| OME05-C02 | partial | Rank/order/name mapping and relevant controls are covered. Absent-versus-present singleton identity is not explicit; blanket untyped tolerance needs the 2/3-space constraint. R012 additionally classifies untyped axes by position rather than establishing metadata identity. |
| OME05-C03 | full | Declared group-relative metadata order and each level geometry govern selection, with missing/unsupported level feedback. No fixed numeric-folder or reduction assumption is used. |
| OME05-C04 | partial | General composition/unknown units are covered, but no concrete nonzero-translation expectation tests reversed composition or omitted offsets. Valid UNEXECUTED proposals are credited, not treated as missing test execution. R012 F-29 notation scale∘translate conflicts with its scale-first prose. |
| OME05-C05 | partial | Discovery, intermediate paths, count and transform checks are covered; declared relative source association is not made a prerequisite to overlay. R012 F-35 explicitly treats source.image as provenance only. |
| OME05-C06 | partial | Integer/categorical/label-value and noninterpolating rendering ideas are present. Exact uint64/int64 identity preservation or a refused supported range is absent; palette recommendation force is not consistently preserved. |

Material failures:

- **MF12-01**: No-Zarr-disallowance negative and unbounded dtype conclusion miss integer-only labels. Evidence and all current locators are in JSON (S05).
- **MF12-02**: N-03 no tool names/versions counterevidence claim is false. Evidence and all current locators are in JSON (S75).
- **MF12-03**: N-15/F-28 dismiss explicit semantics and promote unspecified window policy to malformed input. Evidence and all current locators are in JSON (S44, S45).
- **MF12-04**: N-16/F-28 all-display-default absence ignores label colors. Evidence and all current locators are in JSON (S46).
- **MF12-05**: Coordinate formula reverses within-list composition notation; informative example called normative; missing multi-axis example wrongly leaves specified behavior unresolved. Evidence and all current locators are in JSON (S50, S52, S56).
- **MF12-06**: image-label version presence strengthened to MUST. Evidence and all current locators are in JSON (S65).
- **MF12-07**: Explicit source reference restricted to provenance before overlay association is resolved. Evidence and all current locators are in JSON (S69).
- **MF12-08**: Overbroad axis tolerance/position inference and downgraded alignment force. Evidence and all current locators are in JSON (S38, S39, S61, S62).
- **MF12-09**: Mandatory property legends/complete panel UI and rendering policy exceed required product/format scope. Evidence and all current locators are in JSON (S79).
- **MF12-10**: Assigned exact-identity/singleton/concrete-offset coverage incomplete despite completeness assertions. Evidence and all current locators are in JSON (S37, S57, S70).

The source-supported coordinate rule is `S*(s*p+t)+T`, with dataset scale then translation and global transforms afterward (S003 293, 311, 315). The independently calculated two-axis example `(7,11)`, dataset scale `(2,3)`/translation `(10,20)`, then global scale `(4,5)`/translation `(100,200)` yields `(196,465)`. This is evaluator analysis, not a candidate test execution or repair.

Unresolved/missing-input conditions:

- Seed-relative claim matches, all-original-candidate coverage, exact preservation and false-dismissal attribution cannot be determined without excluded candidate seed/history.
- Actual reads/searches/tool availability/denied attempts/no execution/budget compliance/native Goal/cost claims require excluded acquisition/runtime evidence; UNEXECUTED proposal status is explicit and valid.
- Zarr/OME-XML/UDUNITS implementations and linked docs are not admitted; no fetched facts used.

UNEXECUTED validation proposals were credited as proposals. Lack of filesets/execution fixtures is not treated as a false claim. Source/plan facts were checked against the complete 896-line capture and 11-line plan; no live or future facts were used.

Blinding and procedure limits:

- Candidate reports/final JSON inherently expose control/treatment labels, prior seed/job IDs, method names, budgets and Goal references. These were unavoidable current-artifact exposure and not used for grading or economic comparison.
- An initial overly broad rg --files filename listing outside the allowed staged trees exposed path names for private mappings, history, method and attempt files; no contents of those files were opened. This procedural boundary overrun is disclosed. All substantive evidence reads remained within R011/R012 staged inputs/current artifacts/protocol/eligibility.
- Same reviewer grades the blinded pair in one fresh context as explicitly delegated; no prior grades/candidate conversations inherited.

Requested reviewer: gpt-6.1-sol / xhigh. Effective runtime model and effort could not be introspected and remain unknown. No recursive helper, Goal, rescue or candidate feedback was used.

Initial save at 2026-09-30T17:06:13.265198+00:00; final freeze at 2026-09-30T17:08:40.528707+00:00. No unreviewed material scope remains. Seed-relative/runtime assertions were adjudicated unresolved, not silently omitted.

Final timing limitation: the 20-minute cap was exceeded during consistency repair and validation. Verdict remains quality failure; this is not an in-cap complete assessment or a pass.
