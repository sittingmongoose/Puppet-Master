# P2 excerpts: systemd.time(7), pinned tag v257

URL: https://raw.githubusercontent.com/systemd/systemd/v257/man/systemd.time.xml
Corpus locator URL: https://github.com/systemd/systemd/blob/v257/man/systemd.time.xml
Version: pinned upstream tag v257; target systemd 257
Retrieved: 2026-10-10T05:10Z-05:11Z via web_fetch and curl HTTPS GET (same pinned-URL content)
Operation: HTTPS GET of primary manual; excerpts only, bounded evidence

## 1. daily shorthand normalization (claim 6)
  <para>The following special expressions may be used as shorthands for longer normalized forms:</para>

    <programlisting>    minutely → *-*-* *:*:00
      hourly → *-*-* *:00:00
       daily → *-*-* 00:00:00
     monthly → *-*-01 00:00:00
      weekly → Mon *-*-* 00:00:00
      yearly → *-01-01 00:00:00
   quarterly → *-01,04,07,10-01 00:00:00
                      03-05 → *-03-05 00:00:00
                     hourly → *-*-* *:00:00
                      daily → *-*-* 00:00:00
                  daily UTC → *-*-* 00:00:00 UTC
                    monthly → *-*-01 00:00:00

## 2. systemd-analyze calendar validates/normalizes, computes next (claim 6)
      <para>Calendar events are used by timer units, see
      <citerefentry><refentrytitle>systemd.timer</refentrytitle><manvolnum>5</manvolnum></citerefentry>
      for details.</para>

      <para>Use the <command>calendar</command> command of
      <citerefentry><refentrytitle>systemd-analyze</refentrytitle><manvolnum>1</manvolnum></citerefentry> to validate
      and normalize calendar time specifications for testing purposes. The tool also calculates when a specified
      calendar event would occur next.</para>
