# S1 excerpts — pathlib (bounded)

URL: https://docs.python.org/3.13/library/pathlib.html
Version: Python 3.13.16 documentation; target CPython 3.13
Retrieved: 2026-10-10T04:19:23Z via AUTHORIZED_PROVIDER_INSTANCE.web_fetch, status 200 OK

## Path.glob / Path.rglob — order

> The paths are returned in no particular order. If you need a specific order, sort the results.

Applies to both methods. Examples wrap calls in `sorted(...)`.

## Path.glob — yielding

> Glob the given relative pattern in the directory represented by this path, yielding all matching files (of any kind)

## Path.rglob — definition

> Glob the given relative pattern recursively. This is like calling `Path.glob()` with `**/` added in front of the pattern.

## recurse_symlinks default

> By default, or when the `recurse_symlinks` keyword-only argument is set to `False`, this method follows symlinks except when expanding `**` wildcards. Set `recurse_symlinks` to `True` to always follow symlinks.

## Suppression (both methods)

> Any `OSError` exceptions raised from scanning the filesystem are suppressed. This includes `PermissionError` when accessing directories without read permission.

> Changed in version 3.13: Any `OSError` exceptions raised from scanning the filesystem are suppressed. In previous versions, such exceptions are suppressed in many cases, but not all.

## Comparison to glob — dots, **, symlinks

> Files beginning with a dot are not special in pathlib. This is like passing `include_hidden=True` to `glob.glob()`.

> `**` pattern components are always recursive in pathlib.

> `**` pattern components do not follow symlinks by default in pathlib.

## iterdir — contrast (raise policy, not glob policy)

> The children are yielded in arbitrary order, and the special entries `.` and `..` are not included. If a file is removed from or added to the directory after creating the iterator, it is unspecified whether a path object for that file is included.

> If the path is not a directory or otherwise inaccessible, `OSError` is raised.
