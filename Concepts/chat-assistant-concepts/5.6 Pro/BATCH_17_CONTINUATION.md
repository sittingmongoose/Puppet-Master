# Batch 17 source-backed continuation — first UNVERIFIED slice

Base: supplied slice5 (309 source files), not Batch 16 reimplementation.
GitHub main pin: b66529d97e8c90c13b17dcfed52653a80908c543.

Changes in this slice:
- Recovery consumes the scheduler stop-epoch admission guard; a fresh snapshot cannot bypass a latched Stop.
- Unknown or malformed local work callbacks fail closed without throwing before identity checks.
- Artifact editor escapes an invalid version at every HTML insertion site.
- B15 mid-admission conflict test now first asserts immutable-array rejection, then injects a replacement binding to preserve the original conflict-preservation test rather than weakening it.
- Three additional real-owner adversarial cases preserve all retained B17 assertions.

UNVERIFIED: no fresh application, responsive, PDF, regression, motion or package tests have yet established these bytes. Current owner review and pinned baseline comparison are still in progress. Not installable, not accepted, not native or governance proof.
