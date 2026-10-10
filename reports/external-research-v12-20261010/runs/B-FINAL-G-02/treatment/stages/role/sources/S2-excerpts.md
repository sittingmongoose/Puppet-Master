# S2 evidence — Git clone

URL: https://git-scm.com/docs/git-clone
Version/scope: Live unpinned manual; target Git 2.43 (option/version applicability check not performed)
Retrieved at: 2026-10-10T05:21Z (UTC; role-worker web_fetch, 200 OK)
Local locator aid: corpus/S2.md (retrieved 2026-10-10T03:54:10Z by setup worker)

## Verbatim excerpts (used in final-section.md)

--sparse (sparse checkout at clone; toplevel files initially):
> Employ a sparse-checkout, with only files in the toplevel directory initially being present. The git-sparse-checkout[1] command can be used to grow the working directory as needed.

--filter (partial clone; object transfer, not working-tree scoping):
> Use the partial clone feature and request that the server sends a subset of reachable objects according to a given object filter.

--filter=blob:none (blobs until needed; later fetching possible):
> For example, `--filter=blob:none` will filter out all blobs (file contents) until needed by Git.

--depth (shallow; truncated history):
> Create a *shallow* clone with a history truncated to the specified number of commits. Implies `--single-branch` unless `--no-single-branch` is given to fetch the histories near the tips of all branches.
