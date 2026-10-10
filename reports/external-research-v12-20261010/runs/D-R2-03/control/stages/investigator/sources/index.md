# Source index — ER12 investigator

This bounded index points to primary papers, official product documentation, and release history used in this discovery. Source IDs are stable keys; full metadata, access UTC, observed operation, conditions/defaults/exceptions, and transfer limits are in [source-map.json](../source-map.json). No raw source captures were stored.

| Source ID | Main use | Locator |
|---|---|---|
| [AIJ-PAPER-2017](https://arxiv.org/abs/1701.04817) | AIJ reduction, time-series apertures, error model | §§III, IV.2, IV.5; Appendices A.6, B |
| [AIJ-GUIDE-LEGACY](https://astroimagej.com/guides/legacy/) | Multi-aperture and historical FWHM-varying aperture operation | Multi-Aperture; Variable Aperture Usage |
| [AIJ-RELEASE-6.0.11](https://astroimagej.com/releases/601100/) | Current-at-access release / later fixes | 6.0.11.00 changelog |
| [AIJ-RELEASE-5.4.0](https://astroimagej.com/releases/54000/) | TESS TICA FFI BJD fix and FITS history | 5.4.0.00 changelog |
| [CCDPROC-2.5.1](https://ccdproc.readthedocs.io/en/2.5.1/reduction_toolbox.html) | Explicit bias/dark/flat reduction and defaults | Reduction Toolbox |
| [FORS2-ROTATING-ILLUMINATION](https://arxiv.org/abs/1311.6467) | Detector-position/orientation-dependent illumination precedent | Abstract, §§2-4 |
| [DOME-FLAT-STANDARDS](https://arxiv.org/abs/astro-ph/0510233) | Standard-star reproducibility as flat validation | Abstract, introduction |
| [DIFF-PHOTOMETRY-2023](https://academic.oup.com/mnras/article/526/3/3482/7285831) | Atmospheric modes, extinction, comparison noise, optional binning | §§2.3-2.5, 3, 5 |
| [MAST-TESS-PRODUCTS](https://archive.stsci.edu/missions-and-data/tess/data-products) | TESS FFI / TPF / LC products | Product Summary |
| [MAST-TESS-MISSION](https://archive.stsci.edu/missions-and-data/tess) | Coverage and angular sampling caveats | Mission Overview |
| [TESS-SDPD-REV-F](https://archive.stsci.edu/missions/tess/doc/EXP-TESS-ARC-ICD-TM-0014.pdf) | Official time and product definitions | Rev F, §§2.4-5 |
| [LIGHTKURVE-API](https://lightkurve.github.io/lightkurve/reference/api/lightkurve.io.read.html) | Product reader, quality mask, flux-column behavior | io.read API |
| [LIGHTKURVE-2.5.0](https://github.com/lightkurve/lightkurve/releases) | Product reader/cadence/time history | v2.5.0 |
| [EASTMAN-BJD-2010](https://arxiv.org/abs/1005.4415) | Time standards and barycentric prerequisites | Abstract; §III |
| [ASTROPY-LS-8](https://docs.astropy.org/en/stable/api/astropy.timeseries.LombScargle.html) | Periodogram defaults and false-alarm conditions | API / FAP methods |
| [VANDERPLAS-LS-2018](https://arxiv.org/abs/1703.09824) | Uneven-sampling and alias failure modes | §7.2 |
| [PONT-RED-NOISE-2006](https://arxiv.org/abs/astro-ph/0608597) | Correlated noise and non-white uncertainty scaling | §§2.3, 2.6-2.7, 3 |
| [BALUEV-FAP-2008](https://arxiv.org/abs/0711.0330) | Periodogram peak false-alarm probability across searched frequencies | Abstract; extreme-value method |
| [AAVSO-CCD-CMOS-GUIDE-2022](https://aavso.org/wp-content/uploads/2026/07/CCD-CMOS-English.pdf) | Teaching-scale photometry: sky background, position, calibration, check stars, root-cause testing | §§2.1, 4-5, 7-8 |
| [AIJ-RELEASE-6.0.10](https://astroimagej.com/releases/601000/) | Versioned BJD conversion and site-coordinate behavior | 6.0.10.00 changelog |
