# Independent Event Authority Validator (Plans-side)

## Authority
This directory is the **canonical** independent EA validator for the 2026-08-12 campaign.

Per Advisor-2 + CLAUDE STRICT:
- **Do not** place or promote this into `scripts/**`.
- Existing scripts (`pm_pnc019_currentness.py`, PNC harness, readiness) may be **run** only; they remain fail-closed until a later explicitly authorized binding.
- Earned clearance is recorded only as a receipt under `receipts/` after live semantic recomputation.

## Run
```bash
python Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py
```

## Non-claims
- Running this does not edit `scripts/pm_pnc019_currentness.py`.
- A `pass:false` receipt is expected while individual dispositions remain provisional / residuals open.
- Receipt booleans are not self-authorizing for PNC until scripts binding is separately authorized.
