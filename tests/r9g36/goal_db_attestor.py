#!/usr/bin/env python3
import json
import math
import os
import re
import sqlite3
import stat

GOALS_DB = "/home/sittingmongoose/.codex/goals_1.sqlite"
STATE_DB = "/home/sittingmongoose/.codex/state_5.sqlite"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TASK = re.compile(r"^/root/[a-z0-9_]{1,160}$")
GOAL_COLUMNS = ("thread_id", "goal_id", "objective", "status", "token_budget", "tokens_used", "time_used_seconds", "created_at_ms", "updated_at_ms")
THREAD_COLUMNS = ("id", "rollout_path", "source", "model_provider", "cwd", "sandbox_policy", "approval_mode", "model", "reasoning_effort", "agent_path", "agent_role", "created_at_ms", "updated_at_ms", "thread_source")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    if isinstance(raw, str):
        raw = raw.encode("utf-8")
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid("nonfinite:" + token)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def _db_custody(path, mode):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "db-kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "db-custody:" + path)
    require(before.st_size > 0, "db-empty:" + path)
    parent = os.lstat(os.path.dirname(path))
    require(stat.S_ISDIR(parent.st_mode) and not stat.S_ISLNK(parent.st_mode) and parent.st_uid == os.getuid(), "db-parent")
    return (before.st_dev, before.st_ino)


def _connect(path, mode):
    identity = _db_custody(path, mode)
    connection = sqlite3.connect("file:" + path + "?mode=ro", uri=True, timeout=1.0, isolation_level=None)
    connection.execute("PRAGMA query_only=ON")
    require(connection.execute("PRAGMA query_only").fetchone() == (1,), "query-only")
    require(connection.execute("PRAGMA journal_mode").fetchone() == ("wal",), "journal-mode")
    return connection, identity


