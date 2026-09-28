"""Offline Muse journal correlation; no transport, inference, or Goal control.

The binding is supplied by a trusted session/start response or explicit caller.
Only complete JSONL records are parsed. Append reads seek to the consumed offset;
same-size changes and finalization verify the consumed prefix without reparsing.
"""

import hashlib
import json
import os
from pathlib import Path


def _digest(data):
    return hashlib.sha256(data).hexdigest()


class CompletionReader:
    def __init__(self, log_path, *, session_id, workspace_root, app="muse"):
        self.log_path = Path(log_path)
        self.session_id = session_id
        self.workspace_root = Path(workspace_root).absolute()
        self.app = app
        self.fault = None
        self.closed_reason = None
        self.operations = {}
        self.native_attempts = 0
        self.lines_parsed = 0
        self.bytes_read = 0
        self.integrity_bytes_read = 0
        self._sequence = 0
        self._ids = set()
        self._offset = 0
        self._prefix = hashlib.sha256()
        self._partial = b""
        self._identity = None
        self._stat_token = None
        self._version = 0
        if not isinstance(session_id, str) or not session_id:
            raise ValueError("trusted session_id is required")

    @classmethod
    def from_session_start(cls, response, *, workspace_root):
        """Use the unchanged driver's returned result, or raw MSP result frame."""
        result = response.get("result", response)
        session = result["session"]
        if session.get("workspaceRoot") != str(Path(workspace_root).absolute()):
            raise ValueError("session/start workspace binding mismatch")
        path = session["path"]
        if not isinstance(path, str) or not Path(path).is_absolute():
            raise ValueError("session/start must expose an absolute journal path")
        return cls(path, session_id=session["sessionId"], workspace_root=workspace_root)

    def _fail(self, reason):
        if self.fault is None:
            self.fault = reason
            self._version += 1

    def _path(self, value):
        if not isinstance(value, str) or not value or "\x00" in value:
            raise ValueError("invalid operation path")
        p = Path(value)
        if ".." in p.parts:
            raise ValueError("parent traversal is unqualified")
        p = p if p.is_absolute() else self.workspace_root / p
        if not p.is_relative_to(self.workspace_root):
            raise ValueError("operation path is outside bound workspace")
        return str(p)

    def poll(self):
        before = self._version
        if self.app != "muse" or self.fault or self.closed_reason:
            return self._report(False)
        try:
            with self.log_path.open("rb") as source:
                stat = os.fstat(source.fileno())
                identity = (stat.st_dev, stat.st_ino)
                token = (stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns)
                if self._identity is not None and identity != self._identity:
                    raise ValueError("native journal replaced")
                self._identity = identity
                if stat.st_size < self._offset:
                    raise ValueError("native journal truncated")
                if token == self._stat_token:
                    return self._report(False)
                # Growth trusts the bound native append-only writer. Full
                # historical integrity is checked once at finalization.
                if stat.st_size == self._offset:
                    self._verify_prefix(source)
                source.seek(self._offset)
                appended = source.read(stat.st_size - self._offset)
                if len(appended) != stat.st_size - self._offset:
                    raise ValueError("native journal truncated while reading")
                self._prefix.update(appended)
                self._offset += len(appended)
                self.bytes_read += len(appended)
                self._stat_token = token
                data = self._partial + appended
                parts = data.split(b"\n")
                self._partial = parts.pop()
                for line in parts:
                    self.lines_parsed += 1
                    frame = json.loads(line.decode("utf-8"))
                    self._consume(frame)
                if appended:
                    self._version += 1
        except FileNotFoundError:
            if self._identity is not None:
                self._fail("native journal disappeared")
        except (ValueError, KeyError, TypeError, UnicodeError, OSError) as exc:
            self._fail(f"native stream fault: {type(exc).__name__}: {exc}")
        return self._report(self._version != before)

    def _verify_prefix(self, source):
        source.seek(0)
        check = hashlib.sha256()
        remaining = self._offset
        while remaining:
            chunk = source.read(min(65536, remaining))
            self.integrity_bytes_read += len(chunk)
            if not chunk:
                raise ValueError("native journal truncated while verifying")
            check.update(chunk)
            remaining -= len(chunk)
        if check.digest() != self._prefix.digest():
            raise ValueError("native journal consumed prefix changed")

    def _consume(self, frame):
        if not isinstance(frame, dict):
            raise ValueError("native frame is not an object")
        if frame.get("retained_frame") == "session_permission_transaction":
            if self._sequence or frame.get("frame_schema_version") != 1:
                raise ValueError("unexpected permission transaction")
            children = frame["children"]
            if not isinstance(children, list) or not children:
                raise ValueError("invalid permission transaction children")
            for index, child in enumerate(children):
                if child["child_index"] != index:
                    raise ValueError("permission transaction child order mismatch")
                self._consume(json.loads(child["record_json"]))
            return
        if frame.get("stream") != {"kind": "session", "id": self.session_id}:
            raise ValueError("native session binding mismatch")
        sequence = frame["sequence"]
        if type(sequence) is not int or sequence != self._sequence + 1:
            raise ValueError("native journal sequence gap/duplicate/reorder")
        event_id = frame["id"]
        if not isinstance(event_id, str) or not event_id or event_id in self._ids:
            raise ValueError("native journal event identity duplicate/invalid")
        if frame.get("record_type") != "event" or frame.get("durability") != "durable":
            raise ValueError("unqualified native record")
        payload = frame["payload"]
        if not isinstance(payload, dict):
            raise ValueError("native payload envelope is not an object")
        self._sequence = sequence
        self._ids.add(event_id)
        if payload.get("kind") == "session_opened":
            if payload["record"].get("session_id") != self.session_id:
                raise ValueError("opened session identity mismatch")
            if payload["record"].get("resume") is not False:
                raise ValueError("resumed sessions are unqualified")
        elif payload.get("kind") == "run":
            event = payload["event"]
            if event.get("kind") == "assistant_tool_calls_committed":
                for index, call in enumerate(event["tool_calls"]):
                    self._call(call, payload["run_id"], index, sequence)
            elif event.get("kind") == "tool_result_batch_committed":
                for result in event["results"]:
                    self._result(result, payload["run_id"], sequence)
        elif payload.get("kind") == "tool_batch_effect":
            self._effect(payload["record"], payload["run_id"], sequence)

    def _call(self, call, run_id, index, sequence):
        call_id = call["call_id"]
        if not isinstance(call_id, str) or not call_id or call_id in self.operations:
            raise ValueError("duplicate/invalid native call identity")
        self.native_attempts += 1
        operation = {"session_id": self.session_id, "run_id": run_id,
                     "call_id": call_id, "tool_name": call["name"],
                     "call_index": index, "call_sequence": sequence,
                     "ordinal": self.native_attempts, "status": "pending"}
        self.operations[call_id] = operation
        operation["qualifies_write"] = call["name"] == "write_file"
        if call["name"] in {"write_file", "edit_file"}:
            args = json.loads(call["args"])
            operation["path"] = self._path(args["path"])
        if call["name"] == "write_file":
            content = args["content"]
            if not isinstance(content, str):
                raise ValueError("native write content is not UTF-8 text")
            data = content.encode("utf-8")
            operation.update(path=self._path(args["path"]),
                             content_sha256=_digest(data), content_bytes=len(data))

    def _operation(self, call_id, run_id):
        operation = self.operations[call_id]
        if operation["run_id"] != run_id:
            raise ValueError("native call run identity mismatch")
        return operation

    def _effect(self, record, run_id, sequence):
        operation = self._operation(record["call_id"], run_id)
        identity = {key: record[key] for key in ("effect_id", "task_id", "task_stream")}
        if any(not isinstance(identity[key], str) or not identity[key] for key in ("effect_id", "task_id")):
            raise ValueError("invalid native effect/task identity")
        if identity["task_stream"] != {"kind": "task", "id": identity["task_id"]}:
            raise ValueError("native task stream mismatch")
        if record["model_call_index"] != operation["call_index"]:
            raise ValueError("native call index mismatch")
        if record["kind"] == "started":
            if record["tool_name"] != operation["tool_name"]:
                raise ValueError("native started tool mismatch")
            if operation.get("started_sequence"):
                if operation.get("start_record") == record:
                    return  # Same notification, one counted native attempt.
                raise ValueError("conflicting native start")
            if operation.get("terminal_sequence"):
                raise ValueError("native start after terminal")
            if operation.get("qualifies_write"):
                relative = str(Path(operation["path"]).relative_to(self.workspace_root))
                if record.get("parallel_profile") != {"kind": "file_write", "subject": "workspace:" + relative}:
                    raise ValueError("native started path profile mismatch")
            operation.update(identity, started_sequence=sequence, start_record=record)
        elif record["kind"] == "terminal":
            if not operation.get("started_sequence"):
                raise ValueError("native terminal before start")
            if any(operation[key] != value for key, value in identity.items()):
                raise ValueError("native terminal effect/task identity mismatch")
            if operation.get("terminal_sequence"):
                if operation.get("terminal_record") == record:
                    return
                raise ValueError("conflicting native terminal")
            outcome = record["outcome"]
            complete = (outcome.get("kind") == "completed" and
                        outcome.get("task_completion") == {"kind": "complete"} and
                        (not operation["qualifies_write"] or outcome.get("output_ref_count") == 1))
            operation.update(terminal_sequence=sequence, terminal_record=record,
                             status="pending" if complete else "failed")
        else:
            raise ValueError("unknown native effect lifecycle")

    def _result(self, result, run_id, sequence):
        operation = self._operation(result["tool_call_id"], run_id)
        if result["tool_call_index"] != operation["call_index"]:
            raise ValueError("native result call index mismatch")
        if not operation.get("terminal_sequence"):
            raise ValueError("native result before terminal")
        result_digest = _digest(json.dumps(result, sort_keys=True, separators=(",", ":")).encode())
        if operation.get("result_sequence"):
            if operation.get("result_digest") == result_digest:
                return
            raise ValueError("conflicting native result")
        operation.update(result_sequence=sequence, result_digest=result_digest)
        if operation.get("qualifies_write") and operation["status"] != "failed":
            expected = f"wrote {operation['content_bytes']} bytes to {operation['path']}"
            if result.get("text") != expected:
                raise ValueError("native write result path/byte-count mismatch")
        if operation["status"] != "failed":
            operation.update(status="complete", complete_sequence=sequence)

    def proof_for(self, path):
        if self.app != "muse":
            return {"status": "unqualified", "reason": "native route not demonstrated for " + self.app}
        if self.fault:
            return {"status": "fault", "reason": self.fault}
        try:
            path = self._path(str(path))
        except ValueError as exc:
            return {"status": "fault", "reason": str(exc)}
        matches = [op for op in self.operations.values() if op.get("path") == path]
        if len(matches) > 1:
            return {"status": "fault", "reason": "multiple native writes to exact path", "native_attempts": len(matches)}
        if not matches:
            return {"status": "incomplete" if self.closed_reason else "pending", "path": path, "native_attempts": 0}
        operation = matches[0]
        proof = {k: v for k, v in operation.items() if k not in ("start_record", "terminal_record", "result_digest")}
        proof["native_attempts"] = 1
        if not operation["qualifies_write"]:
            proof.update(status="unqualified", reason="path operation is not the required native Write")
        if self.closed_reason and proof["status"] == "pending":
            proof.update(status="incomplete", reason=self.closed_reason)
        return proof

    def pair_proof(self, payload_path, marker_path):
        payload = self.proof_for(payload_path)
        marker = self.proof_for(marker_path)
        statuses = {payload["status"], marker["status"]}
        status = next((s for s in ("fault", "unqualified", "failed", "incomplete", "pending") if s in statuses), "complete")
        reason = None
        if payload.get("path") == marker.get("path") and payload.get("path"):
            status, reason = "fault", "payload and marker must have distinct exact paths"
        if status == "complete" and not payload["complete_sequence"] < marker["started_sequence"]:
            status, reason = "fault", "payload completion did not precede marker start"
        return {"status": status, "reason": reason, "payload": payload, "marker": marker}

    def finalize(self, reason):
        self.poll()
        if not self.fault and self._identity is not None:
            try:
                with self.log_path.open("rb") as source:
                    stat = os.fstat(source.fileno())
                    if (stat.st_dev, stat.st_ino) != self._identity:
                        raise ValueError("native journal replaced before final verification")
                    self._verify_prefix(source)
            except (ValueError, OSError) as exc:
                self._fail(str(exc))
        if self._partial:
            self._fail("native stream incomplete: unterminated final JSONL record")
        self.closed_reason = reason
        self._version += 1
        return self._report(True)

    def _report(self, changed):
        missing_journal = self.closed_reason and self._identity is None
        empty_journal = self.closed_reason and self._sequence == 0
        incomplete = self.closed_reason and (missing_journal or empty_journal or self._partial or
                                            any(op["status"] == "pending" for op in self.operations.values()))
        report = {"changed": changed, "status": "unqualified" if self.app != "muse" else "fault" if self.fault else "incomplete" if incomplete else "closed" if self.closed_reason else "open",
                "fault": self.fault, "native_attempts": self.native_attempts,
                "operations": [{**{k: v for k, v in op.items() if k not in ("start_record", "terminal_record", "result_digest")},
                                "status": "fault" if self.fault else "incomplete" if self.closed_reason and op["status"] == "pending" else op["status"]}
                               for op in self.operations.values()],
                "sequence": self._sequence, "partial_bytes": len(self._partial)}
        if missing_journal:
            report["reason"] = "bound native journal missing at finalization"
        elif empty_journal:
            report["reason"] = "bound native journal has no complete records at finalization"
        return report


