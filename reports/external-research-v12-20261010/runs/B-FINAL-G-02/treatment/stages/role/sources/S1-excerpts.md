# S1 evidence — Git sparse-checkout

URL: https://git-scm.com/docs/git-sparse-checkout
Version/scope: Live manual; target Git 2.43 (history check not performed)
Retrieved at: 2026-10-10T05:21Z (UTC; role-worker web_fetch, 200 OK)
Local locator aid: corpus/S1.md (retrieved 2026-10-10T03:54:10Z by setup worker)

## Verbatim excerpts (used in final-section.md)

DESCRIPTION:
> This command is used to create sparse checkouts, which change the working tree from having all tracked files present to only having a subset of those files.

set (directory input + sibling inclusion):
> By default, the input list is considered a list of directories ... Note that all files under the specified directories (at any depth) will be included in the sparse checkout, as well as files that are siblings of either the given directory or any of its ancestors (see *CONE PATTERN SET* below for more details).

set --sparse-index (optional, default off, performance):
> Use the `--`[`no-`]`sparse-index` option to use a sparse index (the default is to not use it). A sparse index reduces the size of the index to be more closely aligned with your sparse-checkout definition. This can have significant performance advantages for commands such as `git` `status` or `git` `add`. This feature is still experimental.

reapply (extra materialized paths; changed/conflicted files):
> Reapply the sparsity pattern rules to paths in the working tree. Commands like merge or rebase can materialize paths to do their work (e.g. in order to show you a conflict), and other sparse-checkout commands might fail to sparsify an individual file (e.g. because it has unstaged changes or conflicts).

disable (restore full tree):
> Disable the `core.sparseCheckout` config setting, and restore the working directory to include all files.

INTERNALS — CONE MODE HANDLING (parent/toplevel inclusion):
> The "cone mode", which is the default, lets you specify only what directories to include. For any directory specified, all paths below that directory will be included, and any paths immediately under leading directories (including the toplevel directory) will also be included.

INTERNALS — CONE PATTERN SET (parent pattern type):
> In cone mode, only directories are accepted, but they are translated into the same gitignore-style patterns used in the full pattern set. ... 2. **Parent:** All files immediately inside a directory are included.

EXAMPLES (set; reapply after non-respecting updates):
> Change to a sparse checkout with all files (at any depth) under MY/DIR1/ and SUB/DIR2/ present in the working copy (plus all files immediately under MY/ and SUB/ and the toplevel directory).
> It is possible for commands to update the working tree in a way that does not respect the selected sparsity directories. ... This command reapplies the existing sparse directory specifications to make the working directory match.
