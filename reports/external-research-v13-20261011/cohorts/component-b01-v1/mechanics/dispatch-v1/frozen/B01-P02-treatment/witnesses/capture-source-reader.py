#!/usr/bin/env python3
"""Capture permitted source-reader excerpts as source-inspection evidence only."""
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

STAGE = Path("ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-treatment")
READER = STAGE / "helpers/component-fixtures-v1/source_reader.py"
COPY = STAGE / "witnesses/source_reader.py"
RESULTS = STAGE / "witnesses/source-reader-results.json"
COMMANDS = [
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S1", "--start", "14", "--end", "24"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S1", "--start", "96", "--end", "127"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S1", "--start", "193", "--end", "219"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S1", "--start", "339", "--end", "380"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S1", "--start", "536", "--end", "553"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S1", "--start", "980", "--end", "1019"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S2", "--start", "355", "--end", "408"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S2", "--start", "1025", "--end", "1106"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S2", "--start", "1444", "--end", "1518"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S2", "--start", "1605", "--end", "1639"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S2", "--start", "1666", "--end", "1711"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S2", "--start", "1791", "--end", "1852"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S3", "--start", "1628", "--end", "1683"],
    ["python3", "-B", str(READER), "--case", "B01-P02", "--arm", "treatment", "--source", "S3", "--start", "2522", "--end", "2550"]
]

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main():
    if COPY.exists() or RESULTS.exists():
        raise FileExistsError("refusing to overwrite a source-reader witness artifact")
    with open(READER, "rb") as source, open(COPY, "xb") as target:
        target.write(source.read())
    reader_bytes = COPY.read_bytes()
    records = []
    for command in COMMANDS:
        run = subprocess.run(command, capture_output=True, text=True)
        records.append({
            "command": command,
            "returncode": run.returncode,
            "stdout": run.stdout,
            "stderr": run.stderr
        })
        if run.returncode != 0:
            raise RuntimeError(f"source reader failed: {command!r}: {run.stderr}")
    record = {
        "purpose": "Permitted primary-source excerpt retrieval only; not an importer or security witness.",
        "runner_command": f"python3 -B {Path(__file__)}",
        "python_version": sys.version,
        "source_reader_copy": str(COPY),
        "source_reader_sha256": digest(reader_bytes),
        "interpretation": "Stdout is the actual line excerpt returned by the admitted helper for each listed source range. Source hashes are also in source-map.json. No importer was executed.",
        "limits": [
            "Excerpt retrieval validates neither product behavior nor app implementation.",
            "The helper reads only the source IDs and ranges listed in its commands."
        ],
        "calls": records
    }
    raw = (json.dumps(record, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    fd = os.open(str(RESULTS), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    with os.fdopen(fd, "wb") as f:
        f.write(raw)
    print(f"captured {len(records)} source excerpts; reader sha256={digest(reader_bytes)}")

if __name__ == "__main__":
    main()
