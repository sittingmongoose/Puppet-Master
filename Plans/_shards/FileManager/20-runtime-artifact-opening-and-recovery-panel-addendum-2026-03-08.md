## Runtime Artifact Opening and Recovery Panel Addendum (2026-03-08)

File-opening behavior should support the new runtime artifacts and reports produced by scheduler/remediation flows.

Required support:
- open scheduler analysis exports/reports when materialized
- open remediation reports/details when materialized
- open degradation reports when materialized
- open generated non-repo drafts without treating them as normal workspace files

Required UI rule:
- runtime reports opened from Dashboard/Assistant/Orchestrator surfaces must preserve identity and not silently redirect to unrelated files
