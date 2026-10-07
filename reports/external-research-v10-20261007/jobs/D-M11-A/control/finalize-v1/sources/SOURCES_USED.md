# Sources used — D-M11-A/control/finalize-v1

No additional public captures. All claims bind to the frozen corpus from INPUT_MAP (capture 2026-10-07), hashes re-verified match at 2026-10-07T19:00:22Z.

- pep706 | https://peps.python.org/pep-0706/ | PEP 706 captured 2026-10-07; released code takes precedence | sha256 6139a435b458b6091ea2bfebd2b1ba9a163633e62f55b33720870d558e01b71e | Motivation/Specification/Security Implications
- tarissue | https://api.github.com/repos/python/cpython/issues/102950 | CPython issue 102950 captured 2026-10-07 | sha256 9ba5b6f74ea5ac74bfd12cc13f9fa3610fcae050617003563732e0fda4ee7a84 | closed; "Implement PEP 706 – Filter for tarfile.extractall"
- tarpr | https://api.github.com/repos/python/cpython/pulls/102953 | CPython PR 102953 captured 2026-10-07 | sha256 63cb304e277da293006a1f650612d5a1b21fbccb7456dd9e734cf2c5d6fbe8e2 | merged True 2023-04-24T08:58:06Z af530469954e8ad49f1e071ef31c844b9bfda414
- tardefaultissue | https://api.github.com/repos/python/cpython/issues/121999 | CPython issue 121999 captured 2026-10-07 | sha256 e88ab5fad57a96ff4cb0d25148ff5c1535027d2482fe616d4ee0e2a0a3b70bce | closed 2024-07-26T14:34:48Z; default→data
- tarold | https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/tarfile.py | CPython 3.12.3 | sha256 5dd00cc68e88d9581551b1a457398c5b63d87ae1152fa03ef298743485d12cc8 | _get_filter_function 2217-2235 (warn+fully_trusted)
- tarnew | https://raw.githubusercontent.com/python/cpython/v3.14.0/Lib/tarfile.py | CPython 3.14.0 | sha256 07e226f1b76043516d16c7185baf6ab3d37aac915373a0194b773dab0bf2330d | filters 849-880; _get_filter_function 2370-2400 (default data); errorlevel 1710,2531-2550
- tardocnew | https://raw.githubusercontent.com/python/cpython/v3.14.0/Doc/library/tarfile.rst | CPython 3.14.0 | sha256 901ab69790214a595355d7e29a4b11a68fdfa8c45032dd3bd84822de01280d9f | filter default 650; filters 1032-1090; errorlevel/Filter errors
- tartest | https://raw.githubusercontent.com/python/cpython/v3.14.0/Lib/test/test_tarfile.py | CPython 3.14.0 | sha256 5149edfc9376f6d45cb95f7c914cd6b6dd205e5ef404298e655aa685a5527831 | test_extractall_default_filter 742-754

Predecessor (own arm only): jobs/D-M11-A/control/normal_research-v1/report.md (untrusted input, re-verified against primaries above).
Brief/manifest: cases/D-M11-A/inputs/brief.md, sources.json.
