"""PWIZ-023/F3-521 static joins; no runtime, owner issuance or storage authority."""
from __future__ import annotations

from typing import Any


# Current authored phase order, not a new story. The comfort introduction is optional.
CHAPTERS = (
    ("chat_teacher", ("comfort_intro", "open_chat", "select_teacher", "send_question", "answer_stream", "same_answer_eli5")),
    ("workspace", ("workspace_orientation", "move_or_dock_chat", "widget_action")),
    ("planning_wizard", ("open_planning", "book_club_goal", "three_outcomes", "access_answer", "review", "answer_edit", "consequence_changed", "completion_boundary")),
)
# Stable fixture predicate refs name accepted required practices, never new commands.
PRACTICE = {
    "open_chat": "predicate:chat:opened",
    "select_teacher": "predicate:chat:teacher-selected",
    "send_question": "predicate:chat:question-sent",
    "answer_stream": "predicate:chat:answer-streamed",
    "same_answer_eli5": "predicate:chat:same-answer-eli5",
    "move_or_dock_chat": "predicate:workspace:chat-moved",
    "widget_action": "predicate:workspace:widget-added",
    "open_planning": "predicate:planning:opened",
    "book_club_goal": "predicate:planning:goal-submitted",
    "access_answer": "predicate:planning:access-answer",
    "answer_edit": "predicate:planning:answer-edited",
    "consequence_changed": "predicate:planning:consequence-observed",
}
CORRELATION = ("action_id", "command_instance_id", "project_id", "tour_session_id", "actor_ref", "idempotency_key", "expected_revision", "expected_currentness_sha256", "step", "step_id", "target_surface_id", "target_control_id")
SPECIALIZED = {
    "skip": "pm.guided_tour.terminal_result.v3",
    "finish": "pm.guided_tour.terminal_result.v3",
    "focus_route": "pm.guided_tour.focus_route_result.v1",
}
KNOWN_DEFINITIONS = frozenset({
    "guided_tour_storyboard", "guided_tour_session", "guided_tour_checkpoint", "guided_tour_resume_result",
    "guided_tour_practice_contract", "guided_tour_action_request", "guided_tour_focus_route_result",
    "guided_tour_workspace_progression", "guided_tour_planning_progression", "guided_tour_chat_teacher_progression",
    "guided_tour_teacher_copy_contract", "guided_tour_teacher_library_contract", "guided_tour_presentation_contract",
    "guided_tour_terminal_result", "guided_tour_action_result", "guided_tour_action_exchange",
})


def parts(value):
    request, context, result = value["request"], value["context"], value["result"]
    return request, context, result, context["before"], result["state_after"], request["action_id"].rsplit(".", 1)[1]


def successful(result):
    return result["status"] in {"applied", "no_change"}


def ordered_phases(context):
    return [(chapter, phase) for chapter, phases in CHAPTERS for phase in phases if context["optional_intro_included"] or phase != "comfort_intro"]


def correlation(value):
    q, c, r, before, after, action = parts(value)
    if any(q[k] != r["correlation"][k] for k in CORRELATION):
        return False
    if before and any(before[k] != c[v] for k, v in (("project_id", "project_id"), ("tour_session_id", "tour_session_id"), ("revision", "revision"), ("currentness_sha256", "currentness_sha256"))):
        return False
    if after and after["project_id"] != c["project_id"]:
        return False
    if after and action != "replay" and after["tour_session_id"] != c["tour_session_id"]:
        return False
    d = r["detail"]
    if not d:
        return not successful(r)
    expected = SPECIALIZED.get(action)
    if action == "resume":
        expected = "pm.guided_tour.resume_result.v3" if q["resume_source"] == "checkpoint" else None
        if expected is None and d.get("kind") != "live_resume":
            return False
    elif expected is None and (d.get("kind") != "local" or d.get("action_id") != q["action_id"]):
        return False
    if expected and d.get("schema_id") != expected:
        return False
    if d.get("action_id", q["action_id"]) != q["action_id"]:
        return False
    if any(k in d and d[k] != q[k] for k in ("tour_session_id", "project_id")):
        return False
    if action == "focus_route":
        if d["route_target"] != q["route_target"] or d["return_focus_id"] != q["return_focus_id"]:
            return False
        if successful(r) != (d["status"] == "applied"):
            return False
    if action in {"skip", "finish"}:
        if successful(r) != (d["status"] in {"skipped", "completed"}):
            return False
    if action == "resume" and q["resume_source"] == "checkpoint":
        if successful(r) != (d["status"] == "resumed"):
            return False
    nested_error = d.get("error_code") or d.get("restoration", {}).get("error_code")
    return not nested_error or bool(r["error"] and r["error"]["code"] == nested_error)


