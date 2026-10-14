#!/usr/bin/env python3
"""Version local CSS/ES-module URLs so deployments do not reuse old assets."""
from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'src'

def version(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]

# Version dependencies first; the entry module's hash then covers dependency
# changes as well. Keep plain source files and avoid any build dependencies.
entry = SRC / 'js/index.js'
source = entry.read_text()

def module_url(match):
    relative = match.group(1)
    target = entry.parent / relative
    return f"from '{relative}?v={version(target)}'"

source = re.sub(r"from ['\"](\./[^'\"?]+\.js)(?:\?v=[a-f0-9]+)?['\"]", module_url, source)
entry.write_text(source)
page = SRC / 'index.html'
html = page.read_text()
for attribute, relative in [('href', 'styles/index.css'), ('src', 'js/index.js')]:
    html = re.sub(
        rf'{attribute}="{re.escape(relative)}(?:\?v=[a-f0-9]+)?"',
        f'{attribute}="{relative}?v={version(SRC / relative)}"',
        html,
    )
page.write_text(html)
print('Updated CSS, module entry, and restaurant/model import versions.')
