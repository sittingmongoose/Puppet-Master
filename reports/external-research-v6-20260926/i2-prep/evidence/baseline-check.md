# I2 offline baseline identity check

Status: PASS. Verification uses recorded manifests, opaque SHA-256 byte hashing, and file-size/membership metadata. No corpus/key semantic contents were inspected. No native/model/account/network calls, approval-file reads, new-work scan, reconstruction, or prior-artifact edits occurred.

- Delivery-v2 published manifest: 58 entries, all checked in both lab and published repository; manifest copy identity also checked.
- D1 FREEZE: 17 delivery files and 14 reused pins checked.
- D1 run evidence: each app has 9 compact copies checked against raw originals and both compact locations, plus 8 raw snapshot/request hashes checked against EVIDENCE. Two run-result identities included. Raw content remains unpublished.
- I1 case manifest: 129 files; exact membership True; 129 hashes match. Sources: 125; source bytes 6565073; largest source 788961 bytes. Entire manifest-listed corpus: 6655802 bytes, largest file 788961 bytes. These are observed sizes, not prospective store caps.
- Existing evaluator key and scoring identities checked against I1 proposal hashes. Paths discovered from stager constants; key/scoring content was only streamed into hashing, never decoded, parsed, or printed.
- I1 reused runtime/driver/run_r1b/reviewer/stager identities checked against proposal pins; unchanged delivery store, evaluator launcher, old common/control prompt and staging pins captured.
- I1 reference limits copied as metadata: candidate 1800 seconds each, evaluator 2700 seconds each, total model 12600 seconds and phase wall 14400 seconds. I2 time ceiling must not increase; prospective store capacity remains the parent decision.

Issues: [].

Detailed path + SHA-256 evidence is in baseline-pins.json. Corpus manifest entries and evaluator key text are excluded. This check does not reopen or regrade closed D1/I1/R1b results.
