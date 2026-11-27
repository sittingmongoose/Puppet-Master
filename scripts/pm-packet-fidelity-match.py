#!/usr/bin/env python3
"""Reference implementation of Plans/DRY_Rules.md section 7.1
(packet-fidelity semantic matching). It must give the same result as the
code in section 7.1 on every input and pass all nine vectors there.

Usage: pm-packet-fidelity-match.py PACKET_FILE TARGET_FILE   (exit 0 match, 1 no match, 2 usage/IO)
       pm-packet-fidelity-match.py --self-test
"""
import re
import sys


def normalize(text: str) -> str:
    # 1. strip standalone ContractRef lines (trimmed text starts with "ContractRef:")
    lines = [ln for ln in re.split(r"\r\n|\n|\r", text) if not ln.strip().startswith("ContractRef:")]
    # 2. CRLF -> LF is done by the split above plus the LF join below
    out = []
    for ln in lines:
        ln = ln.rstrip(" \t")              # 3. trim trailing spaces/tabs per line
        ln = re.sub(r"[ \t]+", " ", ln)     # 4. collapse runs of spaces/tabs to one space
        out.append(ln)
    joined = "\n".join(out)
    return re.sub(r"\n{4,}", "\n\n\n", joined)  # 5. 3+ blank lines -> exactly 2 blank lines


def matches(packet: str, target: str) -> bool:
    p = normalize(packet)
    if p.strip() == "":
        return False  # an empty packet never matches
    return p in normalize(target)  # 6. substring match


VECTORS = [
    ("a  b\r\nc", "x\na b\nc\ny", True),
    ("a b\nContractRef: X\nc", "a b\nc", True),
    ("a b\nc", "a b\n  ContractRef: Y\nc", True),
    ("a\n\n\n\n\nb", "a\n\n\nb", True),
    ("a\n\n\nb", "a\n\nb", False),
    ("a\t\tb   ", "a b", True),
    ("x ContractRef: Z", "x", False),
    ("ContractRef: only", "anything", False),
    ("a b", "a\nb", False),
]


def self_test() -> int:
    bad = 0
    for i, (p, t, want) in enumerate(VECTORS, 1):
        got = matches(p, t)
        if got != want:
            bad += 1
            print(f"vector {i}: want {want} got {got}")
    print(f"{len(VECTORS) - bad}/{len(VECTORS)} vectors pass")
    return 1 if bad else 0


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        sys.exit(self_test())
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    try:
        pk = open(sys.argv[1], encoding="utf-8").read()
        tg = open(sys.argv[2], encoding="utf-8").read()
    except OSError as e:
        print(e)
        sys.exit(2)
    sys.exit(0 if matches(pk, tg) else 1)
