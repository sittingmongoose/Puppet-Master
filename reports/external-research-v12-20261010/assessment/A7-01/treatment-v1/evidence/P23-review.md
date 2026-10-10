# P23 — Cura transformation-writer fix PR #19375

[Governing primary source](https://github.com/Ultimaker/Cura/pull/19375)

**Version:** Merged 2024-08-05; merge 4a5aecc1e4e62e3cf4cd8e0b6002c503881d3078

**Locator:** PR body; files patch plugins/3MFWriter/ThreeMFWriter.py around line 114

**Independent assessment:** The linked implementation fix changes center compensation and matrix multiplication. It is a real lead omitted by the candidate, but the issue continues reporting failures after the merge and the final sample result does not attribute its cause. It cannot be promoted to a proven #19456 repair.

**Evidence captures:**

- [P23-cura-pr19375.json](P23-cura-pr19375.json) — SHA-256 `9f33fc7574c9ed3ce6e6ba0cd52d51393a46c50e6f9010144cc6fe47d1321389`
- [P23-cura-pr19375-files.json](P23-cura-pr19375-files.json) — SHA-256 `10ab81c97abf92140c8347ef4e855dc41c459be889ec6612914d4bdb6d6c8355`
