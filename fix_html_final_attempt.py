import sys
import re

def fix():
    file_path = '/home/sittingmongoose/Cursor/Puppet Master/Concepts/PuppetMasterDashComp.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Deduplicate EVERYTHING at the end
    # We find the start of the chat/wizard related stuff after the main dashboard content.
    # The dashboard ends with </footer> and then some closing divs.
    footer_end = content.find('</footer>')
    if footer_end == -1:
        print("Could not find footer end.")
        return
        
    # Find the end of the app-shell container
    # It's usually a few </div> tags after </footer>
    app_shell_end = footer_end + 9
    open_divs = 1 # we assume we are inside at least one div
    # Actually, let's just find where the first chat-resizer or chat-panel starts
    chat_start = content.find('<div class="chat-resizer"')
    if chat_start == -1:
        chat_start = content.find('<aside class="chat-panel"')
        
    if chat_start != -1:
        # We will keep everything up to chat_start
        content_clean = content[:chat_start]
    else:
        content_clean = content

    # 2. SVGs
    svg_user = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    svg_filetext = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
    svg_steer = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>'
    svg_pencil = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
    svg_x = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'

    shared_chat_html = f"""
            <div class="chat-panel-header" style="flex-direction: column; align-items: stretch; gap: var(--sm); padding: var(--sm) var(--md); background: var(--surface-elevated); min-height: auto; border-bottom: 1px solid var(--border-light);">
              <div style="display: flex; align-items: center; width: 100%;">
                <div class="title" style="font-size: 13px; flex: 1; display:flex; align-items:center; gap:var(--sm); font-family:var(--display-font);">
                    ASSISTANT <span class="chatRoleBadge role-badge role-assistant">Assistant</span>
                </div>
                <div class="panel-actions" style="display: flex; gap: var(--xs);">
                  <button class="popOutBtn" title="Pop out" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></button>
                  <button class="closeChatBtn" title="Close" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;">{svg_x}</button>
                </div>
              </div>
              <div style="display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border-light); border-radius: 4px; padding: 2px var(--sm);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Search messages & threads..." style="width: 100%; border: none; background: transparent; padding: 4px; color: var(--text-primary); font-size: 11px; outline: none;">
              </div>
            </div>

            <div class="chat-body" style="flex: 1; display: flex; min-height: 0; overflow: hidden;">
              <div class="chat-thread-sidebar" style="width: 180px; min-width: 140px; background: var(--surface-elevated); border-right: 1px solid var(--border-light); display: flex; flex-direction: column; overflow: hidden;">
                <div class="sidebar-title" style="padding: var(--md); font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
                  HISTORY
                  <button style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                </div>
                <div class="chat-thread-list chatThreadList" style="flex: 1; overflow-y: auto; padding: var(--sm);">
                  <div class="chat-thread-item" data-thread="thread1" style="padding: var(--md); margin-bottom: var(--sm); cursor: pointer; border: var(--border-width) solid var(--border); border-radius: var(--border-radius); font-size: 12px; background: var(--surface);">Wizard: Dashboard UI</div>
                  <div class="chat-thread-item" data-thread="thread2" style="padding: var(--md); margin-bottom: var(--sm); cursor: pointer; border: var(--border-width) solid var(--border); border-radius: var(--border-radius); font-size: 12px; background: var(--surface);">Refactor Database Layer</div>
                  <div class="chat-thread-item" data-thread="thread3" style="padding: var(--md); margin-bottom: var(--sm); cursor: pointer; border: var(--border-width) solid var(--border); border-radius: var(--border-radius); font-size: 12px; background: var(--surface);">Fix Auth Token Bug</div>
                  <div class="chat-thread-item" data-thread="thread4" style="padding: var(--md); margin-bottom: var(--sm); cursor: pointer; border: var(--border-width) solid var(--border); border-radius: var(--border-radius); font-size: 12px; background: var(--surface);">Research Web Frameworks</div>
                  <div class="chat-thread-item" data-thread="thread5" style="padding: var(--md); margin-bottom: var(--sm); cursor: pointer; border: var(--border-width) solid var(--border); border-radius: var(--border-radius); font-size: 12px; background: var(--surface);">Context Lens Check</div>
                  <div class="chat-thread-item" data-thread="thread6" style="padding: var(--md); margin-bottom: var(--sm); cursor: pointer; border: var(--border-width) solid var(--border); border-radius: var(--border-radius); font-size: 12px; background: var(--surface);">FileSafe Blocking</div>
                </div>
              </div>

              <div class="chat-main" style="flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;">
                <div class="chat-modes chatModesBar" style="display: flex; padding: var(--sm) var(--md); gap: var(--xs); border-bottom: 1px solid var(--border-light); font-size: 12px;">
                  <div class="mode" data-mode="ask" style="padding: 4px var(--md); cursor: pointer; color: var(--text-secondary); border-radius: var(--border-radius);">Ask</div>
                  <div class="mode" data-mode="plan" style="padding: 4px var(--md); cursor: pointer; color: var(--text-secondary); border-radius: var(--border-radius);">Plan</div>
                  <div class="mode" data-mode="deep-plan" style="padding: 4px var(--md); cursor: pointer; color: var(--text-secondary); border-radius: var(--border-radius);">Deep Plan</div>
                  <div class="mode" data-mode="crew" style="padding: 4px var(--md); cursor: pointer; color: var(--text-secondary); border-radius: var(--border-radius);">Crew</div>
                </div>
                
                <div class="chat-header-workflow hidden chatWorkflowHeader" style="display:flex; justify-content:space-between; align-items:center; padding:var(--sm) var(--md); border-bottom:1px solid var(--border-light); background:var(--surface-elevated); font-size:12px; font-weight:600;">
                  <span class="workflowHeaderTitle">Interactive Interview</span>
                  <button class="wizard-btn returnToChatBtn" style="padding:2px var(--sm); font-size:10px;">Return to Chat</button>
                </div>

                <div class="message-stream messageStream" style="flex: 1; overflow-y: auto; padding: var(--md); display: flex; flex-direction: column; gap: var(--md);">
                </div>

                <div class="chat-input-area" style="position:relative; padding: var(--md); border-top: 1px solid var(--border-light);">
                  <div class="pendingInterventionBlock hidden" style="position:absolute; top:-40px; left:var(--md); right:var(--md); background:var(--surface-elevated); border:1px solid var(--border-light); border-radius:6px; padding:var(--sm) var(--md); display:flex; justify-content:space-between; align-items:center; font-size:11px; box-shadow:0 -4px 12px rgba(0,0,0,0.1); z-index:10;">
                    <span style="color:var(--text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:200px;">"Wait, update the cache too."</span>
                    <div style="display:flex; gap:var(--xs); align-items:center;">
                      <span style="color:var(--text-muted); margin-right:var(--xs);">Queued</span>
                      <button title="Steer (Interrupt)" style="background:none; border:none; color:var(--accent-blue); cursor:pointer;">{svg_steer}</button>
                      <button title="Edit" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">{svg_pencil}</button>
                      <button title="Cancel" style="background:none; border:none; color:var(--accent-magenta); cursor:pointer;">{svg_x}</button>
                    </div>
                  </div>

                  <div style="background:var(--surface-elevated); border: 1px solid var(--border); border-radius:6px; padding:var(--xs); display:flex; flex-direction:column;">
                    <textarea placeholder="Type your message or @ mention files, symbols, and headings..." style="border:none; outline:none; background:transparent; resize:none; min-height:48px; padding:var(--sm); font-family:var(--body-font); font-size:13px; color:var(--text-primary); width: 100%;"></textarea>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--xs) var(--sm);">
                      <div style="display:flex; gap:var(--md); align-items:center;">
                        <button title="Attach File" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></button>
                        <label style="font-size:10px; color:var(--text-secondary); display:flex; align-items:center; gap:2px; cursor:pointer;"><input type="checkbox"> ELI5</label>
                        <label style="font-size:10px; color:var(--accent-orange); display:flex; align-items:center; gap:2px; cursor:pointer;" title="Auto-approve tools"><input type="checkbox"> YOLO</label>
                      </div>
                      <button style="background:var(--accent-blue); color:var(--surface); border:none; border-radius:4px; padding:4px var(--md); font-size:11px; font-weight:600; cursor:pointer;">Send</button>
                    </div>
                  </div>
                </div>

                <div class="chat-footer" style="display:flex; justify-content:space-between; padding:var(--sm) var(--md); background:var(--surface); border-top:1px solid var(--border-light); font-size:10px; min-height: 24px; position:relative;">
                  <div style="display:flex; gap:var(--md); align-items:center;">
                    <div style="position:relative;">
                      <button class="chat-dropdown-btn" data-dropdown="persona" style="background:var(--surface-elevated); border:1px solid var(--border-light); border-radius:4px; padding:2px var(--sm); color:var(--text-primary); cursor:pointer; display:flex; align-items:center; gap:var(--xs); font-size: 10px;">
                        {svg_user}
                        <span class="persona-label">product-manager</span> <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                      <div class="chat-dropdown-popover personaPopover">
                        <div class="chat-dropdown-search"><input type="text" placeholder="Find persona..." class="personaSearch"></div>
                        <div class="chat-dropdown-list personaList">
                            <div class="chat-dropdown-item active" data-value="product-manager">{svg_user} product-manager</div>
                            <div class="chat-dropdown-item" data-value="architect-reviewer">{svg_user} architect-reviewer</div>
                            <div class="chat-dropdown-item" data-value="rust-engineer">{svg_user} rust-engineer</div>
                            <div class="chat-dropdown-item" data-value="technical-writer">{svg_user} technical-writer</div>
                            <div class="chat-dropdown-item" data-value="knowledge-synthesizer">{svg_user} knowledge-synthesizer</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style="position:relative;">
                      <button class="chat-dropdown-btn" data-dropdown="model" style="background:var(--surface-elevated); border:1px solid var(--border-light); border-radius:4px; padding:2px var(--sm); color:var(--text-primary); cursor:pointer; display:flex; align-items:center; gap:var(--xs); font-size: 10px;">
                        <span class="model-label">Claude: sonnet-4.5</span> <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                      <div class="chat-dropdown-popover modelPopover">
                        <div class="chat-dropdown-search"><input type="text" placeholder="Find model..." class="modelSearch"></div>
                        <div class="chat-dropdown-list modelList">
                            <div class="chat-dropdown-header">Anthropic</div>
                            <div class="chat-dropdown-item active" data-value="Claude: sonnet-4.5">sonnet-4.5</div>
                            <div class="chat-dropdown-item" data-value="Claude: opus-3">opus-3</div>
                            <div class="chat-dropdown-header">OpenAI</div>
                            <div class="chat-dropdown-item" data-value="OpenAI: o3-mini">o3-mini</div>
                            <div class="chat-dropdown-item" data-value="OpenAI: gpt-4o">gpt-4o</div>
                            <div class="chat-dropdown-header">Local</div>
                            <div class="chat-dropdown-item" data-value="Local: DeepSeek R1">DeepSeek R1</div>
                        </div>
                      </div>
                    </div>

                    <span title="Reasoning Effort: High" style="color:var(--text-secondary); display:flex; align-items:center; gap:var(--xs);">
                        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54z"></path></svg>
                        High
                    </span>
                  </div>
                  <div style="display:flex; gap:var(--md); align-items:center;">
                    <div class="context-usage" title="Context: 42k / 128k" style="display:flex; align-items:center; gap:var(--xs);">
                      <div style="width:12px; height:12px; border-radius:50%; background:conic-gradient(var(--accent-blue) 30%, var(--border-light) 0); border:1px solid var(--border);"></div>
                      <span>42k</span>
                    </div>
                    <a href="#" style="color:var(--accent-orange); display:flex; align-items:center; gap:var(--xs); text-decoration: none;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 3 Problems</a>
                  </div>
                </div>
              </div>
    """

    js_logic = f"""
    const mockThreads = {{
      'thread1': {{ role: 'interviewer', title: 'INTERVIEWER', html: `<div class="message assistant">Hello! I see you selected "Add a new Feature or Enhancement". To kick off our Feature Scope probe: What exactly are you adding or changing in this project?</div><div class="message user">I need to add a brand new feature step to the interactive interview UI so it correctly probes for project scope before doing the actual architecture interview.</div><div class="message assistant">Excellent, I have mapped the feature boundaries. Moving on to Architecture: Do you have a preferred UI framework for rendering this new phase tracker component?</div><div class="interview-chips" style="display:flex; flex-wrap:wrap; gap:var(--sm); margin-top:var(--sm);"><div class="interview-chip" style="padding:4px 8px; background:var(--surface-elevated); border:1px solid var(--border); font-size:11px; cursor:pointer; border-radius:16px;">React</div><div class="interview-chip" style="padding:4px 8px; background:var(--surface-elevated); border:1px solid var(--border); font-size:11px; cursor:pointer; border-radius:16px;">Slint</div><div class="interview-chip" style="padding:4px 8px; background:var(--surface-elevated); border:1px solid var(--border); font-size:11px; cursor:pointer; border-radius:16px;">Let AI Decide</div></div>` }},
      'thread2': {{ role: 'assistant', title: 'ASSISTANT', mode: 'crew', html: `<div class="message user">Refactor the user schema to support multi-tenant workspaces.</div><div class="message assistant" style="background:transparent; border:none; padding:0; box-shadow:none;"><div style="display:flex; flex-direction:column; gap:var(--sm);"><div style="background:var(--surface-elevated); border:1px solid var(--border-light); padding:var(--sm) var(--md); border-radius:4px; display:flex; justify-content:space-between; align-items:center; font-size:11px;"><span style="display:flex; align-items:center; gap:var(--xs);"><div class="wizard-activity-pulse" style="width:6px; height:6px;"></div> <b>database-admin</b> analyzing schema...</span><span style="color:var(--text-muted);">0:14</span></div><div style="background:var(--surface-elevated); border:1px solid var(--border-light); padding:var(--sm) var(--md); border-radius:4px; display:flex; justify-content:space-between; align-items:center; font-size:11px;"><span style="display:flex; align-items:center; gap:var(--xs);"><div class="wizard-activity-pulse" style="width:6px; height:6px;"></div> <b>rust-engineer</b> drafting migrations...</span><span style="color:var(--text-muted);">0:08</span></div></div></div>` }},
      'thread3': {{ role: 'assistant', title: 'ASSISTANT', mode: 'deep-plan', html: `<div class="message user">Users are getting 401s after 1 hour. Fix the token refresh logic.</div><div class="message assistant"><div class="message-block collapsed" style="border-left: 2px solid var(--border-light); padding-left: var(--sm); margin-bottom: var(--sm);"><div class="block-header" style="font-size:11px; cursor:pointer;">[+] Thinking (12s)</div></div><div class="message-block" style="border-left: 2px solid var(--accent-blue); padding-left: var(--sm); margin-bottom: var(--sm);"><div class="block-header" style="font-size:11px; cursor:pointer;">[-] Ran bash command</div><div class="block-body"><pre style="font-size:10px; background:var(--surface); padding:4px; overflow-x:auto;">$ git grep "token_expiry"</pre></div></div>The fix is applied in auth.rs.</div>` }},
      'thread4': {{ role: 'assistant', title: 'ASSISTANT', mode: 'ask', html: `<div class="message user">What are the latest breaking changes in React 19?</div><div class="message assistant">React 19 introduces several major breaking changes...</div>` }},
      'thread5': {{ role: 'assistant', title: 'ASSISTANT', mode: 'ask', html: `<div style="text-align:center; font-size:10px; color:var(--text-muted); margin-bottom:var(--sm);">Context Lens Active</div><div class="message user" style="opacity: 0.5; position:relative; border:none; box-shadow:none;"><div style="position:absolute; top:-8px; right:-8px; background:var(--surface); border:1px solid var(--border); font-size:9px; padding:2px 4px; border-radius:4px; color:var(--text-primary);">Muted</div>Here is the old log file from yesterday...</div><div class="message assistant">I understand.</div><div class="message user msg-focused" style="position:relative; background:transparent;"><div style="position:absolute; top:-8px; right:-8px; background:var(--accent-blue); color:var(--surface); font-size:9px; padding:2px 4px; border-radius:4px;">Focused</div>Focus strictly on this error block: <code>NullReferenceException in orchestrator.rs:42</code></div>` }},
      'thread6': {{ role: 'builder', title: 'PRD BUILDER', html: `<div class="message assistant">I've drafted the preliminary PRD for the "Multi-tenant Refactor". You can review it in the center Document Pane.<div style="margin-top:var(--md); padding:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated); display:flex; align-items:center; gap:var(--sm); font-size:11px;">{svg_filetext} Opened <b>multi-tenant-refactor.md</b> in Binder</div></div>` }}
    }};

    window.switchToChatThread = function(threadId) {{
      const thread = mockThreads[threadId];
      if (!thread) return;
      document.querySelectorAll('.chat-thread-item').forEach(i => i.classList.toggle('active', i.getAttribute('data-thread') === threadId));
      document.querySelectorAll('.messageStream').forEach(el => {{ el.innerHTML = thread.html; }});
      document.querySelectorAll('.chatModesBar').forEach(bar => {{
        if (thread.role !== 'assistant') {{ bar.style.display = 'none'; }}
        else {{ bar.style.display = 'flex'; bar.querySelectorAll('.mode').forEach(m => m.classList.toggle('active', m.getAttribute('data-mode') === (thread.mode || 'ask'))); }}
      }});
      document.querySelectorAll('.chatWorkflowHeader').forEach(hdr => {{
        if (thread.role !== 'assistant') {{ hdr.classList.remove('hidden'); hdr.querySelector('.workflowHeaderTitle').textContent = thread.title; }}
        else {{ hdr.classList.add('hidden'); }}
      }});
      document.querySelectorAll('.chatRoleBadge').forEach(badge => {{ badge.className = 'role-badge chatRoleBadge role-' + thread.role; badge.textContent = thread.title; }});
      document.querySelectorAll('.pendingInterventionBlock').forEach(block => {{ block.classList.toggle('hidden', threadId !== 'thread2'); }});
    }};

    window.toggleChatDropdown = function(type) {{
        document.querySelectorAll('.' + type + 'Popover').forEach(popover => {{
            const isActive = popover.classList.contains('active');
            document.querySelectorAll('.chat-dropdown-popover').forEach(p => p.classList.remove('active'));
            if (!isActive) popover.classList.add('active');
        }});
    }};

    window.switchWizardStep = function(stepIndex) {{
      document.querySelectorAll('.page-wizard').forEach(wizardContainer => {{
          const navSteps = wizardContainer.querySelectorAll('.wizard-nav-step');
          if (navSteps.length > 0) {{
              navSteps.forEach(el => {{
                el.classList.remove('active', 'complete');
                const idx = parseInt(el.getAttribute('data-nav-step'));
                if (idx < stepIndex) el.classList.add('complete');
                if (idx === stepIndex) el.classList.add('active');
              }});
          }}
          const panels = wizardContainer.querySelectorAll('.wizard-step-panel');
          if (panels.length > 0) {{
              panels.forEach(panel => {{
                const idx = parseInt(panel.getAttribute('data-wizard-panel'));
                if (idx === stepIndex) {{
                  panel.style.display = 'flex';
                  panel.classList.add('active');
                  panel.classList.remove('exit-left');
                  if (stepIndex === 2) {{
                     const cp = document.getElementById('chatPanel');
                     const cr = document.getElementById('chatResizer');
                     if (cp) cp.classList.remove('hidden');
                     if (cr) cr.classList.remove('hidden');
                     if (window.switchToChatThread) window.switchToChatThread('thread1');
                  }}
                }} else if (idx < stepIndex) {{
                  panel.style.display = 'none';
                  panel.classList.remove('active');
                  panel.classList.add('exit-left');
                }} else {{
                  panel.style.display = 'none';
                  panel.classList.remove('active', 'exit-left');
                }}
              }});
          }}
      }});
    }};

    function initChatResizer() {{
      const resizer = document.getElementById('chatResizer');
      const panel = document.getElementById('chatPanel');
      if (!resizer || !panel) return;
      let isResizing = false;
      resizer.addEventListener('mousedown', (e) => {{
        isResizing = true;
        resizer.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
      }});
      document.addEventListener('mousemove', (e) => {{
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 320 && newWidth <= 800) {{
          panel.style.width = newWidth + 'px';
          panel.style.maxWidth = 'none';
        }}
      }});
      document.addEventListener('mouseup', () => {{
        if (isResizing) {{
          isResizing = false;
          resizer.classList.remove('resizing');
          document.body.style.cursor = 'default';
        }}
      }});
    }}

    document.addEventListener('click', (e) => {{
        if (!e.target.closest('.chat-dropdown-btn') && !e.target.closest('.chat-dropdown-popover')) {{
            document.querySelectorAll('.chat-dropdown-popover').forEach(p => p.classList.remove('active'));
        }}
    }});

    document.addEventListener('DOMContentLoaded', () => {{
      initChatResizer();
      document.body.addEventListener('click', (e) => {{
        const target = e.target.closest('[data-step-target], [data-nav-step]');
        if (target) {{
            const attr = target.getAttribute('data-step-target') || target.getAttribute('data-nav-step');
            const step = parseInt(attr);
            if (!isNaN(step)) {{ window.switchWizardStep(step); }}
        }}
        const threadItem = e.target.closest('.chat-thread-item');
        if (threadItem) {{ window.switchToChatThread(threadItem.getAttribute('data-thread')); }}
        const dropdownBtn = e.target.closest('.chat-dropdown-btn');
        if (dropdownBtn) {{ window.toggleChatDropdown(dropdownBtn.getAttribute('data-dropdown')); }}
        const closeBtn = e.target.closest('.closeChatBtn');
        if (closeBtn) {{
            const cp = document.getElementById('chatPanel');
            const cr = document.getElementById('chatResizer');
            const fc = document.getElementById('floatingChat');
            if (cp) cp.classList.add('hidden');
            if (cr) cr.classList.add('hidden');
            if (fc) fc.style.display = 'none';
        }}
        const popOutBtn = e.target.closest('.popOutBtn');
        if (popOutBtn) {{
            const cp = document.getElementById('chatPanel');
            const cr = document.getElementById('chatResizer');
            const fc = document.getElementById('floatingChat');
            if (cp) cp.classList.add('hidden');
            if (cr) cr.classList.add('hidden');
            if (fc) fc.style.display = 'flex';
        }}
        if (e.target.closest('.returnToChatBtn')) window.switchToChatThread('thread4');
      }});
      
      document.querySelectorAll('.page-tab').forEach(function(tab) {{
        tab.addEventListener('click', function() {{
          var pageId = this.getAttribute('data-page');
          if (!pageId) return;
          document.querySelectorAll('.page-tab').forEach(function(t) {{ t.classList.remove('active'); }});
          this.classList.add('active');
          document.querySelectorAll('.primary-content > .page').forEach(function(p) {{
            p.classList.toggle('active', p.classList.contains('page-' + pageId));
          }});
        }});
      }});

      window.switchWizardStep(0);
    }});
    """

    # Inject HTML for resizer and panels
    # We replace everything from the first chat-resizer or chatPanel
    full_chat_block = f"""
    <div class="chat-resizer" id="chatResizer"></div>
    <aside class="chat-panel hidden" id="chatPanel">
        {shared_chat_html}
    </aside>
    
    <div class="floating-chat" id="floatingChat" style="resize:both; overflow:hidden; min-width:320px; min-height:400px; display:none; flex-direction:column; z-index:1000;">
      <div class="float-title" id="floatDrag" style="display:flex; align-items:center; justify-content:space-between; padding:0 var(--md); background:var(--surface-elevated); border-bottom:var(--border-width) solid var(--border); cursor:move; font-weight:600; font-size:13px; height:28px;">
        Assistant - Puppet Master
        <button class="closeChatBtn" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:16px;">{svg_x}</button>
      </div>
      <div class="float-content" style="flex:1; display:flex; flex-direction:column; overflow:hidden; height: calc(100% - 28px);">
        {shared_chat_html}
      </div>
    </div>
    """
    
    # Surgical find and replace
    resizer_start = content.find('<div class="chat-resizer"')
    if resizer_start == -1: resizer_start = content.find('<aside class="chat-panel"')
    
    # Find the end of the last aside or floating chat before script
    aside_end = content.rfind('</aside>')
    if aside_end != -1: 
        # find the end of the div after aside
        div_end = content.find('</div>', aside_end)
        if div_end != -1:
            end_search = content.find('<script>', div_end)
            content = content[:resizer_start] + full_chat_block + content[end_search:]

    # Final script re-injection
    script_match = list(re.finditer(r'<script>', content))
    if script_match:
        last_script = script_match[-1].start()
        content = content[:last_script] + "<script>" + js_logic + "</script>\n</body>\n</html>"

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleaned up and restored functionality.")

fix()
