# Independent evidence index — D-R1-02 treatment v1

Judgment: **PASS_WITH_LIMITATIONS**; full [assessment.md](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/assessment.md>) and [assessment.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/assessment.json>). Read semantic conditions as well as hashes. Original source freeze remains unchanged.

## Primary evidence navigation

### R01 — ADXL354/ADXL355 manufacturer datasheet

[Rev D; June 2025 C-to-D revision](https://www.analog.com/media/en/technical-documentation/data-sheets/adxl354_adxl355.pdf)

**Locators:** printed p.1 and p.5/Table 2 (ADXL355 digital ranges); printed p.2 revision history; printed p.23/Digital Output (power-up defaults); printed pp.26–27/Table 10 (digital group delay); printed p.29/I2C Protocol and Reading Data; printed pp.32–34/synchronization, Tables 13–14.

**Scope:** Example-device conditions justify an authentic acquisition audit and a conditional reference alternative. The candidate does not identify the cart logger as ADXL355 or choose a cart rate.

**Local independent captures:** [primary_batch1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_batch1.txt>), [primary_context1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.txt>), [primary_context3.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context3.txt>), [primary_context7.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context7.txt>).

### R02 — NI, Measuring Vibration with Accelerometers

[Current online vendor guide; no release/commit pin displayed](https://www.ni.com/en/shop/data-acquisition/sensor-fundamentals/measuring-vibration-with-accelerometers.html)

**Locators:** Choosing the Right Accelerometer / Sensitivity / Weight; Mounting Options, including typical 100 mV/g table; Signal Conditioning.

**Scope:** Supports mount characterization and reference-chain selection; cannot attribute the cart warnings to its bracket.

**Local independent captures:** [primary_context1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.txt>), [primary_context7.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context7.txt>).

### R03 — ADI EngineerZone original EVAL-ADXL355Z Linux sample-frequency support posts

[Original user posts April 12/19, 2023; ADI support reply May 15, 2023](https://ez.analog.com/linux-software-drivers/f/q-a/569014/eval-adxl355z-linux-command-line-for-setting-the-sample-frequency/493909)

**Locators:** FC64 original setup/report, browser lines 277–298 and 320–325; rbolboac/ADI reply May 15, lines 344–359.

**Scope:** A concrete operating-history failure report motivating configured-versus-effective rate/loss verification. The AI-generated page summary was not used as proof.

**Local independent captures:** [primary_context5.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context5.txt>), [direct-retrieval-log.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/direct-retrieval-log.json>).

### R04 — Auersch, simultaneous vehicle/track/soil railway measurements

[2017 version of record; DOI 10.1155/2017/1959286; campaign 1994](https://onlinelibrary.wiley.com/doi/10.1155/2017/1959286)

**Locators:** Sections 2.1–2.4; Sections 4–5 / speed and position comparisons.

**Scope:** Supports simultaneous references, site context and speed comparisons as methods. Bench impulse and loaded passage conditions differ.

**Local independent captures:** [primary_context1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.txt>), [primary_context2.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context2.txt>).

### R05 — Lamas-Lopez et al., field accelerometer/geophone displacement integration assessment

[2017 VOR, 18(7), pp.553–566, DOI 10.1631/jzus.A1600212; publisher date July 7, 2017](https://jzus.zju.edu.cn/article.php?doi=10.1631/jzus.A1600212)

**Locators:** Abstract p.553; Methods pp.555–557 / Table 1; Results pp.562–563 / Table 3; Conclusions p.564.

**Scope:** An independent-reference and operating-validity precedent only. LVDT displacement agreement is not a cart fault oracle.

**Local independent captures:** [S05-full.pdf](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-full.pdf>), [S05-full.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-full.txt>), [S05-landing.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-landing.txt>), [direct-retrieval-log.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/direct-retrieval-log.json>), [primary_context6.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context6.txt>).

### R06 — Mihăilescu et al., wagon wheel-to-rail comfort study

[Sensors 23(19):8064, September 25, 2023; DOI 10.3390/s23198064](https://pmc.ncbi.nlm.nih.gov/articles/PMC10574946/)

**Locators:** Sections 2.2–2.4; Tables 2–3; Sections 3.1–3.2 and Tables 4–5; Discussion, 50 ms (20 Hz) statement.

**Scope:** A load/placement comparison precedent only. Source ambiguity is limitation L1, and unverified page-update metadata is L2.

**Local independent captures:** [primary_batch2.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_batch2.txt>), [primary_context1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.txt>), [primary_context7.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context7.txt>), [primary_context8.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context8.txt>).

### R07 — Dewesoft X order-tracking vendor manual

[Current online module manual; no dated release/commit pinned](https://manual.dewesoft.com/x/setupmodule/modules/machinery/ordertracking)

**Locators:** Overview / hardware and setup rate, lines 45–58; Frequency channel settings / RPM and signal tracking, lines 85–103.

**Scope:** Optional wheel-synchronous analysis only; suitable RPM input may be estimated, whereas absolute phase needs additional conditions. No route-location or fault proof.

**Local independent captures:** [primary_context1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.txt>), [primary_context2.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context2.txt>).

### R08 — Escalona, camera/inertial track-geometry methodology

[arXiv:2008.03763v1, submitted August 9, 2020; PDF marked August 11, 2020](https://arxiv.org/abs/2008.03763v1)

**Locators:** Abstract/introduction and Section 2 / printed pp.1–2; Sections 8–10 / odometry, sensor fusion and calibration; Section 11 / printed p.22 input requirements.

**Scope:** Motivates independent position rather than vibration-derived location. Does not establish cart localization accuracy or diagnose a fault.

**Local independent captures:** [primary_context3.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context3.txt>), [primary_context8.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context8.txt>), [primary_context9.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context9.txt>).

## Source access record

Web tools exposed source content and fetch diagnostics, but not per-call UTC timestamps. Clock observations bracket the completed browser retrievals from 06:58:56 to 07:05:20 UTC; exact per-call time is UNKNOWN. The direct official S05 PDF request has an observed start at 07:01:32.370993 UTC. The browser repeatedly timed out on the journal endpoints, while direct HTTPS succeeded. A direct publisher HTTP-200 response was a Client Challenge page and is not treated as scientific evidence; the separate web publisher response supported identity/abstract.

Captured browser outputs are unchanged returned evidence in paired JSON/text companions. They include unsuccessful accesses and broad surrounding source context. Primary claims are evaluated explicitly in [independent-source-checks.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/independent-source-checks.json>). Candidate source indexes contained no original full-page captures; reviewer captures do not manufacture candidate execution evidence.

## Identity and clause evidence

- [original-artifact-inventory.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/original-artifact-inventory.json>) — original inspected paths/bytes/SHA-256/mtime.

- [freeze-integrity-check.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/freeze-integrity-check.json>) — terminal and per-stage frozen-input comparisons; identity only.

- [exact-clause-dispositions.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/exact-clause-dispositions.json>) — every nonempty original brief/plan line, exact text, disposition and final locator.

- [reviewer-native-goal-observed.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/reviewer-native-goal-observed.json>) — actual supported current Goal observation before saving judgment. Candidate receipts remain linked in assessment.json.

## Independent evidence hashes

| Relative path | Bytes | SHA-256 |
|---|---|
| [S05-full.pdf](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-full.pdf>) | 2610016 | `6bb1183df7dc89672c4655d1ec7eb860e624d254e90c9bedfee007c0764e9c7c` |
| [S05-full.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-full.txt>) | 70490 | `8ff33e7d11ed98c4db69a5f9156f985dbd9a233526dfbbe99eec181a79be25c5` |
| [S05-landing.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-landing.txt>) | 14965 | `6219e78c74fec2d3446d9250fb7916f4a82cc2cdf1204c798940089537d2b334` |
| [S05-publisher.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/S05-publisher.txt>) | 322 | `379c086845e9325ef371cd6ff21a268597a7c86a8e0df241fd98762a9e32bc74` |
| [direct-retrieval-log.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/direct-retrieval-log.json>) | 1652 | `98f9bc6b8575e00f0787e57c7a7d4278a35de2fae6660d143d6bf2db5a29bff3` |
| [exact-clause-dispositions.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/exact-clause-dispositions.json>) | 71569 | `105601386b0c035aa0fc4e640280980072b22525b12f796ef998c0c745da57c1` |
| [freeze-integrity-check.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/freeze-integrity-check.json>) | 7755 | `ea9666c2b5ff5c5b03dbfd99ffd40560643d977892e0d0b5f0b28e3933c48d97` |
| [independent-source-checks.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/independent-source-checks.json>) | 18266 | `0f5b090df91a4c960682ec9f6d162fc259b9252d844be69a29268555add4a22f` |
| [original-artifact-inventory.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/original-artifact-inventory.json>) | 14391 | `c69a91de6ee64adcea9f1e6547a58a117c19d9e815aa0474747b20c4dda8f79f` |
| [primary_batch1.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_batch1.json>) | 25686 | `3025f8996f37a6d2c3bee179d5c8b87503a731ca18cdceaebf5e629de91d3724` |
| [primary_batch1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_batch1.txt>) | 25229 | `d60bb525cbf288cff3abe956b1dd42f3e977664ec578c7a29a11c5e62cb8359f` |
| [primary_batch2.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_batch2.json>) | 30628 | `1f38cc9338b8ade5f1a76821f8a2f09d01bc758e93fa9c633dfe799ab63f6a26` |
| [primary_batch2.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_batch2.txt>) | 30248 | `8a37079ae71baf864b66f3dedcfd93cb52e7a58ab39162bcb7ecc6bbb1341f62` |
| [primary_context1.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.json>) | 29236 | `ff305708ec56f47890dbb9ada59b5c33a108403b5e0e5be631b8b9cf7724b91f` |
| [primary_context1.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context1.txt>) | 28790 | `f6033f4169c9226e870a9ac8c8296179263b2fd7a0b9267eb827c829a8ea944e` |
| [primary_context2.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context2.json>) | 35174 | `bcadbae5a26eb5e815d2b4a8072afad2e45f5fa69601b54745858db1ad6d9538` |
| [primary_context2.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context2.txt>) | 34885 | `680666f2c814881a716da15b660f7bcb7798133753c4837bf26440029f813236` |
| [primary_context3.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context3.json>) | 26151 | `c72cf0efbe19917592ef199718dba342b24a6d291598ef08abef982fc86a5556` |
| [primary_context3.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context3.txt>) | 25606 | `dfb0fbb02dd7c8cd5688bc056122ad8c39ec72a122b44bcc2dd912d0528107e9` |
| [primary_context4.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context4.json>) | 31610 | `a6f6ef2f490f9217faac3d4e559b17ea48aaa22740f304ec782f54db5cd23aec` |
| [primary_context4.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context4.txt>) | 31038 | `0104fda8ae2f630c1e412da762247a1c489f3f7e31ad54f08ea473eb55b12629` |
| [primary_context5.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context5.json>) | 21175 | `8c5e2c17e66d916d51a55051df398b6f4f454410432a7e435824cded394be06b` |
| [primary_context5.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context5.txt>) | 20937 | `c70ff8a2b1daa2ef22e43fe64d8d140ccdb133f22cc2888f9a2f8838fea2b3a5` |
| [primary_context6.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context6.json>) | 20990 | `761a57418b3d26b703750af45204f2688af68ff18dab312d35dc3f7560d64321` |
| [primary_context6.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context6.txt>) | 20742 | `efb19375180bcf432411b0c8f5c0ccad597d0a3a12c74c49ebc515a50a8c9096` |
| [primary_context7.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context7.json>) | 30296 | `5b8acdd6a2ce60d45a6c18398b99a2353ba207b64e312a933fdd88bc947c249d` |
| [primary_context7.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context7.txt>) | 29927 | `252e4f8e7ed4b9b82cca7cf973f756c59cedf1af47a1466ccb67a4d8f372fc1e` |
| [primary_context8.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context8.json>) | 29609 | `a7c6ecf8a1f6cd60705b5bcecb0a7476600992bee78dabf492c360997a8ace60` |
| [primary_context8.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context8.txt>) | 28994 | `7008f760671396778a32321f235ace1297af69473bff0d627e0794a9ba4ca095` |
| [primary_context9.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context9.json>) | 24233 | `81e15551624f2db4fc3cf0fbd101b23ca1bedde4d5c085c5d061991dd72a9023` |
| [primary_context9.txt](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/primary_context9.txt>) | 23645 | `200b58851a8010da1f76a5846d1c4147761dd541ac66eef556a2973ab33520c0` |
| [reviewer-native-goal-observed.json](<ER12_RUNTIME/assessment/D-R1-02/treatment-v1/evidence/reviewer-native-goal-observed.json>) | 1201 | `8cc50add2f2f84ba7f5d7c9b300ad012fe7dfbd7d5eaf5711bfb1bdfe732ee9e` |

## Save validation and native completion

[Precompletion save validation](save-validation.json) records the completed judgment, exact-clause checks and unchanged originals. [Actual native completion response](reviewer-native-goal-completion.json) records status `complete` after saving the full judgment; elapsed native Goal time was 1,353 seconds (22 minutes 33 seconds).
