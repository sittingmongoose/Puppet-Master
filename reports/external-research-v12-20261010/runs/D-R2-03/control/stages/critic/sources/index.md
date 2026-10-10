# Critic source index — ER12 D-R2-03-control

This bounded index covers the primary evidence independently checked for the critique. IDs are carried unchanged from the investigator package; entries identify the exact version/revision reviewed and do not rebind an ID. Full provenance, observed operation, conditions, and applicability are in [../source-map.json](../source-map.json). The investigator's larger carried index remains at [../../investigator/sources/index.md](../../investigator/sources/index.md); sources outside this critic index were not independently rechecked here.

| Source ID | Primary source and use | Locator |
|---|---|---|
| [FORS2-ROTATING-ILLUMINATION](https://arxiv.org/abs/1311.6467) | Instrument-specific rotating illumination precedent; validates transfer caveat | Abstract; v1 record |
| [DOME-FLAT-STANDARDS](https://arxiv.org/abs/astro-ph/0510233) | Standard-star reproducibility as a flat-field check | Abstract and introduction; v1 record |
| [CCDPROC-2.5.1](https://ccdproc.readthedocs.io/en/2.5.1/reduction_toolbox.html) | Dark scaling default, flat normalization, staged reduction | “Subtract bias and dark,” “Correct flat,” “Basic Processing with a single command” |
| [DIFF-PHOTOMETRY-2023](https://academic.oup.com/mnras/article/526/3/3482/7285831) | Differential photometry and temporal-binning conditions | Abstract and §1. Successful page payload was received earlier in this review; exact per-call fetch time was not exposed. |
| [AAVSO-CCD-CMOS-GUIDE-2022](https://aavso.org/wp-content/uploads/2026/07/CCD-CMOS-English.pdf) | Calibration-setting compatibility, check stars, standard fields | §§4.3, 5.5, 7.2; version 1.0 |
| [AIJ-RELEASE-5.4.0](https://astroimagej.com/releases/54000/) | Product-specific TESS TICA FFI BJD fix | v5.4.0.00 changelog |
| [AIJ-RELEASE-6.0.10](https://astroimagej.com/releases/601000/) | Header latitude/longitude and timing/airmass behavior | v6.0.10.00 changelog |
| [AIJ-RELEASE-6.0.11](https://astroimagej.com/releases/601100/) | Release evolution and optional meridian-flip handling | v6.0.11.00 changelog |
| [MAST-TESS-MISSION](https://archive.stsci.edu/missions-and-data/tess) | TESS cadence/products and 21 arcsecond-per-pixel resolution | Mission Overview, Resolution, Data Availability |
| [EASTMAN-BJD-2010](https://arxiv.org/abs/1005.4415) | Time standards and site-arrival-time recommendation | Abstract; v3 record |
| [ASTROPY-LS-8](https://docs.astropy.org/en/stable/api/astropy.timeseries.LombScargle.html) | Periodogram false-alarm assumptions | False-alarm level/probability methods; v8.0.1 docs |
| [PONT-RED-NOISE-2006](https://academic.oup.com/mnras/article/373/1/231/1378493) | Correlated photometric noise and limits of white-noise scaling | Publisher abstract and §2.4; MNRAS 373(1), 231–242 |
| [BALUEV-FAP-2008](https://arxiv.org/abs/0711.0330) | Periodogram peak significance over a search | Abstract; v1 record |
| [LIGHTKURVE-API](https://lightkurve.github.io/lightkurve/reference/api/lightkurve.io.read.html) | Quality mask and flux-column defaults | `io.read` API reference |
| [LIGHTKURVE-2.5.0](https://github.com/lightkurve/lightkurve/releases/tag/v2.5.0) | Version-specific reader, cadence, and time fixes | v2.5.0 release notes; tag `f6c5f1e` |