def currentness(value):
    q, c, r, before, after, action = parts(value)
    expected_error = None
    if q["project_id"] != c["project_id"]:
        expected_error = "project_mismatch"
    elif q["tour_session_id"] != c["tour_session_id"]:
        expected_error = "session_missing"
    elif q["expected_revision"] != c["revision"]:
        expected_error = "stale_revision"
    elif q["expected_currentness_sha256"] != c["currentness_sha256"]:
        expected_error = "stale_currentness"
    elif q["actor_ref"] != c["actor_ref"]:
        expected_error = "invalid_transition"
    elif (q["target_surface_id"], q["target_control_id"]) != (c["target_surface_id"], c["target_control_id"]):
        expected_error = "target_missing"
    elif before and (q["step"], q["step_id"]) != (before["step"], before["step_id"]):
        expected_error = "invalid_transition"
    if expected_error:
        return (not successful(r) and r["error"]["code"] == expected_error and
                not r["effect_boundary"]["owner_dispatches"] and after == before)
    if successful(r) and action not in {"skip", "pause"}:
        if not c["target_available"] or not c["owner_available"] or not c["snapshots_current"]:
            return False
    if successful(r) and action in {"show_me", "toggle_eli5", "finish", "skip"} and not c["owner_permission_granted"]:
        return False
    if r["availability"]["enabled"] != (r["availability"]["reason_code"] is None):
        return False
    if successful(r) and not r["availability"]["enabled"]:
        return False
    if action == "skip" and not r["availability"]["enabled"]:
        return False
    if before and after and action != "replay":
        if after["revision"] < before["revision"]:
            return False
        if r["status"] == "no_change" and after != before:
            return False
        if after != before and after["revision"] <= before["revision"]:
            return False
    if not successful(r) and before and after:
        if after["completed_predicate_refs"] != before["completed_predicate_refs"] or after["step_id"] != before["step_id"]:
            return False
    return True


def initial_state(value):
    q, c, r, before, after, action = parts(value)
    if action not in {"start", "replay"} or not successful(r):
        return True
    first_phase = "comfort_intro" if c["optional_intro_included"] else "open_chat"
    if (after["step"], after["phase"], after["status"], after["revision"]) != ("chat_teacher", first_phase, "first_launch", 1):
        return False
    if after["teacher_practice"] is not None or after["checkpoint_ref"] is not None or after["completed_predicate_refs"] or after["owner_observations"]:
        return False
    if after["layout_disposition"] != "pending" or after["captured_state"] != c["original_capture"]:
        return False
    if not c["snapshots_current"] or r["detail"]["captured_state_ref"] != c["captured_state_ref"]:
        return False
    if r["effect_boundary"]["owner_dispatches"] or r["effect_boundary"]["owner_observations"]:
        return False
    return action != "start" or (before is None and c["revision"] == 0)


def replay_freshness(value):
    q, c, r, before, after, action = parts(value)
    prior = c["prior_exchange"]
    if prior and prior["request"]["idempotency_key"] == q["idempotency_key"]:
        if prior["request"] == q:
            return prior["result"] == r
        return not successful(r) and r["error"]["code"] == "idempotency_conflict" and not r["effect_boundary"]["owner_dispatches"]
    if action != "replay" or not successful(r):
        return True
    return bool(before and c["safe_replay_baseline"] and after["tour_session_id"] != before["tour_session_id"] and
                not r["effect_boundary"]["owner_observations"] and not r["effect_boundary"]["owner_dispatches"])


def story_transition(value):
    q, c, r, before, after, action = parts(value)
    if not before or not after or not successful(r) or action in {"start", "replay"}:
        return True
    before_done, after_done = set(before["completed_predicate_refs"]), set(after["completed_predicate_refs"])
    if action not in {"resume"} and not before_done <= after_done:
        return False
    added = after_done - before_done
    if added and action not in {"show_me", "toggle_eli5", "resume"}:
        return False
    if action in {"next", "back"}:
        order = ordered_phases(c)
        old = (before["step"], before["phase"])
        new = (after["step"], after["phase"])
        if old not in order or new not in order:
            return False
        if order.index(new) - order.index(old) != (1 if action == "next" else -1):
            return False
        required = PRACTICE.get(before["phase"])
        if action == "next" and required and required not in before_done:
            return False
    elif action not in {"resume"} and (after["step"], after["phase"], after["step_id"]) != (before["step"], before["phase"], before["step_id"]):
        return False
    if action not in {"skip", "finish"} and after["status"] in {"completed", "skipped"}:
        return False
    if action not in {"skip", "finish"} and after["captured_state"] != before["captured_state"]:
        return False
    return True


