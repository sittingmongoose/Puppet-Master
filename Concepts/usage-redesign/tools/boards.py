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
# Amendment A1 (DESIGN-SPEC-ATLAS.md, 2026-10-02): new kinds kpis, models, donut, breakdown, efficiency, qhist and agenda
# (agenda replaces the lane timeline); provider plates are taller (Atlas rows, 66 px comfortable rows).
KINDS = {
    'kpi':       (3, 12, 3, 9, [('Strip', 4, 3), ('Compact', 3, 4), ('Standard', 4, 4), ('Wide', 6, 4), ('Tall', 4, 6), ('Expanded', 6, 6), ('Maximum', 8, 6)]),
    'kpis':      (6, None, 3, 8, [('Strip', 12, 3), ('Row', 20, 4), ('Wide', 24, 4), ('Two rows', 12, 7)]),
    'limit':     (3, 10, 3, 12, [('Strip', 6, 3), ('Compact', 4, 6), ('Standard', 4, 8), ('Wide', 6, 7), ('Expanded', 8, 9), ('Maximum', 10, 11)]),
    'provider':  (3, None, 3, 20, [('Strip', 6, 3), ('Compact', 4, 5), ('Standard', 4, 7), ('Wide', 6, 7), ('Expanded', 8, 9), ('Group', 10, 11), ('Group wide', 14, 11), ('Group full', 20, 11)]),
    'switch':    (4, None, 3, 8, [('Strip', 12, 3), ('Wide', 20, 3), ('Two lines', 10, 4), ('Panel', 4, 8)]),
    'providers': (4, None, 3, 12, [('Compact', 4, 4), ('Standard', 6, 5), ('Wide', 10, 4), ('Strip', 20, 3)]),
    'group':     (6, None, 2, 2, [('Band', 12, 2), ('Wide', 20, 2), ('Full', 24, 2)]),
    'setup':     (4, 16, 3, 10, [('Strip', 6, 3), ('Standard', 5, 7), ('Wide', 8, 7)]),
    'context':   (4, 12, 5, 10, [('Compact', 4, 6), ('Tall', 4, 8), ('Standard', 6, 6), ('Wide', 9, 6), ('Expanded', 12, 7)]),
    'trend':     (4, None, 4, 16, [('Compact', 5, 5), ('Standard', 8, 7), ('Wide', 12, 7), ('Tall', 8, 10), ('Full', 20, 8)]),
    'columns':   (4, None, 4, 12, [('Compact', 5, 5), ('Standard', 8, 7), ('Wide', 12, 6)]),
    'budget':    (5, None, 5, 12, [('Compact', 5, 6), ('Standard', 8, 8), ('Wide', 12, 8)]),
    'heat':      (6, None, 5, 10, [('Compact', 6, 6), ('Standard', 10, 7), ('Wide', 14, 9)]),
    'agenda':    (4, None, 4, 30, [('Compact', 4, 8), ('Standard', 8, 10), ('Wide', 12, 12), ('Full', 24, 12)]),
    'qhist':     (6, None, 5, 40, [('Compact', 8, 10), ('Standard', 12, 16), ('Wide', 20, 27), ('Full', 24, 27)]),
    'models':    (6, None, 5, 16, [('Compact', 6, 8), ('Standard', 10, 10), ('Wide', 16, 11), ('Full', 24, 11)]),
    'donut':     (5, 14, 6, 14, [('Compact', 5, 10), ('Standard', 8, 11), ('Tall', 7, 12), ('Wide', 12, 9)]),
    'breakdown': (5, 16, 5, 14, [('Compact', 5, 10), ('Standard', 8, 11), ('Tall', 7, 12), ('Wide', 12, 9)]),
    'efficiency': (4, 14, 5, 12, [('Compact', 4, 9), ('Standard', 6, 10), ('Wide', 12, 8)]),
    'ranked':    (4, 14, 4, 14, [('Compact', 4, 6), ('Standard', 5, 7), ('Wide', 8, 6), ('Tall', 5, 10)]),
    'mix':       (4, None, 3, 10, [('Compact', 4, 4), ('Standard', 6, 5), ('Wide', 10, 5)]),
    'list':      (4, None, 3, 20, [('Compact', 4, 5), ('Standard', 5, 7), ('Wide', 8, 6), ('Full', 12, 7)]),
    'table':     (6, None, 5, 20, [('Standard', 10, 10), ('Wide', 14, 10), ('Tall', 10, 16), ('Full', 20, 12)]),
    'alert':     (4, 10, 4, 9, [('Compact', 4, 6), ('Standard', 5, 7), ('Wide', 8, 6)]),
    'free':      (3, 12, 4, 14, [('Compact', 4, 6), ('Standard', 4, 7), ('Wide', 6, 6)]),
    'cache':     (3, 8, 4, 14, [('Compact', 4, 6), ('Standard', 4, 7), ('Wide', 6, 6)]),
    'gauge':     (3, 8, 4, 10, [('Compact', 4, 5), ('Standard', 5, 6), ('Tall', 5, 10), ('Wide', 8, 5)]),
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
    'ov-resets': ('agenda', 'G', 'Upcoming resets', 'Next 24 hours · local time · from the latest readings'),
    'ov-headroom': ('switch', 'G', 'Headroom and auto-switch', 'shared with Settings'),
    'forecast': ('columns', 'D', 'Spend projection', 'range basis'),
    'completion-capacity': ('kpi', 'D', 'Completion capacity', 'current window'),
    'capacity-reservations': ('kpi', 'D', 'Capacity reservations', 'current runs'),
    'run-attribution': ('table', 'X', 'Run attribution', 'current work'),
    # Plans & limits
    'reset-map': ('agenda', 'G', 'Upcoming resets', 'Next 7 days · local time · from the latest readings'),
    'quota-history': ('qhist', 'G', 'Quota history', "Each account's main window · 7 days · select a row for every window"),
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
    'acct-switch': ('switch', 'G', 'Auto-switch', 'Shared with Settings > AI > Providers & Accounts'),
    'acct-group-plan': ('group', 'G', 'Subscriptions and plans', 'Settings group'),
    'acct-group-use': ('group', 'G', 'Pay as you go', 'Settings group'),
    'acct-group-own': ('group', 'G', 'Free and your own', 'Settings group'),
    'acct-claude-code': ('provider', 'G', 'Claude', '4 accounts · Work Claude active'),
    'acct-openai-codex': ('provider', 'G', 'ChatGPT / Codex', '3 accounts · Jared active'),
    'acct-github-copilot': ('provider', 'G', 'GitHub Copilot', '2 accounts · GitHub Work active'),
    'acct-qwen-coding': ('provider', 'G', 'Qwen Coding Plan', '2 accounts · Qwen Global active'),
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
    'acct-opencode-personal-setup': ('setup', 'X', 'OpenCode on your computer', 'Needs setup'),
    'acct-history': ('list', 'G', 'Switch history', 'last 48 hours'),
    'acct-resets': ('agenda', 'G', 'Account resets', 'Next 7 days · local time · from the latest readings'),
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
    'free-throughput': ('trend', 'G', 'Free throughput', '24 hours'),
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
    'context-composition': ('mix', 'G', 'Context composition', 'current thread'),
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
    'an-totals': ('kpis', 'G', 'Range totals', 'Selected range · every provider in scope'),
    'token-trend': ('trend', 'G', 'Token volume', 'Hourly buckets · tokens left axis, estimated cost right axis'),
    'model-mix': ('models', 'G', 'Model mix', 'Estimated cost by token type · selected range · select a model for detail'),
    'an-model-donut': ('donut', 'G', 'Model usage', 'Share of tokens · selected range'),
    'an-token-breakdown': ('breakdown', 'G', 'Token breakdown', 'Share of tokens and of estimated cost · selected range'),
    'activity-heat': ('heat', 'G', 'Activity by hour', 'Tokens per hour, local time · last 7 days'),
    'an-daily-cost': ('columns', 'G', 'Daily cost by provider', 'Settled charges and plan estimates, USD · 30 days'),
    'cache-read-share': ('efficiency', 'G', 'Cache-read share', 'Read share and savings · PM estimate, catalog pricing'),
    'reasoning-mix': ('trend', 'D', 'Reasoning mix', 'Visible output and reasoning · reported buckets'),
    'an-quota-history': ('qhist', 'G', 'Quota history', "Each account's main window · 7 days · select a row for every window"),
    'an-resets': ('agenda', 'G', 'Resets and expiries', 'Next 30 days · local time · from the latest readings'),
    'token-counting-basis': ('list', 'X', 'Token counting basis', 'provider semantics'),
    'unknown-token-buckets': ('kpi', 'X', 'Unknown token buckets', 'current range'),
    # Ledger
    'ledger-count': ('kpi', 'G', 'Attempts', 'range'),
    'ledger-errors': ('kpi', 'G', 'Pending settlement', 'range'),
    'ledger-routes': ('kpi', 'G', 'Effective routes', 'range'),
    'settlement-states': ('mix', 'G', 'Settlement states', 'range'),
    'ledger-main': ('table', 'G', 'Recent attempts', 'range'),
    'ledger-events': ('list', 'G', 'Usage events', 'today'),
    'attempt-lineage': ('table', 'G', 'Attempt lineage', 'receipt chain'),
    'ledger-coverage': ('kpi', 'X', 'Identity coverage', 'range'),
    'ledger-export': ('kpi', 'X', 'Receipts', 'range'),
    'usage-record-state': ('list', 'X', 'Usage record state', 'settlement lifecycle'),
    # Attention
    'alert-0': ('alert', 'G', 'Claude allowance pressure', 'now'),
    'alert-1': ('alert', 'G', 'Gemini API burn changed', '12m ago'),
    'alert-2': ('alert', 'G', 'Qwen weekly headroom', '1h ago'),
    'attention-policy': ('kpi', 'G', 'Policy state', 'current'),
    'anom': ('trend', 'G', 'Anomaly comparison', '24h'),
    'attention-history': ('columns', 'G', 'Alert history', '7 days'),
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
    'tool-latency': ('trend', 'G', 'Tool latency', 'p50 to p95'),
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
    'signal-history': ('trend', 'G', 'Signal history', '24h'),
    'signal-coverage': ('kpi', 'X', 'Coverage', 'current'),
    'signal-authority-map': ('list', 'X', 'Signal authority map', 'reading provenance'),
    # Source authority
    'auth-summary': ('kpi', 'G', 'Provider reported', 'current'),
    'auth-est': ('kpi', 'G', 'PM estimates', 'current'),
    'auth-stale': ('kpi', 'G', 'Stale readings', 'current'),
    'auth-coverage': ('kpi', 'G', 'Authority coverage', 'current'),
    'auth-list': ('list', 'G', 'Current sources', 'diagnostics'),
    'pricing-provenance': ('list', 'G', 'Pricing provenance', 'current range'),
    'provider-probe-state': ('list', 'X', 'Provider probe state', 'per installation'),
    'unknown-versus-zero': ('list', 'X', 'Unknown versus zero', 'reporting semantics'),
}

