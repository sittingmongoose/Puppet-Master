#!/usr/bin/env python3
"""Judge both app surfaces from a browser-check GPU recording at DPR 1.

The surface-qualified marks bound each resize. The exposed parent ground identifies
its first narrow frame. Compare the iframe pixels from that frame on against the
pre-shrink and settled narrow pictures. Unknown or missing evidence fails the run.
Frame indices in the output are relative to the decoded interval for each shrink.
"""

import json
import math
from pathlib import Path
import re
import subprocess
import sys


RESIZE_MARK = re.compile(r"(?:normal|sandbox) [a-z]+-(?:light|dark) rep [1-9][0-9]* (?:740|1920)")
FILM_ROW = "WLR-FILM "


def collect_cases(summary, log_lines):
    if summary.get("stopped") or summary.get("killed"):
        raise ValueError("the recording stopped before the check finished")
    # R133-FOLLOWUPS 4 (T75): a normally finalized summary with one complete passing pair and a check failure
    # before the next case's row or mark satisfies the pairing equality below on a strict subset of the requested
    # route. Acceptance is tied to the run's own census — the run finished and every requested check passed —
    # independent of the pair-consistency check.
    if summary.get("ok") is not True or summary.get("failed"):
        raise ValueError("the run's own checks did not all pass: the film covers a subset of the requested route, not the whole census")
    marks = {}
    for mark in summary.get("marks", []):
        label = mark["label"]
        if label in marks:
            raise ValueError(f"duplicate film mark: {label}")
        marks[label] = mark

    cases = {}
    for line in log_lines:
        if FILM_ROW not in line:
            continue
        case = json.loads(line.split(FILM_ROW, 1)[1])
        label = case["label"]
        if not RESIZE_MARK.fullmatch(label) or not label.endswith(" 740"):
            raise ValueError(f"invalid shrink label: {label}")
        if label in cases:
            raise ValueError(f"duplicate film case: {label}")
        cases[label] = case

    expected_marks = {label for cell in cases for label in (cell, cell[:-3] + "1920")}
    if not cases or expected_marks != {label for label in marks if RESIZE_MARK.fullmatch(label)}:
        raise ValueError("resize marks and film rows do not match (run the check with --set film=1)")

    def time_of(label):
        mark = marks[label]
        at = mark.get("at")
        if (not isinstance(at, (float, int)) or not math.isfinite(at) or at < 0
                or mark.get("beforeStart") or mark.get("afterStop")):
            raise ValueError(f"unusable film timestamp: {label}")
        return at

    result = []
    for label, case in cases.items():
        shrink, widen = time_of(label), time_of(label[:-3] + "1920")
        if widen <= shrink:
            raise ValueError(f"widen mark does not follow shrink: {label}")
        result.append({**case, "shrink": shrink, "widen": widen})
    result.sort(key=lambda case: case["shrink"])
    if any(a["widen"] >= b["shrink"] for a, b in zip(result, result[1:])):
        raise ValueError("resize intervals overlap")
    return result


def load_cases(run, film):
    run = Path(run)
    summary = json.loads((run / "summary.json").read_text(encoding="utf-8-sig"))
    recording = summary.get("recording") or {}
    if not recording.get("file"):
        raise ValueError("the run has no film recording")
    recorded_bytes = (recording.get("stop") or {}).get("bytes")
    if recorded_bytes and Path(film).stat().st_size != recorded_bytes:
        raise ValueError("the film size does not match the run's recording")
    with (run / "run.log").open(encoding="utf-8-sig") as log:
        return collect_cases(summary, log)


def probe(film):
    args = ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
            "stream=width,height,r_frame_rate", "-of", "json", str(film)]
    streams = json.loads(subprocess.check_output(args))["streams"]
    if not streams:
        raise ValueError("the recording has no video stream")
    stream = streams[0]
    num, den = map(int, stream["r_frame_rate"].split("/"))
    if not num or not den:
        raise ValueError("the recording has no usable frame rate")
    return stream["width"], stream["height"], num / den