def practice_owner_join(value):
    q, c, r, before, after, action = parts(value)
    effects = r["effect_boundary"]
    observations = effects["owner_observations"]
    for wrapped in observations:
        if wrapped["tour_session_id"] != q["tour_session_id"] or wrapped["conversation_ref"] != c["visible_conversation_ref"]:
            return False
    if action not in {"show_me", "toggle_eli5"}:
        return not effects["owner_dispatches"] and not observations
    if not successful(r):
        return not effects["owner_dispatches"] and not observations
    practice = c["practice"]
    if action == "show_me":
        if not practice or q["practice_action_ref"] != practice["practice_action_ref"] or r["detail"]["practice_action_ref"] != q["practice_action_ref"]:
            return False
        if not before or practice["scene"] != before["step"] or practice["success_predicate_ref"] != PRACTICE.get(before["phase"]):
            return False
        expected_dispatch = {"owner_ref": practice["owner_ref"], "action_id": practice["owner_action_id"], "target_ref": practice["target_ref"], "tour_session_id": q["tour_session_id"], "practice_action_ref": practice["practice_action_ref"]}
        if effects["owner_dispatches"] != [expected_dispatch]:
            return False
    added = set(after["completed_predicate_refs"]) - set(before["completed_predicate_refs"]) if before and after else set()
    validated = set()
    for wrapped in observations:
        observation = wrapped["observation"]
        if not practice or any(observation[k] != practice[v] for k, v in (("owner_ref", "owner_ref"), ("action_id", "owner_action_id"), ("target_ref", "target_ref"), ("scene", "scene"), ("success_predicate_ref", "success_predicate_ref"))):
            return False
        if observation["mode"] != "show_me" and action == "show_me":
            return False
        if observation["status"] == "applied" and observation["mounted_owner_result_observed"]:
            validated.add(observation["success_predicate_ref"])
    return added <= validated


def explanation_identity(value):
    q, c, r, before, after, action = parts(value)
    if action != "toggle_eli5" or not successful(r):
        return True
    d = r["detail"]
    if d["answer_ref"] != c["visible_answer_ref"] or d["conversation_ref"] != c["visible_conversation_ref"]:
        return False
    if d["explanation_mode"] != ("eli5" if c["explanation_mode"] == "normal" else "normal"):
        return False
    if c["visible_answer_ref"] is None:
        return after["teacher_practice"] is None and not r["effect_boundary"]["owner_dispatches"] and not r["effect_boundary"]["owner_observations"]
    for dispatch in r["effect_boundary"]["owner_dispatches"]:
        if dispatch["owner_ref"] != "owner:assistant_chat" or dispatch["action_id"] != "cmd.chat.eli5.set" or dispatch["tour_session_id"] != q["tour_session_id"] or dispatch["target_ref"] != c["visible_answer_ref"]:
            return False
    if before["teacher_practice"] and after["teacher_practice"] != before["teacher_practice"]:
        return False
    return bool(r["effect_boundary"]["owner_dispatches"])


def pause_resume(value):
    q, c, r, before, after, action = parts(value)
    e = r["effect_boundary"]
    if action == "pause" and successful(r):
        return after["status"] == "paused" and not e["choreography_running"] and not e["decorative_work_running"] and e["active_subscription_count"] == 0
    if action != "resume" or not successful(r):
        return True
    if not before or before["status"] not in {"paused", "interrupted", "recovery_required"}:
        return False
    if after["status"] not in {"awaiting_user", "demonstrating"}:
        return False
    if q["resume_source"] == "live":
        d = r["detail"]
        validated = c["revalidated_predicate_refs"]
        unsatisfied = next((p for _, phase in ordered_phases(c) if (p := PRACTICE.get(phase)) and p not in validated), None)
        phase = next((phase for phase, predicate in PRACTICE.items() if predicate == unsatisfied), "completion_boundary")
        return (d["validated_owner_state_refs"] == c["owner_state_revision_refs"] and
                set(validated) <= set(before["completed_predicate_refs"]) and
                after["completed_predicate_refs"] == validated and
                d["earliest_unsatisfied_prerequisite_ref"] == unsatisfied and after["phase"] == phase and
                (after["step"], after["step_id"]) == (d["resume_step"], d["resume_step_id"]))
    cp, d = c["checkpoint"], r["detail"]
    if c["checkpoint_registration"] != "hypothetical_registered_fixture_only" or not c["checkpoint_owner_revalidated"] or not cp:
        return False
    if cp["checkpoint_id"] != q["checkpoint_ref"] or d["checkpoint_ref"] != cp["checkpoint_id"]:
        return False
    if cp["tour_session_id"] != q["tour_session_id"] or cp["project_id"] != q["project_id"]:
        return False
    if d["validated_owner_state_refs"] != c["owner_state_revision_refs"] or cp["owner_state_revision_refs"] != c["owner_state_revision_refs"]:
        return False
    if cp["layout_owner_snapshot_ref"] != c["original_capture"]["layout_owner_snapshot_ref"] or cp["chat_owner_snapshot_ref"] != c["original_capture"]["chat_owner_snapshot_ref"]:
        return False
    if not set(c["revalidated_predicate_refs"]) <= set(cp["completed_predicate_refs"]):
        return False
    unsatisfied = next((p for _, phase in ordered_phases(c) if (p := PRACTICE.get(phase)) and p not in c["revalidated_predicate_refs"]), None)
    phase = next((phase for phase, predicate in PRACTICE.items() if predicate == unsatisfied), None)
    return bool(unsatisfied and d["earliest_unsatisfied_prerequisite_ref"] == unsatisfied and
                after["phase"] == phase and (after["step"], after["step_id"]) == (d["resume_step"], d["resume_step_id"]) and
                after["completed_predicate_refs"] == c["revalidated_predicate_refs"])


