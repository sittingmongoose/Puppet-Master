"""Artificial structural Muse records. No model/native calls or research data."""
import json
from pathlib import Path


class FixtureStream:
    def __init__(self, workspace_root, session_id="synthetic-session"):
        self.workspace_root = Path(workspace_root).absolute()
        self.session_id = session_id
        self.sequence = 0
        self.calls = {}

    def _frame(self, payload, session_id=None):
        self.sequence += 1
        return {"schema_version": 1, "id": f"fixture-event-{self.sequence}",
                "stream": {"kind": "session", "id": session_id or self.session_id},
                "sequence": self.sequence, "record_type": "event", "durability": "durable",
                "payload": payload}

    def _path(self, path):
        path = Path(path)
        return path if path.is_absolute() else self.workspace_root / path

    def call(self, call_id, path, content, run_id="synthetic-run", session_id=None):
        self.calls[call_id] = {"path": path, "content": content, "run_id": run_id, "index": 0, "tool_name": "write_file"}
        return self._frame({"kind": "run", "run_id": run_id,
                            "event": {"kind": "assistant_tool_calls_committed", "tool_calls": [
                                {"call_id": call_id, "name": "write_file", "id": "fixture-fc-" + call_id,
                                 "args": json.dumps({"path": str(path), "content": content})}]}}, session_id)

    def edit(self, call_id, path, run_id="synthetic-run", session_id=None):
        """Adversarial path operation, not an observed/qualified native Edit route."""
        self.calls[call_id] = {"path": path, "content": "", "run_id": run_id, "index": 0, "tool_name": "edit_file"}
        return self._frame({"kind": "run", "run_id": run_id,
                            "event": {"kind": "assistant_tool_calls_committed", "tool_calls": [
                                {"call_id": call_id, "name": "edit_file", "id": "fixture-fc-" + call_id,
                                 "args": json.dumps({"path": str(path)})}]}}, session_id)

    def start(self, call_id, path=None, run_id=None, session_id=None, effect_id=None, task_id=None):
        call = self.calls[call_id]
        path = call["path"] if path is None else path
        effect = effect_id or "fixture-effect-" + call_id
        task = task_id or "fixture-task-" + call_id
        relative = str(self._path(path).relative_to(self.workspace_root))
        return self._frame({"kind": "tool_batch_effect", "run_id": run_id or call["run_id"],
                            "record": {"kind": "started", "call_id": call_id, "effect_id": effect,
                                       "task_id": task, "task_stream": {"kind": "task", "id": task},
                                       "tool_name": call["tool_name"], "model_call_index": call["index"],
                                       "parallel_profile": {"kind": "file_write", "subject": "workspace:" + relative}}}, session_id)

    def terminal(self, call_id, path=None, ok=True, run_id=None, session_id=None,
                 effect_id=None, task_id=None, outcome=None):
        call = self.calls[call_id]
        effect = effect_id or "fixture-effect-" + call_id
        task = task_id or "fixture-task-" + call_id
        # Native terminal has no path: path evidence belongs to call/start/result.
        return self._frame({"kind": "tool_batch_effect", "run_id": run_id or call["run_id"],
                            "record": {"kind": "terminal", "call_id": call_id, "effect_id": effect,
                                       "task_id": task, "task_stream": {"kind": "task", "id": task},
                                       "model_call_index": call["index"],
                                       "outcome": outcome or {"kind": "completed" if ok else "failed",
                                           "output_ref_count": 1 if ok else 0,
                                           "task_completion": {"kind": "complete" if ok else "failed"}}}}, session_id)

    def result(self, call_id, path=None, content=None, run_id=None, session_id=None, text=None):
        call = self.calls[call_id]
        path = call["path"] if path is None else path
        content = call["content"] if content is None else content
        result = text if text is not None else f"wrote {len(content.encode('utf-8'))} bytes to {self._path(path)}"
        return self._frame({"kind": "run", "run_id": run_id or call["run_id"],
                            "event": {"kind": "tool_result_batch_committed", "batch_id": "fixture-batch-" + call_id,
                                      "results": [{"tool_call_id": call_id, "tool_call_index": call["index"], "text": result}]}}, session_id)

    @staticmethod
    def encode(frame):
        return (json.dumps(frame, separators=(",", ":")) + "\n").encode("utf-8")

    def session_start(self, journal_path):
        return {"jsonrpc": "2.0", "id": 3, "result": {
            "session": {"sessionId": self.session_id, "path": str(Path(journal_path).absolute()),
                        "workspaceRoot": str(self.workspace_root)}, "viewCursor": "fixture-cursor"}}
