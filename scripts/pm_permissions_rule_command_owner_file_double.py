#!/usr/bin/env python3
"""Static pinned owner-original test double for the Permissions rule companion.

**STATIC TEST EVIDENCE ONLY. This module is not a native producer.** It proves no
native effect: it is a separate, pinned stand-in for the owner's own reads at the
atomic write boundary, so that a static fixture gate can exercise the conditional
laws

* the bound snapshot's ``declared_loaded_config_hash`` must be the owner's own
  current/pre-rename file hash (``owner_file_read``),
* the bound snapshot's declared rule projection must be the owner's own selected
  original identity/value/scope/order (``owner_selected_rules_read``), and
* a declared post-write hash must equal an independent owner read-back
  (``owner_post_write_read``),

without claiming that any real file, temp file, fsync, rename, digest, handler,
permission decision, stored rule row or EventRecord exists.

Why a separate artifact: a trusted owner original must not be a field of the
binding it is supposed to check. A gate that took the witness from the bound
fixture's own ``owner_snapshot.ordered_rules`` or ``declared_loaded_config_hash``
would prove nothing, because the same record would supply both the observation
and its own authority, and a co-mutated original and result would move together.
These pins live outside the fixture document, are never read or derived from it,
and stay fixed while a fixture mutates; that is what makes the co-mutation
negatives detectable.

The pinned file-hash values are opaque tokens, deliberately not digests: the
cited owner text (``Plans/Permissions_System.md``, "TOML Persistence Failure And
Atomicity Rules") compares ``loaded_config_hash`` with the current file hash
before rename and chooses no digest, encoding or serialization in this companion,
so no hash grammar is asserted here or in the companion.
"""

from __future__ import annotations

from typing import Any, Callable, Mapping, Sequence

# Static test evidence, never a native producer.
NATIVE_PRODUCER = False
WITNESS_PROVENANCE = "static_pinned_owner_original_test_double"

# Pinned owner-file generations of the static fixture scenario.
PINNED_CURRENT_OWNER_FILE_HASH = "owner-file-hash:static-test-double:generation-1:current"
PINNED_POST_WRITE_OWNER_FILE_HASH = "owner-file-hash:static-test-double:generation-2:post-write"

OWNER_FILE_HASH_FIELD = "loaded_config_hash"

# The owner's own selected rule projection for the project layer: one wildcard
# default, one command rule, one narrower lane rule and one directory rule, in
# evaluation order.
PROJECT_LAYER_RULES: tuple[dict[str, Any], ...] = (
    {
        "rule_id": "11111111-1111-4111-8111-000000000001",
        "tool_pattern": "*",
        "action": "ask",
        "scope_key": "project",
        "pattern_class": "tool_pattern",
        "created_at": "2026-09-20T10:00:00Z",
        "created_by_thread_id": "thread:settings-permissions:0001",
    },
    {
        "rule_id": "11111111-1111-4111-8111-000000000002",
        "tool_pattern": "git *",
        "action": "allow",
        "scope_key": "project",
        "pattern_class": "tool_pattern",
        "created_at": "2026-09-20T10:00:00Z",
        "created_by_thread_id": "thread:settings-permissions:0001",
    },
    {
        "rule_id": "11111111-1111-4111-8111-000000000003",
        "tool_pattern": "rm *",
        "action": "deny",
        "scope_key": "lane:release",
        "pattern_class": "tool_pattern",
        "created_at": "2026-09-20T10:00:00Z",
        "created_by_thread_id": "thread:settings-permissions:0001",
    },
    {
        "rule_id": "11111111-1111-4111-8111-000000000004",
        "tool_pattern": "~/.cargo/**",
        "action": "allow",
        "scope_key": "project",
        "pattern_class": "external_directory_pattern",
        "created_at": "2026-09-20T10:00:00Z",
        "created_by_thread_id": "thread:settings-permissions:0001",
    },
)

# The owner's own global-layer rule set for the global scenario.
GLOBAL_LAYER_RULES: tuple[dict[str, Any], ...] = (
    {
        "rule_id": "22222222-2222-4222-8222-000000000001",
        "tool_pattern": "webfetch",
        "action": "ask",
        "scope_key": "global",
        "pattern_class": "tool_pattern",
        "created_at": "2026-09-20T10:00:00Z",
        "created_by_thread_id": "thread:settings-permissions:0001",
    },
)


