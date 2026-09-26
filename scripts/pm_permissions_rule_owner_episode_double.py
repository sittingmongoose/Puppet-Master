#!/usr/bin/env python3
"""Static pinned owner blocked-episode test double for the Permissions companion.

Static test evidence only, **never a native producer**. This module pins the
owner's *current* blocked episode per static selection scenario so the
permission-blocked episode action join has an independent original to compare a
selection's claimed episode against. It deliberately:

* never reads, imports or derives anything from the fixture pack, so a fixture
  mutation cannot move the pinned original;
* never reads the record under test, so a selection can never witness itself;
* pins the current episode, the approval scope and the ordered
  ``allowed_action_ids[]`` the owner's runtime blocked payload exposes, exactly
  as ``Plans/human-in-the-loop.md`` keys the episode
  (``run_id``, ``node_id``, ``blocked_sequence``, ``attempt_id?``) and
  ``Plans/Permissions_System.md`` Section 6 orders the permission-blocked
  recovery surfaces;
* reports no read at all for a scenario it does not pin, so the companion reports
  ``join_episode_original_unproven`` instead of accepting the claim.

Nothing here proves native episode selection, a runtime blocked episode, an
approval decision, a dispatch or an EventRecord: a real producer must supply its
own authenticated episode read through the companion's documented callback.
"""

from __future__ import annotations

from typing import Any, Callable, Mapping

# Static test evidence, never a native producer.
NATIVE_PRODUCER = False
WITNESS_PROVENANCE = "static_pinned_owner_blocked_episode_test_double"

# The owner's own blocked episode for the static permission ask: the full
# Section 6 permission-blocked action set, as applicable to this ask.
EPISODE_PERMISSION_ASK_FULL: dict[str, Any] = {
    "record_kind": "permissions_blocked_episode",
    "run_id": "run:2026-09-26:permissions:0001",
    "node_id": "node:permissions:ask:0001",
    "blocked_sequence": 7,
    "attempt_id": "attempt:0001:02",
    "approval_scope_key": "scope:lane:release:0002",
    "blocked_family": "blocked_approval",
    "blocked_reason_code": "approval_required",
    "allowed_action_ids": [
        "deny",
        "approve_once",
        "approve_for_session",
        "approve_always",
        "open_permissions",
    ],
    "native_handler_claim": False,
    "native_episode_selection_proven": False,
}

# A second owner ask with the minimal applicable set: Section 6 exposes those
# actions "as applicable", so an episode may offer a subset.
EPISODE_PERMISSION_ASK_MINIMAL: dict[str, Any] = {
    **EPISODE_PERMISSION_ASK_FULL,
    "run_id": "run:2026-09-26:permissions:0002",
    "node_id": "node:permissions:ask:0002",
    "blocked_sequence": 3,
    "attempt_id": "attempt:0002:01",
    "allowed_action_ids": ["deny", "approve_once"],
}

# One pinned current episode per static selection scenario. A scenario that is
# not pinned here has no independent owner episode, and the companion must report
# that selection explicitly unproven rather than accepting its own claim.
PINNED_CURRENT_EPISODES: dict[str, dict[str, Any]] = {
    "select:approve_once:0001": EPISODE_PERMISSION_ASK_FULL,
    "select:approve_once:minimal:0001": EPISODE_PERMISSION_ASK_MINIMAL,
    "select:approve_for_session:0001": EPISODE_PERMISSION_ASK_FULL,
    "select:approve_always:0001": EPISODE_PERMISSION_ASK_FULL,
    "select:deny:0001": EPISODE_PERMISSION_ASK_FULL,
    "select:open_permissions:0001": EPISODE_PERMISSION_ASK_FULL,
    "select:stale:0001": EPISODE_PERMISSION_ASK_FULL,
    "select:not_advertised:0001": EPISODE_PERMISSION_ASK_MINIMAL,
}


def episode_read(selection_id: Any) -> Callable[[], Mapping[str, Any]] | None:
    """Return the pinned current-episode reader for one static scenario.

    ``None`` means this scenario has no independent owner episode: the caller must
    forward the absence so the companion reports the selection unproven instead of
    treating the claimed episode as authority.
    """

    episode = PINNED_CURRENT_EPISODES.get(selection_id) if isinstance(selection_id, str) else None
    if episode is None:
        return None

    def read() -> Mapping[str, Any]:
        return episode

    return read


def witness_for(value: Any) -> dict[str, Any]:
    """Static episode witness bundle for one candidate record.

    Only a permission-blocked episode selection gets a read, and only for a
    scenario this double pins; every other record gets an empty bundle so the
    rule-command joins are untouched.
    """

    if not isinstance(value, Mapping) or value.get("record_kind") != "permissions_blocked_episode_selection":
        return {}
    return {"owner_episode_read": episode_read(value.get("selection_id"))}


__all__ = [
    "EPISODE_PERMISSION_ASK_FULL",
    "EPISODE_PERMISSION_ASK_MINIMAL",
    "NATIVE_PRODUCER",
    "PINNED_CURRENT_EPISODES",
    "WITNESS_PROVENANCE",
    "episode_read",
    "witness_for",
]
