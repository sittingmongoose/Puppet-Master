#!/usr/bin/env python3
"""Default boards for the Usage redesign (B v2): one source for every room's curated board at each board class.

  python3 Concepts/usage-redesign/tools/boards.py            # write src/js/62-boards-data.js (data only)
  python3 Concepts/usage-redesign/tools/boards.py --md FILE  # also write the BOARDS.md tables for the design spec
  python3 Concepts/usage-redesign/tools/boards.py --check    # validate only; exit 1 on a problem

Owner: content. The engine reads the result as PMU_BOARDS (ARCHITECTURE.md section 5). Every board is packed here with
the same first-fit rule the engine uses for projection, so x and y are explicit in the output and the engine never
auto-flows a default. Checks: sizes inside the kind's range, no overlap, no hole at any disclosure level, every widget
id of the old page placed (or mapped in MIGRATE), and each room in canon order.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
SRC = PKG / 'src'
OUT_JS = SRC / 'js' / '62-boards-data.js'

CLASSES = {'S': 12, 'M': 20, 'L': 24}            # XL (30 tracks) is projected from L by the engine
ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics', 'ledger', 'attention', 'cache',
         'tools', 'signals', 'authority']
LEVELS = {'G': 'glance', 'D': 'detailed', 'X': 'diagnostics'}

# kind: (wMin, wMax, hMin, hMax, presets)   wMax None = board width
KINDS = {
    'kpi':       (3, 12, 3, 8, [('Strip', 4, 3), ('Compact', 3, 4), ('Standard', 4, 4), ('Wide', 6, 4), ('Tall', 4, 6), ('Expanded', 6, 6), ('Maximum', 8, 6)]),
    'limit':     (3, 10, 3, 12, [('Strip', 6, 3), ('Compact', 4, 6), ('Standard', 4, 8), ('Wide', 6, 7), ('Expanded', 8, 9), ('Maximum', 10, 11)]),
    'provider':  (3, None, 3, 16, [('Strip', 6, 3), ('Compact', 4, 5), ('Standard', 4, 7), ('Wide', 6, 6), ('Expanded', 8, 9), ('Group', 10, 10), ('Group wide', 14, 10), ('Group full', 20, 10)]),
    'switch':    (4, None, 3, 8, [('Strip', 12, 3), ('Wide', 20, 3), ('Two lines', 10, 4), ('Panel', 4, 8)]),
    'providers': (4, 10, 3, 9, [('Compact', 4, 4), ('Standard', 6, 5), ('Wide', 10, 4)]),
    'setup':     (4, 16, 3, 8, [('Strip', 6, 3), ('Standard', 5, 6), ('Wide', 8, 5)]),
    'context':   (4, 12, 5, 10, [('Compact', 4, 6), ('Tall', 4, 8), ('Standard', 6, 6), ('Wide', 9, 6), ('Expanded', 12, 7)]),
    'trend':     (4, None, 4, 14, [('Compact', 5, 5), ('Standard', 8, 7), ('Wide', 12, 7), ('Tall', 8, 10), ('Full', 20, 8)]),
    'columns':   (4, None, 4, 12, [('Compact', 5, 5), ('Standard', 8, 7), ('Wide', 12, 6)]),
    'budget':    (5, None, 5, 12, [('Compact', 5, 6), ('Standard', 8, 8), ('Wide', 12, 8)]),
    'heat':      (6, None, 5, 10, [('Compact', 6, 6), ('Standard', 10, 7), ('Wide', 14, 7)]),
    'timeline':  (5, None, 4, 14, [('Compact', 5, 8), ('Standard', 8, 8), ('Wide', 12, 8)]),
    'ranked':    (4, 14, 4, 12, [('Compact', 4, 6), ('Standard', 5, 7), ('Wide', 8, 6), ('Tall', 5, 10)]),
    'mix':       (4, None, 3, 9, [('Compact', 4, 4), ('Standard', 6, 5), ('Wide', 10, 5)]),
    'list':      (4, None, 3, 14, [('Compact', 4, 5), ('Standard', 5, 7), ('Wide', 8, 6), ('Full', 12, 7)]),
    'table':     (6, None, 5, 20, [('Standard', 10, 10), ('Wide', 14, 10), ('Tall', 10, 16), ('Full', 20, 12)]),
    'alert':     (4, 10, 4, 9, [('Compact', 4, 6), ('Standard', 5, 7), ('Wide', 8, 6)]),
    'free':      (3, 8, 4, 9, [('Compact', 4, 6), ('Standard', 4, 7), ('Wide', 6, 6)]),
    'cache':     (3, 8, 4, 9, [('Compact', 4, 6), ('Standard', 4, 7), ('Wide', 6, 6)]),
    'gauge':     (3, 8, 4, 8, [('Compact', 4, 5), ('Standard', 5, 6), ('Wide', 8, 5)]),
}

# id: (kind, level, title, meta). Titles and metas are the old page's (PARITY section 2), with countdown-free wording.
W = {
    # Overview
    'health': ('kpi', 'G', 'Usage health', '6 routes'),
    'month': ('kpi', 'G', 'Selected window value', 'range'),
    'cache-saved': ('kpi', 'G', 'Cache savings', 'estimated'),
    'active-runs': ('kpi', 'G', 'Active runs', 'right now'),
    'next-reset': ('kpi', 'G', 'Next reset', 'allowance clock'),
    'plan-claude': ('limit', 'G', 'Claude', '5-hour window'),
    'plan-codex': ('limit', 'G', 'ChatGPT / Codex', '5-hour window'),
    'plan-qwen': ('limit', 'G', 'Qwen Coding Plan', 'Weekly window'),
    'plan-gemini': ('limit', 'G', 'Gemini API', 'Monthly budget'),
    'plan-kimi': ('limit', 'G', 'Kimi Code', 'Weekly window'),
    'plan-copilot': ('limit', 'G', 'GitHub Copilot', 'Premium requests'),
    'context-now': ('context', 'G', 'Context window', 'current thread'),
    'budget-now': ('budget', 'G', 'Budget projection', 'month to date'),
    'plan-value-now': ('mix', 'G', 'Plan allocation', 'range'),
    'attention-now': ('list', 'G', 'Attention', '2 current'),
    'route-pressure': ('ranked', 'G', 'Route pressure', 'current pace'),
    'ov-resets': ('timeline', 'G', 'Upcoming resets', 'next 24 hours'),
    'ov-headroom': ('switch', 'G', 'Headroom and auto-switch', 'shared with Settings'),
    'forecast': ('columns', 'D', 'Spend projection', 'range basis'),
    'completion-capacity': ('kpi', 'D', 'Completion capacity', 'current window'),
    'capacity-reservations': ('kpi', 'D', 'Capacity reservations', 'current runs'),
    'run-attribution': ('table', 'X', 'Run attribution', 'current work'),
    # Plans & limits
    'reset-map': ('timeline', 'G', 'Upcoming resets', 'next 7 days'),
    'quota-history': ('trend', 'G', 'Quota history', 'per account window'),
    'plan-settlement': ('table', 'G', 'Billing, entitlement, settlement', 'range'),
    'plan-pressure': ('ranked', 'X', 'Pressure order', 'current pace'),
    'plan-authority': ('list', 'X', 'Allowance authority', 'diagnostics'),
    'allowance-attribution': ('mix', 'X', 'Allowance attribution', 'work versus probes'),
    'counting-basis': ('list', 'X', 'Counting basis', 'inclusive versus additive'),
    'native-allowance-units': ('list', 'X', 'Native allowance units', 'provider semantics'),
    # Costs
    'cost-month': ('kpi', 'G', 'Selected window value', 'range'),
    'cost-api': ('kpi', 'G', 'Settled API charges', 'range'),
    'cost-plan': ('kpi', 'G', 'Plan allocation estimate', 'range'),
    'cost-save': ('kpi', 'G', 'Cache avoided estimate', 'range'),
    'budget': ('budget', 'G', 'Budget projection', 'month to date'),
    'cost-spend': ('columns', 'G', 'Spend', 'today · 7 days · 30 days'),
    'provider-cost': ('ranked', 'G', 'Provider value', 'range'),
    'cost-authority': ('list', 'G', 'Cost authority', 'one billing model'),
    'cost-trend': ('columns', 'G', 'Attempt value sequence', 'range'),
    'pricing-confidence': ('list', 'X', 'Value authority', 'range'),
    'burn-basis': ('kpi', 'X', 'Burn basis', 'forecast inputs'),
    # Accounts (review roster; the engine derives provider widgets from the Settings roster at runtime)
    'acct-switch': ('switch', 'G', 'Auto-switch', 'shared with Settings'),
    'acct-claude-code': ('provider', 'G', 'Claude', '4 accounts'),
    'acct-openai-codex': ('provider', 'G', 'ChatGPT / Codex', '3 accounts'),
    'acct-github-copilot': ('provider', 'G', 'GitHub Copilot', '2 accounts'),
    'acct-qwen-coding': ('provider', 'G', 'Qwen Coding Plan', '2 accounts'),
    'acct-kimi-coding': ('provider', 'G', 'Kimi Code', 'Active'),
    'acct-muse': ('provider', 'G', 'Muse Code', 'Standby'),
    'acct-antigravity': ('provider', 'G', 'Google Antigravity', 'Standby'),
    'acct-zai-coding': ('provider', 'G', 'Z.AI Coding Plan', 'Standby'),
    'acct-opencode-go': ('provider', 'G', 'OpenCode Go', 'Standby'),
    'acct-more-plan': ('providers', 'G', 'More plans', 'not set up'),
    'acct-anthropic-api': ('provider', 'G', 'Anthropic API', 'Standby'),
    'acct-gemini-direct': ('provider', 'G', 'Gemini API', 'Active'),
    'acct-cursor-cli': ('provider', 'G', 'Cursor', 'Standby'),
    'acct-more-use': ('providers', 'G', 'More pay as you go', 'not set up'),
    'acct-more-own': ('providers', 'G', 'Free and your own', 'routes and servers'),
    'acct-opencode-personal-setup': ('setup', 'G', 'OpenCode on your computer', 'Needs setup'),
    'acct-history': ('list', 'G', 'Switch history', 'last 48 hours'),
    'acct-resets': ('timeline', 'G', 'Account resets', 'next 7 days'),
    'routing': ('list', 'D', 'Account routing', 'current'),
    'account-fallbacks': ('list', 'D', 'Fallback reasons', 'last 24h'),
    'route-mismatches': ('table', 'D', 'Requested versus effective', 'fallback evidence'),
    'credential-ownership': ('list', 'X', 'Credential ownership', 'routing authority'),
    'connection-authority': ('list', 'X', 'Connection authority', 'credential and receipt source'),
    # Free models
    'free-0': ('free', 'G', 'GLM-4.5-Air', 'Ready'),
    'free-1': ('free', 'G', 'Qwen3-Coder-Free', 'Cooldown'),
    'free-2': ('free', 'G', 'Gemini Flash Free', 'Ready'),
    'free-3': ('free', 'G', 'Local Qwen 7B', 'Ready'),
    'free-route': ('list', 'G', 'Fallback order', 'free routes'),
    'cooldown-eligibility': ('list', 'G', 'Cooldown and eligibility', 'free-route state'),
    'free-throughput': ('trend', 'D', 'Free throughput', '24 hours'),
    'free-history': ('trend', 'D', 'Free usage', '7 days'),
    'free-source-state': ('list', 'X', 'Free source state', 'catalog versus local'),
    # Context
    'ctx-window': ('context', 'G', 'Current window', 'thread main'),
    'ctx-cache': ('kpi', 'G', 'Context cache read share', 'current thread'),
    'ctx-reclaim': ('kpi', 'G', 'Compactable', 'current thread'),
    'ctx-output': ('kpi', 'G', 'Output reserve', 'current thread'),
    'ctx-route': ('kpi', 'G', 'Effective route', 'current thread'),
    'ctx-sources': ('ranked', 'G', 'Source mix', 'tokens'),
    'ctx-limits': ('ranked', 'G', 'Model limits', 'effective routes'),
    'context-composition': ('mix', 'D', 'Context composition', 'current thread'),
    'ctx-maint': ('list', 'X', 'Maintenance history', 'last 24h'),
    'ctx-routing': ('list', 'X', 'Routing trace', 'requested vs effective'),
    'compaction-history': ('list', 'X', 'Compaction history', 'current thread'),
    # Analytics
    'tok-claude': ('kpi', 'G', 'Claude tokens', 'range'),
    'tok-codex': ('kpi', 'G', 'Codex tokens', 'range'),
    'tok-qwen': ('kpi', 'G', 'Qwen tokens', 'range'),
    'tok-gemini': ('kpi', 'G', 'Gemini tokens', 'range'),
    'tok-kimi': ('kpi', 'G', 'Kimi tokens', 'range'),
    'tok-copilot': ('kpi', 'G', 'Copilot tokens', 'range'),
    'token-trend': ('trend', 'G', 'Token volume', 'range'),
    'model-mix': ('ranked', 'G', 'Model mix', 'attempts'),
    'activity-heat': ('heat', 'G', 'Activity by hour', 'last 7 days'),
    'cache-read-share': ('trend', 'D', 'Cache-read share', 'range'),
    'reasoning-mix': ('trend', 'D', 'Reasoning mix', 'reported buckets'),
    'an-quota-history': ('trend', 'D', 'Quota history', 'per account window'),
    'token-counting-basis': ('list', 'X', 'Token counting basis', 'provider semantics'),
    'unknown-token-buckets': ('kpi', 'X', 'Unknown token buckets', 'current range'),
    # Ledger
    'ledger-count': ('kpi', 'G', 'Attempts', 'range'),
    'ledger-errors': ('kpi', 'G', 'Pending settlement', 'range'),
    'ledger-routes': ('kpi', 'G', 'Effective routes', 'range'),
    'settlement-states': ('mix', 'G', 'Settlement states', 'range'),
    'ledger-main': ('table', 'G', 'Recent attempts', 'range'),
    'ledger-events': ('list', 'G', 'Usage events', 'today'),
    'attempt-lineage': ('table', 'D', 'Attempt lineage', 'receipt chain'),
    'ledger-coverage': ('kpi', 'X', 'Identity coverage', 'range'),
    'ledger-export': ('kpi', 'X', 'Receipts', 'range'),
    'usage-record-state': ('list', 'X', 'Usage record state', 'settlement lifecycle'),
    # Attention
    'alert-0': ('alert', 'G', 'Claude allowance pressure', 'now'),
    'alert-1': ('alert', 'G', 'Gemini API burn changed', '12m ago'),
    'alert-2': ('alert', 'G', 'Qwen weekly headroom', '1h ago'),
    'attention-policy': ('kpi', 'G', 'Policy state', 'current'),
    'anom': ('trend', 'D', 'Anomaly comparison', '24h'),
    'attention-history': ('columns', 'D', 'Alert history', '7 days'),
    # Prompt cache
    'cache-0': ('cache', 'G', 'Claude', 'prompt cache'),
    'cache-1': ('cache', 'G', 'ChatGPT / Codex', 'prompt cache'),
    'cache-2': ('cache', 'G', 'Qwen Coding Plan', 'prompt cache'),
    'cache-3': ('cache', 'G', 'Gemini API', 'prompt cache'),
    'cache-trend': ('trend', 'G', 'Savings trend', '30 days'),
    'cache-authority': ('list', 'X', 'Reporting state', 'routes'),
    'cache-economics': ('ranked', 'X', 'Cache economics', 'month'),
    'cache-break-even': ('kpi', 'X', 'Cache break-even', 'month'),
    # Tools
    'tool-0': ('kpi', 'G', 'run_shell_command', 'range'),
    'tool-1': ('kpi', 'G', 'browser_exec', 'range'),
    'tool-2': ('kpi', 'G', 'read_file', 'range'),
    'tool-3': ('kpi', 'G', 'image_gen', 'range'),
    'tool-4': ('kpi', 'G', 'git', 'range'),
    'tool-health': ('gauge', 'G', 'Tool health', 'current'),
    'tool-list': ('table', 'G', 'Tool details', 'range'),
    'tool-latency': ('trend', 'D', 'Tool latency', 'p50 to p95'),
    'tool-receipts': ('kpi', 'X', 'Receipt coverage', 'current'),
    'operations-window': ('list', 'X', 'Maintenance and operations', '24 hours'),
    'tool-allowance': ('ranked', 'X', 'Tool allowance impact', 'provider-bearing calls'),
    'catalog-refresh': ('list', 'X', 'Catalog refresh', 'never active probing'),
    # Signals
    'signal-0': ('kpi', 'G', 'Provider health', 'current'),
    'signal-1': ('kpi', 'G', 'Usage sync', 'current'),
    'signal-2': ('kpi', 'G', 'Price catalog', 'current'),
    'signal-3': ('kpi', 'G', 'Unpriced events', 'current'),
    'signal-list': ('list', 'G', 'All signals', 'current'),
    'signal-history': ('trend', 'X', 'Signal history', '24h'),
    'signal-coverage': ('kpi', 'X', 'Coverage', 'current'),
    'signal-authority-map': ('list', 'X', 'Signal authority map', 'reading provenance'),
    # Source authority
    'auth-summary': ('kpi', 'G', 'Provider reported', 'current'),
    'auth-est': ('kpi', 'G', 'PM estimates', 'current'),
    'auth-stale': ('kpi', 'G', 'Stale readings', 'current'),
    'auth-coverage': ('kpi', 'G', 'Authority coverage', 'current'),
    'auth-list': ('list', 'D', 'Current sources', 'diagnostics'),
    'pricing-provenance': ('list', 'D', 'Pricing provenance', 'current range'),
    'provider-probe-state': ('list', 'X', 'Provider probe state', 'per installation'),
    'unknown-versus-zero': ('list', 'X', 'Unknown versus zero', 'reporting semantics'),
}

# Room boards per class: ordered "id wxh" (G first, then D, then X, so every level is a prefix with no hole).
B = {
    'overview': {
        'S': 'health 4x4 month 4x4 cache-saved 4x4 active-runs 4x4 next-reset 4x4 plan-value-now 4x4 ov-headroom 12x3 '
             'plan-claude 4x8 plan-codex 4x8 plan-qwen 4x8 plan-gemini 4x8 context-now 8x8 budget-now 7x8 attention-now 5x8 '
             'ov-resets 7x8 route-pressure 5x8 '
             'forecast 12x7 completion-capacity 6x5 capacity-reservations 6x5 run-attribution 12x7',
        'M': 'health 4x4 month 4x4 cache-saved 4x4 active-runs 4x4 next-reset 4x4 '
             'plan-claude 4x8 plan-codex 4x8 plan-qwen 4x8 plan-gemini 4x8 context-now 4x8 '
             'budget-now 8x8 attention-now 6x8 ov-resets 6x8 plan-value-now 6x6 route-pressure 7x6 ov-headroom 7x6 '
             'forecast 10x7 completion-capacity 5x7 capacity-reservations 5x7 run-attribution 10x7',
        'L': 'health 4x4 month 4x4 cache-saved 4x4 active-runs 4x4 next-reset 4x4 plan-value-now 4x4 '
             'plan-claude 4x8 plan-codex 4x8 plan-qwen 4x8 plan-gemini 4x8 context-now 4x8 attention-now 4x8 '
             'budget-now 8x8 ov-resets 8x8 route-pressure 4x8 ov-headroom 4x8 '
             'forecast 12x7 completion-capacity 6x7 capacity-reservations 6x7 run-attribution 12x7',
    },
    'plans': {
        'S': 'plan-claude 4x8 plan-codex 4x8 plan-qwen 4x8 plan-gemini 4x8 plan-kimi 4x8 plan-copilot 4x8 '
             'reset-map 12x8 quota-history 12x8 plan-settlement 12x8 '
             'plan-pressure 6x7 plan-authority 6x7 allowance-attribution 12x5 counting-basis 6x8 native-allowance-units 6x8',
        'M': 'plan-claude 4x8 plan-codex 4x8 plan-qwen 4x8 plan-gemini 4x8 plan-kimi 4x8 '
             'plan-copilot 4x8 reset-map 8x8 quota-history 8x8 plan-settlement 20x7 '
             'plan-pressure 7x7 plan-authority 7x7 allowance-attribution 6x7 counting-basis 10x7 native-allowance-units 10x7',
        'L': 'plan-claude 4x8 plan-codex 4x8 plan-qwen 4x8 plan-gemini 4x8 plan-kimi 4x8 plan-copilot 4x8 '
             'reset-map 12x8 quota-history 12x8 plan-settlement 24x7 '
             'plan-pressure 8x7 plan-authority 8x7 allowance-attribution 8x7 counting-basis 12x7 native-allowance-units 12x7',
    },
    'costs': {
        'S': 'cost-month 6x4 cost-api 6x4 cost-plan 6x4 cost-save 6x4 budget 12x9 cost-spend 6x8 provider-cost 6x8 '
             'cost-authority 12x7 cost-trend 12x6 pricing-confidence 12x6 burn-basis 12x6',
        'M': 'cost-month 5x4 cost-api 5x4 cost-plan 5x4 cost-save 5x4 budget 12x9 cost-spend 8x9 '
             'provider-cost 10x7 cost-authority 10x7 cost-trend 20x6 pricing-confidence 10x6 burn-basis 10x6',
        'L': 'cost-month 6x4 cost-api 6x4 cost-plan 6x4 cost-save 6x4 budget 12x9 cost-spend 6x9 provider-cost 6x9 '
             'cost-authority 10x7 cost-trend 14x7 pricing-confidence 12x6 burn-basis 12x6',
    },
    'accounts': {
        'S': 'acct-switch 12x4 acct-claude-code 12x10 acct-openai-codex 12x10 acct-github-copilot 12x6 acct-qwen-coding 12x6 '
             'acct-kimi-coding 4x6 acct-muse 4x6 acct-antigravity 4x6 acct-zai-coding 4x6 acct-opencode-go 4x6 acct-more-plan 4x6 '
             'acct-anthropic-api 4x6 acct-gemini-direct 4x6 acct-cursor-cli 4x6 acct-more-use 6x7 acct-more-own 6x7 '
             'acct-opencode-personal-setup 12x5 acct-history 12x8 acct-resets 12x8 '
             'routing 12x7 account-fallbacks 12x7 route-mismatches 12x8 credential-ownership 12x7 connection-authority 12x8',
        'M': 'acct-switch 20x3 acct-claude-code 10x10 acct-openai-codex 10x10 acct-github-copilot 10x6 acct-qwen-coding 10x6 '
             'acct-kimi-coding 4x6 acct-muse 4x6 acct-antigravity 4x6 acct-zai-coding 4x6 acct-opencode-go 4x6 '
             'acct-more-plan 4x7 acct-anthropic-api 4x7 acct-gemini-direct 4x7 acct-cursor-cli 4x7 acct-more-use 4x7 '
             'acct-more-own 5x5 acct-opencode-personal-setup 15x5 acct-history 10x8 acct-resets 10x8 '
             'routing 10x7 account-fallbacks 10x7 route-mismatches 20x7 credential-ownership 10x7 connection-authority 10x7',
        'L': 'acct-switch 24x3 acct-claude-code 12x10 acct-openai-codex 12x10 acct-github-copilot 8x6 acct-qwen-coding 8x6 '
             'acct-kimi-coding 4x6 acct-muse 4x6 acct-antigravity 4x6 acct-zai-coding 4x6 acct-opencode-go 4x6 acct-more-plan 4x6 '
             'acct-anthropic-api 4x6 acct-gemini-direct 4x6 acct-cursor-cli 4x6 acct-more-use 8x6 acct-more-own 4x6 '
             'acct-opencode-personal-setup 8x6 acct-history 12x8 acct-resets 12x8 '
             'routing 8x7 account-fallbacks 8x7 route-mismatches 8x7 credential-ownership 12x7 connection-authority 12x7',
    },
    'free': {
        'S': 'free-0 6x7 free-1 6x7 free-2 6x7 free-3 6x7 free-route 12x6 cooldown-eligibility 12x6 '
             'free-throughput 12x7 free-history 12x7 free-source-state 12x6',
        'M': 'free-0 5x7 free-1 5x7 free-2 5x7 free-3 5x7 free-route 10x6 cooldown-eligibility 10x6 '
             'free-throughput 10x7 free-history 10x7 free-source-state 20x5',
        'L': 'free-0 6x7 free-1 6x7 free-2 6x7 free-3 6x7 free-route 12x6 cooldown-eligibility 12x6 '
             'free-throughput 12x7 free-history 12x7 free-source-state 24x5',
    },
    'context': {
        'S': 'ctx-window 6x8 ctx-cache 6x4 ctx-reclaim 6x4 ctx-output 6x4 ctx-route 6x4 ctx-sources 12x7 ctx-limits 12x7 '
             'context-composition 12x5 ctx-maint 12x6 ctx-routing 12x6 compaction-history 12x6',
        'M': 'ctx-window 6x8 ctx-cache 7x4 ctx-reclaim 7x4 ctx-output 7x4 ctx-route 7x4 ctx-sources 10x7 ctx-limits 10x7 '
             'context-composition 20x5 ctx-maint 7x7 ctx-routing 7x7 compaction-history 6x7',
        'L': 'ctx-window 8x8 ctx-cache 8x4 ctx-reclaim 8x4 ctx-output 8x4 ctx-route 8x4 ctx-sources 12x7 ctx-limits 12x7 '
             'context-composition 24x5 ctx-maint 8x7 ctx-routing 8x7 compaction-history 8x7',
    },
    'analytics': {
        'S': 'tok-claude 4x4 tok-codex 4x4 tok-qwen 4x4 tok-gemini 4x4 tok-kimi 4x4 tok-copilot 4x4 token-trend 12x8 '
             'model-mix 12x8 activity-heat 12x6 cache-read-share 6x6 reasoning-mix 6x6 an-quota-history 12x6 '
             'token-counting-basis 12x7 unknown-token-buckets 12x6',
        'M': 'tok-claude 5x4 tok-codex 5x4 tok-qwen 5x4 tok-gemini 5x4 tok-kimi 5x4 token-trend 15x8 tok-copilot 5x4 '
             'model-mix 10x8 activity-heat 10x8 cache-read-share 7x6 reasoning-mix 7x6 an-quota-history 6x6 '
             'token-counting-basis 10x7 unknown-token-buckets 10x7',
        'L': 'tok-claude 4x4 tok-codex 4x4 tok-qwen 4x4 tok-gemini 4x4 tok-kimi 4x4 tok-copilot 4x4 token-trend 16x8 '
             'model-mix 8x8 activity-heat 24x6 cache-read-share 8x6 reasoning-mix 8x6 an-quota-history 8x6 '
             'token-counting-basis 12x7 unknown-token-buckets 12x7',
    },
    'ledger': {
        'S': 'ledger-count 4x4 ledger-errors 4x4 ledger-routes 4x4 settlement-states 12x4 ledger-main 12x12 ledger-events 12x9 '
             'attempt-lineage 12x8 ledger-coverage 6x4 ledger-export 6x4 usage-record-state 12x6',
        'M': 'ledger-count 5x4 ledger-errors 5x4 ledger-routes 5x4 settlement-states 5x4 ledger-main 14x11 ledger-events 6x11 '
             'attempt-lineage 20x7 ledger-coverage 5x5 ledger-export 5x5 usage-record-state 10x5',
        'L': 'ledger-count 6x4 ledger-errors 6x4 ledger-routes 6x4 settlement-states 6x4 ledger-main 17x11 ledger-events 7x11 '
             'attempt-lineage 24x7 ledger-coverage 6x5 ledger-export 6x5 usage-record-state 12x5',
    },
    'attention': {
        'S': 'alert-0 6x8 alert-1 6x8 alert-2 6x8 attention-policy 6x8 anom 12x7 attention-history 12x7',
        'M': 'alert-0 5x8 alert-1 5x8 alert-2 5x8 attention-policy 5x8 anom 10x7 attention-history 10x7',
        'L': 'alert-0 6x8 alert-1 6x8 alert-2 6x8 attention-policy 6x8 anom 12x7 attention-history 12x7',
    },
    'cache': {
        'S': 'cache-0 6x7 cache-1 6x7 cache-2 6x7 cache-3 6x7 cache-trend 12x6 cache-authority 12x5 cache-economics 12x5 '
             'cache-break-even 12x4',
        'M': 'cache-0 5x7 cache-1 5x7 cache-2 5x7 cache-3 5x7 cache-trend 20x6 cache-authority 7x6 cache-economics 7x6 '
             'cache-break-even 6x6',
        'L': 'cache-0 6x7 cache-1 6x7 cache-2 6x7 cache-3 6x7 cache-trend 24x6 cache-authority 8x6 cache-economics 8x6 '
             'cache-break-even 8x6',
    },
    'tools': {
        'S': 'tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-health 4x4 tool-list 12x8 tool-latency 12x6 '
             'tool-receipts 4x6 operations-window 8x6 tool-allowance 12x7 catalog-refresh 12x7',
        'M': 'tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-health 5x7 tool-list 15x7 tool-latency 20x6 '
             'tool-receipts 5x6 operations-window 15x6 tool-allowance 10x7 catalog-refresh 10x7',
        'L': 'tool-health 4x4 tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-list 24x7 tool-latency 24x6 '
             'tool-receipts 6x6 operations-window 18x6 tool-allowance 12x7 catalog-refresh 12x7',
    },
    'signals': {
        'S': 'signal-0 6x4 signal-1 6x4 signal-2 6x4 signal-3 6x4 signal-list 12x6 signal-history 12x7 signal-coverage 12x4 '
             'signal-authority-map 12x6',
        'M': 'signal-0 5x4 signal-1 5x4 signal-2 5x4 signal-3 5x4 signal-list 20x5 signal-history 14x7 signal-coverage 6x7 '
             'signal-authority-map 20x6',
        'L': 'signal-0 6x4 signal-1 6x4 signal-2 6x4 signal-3 6x4 signal-list 24x5 signal-history 16x7 signal-coverage 8x7 '
             'signal-authority-map 24x6',
    },
    'authority': {
        'S': 'auth-summary 6x6 auth-est 6x6 auth-stale 6x6 auth-coverage 6x6 auth-list 12x7 pricing-provenance 12x7 '
             'provider-probe-state 12x8 unknown-versus-zero 12x8',
        'M': 'auth-summary 5x6 auth-est 5x6 auth-stale 5x6 auth-coverage 5x6 auth-list 10x7 pricing-provenance 10x7 '
             'provider-probe-state 10x8 unknown-versus-zero 10x8',
        'L': 'auth-summary 6x6 auth-est 6x6 auth-stale 6x6 auth-coverage 6x6 auth-list 12x7 pricing-provenance 12x7 '
             'provider-probe-state 12x8 unknown-versus-zero 12x8',
    },
}

# Retired widget ids and where their content lives now (visibility migrates; geometry never does, R-PERS-05).
MIGRATE = {
    'acct-claude-work-1': 'acct-claude-code', 'acct-codex-personal-2': 'acct-openai-codex', 'acct-qwen-work-3': 'acct-qwen-coding',
    'acct-gemini-work-4': 'acct-gemini-direct', 'acct-kimi-work-5': 'acct-kimi-coding', 'acct-copilot-work-6': 'acct-github-copilot',
}
PROMOTED = {'next-reset': 'D', 'route-pressure': 'D', 'reset-map': 'D', 'plan-settlement': 'D', 'provider-cost': 'X',
            'cost-authority': 'D', 'cost-trend': 'D', 'free-route': 'D', 'cooldown-eligibility': 'D', 'free-history': 'X',
            'ctx-sources': 'D', 'ctx-limits': 'D', 'token-trend': 'D', 'model-mix': 'D', 'settlement-states': 'D',
            'attention-policy': 'D', 'cache-trend': 'D', 'tool-list': 'D', 'tool-latency': 'X'}


def parse(spec: str):
    toks = spec.split()
    out = []
    for i in range(0, len(toks), 2):
        wid, size = toks[i], toks[i + 1]
        w, h = (int(v) for v in size.split('x'))
        out.append((wid, w, h))
    return out


def pack(items, cols):
    """First-fit, dense, in list order: scan rows top to bottom, columns left to right; the first free rectangle wins."""
    occ = []  # list of (x, y, w, h)

    def free(x, y, w, h):
        if x + w > cols:
            return False
        for (a, b, c, d) in occ:
            if x < a + c and a < x + w and y < b + d and b < y + h:
                return False
        return True
    placed = []
    for wid, w, h in items:
        y = 0
        while True:
            hit = next((x for x in range(0, cols - w + 1) if free(x, y, w, h)), None)
            if hit is not None:
                occ.append((hit, y, w, h))
                placed.append((wid, hit, y, w, h))
                break
            y += 1
    return placed


def holes(placed, cols, level_rank):
    """Cells inside the occupied height that no visible card covers, at one disclosure level."""
    vis = [p for p in placed if 'GDX'.index(W[p[0]][1]) <= level_rank]
    if not vis:
        return 0
    height = max(y + h for _, x, y, w, h in vis)
    grid = [[0] * cols for _ in range(height)]
    for _, x, y, w, h in vis:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                grid[yy][xx] = 1
    # count empty cells that have a visible card below them in the same column (true holes, not the ragged bottom)
    n = 0
    for xx in range(cols):
        col = [grid[yy][xx] for yy in range(height)]
        last = max((i for i, v in enumerate(col) if v), default=-1)
        n += sum(1 for i in range(last) if not col[i])
    return n


def known_ids() -> list[str]:
    text = (SRC / 'js' / '05-data.js').read_text(encoding='utf-8')
    m = re.search(r'KNOWN_USAGE_WIDGET_IDS = (\[.*?\]);', text)
    return json.loads(m.group(1)) if m else []


def build():
    problems, boards = [], {}
    for room in ROOMS:
        boards[room] = {}
        for cls, cols in CLASSES.items():
            items = parse(B[room][cls])
            ranks = ['GDX'.index(W[i][1]) for i, _, _ in items]
            if ranks != sorted(ranks):
                problems.append(f'{room}/{cls}: widgets are not ordered G, D, X')
            for wid, w, h in items:
                kind = W[wid][0]
                wmin, wmax, hmin, hmax, _ = KINDS[kind]
                if not (wmin <= w <= min(wmax or cols, cols)) or not (hmin <= h <= hmax):
                    problems.append(f'{room}/{cls}: {wid} {w}x{h} outside {kind} range {wmin}-{wmax or cols} x {hmin}-{hmax}')
            placed = pack(items, cols)
            for lv in range(3):
                n = holes(placed, cols, lv)
                if n:
                    problems.append(f'{room}/{cls}: {n} empty cells inside the board at level {"GDX"[lv]}')
            boards[room][cls] = [{'id': wid, 'x': x, 'y': y, 'w': w, 'h': h} for wid, x, y, w, h in placed]
        ids = [set(e['id'] for e in boards[room][c]) for c in CLASSES]
        if not all(s == ids[0] for s in ids):
            problems.append(f'{room}: classes do not hold the same widgets: {sorted(ids[0] ^ ids[1] ^ ids[2])}')
    placed_ids = {e['id'] for r in boards.values() for e in r['M']}
    dynamic = re.compile(r'^(plan-|tok-|free-\d|alert-\d|cache-\d|tool-\d|signal-\d)')
    for wid in known_ids():
        if wid not in placed_ids and wid not in MIGRATE:
            problems.append(f'old widget id {wid} has no home')
    for wid in W:
        if wid not in placed_ids:
            problems.append(f'{wid} is defined but placed in no room')
    return boards, problems


def js(boards) -> str:
    widgets = {wid: {'kind': k, 'level': LEVELS[lv], 'title': t, 'meta': m} for wid, (k, lv, t, m) in W.items()}
    kinds = {k: {'wMin': a, 'wMax': b, 'hMin': c, 'hMax': d, 'presets': [{'name': n, 'w': w, 'h': h} for n, w, h in p]}
             for k, (a, b, c, d, p) in KINDS.items()}
    rooms = {}
    for room in ROOMS:
        rooms[room] = {cls: [[e['id'], e['x'], e['y'], e['w'], e['h']] for e in boards[room][cls]] for cls in CLASSES}
    data = {'version': 'pmu-b2-boards-2026-10-02', 'classes': CLASSES, 'kinds': kinds, 'widgets': widgets, 'rooms': rooms,
            'migrate': MIGRATE, 'promoted_from': PROMOTED}
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    return ('/* Usage default boards (B v2), generated by tools/boards.py; do not edit by hand: change tools/boards.py and run it.\n'
            '   Data only. rooms[room][class] = [[widget_id, x, y, w, h], ...] in tracks and rows (row pitch 30 px);\n'
            '   classes S = 12 tracks, M = 20, L = 24 (XL = 30 is projected from L by the engine). */\n'
            f'var PMU_BOARDS = {body};\n')


def md(boards) -> str:
    lines = ['# Default boards (generated by `Concepts/usage-redesign/tools/boards.py`)', '',
             'Each line: `widget_id kind x,y w x h level`. x and w in tracks, y and h in rows (row pitch 30 px, card height '
             '`30h - 8`). S = 12 tracks (767 panel), M = 20 tracks (1145 panel), L = 24 tracks (~1400 panel). The boards '
             'are packed first-fit in the order shown, G first, then D, then X, so each disclosure level is a prefix with '
             'no hole (the generator checks it). Levels marked `^` were promoted from their canon level (DESIGN-SPEC 17.2).', '']
    for room in ROOMS:
        lines.append(f'## {room}')
        lines.append('')
        for cls, cols in CLASSES.items():
            entries = boards[room][cls]
            hgt = {lv: max([e['y'] + e['h'] for e in entries if 'GDX'.index(W[e['id']][1]) <= lv] or [0]) for lv in range(3)}
            lines.append(f'**{cls} ({cols} tracks)**: {len(entries)} widgets; rows at G {hgt[0]}, D {hgt[1]}, X {hgt[2]} '
                         f'({30 * hgt[0] - 8} / {30 * hgt[1] - 8} / {30 * hgt[2] - 8} px)')
            lines.append('')
            lines.append('```')
            for e in entries:
                k, lv, t, _ = W[e['id']]
                mark = '^' if e['id'] in PROMOTED else ''
                lines.append(f"{e['id']:<30} {k:<9} {e['x']:>2},{e['y']:<3} {e['w']:>2} x {e['h']:<3} {lv}{mark}")
            lines.append('```')
            lines.append('')
    return '\n'.join(lines)


def main() -> int:
    boards, problems = build()
    for p in problems:
        print('BOARDS:', p)
    if '--check' in sys.argv:
        print('boards', 'ok' if not problems else f'failed ({len(problems)})')
        return 1 if problems else 0
    if problems:
        return 1
    OUT_JS.write_text(js(boards), encoding='utf-8')
    if '--md' in sys.argv:
        Path(sys.argv[sys.argv.index('--md') + 1]).write_text(md(boards) + '\n', encoding='utf-8')
    print(f'wrote {OUT_JS.relative_to(PKG.parent.parent)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
