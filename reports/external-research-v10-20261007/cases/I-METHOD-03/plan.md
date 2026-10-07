# Frozen sandbox plan — Transit transfer review kiosk

This is a fresh product-planning input, not researched conclusions. All choices below are initial proposals for comparison.

## P1 — Feed intake

A service imports user-selected public GTFS schedule archives and polls agency-provided GTFS-Realtime feeds when available. Each displayed result retains feed identity and acquisition time; source selection is a deployment decision.

## P2 — Rider view

The kiosk presents upcoming departures at twenty selected stops and a transfer between two selected routes. Scheduled and realtime-derived information are visibly distinguished; an unavailable observation must not be presented as a confirmed departure.

## P3 — Transfer interpretation

The initial view uses scheduled arrival/departure and a user-configured walking allowance, with an observation overlay where the data supports it. It does not promise vehicle occupancy, accessibility availability or dispatch coordination.

## P4 — Review and history

Volunteers can inspect the feed versions and input records behind a displayed transfer and compare a saved screen with later observations. Public history retains seven days, without tracking rider identities.

## P5 — Components and refresh

Feed parsing, timestamp interpretation and the limited transfer calculator are undecided components. The view is usable on a tablet and during intermittent connectivity, with explicit acquisition age and an operator-readable failure state.

## P6 — Acceptance

Propose validation for feed replacement, absent realtime data, inconsistent identifiers, overnight services and clock changes, plus performance at the stated stop count. No component has been pinned and no reliability claim is validated.
