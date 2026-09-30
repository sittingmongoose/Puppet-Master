#!/usr/bin/env python3
"""Export public tracked bytes/history mechanically. No source execution or model dispatch."""
import hashlib,json,os,subprocess,time
from pathlib import Path
LAB=Path(__file__).resolve().parent.parent
RAW=LAB/'evaluation/private/jj-repo-dev-v1-acquisition'
CASE=LAB/'evaluation/exports/jj-repo-dev-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
def git(*args):return subprocess.check_output(['git','-C',str(RAW/'clone'),*args],env={'PATH':os.environ['PATH'],'HOME':str(RAW/'home'),'GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null','GIT_TERMINAL_PROMPT':'0'})
def main():
 start=time.monotonic();commit=git('rev-parse','HEAD').decode().strip();files={}
 for row in git('ls-tree','-rz','HEAD').split(b'\0'):
  if not row:continue
  info,name=row.split(b'\t',1);mode,kind,obj=info.decode().split();name=name.decode()
  if mode=='120000' or kind!='blob':raise ValueError('symlink/submodule unsupported')
  dest=CASE/'repository'/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(git('cat-file','blob',obj));files[name]=sha(dest)
 write(CASE/'PIN.json',{'schema':'er7.public_repo_pin.v1','repository_url':'https://github.com/jj-vcs/jj','tag':'v0.22.0','commit':commit,'files':files,'tree_scope':'Every tracked regular file at tag, no git metadata','execution':'Forbidden: third-party source/build/tests; read-only inspection only'})
 sources=[];history=[]
 for cid in git('rev-list','--since=2024-07-01T00:00:00Z','HEAD').decode().splitlines():
  rel='commit-patches/'+cid+'.patch';dest=CASE/rel;dest.parent.mkdir(exist_ok=True);dest.write_bytes(git('show','--format=fuller','--no-ext-diff','--no-textconv','--binary',cid))
  history.append({'commit':cid,'subject':git('show','-s','--format=%s',cid).decode().strip(),'file':rel,'url':'https://github.com/jj-vcs/jj/commit/'+cid,'sha256':sha(dest)})
  sources.append({'id':cid,'file':rel,'url':'https://github.com/jj-vcs/jj/commit/'+cid,'role':'raw_commit_patch','sha256':sha(dest)})
 write(CASE/'history-index.json',{'repository_url':'https://github.com/jj-vcs/jj','ancestry_tip':commit,'since':'2024-07-01T00:00:00Z','commits':history,'boundary':'Bounded shallow history; missing history is unknown, not absent'})
 sources.append({'id':'history-index','file':'history-index.json','role':'mechanical_commit_navigation','sha256':sha(CASE/'history-index.json')})
 raw=json.loads((RAW/'issues.json').read_text());issues=[]
 assert len(raw['items'])==raw['total_count']
 for item in raw['items']:
  # Exact captured public issue JSON; no rewriting of bodies into conclusions.
  rel='issues/'+str(item['number'])+'.json';write(CASE/rel,item)
  issues.append({'number':item['number'],'title':item['title'],'state_at_capture':item['state'],'created_at':item['created_at'],'updated_at':item['updated_at'],'file':rel,'url':item['html_url'],'comments_url':item['comments_url']})
  sources.append({'id':'issue-'+str(item['number']),'file':rel,'url':item['html_url'],'role':'public_issue_report_current_capture_not_release_time_truth','sha256':sha(CASE/rel)})
 write(CASE/'issues-index.json',{'selection':'Every issue created 2024-08-01..2024-10-02 in jj-vcs/jj, all states/labels, sorted created ascending','query':'https://api.github.com/search/issues?q=repo%3Ajj-vcs%2Fjj+is%3Aissue+created%3A2024-08-01..2024-10-02&sort=created&order=asc&per_page=100&page=1','total_count':raw['total_count'],'issues':issues,'captured_utc':'2026-09-30','boundary':'Body/status captured now, not reconstructed release-time state. Comments/followups not in this local capture; both arms may read official public URLs.'})
 sources.append({'id':'issues-index','file':'issues-index.json','role':'mechanical_issue_navigation','sha256':sha(CASE/'issues-index.json')})
 write(CASE/'catalog.json',{'schema':'er7.raw_source_catalog.v1','sources':sources,'scope':'Broad mechanical universe, not a semantic discovery list'})
 write(RAW/'export-receipt.json',{'elapsed_seconds':time.monotonic()-start,'commit':commit,'repository_files':len(files),'history_commits':len(history),'issue_records':len(issues),'repository_bytes':sum((CASE/'repository'/n).stat().st_size for n in files),'case_bytes_before_brief_freeze':sum(p.stat().st_size for p in CASE.rglob('*') if p.is_file()),'third_party_execution':False,'credential_access':False})
 print(json.dumps(json.loads((RAW/'export-receipt.json').read_text()),indent=2))
if __name__=='__main__':main()
