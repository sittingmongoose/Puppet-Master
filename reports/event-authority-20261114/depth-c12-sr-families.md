# PNC-019 C12-SR depth re-grade

Implementation: `51c5c602d0`. Every quote is exact-checked against this tree.

| Family | PASS cells | Criterion 12 before | Criterion 12 after | Proof rows |
|---|---:|---|---|---|
| `restore_point.applied` | 12/12 | PARTIAL | PASS | 20/20 |
| `restore_point.corrupt` | 12/12 | PARTIAL | PASS | 20/20 |
| `restore_point.created` | 11/12 | PARTIAL | PARTIAL | 8/8 |
| `restore_point.expired` | 12/12 | PARTIAL | PASS | 9/9 |
| `safe_point.recovery_unavailable` | 12/12 | PARTIAL | PASS | 23/23 |

Totals: {'PASS': 59, 'PARTIAL': 1}. Native execution is NOT_RUN. Evidence and remaining gaps are in the JSON companion.
