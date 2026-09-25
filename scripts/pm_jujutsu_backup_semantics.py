"""Shared finite JJI-008 rules for original and context-successor records."""


def jj_backup_pointer_failures(value):
    if not isinstance(value.get('layout_profile'), str):
        return []
    required = {
        'colocated': {'jj_repo_pointer', 'store_git_target', 'git_commondir'},
        'non_colocated': {'jj_repo_pointer', 'store_git_target'},
        'shared_multi_workspace': {'jj_repo_pointer', 'store_git_target', 'git_commondir', 'workspace_gitdir_link'},
    }.get(value.get('layout_profile'))
    pointers = value.get('pointer_resolutions')
    if not isinstance(pointers, list):
        return []
    hops, present = {}, set()
    for pointer in pointers:
        if not isinstance(pointer, dict) or not isinstance(pointer.get('pointer_kind'), str):
            continue
        kind = pointer['pointer_kind']
        present.add(kind)
        index = pointer.get('hop_index')
        if isinstance(index, int) and not isinstance(index, bool):
            hops.setdefault(kind, []).append(index)
    errors = []
    if required is not None and not required.issubset(present):
        errors.append('jujutsu_pointer_resolution_incomplete_for_layout')
    if any(sorted(indices) != list(range(len(indices))) for indices in hops.values()):
        errors.append('jujutsu_pointer_resolution_incomplete_for_layout')
    return errors


def jj_backup_verification_failures(value):
    """Pointer completeness plus unchanged operation-head set; no native proof."""
    errors = jj_backup_pointer_failures(value)
    before, after = value.get('operation_head_refs'), value.get('operation_heads_after_refs')
    if isinstance(before, list) and isinstance(after, list):
        if {x for x in before if isinstance(x, str)} != {x for x in after if isinstance(x, str)}:
            errors.append('jujutsu_operation_heads_changed_during_read_only_verification')
    return errors