class _MspBinder(CompletionReader):
    """Reads only the raw MSP response envelope, never sends requests."""
    def __init__(self, path, workspace_root):
        super().__init__(path, session_id="msp-binding", workspace_root=workspace_root)
        self.binding = None
        self.ignored_sessions = 0

    def poll(self):
        if self.binding or self.closed_reason or self.fault:
            return self._report(False)
        before = self._version
        try:
            with self.log_path.open("rb") as source:
                stat = os.fstat(source.fileno())
                identity = (stat.st_dev, stat.st_ino)
                if self._identity is not None and identity != self._identity:
                    raise ValueError("MSP capture replaced")
                self._identity = identity
                if stat.st_size < self._offset:
                    raise ValueError("MSP capture truncated")
                token = (stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns)
                if token == self._stat_token:
                    return self._report(False)
                if stat.st_size == self._offset:
                    self._verify_prefix(source)
                source.seek(self._offset)
                remaining = stat.st_size - self._offset
                while remaining and not self.binding:
                    line = source.readline(min(remaining, 1048576))
                    if not line:
                        raise ValueError("MSP capture truncated while binding")
                    self._prefix.update(line)
                    self._offset += len(line)
                    self.bytes_read += len(line)
                    remaining -= len(line)
                    self._partial += line
                    if len(self._partial) > 1048576:
                        raise ValueError("MSP pre-binding record exceeds bounded size")
                    if self._partial.endswith(b"\n"):
                        frame = json.loads(self._partial.decode("utf-8"))
                        self._partial = b""
                        self.lines_parsed += 1
                        self._consume(frame)
                self._stat_token = token
                self._version += 1
        except FileNotFoundError:
            if self._identity is not None:
                self._fail("MSP capture disappeared")
        except (ValueError, KeyError, TypeError, UnicodeError, OSError) as exc:
            self._fail(f"MSP binding fault: {type(exc).__name__}: {exc}")
        return self._report(self._version != before)

    def _consume(self, frame):
        if not isinstance(frame, dict):
            raise ValueError("MSP frame is not an object")
        result = frame.get("result")
        if not isinstance(result, dict) or not isinstance(result.get("session"), dict):
            return
        session = result["session"]
        if session.get("workspaceRoot") != str(self.workspace_root):
            self.ignored_sessions += 1
            return
        candidate = CompletionReader.from_session_start(frame, workspace_root=self.workspace_root)
        binding = (str(candidate.log_path), candidate.session_id)
        if self.binding is not None and self.binding != binding:
            raise ValueError("conflicting MSP session/path binding")
        self.binding = binding


