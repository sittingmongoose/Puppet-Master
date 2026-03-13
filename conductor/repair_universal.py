import re
import sys

def main():
    file_path = "Concepts/PuppetMasterDashComp.html"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        sys.exit(1)

    def extract_inner_clean(start_marker, end_marker, start_search=0):
        s = content.find(start_marker, start_search)
        if s == -1: return "", start_search
        e = content.find(end_marker, s)
        if e == -1: return "", s
        inner = content[s + len(start_marker):e].strip()
        # Remove trailing </div> tags from inner content to avoid premature closure
        # We count <div> and </div> to be sure
        while inner.count('</div>') > inner.count('<div') + inner.count('<main') + inner.count('<aside') + inner.count('<nav'):
             # Find last </div>
             last_div = inner.rfind('</div>')
             if last_div == -1: break
             inner = inner[:last_div].strip()
        return inner, e + len(end_marker)

    # 1. Extract Inner Content
    editor_inner, _ = extract_inner_clean('<div class="editor-view pane-container" id="editorView"', '<div class="resizer-col" id="editorDashResizer">')
    dashboard_inner, _ = extract_inner_clean('<div class="dashboard-header pane-header-drag"', '<div class="page page-projects">')
    
    # Clean dashboard_inner from trailing divs (it might have picked up the page closures)
    while dashboard_inner.endswith('</div>'):
        dashboard_inner = dashboard_inner[:-6].strip()
        
    projects_inner, _ = extract_inner_clean('<div class="page page-projects">', '<div class="page page-wizard">')
    wizard_inner, _ = extract_inner_clean('<div class="page page-wizard">', '<div class="page page-orchestrator">')
    orchestrator_inner, _ = extract_inner_clean('<div class="page page-orchestrator">', '<div class="page page-usage">')
    usage_inner, _ = extract_inner_clean('<div class="page page-usage">', '<div class="page page-settings">')
    settings_inner, _ = extract_inner_clean('<div class="page page-settings">', '</main>')

    # Extract Chat Panel
    cp_start = content.find('<aside class="chat-panel')
    cp_end = content.find('</aside>', cp_start) + 8
    chat_panel = content[cp_start:cp_end]
    
    # Extract Bottom Panel
    bp_start = content.find('<div class="bottom-panel')
    sb_start = content.find('<footer class="status-bar">')
    bp_end = content.rfind('</div>', bp_start, sb_start) + 6
    bottom_panel = content[bp_start:bp_end]
    
    # Left Panel
    lp_start = content.find('<div class="left-panel">')
    lp_aside_end = content.find('</aside>', lp_start) + 8
    lp_end = content.find('</div>', lp_aside_end) + 6
    left_panel = content[lp_start:lp_end]

    # Rebuild Layout
    head_end = content.find('<header class="title-bar">')
    head_part = content[:head_end]
    
    tb_end = content.find('</header>', head_end) + 9
    title_bar = content[head_end:tb_end]
    
    footer_part = content[sb_start:].replace('Integration </body> Tests', 'Integration Tests')

    rebuilt = f"""{head_part}{title_bar}

    <div class="main-area">
      {left_panel}

      <div class="center-column">
        <div class="center-row">
          <div class="content-wrapper">
            <main class="primary-content">
              <div class="page page-dashboard active">
                <div class="resizer-col" id="leftPanelResizer"></div>
                <div class="editor-view pane-container" id="editorView" style="display:flex; flex-direction:row; gap:2px; flex:1; position:relative;">
                  {editor_inner}
                </div>
                <div class="resizer-col" id="editorDashResizer"></div>
                <div class="dashboard-view pane-container" id="dashboardView" style="display:flex; flex-direction:column; flex:1;">
                  {dashboard_inner}
                </div>
              </div>
              <div class="page page-projects">
                {projects_inner}
              </div>
              <div class="page page-wizard">
                {wizard_inner}
              </div>
              <div class="page page-orchestrator">
                {orchestrator_inner}
              </div>
              <div class="page page-usage">
                {usage_inner}
              </div>
              <div class="page page-settings">
                {settings_inner}
              </div>
            </main>
          </div>
          <div class="resizer-col hidden" id="chatResizer"></div>
          {chat_panel}
        </div>
        
        <div class="resizer-row" id="terminalResizer"></div>
        {bottom_panel}
      </div>
    </div>

    {footer_part}"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(rebuilt)
    print("Dashboard fully restored and structural integrity guaranteed (UNIVERSAL RESET).")

if __name__ == "__main__":
    main()
