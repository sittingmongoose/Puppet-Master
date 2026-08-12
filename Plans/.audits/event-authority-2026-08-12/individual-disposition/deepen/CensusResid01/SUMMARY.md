# CensusResid01 adjudication summary

- Input: `closed-world-census/residuals/clean_batch_01.json`
- Rows individually adjudicated: 8
- `RECLASSIFY_TO_EXCLUDED`: 6
- `NEEDS_OWNER_VETO`: 2
- Owner vetoes emitted: 2 row-specific stable IDs
- Cohort pins: empty on all rows (fresh census residuals)
- Admission or registry action: none
- `denominator_closed`: false

The six exclusions are exact configuration, field, method-call, or payload-identity tokens in their cited source contexts. The two `testing.*.updated` tokens are explicit expected command events; each now carries a row-specific owner veto because its wiring entry explicitly requires missing Automated Testing owner certification and does not close the persisted-event contract. Both remain fail-closed and unadmitted pending that decision.
