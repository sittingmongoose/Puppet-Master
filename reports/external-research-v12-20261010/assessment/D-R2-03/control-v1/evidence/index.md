# Independent primary-evidence index

Semantic judgments are in [assessment.md](../assessment.md), with complete actual URLs, versions, conditions and evidence hashes in [source-map.json](../source-map.json). Each text locator is supplied there. The cited TESS URL capture retains the inherited filename but is actually Rev D; the separate exact Rev F capture is explicitly identified. Original stages have no retained raw source captures.

| Independent ID | Actual source/version | Retained evidence | Check result |
|---|---|---|---|
| I-AIJ-PAPER-2017 | [arXiv:1701.04817 expanded 2017 paper; retrieved PDF header inspected](https://arxiv.org/pdf/1701.04817) | [AIJ-PAPER-2017.txt](AIJ-PAPER-2017.txt) | SUPPORTED |
| I-AIJ-GUIDE-LEGACY | [Official legacy guide; self-identifies as very out of date; variable-aperture note names AIJ 2.1.4](https://astroimagej.com/guides/legacy/) | [AIJ-GUIDE-LEGACY.txt](AIJ-GUIDE-LEGACY.txt) | SUPPORTED |
| I-AIJ-RELEASE-5.4.0 | [5.4.0.00, 2024-12-12, ImageJ 1.54h2 / Java 23](https://astroimagej.com/releases/54000/) | [AIJ-RELEASE-5.4.0.txt](AIJ-RELEASE-5.4.0.txt) | SUPPORTED |
| I-AIJ-RELEASE-6.0.10 | [6.0.10.00, 2026-07-23, ImageJ 1.54s / Java 25](https://astroimagej.com/releases/601000/) | [AIJ-RELEASE-6.0.10.txt](AIJ-RELEASE-6.0.10.txt) | SUPPORTED |
| I-AIJ-RELEASE-6.0.11 | [6.0.11.00, 2026-09-10, ImageJ 1.54s / Java 26](https://astroimagej.com/releases/601100/) | [AIJ-RELEASE-6.0.11.txt](AIJ-RELEASE-6.0.11.txt) | SUPPORTED |
| I-CCDPROC-2.5.1 | [Official versioned ccdproc 2.5.1 docs, built 2025-07-05](https://ccdproc.readthedocs.io/en/2.5.1/reduction_toolbox.html) | [CCDPROC-2.5.1.txt](CCDPROC-2.5.1.txt) | SUPPORTED |
| I-FORS2-ROTATING-ILLUMINATION | [arXiv:1311.6467v1, 2013-11-25; FORS2 B,V,R,I standard-field study](https://arxiv.org/pdf/1311.6467) | [FORS2-ROTATING-ILLUMINATION.txt](FORS2-ROTATING-ILLUMINATION.txt) | SUPPORTED_WITH_TRANSFER_LIMIT |
| I-DOME-FLAT-STANDARDS | [arXiv:astro-ph/0510233v1, 2005-10-07](https://arxiv.org/pdf/astro-ph/0510233) | [DOME-FLAT-STANDARDS.txt](DOME-FLAT-STANDARDS.txt) | SUPPORTED |
| I-DIFF-PHOTOMETRY-2023 | [Hartley & Wilson, MNRAS 526, 3482–3494, DOI 10.1093/mnras/stad2964, 2023](https://academic.oup.com/mnras/article/526/3/3482/7285831) | [web-primary-02.json](web-primary-02.json) | SUPPORTED_CORRECTION |
| I-MAST-TESS-PRODUCTS | [Live official MAST product table independently retrieved 2026-10-10](https://archive.stsci.edu/missions-and-data/tess/data-products) | [MAST-TESS-PRODUCTS.txt](MAST-TESS-PRODUCTS.txt) | SUPPORTED |
| I-MAST-TESS-MISSION | [Live official MAST overview independently retrieved 2026-10-10](https://archive.stsci.edu/missions-and-data/tess) | [MAST-TESS-MISSION.txt](MAST-TESS-MISSION.txt) | SUPPORTED |
| I-TESS-SDPD-REV-F | [Cited URL currently serves NASA/TM–2018–220036, EXP-TESS-ARC-ICD-0014 Rev D, 2018-07-31](https://archive.stsci.edu/missions/tess/doc/EXP-TESS-ARC-ICD-TM-0014.pdf) | [TESS-SDPD-REV-F.txt](TESS-SDPD-REV-F.txt) | MINOR_LOCATOR_VERSION_LIMIT |
| I-LIGHTKURVE-API | [Live unversioned Lightkurve io.read documentation; installed version UNKNOWN](https://lightkurve.github.io/lightkurve/reference/api/lightkurve.io.read.html) | [LIGHTKURVE-API.txt](LIGHTKURVE-API.txt) | SUPPORTED |
| I-LIGHTKURVE-2.5.0 | [v2.5.0, commit f6c5f1e; changelog heading dated 2024-08-19; GitHub release API publication 2024-08-29T17:15:29Z](https://github.com/lightkurve/lightkurve/releases/tag/v2.5.0) | [LIGHTKURVE-2.5.0.txt](LIGHTKURVE-2.5.0.txt) | SUPPORTED_CORRECTION_WITH_MINOR_DATE_LABEL_LIMIT |
| I-EASTMAN-BJD-2010 | [arXiv:1005.4415v3; PASP 122, 935–946 (2010)](https://arxiv.org/pdf/1005.4415) | [EASTMAN-BJD-2010.txt](EASTMAN-BJD-2010.txt) | SUPPORTED |
| I-ASTROPY-LS-8 | [Official Astropy v8.0.1 stable API at independent retrieval](https://docs.astropy.org/en/stable/api/astropy.timeseries.LombScargle.html) | [ASTROPY-LS-8.txt](ASTROPY-LS-8.txt) | SUPPORTED |
| I-VANDERPLAS-LS-2018 | [arXiv:1703.09824; ApJS 236, 16 (2018)](https://arxiv.org/pdf/1703.09824) | [VANDERPLAS-LS-2018.txt](VANDERPLAS-LS-2018.txt) | SUPPORTED |
| I-PONT-RED-NOISE-2006 | [arXiv:astro-ph/0608597v1; MNRAS 373, 231–242 (2006)](https://arxiv.org/pdf/astro-ph/0608597) | [PONT-RED-NOISE-2006.txt](PONT-RED-NOISE-2006.txt) | SUPPORTED |
| I-BALUEV-FAP-2008 | [arXiv:0711.0330v1; MNRAS 385, 1279–1285 (2008)](https://arxiv.org/pdf/0711.0330) | [BALUEV-FAP-2008.txt](BALUEV-FAP-2008.txt) | SUPPORTED |
| I-AAVSO-CCD-CMOS-GUIDE-2022 | [Official Guide Version 1.0 (July 2022), 132 PDF pages](https://aavso.org/wp-content/uploads/2026/07/CCD-CMOS-English.pdf) | [AAVSO-CCD-CMOS-GUIDE-2022.txt](AAVSO-CCD-CMOS-GUIDE-2022.txt) | SUPPORTED |
| I-TESS-EXACT-REV-F | [EXP-TESS-ARC-ICD-0014 Rev F, 2020-09-11; NASA/TM–20205008729](https://archive.stsci.edu/files/live/sites/mast/filesER12_RUNTIME) | [TESS-EXACT-REV-F.txt](TESS-EXACT-REV-F.txt) | SUPPORTS_GENERIC_CONDITIONS; CANDIDATE_LOCATOR_REMAINS_MINOR_LIMIT |

Additional release chronology check: [GitHub release API](https://api.github.com/repos/lightkurve/lightkurve/releases/tags/v2.5.0), [retained JSON](LIGHTKURVE-2.5.0-release-api.json).

Retrieval metadata: [HTTP manifest](retrieval-manifest.json). Official publisher OUP search payload and redirect limits are preserved in [web-primary-01.json](web-primary-01.json) and [web-primary-02.json](web-primary-02.json). Other primary browsing operations are in web-primary-03.json through web-primary-05.json. [retrieve_primary.py](retrieve_primary.py) records the independent retrieval procedure and never runs scientific code.
