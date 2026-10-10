# S1 — Python pathlib

- URL: https://docs.python.org/3.13/library/pathlib.html
- Version/scope: Python 3.13.16 documentation; target CPython 3.13.
- Retrieved: 2026-10-10 during 04:19 UTC, minute precision; exact per-call time unavailable.
- Operation: public primary documentation page inspected with web.open and web.find.
- Locators: `Path.glob` / `Path.rglob` (including 3.13 change notes); “Comparison to the glob module”; “Pattern language”.

## Bounded evidence

The `Path.rglob` documentation says results have no particular order. It describes the default `recurse_symlinks=False` behavior as following symlinks except while expanding `**`; the comparison section says `**` components do not follow symlinks by default and pathlib dot-prefixed names are not special. For 3.13, OSError raised during scanning is suppressed, including PermissionError when accessing directories without read permission; the change note distinguishes previous releases. The directory iterator documentation leaves inclusion of entries changed during iteration unspecified. The pattern-language section warns recursive `**` visits every directory and large trees may take a long time.

Applicability: these are library-contract statements for pathlib globbing. The conclusion that a suppressed denied scan can omit descendants is an inference from suppression, not a quoted completeness guarantee. No point-in-time or sub-100-ms guarantee is stated.
