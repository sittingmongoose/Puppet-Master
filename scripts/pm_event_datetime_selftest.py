#!/usr/bin/env python3
"""Run the NUMRULE corpus and its date-time inventory gate."""

import argparse
import json
from pathlib import Path

from pm_event_numbers import self_test


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, allow_abbrev=False)
    parser.add_argument("--self-test", action="store_true", required=True,
                        help="run the all-scope NUMRULE suite, including date-time inventory admission")
    parser.parse_args()
    corpus = Path(__file__).resolve().parents[1] / "Plans/event_number_recipe_corpus.json"
    result = self_test(corpus, scope="all")
    print(json.dumps(result, indent=2, sort_keys=True))
    return int(result["status"] != "pass")


if __name__ == "__main__":
    raise SystemExit(main())
