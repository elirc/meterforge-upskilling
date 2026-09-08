"""Check local inline Markdown link targets using only the Python standard library.

Run from any directory: python tools/check_docs.py
Checks file/directory existence and repository containment, not heading anchors
or external URLs. Code fences and inline code are ignored.
"""

from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SKIP = {".git", "bin", "obj", "node_modules", ".vs", "TestResults"}
LINK = re.compile(r"!?\[[^\]\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+\"[^\"]*\")?\s*\)")


def main():
    errors = []
    count = 0
    documents = sorted(
        path for path in ROOT.rglob("*.md")
        if not SKIP.intersection(path.relative_to(ROOT).parts)
    )
    for document in documents:
        fence = None
        for number, line in enumerate(document.read_text(encoding="utf-8-sig").splitlines(), 1):
            marker = re.match(r"^\s*(`{3,}|~{3,})", line)
            if marker:
                token = marker.group(1)
                if fence is None:
                    fence = token
                elif token[0] == fence[0] and len(token) >= len(fence):
                    fence = None
                continue
            if fence:
                continue
            line = re.sub(r"(`+).*?\1", "", line)
            for match in LINK.finditer(line):
                target = match.group(1) or match.group(2)
                parsed = urlsplit(target)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                count += 1
                destination = (document.parent / unquote(parsed.path)).resolve()
                if not destination.is_relative_to(ROOT) or not destination.exists():
                    errors.append(f"{document.relative_to(ROOT)}:{number}: missing or outside repository: {target}")
    for error in errors:
        print(error)
    print(f"Checked {count} local links in {len(documents)} Markdown files; {len(errors)} errors.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
