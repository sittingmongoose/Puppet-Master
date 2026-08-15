# R6 decomposed experiment, revision 2

This disposable revision preserves R6-v1 unchanged. It implements two general
changes justified by the v1 first-attempt evidence:

- the large S10B call owns decisions only; topic-edge verdicts move to one
  compact typed call over keyed endpoint decisions;
- candidate routing is deterministic before subject compilation: unsupported
  candidates are excluded, authority-ranked/currentness-resolved discrepancies
  are recorded as resolved differences, and only genuinely unresolved admitted
  candidates reach one-candidate subject calls.

The revision remains bound to the same unfinished frozen Plans fixture and makes
no current-Plans, production, release, buildability, or certification claim.
