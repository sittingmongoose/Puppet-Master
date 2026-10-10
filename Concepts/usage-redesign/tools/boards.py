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
# Presets (lane c-presets, Jared 2026-10-09: "Panel size presets need to be rethought and polished. Currently they make
# the panels small and the content doesn't make sense."; PRESETS.md in the lane folder): every preset is one complete
# content tier, 2-3 per kind. A preset's width is authored in tracks at the nominal 47 px pitch (S at a 557 px board, M at
# 929 px), per board class (S / M / L / XL) where a class should offer a wider card, or the board's width ('full'); the
# engine resolves it to the same pixel width at the live pitch (42-cards.js widthAt), so a preset is the same card on a
# 400 px board and a 1600 px one. Its height is rows, or by content: fit = n (the smallest height that shows n complete
# items: accounts, rows, resets, models), 'items' (every item, other facts may fold to the head count: every family of a
# context ring) or 'all' (the smallest that folds nothing), measured at runtime by rendering the
# kind in a hidden card at that width (42-cards.js); h is then the fallback before the measure (and what --check
# validates). hmin = the smallest height a fit preset may take (a form that needs its rows: the switch ladder); minpx =
# the card width the preset's form needs (not offered on a narrower board: the one-line switch strip on a 400 px board).
# frm = the first class that offers it (a board-wide preset that would only repeat another at S).
CLS_ORDER = ['S', 'M', 'L', 'XL']
NOMINAL_PITCH = 47


def P(pid, name, w, h, desc, fit=None, frm=None, hmin=None, minpx=None):
    """One preset. w: tracks at the nominal pitch (every class), a 4-tuple (S, M, L, XL), or 'full' (the board's width)."""
    full = w == 'full'
    if full:
        ws = {'S': 12, 'M': 20, 'L': 24, 'XL': 30}
    elif isinstance(w, tuple):
        ws = dict(zip(CLS_ORDER, w))
    else:
        ws = {c: w for c in CLS_ORDER}
    out = {'id': pid, 'name': name, 'w': ws, 'h': h, 'desc': desc}
    if full:
        out['full'] = True
    if fit is not None:
        out['fit'] = fit
    if hmin is not None:
        out['hMin'] = hmin
    if minpx is not None:
        out['minPx'] = minpx
    if frm:
        out['from'] = frm
    return out


def WIDE(s=12, m=14):
    return (s, m, m, m)


