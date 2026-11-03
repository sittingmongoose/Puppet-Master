#!/usr/bin/env python3
"""Validate reviewed Settings metadata and static semantic fixtures, read only."""
import json
from pm_settings_layering import check

if __name__ == '__main__':
    errors, counts = check()
    print(json.dumps({'check': 'settings-layering', 'status': 'fail' if errors else 'pass',
                      'claim_boundary': 'static_contract_only', 'counts': dict(counts), 'failures': errors}, indent=2))
    raise SystemExit(bool(errors))