def project_rules_above_prior_cap() -> tuple[dict[str, Any], ...]:
    """The owner's own project-layer set with seventy rules (no owner rule cap).

    The cited owner text names no rule-count maximum, so the static original is
    built larger than the correction's removed 64-rule cap: sixty-nine project
    rules followed by one narrower lane rule.
    """

    rules: list[dict[str, Any]] = []
    for index in range(69):
        rules.append(
            {
                "rule_id": f"33333333-3333-4333-8333-{index:012d}",
                "tool_pattern": f"tool-{index:03d} *",
                "action": ("allow", "ask", "deny")[index % 3],
                "scope_key": "project",
                "pattern_class": "tool_pattern",
                "created_at": "2026-09-20T10:00:00Z",
                "created_by_thread_id": "thread:settings-permissions:0001",
            }
        )
    rules.append(
        {
            "rule_id": "33333333-3333-4333-8333-999999999999",
            "tool_pattern": "rm *",
            "action": "deny",
            "scope_key": "lane:release",
            "pattern_class": "tool_pattern",
            "created_at": "2026-09-20T10:00:00Z",
            "created_by_thread_id": "thread:settings-permissions:0001",
        }
    )
    return tuple(rules)


PROJECT_RULES_ABOVE_PRIOR_CAP = project_rules_above_prior_cap()

# One pinned owner-selected original per static binding scenario. A scenario that
# is not pinned here has no independent owner original, and the companion must
# report that binding explicitly unproven rather than accepting it.
PINNED_SELECTED_ORIGINALS: dict[str, tuple[dict[str, Any], ...]] = {
    "bind:create:0001": PROJECT_LAYER_RULES,
    "bind:create:0002": GLOBAL_LAYER_RULES,
    "bind:create:0003": PROJECT_LAYER_RULES,
    "bind:create:0004": PROJECT_RULES_ABOVE_PRIOR_CAP,
    "bind:update:0001": PROJECT_LAYER_RULES,
    "bind:reorder:0001": PROJECT_LAYER_RULES,
    "bind:reorder:0002": PROJECT_LAYER_RULES,
    "bind:reorder:0003": PROJECT_LAYER_RULES,
    "bind:reorder:0004": PROJECT_LAYER_RULES,
    "bind:reorder:0005": PROJECT_LAYER_RULES,
    "bind:delete:0001": PROJECT_LAYER_RULES,
    "bind:validate:0001": PROJECT_LAYER_RULES,
    "bind:validate:0002": PROJECT_LAYER_RULES,
    "bind:conflict:0001": PROJECT_LAYER_RULES,
    "bind:blocked:0001": PROJECT_LAYER_RULES,
    "bind:blocked:0002": PROJECT_LAYER_RULES,
    "bind:unknown:0001": PROJECT_LAYER_RULES,
    "bind:notwritable:0001": PROJECT_LAYER_RULES,
}


def owner_file_read() -> dict[str, Any]:
    """Stand-in for the owner's own current/pre-rename file read."""

    return {OWNER_FILE_HASH_FIELD: PINNED_CURRENT_OWNER_FILE_HASH}


def owner_post_write_read() -> dict[str, Any]:
    """Stand-in for the owner's own post-write read-back."""

    return {OWNER_FILE_HASH_FIELD: PINNED_POST_WRITE_OWNER_FILE_HASH}


def owner_selected_rules_read(binding_id: Any) -> Callable[[], Sequence[Mapping[str, Any]]] | None:
    """Return the pinned owner-selected original reader for one static scenario.

    ``None`` means this scenario has no independent owner-selected original: the
    caller must forward the absence so the companion reports the binding
    unproven instead of treating the embedded snapshot as authority.
    """

    original = PINNED_SELECTED_ORIGINALS.get(binding_id) if isinstance(binding_id, str) else None
    if original is None:
        return None

    def read() -> Sequence[Mapping[str, Any]]:
        return original

    return read


def witness_for(value: Any) -> dict[str, Any]:
    """Static witness bundle for one candidate record (static test evidence only).

    The file-hash reads pin the static scenario's owner-file generations. The
    selected-rule read is supplied only for a binding whose scenario is pinned to
    an independent owner original; a binding whose original is not pinned gets
    ``owner_selected_rules_read=None`` so the missing original surfaces as an
    explicit unproven law rather than as an acceptance.
    """

    binding_id = value.get("binding_id") if isinstance(value, Mapping) else None
    return {
        "owner_file_read": owner_file_read,
        "owner_post_write_read": owner_post_write_read,
        "owner_selected_rules_read": owner_selected_rules_read(binding_id),
    }


__all__ = [
    "GLOBAL_LAYER_RULES",
    "NATIVE_PRODUCER",
    "OWNER_FILE_HASH_FIELD",
    "PINNED_CURRENT_OWNER_FILE_HASH",
    "PINNED_POST_WRITE_OWNER_FILE_HASH",
    "PINNED_SELECTED_ORIGINALS",
    "PROJECT_LAYER_RULES",
    "PROJECT_RULES_ABOVE_PRIOR_CAP",
    "WITNESS_PROVENANCE",
    "owner_file_read",
    "owner_post_write_read",
    "owner_selected_rules_read",
    "project_rules_above_prior_cap",
    "witness_for",
]
