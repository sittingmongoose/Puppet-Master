
/* PM7 T47: global hover and focus tags */
(function () {
  'use strict';
  if (window.PM_HOVER_TAG_CONTROLLER) return;

  var ROOT_ID='pm-hover-tag-root', TAG_ID='pm-hover-tag-visual', DESCRIPTIONS_ID='pm-hover-tag-descriptions';
  var GAP=8, MARGIN=8, MAX_WIDTH=280, POINTER_OPEN_MS=1600, POINTER_STATIONARY_MS=1100, POINTER_RADIUS_PX=5, FOCUS_OPEN_MS=1000, DEPARTURE_GRACE_MS=160, OVERLAY_SETTLE_MS=560;
  var EXEMPTIONS=Object.freeze({
    'decorative':'Purely decorative, non-actionable paint with no user-visible datum.',
    'duplicate-visible-label':'Non-actionable duplicate text already described by the same semantic group.',
    'hidden-template':'Inert source template that is never mounted as an interactive surface.',
    'programmatic-focus-landmark':'Static heading focused only to announce a modal or route transition; it is not an action or a second tooltip target.',
    'tooltip-owner':'The shared hover-tag overlay and its persistent description nodes.',
    'noninteractive-chart-geometry':'Decorative chart scaffolding; each datum mark remains independently bound.',
    'labelled-field':'A field in a Settings panel whose label and help line sit beside it; a tag would only repeat them over the heading above.',
    'menu':'A menu and its rows, back button and search field, which already show their names; a row given its own data-pm-hover-label is not exempt and keeps its tag.'
  });
  var SEMANTIC_ACTION_SELECTOR='a[href],button,input:not([type="hidden"]),select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"],[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"],[role="slider"],[data-action],[data-command-id],[data-ui-action-id],[data-callback],[onclick]';
  var ACTION_SELECTOR=SEMANTIC_ACTION_SELECTOR+',[tabindex]';
  var SEMANTIC_SELECTOR='[title],[data-hover-tip],[data-tooltip],[data-pm-hover-label],[data-pm-hover-detail],[data-technical-id],[data-setting-id],[data-widget-id],[data-chart-mark],[data-status],[data-truncated],[class*="truncate"],[class*="ellipsis"],[class*="status"],[class*="badge"],[class*="pill"],code,kbd,samp,svg [data-value],svg [aria-label]';
  var BLOCKED_EVENTS=['click','dblclick','beforeinput','input','change','submit'];

  function clean(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function slug(value){return clean(value).toLowerCase().replace(/[^a-z0-9_.:-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,72)||'item';}
  function hash(value){var h=2166136261;for(var i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function attr(el,name){return clean(el&&el.getAttribute&&el.getAttribute(name));}
  function setAttrIfChanged(el,name,value){value=String(value);if(el.getAttribute(name)!==value)el.setAttribute(name,value);}
  function inOwner(el){return !!(el&&el.closest&&el.closest('#'+ROOT_ID));}
  function activeOverlay(){var tour=document.getElementById('pm-o55-tour'),onboarding=document.getElementById('pm-o55-onboarding');if(tour&&attr(tour,'data-open')==='true')return tour;if(onboarding&&attr(onboarding,'data-open')==='true')return onboarding;return null;}
  function isProductOverlayRoot(el){return !!(el&&el.nodeType===1&&(el.id==='pm-o55-tour'||el.id==='pm-o55-onboarding'));}
  function overlayTransitionRoot(record){
    if(!record)return null;
    if(record.type==='attributes'&&record.attributeName==='data-open'&&isProductOverlayRoot(record.target)&&record.oldValue!==record.target.getAttribute('data-open'))return record.target;
    if(record.type!=='childList')return null;
    for(var i=0;i<record.addedNodes.length;i++){
      var added=record.addedNodes[i];if(!added||added.nodeType!==1)continue;
      if(isProductOverlayRoot(added)&&attr(added,'data-open')==='true')return added;
      var nested=added.querySelector&&added.querySelector('#pm-o55-tour[data-open="true"],#pm-o55-onboarding[data-open="true"]');if(nested)return nested;
    }
    return null;
  }
  function overlayAllows(el){var overlay=activeOverlay();return !overlay||!!(el&&overlay.contains(el));}
  function activeSurface(payload){
    var overlay=activeOverlay();if(overlay)return overlay;
    var page=payload&&payload.detail?payload.detail.page:payload&&payload.page;
    if(page){var safe=String(page).replace(/[^a-z0-9_-]/gi,''),exact=document.querySelector('.primary-content > .page.page-'+safe);if(exact)return exact;}
    return document.querySelector('.primary-content > .page.active')||document.body;
  }
  function mutationSurfaceAllows(el){
    if(!el||el.nodeType!==1)return false;
    var overlay=activeOverlay();if(overlay)return overlay===el||overlay.contains(el)||el.contains(overlay);
    var page=el.closest&&el.closest('.primary-content > .page');return !page||page.classList.contains('active');
  }
  function visibleText(el){
    if(!el)return '';
    /* textContent concatenates adjacent semantic children (for example a
       button's <span> label and <small> consequence) with no separator.
       Join direct child groups before whitespace normalization so the shared
       tag never renders words jammed together, while avoiding innerText's
       layout read across the whole census. */
    var source=el.textContent||'';
    if(el.childNodes&&el.childNodes.length>1){var parts=[];for(var i=0;i<el.childNodes.length;i++){var node=el.childNodes[i],value=node.nodeType===3?node.nodeValue:(node.nodeType===1?node.textContent:'');if(clean(value))parts.push(value);}if(parts.length)source=parts.join(' ');}
    return clean(source).slice(0,320);
  }
  function labelText(el){
    var by=attr(el,'aria-labelledby');
    if(by){var text=by.split(/\s+/).map(function(id){var node=document.getElementById(id);return visibleText(node);}).filter(Boolean).join(' ');if(text)return text;}
    var aria=attr(el,'aria-label');if(aria)return aria;
    var ls=el&&(el.id||(el.closest&&el.closest('label')))?el.labels:null,ln=ls?ls.length:0;   /* O55: read once (B6) */
    if(ln){var own=[];for(var li=0;li<ln;li++)own.push(ls[li]);var labels=own.map(visibleText).filter(Boolean).join(' ');if(labels)return labels;}
    var text=visibleText(el);if(text)return text;
    return '';
  }
  function isNativeDisabled(el){return !!(el&&el.matches&&el.matches('button:disabled,input:disabled,select:disabled,textarea:disabled,fieldset:disabled'));}
  function isDisabled(el){return isNativeDisabled(el)||attr(el,'aria-disabled')==='true'||attr(el,'data-disabled')==='true'||el.classList.contains('disabled');}
  function isActionable(el){
    if(!el||!el.matches||inOwner(el))return false;
    if(el.matches(SEMANTIC_ACTION_SELECTOR))return true;
    return el.tabIndex>=0;
  }
  function isTruncated(el){
    if(!el)return false;
    if(attr(el,'data-truncated')==='true')return true;
    /* Bulk hover census runs during navigation. Geometry reads here would
       synchronously lay out the newly mounted page once per candidate and
       steal the first animation frames. Owners annotate dynamic clipping;
       stable CSS truncation uses semantic class/inline-style hints. */
    var signal=attr(el,'class')+' '+attr(el,'style');
    return /(?:^|[-_\s])(truncate|truncated|ellipsis)(?:[-_\s]|$)|text-overflow\s*:\s*ellipsis/i.test(signal);
  }
  function technicalAttribute(el){
    if(!el||!el.attributes)return '';
    /* Command/UI-action attributes identify wiring, not user-facing technical
       values. They still make the element actionable, but their raw tokens do
       not leak into the hover copy. */
    var preferred=['data-technical-id','data-setting-id','data-widget-id','data-instance-id','data-run-id','data-thread-id'];
    for(var i=0;i<preferred.length;i++){var value=attr(el,preferred[i]);if(value)return value;}
    for(var j=0;j<el.attributes.length;j++){
      var a=el.attributes[j];
      /* Controller-owned annotations describe the hover system itself; they
         are not product identifiers and must never feed back into copy. */
      if(/^data-pm-hover-/.test(a.name))continue;
      if(/^data-[a-z0-9-]*(?:id|key|ref)$/.test(a.name)&&clean(a.value))return clean(a.value);
    }
    var cls=attr(el,'class');
    if(el.matches('code,kbd,samp')||/(^|\s)(mono|monospace|technical|identifier|hash|commit|sha|path)(\s|$)/i.test(cls))return visibleText(el);
    return '';
  }
  function isChartMark(el){return !!(el&&el.matches&&el.matches('[data-chart-mark],svg [data-value],svg [aria-label],svg [role="img"] [tabindex]'));}
  function isStatus(el){var cls=attr(el,'class');return !!(attr(el,'data-status')||/(^|[-_\s])status([-_\s]|$)/i.test(cls));}
  function isBadge(el){var cls=attr(el,'class');return /(^|[-_\s])(badge|pill)([-_\s]|$)/i.test(cls);}
  function factsFor(el){
    if(!el||el.nodeType!==1||inOwner(el))return null;
    var actionable=isActionable(el),disabled=isDisabled(el),truncated=isTruncated(el),technical=technicalAttribute(el);
    var status=isStatus(el),badge=isBadge(el),chart=isChartMark(el),nativeTitle=attr(el,'title');
    var kindList=[];
    if(actionable)kindList.push('actionable');if(disabled)kindList.push('disabled');if(truncated)kindList.push('truncated');
    if(technical)kindList.push('technical-identifier');if(status)kindList.push('status');if(badge)kindList.push('badge');
    if(chart)kindList.push('chart-mark');if(nativeTitle)kindList.push('native-title');
    return {actionable:actionable,disabled:disabled,truncated:truncated,technical:technical,status:status,badge:badge,chart:chart,native_title:nativeTitle,kinds:kindList};
  }
  function kinds(el){var facts=factsFor(el);return facts?facts.kinds:[];}
  function isCandidate(el,facts){facts=facts||factsFor(el);return !!(facts&&(facts.kinds.length||el.matches(SEMANTIC_SELECTOR)));}
  function pinState(el){
    var signal=[attr(el,'data-action'),attr(el,'data-command-id'),attr(el,'data-ui-action-id'),attr(el,'id'),attr(el,'aria-label'),visibleText(el)].join(' ');
    if(!/(^|[^a-z])(?:un)?pin(?:ned|ning)?([^a-z]|$)/i.test(signal))return null;
    var pressed=attr(el,'aria-pressed'),data=attr(el,'data-pinned');
    var pinned=pressed==='true'||data==='true'||el.classList.contains('pinned')||/\bunpin\b/i.test(attr(el,'aria-label'));
    return pinned;
  }
  function actionSignal(el){return attr(el,'data-pm-home-action')||attr(el,'data-pm-home-top-action')||attr(el,'data-ui-action-id')||attr(el,'data-command-id')||attr(el,'data-action');}
  function humanActionCopy(el){
    var action=actionSignal(el),id=attr(el,'id'),visible=visibleText(el),visibleLower=visible.toLowerCase(),signal=[action,id,attr(el,'class'),attr(el,'aria-label'),visible].join(' ').toLowerCase();
    if(action==='ui.guided_tour.next'){
      if(/simpler explanation/.test(visibleLower))return [visible||'Try a simpler explanation','Turn on ELI5 for this example, then see the result.'];
      if(/show me/.test(visibleLower))return [visible||'Show me','Open the example page and keep the tour beside you.'];
      if(/watch chat move/.test(visibleLower))return [visible,'Watch Chat float briefly, then return to its place.'];
      if(/moving and sizing chat/.test(visibleLower))return [visible,'Try moving Chat and giving it a little more or less room.'];
      if(/watch a card change/.test(visibleLower))return [visible,'Watch one card hide and return without stopping its work.'];
      if(/arranging a card/.test(visibleLower))return [visible,'Try changing one card’s options, place, size, and keyboard focus.'];
      if(/^next:/.test(visibleLower))return [visible,'Continue when you are ready.'];
    }
    if(action==='ui.onboarding.open_owner_flow'){
      if(/project i already have/.test(visibleLower))return [visible,'Choose where that project lives now.'];
      if(/github|elsewhere|online/.test(visibleLower))return [visible,'Bring in work that is already saved online.'];
      if(/private access/.test(visibleLower))return [visible,'Choose the simplest private way to reach this project when you are away.'];
      if(/another computer/.test(visibleLower))return [visible,'Find or connect the computer you want Puppet Master to use.'];
    }
    var exact={
      'ui.onboarding.start':['Open guided setup','Review the first-time setup choices.'],
      'ui.onboarding.next':['Continue','Go to the next setup step.'],
      'ui.onboarding.back':['Back','Return to the previous setup choice.'],
      'ui.onboarding.close':['Close setup','Leave setup and return to your workspace.'],
      'ui.onboarding.skip':['Skip for now','Continue without this optional choice.'],
      'ui.onboarding.defer':['Do this later','Save your place and return later.'],
      'ui.onboarding.open_details':['Details','Show or hide more about this step.'],
      'ui.onboarding.more_ways':['More choices','Show or hide additional choices.'],
      'ui.onboarding.choose_simple_path':['Use this starting point','Begin here; nothing changes until you review the complete setup.'],
      'ui.onboarding.open_owner_flow':['See what you need','Review this small choice before anything changes.'],
      'ui.onboarding.run_automatic_preparation':['Check my choices','Make sure the selected setup is ready.'],
      'ui.onboarding.choose_first_project':['Choose this project option','Use this choice for your first project.'],
      'ui.onboarding.finish':['Open Puppet Master','Finish setup and enter your workspace.'],
      'ui.guided_tour.start':['Start guided tour','Learn the workspace one step at a time.'],
      'ui.guided_tour.next':['Continue tour','Go to the next part of the tour.'],
      'ui.guided_tour.back':['Back','Return to the previous part of the tour.'],
      'ui.guided_tour.pause':['Pause tour','Hide the tour and keep your place.'],
      'ui.guided_tour.resume':['Resume tour','Continue from where you paused.'],
      'ui.guided_tour.skip':['Skip tour','End the tour and restore your workspace.'],
      'ui.guided_tour.replay':['Replay guided tour','Start the tour again from the beginning.'],
      'ui.guided_tour.focus_route':['Open this page','Change the page you are viewing.'],
      'ui.guided_tour.toggle_eli5':['Use simpler words','Explain the same idea with shorter words and a familiar example.'],
      'ui.guided_tour.finish':['Finish tour','End the tour and open Planning Wizard.'],
      'settings.onboarding.run_again':['Run Onboarding Again','Go through the first-time setup again.'],
      'settings.guided_tour.resume':['Resume the Guided Tour','Pick up the tour at the step where it stopped.'],
      'settings.guided_tour.replay':['Start the Guided Tour over','Begin the tour again from its first step.'],
      'reset-layout':['Reset layout','Return panels and cards to their original places.'],
      'run-onboarding':['Run Onboarding Again','Go through the first-time setup again.'],
      'navigate':['Open this page','Show this part of Puppet Master.'],
      'ui.settings.route.open':['Open Settings','Go to this Settings page.'],
      'all-settings-query':['Search Settings','Find a preference by name or description.'],
      'all-settings-filter':['Filter Settings','Show only preferences that match this choice.'],
      'clear-all-settings-filters':['Clear filters','Show all Settings preferences again.'],
      'browse-setting-path':['Find this setting','Open the section that contains this preference.'],
      'input-setting':['Change this setting','Update this preference.'],
      'run-setting-action':['Apply this setting','Make the requested Settings change.'],
      'open-structured-setting':['Open setting details','Review and change this preference.'],
      'open-resource-setting':['Open related settings','Review the preferences for this item.'],
      'page-options':['Page options','Change how this page is shown.'],
      'server-tab':['Computer settings','Show settings for connected computers.'],
      'browser-scm-tab':['Online project settings','Show settings for online project services.'],
      'project-sync-tab':['Project sharing settings','Show how this project stays up to date.']
    };
    if(exact[action])return exact[action];
    if(/reset[-_. ]?layout/.test(signal))return ['Reset layout','Return panels and cards to their original places.'];
    if(/run[-_. ]?onboarding|replay[-_. ]?onboarding/.test(signal))return ['Run Onboarding Again','Go through the first-time setup again.'];
    if(/start[-_. ]?guided[-_. ]?tour/.test(signal))return ['Start guided tour','Learn the workspace one step at a time.'];
    if(/theme/.test(signal))return ['Choose appearance','Change how Puppet Master looks.'];
    if(/settings/.test(signal)&&/add|create|new/.test(signal))return ['Add in Settings','Add another choice to this Settings section.'];
    if(/settings/.test(signal)&&/remove|delete/.test(signal))return ['Remove from Settings','Remove this choice from the Settings section.'];
    if(/settings/.test(signal)&&/edit|update|change/.test(signal))return ['Edit setting','Change this preference.'];
    if(/settings/.test(signal)&&/test|check|verify|run/.test(signal))return ['Check this setting','Make sure this choice works.'];
    if(/settings/.test(signal)&&/export|copy/.test(signal))return ['Save a copy','Save these details for later.'];
    if(/settings/.test(signal)&&/select|tab/.test(signal))return ['Open this Settings section','Show these preferences.'];
    if(/settings/.test(signal))return ['Open Settings','Change Puppet Master preferences.'];
    if(/(?:^|[-_. ])(?:navigate|open-page|page-tab)(?:$|[-_. ])/.test(signal))return ['Open this page','Show this part of Puppet Master.'];
    if(/close|dismiss/.test(signal))return ['Close','Hide this view.'];
    if(/remove|delete/.test(signal))return ['Remove','Take this item out of the current view.'];
    if(/add|create|new/.test(signal))return ['Add','Add a new item here.'];
    if(/refresh|reload|check/.test(signal))return ['Check again','Look for the latest information.'];
    if(/save|apply|confirm/.test(signal))return ['Save changes','Keep the choices you made.'];
    if(attr(el,'aria-expanded'))return ['',attr(el,'aria-expanded')==='true'?'Hide the related choices.':'Show the related choices.'];
    if(attr(el,'aria-pressed'))return ['',attr(el,'aria-pressed')==='true'?'Turn this choice off.':'Turn this choice on.'];
    if(el&&el.closest&&el.closest('#pm7GlobalStatusBar'))return ['',el.matches('button,[role="button"]')?'Click to see the details.':'Shows the latest known state.'];   /* O55 */
    if(el&&el.matches&&el.matches('[role="tab"],[data-page]'))return ['', 'Show this page.'];
    if(el&&el.matches&&el.matches('a[href]'))return ['', 'Open the linked page.'];
    if(el&&el.matches&&el.matches('input,select,textarea,[role="checkbox"],[role="radio"],[role="switch"],[role="slider"]'))return ['', 'Change this setting.'];
    return ['', 'Choose this option.'];
  }
  function looksInternal(value){return /(?:^|\s)(?:cmd|ui)\.[a-z0-9_.:-]+|\b(?:command[_ -]?id|action[_ -]?id|schema(?:[_ -]?id)?|owner[_ -]?route|runtime[_ -]?(?:handler|receipt)|fixture[_ -]?id|adapter[_ -]?id|production[_ -]?receipt|continuation[_ -]?generation|expected[_ -]?revision)\b|\bdata-[a-z0-9-]+|\b[a-z][a-z0-9-]*(?:[.:][a-z0-9_-]+)+\b|(?:^|\s)[a-z][a-z0-9-]*(?:_[a-z0-9-]+){1,}(?:\s|$)/i.test(clean(value));}
  function actionDetail(el){
    var shortcut=attr(el,'aria-keyshortcuts');if(shortcut)return 'Shortcut: '+shortcut+'.';
    return humanActionCopy(el)[1];
  }
  function descriptor(el,facts){
    facts=facts||factsFor(el)||{disabled:false,truncated:false,technical:''};
    var explicitLabel=attr(el,'data-pm-hover-label');
    var explicitDetail=attr(el,'data-pm-hover-detail');
    var legacy=attr(el,'data-hover-tip')||attr(el,'data-tooltip')||attr(el,'data-pm-hover-native-title')||attr(el,'title');
    var lines=String(legacy||'').split(/\r?\n/).map(clean).filter(Boolean);
    var structuredLabel='',structuredDetail='';
    if(el&&el.children){for(var childIndex=0;childIndex<el.children.length;childIndex++){var child=el.children[childIndex],copy=visibleText(child);if(!copy)continue;if(child.tagName==='SMALL'){if(!structuredDetail)structuredDetail=copy;}else if(!structuredLabel&&!child.matches('svg,[aria-hidden="true"]'))structuredLabel=copy;}}
    var label=explicitLabel||lines.shift()||structuredLabel||labelText(el);
    var detail=explicitDetail||lines.join(' ')||structuredDetail,actionCopy=humanActionCopy(el);
    var pin=pinState(el);
    if(pin!==null){
      var noun=/thread/i.test([label,attr(el,'data-action'),attr(el,'aria-label')].join(' '))?' thread':'';
      label=(pin?'Unpin':'Pin')+noun;
      detail=pin?'Move it back to its normal order.':'Keep it at the top.';
    }
    if(!label&&actionCopy[0])label=actionCopy[0];
    var literalTag=!!(el.closest&&el.closest('[data-pmh-tag="literal"]'));   /* O55: opt out of the internal-copy swap */
    if(!literalTag&&looksInternal(label))label=actionCopy[0]||'Choose this option';
    if(!label&&el.tagName==='INPUT')label=attr(el,'placeholder')||'Enter a value';
    var technical=facts.technical;
    if(!label){
      label=facts.status?'Current status':facts.chart?'Chart value':facts.badge?'Current state':facts.actionable?'Use this control':'More information';
    }
    if(!literalTag&&looksInternal(detail))detail=actionCopy[1]||'See what this control does.';
    var disabledReason=attr(el,'data-disabled-reason');
    if(facts.disabled&&disabledReason)detail=disabledReason;
    if(!detail&&facts.disabled)detail='This choice is not ready yet. Move over it to learn what is still needed.';
    if(!detail&&facts.truncated){var full=visibleText(el);if(full&&full!==label)detail=full;}
    if(!detail&&facts.status)detail=el.closest&&el.closest('.o55t-root')?'Shows where you are in this tour.':'Shows the latest known state.';
    if(!detail&&facts.badge)detail='A quick summary of the current state.';
    if(!detail&&facts.chart)detail='Shows the value at this point in the chart.';
    if(!detail)detail=actionDetail(el);
    if(el.tagName==='INPUT'&&String(el.type).toLowerCase()==='password')detail='Protected value; contents are not exposed.';
    return {label:clean(label).slice(0,280),detail:clean(detail).slice(0,520)};
  }
  function structuralKey(el){
    var parts=[],node=el,depth=0;
    while(node&&node.nodeType===1&&node!==document.documentElement&&depth<64){
      var identity=attr(node,'id')||attr(node,'data-pm-surface-id')||attr(node,'data-surface-id')||attr(node,'data-widget-id')||attr(node,'data-page')||attr(node,'data-panel');
      var token=node.tagName.toLowerCase();
      if(identity)token+='#'+slug(identity);
      var action=attr(node,'data-command-id')||attr(node,'data-ui-action-id')||attr(node,'data-action')||attr(node,'name')||attr(node,'role');
      if(action)token+='@'+slug(action);
      var parent=node.parentElement;
      if(parent){var peers=Array.prototype.filter.call(parent.children,function(child){return child.tagName===node.tagName;});token+=':'+String(peers.indexOf(node)+1);}
      parts.unshift(token);node=parent;depth++;
    }
    return parts.join('>')||el.tagName.toLowerCase();
  }
  function keyOwner(registry,key){
    if(!registry||!key)return null;var owner=registry.get(key)||null;
    if(owner&&!owner.isConnected){registry.delete(key);owner=null;}return owner;
  }
  function keyFor(el,registry){
    var existing=attr(el,'data-pm-hover-key'),owner=keyOwner(registry,existing);
    if(existing&&(!owner||owner===el)){registry.set(existing,el);return existing;}
    var explicit=attr(el,'data-hover-key');
    var identity=attr(el,'id')||attr(el,'data-command-id')||attr(el,'data-ui-action-id')||attr(el,'data-action')||attr(el,'name')||technicalAttribute(el)||labelText(el);
    var base='pmht:'+(explicit?'legacy:'+slug(explicit)+':':'')+slug(identity||el.tagName)+':'+hash(structuralKey(el));
    var key=base,index=2;owner=keyOwner(registry,key);
    while(owner&&owner!==el){key=base+'-'+index;index++;owner=keyOwner(registry,key);}
    registry.set(key,el);return key;
  }
  function descriptionId(key){return 'pm-hover-desc-'+hash(key);}
  function addDescriptionToken(el,id){
    var tokens=attr(el,'aria-describedby').split(/\s+/).filter(Boolean);
    if(tokens.indexOf(id)>=0)return;tokens.push(id);el.setAttribute('aria-describedby',tokens.join(' '));
  }
  function removeDescriptionToken(el,id){
    if(!id)return;
    var tokens=attr(el,'aria-describedby').split(/\s+/).filter(function(token){return token&&token!==id;});
    if(tokens.length)el.setAttribute('aria-describedby',tokens.join(' '));else el.removeAttribute('aria-describedby');
  }
  function ensureAccessibleName(el){
    if(!el||labelText(el))return;
    var exact='';
    if(attr(el,'id')==='tbSearchInput')exact='Search files, commands, and settings';
    else if(el.matches&&el.matches('.pm6-chat-headsearch input'))exact='Search this chat';
    else if(el.matches&&el.matches('.pm6-chat-input'))exact='Message the agent';
    var fallback=attr(el,'data-pm-hover-label')||attr(el,'data-tooltip')||attr(el,'data-hover-tip')||attr(el,'title')||attr(el,'placeholder');
    var name=clean(exact||fallback).split(/\r?\n/)[0];
    if(name)setAttrIfChanged(el,'aria-label',name);
  }
  function migrateNativeTitle(el){
    var title=attr(el,'title');if(!title)return;
    if(!labelText(el))setAttrIfChanged(el,'aria-label',title.split(/\r?\n/)[0]);
    setAttrIfChanged(el,'data-pm-hover-native-title',title);el.removeAttribute('title');
  }
  function bridgeDisabled(el){
    if(!isNativeDisabled(el))return;
    setAttrIfChanged(el,'data-pm-hover-was-disabled','true');setAttrIfChanged(el,'aria-disabled','true');
    el.removeAttribute('disabled');if(el.tabIndex<0)el.tabIndex=0;
  }

  function PMHoverTag(value){
    value=value||{};this.key=clean(value.key);this.primary=clean(value.primary);this.detail=clean(value.detail);
    this.description_id=clean(value.description_id);this.kinds=(value.kinds||[]).slice();this.visual_enabled=value.visual_enabled!==false;
  }
  PMHoverTag.prototype.text=function(){return this.primary+(this.detail?' '+this.detail:'');};

  function HoverTagController(){
    this.root=null;this.tag=null;this.descriptions=null;this.active=null;this.activeModel=null;
    this.pendingOpenTimer=0;this.pendingOpenTarget=null;this.pendingOpenSource=null;this.pendingPointerIntent=null;this.departureTimer=0;this.closeTimer=0;this.scanFrame=0;this.pendingScanScope=null;this.visualEnabled=true;this.observer=null;this.overlayScope=null;this.pageSettling=false;this.pageScanTimer=0;this.overlaySettling=false;this.overlayScanTimer=0;
    this.keyOwners=new Map();this.preparedByElement=new WeakMap();this.scanNodes=[];this.scanPrepareCursor=0;this.scanPhase='idle';this.scanQueue=[];this.scanCursor=0;this.scanning=false;this.scanComplete=true;this.bootstrapPass=0;this.observeAfterBootstrap=false;this.lastScan={candidates:0,bound:0,duration_ms:0,batches:0};
    this.deferredLiveScopes=new Set();this.deferredLiveTimer=0;
    this.liveShallow=new Set();this.liveDeep=new Set();this.liveQueue=[];this.liveCursor=0;this.liveFrame=0;this.liveRunning=false;this.lastLive={candidates:0,bound:0,released:0,duration_ms:0,batches:0};
    this.started=false;this.motionQuery=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;this.reduced=!!(this.motionQuery&&this.motionQuery.matches);
    this.slint_projection=Object.freeze({
      schema_id:'pm.hover_tag.slint_projection.v1',
      model:'PMHoverTag { key: string, primary: string, detail: string, description_id: string, kinds: [HoverTagKind], visual_enabled: bool }',
      anchor_geometry:'AnchorGeometry { left: logical-length, top: logical-length, width: logical-length, height: logical-length }',
      overlay_geometry:'OverlayGeometry { left: logical-length, top: logical-length, max_width: 280px, max_height: viewport - feasible margins, gap: 8px, viewport_margin: up to 8px, placement: above|below }',
      timers:{pointer_open_ms:1600,pointer_stationary_ms:1100,pointer_radius_px:5,focus_open_ms:1000,departure_grace_ms:160,overlay_settle_ms:560,standard_motion_ms:240,retro_motion_ms:140,reduced_motion_ms:0},
      inputs:['pointer hover','pointer position','pointer press','scroll','anchor geometry','keyboard focus','Escape','theme tokens','show-tooltips','reduced motion'],
      theme_tokens:['theme family','light/dark mode','surface','border','text primary','text secondary','glass tint','glass transparency'],
      portability:'typed overlay + anchor geometry + timers + focus/hover + theme tokens; no Canvas, WebGL, browser-only physics, SVG filter, or heavy CSS filter'
    });
  }
  HoverTagController.prototype.ensureRoot=function(){
    if(this.root&&this.root.isConnected)return;
    var root=document.getElementById(ROOT_ID);
    if(!root){root=document.createElement('div');root.id=ROOT_ID;root.setAttribute('data-visual-enabled','true');root.setAttribute('data-pm-hover-exempt','tooltip-owner');
      root.innerHTML='<div id="'+TAG_ID+'" class="pm-hover-tag" role="tooltip" aria-hidden="true" data-open="false" data-detail="false" data-placement="above"><strong></strong><p></p></div><div id="'+DESCRIPTIONS_ID+'" class="pm-hover-sr" aria-live="off"></div>';document.body.appendChild(root);}
    this.root=root;this.tag=root.querySelector('#'+TAG_ID);this.descriptions=root.querySelector('#'+DESCRIPTIONS_ID);
  };
  HoverTagController.prototype.prepare=function(el){
    var facts=factsFor(el);if(!isCandidate(el,facts)||attr(el,'data-pm-hover-exempt'))return null;
    return {el:el,facts:facts,info:descriptor(el,facts)};
  };
  HoverTagController.prototype.bind=function(el,prepared){
    prepared=prepared&&prepared.el===el?prepared:this.preparedByElement.get(el)||this.prepare(el);if(!prepared)return null;
    var facts=prepared.facts,info=prepared.info;
    var currentKey=attr(el,'data-pm-hover-key'),currentId=currentKey&&descriptionId(currentKey),currentDesc=currentId&&document.getElementById(currentId);
    var currentOwner=currentKey&&keyOwner(this.keyOwners,currentKey),currentKinds=facts.kinds.join(','),currentText=info.label+(info.detail?' '+info.detail:'');
    var describedBy=attr(el,'aria-describedby').split(/\s+/);
    if(currentKey&&(!currentOwner||currentOwner===el)&&attr(el,'data-pm-hover-bound')==='true'&&attr(el,'data-pm-hover-kind')===currentKinds&&
       currentDesc&&currentDesc.getAttribute('role')==='tooltip'&&currentDesc.textContent===currentText&&describedBy.indexOf(currentId)>=0&&
       !facts.native_title&&!isNativeDisabled(el)&&labelText(el)){
      this.keyOwners.set(currentKey,el);
      return new PMHoverTag({key:currentKey,primary:info.label,detail:info.detail,description_id:currentId,kinds:facts.kinds,visual_enabled:this.visualEnabled});
    }
    ensureAccessibleName(el);migrateNativeTitle(el);bridgeDisabled(el);
    var previousKey=attr(el,'data-pm-hover-key'),key=keyFor(el,this.keyOwners),id=descriptionId(key),kindList=facts.kinds;
    if(previousKey&&previousKey!==key){removeDescriptionToken(el,descriptionId(previousKey));if(this.keyOwners.get(previousKey)===el)this.keyOwners.delete(previousKey);}
    this.keyOwners.set(key,el);
    setAttrIfChanged(el,'data-pm-hover-key',key);setAttrIfChanged(el,'data-pm-hover-bound','true');setAttrIfChanged(el,'data-pm-hover-kind',kindList.join(','));
    addDescriptionToken(el,id);
    var desc=document.getElementById(id);
    if(!desc){desc=document.createElement('span');desc.id=id;desc.className='pm-hover-description';this.descriptions.appendChild(desc);}
    if(overlayAllows(el)){setAttrIfChanged(desc,'role','tooltip');desc.removeAttribute('aria-hidden');}else{setAttrIfChanged(desc,'role','presentation');setAttrIfChanged(desc,'aria-hidden','true');}
    setAttrIfChanged(desc,'data-pm-hover-description-key',key);if(desc.textContent!==currentText)desc.textContent=currentText;
    return new PMHoverTag({key:key,primary:info.label,detail:info.detail,description_id:id,kinds:kindList,visual_enabled:this.visualEnabled});
  };
  HoverTagController.prototype.release=function(el){
    if(!el||el.nodeType!==1)return false;var key=attr(el,'data-pm-hover-key'),id=key&&descriptionId(key);
    if(this.pendingOpenTarget===el)this.cancelPendingOpen();
    var owner=key&&this.keyOwners.get(key),owns=!owner||owner===el;if(id)removeDescriptionToken(el,id);if(key&&owner===el)this.keyOwners.delete(key);
    ['data-pm-hover-key','data-pm-hover-bound','data-pm-hover-kind'].forEach(function(name){if(el.hasAttribute(name))el.removeAttribute(name);});
    var desc=id&&document.getElementById(id);if(desc&&owns)desc.remove();if(this.active===el)this.close(true);return !!key;
  };
  HoverTagController.prototype.collect=function(scope){
    var root=scope&&scope.nodeType===1?scope:document,all=[];
    if(root.nodeType===1&&!inOwner(root)&&root.matches(ACTION_SELECTOR+','+SEMANTIC_SELECTOR))all.push(root);
    /* Query only the declared selector union. Candidate analysis is a separate
       read phase so binding writes cannot force one layout per element. */
    var nodes=root.querySelectorAll?root.querySelectorAll(ACTION_SELECTOR+','+SEMANTIC_SELECTOR):[];
    for(var i=0;i<nodes.length;i++)if(!inOwner(nodes[i]))all.push(nodes[i]);
    return all;
  };
  HoverTagController.prototype.scan=function(scope){
    this.ensureRoot();this.syncVisualSetting();var started=performance.now(),nodes=this.collect(scope),prepared=[],bound=0;
    for(var i=0;i<nodes.length;i++){var row=this.prepare(nodes[i]);if(row)prepared.push(row);}
    for(var j=0;j<prepared.length;j++)if(this.bind(prepared[j].el,prepared[j]))bound++;
    this.pruneKeyOwners();this.lastScan={candidates:prepared.length,bound:bound,duration_ms:performance.now()-started,batches:1};
    return this.lastScan;
  };
  function commonScanScope(a,b){
    if(!a||!b||a===document||b===document||!a.isConnected||!b.isConnected)return document;
    if(a===b||a.contains(b))return a;if(b.contains(a))return b;
    var node=a.parentElement;while(node&&!node.contains(b))node=node.parentElement;return node||document;
  }
  var censusDeadline=null;   /* O55: the census runs in idle time (motion QA, 2026-10-16) */
  function censusFrame(fn){
    if(typeof requestIdleCallback!=='function')return requestAnimationFrame(fn);
    return requestIdleCallback(function(deadline){censusDeadline=deadline;try{fn();}finally{censusDeadline=null;}},{timeout:900});
  }
  function cancelCensusFrame(id){if(!id)return;if(typeof cancelIdleCallback==='function')cancelIdleCallback(id);else cancelAnimationFrame(id);}
  function censusTime(started,ms){if(performance.now()-started>=ms)return false;return !censusDeadline||censusDeadline.didTimeout||censusDeadline.timeRemaining()>1;}
  HoverTagController.prototype.scheduleScan=function(scope){
    var self=this,next=scope&&scope.isConnected?scope:document;
    this.pendingScanScope=this.pendingScanScope?commonScanScope(this.pendingScanScope,next):next;
    this.scanComplete=false;if(this.scanFrame||this.scanning)return;
    this.scanFrame=censusFrame(function(){var pending=self.pendingScanScope||document;self.pendingScanScope=null;self.scanFrame=0;self.beginScan(pending);});
  };
  HoverTagController.prototype.pruneKeyOwners=function(){
    var self=this;this.keyOwners.forEach(function(el,key){if(el&&el.isConnected)return;self.keyOwners.delete(key);var desc=document.getElementById(descriptionId(key));if(desc)desc.remove();});
  };
  HoverTagController.prototype.beginScan=function(scope){
    if(this.liveRunning){var delayed=this;this.scanFrame=censusFrame(function(){delayed.scanFrame=0;delayed.beginScan(scope);});return;}
    this.ensureRoot();this.syncVisualSetting();this.preparedByElement=new WeakMap();
    this.scanStartedAt=performance.now();this.scanNodes=this.collect(scope);this.scanPrepareCursor=0;this.scanPhase='prepare';this.scanQueue=[];this.scanCursor=0;this.scanning=true;this.scanComplete=false;this.scanBound=0;this.scanCandidates=0;this.scanBatches=0;this.processScanBatch();
  };
  HoverTagController.prototype.processScanBatch=function(){
    if(!this.scanning)return;var self=this,started=performance.now(),limit;
    if(this.scanPhase==='prepare'){
      /* The time budget is the frame-safety authority. A 48-node hard cap
         stretched PM7's broad selector prefilter across nearly a thousand
         frames even when each candidate was cheap, leaving accessibility
         descriptions unsettled for many seconds. Keep a generous count guard
         for pathological clocks while consuming cheap rows until 3 ms. */
      limit=Math.min(this.scanNodes.length,this.scanPrepareCursor+384);
      while(this.scanPrepareCursor<limit&&censusTime(started,3)){var candidate=this.prepare(this.scanNodes[this.scanPrepareCursor++]);if(candidate){this.scanQueue.push(candidate);this.preparedByElement.set(candidate.el,candidate);}}
      this.scanBatches++;
      if(this.scanPrepareCursor<this.scanNodes.length){this.scanFrame=censusFrame(function(){self.scanFrame=0;self.processScanBatch();});return;}
      this.scanCandidates=this.scanQueue.length;this.scanNodes=[];this.scanPhase='bind';
      this.scanFrame=censusFrame(function(){self.scanFrame=0;self.processScanBatch();});return;
    }
    limit=Math.min(this.scanQueue.length,this.scanCursor+192);
    while(this.scanCursor<limit&&censusTime(started,4)){var row=this.scanQueue[this.scanCursor++];if(this.bind(row.el,row))this.scanBound++;}
    this.scanBatches++;
    if(this.scanCursor<this.scanQueue.length){this.scanFrame=censusFrame(function(){self.scanFrame=0;self.processScanBatch();});return;}
    this.scanning=false;this.scanPhase='idle';this.scanQueue=[];this.preparedByElement=new WeakMap();this.pruneKeyOwners();this.lastScan={candidates:this.scanCandidates,bound:this.scanBound,duration_ms:performance.now()-this.scanStartedAt,batches:this.scanBatches};
    if(this.pendingScanScope){var pending=this.pendingScanScope;this.pendingScanScope=null;this.scheduleScan(pending);return;}
    this.scanComplete=true;
  };
  HoverTagController.prototype.whenIdle=function(){
    var self=this;return new Promise(function(resolve){function inspect(){if(self.scanComplete&&!self.scanning&&!self.scanFrame&&!self.pendingScanScope){resolve(self.lastScan);return;}requestAnimationFrame(inspect);}inspect();});
  };
  HoverTagController.prototype.pruneLiveScopes=function(){
    var overlay=activeOverlay(),deepRemove=[],shallowRemove=[];
    if(this.liveDeep.size>24||this.liveShallow.size>256){var surface=overlay||activeSurface();this.liveDeep.clear();this.liveShallow.clear();if(surface&&surface.nodeType===1&&surface.isConnected&&!inOwner(surface))this.liveDeep.add(surface);return;}
    this.liveDeep.forEach(function(root){if(!root||!root.isConnected||inOwner(root)||(overlay&&root!==overlay&&!overlay.contains(root)))deepRemove.push(root);});
    this.liveShallow.forEach(function(node){if(!node||!node.isConnected||inOwner(node)||(overlay&&!overlay.contains(node)))shallowRemove.push(node);});
    for(var i=0;i<deepRemove.length;i++)this.liveDeep.delete(deepRemove[i]);
    for(var j=0;j<shallowRemove.length;j++)this.liveShallow.delete(shallowRemove[j]);
    /* Mutation storms must collapse to one bounded active-surface scan instead
       of retaining thousands of short-lived roots. Pointer/focus disclosure
       does not depend on these queues and continues to bind synchronously. */
    if(this.liveDeep.size>24||this.liveShallow.size>256){var boundedSurface=overlay||activeSurface();this.liveDeep.clear();this.liveShallow.clear();if(boundedSurface&&boundedSurface.nodeType===1&&boundedSurface.isConnected&&!inOwner(boundedSurface))this.liveDeep.add(boundedSurface);}
  };
  HoverTagController.prototype.enqueueLive=function(el,deep){
    if(this.pageSettling||this.overlaySettling||!el||el.nodeType!==1||!el.isConnected||inOwner(el))return;var self=this,covered=false,remove=[];
    if(!this.liveBatch||!this.liveBatchPruned){this.pruneLiveScopes();if(this.liveBatch){this.liveBatchPruned=true;this.liveBatchOverlay=activeOverlay();}}
    if(deep){
      this.liveDeep.forEach(function(root){if(root===el||root.contains(el))covered=true;else if(el.contains(root))remove.push(root);});
      if(!covered){remove.forEach(function(root){self.liveDeep.delete(root);});this.liveDeep.add(el);this.liveShallow.forEach(function(node){if(el.contains(node))self.liveShallow.delete(node);});}
    }else{
      this.liveDeep.forEach(function(root){if(root===el||root.contains(el))covered=true;});if(!covered)this.liveShallow.add(el);
    }
    if(this.liveBatch)this.pruneLiveAdded(el,deep);else this.pruneLiveScopes();
    if(!this.liveFrame&&!this.liveRunning){this.liveFrame=censusFrame(function(){self.liveFrame=0;self.beginLive();});}
  };
  HoverTagController.prototype.pruneLiveAdded=function(el,deep){
    var overlay=this.liveBatchOverlay;
    if(this.liveDeep.size>24||this.liveShallow.size>256){var surface=overlay||activeSurface();this.liveDeep.clear();this.liveShallow.clear();if(surface&&surface.nodeType===1&&surface.isConnected&&!inOwner(surface))this.liveDeep.add(surface);return;}
    if(overlay){if(deep){if(el!==overlay&&!overlay.contains(el))this.liveDeep.delete(el);}else if(!overlay.contains(el))this.liveShallow.delete(el);}
  };
  HoverTagController.prototype.deferLiveScope=function(el){
    if(this.pageSettling||this.overlaySettling||!el||el.nodeType!==1)return;var self=this,covered=false,remove=[];
    this.deferredLiveScopes.forEach(function(root){if(!root.isConnected)remove.push(root);else if(root===el||root.contains(el))covered=true;else if(el.contains(root))remove.push(root);});
    remove.forEach(function(root){self.deferredLiveScopes.delete(root);});if(!covered)this.deferredLiveScopes.add(el);
    clearTimeout(this.deferredLiveTimer);var reduced=document.documentElement.getAttribute('data-motion')==='reduced'||this.reduced;
    this.deferredLiveTimer=setTimeout(function(){self.deferredLiveTimer=0;var scopes=[...self.deferredLiveScopes];self.deferredLiveScopes.clear();scopes.forEach(function(scope){if(scope.isConnected)self.enqueueLive(scope,true);});},reduced?0:280);
  };
  HoverTagController.prototype.cleanupRemoved=function(root){
    if(!root||root.nodeType!==1)return;var self=this,nodes=[];
    if(attr(root,'data-pm-hover-bound')==='true')nodes.push(root);
    var descendants=root.querySelectorAll?root.querySelectorAll('[data-pm-hover-bound="true"]'):[];
    for(var i=0;i<descendants.length;i++)nodes.push(descendants[i]);
    nodes.forEach(function(node){self.release(node);});if(this.active&&(this.active===root||root.contains(this.active)))this.close(true);
  };
  HoverTagController.prototype.beginLive=function(){
    var self=this;if(this.pageSettling||this.overlaySettling){this.liveShallow.clear();this.liveDeep.clear();return;}if(this.scanning||this.scanFrame){this.liveFrame=censusFrame(function(){self.liveFrame=0;self.beginLive();});return;}this.pruneLiveScopes();
    var nodes=[],seen=new Set();function add(node){if(!node||node.nodeType!==1||!node.isConnected||inOwner(node)||seen.has(node))return;seen.add(node);nodes.push(node);}
    this.liveShallow.forEach(add);this.liveDeep.forEach(function(root){
      add(root);var descendants=root.querySelectorAll?root.querySelectorAll(ACTION_SELECTOR+','+SEMANTIC_SELECTOR+',[data-pm-hover-bound="true"]'):[];
      for(var i=0;i<descendants.length;i++)add(descendants[i]);
    });
    this.liveShallow.clear();this.liveDeep.clear();var queue=[];
    for(var i=0;i<nodes.length;i++)queue.push({el:nodes[i],prepared:undefined});   /* O55: prepared in the batches */
    if(!queue.length){this.lastLive={candidates:0,bound:0,released:0,duration_ms:0,batches:0};return;}
    this.liveQueue=queue;this.liveCursor=0;this.liveRunning=true;this.liveStartedAt=performance.now();this.liveBound=0;this.liveReleased=0;this.liveBatches=0;this.processLiveBatch();
  };
  HoverTagController.prototype.processLiveBatch=function(){
    if(!this.liveRunning)return;var self=this,started=performance.now(),limit=Math.min(this.liveQueue.length,this.liveCursor+72);
    while(this.liveCursor<limit&&censusTime(started,4)){var row=this.liveQueue[this.liveCursor++];
      if(row.prepared===undefined){row.prepared=row.el.isConnected?this.prepare(row.el):null;if(!row.prepared&&attr(row.el,'data-pm-hover-bound')!=='true')continue;}
      if(!row.el.isConnected||!row.prepared){if(this.release(row.el))this.liveReleased++;}else{var model=this.bind(row.el,row.prepared);if(model){this.liveBound++;if(this.active===row.el){this.activeModel=model;this.render(model);this.position();}}}}
    this.liveBatches++;
    if(this.liveCursor<this.liveQueue.length){this.liveFrame=censusFrame(function(){self.liveFrame=0;self.processLiveBatch();});return;}
    this.liveRunning=false;this.liveQueue=[];this.lastLive={candidates:this.liveCursor,bound:this.liveBound,released:this.liveReleased,duration_ms:performance.now()-this.liveStartedAt,batches:this.liveBatches};
    if(this.liveShallow.size||this.liveDeep.size)this.liveFrame=censusFrame(function(){self.liveFrame=0;self.beginLive();});
  };
  HoverTagController.prototype.refresh=function(el){
    if(!el||!el.isConnected)return null;var model=this.bind(el);
    if(this.active===el&&model){this.activeModel=model;this.render(model);this.position();}
    return model;
  };
  HoverTagController.prototype.motionMs=function(){
    if(this.reduced)return 0;return /^retro-/.test(attr(document.documentElement,'data-theme'))?140:240;
  };
  HoverTagController.prototype.render=function(model){
    if(!model)return;this.ensureRoot();
    this.tag.querySelector('strong').textContent=model.primary;this.tag.querySelector('p').textContent=model.detail;
    this.tag.setAttribute('data-detail',model.detail?'true':'false');this.tag.setAttribute('data-hover-key',model.key);
  };
  HoverTagController.prototype.overlayAllows=function(el){return overlayAllows(el);};
  function anchorGeometry(el){var rect=el&&el.getBoundingClientRect?el.getBoundingClientRect():null;return rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null;}
  function sameGeometry(a,b){return !!a&&!!b&&Math.abs(a.left-b.left)<=.5&&Math.abs(a.top-b.top)<=.5&&Math.abs(a.width-b.width)<=.5&&Math.abs(a.height-b.height)<=.5;}
  function viewportGeometry(){var visual=window.visualViewport,width=visual&&visual.width||innerWidth,height=visual&&visual.height||innerHeight;return {left:visual&&visual.offsetLeft||0,top:visual&&visual.offsetTop||0,width:Math.max(1,width),height:Math.max(1,height)};}
  function feasibleMargin(size){return Math.min(MARGIN,Math.max(0,(size-1)/2));}
  function clamp(value,minimum,maximum){return Math.max(minimum,Math.min(value,Math.max(minimum,maximum)));}
  HoverTagController.prototype.cancelPendingOpen=function(){clearTimeout(this.pendingOpenTimer);this.pendingOpenTimer=0;this.pendingOpenTarget=null;this.pendingOpenSource=null;this.pendingPointerIntent=null;};
  HoverTagController.prototype.dropStaleTargets=function(){
    if(this.pendingOpenTarget&&!this.pendingOpenTarget.isConnected)this.cancelPendingOpen();
    if(this.active&&(!this.active.isConnected||!this.overlayAllows(this.active))){this.close(true);return true;}
    return false;
  };
  HoverTagController.prototype.schedulePointerIntent=function(){
    var intent=this.pendingPointerIntent,target=this.pendingOpenTarget;if(!intent||!target||this.pendingOpenSource!=='pointer')return false;
    clearTimeout(this.pendingOpenTimer);var self=this,now=performance.now(),due=Math.max(intent.entered_at+POINTER_OPEN_MS,intent.stationary_at+POINTER_STATIONARY_MS);
    this.pendingOpenTimer=setTimeout(function(){self.finishPendingOpen(target,'pointer');},Math.max(0,due-now));return true;
  };
  HoverTagController.prototype.resetPointerStationary=function(event,geometry){
    var intent=this.pendingPointerIntent;if(!intent)return false;var now=performance.now();intent.stationary_at=now;
    if(event&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)){intent.origin_x=event.clientX;intent.origin_y=event.clientY;intent.pointer_id=event.pointerId==null?intent.pointer_id:event.pointerId;}
    intent.anchor_geometry=geometry||anchorGeometry(this.pendingOpenTarget);this.schedulePointerIntent();return true;
  };
  HoverTagController.prototype.notePointerMove=function(event,el){
    if(!event||event.buttons||!el)return false;
    if(!this.pendingOpenTarget){if(!this.active)this.open(el,'pointer',event);return true;}
    if(this.pendingOpenSource!=='pointer'||this.pendingOpenTarget!==el)return false;
    var intent=this.pendingPointerIntent,geometry=anchorGeometry(el);if(!intent)return false;
    if(!sameGeometry(intent.anchor_geometry,geometry)){this.resetPointerStationary(event,geometry);return true;}
    var dx=event.clientX-intent.origin_x,dy=event.clientY-intent.origin_y;if(dx*dx+dy*dy>POINTER_RADIUS_PX*POINTER_RADIUS_PX)this.resetPointerStationary(event,geometry);
    return true;
  };
  HoverTagController.prototype.finishPendingOpen=function(el,source){
    var target=this.pendingOpenTarget,pendingSource=this.pendingOpenSource,intent=this.pendingPointerIntent;
    if(target!==el||pendingSource!==source)return false;
    if(source==='pointer'){
      var geometry=anchorGeometry(target);if(!sameGeometry(intent&&intent.anchor_geometry,geometry)){this.resetPointerStationary(null,geometry);return false;}
    }
    this.cancelPendingOpen();
    if(!target.isConnected||!this.visualEnabled||!this.overlayAllows(target)||!isCandidate(target)||attr(target,'data-pm-hover-exempt')||attr(target,'data-pm-hover-visual-suppressed')==='true')return false;
    var stillPresent=source==='focus'?(target===document.activeElement||target.contains(document.activeElement)):false;
    if(source==='pointer')try{stillPresent=target.matches(':hover');}catch(_error){stillPresent=false;}
    if(!stillPresent)return false;
    var current=this.refresh(target)||this.bind(target);if(!current)return false;
    this.active=target;this.activeModel=current;this.render(current);this.tag.hidden=false;this.tag.setAttribute('aria-hidden','true');
    this.tag.setAttribute('data-source',source);this.position();this.tag.setAttribute('data-open','true');this.position();return true;
  };
  HoverTagController.prototype.syncOverlayState=function(){
    var overlay=activeOverlay();if(this.pendingOpenTarget&&!overlayAllows(this.pendingOpenTarget))this.cancelPendingOpen();
    if(this.active&&!overlayAllows(this.active))this.close(true);
    if(overlay===this.overlayScope)return;this.overlayScope=overlay;var self=this;
    this.keyOwners.forEach(function(el,key){var desc=document.getElementById(descriptionId(key));if(!desc)return;if(overlayAllows(el)){setAttrIfChanged(desc,'role','tooltip');desc.removeAttribute('aria-hidden');}else{setAttrIfChanged(desc,'role','presentation');setAttrIfChanged(desc,'aria-hidden','true');}});
  };
  /* O55 (DL-145): a press on an anchor holds that anchor's tag shut until the pointer leaves it. The hold names the
     element and its hover key, so an anchor re-rendered under a resting pointer stays held. */
  HoverTagController.prototype.pressHeld=function(el){
    var hold=this.pressHold;if(!hold||!el)return false;if(hold.el===el)return true;
    return !hold.el.isConnected&&!!hold.key&&attr(el,'data-pm-hover-key')===hold.key;
  };
  HoverTagController.prototype.releasePressHold=function(over){
    var hold=this.pressHold;if(!hold)return;
    var still=over&&over.nodeType===1&&(hold.el.isConnected?hold.el.contains(over):!!(hold.key&&over.closest&&over.closest('[data-pm-hover-key="'+hold.key+'"]')));
    if(!still)this.pressHold=null;
  };
  HoverTagController.prototype.open=function(el,source,event){
    this.dropStaleTargets();
    if(this.pressHeld(el)){if(this.pendingOpenTarget===el)this.cancelPendingOpen();return false;}
    if(!isCandidate(el)||attr(el,'data-pm-hover-exempt')||attr(el,'data-pm-hover-visual-suppressed')==='true'||!this.overlayAllows(el)){this.cancelPendingOpen();if(this.active&&this.active!==el)this.close(true);return false;}
    clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);this.syncVisualSetting();
    var model=this.refresh(el)||this.bind(el);if(!model)return false;
    if(!this.visualEnabled){this.cancelPendingOpen();return false;}
    source=source==='focus'?'focus':'pointer';
    if(this.active===el&&this.tag&&this.tag.getAttribute('data-open')==='true')return true;
    if(this.pendingOpenTarget===el&&this.pendingOpenSource===source)return true;
    this.cancelPendingOpen();if(this.active&&this.active!==el)this.close(false);
    var self=this,now=performance.now();this.pendingOpenTarget=el;this.pendingOpenSource=source;
    if(source==='pointer'){
      var geometry=anchorGeometry(el),x=event&&Number.isFinite(event.clientX)?event.clientX:geometry.left+geometry.width/2,y=event&&Number.isFinite(event.clientY)?event.clientY:geometry.top+geometry.height/2;
      this.pendingPointerIntent={entered_at:now,stationary_at:now,origin_x:x,origin_y:y,pointer_id:event&&event.pointerId!=null?event.pointerId:null,anchor_geometry:geometry};this.schedulePointerIntent();
    }else this.pendingOpenTimer=setTimeout(function(){self.finishPendingOpen(el,'focus');},FOCUS_OPEN_MS);
    return true;
  };
  HoverTagController.prototype.close=function(immediate){
    this.cancelPendingOpen();clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);this.active=null;this.activeModel=null;
    if(!this.tag)return;this.tag.setAttribute('data-open','false');
    if(immediate){this.closeTimer=0;this.tag.hidden=true;return;}
    var self=this,delay=this.motionMs();this.closeTimer=setTimeout(function(){if(!self.active&&self.tag)self.tag.hidden=true;},delay);
  };
  HoverTagController.prototype.depart=function(el){
    if(this.pendingOpenTarget&&(!el||this.pendingOpenTarget===el))this.cancelPendingOpen();
    var self=this;clearTimeout(this.departureTimer);this.departureTimer=setTimeout(function(){
      var el=self.active;if(!el)return;
      var focused=el===document.activeElement||el.contains(document.activeElement);
      var hovered=false;try{hovered=el.matches(':hover');}catch(_error){}
      if(!focused&&!hovered)self.close(false);
    },DEPARTURE_GRACE_MS);
  };
  var PRIMARY_CLASSES=['pm6-chat-send','pm6-wiz-send','pm-hover-avoid'];
  function avoidPrimary(active,tagRoot,left,top,rect,anchor,viewport,marginX,marginY){
    var nodes=[],boxes=[];PRIMARY_CLASSES.forEach(function(c){var l=document.getElementsByClassName(c);for(var k=0;k<l.length;k++)nodes.push(l[k]);});   /* live lists: no document-wide selector match */
    for(var i=0;i<nodes.length;i++){var n=nodes[i];if(n===active||n.contains(active)||active.contains(n))continue;var b=n.getBoundingClientRect();if(!(b.width>0&&b.height>0))continue;
      var stack=document.elementsFromPoint(b.left+b.width/2,b.top+b.height/2),front=null;
      for(var s=0;s<stack.length;s++)if(!(tagRoot&&tagRoot.contains(stack[s]))){front=stack[s];break;}
      if(front&&(front===n||n.contains(front)))boxes.push(b);}   /* only an action on screen (under the tag itself or not), not one under the composer */
    if(!boxes.length)return null;
    var PAD=6,w=rect.width,h=rect.height,minX=viewport.left+marginX,maxX=viewport.left+viewport.width-marginX-w,minY=viewport.top+marginY,maxY=viewport.top+viewport.height-marginY-h;
    function hit(l,t){for(var j=0;j<boxes.length;j++){var b=boxes[j];if(l<b.right+PAD&&l+w>b.left-PAD&&t<b.bottom+PAD&&t+h>b.top-PAD)return b;}return null;}
    if(!hit(left,top))return null;
    function slide(dir){var l=left;for(var k=0;k<boxes.length+1;k++){var b=hit(l,top);if(!b)return l;l=dir<0?b.left-PAD-w:b.right+PAD;}return NaN;}
    var other=anchor.top-h-GAP>=minY&&top>anchor.top?{top:anchor.top-h-GAP,placement:'above'}:{top:anchor.bottom+GAP,placement:'below'};
    var tries=[{left:slide(-1),top:top},{left:slide(1),top:top},{left:left,top:other.top,placement:other.placement}];
    tries=tries.filter(function(c){return c.left===c.left&&c.left>=minX-0.5&&c.left<=maxX+0.5&&c.top>=minY-0.5&&c.top<=maxY+0.5&&!hit(c.left,c.top);});
    tries.sort(function(a,b){return Math.abs(a.left-left)+Math.abs(a.top-top)-Math.abs(b.left-left)-Math.abs(b.top-top);});
    return tries.length?tries[0]:{left:left,top:top,shut:true};
  }
  HoverTagController.prototype.position=function(){
    if(this.dropStaleTargets()||!this.active||!this.tag||this.tag.hidden)return null;
    var anchor=this.active.getBoundingClientRect(),viewport=viewportGeometry(),marginX=feasibleMargin(viewport.width),marginY=feasibleMargin(viewport.height);
    var viewportRight=viewport.left+viewport.width,viewportBottom=viewport.top+viewport.height;
    this.tag.style.maxWidth=Math.min(MAX_WIDTH,Math.max(1,viewport.width-marginX*2))+'px';
    var availableHeight=Math.max(1,viewport.height-marginY*2);this.tag.style.minHeight=Math.min(24,availableHeight)+'px';this.tag.style.maxHeight=availableHeight+'px';
    this.tag.toggleAttribute('data-literal',!!(this.active.closest&&this.active.closest('[data-pmh-tag="literal"]')));   /* O55: before the measure */
    var rect=this.tag.getBoundingClientRect(),left=anchor.left+anchor.width/2-rect.width/2;
    left=clamp(left,viewport.left+marginX,viewportRight-marginX-rect.width);
    var top=anchor.top-rect.height-GAP,placement='above';
    if(top<viewport.top+marginY){top=anchor.bottom+GAP;placement='below';}
    if(document.documentElement.matches('[data-o55-nier-parts~="intel"]')&&anchor.bottom+GAP+rect.height<=viewportBottom-marginY){top=anchor.bottom+GAP;placement='below';}   /* O55 NieR intel: below first */
    /* A tag inside a teaching card must explain the control without covering
       the lesson. Prefer a free edge outside the active modal/callout; only
       fall back to ordinary anchor placement when the viewport has no such
       region. */
    var teachingPanel=this.active.closest&&this.active.closest('.o55t-callout,.o55-win');
    if(teachingPanel){var panel=teachingPanel.getBoundingClientRect(),outside=[
      {placement:'panel-right',left:panel.right+GAP,top:anchor.top+anchor.height/2-rect.height/2},
      {placement:'panel-left',left:panel.left-GAP-rect.width,top:anchor.top+anchor.height/2-rect.height/2},
      {placement:'panel-below',left:anchor.left+anchor.width/2-rect.width/2,top:panel.bottom+GAP},
      {placement:'panel-above',left:anchor.left+anchor.width/2-rect.width/2,top:panel.top-GAP-rect.height}
    ].filter(function(row){return row.left>=viewport.left+marginX&&row.top>=viewport.top+marginY&&row.left+rect.width<=viewportRight-marginX&&row.top+rect.height<=viewportBottom-marginY;});if(outside.length){outside.sort(function(a,b){var ah=Math.abs(a.left-(anchor.left+anchor.width/2))+Math.abs(a.top-(anchor.top+anchor.height/2)),bh=Math.abs(b.left-(anchor.left+anchor.width/2))+Math.abs(b.top-(anchor.top+anchor.height/2));return ah-bh;});left=outside[0].left;top=outside[0].top;placement=outside[0].placement;}}
    left=clamp(left,viewport.left+marginX,viewportRight-marginX-rect.width);
    top=clamp(top,viewport.top+marginY,viewportBottom-marginY-rect.height);
    var avoided=avoidPrimary(this.active,this.root||this.tag,left,top,rect,anchor,viewport,marginX,marginY);   /* O55: never over Send */
    if(avoided){left=avoided.left;top=avoided.top;if(avoided.placement)placement=avoided.placement;}
    this.tag.style.visibility=avoided&&avoided.shut?'hidden':'';
    this.tag.style.left=Math.round(left)+'px';this.tag.style.top=Math.round(top)+'px';this.tag.setAttribute('data-placement',placement);
    return {left:left,top:top,width:rect.width,height:rect.height,placement:placement,gap:GAP,margin_x:marginX,margin_y:marginY};
  };
  HoverTagController.prototype.readVisualSetting=function(){   /* O55: kept until a Settings write */
    var tome=window.PM7_SETTINGS_TOME,api=window.PM12_KIMI,self=this;
    if(this.visualCacheOk&&this.visualCacheApi===api)return this.visualCache;
    if(tome&&!tome.__pmhTagWatch){['save','load','reset','applyPaint'].forEach(function(name){var f=tome[name];if(typeof f==='function')tome[name]=function(){self.visualCacheOk=false;try{return f.apply(this,arguments);}finally{self.visualCacheOk=false;}};});try{Object.defineProperty(tome,'__pmhTagWatch',{value:true});}catch(_error){}}
    var value=this.readVisualSettingNow();
    this.visualCacheOk=!!(api&&tome&&tome.__pmhTagWatch);this.visualCacheApi=api;this.visualCache=value;return value;
  };
  HoverTagController.prototype.readVisualSettingNow=function(){
    try{
      var api=window.PM12_KIMI,state=api&&typeof api.getState==='function'?api.getState():null;
      if(state&&state.settings&&Object.prototype.hasOwnProperty.call(state.settings,'general.interaction.show-tooltips'))return state.settings['general.interaction.show-tooltips']!==false;
      var cats=window.PM12_REFERENCE&&window.PM12_REFERENCE.byCat;
      if(cats)for(var key in cats){var rows=cats[key]&&cats[key].settings||[];for(var i=0;i<rows.length;i++)if(rows[i].id==='general.interaction.show-tooltips')return rows[i].value!==false;}
    }catch(_error){}
    return true;
  };
  HoverTagController.prototype.syncVisualSetting=function(){return this.setVisualEnabled(this.readVisualSetting());};
  HoverTagController.prototype.setVisualEnabled=function(value){
    this.ensureRoot();this.visualEnabled=value!==false;setAttrIfChanged(this.root,'data-visual-enabled',String(this.visualEnabled));   /* O55: write only a change */
    if(!this.visualEnabled){this.cancelPendingOpen();this.active=null;this.activeModel=null;clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);if(this.tag){setAttrIfChanged(this.tag,'data-open','false');if(!this.tag.hidden)this.tag.hidden=true;}}
    return this.visualEnabled;
  };
  HoverTagController.prototype.pauseBackgroundCensus=function(){
    cancelCensusFrame(this.scanFrame);cancelCensusFrame(this.liveFrame);this.scanFrame=0;this.liveFrame=0;
    clearTimeout(this.deferredLiveTimer);this.deferredLiveTimer=0;this.deferredLiveScopes.clear();
    this.pendingScanScope=null;this.scanNodes=[];this.scanPrepareCursor=0;this.scanPhase='idle';this.scanQueue=[];this.scanCursor=0;
    this.liveQueue=[];this.liveCursor=0;this.liveShallow.clear();this.liveDeep.clear();this.scanning=false;this.liveRunning=false;this.scanComplete=true;
  };
  HoverTagController.prototype.settleOverlayTransition=function(changedRoot){
    clearTimeout(this.overlayScanTimer);this.overlayScanTimer=0;clearTimeout(this.pageScanTimer);this.pageScanTimer=0;this.pageSettling=false;this.overlaySettling=true;
    this.pauseBackgroundCensus();this.syncOverlayState();
    var self=this,reduced=document.documentElement.getAttribute('data-motion')==='reduced'||this.reduced;
    this.overlayScanTimer=setTimeout(function(){self.overlayScanTimer=0;self.overlaySettling=false;var overlay=activeOverlay();self.scheduleScan(overlay||activeSurface());},reduced?0:OVERLAY_SETTLE_MS);
    return changedRoot||activeOverlay();
  };
  HoverTagController.prototype.observe=function(){
    var self=this;if(this.observer)this.observer.disconnect();
    this.observer=new MutationObserver(function(records){
      /* Opening either product-owned modal can construct and animate hundreds
         of descendants in one turn. Recognize that boundary before consuming
         any child-list record, cancel stale page/live work, update modal
         accessibility exactly once, and census only the settled surface. */
      var changedOverlay=null;for(var oi=0;oi<records.length&&!changedOverlay;oi++)changedOverlay=overlayTransitionRoot(records[oi]);
      if(changedOverlay){self.settleOverlayTransition(changedOverlay);return;}
      /* Page switches and an in-flight modal transition change hundreds of
         layout/state attributes together. Pointer and focus still bind a
         requested target synchronously. */
      if(self.pageSettling||self.overlaySettling)return;
      self.liveBatch=true;self.liveBatchPruned=false;try{
      for(var i=0;i<records.length;i++){
        var record=records[i];
        if(record.target&&record.target.nodeType===1&&inOwner(record.target))continue;
        /* Several retained shell fitters truthfully reassert the same ARIA/tab
           value while reconciling geometry. MutationObserver still reports
           those writes. Treat exact old/current equality as the semantic no-op
           it is, while preserving every real add/remove/change notification. */
        if(record.type==='attributes'&&record.target&&record.target.nodeType===1&&record.oldValue===record.target.getAttribute(record.attributeName))continue;
        /* Dynamic components sometimes restore a native title after their
           initial render. Migrate it in this observer microtask so the
           browser-native tooltip never becomes the user-facing path. */
        if(record.type==='attributes'&&record.attributeName==='title'&&record.target&&record.target.nodeType===1){if(mutationSurfaceAllows(record.target))self.bind(record.target);continue;}
        if(record.type==='attributes'&&record.target&&record.target.nodeType===1){
          if(record.target===document.documentElement&&record.attributeName==='data-theme'){self.position();continue;}
          if(mutationSurfaceAllows(record.target))self.enqueueLive(record.target,false);continue;
        }
        if(record.type==='characterData'){
          var parent=record.target&&record.target.parentElement,bound=parent&&parent.closest&&parent.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);
          if(bound&&mutationSurfaceAllows(bound))self.enqueueLive(bound,false);continue;
        }
        if(record.type==='childList'){
          var target=record.target&&record.target.nodeType===1?record.target:null,targetBound=target&&target.closest&&target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);
          if(targetBound&&!inOwner(targetBound)&&mutationSurfaceAllows(targetBound))self.enqueueLive(targetBound,false);
          var settingsSwap=target&&target.closest&&target.closest('#panel-settings .manager-tab-body.tab-swap-a,#panel-settings .manager-tab-body.tab-swap-b');
          for(var j=0;j<record.addedNodes.length;j++)if(record.addedNodes[j].nodeType===1&&!inOwner(record.addedNodes[j])&&mutationSurfaceAllows(record.addedNodes[j])){
            var added=record.addedNodes[j],providerSwap=!settingsSwap&&added.matches&&added.matches('#panel-settings .resource-detail,.resource-detail')&&added.querySelector&&added.querySelector('.tab-swap-a,.tab-swap-b');
            if(settingsSwap||providerSwap)self.deferLiveScope(added);else self.enqueueLive(added,true);
          }
          for(var k=0;k<record.removedNodes.length;k++)if(record.removedNodes[k].nodeType===1)self.cleanupRemoved(record.removedNodes[k]);
        }
      }
      }finally{self.liveBatch=false;self.liveBatchOverlay=null;}
      self.syncOverlayState();
    });
    this.observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:[
      'title','class','role','tabindex','href','disabled','hidden','aria-disabled','aria-label','aria-pressed','aria-selected',
      'data-action','data-command-id','data-ui-action-id','data-hover-tip','data-tooltip','data-hover-key','data-status','data-truncated',
      'data-technical-id','data-chart-mark','data-value','data-pinned','data-pm-hover-label','data-pm-hover-detail','data-pm-hover-exempt','data-theme','data-open'
    ]});return true;
  };
  HoverTagController.prototype.disconnect=function(){if(this.observer)this.observer.disconnect();this.cancelPendingOpen();clearTimeout(this.pageScanTimer);clearTimeout(this.overlayScanTimer);this.pageScanTimer=0;this.overlayScanTimer=0;this.pageSettling=false;this.overlaySettling=false;this.pauseBackgroundCensus();};
  HoverTagController.prototype.settle=function(scope){
    var self=this;this.scheduleScan(scope);return this.whenIdle().then(function(){return new Promise(function(resolve){requestAnimationFrame(function(){self.scan(scope);resolve(self.audit(scope));});});});
  };
  HoverTagController.prototype.audit=function(scope){
    this.ensureRoot();var nodes=this.collect(scope),failures=[],keys={},descriptions={},counts={candidates:nodes.length,bound:0,exemptions:0,actionable:0,truncated:0,technical_identifiers:0,statuses:0,badges:0,chart_marks:0,disabled:0};
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i],kindList=kinds(el),exemption=attr(el,'data-pm-hover-exempt'),key=attr(el,'data-pm-hover-key');
      if(kindList.indexOf('actionable')>=0)counts.actionable++;if(kindList.indexOf('truncated')>=0)counts.truncated++;if(kindList.indexOf('technical-identifier')>=0)counts.technical_identifiers++;
      if(kindList.indexOf('status')>=0)counts.statuses++;if(kindList.indexOf('badge')>=0)counts.badges++;if(kindList.indexOf('chart-mark')>=0)counts.chart_marks++;if(isDisabled(el))counts.disabled++;
      if(exemption){counts.exemptions++;if(!EXEMPTIONS[exemption])failures.push({code:'undocumented_exemption',key:key||null,reason:exemption});if(isActionable(el))failures.push({code:'actionable_exemption',key:key||null,reason:exemption});continue;}
      if(key)(keys[key]||(keys[key]=[])).push(el);
      if(attr(el,'title'))failures.push({code:'native_title_only',key:key||null,title:attr(el,'title')});
      if(attr(el,'data-pm-hover-bound')!=='true'||!key){failures.push({code:'missing_binding',key:key||null,element:el.tagName.toLowerCase()});continue;}
      counts.bound++;
      var id=descriptionId(key),desc=document.getElementById(id),expected=descriptor(el),text=expected.label+(expected.detail?' '+expected.detail:'');
      var expectedRole=overlayAllows(el)?'tooltip':'presentation';
      if(!desc||desc.getAttribute('role')!==expectedRole||attr(el,'aria-describedby').split(/\s+/).indexOf(id)<0)failures.push({code:'missing_accessible_description',key:key,description_id:id});
      else {if(desc.textContent!==text)failures.push({code:'stale_text',key:key,expected:text,actual:desc.textContent});(descriptions[id]||(descriptions[id]=[])).push(key);}
      if(isDisabled(el)&&(el.tabIndex<0||attr(el,'aria-disabled')!=='true'))failures.push({code:'inaccessible_disabled_control',key:key,tab_index:el.tabIndex});
    }
    Object.keys(keys).forEach(function(key){if(keys[key].length>1)failures.push({code:'duplicate_key',key:key,count:keys[key].length});});
    Object.keys(descriptions).forEach(function(id){var unique=Array.from(new Set(descriptions[id]));if(unique.length>1)failures.push({code:'duplicate_description_id',description_id:id,keys:unique});});
    if(this.active&&this.tag&&!this.tag.hidden&&this.visualEnabled){var r=this.tag.getBoundingClientRect(),viewport=viewportGeometry(),marginX=feasibleMargin(viewport.width),marginY=feasibleMargin(viewport.height),right=viewport.left+viewport.width,bottom=viewport.top+viewport.height;if(r.left<viewport.left+marginX-.5||r.top<viewport.top+marginY-.5||r.right>right-marginX+.5||r.bottom>bottom-marginY+.5)failures.push({code:'clipping',rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},viewport:viewport,margin_x:marginX,margin_y:marginY});}
    return {schema_id:'pm.hover_tag.census.v1',pass:failures.length===0,counts:counts,failures:failures,exemption_registry:EXEMPTIONS,slint_projection:this.slint_projection};
  };
  HoverTagController.prototype.start=function(){
    if(this.started)return this;this.started=true;this.ensureRoot();var self=this;
    if(this.motionQuery){var motionChanged=function(event){self.reduced=!!event.matches;if(self.reduced&&self.tag)self.tag.style.transition='none';else if(self.tag)self.tag.style.transition='';};if(this.motionQuery.addEventListener)this.motionQuery.addEventListener('change',motionChanged);else if(this.motionQuery.addListener)this.motionQuery.addListener(motionChanged);}
    var pointerAsk=null;   /* O55: opened after layout (B5) */
    /* O55 (DL-145, DL-228): a press closes its anchor's tag and holds it shut until the pointer leaves that anchor;
       only focus the person moves with Tab or the arrows opens a focus tag, so the focus a press gives a control, and
       focus the application moves (an open, a reveal, a panel focus change, F6), open none. */
    var navKeyAt=-1e9,NAV_KEY_MS=1000;
    document.addEventListener('pointerover',function(event){self.releasePressHold(event.target);var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(!el||inOwner(el))return;
      if(typeof window.PM_AFTER_LAYOUT!=='function'){self.open(el,'pointer',event);return;}
      var first=!pointerAsk;pointerAsk={el:el,event:event};
      if(first)window.PM_AFTER_LAYOUT(function(){var a=pointerAsk;pointerAsk=null;if(a&&a.el.isConnected&&a.el.matches(':hover'))self.open(a.el,'pointer',a.event);});},true);
    document.addEventListener('pointermove',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(el&&!inOwner(el))self.notePointerMove(event,el);},true);
    document.addEventListener('pointerout',function(event){if(!event.relatedTarget)self.releasePressHold(null);var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"]');if(el&&(!event.relatedTarget||!el.contains(event.relatedTarget)))self.depart(el);},true);
    document.addEventListener('pointerdown',function(event){
      navKeyAt=-1e9;var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);
      self.pressHold=el&&!inOwner(el)?{el:el,key:attr(el,'data-pm-hover-key')}:null;
      if(self.pendingOpenTarget)self.cancelPendingOpen();
      if(self.active&&self.tag&&(self.tag.getAttribute('data-source')==='pointer'||self.pressHeld(self.active)))self.close(true);
    },true);
    document.addEventListener('focusin',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(!el||inOwner(el))return;
      if(performance.now()-navKeyAt<NAV_KEY_MS)self.open(el,'focus');else if(self.pendingOpenSource==='focus')self.cancelPendingOpen();},true);
    document.addEventListener('focusout',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"]');if(el&&(!event.relatedTarget||!el.contains(event.relatedTarget)))self.depart(el);},true);
    document.addEventListener('keydown',function(event){
      navKeyAt=(event.key==='Tab'||/^Arrow(Up|Down|Left|Right)$/.test(event.key))&&!event.ctrlKey&&!event.metaKey&&!event.altKey?performance.now():-1e9;
      if(event.key==='Escape'&&(self.active||self.pendingOpenTarget)){self.close(true);return;}
      var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-was-disabled="true"]');
      if(el&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    BLOCKED_EVENTS.forEach(function(type){document.addEventListener(type,function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-was-disabled="true"]');if(el){event.preventDefault();event.stopImmediatePropagation();}},true);});
    var viewportChanged=function(){if(self.pendingOpenSource==='pointer')self.resetPointerStationary(null,anchorGeometry(self.pendingOpenTarget));self.position();};
    window.addEventListener('resize',viewportChanged);if(window.visualViewport){window.visualViewport.addEventListener('resize',viewportChanged);window.visualViewport.addEventListener('scroll',viewportChanged);}
    /* O55: only a scroll that moves the anchor (the page, or a scroller holding it) cancels or closes a pointer tag; a
       live transcript that follows its own stream elsewhere left every pending tag in the window unopened */
    var scrollMoves=function(scroller,el){return !!el&&(!scroller||scroller.nodeType!==1||scroller===document.documentElement||scroller===document.body||scroller.contains(el));};
    window.addEventListener('scroll',function(event){var scroller=event.target;if(self.pendingOpenSource==='pointer'&&scrollMoves(scroller,self.pendingOpenTarget))self.cancelPendingOpen();if(self.active&&self.tag&&self.tag.getAttribute('data-source')==='pointer'&&scrollMoves(scroller,self.active))self.close(true);else self.position();},true);
    document.addEventListener('input',function(event){self.syncVisualSetting();if(event.target&&event.target.nodeType===1)self.enqueueLive(event.target,false);},true);document.addEventListener('change',function(event){self.syncVisualSetting();if(event.target&&event.target.nodeType===1)self.enqueueLive(event.target,false);},true);
    var pageChanged=function(payload){
      if(self.overlaySettling)return;
      clearTimeout(self.pageScanTimer);self.pageSettling=true;self.pauseBackgroundCensus();self.syncOverlayState();
      var reduced=document.documentElement.getAttribute('data-motion')==='reduced'||self.reduced;
      self.pageScanTimer=setTimeout(function(){self.pageScanTimer=0;self.pageSettling=false;self.scheduleScan(activeSurface(payload));},reduced?0:380);
    };
    try{if(window.PM_DEMO&&typeof window.PM_DEMO.on==='function')window.PM_DEMO.on('page.changed',pageChanged);}catch(_error){}
    document.addEventListener('page.changed',pageChanged);
    /* Arm observation before collecting the one startup snapshot. Dynamic
       controls can be inserted in the several frame-bounded census batches;
       deferring the observer until the end created a real blind window. The
       generated attributes are either outside the filter or idempotent, and
       owner-root writes are ignored, so this does not create a second scan. */
    this.observe();this.scheduleScan(activeSurface());return this;
  };

  var controller=new HoverTagController();
  window.PMHoverTag=PMHoverTag;window.HoverTagController=HoverTagController;window.PM_HOVER_TAG_CONTROLLER=controller;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){controller.start();},{once:true});else controller.start();
})();
