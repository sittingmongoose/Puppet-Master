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

    def get_slice(start_marker, end_marker, start_pos=0):
        s = content.find(start_marker, start_pos)
        if s == -1: return "", -1
        e = content.find(end_marker, s + len(start_marker))
        if e == -1: return "", -1
        return content[s:e + len(end_marker)], e + len(end_marker)

    # 1. Styles
    styles, _ = get_slice('<style>', '</style>')
    
    # 2. Title Bar
    title_bar, _ = get_slice('<header class="title-bar">', '</header>')
    
    # 3. Activity Bar
    activity_bar, _ = get_slice('id="activityBar"', '</nav>')
    activity_bar = '<nav class="activity-bar collapsed" ' + activity_bar
    
    # 4. Side Panels
    side_panels, _ = get_slice('id="sidePanelSlot"', '</aside>')
    side_panels = '<aside class="side-panel-slot" ' + side_panels
    
    # 5. Extract Editor Content
    editor_inner, _ = get_slice('<div class="editor-pane" id="editorPane1">', '<div class="resizer-col" id="editorDashResizer">')
    # Cleanup trailing junk from editor_inner
    editor_inner = editor_inner.split('<div class="resizer-col" id="editorDashResizer">')[0].strip()
    
    # 6. Extract Dashboard Content
    dash_header, _ = get_slice('<div class="dashboard-header', '</div>\n          <div class="bento-dashboard"')
    dash_header = dash_header.split('<div class="bento-dashboard"')[0].strip()
    
    dash_body, _ = get_slice('<div class="bento-dashboard"', '<div class="page page-projects">')
    # Cleanup dash_body: find the last widget closure
    last_widget_marker = 'Last 30 days'
    last_idx = dash_body.find(last_widget_marker)
    # The bento-dashboard should end after 3 more </div> tags (widget, bento-dashboard, dashboardView)
    # But wait, my dash_body extraction already includes everything up to page-projects.
    # Let's just find the last </div> before page-projects.
    dash_body_clean = dash_body[:dash_body.find('<div class="page page-projects">')].strip()
    # Remove any stray page closures I added before
    dash_body_clean = re.sub(r'(?:\s*</div>\s*(?:<!--.*?-->)?)+$', '', dash_body_clean, flags=re.DOTALL)
    
    # 7. Other Pages (Inner Content)
    def get_inner(start_marker, end_marker):
        s = content.find(start_marker)
        if s == -1: return ""
        s_inner = content.find('>', s) + 1
        e = content.find(end_marker, s_inner)
        if e == -1: return ""
        inner = content[s_inner:e].strip()
        inner = re.sub(r'(?:\s*</div>\s*(?:<!--.*?-->)?)+$', '', inner, flags=re.DOTALL)
        return inner.strip()

    pp_inner = get_inner('<div class="page page-projects">', '<div class="page page-wizard">')
    pw_inner = get_inner('<div class="page page-wizard">', '<div class="page page-orchestrator">')
    po_inner = get_inner('<div class="page page-orchestrator">', '<div class="page page-usage">')
    pus_inner = get_inner('<div class="page page-usage">', '<div class="page page-settings">')
    ps_inner = get_inner('<div class="page page-settings">', '</main>')
    
    # 8. Chat & Bottom
    chat_panel, _ = get_slice('id="chatPanel"', '</aside>')
    chat_panel = '<aside class="chat-panel hidden" ' + chat_panel
    
    bottom_panel, _ = get_slice('id="bottomPanel"', '</div>\n      </div>')
    bottom_panel = '<div class="bottom-panel pane-container" ' + bottom_panel
    
    status_bar, _ = get_slice('<footer class="status-bar">', '</footer>')
    
    scripts_start = content.find('<script>')
    scripts = content[scripts_start:content.rfind('</script>') + 9]
    scripts = scripts.replace('Integration </body> Tests', 'Integration Tests')

    # REASSEMBLE
    rebuilt = f"""<!DOCTYPE html>
<html lang="en" data-theme="retro-dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Puppet Master - Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Orbitron:wght@700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
  {styles}
</head>
<body>
  <div class="app-shell">
    {title_bar}

    <div class="main-area">
      <div class="left-panel">
        {activity_bar}
        {side_panels}
      </div>

      <div class="center-column">
        <div class="center-row">
          <div class="content-wrapper">
            <main class="primary-content">
              
              <div class="page page-dashboard active">
                <div class="resizer-col" id="leftPanelResizer"></div>
                <div class="editor-view pane-container" id="editorView" style="display:flex; flex-direction:row; gap:2px; flex:1; position:relative;">
                  <div class="pane-header-drag" draggable="true" data-pane="editorView" style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); width:40px; height:10px; background:var(--border-light); border-radius:4px; cursor:grab; z-index:50;"></div>
                  {editor_inner}
                </div>
                <div class="resizer-col" id="editorDashResizer"></div>
                <div class="dashboard-view pane-container" id="dashboardView" style="display:flex; flex-direction:column; flex:1;">
                  {dash_header}
                  {dash_body_clean}
                </div>
              </div>

              <div class="page page-projects">
                {pp_inner}
              </div>
              <div class="page page-wizard">
                {pw_inner}
              </div>
              <div class="page page-orchestrator">
                {po_inner}
              </div>
              <div class="page page-usage">
                {pus_inner}
              </div>
              <div class="page page-settings">
                {ps_inner}
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

    {status_bar}
  </div>

  <div class="pixel-grid" id="pixelGrid"></div>

  {scripts}
</body>
</html>
"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(rebuilt)
    print("Dashboard structural repair (GRANULAR REBUILD) complete.")

if __name__ == "__main__":
    main()
