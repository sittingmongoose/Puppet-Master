# Sound validator census follow-up

Status: verified narrow repair; no Sound product or governance change.

Credential transfer/removal integration `64728e06a` added the existing-route
profile `TCP-INTEGRATION-CREDENTIAL-TRANSFER-REMOVE`, bringing Touch profiles
from 151 to 152. Four Sound validators retained their older exact count.
Only their `SEALED_ACCOUNTING.profile_count` constants change to 152; the other
denominators remain 646 rows, 58 exclusions and 65 aliases, and every Sound
semantic check remains intact. No dynamic-count relaxation is introduced.

Independent review rejected the native author's unrelated fifth hunk: the
metadata test counts 130 action plus 21 dispatch fixtures, correctly totaling
151. That test is unchanged. The author's eventual native Goal completion
does not make its rejected hunk correct.

Frozen evidence under
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/sound-census-152-correction-01/review-selected-v2/`:

- `FOUR-VALIDATORS.patch`, SHA-256
  `810c6b7f0606ddf002e2ca41b3190223b2744d83e524f85ae1a2a8e60f4cd1fd`.
- `DIFFERENT-SOL-REVIEW.md`, SHA-256
  `484fe815950e26b200a5b0955d9239a4a6ca3cc9efe019409d5bd38b9e6f7c4f`.

Root applied exactly those four one-line substitutions. All four enrolled
notification/upload/delete/export validators pass with zero failures; all
12 tests in `test_pm_sound_upload_import_metadata.py` pass. `git diff --check`
passes and the test file is byte-unchanged. This resolves four specific aggregate
failures, not the remaining governance, environment, or current-main comparison.
No TCR Settings hash, lock, evidence bundle, or native behavior was changed.
