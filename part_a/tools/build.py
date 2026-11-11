#!/usr/bin/env python3
"""Build the single-file, offline ArchiMate Assessor.

    python3 part_a/tools/build.py            # write part_a/dist/archimate-assessor.html
    python3 part_a/tools/build.py --check    # exit 1 if dist/ is stale (used by tests/CI)

Inlines src/styles.css and the JS modules (in JS_MODULES order) into src/index.html
at the /*@@CSS@@*/ and //@@JS@@ markers. Python 3 standard library only.

The modules share one global script scope (no import/export); order matters:
knowledgebase -> parser -> checks -> scoring -> UI -> report -> app wiring.
"""
import argparse
import pathlib
import sys

PART_A = pathlib.Path(__file__).resolve().parent.parent
SRC = PART_A / 'src'
DIST = PART_A / 'dist' / 'archimate-assessor.html'

CSS_MARKER = '/*@@CSS@@*/\n'
JS_MARKER = '//@@JS@@\n'

JS_MODULES = [
    'kb.js',               # ArchiMate knowledgebase (element types, layers, relationship data)
    'parser.js',           # Open Exchange XML -> model (only DOM-dependent engine module)
    'checks.js',           # rule checks -> issues
    'scoring.js',          # issues -> scores
    'ui/manual.js',        # manual scoresheet tab
    'ui/results.js',       # automated-results rendering helpers + rule checklist
    'ui/interactions.js',  # panel/tab toggles, escaping
    'report.js',           # report modal + PDF rendering
    'app.js',              # file handling, processing pipeline, tab navigation
    'ui/tabs.js',          # overview / by-view / by-issue / detailed / view-analysis tabs
    'ui/helpers.js',       # misc UI helpers
]


def read(path: pathlib.Path) -> str:
    return path.read_text(encoding='utf-8')


def build() -> str:
    template = read(SRC / 'index.html')
    for marker in (CSS_MARKER, JS_MARKER):
        if template.count(marker) != 1:
            sys.exit(f'build: expected exactly one {marker.strip()!r} marker in src/index.html')
    css = read(SRC / 'styles.css')
    js = ''.join(read(SRC / name) for name in JS_MODULES)
    return template.replace(CSS_MARKER, css).replace(JS_MARKER, js)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--check', action='store_true', help='fail if the committed dist file is out of date')
    args = ap.parse_args()

    html = build()
    if args.check:
        if not DIST.exists() or read(DIST) != html:
            print(f'build: {DIST.relative_to(PART_A)} is stale; run python3 part_a/tools/build.py', file=sys.stderr)
            return 1
        print('build: dist is up to date')
        return 0

    DIST.parent.mkdir(parents=True, exist_ok=True)
    DIST.write_text(html, encoding='utf-8')
    print(f'build: wrote {DIST.relative_to(PART_A)} ({len(html.encode("utf-8")):,} bytes, {len(JS_MODULES)} modules)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
