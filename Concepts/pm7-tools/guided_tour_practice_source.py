"""Pure local tour-practice reducer; no provider, persistence, or live planning work."""

PLANNING_PRACTICE_SCRIPT = r'''
  function createGuidedPlanningPractice(options) {
    var choices=['me','organizers','unsure'];
    function create() {
      return {schema_id:'pm.guided_tour.planning_fixture.v2',project_selected:false,
        goal:options.goal,goal_submitted:false,guided_selected:false,outcomes_visible:false,
        answer:null,why_visible:false,review_visible:false,editing:false,edit_from:null,
        edited:false,consequence_revision:0,work_started:false};
    }
    function apply(current,action,value) {
      var next=Object.assign({},current),error=null;
      if(action==='project')next.project_selected=true;
      else if(action==='goal'){
        if(!current.project_selected)error='Choose the practice Project first.';
        else if(!String(value||'').trim())error='Add one sentence about the result you want.';
        else {next.goal=String(value).trim();next.goal_submitted=true;}
      }else if(action==='guided')next.guided_selected=true;
      else if(action==='outcomes'){
        if(!current.goal_submitted||!current.guided_selected)error='Add your goal and choose guided planning first.';
        else next.outcomes_visible=true;
      }else if(action==='answer'){
        if(!current.outcomes_visible||choices.indexOf(value)<0)error='Choose one of the available answers.';
        else if(current.editing&&value===current.edit_from)error='Choose a different answer to see what changes.';
        else {
          next.answer=value;
          if(current.editing){
            next.editing=false;next.edited=true;next.review_visible=true;
            next.consequence_revision=current.consequence_revision+1;
          }
        }
      }else if(action==='why'){
        if(!current.outcomes_visible)error='Open the outcomes first.';
        else next.why_visible=true;
      }else if(action==='review'){
        if(!current.answer)error='Answer the editing question first.';
        else next.review_visible=true;
      }else if(action==='edit'){
        if(!current.review_visible||!current.answer)error='Review the practice plan first.';
        else {next.editing=true;next.edit_from=current.answer;next.edited=false;}
      }else error='That practice action is unavailable.';
      return {ok:!error,error:error,state:error?current:next,
        changed:!error&&JSON.stringify(next)!==JSON.stringify(current),
        concept_simulation_only:true,production_receipt:false,work_started:false};
    }
    function view(current) {
      var unknown=current.answer===null||current.answer==='unsure';
      return {decision:current.answer==='me'?'Only I can update it':current.answer==='organizers'?
          'A few organizers can update it':'Who can update it is still open',
        access_state:unknown?'unresolved':current.answer==='organizers'?'included':'not_needed',
        access:unknown?'Shared access needs a decision':current.answer==='organizers'?
          'Sign-in and organizer access included':'Shared sign-in is not needed for only me',
        unresolved:unknown?'Editor access still needs a decision':'No blocking choices in this practice',
        assumption:'The meeting, book, and joining details are supplied by the club.',
        edit_choice:current.answer==='me'?'organizers':'me'};
    }
    return {create:create,apply:apply,view:view,choices:choices.slice()};
  }
'''

if __name__ == "__main__":
    print(PLANNING_PRACTICE_SCRIPT)
