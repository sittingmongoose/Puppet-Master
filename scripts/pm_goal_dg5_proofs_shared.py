"""DG5 written proofs for shared pm_goal_test_* rows (all five families + adapter source).

Loaded by pm_goal_dg5_justified.written_proofs and re-bound there to the exact
source bytes of every cited site. A proof closes its row only while every
dependency row is closed in the same family (matrix least fixpoint).
"""
ST = 'scripts/pm_goal_test_storage.py'
SITE = 'dg5/site/pm_goal_test_storage.py:'
FAMILIES = ['goal.updated', 'goal.cancelled', 'goal_run.started', 'goal_run.cancelled',
            'goal_run.certified', 'shared-adapter']

PROOFS = {
    SITE + '517': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '518'],
        sites=[(ST, 517), (ST, 518)],
        argument=(
            'decode_frame at :517 requires not (end-offset < 8 and the buffer is a prefix of '
            'MAGIC); the next statement (:518) refuses unless the first eight bytes equal MAGIC. '
            'A buffer shorter than eight bytes can never equal the eight-byte MAGIC, so with '
            ':517 cut every input it refuses still refuses at :518 (the wire-fixture '
            'truncated_prefix and frame_prefix_two_bytes cases witness the chain). :517 '
            'selects the exact prefix_truncated code and never gates acceptance alone.')),
    SITE + '520': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '539'],
        sites=[(ST, 520), (ST, 539)],
        argument=(
            'decode_frame at :520 requires at least PREFIX (48) bytes; :539 requires '
            'end-offset-PREFIX >= header_len+payload_len with both lengths unsigned, hence '
            '>= 0. Any buffer failing :520 has end-offset-PREFIX negative, so :539 always '
            'refuses next (the truncated_prefix chain witnesses this). :520 selects the exact '
            'prefix_truncated code and never gates acceptance alone.')),
    SITE + '537': dict(
        kind='entailed-by-genuine-frame-bounds',
        families=FAMILIES,
        depends_on=[SITE + '539', SITE + '581'],
        sites=[(ST, 59), (ST, 60), (ST, 426), (ST, 537), (ST, 539), (ST, 581)],
        argument=(
            'Frame caps at :537 bound declared header_len by HEADER_CAP=4096 and payload_len '
            'by PAYLOAD_CAP=16777216 (pm_goal_test_storage.py:59-60). A genuine encoder frame '
            'cannot reach them: event_header (pm_goal_test_storage.py:426) builds the fixed '
            'eight-field header of schema-bounded strings, and a data payload is one '
            'schema-valid pm.event.v0 record whose string fields are schema-capped, so both '
            'canonical lengths stay orders of magnitude below the caps. A non-genuine frame '
            'declaring over-cap lengths either has fewer bytes than declared (frame_truncated '
            'at :539) or carries that many bytes, which then cannot decode to the bounded '
            'header/event shapes and refuses at the header/payload validation sites '
            '(event_record at :581). With :537 cut no complete read accepts such a frame; '
            'it is a resource bound, not an acceptance gate.')),
    SITE + '577': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '581'],
        sites=[(ST, 577), (ST, 581), (ST, 468)],
        argument=(
            'decode_frame at :577 requires the decoded data payload to be a dict; the next '
            'statement validates it as an event record (validate_event_record, '
            'pm_goal_test_storage.py:468), whose schema type is object, and converts any '
            'refusal at :581. A non-dict payload therefore still refuses at :581 with :577 '
            'cut (the decode_payload_shape chain witnesses exactly this), so :577 selects '
            'the exact payload_shape code and never gates acceptance alone.')),
}