KINDS = {
    'kpi': (3, 12, 3, 12, [
        P('compact', 'Compact', 4, 4, 'The value and its line'),
        P('standard', 'Standard', 6, 6, 'Value, line and the first facts'),
        P('expanded', 'Expanded', 8, 8, 'Value, line and every fact', fit='all')]),
    'kpis': (6, None, 3, 14, [
        P('strip', 'Strip', 'full', 3, "Every total's value on one line", frm='M'),
        P('compact', 'Compact', 8, 9, 'Every total, two to a row', fit='all'),
        P('standard', 'Standard', 'full', 5, 'Every total, side by side', fit='all')]),
    # (lane d-plans turns a plan plate into one row per account: its width may reach the board's, its height grows by rows)
    'limit': (3, None, 3, 24, [
        P('compact', 'Compact', 4, 9, "The active account's windows", fit=1),
        P('standard', 'Standard', 8, 12, 'Three accounts, a column per window', fit=3),
        P('expanded', 'Expanded', 12, 14, 'Every account, window and fact', fit='all')]),
    'provider': (3, None, 3, 24, [
        P('compact', 'Compact', 6, 7, 'The active account', fit=1),
        P('standard', 'Standard', 12, 14, 'Every account, window and action', fit='all'),
        P('expanded', 'Expanded', 16, 12, 'Every account with room for its words', fit='all', frm='M')]),
    'switch': (4, None, 3, 18, [
        P('strip', 'Strip', 'full', 3, 'The switch levels on one line', minpx=480),
        P('panel', 'Panel', 6, 10, 'Controls and most room, stacked', fit='all'),
        P('ladder', 'Ladder', 'full', 10, "Controls and every account's headroom", fit='all', hmin={'S': 10, 'M': 8, 'L': 8, 'XL': 8}, minpx=480)]),
    'providers': (4, None, 3, 12, [
        P('compact', 'Compact', 6, 5, 'Every provider, stacked', fit='all'),
        P('standard', 'Standard', 10, 4, 'Every provider on one line', fit='all')]),
    'group': (6, None, 2, 2, [P('band', 'Band', 'full', 2, 'The group heading across the board')]),
    'setup': (4, 16, 3, 18, [
        P('compact', 'Compact', 6, 7, 'State, Settings link and note'),
        P('expanded', 'Expanded', 8, 8, 'Every setup fact', fit='all')]),
    'context': (4, 14, 5, 14, [
        P('compact', 'Compact', 6, 10, 'The ring and every family', fit='items'),
        P('expanded', 'Expanded', 12, 13, 'Adds every fact, route and compaction', fit='all')]),
    'trend': (4, None, 4, 20, [
        P('compact', 'Compact', 5, 5, 'The number and its sparkline'),
        P('standard', 'Standard', 8, 10, 'The chart with axes and legend'),
        P('wide', 'Wide', WIDE(), 11, 'Adds the headline, facts row and peak'),
        P('full', 'Full width', 'full', 12, "The board's width, finer buckets", frm='M')]),
    'columns': (4, None, 4, 16, [
        P('compact', 'Compact', 5, 6, 'Labelled bars, a few buckets'),
        P('standard', 'Standard', 8, 9, 'Labelled bars with the caption'),
        P('wide', 'Wide', WIDE(), 10, 'More buckets, caption, legend and facts'),
        P('full', 'Full width', 'full', 10, 'Every bucket across the board', frm='M')]),
    'budget': (5, None, 5, 16, [
        P('compact', 'Compact', 6, 7, 'Spend, estimate and a small line'),
        P('standard', 'Standard', 8, 10, 'Projection chart and burn facts'),
        # fit 'all' (agent 5): at 557 px the room hero's big number left no line for the burn facts at 10 rows, so the
        # larger preset showed less than Standard; the height now grows until the facts row and the mix both show
        P('expanded', 'Expanded', WIDE(), 10, 'Adds plan versus metered', fit='all')]),
    'heat': (6, None, 5, 14, [
        # 11 rows: at 368 px the legend wraps to three lines and 10 rows left the cells at their 11 px floor with the
        # legend's last line under the card's edge (NieR, agent 4)
        P('standard', 'Standard', 8, 11, 'Every hour of the week'),
        P('wide', 'Wide', WIDE(), 11, 'Adds hour labels and Tokens / Cost')]),
    'agenda': (6, None, 4, 40, [
        P('compact', 'Compact', (6, 6, 6, 6), 10, 'The next four resets', fit=4),
        P('standard', 'Standard', 8, 16, 'The next eight resets', fit=8),
        P('wide', 'Wide', 'full', 14, 'Every reset in its horizon', fit='all')]),
    'qhist': (6, None, 5, 40, [
        P('compact', 'Compact', 8, 10, 'The first four accounts', fit=4),
        P('standard', 'Standard', 12, 30, "Every account's main window", fit='all'),
        P('wide', 'Wide', 'full', 27, "Adds the week's day labels", fit='all', frm='M')]),
    'models': (6, None, 5, 20, [
        P('compact', 'Compact', (6, 6, 6, 6), 9, 'The top three models', fit=3),
        P('standard', 'Standard', 10, 12, 'Every model and its cost bar', fit='all'),
        P('wide', 'Wide', (12, 16, 16, 16), 12, 'Adds share and tokens', fit='all')]),
    'donut': (5, 14, 6, 14, [
        P('compact', 'Compact', 6, 10, 'The ring and the top models'),
        P('standard', 'Standard', 8, 12, 'Adds the Tokens / Cost switch'),
        P('wide', 'Wide', 12, 10, 'The ring beside every model')]),
    'breakdown': (5, 16, 5, 14, [
        P('compact', 'Compact', 6, 12, 'Every token type, stacked', fit='all'),
        P('wide', 'Wide', 12, 10, 'Tokens and cost side by side', fit='all')]),
    'efficiency': (4, 14, 5, 12, [
        P('compact', 'Compact', 6, 10, 'Ring, savings and the split'),
        P('wide', 'Wide', 12, 8, 'Ring beside savings and the note')]),
    'ranked': (5, 14, 4, 16, [
        P('compact', 'Compact', 7, 7, 'The top three and their share', fit=3),
        P('standard', 'Standard', 7, 10, 'Every row and its share', fit='all'),
        P('wide', 'Wide', 12, 9, "Adds each row's role", fit='all')]),
    'mix': (4, None, 3, 12, [
        P('compact', 'Compact', 6, 6, 'The bar and every part', fit='all'),
        P('wide', 'Wide', 12, 6, "Adds each part's note", fit='all')]),
    'list': (4, None, 3, 24, [
        P('compact', 'Compact', 6, 6, 'The first three rows', fit=3),
        P('standard', 'Standard', 8, 9, 'Six rows with their second line', fit=6),
        P('expanded', 'Expanded', 12, 10, 'Every row with its note', fit='all')]),
    'table': (6, None, 5, 30, [
        P('compact', 'Compact', 10, 8, 'Four rows, the main columns', fit=4),
        P('standard', 'Standard', 12, 12, 'Eight rows, more columns', fit=8),
        P('full', 'Full width', 'full', 14, 'Every row and every column', fit='all')]),
    'alert': (4, 10, 4, 16, [
        P('compact', 'Compact', 6, 6, 'The state and what happened'),
        P('expanded', 'Expanded', 8, 9, 'Adds the meter, actions and facts', fit='all')]),
    'free': (3, 12, 4, 20, [
        P('compact', 'Compact', 4, 7, 'State, capacity and route'),
        P('expanded', 'Expanded', 8, 13, 'Adds every fact of the route', fit='all')]),
    'cache': (3, 8, 4, 14, [
        P('compact', 'Compact', 4, 7, 'The ring and the savings'),
        P('expanded', 'Expanded', 6, 11, 'Adds every fact', fit='all')]),
    'gauge': (3, 8, 4, 12, [
        P('compact', 'Compact', 4, 5, 'The ring and the calls'),
        P('expanded', 'Expanded', 8, 6, 'The ring beside every fact', fit='all')]),
    # WOW round (POLISH2 content, 2026-10-02): the room heroes of the rooms that had no chart on their first screen
    'skyline': (8, None, 6, 16, [
        P('standard', 'Standard', (12, 12, 14, 16), 10, "Every active account's tower"),
        P('full', 'Full width', 'full', 11, 'The towers across the board', frm='M')]),
    'attempts': (8, None, 5, 14, [
        P('standard', 'Standard', (12, 12, 14, 16), 8, 'Every attempt on its lane'),
        P('full', 'Full width', 'full', 10, 'The lanes across the board', frm='M')]),
    'flow': (10, None, 7, 14, [
        P('standard', 'Standard', (12, 14, 14, 16), 10, 'Readings, authority and labels'),
        P('full', 'Full width', 'full', 11, 'The flow across the board', frm='M')]),
    'windows': (8, None, 6, 20, [
        P('standard', 'Standard', (12, 12, 14, 16), 9, 'Every window of the week', fit='all'),
        P('full', 'Full width', 'full', 10, 'The week across the board', fit='all', frm='M')]),
}

