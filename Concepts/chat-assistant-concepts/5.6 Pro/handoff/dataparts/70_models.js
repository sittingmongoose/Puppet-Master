
  /* =====================================================================
     models[] -- 6 -> 14 across 9 accounts and the same 5 configured
     providers. No unconfigured provider is added: what this fixture adds
     is ACCOUNTS and STATES.

     Two structural facts the old fixture made unreachable:
       * one provider = one account, so multi-account routing could not be
         demonstrated at all. Anthropic now has three accounts, Alibaba
         two and z.ai two, and `sonnet46` / `sonnet46-personal` are the
         SAME MODEL on two different accounts -- which is why a row is
         keyed on provider+account and never on the model name.
       * all six models were `ready`, which made the "two configured
         accounts need attention" receipt fiction. Five accounts now
         genuinely need attention, and the receipt says five.

     `status` covers the whole enum: ready, api-key-required,
     sign-in-required, cli-not-found, update-available, quota-exhausted,
     expired. `statusDetail` is the truthful reason -- the sanctioned
     honest-gap pattern is a disabled row WITH a reason, never a toast
     that lies.
     ===================================================================== */
  const accounts = [
    { id:'anthropic-work',    provider:'Anthropic', label:'Work',         connection:'anthropic-work',    plan:'Team',        addedAt:at(-40320), default:true },
    { id:'anthropic-me',      provider:'Anthropic', label:'Personal',     connection:'anthropic-me',      plan:'Pro',         addedAt:at(-20160), default:false },
    { id:'anthropic-archive', provider:'Anthropic', label:'Archive',      connection:'anthropic-archive', plan:'Pro',         addedAt:at(-86400), default:false },
    { id:'qwen-coder',        provider:'Alibaba',   label:'Coding Plan',  connection:'qwen-coder',        plan:'Coder',       addedAt:at(-15120), default:true },
    { id:'qwen-team',         provider:'Alibaba',   label:'Team',         connection:'qwen-team',         plan:'Team',        addedAt:at(-2880),  default:false },
    { id:'kimi-main',         provider:'Moonshot',  label:'Kimi Coding',  connection:'kimi-main',         plan:'Coding',      addedAt:at(-10080), default:true },
    { id:'zai-primary',       provider:'z.ai',      label:'Primary',      connection:'zai-primary',       plan:'Pro',         addedAt:at(-7200),  default:true },
    { id:'zai-research',      provider:'z.ai',      label:'Research',     connection:'zai-research',      plan:'Research',    addedAt:at(-1440),  default:false },
    { id:'cursor-pro',        provider:'Cursor',    label:'Pro',          connection:'cursor-pro',        plan:'Pro seat',    addedAt:at(-5760),  default:true }
  ];

  const model = (o) => ({
    favorite:false, fast:false, statusDetail:null, ...o,
    statusLabel: labels.modelStatus[o.status],
    /* update-available is informational: the route still works. */
    needsAttention: o.status !== 'ready' && o.status !== 'update-available'
  });

  const models = [
    /* Anthropic -- three accounts, and Sonnet 4.6 on two of them. */
    model({ id:'sonnet46', name:'Claude Sonnet 4.6', provider:'Anthropic', accountId:'anthropic-work', account:'Work · anthropic-work',
      favorite:true, fast:true, efforts:['Low','Medium','High','Max'], context:131000, status:'ready' }),
    model({ id:'sonnet46-personal', name:'Claude Sonnet 4.6', provider:'Anthropic', accountId:'anthropic-me', account:'Personal · anthropic-me',
      favorite:false, fast:true, efforts:['Low','Medium','High','Max'], context:131000, status:'ready',
      statusDetail:'The same model as the Work route. Billing, rate limits and cache are per account, so the two are not interchangeable.' }),
    model({ id:'opus5', name:'Claude Opus 5', provider:'Anthropic', accountId:'anthropic-work', account:'Work · anthropic-work',
      favorite:true, fast:false, efforts:['Medium','High','Max'], context:196000, status:'ready' }),
    model({ id:'opus5-personal', name:'Claude Opus 5', provider:'Anthropic', accountId:'anthropic-me', account:'Personal · anthropic-me',
      favorite:false, fast:false, efforts:['Medium','High','Max'], context:196000, status:'quota-exhausted',
      statusDetail:'The five-hour window for this account is spent. It resets at 18:00 UTC; the Work account is unaffected.' }),
    model({ id:'haiku46', name:'Claude Haiku 4.6', provider:'Anthropic', accountId:'anthropic-work', account:'Work · anthropic-work',
      favorite:false, fast:true, efforts:['Low','Medium'], context:131000, status:'ready' }),
    model({ id:'sonnet45-archive', name:'Claude Sonnet 4.5', provider:'Anthropic', accountId:'anthropic-archive', account:'Archive · anthropic-archive',
      favorite:false, fast:false, efforts:['Low','Medium','High'], context:131000, status:'expired',
      statusDetail:'The stored credential for this account expired 3 days ago. Re-authenticate in Provider Settings; nothing is lost.' }),

    /* Alibaba -- two accounts, and Qwen 3.8 on both. */
    model({ id:'qwen38', name:'Qwen 3.8', provider:'Alibaba', accountId:'qwen-coder', account:'Coding Plan · qwen-coder',
      favorite:true, fast:true, efforts:['Low','Medium','High'], context:262000, status:'ready' }),
    model({ id:'qwen38-team', name:'Qwen 3.8', provider:'Alibaba', accountId:'qwen-team', account:'Team · qwen-team',
      favorite:false, fast:true, efforts:['Low','Medium','High'], context:262000, status:'api-key-required',
      statusDetail:'This account was added without a key. Paste one in Provider Settings; the Coding Plan account keeps working meanwhile.' }),
    model({ id:'qwen38-coder', name:'Qwen 3.8 Coder', provider:'Alibaba', accountId:'qwen-coder', account:'Coding Plan · qwen-coder',
      favorite:false, fast:false, efforts:['Medium','High'], context:262000, status:'ready' }),

    /* Moonshot -- one account, two models. */
    model({ id:'kimi-k3', name:'Kimi K3', provider:'Moonshot', accountId:'kimi-main', account:'Kimi Coding · kimi-main',
      favorite:false, fast:true, efforts:['Low','Medium','High'], context:200000, status:'ready' }),
    model({ id:'kimi-k3-turbo', name:'Kimi K3 Turbo', provider:'Moonshot', accountId:'kimi-main', account:'Kimi Coding · kimi-main',
      favorite:false, fast:true, efforts:['Low','Medium'], context:200000, status:'update-available',
      statusDetail:'A newer build is published. The current one still routes normally, so this is informational, not a block.' }),

    /* z.ai -- two accounts. */
    model({ id:'glm52', name:'GLM 5.2', provider:'z.ai', accountId:'zai-primary', account:'Primary · zai-primary',
      favorite:false, fast:false, efforts:['Low','Medium','High'], context:128000, status:'ready' }),
    model({ id:'glm52-air', name:'GLM 5.2 Air', provider:'z.ai', accountId:'zai-research', account:'Research · zai-research',
      favorite:false, fast:true, efforts:['Low','Medium'], context:128000, status:'sign-in-required',
      statusDetail:'The Research account signs in through the browser and the session has lapsed. Sign in again to use it.' }),

    /* Cursor -- one account, and the CLI is genuinely missing. */
    model({ id:'cursor-auto', name:'Cursor Auto', provider:'Cursor', accountId:'cursor-pro', account:'Pro · cursor-pro',
      favorite:false, fast:false, efforts:['Automatic'], context:120000, status:'cli-not-found',
      statusDetail:'The cursor-agent binary is not on PATH on this execution host. Install it, or route this work to another host.' })
  ];

  const accountsNeedingAttention = accounts.filter((a) => models.some((m) => m.accountId === a.id && m.needsAttention));
