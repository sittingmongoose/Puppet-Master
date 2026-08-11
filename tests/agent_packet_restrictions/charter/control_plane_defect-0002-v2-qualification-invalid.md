# V2 controller qualification invalidated before subject launch

Recorded UTC: `2026-08-02T20:36:58Z`  
Disposition: `CONTROL_PLANE_DEFECT`  
Subject/provider calls made before discovery: `0`

V2 preserved exact freeze binding and passed 50/50 frozen deterministic checks. A second independent read-only audit then found five untested fail-closed defect families. V2 controller, README, freeze receipt, deterministic receipt, and audit evidence remain immutable historical artifacts and are not launch prerequisites.

Affected V2 receipts:

- `receipts/verify_freeze/verify_freeze-20260802T203122Z-2b0b1d5d.json`
- `receipts/deterministic_canary/deterministic_canary-20260802T203125Z-b36a66ef.json`

Material defects:

1. Missing/unknown origin values and missing receipt-binding fields could pass because values were not closed/required before comparison; response-effective provider/account/route identity was also not fully bound to the dispatch intent.
2. Offline rescoring read current raw files without first comparing their bytes to the source receipt's committed artifact hashes.
3. Uncertainty reason codes and needed-evidence refs were not checked per uncertainty ID.
4. Negative or mixed-type evidence byte fields were not deterministically rejected.
5. Generic absolute-path redaction could leak a suffix after a space and could corrupt HTTP(S) URLs.

V3 adds explicit negative and integrity self-tests for these defects. No route canary, semantic pilot, fleet, credential read, or provider subprocess occurred under V2.