# id: (kind, level, title, meta). Titles and metas are the old page's (PARITY section 2), with countdown-free wording.
W = {
    # Overview
    'health': ('kpi', 'G', 'Usage health', '6 routes'),
    'month': ('kpi', 'G', 'Selected window value', 'range'),
    'cache-saved': ('kpi', 'G', 'Cache savings', 'estimated'),
    'active-runs': ('kpi', 'G', 'Active runs', 'right now'),
    'next-reset': ('kpi', 'G', 'Active route reset', 'allowance clock'),
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
    'ov-skyline': ('skyline', 'G', 'Headroom skyline', 'active accounts · ordered by pressure'),
    'forecast': ('columns', 'D', 'Spend projection', 'range basis'),
    'completion-capacity': ('kpi', 'D', 'Completion capacity', 'current window'),
    'capacity-reservations': ('kpi', 'D', 'Capacity reservations', 'current runs'),
    'run-attribution': ('table', 'X', 'Run attribution', 'current work'),
    # Plans & limits
    'plans-timeline': ('windows', 'G', 'Windows ahead', 'next 7 days'),
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
    'acct-more-own': ('providers', 'G', 'Routes and local models', 'routes and servers'),
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
    'context-composition': ('mix', 'D', 'Context composition', 'current thread'),
    'ctx-maint': ('list', 'G', 'Maintenance history', 'last 24h'),
    'ctx-routing': ('list', 'G', 'Routing trace', 'requested vs effective'),
    'compaction-history': ('list', 'G', 'Compaction history', 'current thread'),
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
    'ledger-timeline': ('attempts', 'G', 'Attempt timeline', 'range'),
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
    'anom': ('trend', 'G', 'Anomaly comparison', '24h'),
    'attention-history': ('columns', 'G', 'Alert history', '7 days'),
    # Prompt cache
    'cache-0': ('cache', 'G', 'Claude', 'prompt cache'),
    'cache-1': ('cache', 'G', 'ChatGPT / Codex', 'prompt cache'),
    'cache-2': ('cache', 'G', 'Qwen Coding Plan', 'prompt cache'),
    'cache-3': ('cache', 'G', 'Gemini API', 'prompt cache'),
    'cache-trend': ('trend', 'G', 'Savings trend', '30 days'),
    'cache-authority': ('list', 'G', 'Reporting state', 'routes'),
    'cache-economics': ('ranked', 'G', 'Cache economics', 'month'),
    'cache-break-even': ('kpi', 'G', 'Cache break-even', 'month'),
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
    'operations-window': ('list', 'G', 'Maintenance and operations', '24 hours'),
    'tool-allowance': ('ranked', 'G', 'Tool allowance impact', 'provider-bearing calls'),
    'catalog-refresh': ('list', 'X', 'Catalog refresh', 'never active probing'),
    # Signals
    'signal-0': ('kpi', 'G', 'Provider health', 'current'),
    'signal-1': ('kpi', 'G', 'Usage sync', 'current'),
    'signal-2': ('kpi', 'G', 'Price catalog', 'current'),
    'signal-3': ('kpi', 'G', 'Unpriced events', 'current'),
    'signal-list': ('list', 'G', 'All signals', 'current'),
    'signal-history': ('trend', 'G', 'Signal history', '24h'),
    'signal-coverage': ('kpi', 'G', 'Coverage', 'current'),
    'signal-authority-map': ('list', 'G', 'Signal authority map', 'reading provenance'),
    # Source authority
    'auth-flow': ('flow', 'G', 'Provenance', 'reading, authority, label'),
    'auth-summary': ('kpi', 'G', 'Provider reported', 'current'),
    'auth-est': ('kpi', 'G', 'PM estimates', 'current'),
    'auth-stale': ('kpi', 'G', 'Stale readings', 'current'),
    'auth-coverage': ('kpi', 'G', 'Authority coverage', 'current'),
    'auth-list': ('list', 'D', 'Current sources', 'diagnostics'),
    'pricing-provenance': ('list', 'G', 'Pricing provenance', 'current range'),
    'provider-probe-state': ('list', 'G', 'Provider probe state', 'per installation'),
    'unknown-versus-zero': ('list', 'X', 'Unknown versus zero', 'reporting semantics'),
}

