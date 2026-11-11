# Architecture

Cyber Shield is a static site: one HTML page, modular CSS and plain JavaScript
files loaded in order. There is no build step, so the project opens directly
from disk and deploys to GitHub Pages as-is.

## CSS

| Layer | Files | Purpose |
|-------|-------|---------|
| Tokens | `variables.css` | Colours, radii, spacing, fonts |
| Base | `base.css`, `layout.css` | Reset, containers, section spacing |
| Components | `components/*.css` | Reusable pieces: buttons, cards, forms, toast |
| Sections | `sections/*.css` | One file per page section |
| Motion | `animations.css` | Keyframes, scroll reveal, reduced-motion support |
| Responsive | `responsive.css` | All breakpoints in one place |

## JavaScript

Each module is an IIFE that exposes a single object with an `init()` method on
`window`. `main.js` calls them in order once the DOM is ready.

```
utils/      dom.js, storage.js, toast.js      → small shared helpers
core/       link-analyzer.js                  → pure scoring logic (no DOM)
modules/    navigation, particles, reveal,
            counters, link-checker, reviews,
            faq, contact-form                 → UI behaviour
main.js                                       → boots everything
```

`link-analyzer.js` uses a UMD wrapper so the same file runs in the browser and
in Node, which lets `tests/link-analyzer.test.mjs` test it without any tooling.

## Link analysis flow

1. `link-checker.js` reads the input and handles the empty / invalid states.
2. `LinkAnalyzer.analyze(url)` normalises the link, then checks each signal and
   subtracts its penalty from a starting score of 100.
3. The score maps to a level: `safe` (≥ 80), `medium` (50–79), `high` (< 50).
4. The UI renders the level, the score and the matched keywords or reasons.
