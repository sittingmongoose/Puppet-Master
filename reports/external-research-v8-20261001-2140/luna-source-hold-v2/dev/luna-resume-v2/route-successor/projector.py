"""Allowlisted structural projections from in-memory native RPC, never raw I/O."""
import re
import json
from pathlib import Path
import time
from controls import MODEL, EFFORT, MCP_TOOLS
IDENT = re.compile(r'^[A-Za-z0-9_.:-]{1,160}$')
ITEMS=json.loads(Path(__file__).with_name('item-contract.json').read_text())['items']


def item_valid(item):
    if not isinstance(item,dict):return False
    kind=item.get('type');contract=ITEMS.get(kind)
    if not contract or not set(contract['required'])<=item.keys() or not item.keys()<=set(contract['allowed']):return False
    if not isinstance(item.get('id'),str) or not IDENT.fullmatch(item['id']):return False
    if kind=='agentMessage':return isinstance(item.get('text'),str) and item.get('questions') is None
    if kind=='userMessage':return isinstance(item.get('content'),list) and all(isinstance(x,dict) and x.get('type')=='text' and isinstance(x.get('text'),str) for x in item['content'])
    if kind=='reasoning':return all(isinstance(item.get(k,[]),list) and all(isinstance(v,str) for v in item.get(k,[])) for k in ('content','summary'))
    if kind in ('mcpToolCall','dynamicToolCall'):
        if item.get('status') not in {'inProgress','completed','failed'} or not isinstance(item.get('arguments'),dict):return False
        if kind=='mcpToolCall':
            result=item.get('result');error=item.get('error')
            if result is not None and (not isinstance(result,dict) or not set(result)<={'content','structuredContent','_meta'} or result.get('_meta') is not None or not isinstance(result.get('content'),list) or not all(isinstance(v,dict) and v.get('type')=='text' and isinstance(v.get('text'),str) and set(v)<={'type','text','annotations','_meta'} for v in result['content'])):return False
            if error is not None and (not isinstance(error,dict) or set(error)!={'message'} or not isinstance(error['message'],str)):return False
            return item.get('server')=='pm_boundary' and item.get('tool') in MCP_TOOLS and all(item.get(k) is None for k in ('appContext','mcpAppResourceUri','mcpAppUi','pluginId'))
        content=item.get('contentItems')
        if content is not None and (not isinstance(content,list) or not all(isinstance(v,dict) and set(v)=={'type','text'} and v['type']=='inputText' and isinstance(v['text'],str) for v in content)):return False
        args=item['arguments'];name=item.get('tool')
        if name=='get_goal' and args!={}:return False
        if name=='update_goal' and (set(args)!={'status'} or args['status'] not in {'complete','blocked','paused'}):return False
        return item.get('namespace') is None and name in {'get_goal','update_goal'}
    if kind=='functionCallOutput':
        output=item['output']
        return item.get('namespace') is None and item.get('name') in {'get_goal','update_goal'} and (isinstance(output,str) or isinstance(output,list) and all(isinstance(v,dict) and set(v)=={'type','text'} and v['type']=='input_text' and isinstance(v['text'],str) for v in output))
    return kind=='contextCompaction'


STATUSES = {'active','paused','blocked','usageLimited','budgetLimited','complete'}


def ident(value):
    if not isinstance(value,str) or not IDENT.fullmatch(value): raise ValueError('invalid native identity')
    return value


