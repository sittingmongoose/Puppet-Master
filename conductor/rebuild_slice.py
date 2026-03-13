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

    def get_inner_slice(start_marker, end_marker, start_pos=0):
        s = content.find(start_marker, start_pos)
        if s == -1: return "", -1
        s_inner = content.find('>', s) + 1
        e = content.find(end_marker, s_inner)
        if e == -1: return "", -1
        return content[s_inner:e].strip(), e

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
    
    # 5. Pages
    pd_inner, _ = get_inner_slice('<div class="page page-dashboard', '<div class="page page-projects">')
    # Cleanup pd_inner from previous repairs
    pd_inner = pd_inner.split('</div> <!-- Fixed closure')[0].split('</div> <!-- Close page-dashboard')[0].split('</div> <!-- REAL CLOSURE')[0].strip()
    # Also remove duplicate start attributes
    pd_inner = pd_inner.replace('active">', '', 1).strip()
    
    pp_inner, _ = get_inner_slice('<div class="page page-projects">', '<div class="page page-wizard">')
    pw_inner, _ = get_inner_slice('<div class="page page-wizard">', '<div class="page page-orchestrator">')
    po_inner, _ = get_inner_slice('<div class="page page-orchestrator">', '<div class="page page-usage">')
    pus_inner, _ = get_inner_slice('<div class="page page-usage">', '<div class="page page-settings">')
    ps_inner, _ = get_inner_slice('<div class="page page-settings">', '</main>')
    
    # 6. Chat Panel
    chat_panel, _ = get_slice('id="chatPanel"', '</aside>')
    chat_panel = '<aside class="chat-panel hidden" ' + chat_panel
    
    # 7. Bottom Panel
    bottom_panel, _ = get_slice('id="bottomPanel"', '</div>\n      </div>')
    bottom_panel = '<div class="bottom-panel pane-container" ' + bottom_panel
    
    # 8. Status Bar
    status_bar, _ = get_slice('<footer class="status-bar">', '</footer>')
    
    # 9. Scripts
    scripts_start = content.find('<script>')
    scripts = content[scripts_start:content.rfind('</script>') + 9]
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
                {pd_inner}
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
    print("Dashboard structural repair (SLICE REBUILD) complete.")

if __name__ == "__main__":
    main()
