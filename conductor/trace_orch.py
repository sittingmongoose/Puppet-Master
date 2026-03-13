import sys
from html.parser import HTMLParser

class Tracer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.in_orch = False
        self.orch_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag not in ['div', 'span', 'section', 'nav', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'button', 'p', 'h1', 'h2', 'h3', 'a', 'select', 'option', 'ul', 'li', 'svg', 'details', 'summary', 'aside']: return
        
        attr_dict = dict(attrs)
        cls = attr_dict.get('class', '')
        if 'page-orchestrator' in cls:
            self.in_orch = True
            print(f"[{self.getpos()[0]}] START page-orchestrator")
        
        if self.in_orch:
            self.stack.append((tag, self.getpos()[0], cls))

    def handle_endtag(self, tag):
        if tag not in ['div', 'span', 'section', 'nav', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'button', 'p', 'h1', 'h2', 'h3', 'a', 'select', 'option', 'ul', 'li', 'svg', 'details', 'summary', 'aside']: return
        
        if self.in_orch:
            if not self.stack:
                print(f"[{self.getpos()[0]}] ENDTAG {tag} but stack empty!")
                return
            
            top_tag, top_line, top_cls = self.stack.pop()
            if top_tag != tag:
                print(f"[{self.getpos()[0]}] Mismatched end {tag}, expected {top_tag} from line {top_line} (class: {top_cls})")
                # Recovery attempt
                for i in range(len(self.stack)-1, max(-1, len(self.stack)-10), -1):
                    if self.stack[i][0] == tag:
                        self.stack = self.stack[:i]
                        break
            
            if not self.stack:
                print(f"[{self.getpos()[0]}] END page-orchestrator")
                self.in_orch = False

parser = Tracer()
with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())

if parser.stack:
    print(f"\nUnclosed tags inside orch: {len(parser.stack)}")
    for t, l, c in parser.stack:
        print(f"  {t} {c} {l}")