# Room boards per class: ordered "id wxh" (G first, then D, then X, so every level is a prefix with no hole).
B = {
    'overview': {
        'S': 'health 4x4 month 4x4 cache-saved 4x4 active-runs 4x4 next-reset 4x4 plan-value-now 4x4 ov-headroom 12x3 '
             'plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 context-now 8x9 budget-now 7x10 attention-now 5x10 '
             'ov-resets 7x13 route-pressure 5x13 '
             'forecast 12x7 completion-capacity 6x5 capacity-reservations 6x5 run-attribution 12x7',
        'M': 'health 4x4 month 4x4 cache-saved 4x4 active-runs 4x4 next-reset 4x4 '
             'plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 context-now 4x9 '
             'budget-now 8x10 attention-now 6x10 ov-resets 6x14 plan-value-now 7x10 route-pressure 7x10 ov-headroom 6x6 '
             'forecast 10x7 completion-capacity 5x7 capacity-reservations 5x7 run-attribution 10x7',
        'L': 'health 4x4 month 4x4 cache-saved 4x4 active-runs 4x4 next-reset 4x4 plan-value-now 4x4 '
             'plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 context-now 4x9 attention-now 4x9 '
             'budget-now 8x10 ov-resets 8x10 route-pressure 8x10 ov-headroom 24x3 '
             'forecast 12x7 completion-capacity 6x7 capacity-reservations 6x7 run-attribution 12x7',
    },
    'plans': {
        'S': 'plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 plan-kimi 4x9 plan-copilot 4x9 '
             'reset-map 12x14 quota-history 12x31 plan-settlement 12x12 '
             'plan-pressure 6x9 plan-authority 6x9 allowance-attribution 12x5 counting-basis 6x8 native-allowance-units 6x8',
        'M': 'plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 plan-kimi 4x9 '
             'plan-copilot 4x12 reset-map 16x12 quota-history 20x30 plan-settlement 20x12 '
             'plan-pressure 7x9 plan-authority 7x9 allowance-attribution 6x9 counting-basis 10x7 native-allowance-units 10x7',
        'L': 'plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 plan-kimi 4x9 plan-copilot 4x9 '
             'reset-map 24x12 quota-history 24x30 plan-settlement 24x12 '
             'plan-pressure 8x9 plan-authority 8x9 allowance-attribution 8x9 counting-basis 12x7 native-allowance-units 12x7',
    },
    'costs': {
        'S': 'cost-month 6x4 cost-api 6x4 cost-plan 6x4 cost-save 6x4 budget 12x9 cost-spend 6x10 provider-cost 6x10 '
             'cost-authority 12x14 cost-trend 12x9 pricing-confidence 12x6 burn-basis 12x6',
        'M': 'cost-month 5x4 cost-api 5x4 cost-plan 5x4 cost-save 5x4 budget 12x10 cost-spend 8x10 '
             'provider-cost 10x13 cost-authority 10x13 cost-trend 20x9 pricing-confidence 10x6 burn-basis 10x6',
        'L': 'cost-month 6x4 cost-api 6x4 cost-plan 6x4 cost-save 6x4 budget 12x10 cost-spend 12x10 provider-cost 8x11 '
             'cost-authority 8x11 cost-trend 8x11 pricing-confidence 12x6 burn-basis 12x6',
    },
    'accounts': {
        'S': 'acct-switch 12x4 acct-group-plan 12x2 acct-claude-code 12x16 acct-openai-codex 12x14 '
             'acct-antigravity 6x9 acct-muse 6x9 acct-github-copilot 12x9 acct-qwen-coding 12x9 '
             'acct-zai-coding 4x10 acct-kimi-coding 4x10 acct-opencode-go 4x10 acct-more-plan 12x4 '
             'acct-group-use 12x2 acct-anthropic-api 4x11 acct-gemini-direct 4x11 acct-cursor-cli 4x11 acct-more-use 12x6 '
             'acct-group-own 12x2 acct-more-own 12x5 acct-history 12x14 acct-resets 12x14 '
             'routing 12x7 account-fallbacks 12x7 route-mismatches 12x8 '
             'credential-ownership 12x7 connection-authority 12x8 acct-opencode-personal-setup 12x7',
        'M': 'acct-switch 20x3 acct-group-plan 20x2 acct-claude-code 10x16 acct-openai-codex 10x16 '
             'acct-antigravity 4x10 acct-muse 4x10 acct-github-copilot 12x10 acct-qwen-coding 12x10 acct-zai-coding 4x10 '
             'acct-kimi-coding 4x10 acct-opencode-go 10x5 acct-more-plan 10x5 '
             'acct-group-use 20x2 acct-anthropic-api 5x10 acct-gemini-direct 5x10 acct-cursor-cli 5x10 acct-more-use 5x10 '
             'acct-group-own 20x2 acct-more-own 20x4 acct-history 10x15 acct-resets 10x15 '
             'routing 10x7 account-fallbacks 10x7 route-mismatches 20x7 '
             'credential-ownership 10x7 connection-authority 10x7 acct-opencode-personal-setup 10x7',
        'L': 'acct-switch 24x3 acct-group-plan 24x2 acct-claude-code 12x16 acct-openai-codex 12x16 '
             'acct-antigravity 4x10 acct-muse 4x10 acct-github-copilot 16x10 acct-qwen-coding 12x10 acct-zai-coding 4x10 '
             'acct-kimi-coding 4x10 acct-opencode-go 4x10 acct-more-plan 24x3 '
             'acct-group-use 24x2 acct-anthropic-api 6x10 acct-gemini-direct 6x10 acct-cursor-cli 6x10 acct-more-use 6x10 '
             'acct-group-own 24x2 acct-more-own 24x4 acct-history 12x15 acct-resets 12x15 '
             'routing 8x7 account-fallbacks 8x7 route-mismatches 8x7 '
             'credential-ownership 12x7 connection-authority 12x7 acct-opencode-personal-setup 12x7',
    },
    'free': {
        'S': 'free-0 6x14 free-1 6x14 free-2 6x14 free-3 6x14 free-route 12x9 cooldown-eligibility 12x9 free-throughput 12x8 '
             'free-history 12x7 free-source-state 12x6',
        'M': 'free-0 10x12 free-1 10x12 free-2 10x12 free-3 10x12 free-route 10x9 cooldown-eligibility 10x9 free-throughput 20x10 '
             'free-history 10x7 free-source-state 10x7',
        'L': 'free-0 12x12 free-1 12x12 free-2 12x12 free-3 12x12 free-route 12x9 cooldown-eligibility 12x9 free-throughput 24x10 '
             'free-history 12x7 free-source-state 12x7',
    },
    'context': {
        'S': 'ctx-window 6x8 ctx-cache 6x4 ctx-reclaim 6x4 ctx-output 6x4 ctx-route 6x4 ctx-sources 12x9 ctx-limits 12x9 '
             'context-composition 12x9 ctx-maint 12x6 ctx-routing 12x6 compaction-history 12x6',
        'M': 'ctx-window 8x8 ctx-cache 6x4 ctx-reclaim 6x4 ctx-output 6x4 ctx-route 6x4 ctx-sources 10x10 ctx-limits 10x10 '
             'context-composition 20x9 ctx-maint 7x7 ctx-routing 7x7 compaction-history 6x7',
        'L': 'ctx-window 8x8 ctx-cache 8x4 ctx-reclaim 8x4 ctx-output 8x4 ctx-route 8x4 ctx-sources 12x10 ctx-limits 12x10 '
             'context-composition 24x9 ctx-maint 8x7 ctx-routing 8x7 compaction-history 8x7',
    },
    'analytics': {
        'S': 'an-totals 12x8 tok-claude 4x5 tok-codex 4x5 tok-qwen 4x5 tok-gemini 4x5 tok-kimi 4x5 tok-copilot 4x5 '
             'token-trend 12x14 model-mix 12x15 an-model-donut 6x13 an-token-breakdown 6x13 '
             'cache-read-share 6x11 an-daily-cost 6x11 activity-heat 12x10 an-quota-history 12x32 an-resets 12x30 '
             'reasoning-mix 12x7 token-counting-basis 12x7 unknown-token-buckets 12x6',
        'M': 'an-totals 20x5 token-trend 14x15 tok-claude 3x5 tok-codex 3x5 tok-qwen 3x5 tok-gemini 3x5 tok-kimi 3x5 '
             'tok-copilot 3x5 model-mix 20x15 an-model-donut 7x12 an-token-breakdown 7x12 cache-read-share 6x12 '
             'activity-heat 12x10 an-daily-cost 8x10 an-quota-history 20x30 an-resets 20x18 '
             'reasoning-mix 10x7 token-counting-basis 10x7 unknown-token-buckets 10x7',
        'L': 'an-totals 24x5 tok-claude 4x5 tok-codex 4x5 tok-qwen 4x5 tok-gemini 4x5 tok-kimi 4x5 tok-copilot 4x5 '
             'token-trend 24x12 model-mix 16x14 an-model-donut 8x14 an-token-breakdown 8x11 cache-read-share 8x11 '
             'an-daily-cost 8x11 activity-heat 24x9 an-quota-history 24x30 an-resets 24x14 '
             'reasoning-mix 12x7 token-counting-basis 12x7 unknown-token-buckets 12x7',
    },
    'ledger': {
        'S': 'ledger-count 4x4 ledger-errors 4x4 ledger-routes 4x4 settlement-states 12x5 ledger-main 12x17 ledger-events 12x14 '
             'attempt-lineage 12x8 ledger-coverage 6x4 ledger-export 6x4 usage-record-state 12x6',
        'M': 'ledger-count 5x5 ledger-errors 5x5 ledger-routes 5x5 settlement-states 5x5 ledger-main 13x17 ledger-events 7x17 '
             'attempt-lineage 20x9 ledger-coverage 5x5 ledger-export 5x5 usage-record-state 10x5',
        'L': 'ledger-count 6x5 ledger-errors 6x5 ledger-routes 6x5 settlement-states 6x5 ledger-main 16x17 ledger-events 8x17 '
             'attempt-lineage 24x9 ledger-coverage 6x5 ledger-export 6x5 usage-record-state 12x5',
    },
    'attention': {
        'S': 'alert-0 6x8 alert-1 6x8 alert-2 6x8 attention-policy 6x8 anom 12x10 attention-history 12x9',
        'M': 'alert-0 5x9 alert-1 5x9 alert-2 5x9 attention-policy 5x9 anom 20x12 attention-history 20x10',
        'L': 'alert-0 6x9 alert-1 6x9 alert-2 6x9 attention-policy 6x9 anom 14x12 attention-history 10x12',
    },
    'cache': {
        'S': 'cache-0 6x8 cache-1 6x8 cache-2 6x8 cache-3 6x8 cache-trend 12x10 cache-authority 12x5 cache-economics 12x5 '
             'cache-break-even 12x4',
        'M': 'cache-0 5x13 cache-1 5x13 cache-2 5x13 cache-3 5x13 cache-trend 20x12 cache-authority 7x6 cache-economics 7x6 '
             'cache-break-even 6x6',
        'L': 'cache-0 6x13 cache-1 6x13 cache-2 6x13 cache-3 6x13 cache-trend 24x12 cache-authority 8x6 cache-economics 8x6 '
             'cache-break-even 8x6',
    },
    'tools': {
        'S': 'tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-health 4x4 tool-list 12x10 tool-latency 12x9 '
             'tool-receipts 4x6 operations-window 8x6 tool-allowance 12x7 catalog-refresh 12x7',
        'M': 'tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-health 5x10 tool-list 15x10 tool-latency 20x12 '
             'tool-receipts 5x6 operations-window 15x6 tool-allowance 10x7 catalog-refresh 10x7',
        'L': 'tool-health 4x4 tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-list 24x9 tool-latency 24x12 '
             'tool-receipts 6x6 operations-window 18x6 tool-allowance 12x7 catalog-refresh 12x7',
    },
    'signals': {
        'S': 'signal-0 6x4 signal-1 6x4 signal-2 6x4 signal-3 6x4 signal-list 12x9 signal-history 12x10 signal-coverage 12x4 '
             'signal-authority-map 12x6',
        'M': 'signal-0 5x4 signal-1 5x4 signal-2 5x4 signal-3 5x4 signal-list 20x9 signal-history 20x13 signal-coverage 6x7 '
             'signal-authority-map 14x7',
        'L': 'signal-0 6x4 signal-1 6x4 signal-2 6x4 signal-3 6x4 signal-list 24x9 signal-history 24x13 signal-coverage 8x7 '
             'signal-authority-map 16x7',
    },
    'authority': {
        'S': 'auth-summary 6x7 auth-est 6x7 auth-stale 6x7 auth-coverage 6x7 auth-list 12x12 pricing-provenance 12x15 '
             'provider-probe-state 12x8 unknown-versus-zero 12x8',
        'M': 'auth-summary 5x7 auth-est 5x7 auth-stale 5x7 auth-coverage 5x7 auth-list 10x15 pricing-provenance 10x15 '
             'provider-probe-state 10x8 unknown-versus-zero 10x8',
        'L': 'auth-summary 6x7 auth-est 6x7 auth-stale 6x7 auth-coverage 6x7 auth-list 12x15 pricing-provenance 12x15 '
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
            'attention-policy': 'D', 'cache-trend': 'D', 'tool-list': 'D', 'tool-latency': 'X', 'anom': 'D', 'attention-history': 'D', 'signal-history': 'X',
            'cache-read-share': 'D', 'an-quota-history': 'D',
            # fixer 2026-10-02: under-filled rooms show their next content at Glance instead of empty space
            'free-throughput': 'D', 'context-composition': 'D', 'auth-list': 'D', 'pricing-provenance': 'D', 'attempt-lineage': 'D',
            # demoted: not installed reads as one line in Free and your own (DECISIONS "Provider catalog"); the card
            # with every setup fact stays at Diagnostics and in that line's Details
            'acct-opencode-personal-setup': 'G'}   # the last two: Amendment A1 (Atlas analytics at G)


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
    data = {'version': 'pmu-b2-boards-2026-10-02-c', 'classes': CLASSES, 'kinds': kinds, 'widgets': widgets, 'rooms': rooms,
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
             'no hole (the generator checks it). Levels marked `^` were promoted from their canon level (DESIGN-SPEC 17.2 and '
             'DESIGN-SPEC-ATLAS 9.6). Amendment A1 (Daylight Atlas, 2026-10-02) rebuilt Analytics and Accounts and changed the '
             'resets and quota-history kinds (agenda, qhist); see DESIGN-SPEC-ATLAS.md.', '']
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
                lines.append(f"{e['id']:<30} {k:<10} {e['x']:>2},{e['y']:<3} {e['w']:>2} x {e['h']:<3} {lv}{mark}")
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