class State:
    def __init__(self):
        self.thread = None
        self.initial_turn = None
        self.turns = set()
        self.completed = set()
        self.active_turns = set()
        self.goal_status = None
        self.goal_set_ack = False
        self.goal_created_at = None
        self.goal_objective = None
        self.goal_replacements_observed = 0
        self.initial_turn_ack = False
        self.activation = {'schema':'er8.route.activation-positive.v1',
                           'native_activation_observed':False,'native_activation_absent_proof':False}
        self.usage = {}
        self.response_upper_bound = 0
        self.usage_events = 0
        self.output_lower_bound = 0
        self.failed = False
        self.mcp_verified = False
        self.native_tool_payload_observed = False
        self.tool_counts = {}
        self.goal_tool_counts = {}

    def bind_thread(self, reply, workspace):
        row=reply['thread']
        self.thread=ident(row['id'])
        if (reply.get('model')!=MODEL or reply.get('reasoningEffort')!=EFFORT or
            reply.get('cwd')!=str(workspace) or reply.get('modelProvider')!='openai' or
            reply.get('approvalPolicy')!='never' or reply.get('instructionSources')!=[] or
            row.get('ephemeral') is not False or row.get('turns')!=[] or
            row.get('forkedFromId') is not None):
            raise ValueError('exact fresh native thread acknowledgement missing')
        return {'fresh_empty_history':True,'instruction_sources_empty':True,
                'model':MODEL,'effort':EFFORT,'ephemeral':False}

    def mcp_catalog(self, reply):
        rows=reply.get('data',[])
        if reply.get('nextCursor') or len(rows)!=1: raise ValueError('one exact MCP server required')
        row=rows[0]
        if (row.get('name')!='pm_boundary' or set(row.get('tools',{}))!=MCP_TOOLS or
            row.get('resources')!=[] or row.get('resourceTemplates')!=[] or
            row.get('toolsError') is not None or row.get('pluginId') is not None):
            raise ValueError('MCP inventory mismatch')
        self.mcp_verified=True
        return {'server':'pm_boundary','tools':sorted(MCP_TOOLS),'resources':0,'resource_templates':0}

    def goal(self, reply):
        goal=reply.get('goal')
        if not isinstance(goal,dict) or goal.get('threadId')!=self.thread or goal.get('status') not in STATUSES:
            raise ValueError('fresh thread Goal mismatch')
        if goal.get('tokenBudget') is not None: raise ValueError('unrequested token budget')
        if self.goal_created_at is not None and (goal.get('createdAt')!=self.goal_created_at or goal.get('objective')!=self.goal_objective):
            self.goal_replacements_observed+=1;self.failed=True
            raise ValueError('second native Goal/replaced objective forbidden')
        self.goal_status=goal['status']
        return self.goal_status

    def maybe_activation(self):
        if self.goal_set_ack and self.initial_turn_ack and self.initial_turn in self.turns and not self.activation['native_activation_observed']:
            self.activation.update(native_activation_observed=True,
                goal_started_turn=True,receipt_id=self.thread,
                observed_activation_epoch=time.time_ns()//10**9,
                observed_activation_monotonic_ns=time.monotonic_ns())

    def event(self, obj):
        if not isinstance(obj,dict):self.failed=True;return
        method=obj.get('method'); p=obj.get('params') or {}
        if not isinstance(p,dict):self.failed=True;return
        if method in ('item/started','item/completed') and not item_valid(p.get('item')):
            self.failed=True;return
        if method in ('model/rerouted','error'):
            self.failed=True;return
        if not self.thread or p.get('threadId')!=self.thread:return
        if method=='thread/goal/updated':self.goal(p)
        elif method in ('turn/started','turn/completed'):
            row=p['turn']; turn=ident(row['id'])
            if method=='turn/started':
                self.turns.add(turn);self.active_turns.add(turn)
            else:
                self.completed.add(turn);self.active_turns.discard(turn)
                if row.get('status')!='completed':self.failed=True
            self.maybe_activation()
        elif method=='thread/tokenUsage/updated':
            usage=p.get('tokenUsage',{}).get('total',{})
            fields=('inputTokens','cachedInputTokens','outputTokens','reasoningOutputTokens','totalTokens')
            if any(type(usage.get(k)) is not int or usage[k]<0 for k in fields):
                self.failed=True;return
            if usage['outputTokens']<self.output_lower_bound:
                self.failed=True;return
            # Notifications and monotonic tokens are observed separately.
            # This counter is not a response or HTTP-attempt limit.
            self.usage_events+=1;self.response_upper_bound+=1
            self.output_lower_bound=usage['outputTokens'];self.usage={k:usage[k] for k in fields}
        elif method in ('item/started','item/completed'):
            item=p.get('item',{});kind=item.get('type')
            if kind=='mcpToolCall':
                name=item.get('tool');server=item.get('server')
                if server!='pm_boundary' or name not in MCP_TOOLS:self.failed=True
                elif method=='item/completed':self.tool_counts[name]=self.tool_counts.get(name,0)+1
            elif kind in ('dynamicToolCall','functionCallOutput'):
                # The same-version Goal extension registers ToolName::plain.
                # Native outputs are opaque: project only the bound name/namespace.
                name=item.get('name') if kind=='functionCallOutput' else item.get('tool')
                required={'id','name','output','type'} if kind=='functionCallOutput' else {'id','tool','arguments','status','type'}
                if not required<=item.keys() or not isinstance(item.get('id'),str) or not IDENT.fullmatch(item['id']):
                    self.failed=True;return
                if kind=='functionCallOutput':
                    output=item['output']
                    if not isinstance(output,str) and not (isinstance(output,list) and all(isinstance(v,dict) and set(v)=={'type','text'} and v['type']=='input_text' and isinstance(v['text'],str) for v in output)):
                        self.failed=True;return
                elif item.get('status') not in {'inProgress','completed','failed'}:
                    self.failed=True;return
                if item.get('namespace') is not None or name not in {'get_goal','update_goal'}:
                    self.failed=True
                elif method=='item/completed':
                    if kind=='dynamicToolCall' and (item.get('status')!='completed' or item.get('success') is not True):self.failed=True
                    else:self.goal_tool_counts[name]=self.goal_tool_counts.get(name,0)+1
            elif kind not in {'userMessage','agentMessage','reasoning','contextCompaction'}:
                # Includes second create_goal, resource helper, subagent, image,
                # command, file, hook/sleep and any future schema item.
                self.failed=True

    def metrics(self):
        return {'schema':'er8.luna.public-metrics.v1','fresh_session':self.thread is not None,
            'requested_model':MODEL,'requested_effort':EFFORT,'goal_target_id':self.thread,
            'goal_started_turn':self.activation['native_activation_observed'],
            'activation':self.activation,'goal_status_final':self.goal_status,
            'native_responses':'UNKNOWN','usage_notification_count':self.usage_events,
            'native_response_policy':'wall-goal-token-observation-v1','native_model_response_cap_enforced':False,
            'candidate_goals_set_by_host':int(self.goal_set_ack),'goal_replacements_observed':self.goal_replacements_observed,
            'native_response_measure':'HTTP attempts UNKNOWN; native wall and one Goal enforced; tokens observed',
            'native_turns_started':len(self.turns),'native_turns_completed':len(self.completed),
            'native_owned_continuation_observed':len(self.turns)>1,
            'host_initial_turns_started':int(self.initial_turn_ack),'host_followup_turns_started':0,
            'usage_totals':self.usage,'tool_completed_counts':self.tool_counts,'goal_tool_completed_counts':self.goal_tool_counts,
            'inventory_check':{'verified':False,'native_mcp_catalog_verified':self.mcp_verified,
                'actual_inference_tool_payload_observed':False,'scope':'source-controlled restriction plus MCP catalog; request payload UNKNOWN'},
            'native_http_attempts':'UNKNOWN','cost':'UNKNOWN','component_outcome':'HOLD'}