# Room boards per class: ordered "id wxh" (G first, then D, then X, so every level is a prefix with no hole).
# CONTENT-3 (2026-10-02, version h): the Overview's capacity tiles 6 tracks wide and 8-9 rows (Queued, Reserved tokens,
# Reserved spend, Longest wave, Requested and Admitted all show at the default size), Active runs 7 rows (Oldest and
# Projected show; its band 13 rows), and the Attention row 10 rows tall (the policy tile shows its four rules and the
# last review). S (1440): the four Context tiles 6 x 6 (Output reserve shows Hard stop 112k), the Ledger tiles 6 x 8 in two
# by two (their four facts pair side by side; Settlement states keeps its three rows), the Attention row 6 x 9 (the policy tile shows Last review 2d).
B = {
    # WOW round (POLISH2 content, 2026-10-02): each room leads with its hero (LOOK-REVIEW-2 2) and fills its first screen at
    # 767 (S) and 1145 (M) without hiding data (LOOK-REVIEW-2 11); the Overview's plan cards live in Plans & limits, the
    # skyline shows the same windows lit side by side
    'overview': {
        'S': 'ov-skyline 12x10 health 4x4 month 4x4 cache-saved 4x4 next-reset 4x7 active-runs 4x7 plan-value-now 4x7 '
             'budget-now 7x12 attention-now 5x12 ov-resets 7x12 route-pressure 5x12 context-now 6x9 ov-headroom 6x9 '
             'forecast 12x7 completion-capacity 6x8 capacity-reservations 6x8 run-attribution 12x12',
        'M': 'ov-skyline 12x11 health 4x5 month 4x5 next-reset 4x6 cache-saved 4x6 '
             'budget-now 8x13 attention-now 6x13 ov-resets 6x13 '
             'context-now 5x13 route-pressure 6x13 plan-value-now 5x6 ov-headroom 4x13 active-runs 5x7 '
             'forecast 8x9 completion-capacity 6x9 capacity-reservations 6x9 run-attribution 20x9',
        'L': 'ov-skyline 14x11 health 5x5 month 5x5 next-reset 5x6 cache-saved 5x6 '
             'budget-now 9x13 attention-now 7x13 ov-resets 8x13 '
             'context-now 6x13 route-pressure 7x13 plan-value-now 6x6 ov-headroom 5x13 active-runs 6x7 '
             'forecast 12x7 completion-capacity 6x7 capacity-reservations 6x7 run-attribution 24x9',
    },
    'plans': {
        'S': 'plans-timeline 12x12 plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 plan-kimi 4x9 plan-copilot 4x9 '
             'reset-map 12x14 quota-history 12x31 plan-settlement 12x17 '
             'plan-pressure 6x12 plan-authority 6x12 allowance-attribution 12x8 counting-basis 6x14 native-allowance-units 6x14',
        'M': 'plans-timeline 20x12 plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 plan-kimi 4x9 '
             'plan-copilot 4x12 reset-map 16x12 quota-history 20x30 plan-settlement 20x12 '
             'plan-pressure 7x12 plan-authority 7x12 allowance-attribution 6x12 counting-basis 10x13 native-allowance-units 10x13',
        'L': 'plans-timeline 24x12 plan-claude 4x9 plan-codex 4x9 plan-qwen 4x9 plan-gemini 4x9 plan-kimi 4x9 plan-copilot 4x9 '
             'reset-map 24x12 quota-history 24x30 plan-settlement 24x12 '
             'plan-pressure 8x12 plan-authority 8x12 allowance-attribution 8x12 counting-basis 12x13 native-allowance-units 12x13',
    },
    'costs': {
        'S': 'cost-month 6x4 cost-api 6x4 cost-plan 6x4 cost-save 6x4 budget 12x15 cost-spend 6x11 provider-cost 6x11 '
             'cost-authority 12x14 cost-trend 12x9 pricing-confidence 12x9 burn-basis 12x9',
        'M': 'cost-month 5x4 cost-api 5x4 cost-plan 5x4 cost-save 5x4 budget 13x14 cost-spend 7x14 '
             'provider-cost 10x16 cost-authority 10x16 cost-trend 20x9 pricing-confidence 10x11 burn-basis 10x10',
        'L': 'cost-month 6x4 cost-api 6x4 cost-plan 6x4 cost-save 6x4 budget 14x12 cost-spend 10x12 provider-cost 8x12 '
             'cost-authority 8x12 cost-trend 8x12 pricing-confidence 12x9 burn-basis 12x9',
    },
    'accounts': {
        'S': 'acct-switch 12x13 acct-group-plan 12x2 acct-claude-code 12x17 acct-openai-codex 12x14 '
             'acct-antigravity 6x10 acct-muse 6x10 acct-github-copilot 12x11 acct-qwen-coding 12x11 '
             'acct-zai-coding 4x10 acct-kimi-coding 4x10 acct-opencode-go 4x10 acct-more-plan 12x4 '
             'acct-group-use 12x2 acct-anthropic-api 4x11 acct-gemini-direct 4x11 acct-cursor-cli 4x11 acct-more-use 12x7 '
             'acct-group-own 12x2 acct-more-own 12x5 acct-history 12x18 acct-resets 12x16 '
             'routing 12x11 account-fallbacks 12x11 route-mismatches 12x27 '
             'credential-ownership 12x9 connection-authority 12x14 acct-opencode-personal-setup 12x9',
        'M': 'acct-switch 20x9 acct-group-plan 20x2 acct-claude-code 10x19 acct-openai-codex 10x19 '
             'acct-antigravity 4x10 acct-muse 4x10 acct-github-copilot 12x10 acct-qwen-coding 12x10 acct-zai-coding 4x10 '
             'acct-kimi-coding 4x10 acct-opencode-go 10x5 acct-more-plan 10x5 '
             'acct-group-use 20x2 acct-anthropic-api 5x10 acct-gemini-direct 5x10 acct-cursor-cli 5x10 acct-more-use 5x10 '
             'acct-group-own 20x2 acct-more-own 20x4 acct-history 10x19 acct-resets 10x19 '
             'routing 10x12 account-fallbacks 10x12 route-mismatches 20x21 '
             'credential-ownership 7x14 connection-authority 7x14 acct-opencode-personal-setup 6x14',
        'L': 'acct-switch 24x9 acct-group-plan 24x2 acct-claude-code 12x16 acct-openai-codex 12x16 '
             'acct-antigravity 4x10 acct-muse 4x10 acct-github-copilot 16x10 acct-qwen-coding 12x10 acct-zai-coding 4x10 '
             'acct-kimi-coding 4x10 acct-opencode-go 4x10 acct-more-plan 24x3 '
             'acct-group-use 24x2 acct-anthropic-api 6x10 acct-gemini-direct 6x10 acct-cursor-cli 6x10 acct-more-use 6x10 '
             'acct-group-own 24x2 acct-more-own 24x4 acct-history 12x19 acct-resets 12x19 '
             'routing 12x12 account-fallbacks 12x12 route-mismatches 24x21 '
             'credential-ownership 8x14 connection-authority 8x14 acct-opencode-personal-setup 8x14',
    },
    'free': {
        'S': 'free-0 6x12 free-1 6x12 free-2 6x12 free-3 6x12 free-throughput 12x9 free-route 12x9 cooldown-eligibility 12x9 '
             'free-history 12x7 free-source-state 12x9',
        'M': 'free-0 5x15 free-1 5x15 free-2 5x15 free-3 5x15 free-throughput 20x10 free-route 10x9 cooldown-eligibility 10x9 '
             'free-history 10x9 free-source-state 10x9',
        'L': 'free-0 6x13 free-1 6x13 free-2 6x13 free-3 6x13 free-throughput 24x10 free-route 12x9 cooldown-eligibility 12x9 '
             'free-history 12x9 free-source-state 12x9',
    },
    'context': {
        'S': 'ctx-window 12x10 ctx-cache 6x6 ctx-reclaim 6x6 ctx-output 6x6 ctx-route 6x6 ctx-sources 12x9 ctx-limits 12x9 '
             'ctx-maint 12x9 ctx-routing 12x9 compaction-history 12x9 context-composition 12x9',
        'M': 'ctx-window 12x12 ctx-cache 4x6 ctx-reclaim 4x6 ctx-output 4x6 ctx-route 4x6 ctx-sources 10x11 ctx-limits 10x11 '
             'ctx-maint 7x10 ctx-routing 7x10 compaction-history 6x10 context-composition 20x9',
        'L': 'ctx-window 12x12 ctx-cache 6x6 ctx-reclaim 6x6 ctx-output 6x6 ctx-route 6x6 ctx-sources 12x10 ctx-limits 12x10 '
             'ctx-maint 8x10 ctx-routing 8x10 compaction-history 8x10 context-composition 24x9',
    },
    'analytics': {
        'S': 'an-totals 12x9 token-trend 12x14 tok-claude 4x5 tok-codex 4x5 tok-qwen 4x5 tok-gemini 4x5 tok-kimi 4x5 tok-copilot 4x5 '
             'model-mix 12x15 an-model-donut 6x13 an-token-breakdown 6x13 '
             'cache-read-share 6x12 an-daily-cost 6x12 activity-heat 12x10 an-quota-history 12x32 an-resets 12x30 '
             'reasoning-mix 12x10 token-counting-basis 12x13 unknown-token-buckets 12x8',
        'M': 'an-totals 20x5 token-trend 14x17 tok-claude 3x6 tok-codex 3x6 tok-qwen 3x6 tok-gemini 3x6 tok-kimi 3x5 '
             'tok-copilot 3x5 model-mix 20x15 an-model-donut 7x12 an-token-breakdown 7x12 cache-read-share 6x12 '
             'activity-heat 12x11 an-daily-cost 8x11 an-quota-history 20x30 an-resets 20x18 '
             'reasoning-mix 20x10 token-counting-basis 12x13 unknown-token-buckets 8x10',
        'L': 'an-totals 24x5 tok-claude 4x5 tok-codex 4x5 tok-qwen 4x5 tok-gemini 4x5 tok-kimi 4x5 tok-copilot 4x5 '
             'token-trend 24x12 model-mix 16x14 an-model-donut 8x14 an-token-breakdown 8x11 cache-read-share 8x11 '
             'an-daily-cost 8x11 activity-heat 24x9 an-quota-history 24x30 an-resets 24x14 '
             'reasoning-mix 24x10 token-counting-basis 14x13 unknown-token-buckets 10x10',
    },
    'ledger': {
        'S': 'ledger-timeline 12x10 ledger-count 6x8 ledger-errors 6x8 ledger-routes 6x8 settlement-states 6x8 ledger-main 12x17 '
             'ledger-events 12x14 attempt-lineage 12x22 ledger-coverage 6x8 ledger-export 6x8 usage-record-state 12x8',
        'M': 'ledger-timeline 20x12 ledger-count 5x7 ledger-errors 5x7 ledger-routes 5x7 settlement-states 5x7 ledger-main 20x18 '
             'ledger-events 20x14 attempt-lineage 20x15 ledger-coverage 5x8 ledger-export 5x8 usage-record-state 10x8',
        'L': 'ledger-timeline 24x12 ledger-count 6x5 ledger-errors 6x5 ledger-routes 6x5 settlement-states 6x5 ledger-main 16x17 '
             'ledger-events 8x17 attempt-lineage 24x15 ledger-coverage 6x7 ledger-export 6x7 usage-record-state 12x7',
    },
    'attention': {
        'S': 'anom 12x12 alert-0 6x9 alert-1 6x9 alert-2 6x9 attention-policy 6x9 attention-history 12x9',
        'M': 'anom 20x14 alert-0 5x10 alert-1 5x10 alert-2 5x10 attention-policy 5x10 attention-history 20x10',
        'L': 'anom 24x14 alert-0 6x9 alert-1 6x9 alert-2 6x9 attention-policy 6x9 attention-history 24x10',
    },
    'cache': {
        'S': 'cache-0 6x10 cache-1 6x10 cache-2 6x10 cache-3 6x10 cache-trend 12x10 cache-economics 12x8 cache-authority 6x9 '
             'cache-break-even 6x9',
        'M': 'cache-0 5x11 cache-1 5x11 cache-2 5x11 cache-3 5x11 cache-trend 20x11 cache-economics 10x9 cache-authority 5x9 '
             'cache-break-even 5x9',
        'L': 'cache-0 6x11 cache-1 6x11 cache-2 6x11 cache-3 6x11 cache-trend 24x11 cache-economics 12x7 cache-authority 6x7 '
             'cache-break-even 6x7',
    },
    'tools': {
        'S': 'tool-latency 12x11 tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-health 4x4 tool-list 12x10 '
             'tool-allowance 12x9 operations-window 12x11 tool-receipts 4x11 catalog-refresh 8x11',
        'M': 'tool-latency 14x11 tool-health 6x11 tool-0 4x4 tool-1 4x4 tool-2 4x4 tool-3 4x4 tool-4 4x4 tool-list 20x10 '
             'tool-allowance 10x11 operations-window 10x11 tool-receipts 5x11 catalog-refresh 15x11',
        'L': 'tool-latency 16x11 tool-health 8x11 tool-0 5x4 tool-1 5x4 tool-2 5x4 tool-3 5x4 tool-4 4x4 tool-list 24x10 '
             'tool-allowance 12x11 operations-window 12x11 tool-receipts 6x11 catalog-refresh 18x11',
    },
    'signals': {
        'S': 'signal-history 12x13 signal-0 6x4 signal-1 6x4 signal-2 6x4 signal-3 6x4 signal-coverage 12x4 signal-list 12x9 '
             'signal-authority-map 12x11',
        'M': 'signal-history 20x14 signal-0 4x5 signal-1 4x5 signal-2 4x5 signal-3 4x5 signal-coverage 4x5 signal-list 10x11 '
             'signal-authority-map 10x11',
        'L': 'signal-history 24x13 signal-0 5x5 signal-1 5x5 signal-2 5x5 signal-3 5x5 signal-coverage 4x5 signal-list 12x10 '
             'signal-authority-map 12x10',
    },
    'authority': {
        'S': 'auth-flow 12x10 auth-summary 6x6 auth-est 6x6 auth-stale 6x6 auth-coverage 6x6 pricing-provenance 12x15 '
             'provider-probe-state 12x12 auth-list 12x12 unknown-versus-zero 12x14',
        'M': 'auth-flow 20x11 auth-summary 5x6 auth-est 5x6 auth-stale 5x6 auth-coverage 5x6 pricing-provenance 12x15 '
             'provider-probe-state 8x15 auth-list 20x14 unknown-versus-zero 20x14',
        'L': 'auth-flow 24x11 auth-summary 6x6 auth-est 6x6 auth-stale 6x6 auth-coverage 6x6 pricing-provenance 12x14 '
             'provider-probe-state 12x14 auth-list 24x14 unknown-versus-zero 24x14',
    },
}

