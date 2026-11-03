#!/usr/bin/env python3
"""Read-only selected Projects refresh scope, schema, fixture and source checks."""
import argparse
import json
from pm_projects_refresh_contracts import check

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--schemas-only', action='store_true', help='omit the final F-b source-map byte join')
    args = parser.parse_args()
    report = check(schemas_only=args.schemas_only)
    print(json.dumps(report, indent=2))
    raise SystemExit(report['status'] != 'pass')
