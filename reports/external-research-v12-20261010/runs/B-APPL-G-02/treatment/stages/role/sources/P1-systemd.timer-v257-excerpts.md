# P1 excerpts: systemd.timer(5), pinned tag v257

URL: https://raw.githubusercontent.com/systemd/systemd/v257/man/systemd.timer.xml
Corpus locator URL: https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml
Version: pinned upstream tag v257; target systemd 257
Retrieved: 2026-10-10T05:10Z-05:11Z via web_fetch and curl HTTPS GET (same pinned-URL content)
Operation: HTTPS GET of primary manual; excerpts only, bounded evidence

## 1. Description — already-active target (claim 3)
    <para>Note that in case the unit to activate is already active at the time the timer elapses it is not restarted,
    but simply left running. There is no concept of spawning new service instances in this case. Due to this, services
    with <varname>RemainAfterExit=yes</varname> set (which stay around continuously even after the service's main
    process exited) are usually not suitable for activation via repetitive timers, as they will only be activated
    once, and then stay around forever. Target units, which by default do not deactivate on their own, can be
    activated repeatedly by timers by setting <varname>StopWhenUnneeded=yes</varname> on them. This will cause a
    target unit to be stopped immediately after its activation, if it is not a dependency of another running unit.</para>

## 2. OnUnitInactiveSec definition (claim 5)
              </row>
              <row>
                <entry><varname>OnUnitInactiveSec=</varname></entry>
                <entry>Defines a timer relative to when the unit the timer unit is activating was last deactivated.</entry>
              </row>

## 3. Monotonic timers wall-clock independence (claim 2)
        <para>These are monotonic timers, independent of wall-clock time and timezones. If the computer is
        temporarily suspended, the monotonic clock generally pauses, too. Note that if
        <varname>WakeSystem=</varname> is used, a different monotonic clock is selected that continues to
        advance while the system is suspended and thus can be used as the trigger to resume the
        system.</para>

## 4. Only OnBootSec/OnStartupSec elapse when past at activation (claim 2)
        <para>If a timer configured with <varname>OnBootSec=</varname>
        or <varname>OnStartupSec=</varname> is already in the past
        when the timer unit is activated, it will immediately elapse
        and the configured unit is started. This is not the case for
        timers defined in the other directives.</para>

## 5. Timers not necessarily precise; subject to AccuracySec (claims 4, 6)
        <para>Note that timers do not necessarily expire at the
        precise time configured with these settings, as they are
        subject to the <varname>AccuracySec=</varname> setting
        below.</para></listitem>
        <para>Note that timers do not necessarily expire at the precise time configured with this setting, as
        it is subject to the <varname>AccuracySec=</varname> setting below.</para>

## 6. AccuracySec default 1min window (claim 4)
        <term><varname>AccuracySec=</varname></term>

        <listitem><para>Specify the accuracy the timer shall elapse
        with. Defaults to 1min. The timer is scheduled to elapse
        within a time window starting with the time specified in
        <varname>OnCalendar=</varname>,
        <varname>OnActiveSec=</varname>,
        <varname>OnBootSec=</varname>,
        <varname>OnStartupSec=</varname>,
        <varname>OnUnitActiveSec=</varname> or
        <varname>OnUnitInactiveSec=</varname> and ending the time
        configured with <varname>AccuracySec=</varname> later. Within
        this time window, the expiry time will be placed at a
        host-specific, randomized, but stable position that is
        synchronized between all local timer units. This is done in
        order to optimize power consumption to suppress unnecessary
        CPU wake-ups. To get best accuracy, set this option to
        1us. Note that the timer is still subject to the timer slack

## 7. Persistent last-trigger catch-up, OnCalendar-only (claims 1, 2)
        <term><varname>Persistent=</varname></term>

        <listitem><para>Takes a boolean argument. If true, the time when the service unit was last triggered
        is stored on disk.  When the timer is activated, the service unit is triggered immediately if it
        would have been triggered at least once during the time when the timer was inactive. Such triggering
        is nonetheless subject to the delay imposed by <varname>RandomizedDelaySec=</varname>.
        This is useful to catch up on missed runs of the service when the system was powered down. Note that
        this setting only has an effect on timers configured with <varname>OnCalendar=</varname>. Defaults to
        <option>false</option>.</para>

## 8. Unit= default same-name service (claim 5)
        <term><varname>Unit=</varname></term>

        <listitem><para>The unit to activate when this timer elapses.
        The argument is a unit name, whose suffix is not
        <literal>.timer</literal>. If not specified, this value
        defaults to a service that has the same name as the timer
        unit, except for the suffix. (See above.) It is recommended
        that the unit name that is activated and the unit name of the
        timer unit are named identically, except for the

## 9. Calendar sleep catch-up single activation; RTC/time-sync ordering (claim 6)
        <para>Note that calendar timers might be triggered at unexpected times if the system's realtime clock
        is not set correctly. Specifically, on systems that lack a battery-buffered Realtime Clock (RTC) it
        might be wise to enable <filename>systemd-time-wait-sync.service</filename> to ensure the clock is
        adjusted to a network time source <emphasis>before</emphasis> the timer event is set up. Timer units
        with at least one <varname>OnCalendar=</varname> expression are automatically ordered after
        <filename>time-sync.target</filename>, which <filename>systemd-time-wait-sync.service</filename> is
        ordered before.</para>

        <para>When a system is temporarily put to sleep (i.e. system suspend or hibernation) the realtime
        clock does not pause. When a calendar timer elapses while the system is sleeping it will not be acted
        on immediately, but once the system is later resumed it will catch up and process all timers that
        triggered while the system was sleeping. Note that if a calendar timer elapsed more than once while
        the system was continuously sleeping the timer will only result in a single service activation. If
        <varname>WakeSystem=</varname> (see below) is enabled a calendar time event elapsing while the system
        is suspended will cause the system to wake up (under the condition the system's hardware supports
        time-triggered wake-up functionality).</para>
