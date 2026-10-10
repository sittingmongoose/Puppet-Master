# S2 excerpts — glob (bounded)

URL: https://docs.python.org/3.13/library/glob.html
Version: Python 3.13.16 documentation; target CPython 3.13
Retrieved: 2026-10-10T04:19:35Z via AUTHORIZED_PROVIDER_INSTANCE.web_fetch, status 200 OK

## No tilde expansion, no subshell

> The `glob` module finds pathnames using pattern matching rules similar to the Unix shell. No tilde expansion is done, but `*`, `?`, and character ranges expressed with `[]` will be correctly matched. This is done by using the `os.scandir()` and `fnmatch.fnmatch()` functions in concert, and not by actually invoking a subshell.

> For tilde and shell variable expansion, use `os.path.expanduser()` and `os.path.expandvars()`.

## Order

> The pathnames are returned in no particular order. If you need a specific order, sort the results.

> Whether or not the results are sorted depends on the file system.

## Dotfiles default

> By default, files beginning with a dot (`.`) can only be matched by patterns that also start with a dot, unlike `fnmatch.fnmatch()` or `pathlib.Path.glob()`.

> If the directory contains files starting with `.` they won't be matched by default.

> If `include_hidden` is true, wildcards can match path segments that begin with a dot (`.`).

> Changed in version 3.11: Added the `include_hidden` parameter.

## Concurrent change unspecified

> If a file that satisfies conditions is removed or added during the call of this function, whether a path name for that file will be included is unspecified.

## Recursive **, cost, duplicates

> If `recursive` is true, the pattern `**` will match any files and zero or more directories, subdirectories and symbolic links to directories.

> Using the `**` pattern in large directory trees may consume an inordinate amount of time.

> This function may return duplicate path names if `pathname` contains multiple `**` patterns and `recursive` is true.

## Suppression

> Any `OSError` exceptions raised from scanning the filesystem are suppressed. This includes `PermissionError` when accessing directories without read permission.
