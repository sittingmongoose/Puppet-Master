# Independently retrieved primary evidence

Public primary sources retrieved by HTTPS. Files are data; no downloaded code was run. Source retrieval UTC, HTTP status, SHA-256 and exact URL are in [primary-retrievals.json](../primary-retrievals.json) and [source-map.json](../source-map.json).

## P1 — Path.glob, Path.rglob, Path.iterdir; pattern language; comparison to glob

Version: Python 3.13.16 documentation; CPython 3.13 target. Retrieved 2026-10-10T04:22:58.774793+00:00.
SHA-256: `90048ef5d8c01a3519e4d3c0f0fcfce68de2740b8da2563f2a3212d042286f8f`.
[Saved primary bytes](P1-pathlib-3.13.html); [primary URL](https://docs.python.org/3.13/library/pathlib.html).

- [Exact primary locator](https://docs.python.org/3.13/library/pathlib.html#pathlib.Path.glob)
- [Exact primary locator](https://docs.python.org/3.13/library/pathlib.html#pathlib.Path.rglob)
- [Exact primary locator](https://docs.python.org/3.13/library/pathlib.html#pathlib.Path.iterdir)
- [Exact primary locator](https://docs.python.org/3.13/library/pathlib.html#pattern-language)
- [Exact primary locator](https://docs.python.org/3.13/library/pathlib.html#comparison-to-the-glob-module)
- [Saved documentation section](P1-pathlib-3.13.html#pathlib.Path.glob)
- [Saved documentation section](P1-pathlib-3.13.html#pathlib.Path.rglob)
- [Saved documentation section](P1-pathlib-3.13.html#pathlib.Path.iterdir)
- [Saved documentation section](P1-pathlib-3.13.html#pattern-language)
- [Saved documentation section](P1-pathlib-3.13.html#comparison-to-the-glob-module)

## P2 — glob module introduction and glob.glob; include_hidden=False; recursive=False unless specified

Version: Python 3.13.16 documentation. Retrieved 2026-10-10T04:22:58.668378+00:00.
SHA-256: `12ed291efccfecb08f58ec1644131c8ec720660d744c87f43aaef1bf22abe0e6`.
[Saved primary bytes](P2-glob-3.13.html); [primary URL](https://docs.python.org/3.13/library/glob.html).

- [Exact primary locator](https://docs.python.org/3.13/library/glob.html#module-glob)
- [Exact primary locator](https://docs.python.org/3.13/library/glob.html#glob.glob)
- [Saved documentation section](P2-glob-3.13.html#module-glob)
- [Saved documentation section](P2-glob-3.13.html#glob.glob)

## P3 — os.path.expanduser; POSIX home resolution and expansion failure

Version: Python 3.13.16 documentation. Retrieved 2026-10-10T04:22:58.799291+00:00.
SHA-256: `7c55db68f3bebc494160fac2a88da7d9b43f50be714e91266f4856172ce9c05b`.
[Saved primary bytes](P3-os-path-3.13.html); [primary URL](https://docs.python.org/3.13/library/os.path.html).

- [Exact primary locator](https://docs.python.org/3.13/library/os.path.html#os.path.expanduser)
- [Saved documentation section](P3-os-path-3.13.html#os.path.expanduser)

## P5 — _Globber wildcard/recursive selectors and _StringGlobber; shared implementation used by concrete Path

Version: CPython v3.13.0 immutable release tag. Retrieved 2026-10-10T04:22:58.728594+00:00.
SHA-256: `3399f242a9bfb4e0b2b8bbbcdc0231487e453a861f4a4ca109c2a560e05698e8`.
[Saved primary bytes](P5-glob-v3.13.0.txt); [primary URL](https://raw.githubusercontent.com/python/cpython/v3.13.0/Lib/glob.py).

- [Exact primary locator](https://github.com/python/cpython/blob/v3.13.0/Lib/glob.py#L414-L446)
- [Exact primary locator](https://github.com/python/cpython/blob/v3.13.0/Lib/glob.py#L448-L510)
- [Exact primary locator](https://github.com/python/cpython/blob/v3.13.0/Lib/glob.py#L527-L545)

## P4 — pathlib package import surface; implementation lead only

Version: CPython v3.13.0 immutable release tag. Retrieved 2026-10-10T04:23:12.517800+00:00.
SHA-256: `07921047886282e3d324acf95f7d9f840faa806664ee7007e7333a7df4cdcaf6`.
[Saved primary bytes](P4-pathlib-v3.13.0.txt); [primary URL](https://raw.githubusercontent.com/python/cpython/v3.13.0/Lib/pathlib/__init__.py).

- [Exact primary locator](https://github.com/python/cpython/blob/v3.13.0/Lib/pathlib/__init__.py)

## P6 — concrete pathlib.Path glob/rglob, distinct from abstract defaults

Version: CPython v3.13.0 immutable release tag. Retrieved 2026-10-10T04:23:51.385290+00:00.
SHA-256: `cca3cb1978b8ffc85c1a1cb29d84bd40f2bc174472bed1e1f2decf650951c0cf`.
[Saved primary bytes](P6-pathlib-local-v3.13.0.txt); [primary URL](https://raw.githubusercontent.com/python/cpython/v3.13.0/Lib/pathlib/_local.py).

- [Exact primary locator](https://github.com/python/cpython/blob/v3.13.0/Lib/pathlib/_local.py#L581-L620)

## P7 — PathBase._glob_selector maps recurse_symlinks flag; abstract public defaults do not define concrete Path defaults

Version: CPython v3.13.0 immutable release tag. Retrieved 2026-10-10T04:24:29.874180+00:00.
SHA-256: `75e6bc728013d11446126d535f92b8907fb6dae7404df3d0268ac7b6865a2090`.
[Saved primary bytes](P7-pathlib-abc-v3.13.0.txt); [primary URL](https://raw.githubusercontent.com/python/cpython/v3.13.0/Lib/pathlib/_abc.py).

- [Exact primary locator](https://github.com/python/cpython/blob/v3.13.0/Lib/pathlib/_abc.py#L662-L673)

One initial request to the old pathlib.py location returned HTTP 404; the package __init__.py location succeeded and led to _local.py/_abc.py. This is recorded as a retrieval failure followed by a corrected source location, not as missing governing documentation.

The Python documentation pages state PSF License v2; retrieved code is from the Python/cpython project. Their retained notices accompany the primary bytes.
