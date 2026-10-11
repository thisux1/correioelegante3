# early-web — Correio Elegante design preview

Late-90s/early-2000s personal-homepage culture (GeoCities / fan-page energy) applied to the
Correio Elegante brand. Light theme only — the "internet as scrapbook" version, not the dark
space-GIF trap.

## Files

| File | What it is |
|---|---|
| `lp.html` | Product homepage as a GeoCities site: window chrome, marquee, visitor counter, sidebar menu, guestbook testimonials, under-construction strip, webring footer. CTA "assine o guestbook" → `card.html`. |
| `card.html` | The generated page: an anonymous admirer's fan-site for **Júlia** — guestbook-framed letter, clue cards, non-committal suspects, working local guestbook, identity "permanently under construction". |

## Palette (hex)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#fff7f9` / `#fff8fb` | Tiled page background base |
| `--panel` | `#fffdfd` | Window/panel surface |
| `--panel-soft` | `#fff0f4` | Inset form / CTA surfaces |
| `--cream` | `#fffdf8` | Marquee strip, guestbook paper |
| `--pink-100..400` | `#fff5f7` `#ffe4ec` `#fecdd3` `#fda4af` | Fills, hovers, gradients |
| `--rose` / `--rose-deep` / `--rose-hot` | `#e11d48` / `#be123c` / `#f43f5e` | Pixel art, accents, winbar gradient |
| `--ink` / `--ink-soft` / `--ink-faint` | `#4c0519` / `#701a35` / `#881337` | Text ramp (deep wine) |
| `--bevel-hi` / `--bevel-lo` / `--bevel-dk` | `#ffffff` / `#c97a96` / `#8f4763` | Win95-style raised/sunken borders |
| `--link` / `--visited` | `#3347d4` / `#7d3ba8` | Classic hyperlink blue / purple |
| pastels | `#ffc9a3` `#fde68a` `#a7e8c9` `#a5d8ff` `#d5b3ff` | Rainbow divider + hazard stripes |
| `--mystery` | `#8b7d97` | Anonymous silhouettes (card only) |

## Fonts (Google Fonts CDN — `latin` subset covers ç/ã/õ/é)

- **VT323** — display headlines, marquee, counter digits, signatures.
- **Silkscreen** (400/700) — window chrome, section labels, buttons, meta text.
- **Georgia / Times New Roman** — letter body (readable serif).
- **Verdana** — general body copy (period-correct 11–13px).
- **Comic Sans MS** — guestbook entry handwriting.

## Extractable design tokens

1. **Beveled frame** — `border: 2–3px solid; border-color: #fff #c97a96 #c97a96 #fff` (raised) / swapped for sunken. Pairs with `box-shadow: 4px 4px 0 rgba(136,19,55,.18)`.
2. **Window title bar** — `linear-gradient(90deg, #be123c, #f43f5e, #fda4af)` + white Silkscreen 11px + three 14px beveled buttons.
3. **Star/heart tile** — 64–72px SVG data-URI background: cream base + 2–3 pixel sparkles + 1–2 dot clusters, low contrast (≤ `#f6bdce` on `#fff8fb`).
4. **Pixel sprites** — inline SVG `shape-rendering: pixelated`; 7×6 heart path `M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z`; also used as `cursor: url(...)` on links.
5. **Counter digit** — `#3d0716` well, `#fecdd3` VT323 glyphs, inset border, `text-shadow: 0 0 4px #f43f5e` glow.
6. **Guestbook entry** — sunken cream frame + gradient label bar (`#ffe4ec → #fff`) + dotted `#c97a96` separator.
7. **Marquee track** — duplicated inline-flex track, `translateX(-50%)` keyframes, pause on hover, `prefers-reduced-motion` off-switch.

## Notes

- Zero emojis, zero external images — all decoration is CSS gradients, box-shadows, or inline/data-URI SVG.
- Mobile-first: the two-column "table" collapses to a single stack under 720px.
- JS is decorative only: localStorage visit counter, suspect interrogations, local guestbook append.
