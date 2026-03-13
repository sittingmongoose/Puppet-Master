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

    def get_block(start_marker, end_marker, include_markers=True):
        s = content.find(start_marker)
        if s == -1: return ""
        e = content.find(end_marker, s + len(start_marker))
        if e == -1: return ""
        if include_markers:
            return content[s:e + len(end_marker)]
        else:
            return content[s + len(start_marker):e].strip()

    # 1. Extract Styles
    styles = get_block('<style>', '</style>')
    
    # 2. Extract Title Bar
    title_bar = get_block('<header class="title-bar">', '</header>')
    
    # 3. Extract Activity Bar
    activity_bar = get_block('<nav class="activity-bar', '</nav>')
    
    # 4. Extract Side Panels
    side_panels = get_block('<aside class="side-panel-slot"', '</aside>')
    
    # 5. Extract Pages
    dashboard_page = get_block('<div class="page page-dashboard', '</div> <!-- End page-dashboard -->', include_markers=False)
    # If not found, try fallback
    if not dashboard_page:
        dashboard_page = get_block('<div class="page page-dashboard', '<div class="page page-projects">', include_markers=False)
        
    projects_page = get_block('<div class="page page-projects">', '<div class="page page-wizard">', include_markers=False)
    wizard_page = get_block('<div class="page page-wizard">', '<div class="page page-orchestrator">', include_markers=False)
    orchestrator_page = get_block('<div class="page page-orchestrator">', '<div class="page page-usage">', include_markers=False)
    usage_page = get_block('<div class="page page-usage">', '<div class="page page-settings">', include_markers=False)
    settings_page = get_block('<div class="page page-settings">', '</main>', include_markers=False)
    
    # 6. Extract Chat Panel
    chat_panel = get_block('<aside class="chat-panel', '</aside>')
    
    # 7. Extract Bottom Panel
    bottom_panel = get_block('<div class="bottom-panel', '</div> <!-- End bottom-panel -->')
    if not bottom_panel:
        # Fallback: find by ID
        bottom_panel = get_block('<div class="bottom-panel', '<footer class="status-bar">', include_markers=False)
        # Try to find the last </div> before status-bar
        last_div = bottom_panel.rfind('</div>')
        if last_div != -1: bottom_panel = bottom_panel[:last_div+6]
        bottom_panel = '<div class="bottom-panel pane-container" id="bottomPanel" style="position:relative;">' + bottom_panel

    # 8. Extract Status Bar
    status_bar = get_block('<footer class="status-bar">', '</footer>')
    
    # 9. Extract Scripts
    scripts = content[content.find('<script>'):content.rfind('</script>') + 9]
    # Remove accidental </body> from scripts
    scripts = scripts.replace('Integration </body> Tests', 'Integration Tests')

    # Reassemble
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
                {dashboard_page}
              </div>
              <div class="page page-projects">
                {projects_page}
              </div>
              <div class="page page-wizard">
                {wizard_page}
              </div>
              <div class="page page-orchestrator">
                {orchestrator_page}
              </div>
              <div class="page page-usage">
                {usage_page}
              </div>
              <div class="page page-settings">
                {settings_page}
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
    print("Dashboard Master Rebuild complete.")

if __name__ == "__main__":
    main()
