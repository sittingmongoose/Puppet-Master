# D-M03-A: Recursive pathlib search at one release

A CPython 3.12.3 file inventory wants Path.rglob('*.csv') beneath one local root containing ordinary files, dotfiles, symlinked directories, a broken link, and an unreadable directory. Determine actual traversal and error behavior and identify conditions that would affect the promised inventory completeness. Read-only source inspection only.

This is one bounded diagnostic module. Address these six material obligations; do not produce a full application plan:

1. Trace rglob into its selectors and directory scanning path.
2. Distinguish matching dotfiles from recursive symlink traversal.
3. Separate broken links from followed directory links.
4. State platform or case-sensitivity conditions.
5. Identify how access errors can affect completeness.
6. Propose discriminating tests without claiming they ran.

Sources mode: FROZEN_PUBLIC_PRIMARY_CORPUS. Both arms receive exact same listed frozen source bytes and source identity metadata. Additional primary-source checks are allowed under the same access policy and budget; record URLs, versions, capture hashes, and limitations. Large repositories/clones and arbitrary installers are not needed. Mutable docs are capture-pinned; released implementation files govern claims about the selected release.

Deliver one complete source-linked bounded recommendation with conditions, uncertainty, and proposed checks. Soft ceiling: 1100 words / eight material findings. A soft ceiling does not authorize omitting a governing condition. Supplied drafts, if any, are legitimate untrusted test inputs, not truth or evaluator judgments. Do not execute downloaded project code or installers. Only M06's later root-qualified tiny candidate witness may execute; this is outside designer work.