# WOW-SPEC-3 section 7 / WOW-TASKS-3 N3-2 (content, 2026-10-02): the explicit hero of each room per board class (one
# widget id, or a list of ids that act as one hero). The engine marks it `data-hero` (E3-5) instead of guessing the largest
# plate. XL is projected from L by the engine and uses L's hero. `--check` fails when a hero is not on the room's first
# screen at a class: its top row inside the first FIRST_ROWS rows and at least half of it above that line.
HEROES = {
    'overview': 'ov-skyline', 'plans': 'plans-timeline', 'costs': 'budget', 'accounts': 'acct-switch',
    'free': ['free-0', 'free-1', 'free-2', 'free-3'], 'context': 'ctx-window', 'analytics': 'token-trend',
    'ledger': 'ledger-timeline', 'attention': 'anom', 'cache': ['cache-0', 'cache-1', 'cache-2', 'cache-3'],
    'tools': 'tool-latency', 'signals': 'signal-history', 'authority': 'auth-flow',
}
# rows of the first screen per class (row pitch 30 px): S = 1440 x 900 (stage about 730 px), M / L = 1920 x 1080 (about
# 900 px); the check is conservative (the stage head and the window chrome are taken off)
FIRST_ROWS = {'S': 24, 'M': 29, 'L': 29}

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
            'free-throughput': 'D', 'pricing-provenance': 'D',
            # POLISH2 content (WOW round): with a hero leading each room, the third copy of the context composition, the
            # attempt lineage and the source list (both now inside the hero) go back to their canon level, and rooms fill
            # their first screen with their own diagnostics instead
            'ctx-maint': 'X', 'ctx-routing': 'X', 'compaction-history': 'X', 'cache-authority': 'X', 'cache-economics': 'X',
            'cache-break-even': 'X', 'operations-window': 'X', 'tool-allowance': 'X', 'signal-coverage': 'X',
            'signal-authority-map': 'X', 'provider-probe-state': 'X',
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


