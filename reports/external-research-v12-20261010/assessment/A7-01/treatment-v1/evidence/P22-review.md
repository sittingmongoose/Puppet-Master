# P22 — Cura released 3MF reader source

[Governing primary source](https://github.com/Ultimaker/Cura/blob/5.13.0/plugins/3MFReader/ThreeMFReader.py)

**Version:** Source at released 5.13.0 tag

**Locator:** _convertSavitarNodeToUMNode lines 101–135; _read lines 260–328; _getScaleFromUnit 339–364

**Independent assessment:** The current reader asks Savitar for a node name and uses a fallback only when empty. It reads scene metadata and transforms/units. This limits extrapolation from the 2023 name issue, but the dependency/parser/UI/export chain still needs end-to-end tests.

**Evidence captures:**

- [P22-cura-reader-code.txt](P22-cura-reader-code.txt) — SHA-256 `17e549322b505a57546696cf9ba635688b01867f5f1ab55d857a6742ab01633c`

**Independently resolved release commit:** `1fb8a7610460e03ec62da950d1c173a249b23b59` from [5.13.0](https://api.github.com/repos/Ultimaker/Cura/commits/5.13.0). [Saved metadata](version-cura513.json), SHA-256 `82bf46cbb5c349a9f894aec913287cac08cab46db3af0e6ea20c7cfdee82fdbc`. This identifies source version, not product fidelity.