def _schema(connection, kind):
    rows = connection.execute("SELECT type,name,sql FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
    names = [row[1] for row in rows]
    if kind == "goals":
        require(names == ["_sqlx_migrations", "thread_goal_continuation_deferrals", "thread_goals"], "goals-tables")
        migrations = connection.execute("SELECT version,description,success FROM _sqlx_migrations ORDER BY version").fetchall()
        require(migrations == [(1, "thread goals", 1), (2, "thread goal continuation deferrals", 1)], "goals-migrations")
        columns = [row[1] for row in connection.execute("PRAGMA table_info(thread_goals)").fetchall()]
        require(tuple(columns) == GOAL_COLUMNS, "goal-columns")
    else:
        require("threads" in names and "thread_spawn_edges" in names and "_sqlx_migrations" in names, "state-tables")
        columns = [row[1] for row in connection.execute("PRAGMA table_info(threads)").fetchall()]
        require(all(name in columns for name in THREAD_COLUMNS), "thread-columns")
        edge_columns = [row[1] for row in connection.execute("PRAGMA table_info(thread_spawn_edges)").fetchall()]
        require(edge_columns == ["parent_thread_id", "child_thread_id", "status"], "edge-columns")


def _state_row(connection, thread_id, parent_thread_id, task_path, model, effort):
    query = "SELECT " + ",".join(THREAD_COLUMNS) + " FROM threads WHERE id=?"
    row = connection.execute(query, (thread_id,)).fetchone()
    require(row is not None and len(row) == len(THREAD_COLUMNS), "thread-row")
    value = dict(zip(THREAD_COLUMNS, row))
    require(value["id"] == thread_id and value["model_provider"] == "openai" and value["cwd"] == "/mnt/Cursor/PuppetMaster", "thread-base")
    require(value["sandbox_policy"] == '{"type":"disabled"}' and value["approval_mode"] == "never", "thread-policy")
    require(value["model"] == model and value["reasoning_effort"] == effort and value["agent_path"] == task_path and value["agent_role"] == "default", "thread-route")
    require(value["thread_source"] == "subagent" and type(value["created_at_ms"]) is int and type(value["updated_at_ms"]) is int and value["created_at_ms"] <= value["updated_at_ms"], "thread-time")
    require(os.path.isabs(value["rollout_path"]) and value["rollout_path"].endswith("-" + thread_id + ".jsonl"), "rollout-path")
    source = parse(value["source"])
    require(set(source) == {"subagent"} and set(source["subagent"]) == {"thread_spawn"}, "thread-source-shape")
    spawn = source["subagent"]["thread_spawn"]
    require(set(spawn) == {"agent_nickname", "agent_path", "agent_role", "depth", "parent_thread_id"}, "spawn-shape")
    require(spawn["parent_thread_id"] == parent_thread_id and spawn["depth"] == 1 and spawn["agent_path"] == task_path and spawn["agent_role"] == "default", "spawn-values")
    edge = connection.execute("SELECT parent_thread_id,child_thread_id,status FROM thread_spawn_edges WHERE child_thread_id=?", (thread_id,)).fetchone()
    require(edge == (parent_thread_id, thread_id, "open"), "spawn-edge")
    return {key: value[key] for key in THREAD_COLUMNS if key != "source"}


def active(thread_id, objective, parent_thread_id, task_path, model, effort):
    require(UUID.fullmatch(thread_id or "") and UUID.fullmatch(parent_thread_id or ""), "thread-id")
    require(isinstance(objective, str) and 1 <= len(objective.encode("utf-8")) <= 128, "objective")
    require(TASK.fullmatch(task_path or "") and model in {"gpt-5.4-mini", "gpt-5.6-luna"} and effort in {"medium", "xhigh"}, "route")
    goals, goals_identity = _connect(GOALS_DB, 0o644)
    state, state_identity = _connect(STATE_DB, 0o600)
    try:
        goals.execute("BEGIN")
        state.execute("BEGIN")
        _schema(goals, "goals")
        _schema(state, "state")
        row = goals.execute("SELECT " + ",".join(GOAL_COLUMNS) + " FROM thread_goals WHERE thread_id=?", (thread_id,)).fetchone()
        require(row is not None and len(row) == len(GOAL_COLUMNS), "goal-row")
        goal = dict(zip(GOAL_COLUMNS, row))
        require(goal["thread_id"] == thread_id and UUID.fullmatch(goal["goal_id"] or "") and goal["objective"] == objective and goal["status"] == "active", "goal-values")
        require(goal["token_budget"] is None and all(type(goal[key]) is int and goal[key] >= 0 for key in ("tokens_used", "time_used_seconds", "created_at_ms", "updated_at_ms")), "goal-counters")
        require(goal["created_at_ms"] <= goal["updated_at_ms"], "goal-time")
        thread = _state_row(state, thread_id, parent_thread_id, task_path, model, effort)
        goals.execute("COMMIT")
        state.execute("COMMIT")
    finally:
        goals.close()
        state.close()
    require(_db_custody(GOALS_DB, 0o644) == goals_identity and _db_custody(STATE_DB, 0o600) == state_identity, "db-identity-drift")
    return {
        "goal": goal,
        "goal_database": {"path": GOALS_DB, "schema_version": 3},
        "schema_id": "pw-r9-native-goal-db-active-attestation-v1",
        "state_database": {"path": STATE_DB},
        "status": "ACTIVE_NATIVE_GOAL_ATTESTED_BEFORE_SUBJECT",
        "thread": thread,
    }


def terminal_absent(thread_id, parent_thread_id, task_path, model, effort):
    require(UUID.fullmatch(thread_id or "") and UUID.fullmatch(parent_thread_id or "") and TASK.fullmatch(task_path or ""), "terminal-identity")
    goals, goals_identity = _connect(GOALS_DB, 0o644)
    state, state_identity = _connect(STATE_DB, 0o600)
    try:
        goals.execute("BEGIN")
        state.execute("BEGIN")
        _schema(goals, "goals")
        _schema(state, "state")
        require(goals.execute("SELECT COUNT(*) FROM thread_goals WHERE thread_id=?", (thread_id,)).fetchone() == (0,), "goal-not-terminal")
        thread = _state_row(state, thread_id, parent_thread_id, task_path, model, effort)
        goals.execute("COMMIT")
        state.execute("COMMIT")
    finally:
        goals.close()
        state.close()
    require(_db_custody(GOALS_DB, 0o644) == goals_identity and _db_custody(STATE_DB, 0o600) == state_identity, "db-identity-drift")
    return {
        "goal_thread_id": thread_id,
        "schema_id": "pw-r9-native-goal-db-terminal-absence-attestation-v1",
        "status": "GOAL_ROW_ABSENT_AFTER_TERMINAL",
        "thread": thread,
    }


__all__ = ("Invalid", "active", "canonical", "parse", "terminal_absent")
