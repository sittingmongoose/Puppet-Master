"""Source-owned T43 live occupied-neighbor Usage resize preview.

T43 narrowly supersedes the frozen-peer portion of WS-019 for Usage pointer
resize. It reuses the T39 deterministic grid session: the lifted card and an
in-flow target footprint paint the last supported size, only obstructed peers
move, and an accepted release persists those exact slots without remounting
the board. Dashboard, Assistant, and Settings sources remain unchanged.
"""

from __future__ import annotations

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T43: live occupied-neighbor Usage resize preview"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T43 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _replace_band(doc, start, end, replacement, need, label):
    need(doc.count(start) == 1, "T43 %s: start anchor count %d" % (label, doc.count(start)))
    need(doc.count(end) == 1, "T43 %s: end anchor count %d" % (label, doc.count(end)))
    begin = doc.index(start)
    finish = doc.index(end, begin)
    need(finish > begin, "T43 %s: invalid anchor order" % label)
    return doc[:begin] + replacement + "\n\n" + doc[finish:]


GRID_PLACEHOLDER_BEFORE = r'''    if (element.classList.contains('pm7u-reorder-placeholder')) {
      element.setAttribute('data-grid-slot','true');
      element.style.setProperty('--pm7u-target-column',column);
      element.style.setProperty('--pm7u-target-row',row);
    } else {
'''


GRID_PLACEHOLDER_AFTER = r'''    if (element.classList.contains('pm7u-reorder-placeholder')) {
      element.setAttribute('data-grid-slot','true');
      element.style.setProperty('--pm7u-target-column',column);
      element.style.setProperty('--pm7u-target-row',row);
    } else if (element.classList.contains('pm7u-resize-placeholder')) {
      element.setAttribute('data-grid-slot','true');
      element.style.setProperty('--pm7-placeholder-column',column);
      element.style.setProperty('--pm7-placeholder-row',row);
    } else {
'''


SIMULATE_TAIL_BEFORE = r'''      var movedIndex=resultingOrder.indexOf(movedId);
      return { placements:placements,resulting_order:resultingOrder,before_id:movedIndex+1<resultingOrder.length?resultingOrder[movedIndex+1]:null,after_id:movedIndex>0?resultingOrder[movedIndex-1]:null };
    }
    var candidates=[];
'''


SIMULATE_TAIL_AFTER = r'''      var movedIndex=resultingOrder.indexOf(movedId);
      return { placements:placements,resulting_order:resultingOrder,before_id:movedIndex+1<resultingOrder.length?resultingOrder[movedIndex+1]:null,after_id:movedIndex>0?resultingOrder[movedIndex-1]:null };
    }
    function resizeIntent(colSpan,rowSpan) {
      colSpan=Math.max(1,Math.min(metrics.trackCount,Math.round(colSpan)));
      rowSpan=Math.max(1,Math.round(rowSpan));
      var target={
        col:Math.max(1,Math.min(moved.col,metrics.trackCount-colSpan+1)),
        row:moved.row,col_span:colSpan,row_span:rowSpan
      };
      var simulated=simulate(target);if(!simulated)return null;
      var movedIndex=simulated.resulting_order.indexOf(movedId);
      return {
        token:usageSlotId(metrics,target)+':'+colSpan+'x'+rowSpan,
        slot_id:usageSlotId(metrics,target),col:target.col,row:target.row,index:movedIndex,
        before_id:simulated.before_id,after_id:simulated.after_id,
        rect:usageGridRect(target,metrics),placements:simulated.placements,resulting_order:simulated.resulting_order
      };
    }
    var candidates=[];
'''


SESSION_RETURN_BEFORE = r'''    return { metrics:metrics,cards:cards,cardsById:cardsById,movedId:movedId,originalOrder:originalOrder,originalPlacements:originalPlacements,originalStyles:originalStyles,candidates:candidates,originalIntent:originalIntent,apply:apply,restore:restore,restoreBoardMinHeight:restoreBoardMinHeight };
'''


SESSION_RETURN_AFTER = r'''    return { metrics:metrics,cards:cards,cardsById:cardsById,movedId:movedId,originalOrder:originalOrder,originalPlacements:originalPlacements,originalStyles:originalStyles,candidates:candidates,originalIntent:originalIntent,resizeIntent:resizeIntent,apply:apply,restore:restore,restoreBoardMinHeight:restoreBoardMinHeight };
'''


START_RESIZE = "  function startResize(event, cardElement, item, controlHandle) {"
START_RESIZE_END = "  function flipBefore() {"


