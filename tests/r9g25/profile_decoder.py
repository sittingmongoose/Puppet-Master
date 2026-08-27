#!/usr/bin/env python3
import importlib.util
import os
import stat

BASE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g24/profile_decoder.py"
BASE_BYTES = 14662
BASE_SHA256 = "d0b112bd6b36061204aa79a505df40a48dfa8b63f69756251c2500ea7893e15c"


def _read_base():
    import hashlib
    before = os.lstat(BASE_PATH)
    if not (stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == BASE_BYTES):
        raise ValueError("base-custody")
    fd = os.open(BASE_PATH, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        current = os.fstat(fd)
        if (current.st_dev, current.st_ino, current.st_size) != (before.st_dev, before.st_ino, before.st_size):
            raise ValueError("base-race")
        raw = b""
        while len(raw) < BASE_BYTES:
            part = os.read(fd, BASE_BYTES - len(raw))
            if not part:
                raise ValueError("base-short")
            raw += part
        if os.read(fd, 1):
            raise ValueError("base-trailing")
    finally:
        os.close(fd)
    after = os.lstat(BASE_PATH)
    if (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_nlink, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_nlink, before.st_size, before.st_mtime_ns):
        raise ValueError("base-drift")
    if hashlib.sha256(raw).hexdigest() != BASE_SHA256:
        raise ValueError("base-hash")
    return raw


def _load_base():
    _read_base()
    spec = importlib.util.spec_from_file_location("r9g25_frozen_profile_decoder", BASE_PATH)
    if spec is None or spec.loader is None:
        raise ValueError("base-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if module.__all__ != ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal"):
        raise ValueError("base-api")
    return module


_BASE = _load_base()
Invalid = _BASE.Invalid
decode_events = _BASE.decode_events
profile = _BASE.profile


def _adapt(raw, control):
    events = _BASE.decode_events(raw)
    turns = [event["payload"] for event in events if event["type"] == "turn_context"]
    if len(turns) != 1 or not isinstance(turns[0].get("turn_id"), str):
        raise Invalid("normalization-turn")
    kind, calls, _ = _BASE.profile(events, turns[0]["turn_id"])
    if len(calls) < 3:
        raise Invalid("normalization-call-count")
    tool, observed = _BASE.arguments(kind, calls[2][1], _BASE.load_codec())
    expected = control.get("wait_arguments")
    if tool != "exec_command" or not isinstance(observed, dict) or not isinstance(expected, dict):
        raise Invalid("normalization-wait-tool")
    required = set(expected)
    if not required <= set(observed) <= required | {"login", "tty"}:
        raise Invalid("normalization-fields")
    if any(observed[key] != expected[key] for key in required):
        raise Invalid("normalization-required-values")
    if "login" in observed and observed["login"] is not False:
        raise Invalid("normalization-login")
    if "tty" in observed and observed["tty"] is not False:
        raise Invalid("normalization-tty")
    adapted = dict(control)
    adapted["wait_arguments"] = observed
    return adapted


def validate_active(raw, control, subject, skill):
    proof = _BASE.validate_active(raw, _adapt(raw, control), subject, skill)
    proof["wait_argument_profile"] = "REQUIRED_PLUS_OPTIONAL_FALSE_DEFAULTS_V1"
    return proof


def validate_terminal(raw, active_raw, control, subject, skill, allowed_tokens):
    proof = _BASE.validate_terminal(raw, active_raw, _adapt(raw, control), subject, skill, allowed_tokens)
    proof["wait_argument_profile"] = "REQUIRED_PLUS_OPTIONAL_FALSE_DEFAULTS_V1"
    return proof


__all__ = ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal")
