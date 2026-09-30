"""Read-isolate native candidates from management, history and private state."""
import json
import os
import shutil
import tomllib
from pathlib import Path

HOME=Path('/home/sittingmongoose')
LAB=HOME/'PM-Experiments'
CODEX=HOME/'.codex'

def namespace_command(argv, workspace, output, family='L', readonly_code=None):
    workspace=Path(workspace).resolve();output=Path(output).resolve()
    if not workspace.is_dir() or not output.is_dir(): raise ValueError('bound directories must exist')
    cmd=['bwrap','--die-with-parent','--new-session','--unshare-pid','--ro-bind','/','/',
         '--dev','/dev','--proc','/proc','--tmpfs','/tmp']
    masks=[LAB,HOME/'pm-worktrees',Path('/mnt/Cursor'),HOME/'.agents',HOME/'.codex/PuppetMaster-AssuranceLab',HOME/'PuppetMaster-AssuranceLab',Path('/root')]
    if family=='L':
        # Hide the entire user's home, not just the known current lab. Expose
        # only the installed binary and existing subscription login to server.
        masks=[HOME,Path('/mnt/Cursor'),Path('/root')]
        runtime=output/'runtime-home';runtime.mkdir(exist_ok=False)
        native=runtime/'.codex';native.mkdir()
        original=CODEX/'config.toml'
        cfg=tomllib.loads(original.read_text()) if original.exists() else {}
        # Service tier is preserved; plugins, MCP, hooks, projects and historic
        # agent instructions are excluded, without modifying shared config.
        text=''
        if cfg.get('service_tier') is not None:
            text='service_tier = '+json.dumps(cfg['service_tier'])+'\n'
        (native/'config.toml').write_text(text)
        binary=Path(shutil.which(argv[0]) or argv[0]).resolve()
        argv=[str(binary),*argv[1:]]
    elif family=='M':
        masks.extend([CODEX,HOME/'.zcode'])
        muse=HOME/'.local/share/muse'
        for name in ('sessions','memory','local-tracing','runtime'):
            if (muse/name).is_dir():masks.append(muse/name)
        for name in ('session-index.db','session-index.db-wal','session-index.db-shm','tui-history.jsonl'):
            path=muse/name
            if path.exists():cmd+=['--ro-bind','/dev/null',str(path)]
    elif family=='Z':
        masks.extend([CODEX,HOME/'.local/share/muse'])
        for name in ('cli','workspace','server','plugin-workspace','tmp'):
            path=HOME/'.zcode'/name
            if path.is_dir():masks.append(path)
    if family!='L':
        # Historical laboratories/evidence and other assistants are not native
        # runtime dependencies. Hide them regardless of the current campaign ID.
        for path in HOME.iterdir():
            if path.is_dir() and (path.name.startswith(('pm-','b17','b18','b19','b20','.claude','.codex-','.cursor','.devin','.gemini','.qoder')) or path.name in ('Desktop','Documents','Downloads','.ssh','.gnupg','.cache','.copilot','.agents')):
                masks.append(path)
    for path in dict.fromkeys(masks):
        if path.exists():cmd+=['--tmpfs',str(path)]
    for path in (workspace,output):cmd+=['--bind',str(path),str(path)]
    if family=='L':
        cmd+=['--bind',str(native),str(CODEX),'--ro-bind',str(CODEX/'packages'),str(CODEX/'packages')]
        for name in ('auth.json','installation_id'):
            path=CODEX/name
            if path.exists():cmd+=['--ro-bind',str(path),str(CODEX/name)]
    # Existing native subscription identity supplies login; do not carry inherited
    # API-key/PAYG credentials into any campaign candidate.
    for key in os.environ:
        if any(word in key.upper() for word in ('TOKEN','SECRET','PASSWORD','API_KEY','CREDENTIAL')):
            cmd+=['--unsetenv',key]
    if readonly_code:
        path=Path(readonly_code).resolve();cmd+=['--ro-bind',str(path),str(path)]
    cmd+=['--chdir',str(workspace),'--',*argv]
    return cmd
