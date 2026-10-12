# Primary evidence: B12-v2

Active intervention: bounded speculative final writing, execution_topology=b12-overlap-v1. All source captures are researcher evidence; they contain no case-specific candidate answers.

- [speculative-interaction-agents-v2.html](https://arxiv.org/html/2605.13360v2). §3.1 Asynchronous I/O: pause/answer actions and forbidding final answer before required full input; §3.2 Speculative Tool Calling: late-information revision and holding commitment; §5.3 for contextual quality/latency trade-off.
  The current v2 paper allows useful reasoning/actions while input or environment information is pending, supports changing speculative work, and requires final input before final answer. It studies real-time tool-calling, not this research pipeline; reported speedups and any accuracy loss are not acceptable evidence for B12 quality. B12 transfers only bounded preparatory writing, late correction and the final-input gate.
  Capture: `ER13_RUNTIME/methods/B12-v2/primary-evidence/speculative-interaction-agents-v2.html`; SHA-256 `170b306ad8450b58906f89b0536fe5eee1707a69945eed6f82bb923e41f5e76a`.
  CC-BY-4.0 declared in the captured v2 HTML; author/title/version attribution retained. Public export defaults to authored capsule/locator/hash, not the full capture.

- [cost-aware-speculation-v1.html](https://arxiv.org/html/2606.07846v1). §3.1 early downstream execution; §3.3 pure generation or staged draft behind a commit barrier; §1.4/§14 limitations, synthetic validation status.
  This preprint distinguishes starting downstream work while required upstream information is pending and staging a draft until its assumptions can be resolved. Failed speculation consumes work. B12 uses the one-off schedule idea without the paper's probability, money model, routing, calibration or framework; no synthetic result is treated as an executed research-workflow gain.
  Capture: `ER13_RUNTIME/methods/B12-v2/primary-evidence/cost-aware-speculation-v1.html`; SHA-256 `806e154373035cba5476d82f00172e5ccfa112c36514a493e2c6908625daa979`.
  Raw HTML capture kept private; redistribution license not separately established. Public authored capsule, citation and hash only.

These primary mechanisms motivate the prospective small schedule/prompt change. No ER13 efficiency, complete quality, helper execution or real application behavior is established.