START_RESIZE_AFTER = r'''  /* PM7 T43: live occupied-neighbor Usage resize preview. */
  function prepareUsageGridResize(session,intent) {
    if(!session||!intent)return null;
    return prepareUsageGridMove(session,intent,fullRoomOrder(session.originalOrder));
  }
  function commitUsageGridResize(session,intent,item,before,next,source) {
    var candidateState=prepareUsageGridResize(session,intent);
    if(!candidateState)return {committed:false,dispatched:false};
    var receipt=command(
      'cmd.widget.resize',
      {page:'usage',instance_id:item.id,col_span:next.cols,row_span:next.rows},
      {persisted:false,source:source},
      {defer_receipt:true}
    );
    if(receipt.dispatch_accepted===false){
      completeCommandReceipt(receipt,{persisted:false,reason:'owner_rejected',rolled_back:true},'rejected');
      return {committed:false,dispatched:true};
    }
    if(!persistUsageWholeState(candidateState)){
      completeCommandReceipt(receipt,{persisted:false,reason:'usage_workspace_write_failed',rolled_back:true},'failed');
      return {committed:false,dispatched:true};
    }
    completeCommandReceipt(receipt,{persisted:true,source:source},'accepted');
    usageEvent('view.usage.widget_resized',{widget_id:item.id,source:source,before:before,after:next,content_density:densityFor(next,item)});
    return {committed:true,dispatched:true};
  }
  function startResize(event, cardElement, item, controlHandle) {
    settleUsageCardAnimations();resetUsageMagnetState();
    clearUsageCardControlLease(cardElement);
    if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation(); closePops();
    var handle = controlHandle || event.currentTarget || event.target, pointerId = event.pointerId;
    var session=createUsageGridSession(cardElement);if(!session)return;
    var original = layoutFor(item), startX = event.clientX, startY = event.clientY;
    var boardStyle = getComputedStyle(board);
    var columnGap = parseFloat(boardStyle.columnGap) || 10;
    var rowGap = parseFloat(boardStyle.rowGap) || columnGap;
    var rowHeight = parseFloat(boardStyle.gridAutoRows) || 100;
    var trackCount=session.metrics.trackCount;
    var cellWidth=session.metrics.trackWidth;
    function physicalColumnSpan(logicalCols) {
      var liveStyle=getComputedStyle(cardElement),start=String(liveStyle.gridColumnStart||''),end=String(liveStyle.gridColumnEnd||'');
      if(start==='1'&&end==='-1')return trackCount;
      var explicitSpan=/span\s+([0-9]+)/.exec(end);
      return explicitSpan?Math.max(1,Math.min(trackCount,Number(explicitSpan[1]))):Math.max(1,Math.min(trackCount,logicalCols));
    }
    function physicalRowSpan(logicalRows) {
      var end=String(getComputedStyle(cardElement).gridRowEnd||''),explicitSpan=/span\s+([0-9]+)/.exec(end);
      return explicitSpan?Math.max(1,Number(explicitSpan[1])):Math.max(1,logicalRows);
    }
    var lastCols=original.cols,lastRows=original.rows,lastIntent=session.originalIntent;
    var changed=false,finished=false;
    var origin=cardElement.getBoundingClientRect();

    var placeholder=document.createElement('div');
    placeholder.className='pm7u-resize-placeholder';placeholder.setAttribute('aria-hidden','true');
    board.insertBefore(placeholder,cardElement);

    cardElement.classList.add('is-resizing','pm7u-resize-lift');
    cardElement.style.left=origin.left+'px';cardElement.style.top=origin.top+'px';
    cardElement.style.width=origin.width+'px';cardElement.style.height=origin.height+'px';
    /* Persisted grid slots are inline !important declarations. Removing,
       rather than assigning auto, exposes the current responsive CSS span. */
    cardElement.style.removeProperty('grid-column');cardElement.style.removeProperty('grid-row');
    /* A restored slot owns grid-column through [data-pm7-slot-id].  Suspend
       that selector while the fixed lift derives its responsive span from
       the requested logical size; the captured session restores or replaces
       the slot identity synchronously at terminal settlement. */
    cardElement.removeAttribute('data-pm7-slot-id');opOn();
    session.apply(lastIntent,placeholder,false);

    var hud=document.createElement('div');hud.className='pm7u-sizehud';document.body.appendChild(hud);
    function updateHud(pointerEvent,layout){
      hud.textContent=layout.cols+' columns · '+layout.rows+' row'+(layout.rows===1?'':'s')+' · '+densityLabel(densityFor(layout,item));
      hud.style.left=Math.min(innerWidth-215,pointerEvent.clientX+12)+'px';
      hud.style.top=Math.min(innerHeight-34,pointerEvent.clientY+12)+'px';
    }
    function alignLiftToPlaceholder(){
      var target=placeholder.getBoundingClientRect();
      cardElement.style.left=target.left+'px';cardElement.style.top=target.top+'px';
      cardElement.style.width=target.width+'px';cardElement.style.height=target.height+'px';
    }
    alignLiftToPlaceholder();updateHud(event,original);
    function move(moveEvent){
      if(moveEvent.pointerId!==pointerId)return;moveEvent.preventDefault();
      var colSteps=quantizeResizeSteps(moveEvent.clientX-startX,cellWidth+columnGap,Math.max(0,window.innerWidth-startX),Math.max(0,startX));
      var rowSteps=Math.round((moveEvent.clientY-startY)/(rowHeight+rowGap));
      var next=resolveResizeIntent(item,original,original.cols+colSteps,original.rows+rowSteps);
      if(next.cols===lastCols&&next.rows===lastRows){updateHud(moveEvent,next);return;}
      applyLiveLayout(cardElement,next,item);
      var intent=session.resizeIntent(physicalColumnSpan(next.cols),physicalRowSpan(next.rows));
      if(!intent){applyLiveLayout(cardElement,{cols:lastCols,rows:lastRows},item);updateHud(moveEvent,{cols:lastCols,rows:lastRows});return;}
      lastCols=next.cols;lastRows=next.rows;lastIntent=intent;
      changed=next.cols!==original.cols||next.rows!==original.rows;
      session.apply(lastIntent,placeholder,true);alignLiftToPlaceholder();
      applyPhysicalContentTier(cardElement);scheduleUsageChartLabels(cardElement);updateHud(moveEvent,next);
    }
    function clearTransient(){
      document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',commit,true);
      document.removeEventListener('pointercancel',cancel,true);document.removeEventListener('keydown',keydown,true);
      window.removeEventListener('blur',blur);handle.removeEventListener('lostpointercapture',lostCapture);
      try{if(handle.hasPointerCapture(pointerId))handle.releasePointerCapture(pointerId);}catch(error){}
      cardElement.classList.remove('is-resizing','pm7u-resize-lift','is-density-changing');
      cardElement.style.left='';cardElement.style.top='';cardElement.style.width='';cardElement.style.height='';
      cardElement.style.removeProperty('grid-column');cardElement.style.removeProperty('grid-row');
      if(placeholder.parentNode)placeholder.remove();if(hud.parentNode)hud.remove();
    }
    function finish(shouldCommit){
      if(finished)return;finished=true;
      var outcome={committed:false,dispatched:false};
      if(shouldCommit&&changed)outcome=commitUsageGridResize(session,lastIntent,item,original,{cols:lastCols,rows:lastRows},'pointer');
      if(outcome.committed){
        clearTransient();
        session.cards.forEach(cancelUsagePeerAnimation);
        setUsageGridStyle(cardElement,lastIntent.placements[session.movedId],usageSlotId(session.metrics,lastIntent.placements[session.movedId]));
        session.restoreBoardMinHeight();opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();
      }else{
        applyLiveLayout(cardElement,original,item);clearTransient();session.restore();
        opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();
      }
    }
    function validRelease(upEvent){
      var releaseX=Number(upEvent.clientX),releaseY=Number(upEvent.clientY);
      if(!isFinite(releaseX)||!isFinite(releaseY))return false;
      var horizontalStep=Math.max(1,cellWidth+columnGap),verticalStep=Math.max(1,rowHeight+rowGap);
      var viewportWidth=Math.max(1,document.documentElement.clientWidth||window.innerWidth||0);
      var viewportHeight=Math.max(1,document.documentElement.clientHeight||window.innerHeight||0);
      return releaseX>=-horizontalStep&&releaseX<=viewportWidth+horizontalStep&&releaseY>=-verticalStep&&releaseY<=viewportHeight+verticalStep;
    }
    function commit(upEvent){if(upEvent.pointerId!==pointerId)return;upEvent.preventDefault();finish(validRelease(upEvent));}
    function cancel(cancelEvent){if(cancelEvent&&cancelEvent.pointerId!=null&&cancelEvent.pointerId!==pointerId)return;finish(false);}
    function keydown(keyEvent){if(keyEvent.key!=='Escape')return;keyEvent.preventDefault();finish(false);}
    function blur(){finish(false);}
    function lostCapture(captureEvent){if(captureEvent.pointerId===pointerId)finish(false);}

    handle.addEventListener('lostpointercapture',lostCapture);
    try{handle.setPointerCapture(pointerId);}catch(error){}
    document.addEventListener('pointermove',move,{capture:true,passive:false});
    document.addEventListener('pointerup',commit,true);document.addEventListener('pointercancel',cancel,true);
    document.addEventListener('keydown',keydown,true);window.addEventListener('blur',blur);
  }
'''


