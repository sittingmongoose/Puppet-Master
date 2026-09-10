"""Location adapter for the existing fail-closed Event Authority currentness tool.

No source pins, cohort rows, admission decisions, or closure flags are changed.
Call from the original tool after its argument parser and before any generation.
"""
from __future__ import annotations
import os
from pathlib import Path
from pm_evidence_paths import EvidencePathError, resolve_evidence_input, contained_path

LOGICAL='Plans/.audits/event-authority-2026-08-13-currentness'
HISTORICAL='Plans/.audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json'

def configure(namespace: dict, *, outdir: str | None, command: str) -> None:
    root=Path(namespace['ROOT']).resolve(strict=True)
    # Resolve immutable inputs first; a failed lookup never creates outputs.
    historical=resolve_evidence_input(root,HISTORICAL)
    expected=resolve_evidence_input(root,LOGICAL+'/adjudication/EXPECTED_252_EVENT_TYPES.tsv')
    groups=resolve_evidence_input(root,LOGICAL+'/adjudication/source_groups')
    if not historical.is_file() or not expected.is_file() or not groups.is_dir():
        raise EvidencePathError('Event Authority custody inputs have the wrong file/directory type')
    chosen=outdir or os.environ.get('PM_EVENT_AUDIT_OUT')
    if chosen:
        output=Path(chosen).expanduser().resolve(strict=False)
    elif command=='validate':
        output=resolve_evidence_input(root,LOGICAL)
    else:
        raise EvidencePathError('generation requires an explicit --outdir outside the repository')
    if command=='generate':
        if output.is_relative_to(root):
            raise EvidencePathError('raw Event Authority evidence must be outside the repository')
        if output.exists() and (not output.is_dir() or any(output.iterdir())):
            raise EvidencePathError('generate requires an empty output directory; archived evidence is immutable')
        for source in (historical,expected,groups):
            if source.is_relative_to(output) or output.is_relative_to(source if source.is_dir() else source.parent):
                raise EvidencePathError('output overlaps immutable Event Authority custody inputs')
        output.mkdir(parents=True,exist_ok=True)
        (output/'adjudication').mkdir()
    elif command=='validate':
        if not output.is_dir():raise EvidencePathError('currentness output to validate is missing')
    else:raise EvidencePathError('unsupported currentness location command')
    outputs={
      'INVENTORY':'CURRENT_EVENT_SOURCE_INVENTORY.json',
      'OCCURRENCES':'EVENT_OCCURRENCES.jsonl',
      'STATUS':'EVENT_FAMILY_DENOMINATOR_STATUS.json',
      'RECEIPT':'VALIDATOR_RECEIPT.json','README':'README.md',
      'QUARANTINED_252':'adjudication/QUARANTINED_EVENT_DISPOSITIONS.jsonl',
      'GROUP_MANIFEST':'adjudication/GROUP_ARTIFACT_MANIFEST.json'}
    namespace.update(AUDIT=output,ADJUDICATION=output/'adjudication',HISTORICAL_INVENTORY=historical,EXPECTED_252=expected,GROUP_SOURCE_DIR=groups)
    for name,relative in outputs.items():namespace[name]=output/relative
    def logical(path: Path) -> str:
        path=Path(path).resolve(strict=False)
        if path==historical:return HISTORICAL
        if path==expected:return LOGICAL+'/adjudication/EXPECTED_252_EVENT_TYPES.tsv'
        if path.is_relative_to(groups):return LOGICAL+'/adjudication/source_groups/'+path.relative_to(groups).as_posix()
        if path.is_relative_to(output):return LOGICAL+'/'+path.relative_to(output).as_posix()
        if path.is_relative_to(root):return path.relative_to(root).as_posix()
        raise EvidencePathError(f'unmapped evidence path: {path}')
    def resolve(logical_path: str) -> Path:
        if logical_path==HISTORICAL:return historical
        if logical_path==LOGICAL+'/adjudication/EXPECTED_252_EVENT_TYPES.tsv':return expected
        prefix=LOGICAL+'/adjudication/source_groups/'
        if logical_path.startswith(prefix):return contained_path(groups,logical_path[len(prefix):])
        prefix=LOGICAL+'/'
        if logical_path.startswith(prefix):return contained_path(output,logical_path[len(prefix):])
        # Other recorded inputs are live source/validator files, never remapped.
        return contained_path(root,logical_path)
    namespace['rel']=logical
    namespace['resolve_artifact_reference']=resolve
