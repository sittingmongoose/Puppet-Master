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

    def get_inner(start_marker, end_marker):
        s = content.find(start_marker)
        if s == -1: return ""
        s_inner = content.find('>', s) + 1
        e = content.find(end_marker, s_inner)
        if e == -1: return ""
        inner = content[s_inner:e].strip()
        inner = re.sub(r'(?:\s*</div>\s*(?:<!--.*?-->)?)+$', '', inner, flags=re.DOTALL)
        inner = re.sub(r'^[^<]*>', '', inner)
        return inner.strip()

    # 1. Extract Styles
    styles = re.search(r'<style>.*?</style>', content, re.DOTALL).group(0)
    
    # 2. Extract Title Bar
    title_bar = re.search(r'<header class="title-bar">.*?</header>', content, re.DOTALL).group(0)
    
    # 3. Extract Activity Bar
    activity_bar = re.search(r'<nav[^>]*id="activityBar".*?</nav>', content, re.DOTALL).group(0)
    
    # 4. Extract Side Panels
    side_panels = re.search(r'<aside[^>]*id="sidePanelSlot".*?</aside>', content, re.DOTALL).group(0)
    
    # 5. Extract Pages
    dashboard_inner = get_inner('<div class="page page-dashboard', '<div class="page page-projects">')
    projects_inner = get_inner('<div class="page page-projects">', '<div class="page page-wizard">')
    wizard_inner = get_inner('<div class="page page-wizard">', '<div class="page page-orchestrator">')
    orchestrator_inner = get_inner('<div class="page page-orchestrator">', '<div class="page page-usage">')
    usage_inner = get_inner('<div class="page page-usage">', '<div class="page page-settings">')
    settings_inner = get_inner('<div class="page page-settings">', '</main>')
    
    # 6. Extract Chat Panel
    chat_panel = re.search(r'<aside[^>]*id="chatPanel".*?</aside>', content, re.DOTALL).group(0)
    
    # 7. Extract Bottom Panel
    bottom_panel = re.search(r'<div[^>]*id="bottomPanel".*?</div>', content, re.DOTALL).group(0)
    
    # 8. Extract Status Bar
    status_bar = re.search(r'<footer class="status-bar">.*?</footer>', content, re.DOTALL).group(0)
    
    # 9. Extract Scripts
    scripts = content[content.find('<script>'):content.rfind('</script>') + 9]
    scripts = scripts.replace('Integration </body> Tests', 'Integration Tests')

    # Reassemble with PERFECT NESTING
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
                {dashboard_inner}
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

    {status_bar}
  </div>

  <div class="pixel-grid" id="pixelGrid"></div>

  {scripts}
</body>
</html>
"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(rebuilt)
    print("Dashboard final rebuild complete.")

if __name__ == "__main__":
    main()
