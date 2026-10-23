"""Hosted Ask Card: the composer observer shares the animation's float-only dock.

Read dock geometry as one batch before writing any stage variables; changing
--decision-h on the stage every morph frame would invalidate the transcript.
"""

HOSTED_JS_PATCHES = [
    (
        'app.js',
        """  function syncChatDock(){
    const stage=document.querySelector('.chat-stage');
    if(!stage) return;
    const composer=stage.querySelector('.composer');
    const dock=composer?composer.getBoundingClientRect().height:0;
    setStageVar(stage, '--chat-dock-h', dock);
    const float=stage.querySelector('.chat-float');
    setStageVar(stage, '--thread-float-h', float ? float.offsetHeight : 0);
    const host=stage.querySelector('.decision-host');
    const decisionH=(host && !host.classList.contains('empty') && host.offsetHeight)?host.getBoundingClientRect().height:0;
    setStageVar(stage, '--decision-h', decisionH);
    const strip=stage.querySelector('.lens-inline');
    // The grid already reserves the lens height. No scroll-away padding proxy.
    setStageVar(stage, '--lens-strip-h', 0);
    if(strip) observeLensStrip(strip);
    else if(lensStripObserved&&composerRO){ composerRO.unobserve(lensStripObserved); lensStripObserved=null; }
  }
""",
        """  function syncChatDock(){
    const stage=document.getElementById('pmRoot').querySelector('.chat-stage');
    if(!stage) return;
    const composer=stage.querySelector('.composer');
    const float=stage.querySelector('.chat-float');
    const host=stage.querySelector('.decision-host');
    const shell=host&&host.querySelector('.qs-shell');
    const strip=stage.querySelector('.lens-inline');
    /* Finish every size read before publishing any inherited property. The
       composer observer also runs during an Ask Card morph, so it must use
       the same float-only dock route as questions.js's animation tracker. */
    const dock=composer?composer.getBoundingClientRect().height:0;
    const floatH=float?float.offsetHeight:0;
    const decisionH=(host&&!host.classList.contains('empty')&&host.offsetHeight)?host.getBoundingClientRect().height:0;
    const morph=!!(shell&&(shell.__qsOpening||shell.__qsClosing||shell.__qsSpringing));
    setStageVar(stage, '--chat-dock-h', dock);
    setStageVar(stage, '--thread-float-h', floatH);
    window.PM56_DOCK_H(stage, Math.max(0, Math.round(decisionH))+'px', morph);
    setStageVar(stage, '--lens-strip-h', 0);
    if(strip) observeLensStrip(strip);
    else if(lensStripObserved&&composerRO){ composerRO.unobserve(lensStripObserved); lensStripObserved=null; }
  }
""",
        1,
    ),
]
