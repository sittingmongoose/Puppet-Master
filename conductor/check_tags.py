import sys
from html.parser import HTMLParser

class BalanceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag in ['div', 'main', 'span', 'section', 'nav', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'button', 'p', 'h1', 'h2', 'h3', 'a', 'select', 'option', 'ul', 'li', 'svg', 'details', 'summary', 'aside']:
            attr_dict = dict(attrs)
            self.stack.append((tag, self.getpos()[0], attr_dict.get('class', ''), attr_dict.get('id', '')))

    def handle_endtag(self, tag):
        if tag in ['div', 'main', 'span', 'section', 'nav', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'button', 'p', 'h1', 'h2', 'h3', 'a', 'select', 'option', 'ul', 'li', 'svg', 'details', 'summary', 'aside']:
            if not self.stack:
                self.errors.append(f"Line {self.getpos()[0]}: Unexpected closing tag </{tag}>")
            else:
                top_tag = self.stack[-1][0]
                if top_tag == tag:
                    self.stack.pop()
                else:
                    found = False
                    for i in range(len(self.stack)-1, max(-1, len(self.stack)-10), -1):
                        if self.stack[i][0] == tag:
                            found = True
                            self.errors.append(f"Line {self.getpos()[0]}: Mismatched closing tag </{tag}>. Skipping {len(self.stack)-1-i} unclosed tags.")
                            for j in range(len(self.stack)-1, i, -1):
                                self.errors.append(f"  Unclosed: <{self.stack[j][0]} class='{self.stack[j][2]}' id='{self.stack[j][3]}'> from line {self.stack[j][1]}")
                            self.stack = self.stack[:i]
                            break
                    if not found:
                        self.errors.append(f"Line {self.getpos()[0]}: Unexpected closing tag </{tag}>")

parser = BalanceParser()
with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())

if not parser.errors and not parser.stack:
    print("Tags are perfectly balanced!")
else:
    for error in parser.errors[:20]:
        print(error)
