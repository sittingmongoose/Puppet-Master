  const recipes = [
    { name:'PM7 Refined', desc:'A restrained PMConcept7 evolution with the Reference Morph and wide prose transcript.', choices:[0,0,0,0,0,0,0] },
    { name:'Orbit Studio', desc:'Playful spatial work, icon-orbit activity, preview history, and morphing questions.', choices:[1,5,1,6,2,1,1] },
    { name:'Technical Workbench', desc:'Dense engineering controls, step-stack work, ledger detail, and technical transcript.', choices:[2,3,2,3,5,6,5] },
    { name:'Calm Reading', desc:'Prose-led shell, minimal history, calm work stage, and low-distraction decision cards.', choices:[4,6,7,7,0,4,0] },
    { name:'Agent Operations', desc:'Visible child-agent lanes, agent board detail, worktree history, and evidence decisions.', choices:[5,2,6,4,4,5,7] },
    { name:'Progressive Receipt', desc:'Work metrics assemble in place, dashboard details, editorial transcript, and queue decisions.', choices:[3,1,4,1,7,3,6] },
    { name:'Ribbon Command', desc:'Tool-ribbon work, command-strip activity, status rail, and compact decision stepper.', choices:[6,7,3,2,6,7,4] },
    { name:'Creative Stage', desc:'Layered composer, workbench animation, grouped history, split detail, and anchored questions.', choices:[7,4,5,5,3,2,2] }
  ];

  const themes = [
    { id:'basic-dark', name:'Basic Dark' }, { id:'basic-light', name:'Basic Light' },
    { id:'friendly-dark', name:'Friendly Dark' }, { id:'friendly-light', name:'Friendly Light' },
    { id:'glass-dark', name:'Glass Dark' }, { id:'glass-light', name:'Glass Light' },
    { id:'retro-dark', name:'Retro Dark' }, { id:'retro-light', name:'Retro Light' }
  ];


  /* The one list of working-animation takes. app.js derives the Demo Studio
     option names from this, and the feature manifest reports its length, so
     adding a take here is the only edit needed to surface it everywhere. */
  const workingTakes = [
    'Reference Morph','Orbit','Step Stack','Tool Ribbon',
    'Progressive Receipt','Workbench','Agent Stage','Calm Stage',
    'Step Rail','Word Stream','Tool Collapse','Diff Tape',
    'Signal Meter','Blueprint','Timeline Scrub','Terminal Cast',
    'Loom','Pulse Grid','Ledger','Constellation',
    'Metronome','Filmstrip','Sonar','Circuit'
  ];


  /* The one list of transcript takes. Options 0-7 are the original set;
     8-15 are drawn from a survey of open-source AI chat clients. */
  const transcriptTakes = [
    'Wide Prose','Assistant Cards','Speaker Grid','Journal Stream',
    'Editorial Reading','Layered Technical','Terminal Dense','Stage Layout',
    'Aligned Bubbles','Zebra Rows','Sticky Rail','Timeline Gutter',
    'Notebook Cells','Focus Reader','Print Sheet','Threaded Turns'
  ];
