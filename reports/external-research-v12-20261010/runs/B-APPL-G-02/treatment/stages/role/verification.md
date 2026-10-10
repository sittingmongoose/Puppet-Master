# Verification: systemd laptop maintenance timer

Case ER12-B-APPL-G-02-FRESH. Role: applicability/exception verification.
Applies to systemd 257, `[Timer]` options below; AccuracySec and
RandomizedDelaySec at defaults unless stated. Sources: P1 =
systemd.timer(5) v257, P2 = systemd.time(7) v257 (see source-map.json).

## Claim 1 — Persistent=true catches the calendar timer up after inactivity

Disposition: SUPPORTED with correction. P1: with Persistent=true "the
time when the service unit was last triggered is stored on disk. When
the timer is activated, the service unit is triggered immediately if it
would have been triggered at least once during the time when the timer
was inactive" (P1, Persistent=). Corrected wording: "Persistent=true on
the OnCalendar=daily timer triggers the service once, immediately, at
the next timer activation after at least one missed daily elapse."
Exceptions: catch-up fires once per activation even if several midnights
were missed; it is still subject to RandomizedDelaySec; the timestamp
file must survive on disk (`systemctl clean --what=state` removes it).
Missing evidence: that the timer is enabled/active at boot and the
timestamp file exists; no logs supplied.

## Claim 2 — Persistent=true gives OnUnitInactiveSec identical powered-off catch-up

Disposition: REFUTED. P1: "this setting only has an effect on timers
configured with OnCalendar=" (P1, Persistent=). OnUnitInactiveSec is
monotonic: "independent of wall-clock time and timezones" (P1, Options);
only OnBootSec/OnStartupSec elapse immediately when already past at
activation — "This is not the case for timers defined in the other
directives" (P1, Options). Corrected wording: "OnUnitInactiveSec=10min
does not catch up after power-off; after boot it schedules 10 minutes
from the target's observed deactivation." Exceptions: none restore
parity; WakeSystem only changes suspend behavior (CLOCK_BOOTTIME), not
power-off. A reboot test with journal timestamps would confirm
operationally.

## Claim 3 — Every elapse starts another instance while the service is active

Disposition: REFUTED. P1: "in case the unit to activate is already
active at the time the timer elapses it is not restarted, but simply
left running. There is no concept of spawning new service instances in
this case" (P1, Description). A 3-minute oneshot still running at the
next elapse blocks a new start. Corrected wording: "A timer elapse while
the target service is active leaves it running and starts nothing."
Exceptions: a oneshot without RemainAfterExit deactivates after exit, so
later elapses can fire; with RemainAfterExit=yes the unit stays active
and repetitive timers activate it only once. Missing evidence: the
service's Type=/RemainAfterExit= settings and logs of a coincident
elapse.

## Claim 4 — Default AccuracySec admits a one-minute window, not exact execution

Disposition: SUPPORTED. P1: AccuracySec "Defaults to 1min. The timer is
scheduled to elapse within a time window starting with the time
specified ... and ending the time configured with AccuracySec later"
(P1, AccuracySec=); both monotonic and OnCalendar timers "do not
necessarily expire at the precise time" (P1, Options). Corrected
wording: "By default the timer elapses at a host-stable position within
one minute after the configured time." Exceptions: TimerSlackNSec and
load can delay further; set AccuracySec=1us for best accuracy. Missing
evidence: effective AccuracySec (unit file plus manager defaults).

## Claim 5 — OnUnitInactiveSec counts from the target unit's last deactivation

Disposition: SUPPORTED. P1 table: OnUnitInactiveSec "Defines a timer
relative to when the unit the timer unit is activating was last
deactivated" (P1, Options). The reference unit is Unit=, defaulting to
the same-name service (P1, Unit=). Exceptions: if the target never
deactivates (long-running, or RemainAfterExit=yes), the timer never
elapses; the first post-boot elapse depends on the recorded
deactivation, and deactivation timing depends on service Type. Missing
evidence: Unit= identity and its Type=.

## Claim 6 — Valid daily syntax proves cleanup completes by 00:00:02 after every boot

Disposition: REFUTED. P2: `daily` normalizes to `*-*-* 00:00:00`, and
`systemd-analyze calendar` only validates, normalizes, and computes the
next occurrence (P2, Calendar Events) — it proves nothing about
execution or completion. Further, the AccuracySec window permits start
up to a minute late; the clock must be correct (OnCalendar units order
after time-sync.target; RTC warning, P1); Persistent catch-up fires at
activation, not at midnight; and a 3-minute service cannot complete by
00:00:02 even starting at 00:00:00. Corrected wording: "daily schedules
(midnight ± clock/accuracy caveats); completion follows service start
plus runtime." Missing evidence: boot time, timer enablement, clock-sync
state.

## Acceptance checks

1. `systemd-analyze calendar daily` prints normalized `*-*-* 00:00:00`
   with a next elapse; after a reboot past a missed midnight with the
   Persistent calendar timer enabled, `journalctl -u <service>` shows
   exactly one catch-up start at boot, within the AccuracySec window.
2. With the service active, force a timer elapse on a test copy and
   confirm via the journal that no second instance starts; for
   OnUnitInactiveSec=10min, confirm `systemctl show -p
   NextElapseUSecMonotonic` schedules 10 minutes after the observed
   deactivation, with no catch-up firing after power-off.