CSS_COMMENT_BEFORE = "/* Frozen-grid resize transaction. */"
CSS_COMMENT_AFTER = "/* Live-grid Usage resize transaction; Dashboard ownership is unchanged. */"
LIFT_TRANSITION_BEFORE = "transition:width 105ms cubic-bezier(.2,.8,.2,1),height 105ms cubic-bezier(.2,.8,.2,1),box-shadow 150ms ease!important"
LIFT_TRANSITION_AFTER = "transition:left 105ms cubic-bezier(.2,.8,.2,1),top 105ms cubic-bezier(.2,.8,.2,1),width 105ms cubic-bezier(.2,.8,.2,1),height 105ms cubic-bezier(.2,.8,.2,1),box-shadow 150ms ease!important"


def apply(doc, notes, need):
    """Apply T43 after T42 and emit fail-closed source/effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T43: transform already applied")
    need("PM7 T42: first-visible Usage slot restoration" in doc, "T43: T42 marker missing")
    protected_before = capture_protected_sources(doc, need, "T43 input")
    effects_before = capture_effect_surfaces(doc)

    doc = _replace_once(doc, GRID_PLACEHOLDER_BEFORE, GRID_PLACEHOLDER_AFTER, need, "resize placeholder grid slot")
    doc = _replace_once(doc, SIMULATE_TAIL_BEFORE, SIMULATE_TAIL_AFTER, need, "shared resize simulation")
    doc = _replace_once(doc, SESSION_RETURN_BEFORE, SESSION_RETURN_AFTER, need, "resize-intent exposure")
    doc = _replace_band(doc, START_RESIZE, START_RESIZE_END, START_RESIZE_AFTER, need, "pointer resize controller")
    doc = _replace_once(doc, CSS_COMMENT_BEFORE, CSS_COMMENT_AFTER, need, "resize contract CSS comment")
    doc = _replace_once(doc, LIFT_TRANSITION_BEFORE, LIFT_TRANSITION_AFTER, need, "synchronized lift geometry transition")

    protected_receipt = assert_protected_sources_equal(
        protected_before, capture_protected_sources(doc, need, "T43 output"), need, "T43"
    )
    effect_receipt = assert_effect_delta(effects_before, capture_effect_surfaces(doc), {}, need, "T43")

    need(doc.count(TRANSFORM_MARKER) == 1, "T43: transform marker census mismatch")
    need(doc.count("function resizeIntent(colSpan,rowSpan)") == 1, "T43: resize intent census mismatch")
    need(
        "resizeIntent:resizeIntent" in doc
        and "settleUsageCardAnimations();resetUsageMagnetState();" in doc
        and "cardElement.removeAttribute('data-pm7-slot-id');opOn();" in doc
        and "session.apply(lastIntent,placeholder,true);alignLiftToPlaceholder();" in doc
        and LIFT_TRANSITION_AFTER in doc
        and "applyPhysicalContentTier(cardElement);scheduleUsageChartLabels(cardElement);" in doc
        and "prepareUsageGridMove(session,intent,fullRoomOrder(session.originalOrder))" in doc
        and "setUsageGridStyle(cardElement,lastIntent.placements[session.movedId]" in doc
        and "applyLiveLayout(cardElement,original,item);clearTransient();session.restore();" in doc,
        "T43: live preview, exact settlement, or rollback path incomplete",
    )
    pointer_band = doc[doc.index(TRANSFORM_MARKER):doc.index(START_RESIZE_END, doc.index(TRANSFORM_MARKER))]
    need("renderSettledBoard" not in pointer_band, "T43: pointer resize still remounts the board")
    need("setLayout(item, lastCols, lastRows, 'cmd.widget.resize', 'pointer')" not in doc, "T43: legacy pointer resize settlement survived")
    need(
        all(token not in START_RESIZE_AFTER for token in ["PM7_CONTEXT", "Tome Tabs", "Kimi", "PM_Chat_Assistant_5.6_Pro_Standalone"]),
        "T43: protected Chat or Settings source referenced",
    )
    notes.update(
        {
            "decision": "authorized T43 Usage-only live occupied-neighbor pointer-resize preview",
            "preview_contract": "shared target-first grid simulation changes the real target footprint and only displaced mounted peers; no preview command, receipt, event, or write",
            "settlement_contract": "one accepted resize persists and retains the last-painted slot topology without board remount; cancel or failed settlement restores captured geometry",
            "dashboard_scope": "unchanged; Dashboard resize peers remain frozen",
            "protected_embedded_source_guard": protected_receipt,
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
