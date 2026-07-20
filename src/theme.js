
/* ══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Beachy palette from color swatch
   Mirroring prettylittlemarketer.com layout patterns:
   ▸ Grid paper background texture
   ▸ Infinite marquee/ticker
   ▸ Handwritten script labels
   ▸ Horizontal scroll card carousels
   ▸ Photo-forward cards
   ▸ Bold typographic hero
   ▸ Full-width alternating color blocks
   ══════════════════════════════════════════════════════════════ */

export const C = {
  charcoal:     "#2C2C28",   // deep-dusk — dark backgrounds, nav
  cream:        "#FDFAF4",   // warm-white — page background
  sand:         "#E2DDD4",   // sand-line — borders, dividers
  sandLight:    "#EEE9E2",   // lighter sand for section backgrounds
  olive:        "#555407",   // primary action — buttons, links, highlights
  oliveHover:   "#6B6A0A",   // olive hover state
  motherEarth:  "#7A5C4E",   // warm brown accent
  somethingBlue:"#D8EBF9",   // light blue accent — backgrounds
  butter:       "#F2E84B",   // yellow accent
  coral:        "#E8A87C",   // salmon — testimonial bubble, warm accents
  warmTan:      "#8A877E",   // text-muted — secondary text, labels
  body:         "#4A4840",   // text-body — primary body copy
  white:        "#FFFFFF",
  // Legacy aliases kept for compatibility with remaining references
  oceanBlue:    "#555407",   // remapped → olive (primary action)
  oceanLight:   "#D8EBF9",   // remapped → somethingBlue
  lavender:     "#D8EBF9",   // remapped → somethingBlue
  lavenderLight:"#EBF4FC",   // somethingBlue light tint
  yellow:       "#F2E84B",   // remapped → butter
  pinkSoft:     "#F5E6DC",   // kept — card accent tint
  muted:        "#8A877E",   // remapped → warmTan
  warmWhite:    "#FDFAF4",   // remapped → cream
};

/* ── Grid paper SVG pattern — brand warm-white base ── */
export const gridBgWhite    = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23FDFAF4'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23E2DDD4' stroke-width='0.7' fill='none' opacity='0.8'/%3E%3C/svg%3E")`;
export const gridBgSand     = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23EEE9E2'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23C8C2B8' stroke-width='0.7' fill='none' opacity='0.85'/%3E%3C/svg%3E")`;
export const gridBgOcean    = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23D8EBF9'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23555407' stroke-width='0.7' fill='none' opacity='0.22'/%3E%3C/svg%3E")`;