def check_presets() -> list[str]:
    """Every preset fits its kind's range at every class that offers it, ids are unique, and no two presets of a kind are
    the same size at a class (WS-017: each preset is its own content tier)."""
    problems, tracks = [], {'S': 12, 'M': 20, 'L': 24, 'XL': 30}
    for kind, (wmin, wmax, hmin, hmax, presets) in KINDS.items():
        ids = [p['id'] for p in presets]
        if len(ids) != len(set(ids)):
            problems.append(f'kind {kind}: preset ids repeat {ids}')
        if not presets:
            problems.append(f'kind {kind}: no preset')
        for cls in CLS_ORDER:
            seen = {}
            for p in presets:
                if p.get('from') and CLS_ORDER.index(cls) < CLS_ORDER.index(p['from']):
                    continue
                w, h, fit = p['w'][cls], p['h'], p.get('fit')
                if not (wmin <= w <= min(wmax or tracks[cls], tracks[cls])):
                    problems.append(f'kind {kind} preset {p["id"]} at {cls}: width {w} outside {wmin}-{min(wmax or tracks[cls], tracks[cls])}')
                if not (hmin <= h <= hmax):
                    problems.append(f'kind {kind} preset {p["id"]}: height {h} outside {hmin}-{hmax}')
                pm = p.get('hMin')
                pm = pm.get(cls) if isinstance(pm, dict) else pm
                if pm is not None and not (hmin <= pm <= hmax):
                    problems.append(f'kind {kind} preset {p["id"]} at {cls}: hMin {pm} outside {hmin}-{hmax}')
                if fit is not None and fit not in ('all', 'items') and not (isinstance(fit, int) and fit > 0):
                    problems.append(f'kind {kind} preset {p["id"]}: fit must be a positive count, "items" or "all"')
                key = (w, h if fit is None else ('fit', fit))
                if key in seen:
                    problems.append(f'kind {kind} at {cls}: presets {seen[key]} and {p["id"]} are the same size')
                seen[key] = p['id']
    return problems