def exit_restore(value):
    q, c, r, before, after, action = parts(value)
    if action not in {"skip", "finish"} or not r["detail"]:
        return True
    d = r["detail"]
    if d["captured_state_ref"] != c["captured_state_ref"]:
        return False
    if any(d["restoration"][k] != c["original_capture"][k] for k in ("layout_owner_snapshot_ref", "chat_owner_snapshot_ref")):
        return False
    if action == "skip" and q["captured_state_ref"] != c["captured_state_ref"]:
        return False
    if action == "finish" and (d["layout_disposition"], d["layout_selection_source"]) != (q["finish_layout"]["disposition"], q["finish_layout"]["selection_source"]):
        return False
    if not after or after["status"] != d["status"] or after["layout_disposition"] != d["layout_disposition"]:
        return False
    if action == "finish" and successful(r):
        if not before or before["phase"] != "completion_boundary" or not set(PRACTICE.values()) <= set(before["completed_predicate_refs"]):
            return False
    if successful(r) and not c["snapshots_current"]:
        return False
    return not r["effect_boundary"]["choreography_running"] and not r["effect_boundary"]["decorative_work_running"] and r["effect_boundary"]["active_subscription_count"] == 0


def partial_practice(value):
    q, c, r, before, after, action = parts(value)
    # These are references to retained owner-held partial practice, not Tour chat storage.
    if before and action not in {"start", "replay"}:
        if c["original_capture"] != before["captured_state"]:
            return False
        if after and after["captured_state"] != before["captured_state"]:
            return False
    if action not in {"skip", "finish", "replay"} or not successful(r):
        return value["partial_practice_owner_refs_after"] == c["partial_practice_owner_refs"]
    return True


RULES = (
    ("tour.request_result_correlation", correlation),
    ("tour.currentness_admission", currentness),
    ("tour.initial_state", initial_state),
    ("tour.replay_freshness", replay_freshness),
    ("tour.story_transition", story_transition),
    ("tour.practice_owner_join", practice_owner_join),
    ("tour.explanation_identity", explanation_identity),
    ("tour.pause_resume", pause_resume),
    ("tour.exit_restore", exit_restore),
    ("tour.partial_practice_retained", partial_practice),
)


def guided_tour_semantic_failures(definition_name: str, value: Any) -> list[str]:
    if definition_name not in KNOWN_DEFINITIONS:
        return ["tour.unknown_definition"]
    if definition_name != "guided_tour_action_exchange":
        return []
    prior = value.get("context", {}).get("prior_exchange")
    if prior and prior.get("request", {}).get("idempotency_key") == value["request"]["idempotency_key"]:
        # A retry is delivery of a previously checked result, not applying that
        # historical after-state to today's live session. One prior exchange is
        # allowed; recursive/self-attested receipt chains are not.
        if prior.get("context", {}).get("prior_exchange") is not None:
            return ["tour.replay_freshness"]
        if guided_tour_semantic_failures("guided_tour_action_exchange", prior):
            return ["tour.replay_freshness"]
        if prior["request"] == value["request"]:
            c, q = value["context"], value["request"]
            if (value["result"] != prior["result"] or c["project_id"] != q["project_id"] or
                    c["actor_ref"] != q["actor_ref"] or
                    value["partial_practice_owner_refs_after"] != c["partial_practice_owner_refs"]):
                return ["tour.replay_freshness"]
            return []
    failures = []
    for name, check in RULES:
        try:
            valid = check(value)
        except (KeyError, TypeError, ValueError, IndexError):
            # A structurally valid but wrong detail variant must fail closed,
            # not crash or accidentally skip later cross-record checks.
            valid = False
        if not valid:
            failures.append(name)
    return failures
