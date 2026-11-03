#!/usr/bin/env python3
"""Diff the copy sheet's strings (layer/copy.js STR) against Split v2's section `like` (BUILD-SPEC-split-v2.md 6.7).

The copy sheet copies Split v2's np.like.* and np.acct.* keys verbatim, with the changes SETTINGS-PROPOSAL section 11
asks for. This prints every key that differs, is missing on one side, or was added, so a reviewer sees that only those
changes differ. Exit 0 always; it is a report, not a gate.

    python3 tools/diff_strings.py [path/to/BUILD-SPEC-split-v2.md]
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_SPEC = pathlib.Path("/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md")
EXPECTED = {
    "np.like.things": "added (SETTINGS-PROPOSAL 11: its own things, one outcome line each)",
    "np.acct.checked": "the check_there row (SETTINGS-PROPOSAL 11)",
    "np.acct.checkedWhy": "the check_there row (SETTINGS-PROPOSAL 11)",
}
NOT_DRAWN = {
    "np.acct.keySend": "sendKeys is off (S11 A)",
    "np.like.sendKeys": "sendKeys is off (S11 A)",
    "np.like.sendKeysSub": "sendKeys is off (S11 A)",
    "np.like.sendKeysNew": "sendKeys is off (S11 A)",
    "np.like.twins": "no twin kinds: each setting id is in exactly one kind (SETTINGS-PROPOSAL 5.3.1)",
    "np.like.kindsAllBtn": "each kind has one checkbox; there is no select-all row",
    "np.like.kindsNoneBtn": "each kind has one checkbox; there is no clear-all row",
    "np.like.single": "single settings sit under their kind (SETTINGS-PROPOSAL 5.3 item 2)",
    "np.like.fail": "the demo's reads never fail",
    "np.like.retry": "the demo's reads never fail",
    "np.like.setups": "the demo has no Saved setups (SETTINGS-PROPOSAL 5.7)",
}


def norm(s):
    return s.replace("’", "'").strip()


def main():
    spec = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SPEC
    text = spec.read_text(encoding="utf-8")
    theirs = {k: v.strip() for k, v in re.findall(r"^\| `(np\.(?:like|acct)\.[A-Za-z]+)` \| (.*?) \|$", text, re.M)}
    js = (HERE / "layer" / "copy.js").read_text(encoding="utf-8")
    m = re.search(r"const STR = \{(.*?)\n  \};", js, re.S)
    ours = {k: v for k, v in re.findall(r"'(np\.(?:like|acct)\.[A-Za-z]+)': '((?:[^'\\]|\\.)*)'", m.group(1))}
    same = differ = 0
    for k in sorted(set(theirs) | set(ours)):
        a, b = theirs.get(k), ours.get(k)
        if a is not None and b is not None and norm(a) == norm(b):
            same += 1
            continue
        differ += 1
        why = EXPECTED.get(k, "")
        if a is None:
            print(f"+ {k}: only in the copy sheet: {b!r} {('· ' + why) if why else ''}")
        elif b is None:
            print(f"- {k}: only in Split v2: {a!r} (not drawn here: {NOT_DRAWN.get(k, 'not used by this sheet')})")
        else:
            print(f"~ {k}: Split v2 {a!r} · here {b!r} {('· ' + why) if why else ''}")
    print(f"{same} keys the same, {differ} differ")


if __name__ == "__main__":
    main()
