#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rollout", required=True, type=Path)
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    marker = f"Sender: {args.agent_path}\nPayload:\n"
    matches = []
    with args.rollout.open() as handle:
        for line in handle:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            for text in strings(record):
                if "Message Type: FINAL_ANSWER" not in text or marker not in text:
                    continue
                payload = text.split(marker, 1)[1]
                try:
                    parsed = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                if parsed.get("assignment_id") == args.assignment_id:
                    matches.append(payload)
    if len(matches) != 1:
        raise SystemExit(f"expected one mailbox result, found {len(matches)}")
    raw = matches[0].encode()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(raw)
    print(json.dumps({
        "assignment_id": args.assignment_id,
        "agent_path": args.agent_path,
        "output": str(args.output),
        "result_bytes": len(raw),
        "result_sha256": hashlib.sha256(raw).hexdigest(),
    }, sort_keys=True))


if __name__ == "__main__":
    main()