def build():
    problems, boards = check_presets(), {}
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
    for room in ROOMS:
        ids = HEROES[room] if isinstance(HEROES[room], list) else [HEROES[room]]
        for cls in CLASSES:
            byid = {e['id']: e for e in boards[room][cls]}
            for hid in ids:
                e = byid.get(hid)
                if e is None:
                    problems.append(f'{room}/{cls}: hero {hid} is not on the board')
                    continue
                if W[hid][1] != 'G':
                    problems.append(f'{room}/{cls}: hero {hid} is not at Glance')
                top, h, first = e['y'], e['h'], FIRST_ROWS[cls]
                if top >= first or (min(top + h, first) - top) * 2 < h:
                    problems.append(f'{room}/{cls}: hero {hid} rows {top}-{top + h} is not on the first screen ({first} rows)')
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
    kinds = {k: {'wMin': a, 'wMax': b, 'hMin': c, 'hMax': d, 'presets': p} for k, (a, b, c, d, p) in KINDS.items()}
    rooms = {}
    for room in ROOMS:
        rooms[room] = {cls: [[e['id'], e['x'], e['y'], e['w'], e['h']] for e in boards[room][cls]] for cls in CLASSES}
    data = {'version': 'pmu-b2-boards-2026-10-02-h', 'classes': CLASSES, 'kinds': kinds, 'widgets': widgets, 'rooms': rooms,
            'migrate': MIGRATE, 'promoted_from': PROMOTED,
            'heroes': {room: {cls: HEROES[room] for cls in list(CLASSES) + ['XL']} for room in ROOMS}}
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