def pixel_samples(film, width, height, case):
    """Keep native pixels at fixed locations within and to the right of the shrunken iframe."""
    x, y = case["x"], case["y"]
    if (not isinstance(x, int) or not isinstance(y, int) or x < 0 or y < 0
            or x + 820 > width or y + 768 > height):
        raise ValueError("the frame origin or its exposed ground is outside the film")

    # Stay clear of the boundary and the iframe's label. The parent ground is sampled only
    # in the strip covered by the wide iframe and exposed at 740.
    right = [(row * width + col) * 3
             for row in range(y + 30, y + 740, 61)
             for col in range(x + 780, min(width - 10, x + 1900), 53)]
    left = [((row * width + x + 5) * 3, (row * width + x + 735) * 3)
            for row in range(y + 5, y + 763, 8)]
    start = max(0, case["shrink"] - 0.25)
    end = case["widen"] - 0.05
    args = ["ffmpeg", "-v", "error", "-ss", f"{start:.6f}", "-i", str(film),
            "-t", f"{end - start:.6f}", "-map", "0:v:0", "-fps_mode", "passthrough",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    frames = []
    frame_size = width * height * 3
    with subprocess.Popen(args, stdout=subprocess.PIPE) as decoder:
        while frame := decoder.stdout.read(frame_size):
            if len(frame) != frame_size:
                raise ValueError("the decoder returned a partial frame")
            ground = b"".join(frame[i:i + 3] for i in right)
            picture = b"".join(frame[a + channel:b:24] for a, b in left for channel in range(3))
            frames.append((ground, picture))
        if decoder.wait():
            raise ValueError("ffmpeg could not decode the resize interval")
    return frames


def distance(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def judge(frames):
    if len(frames) < 3:
        return {"verdict": "not proven", "why": "too few film frames"}
    ground, narrow = frames[-1]

    def exposed(right):
        return all(abs(a - b) < 12 for a, b in zip(right, ground))

    first = next(i for i, (right, _) in enumerate(frames) if exposed(right))
    if not first or first == len(frames) - 1 or not all(exposed(right) for right, _ in frames[first:]):
        return {"verdict": "not proven", "why": "no sustained parent-size transition on film"}
    wide = frames[first - 1][1]
    gap = distance(wide, narrow)
    if gap < 7:
        return {"verdict": "not proven", "why": "wide and settled narrow references are too similar"}

    painted = []
    for _, picture in frames[first:]:
        to_wide, to_narrow = distance(picture, wide), distance(picture, narrow)
        # Require a clear match to one reference. Compression and movement may perturb pixels.
        if to_wide <= gap / 2 and to_narrow - to_wide >= gap / 4:
            painted.append("wide")
        elif to_narrow <= gap / 2 and to_wide - to_narrow >= gap / 4:
            painted.append("narrow")
        else:
            painted.append("unknown")

    wide_frames = [first + i for i, paint in enumerate(painted) if paint == "wide"]
    unknown = [first + i for i, paint in enumerate(painted) if paint == "unknown"]
    verdict = "fail" if wide_frames else "not proven" if unknown else "pass"
    return {"verdict": verdict, "firstAt740": first, "firstAppPaint": first + painted.index("narrow"),
            "wideFrames": wide_frames, "unclassifiedFrames": unknown}


def read(film, run, out):
    cases = load_cases(run, film)
    width, height, fps = probe(film)
    results = []
    for case in cases:
        result = {"label": case["label"], "markAt": case["shrink"]}
        result.update(judge(pixel_samples(film, width, height, case)))
        results.append(result)
        print(json.dumps(result), flush=True)
    passed = sum(row["verdict"] == "pass" for row in results)
    ok = passed == len(results)
    report = {"fps": fps, "pass": ok, "cases": results}
    Path(out).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"{passed}/{len(results)} shrinks show narrow content from the first frame at 740")
    return 0 if ok else 1


def selftest():
    marks, rows = [], []
    for mode, at in [("normal", 1), ("sandbox", 3)]:
        cell = f"{mode} basic-light rep 1"
        marks.extend([{"label": cell + " 740", "at": at}, {"label": cell + " 1920", "at": at + 1}])
        rows.append(FILM_ROW + json.dumps({"label": cell + " 740", "x": 0, "y": 0}))
    assert [case["shrink"] for case in collect_cases({"marks": marks, "ok": True, "failed": 0}, rows)] == [1, 3]
    try:
        collect_cases({"marks": marks + [marks[0]], "ok": True, "failed": 0}, rows)
    except ValueError as error:
        assert str(error) == "duplicate film mark: normal basic-light rep 1 740"
    else:
        raise AssertionError("duplicate film marks accepted")

    # R133-FOLLOWUPS 4 (T75): a normally finalized summary with one complete passing pair and a check failure
    # before the next case's row or mark satisfies the pairing equality on a strict subset of the requested route.
    # Acceptance must be tied to the run's own census, independent of the pair consistency.
    for bad in (
        {"marks": marks[:2], "ok": False, "failed": 1, "checks": 3},
        {"marks": marks[:2], "ok": True, "failed": 1, "checks": 3},
        {"marks": marks, "ok": None, "failed": 0, "checks": 0},
    ):
        try:
            collect_cases(bad, rows[:1] if bad["marks"] == marks[:2] else rows)
        except ValueError as error:
            assert "subset of the requested route" in str(error), str(error)
        else:
            raise AssertionError("a finalized summary whose census did not complete accepted as the whole route")

    wide = (b"\x55" * 3, b"\x00" * 9)
    retained = (b"\x11" * 3, wide[1])
    narrow = (retained[0], b"\xff" * 9)
    ambiguous = (retained[0], b"\x7f" * 9)
    assert judge([wide, narrow, narrow])["verdict"] == "pass"
    assert judge([wide, retained, narrow, narrow])["wideFrames"] == [1]
    assert judge([wide, ambiguous, narrow, narrow])["verdict"] == "not proven"
    assert judge([narrow, narrow, narrow])["verdict"] == "not proven"
    assert judge([wide, retained, retained])["verdict"] == "not proven"
    print("PASS window-layout-film-reader: paired and duplicate marks, first narrow paint, retained wide, ambiguous and missing evidence")
    return 0


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        sys.exit(selftest())
    if len(sys.argv) != 4:
        sys.exit("usage: window-layout-film-reader.py <film.mp4> <run folder> <out.json> | --selftest")
    try:
        sys.exit(read(*sys.argv[1:]))
    except (OSError, ValueError, KeyError, subprocess.SubprocessError) as error:
        sys.exit(f"window-layout-film-reader: {error}")