class MuseCompletionFeed:
    """Fresh per-run receiver sidecar for the unchanged driver's flushed MSP log.

Construction performs no I/O. poll() waits for the already-exposed native
session/start result, then tails its exact journal while the driver runs.
Unrelated MSP session responses are diagnosed; foreign frames in the bound
journal are corruption and block all acceptance.
    """
    def __init__(self, msp_log, *, workspace_root):
        self._binder = _MspBinder(msp_log, workspace_root)
        self._reader = None
        self.workspace_root = self._binder.workspace_root
        self.closed_reason = None
        self._last_report = None

    @property
    def fault(self):
        return self._binder.fault or (self._reader.fault if self._reader else None)

    @property
    def operations(self):
        return self._reader.operations if self._reader else {}

    @property
    def native_attempts(self):
        return self._reader.native_attempts if self._reader else 0

    def poll(self):
        binding_report = self._binder.poll()
        if self._binder.binding and self._reader is None and not self.fault and not self.closed_reason:
            path, session_id = self._binder.binding
            self._reader = CompletionReader(path, session_id=session_id, workspace_root=self.workspace_root)
        report = self._reader.poll() if self._reader else {
            "changed": binding_report["changed"], "status": "incomplete" if self.closed_reason else "pending",
            "fault": None, "native_attempts": 0, "operations": [], "sequence": 0, "partial_bytes": 0}
        if self.fault:
            report.update(status="fault", fault=self.fault)
        report["ignored_msp_sessions"] = self._binder.ignored_sessions
        if self.closed_reason and not self._reader:
            report["reason"] = "native session/start binding missing at finalization"
        report["binding"] = ({"session_id": self._reader.session_id, "journal_path": str(self._reader.log_path)}
                             if self._reader else None)
        stable = {k: v for k, v in report.items() if k != "changed"}
        report["changed"] = stable != self._last_report
        self._last_report = stable
        return report

    def proof_for(self, path):
        if self.fault:
            return {"status": "fault", "reason": self.fault}
        if self._reader:
            return self._reader.proof_for(path)
        return {"status": "incomplete" if self.closed_reason else "pending", "reason": "native session/start binding not yet observed"}

    def pair_proof(self, payload_path, marker_path):
        if self.fault or not self._reader:
            return {"status": self.proof_for(payload_path)["status"], "reason": self.proof_for(payload_path).get("reason"),
                    "payload": self.proof_for(payload_path), "marker": self.proof_for(marker_path)}
        return self._reader.pair_proof(payload_path, marker_path)

    def finalize(self, reason):
        self.poll()
        self._binder.finalize(reason)
        if self._reader:
            self._reader.finalize(reason)
        self.closed_reason = reason
        return self.poll()
