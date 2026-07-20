/* ══════════════════════════════════════════════════════════════
   ICON SYSTEM — consistent stroke icons in the brand palette.
   CMS content still stores emoji strings; EmojiIcon maps each
   known emoji to a matching SVG so stored content renders as a
   crisp icon everywhere. Unknown emoji fall back to plain text.
   Paths adapted from Lucide (ISC license).
   ══════════════════════════════════════════════════════════════ */

const PATHS = {
  umbrella: [
    "M22 12a10.06 10.06 0 0 0-20 0Z",
    "M12 12v8a2 2 0 0 0 4 0",
    "M12 2v1",
  ],
  coffee: [
    "M10 2v2", "M14 2v2", "M6 2v2",
    "M17 8h1a4 4 0 1 1 0 8h-1",
    "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z",
  ],
  sparkles: [
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
    "M20 3v4", "M22 5h-4",
  ],
  sparkle: [
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  ],
  zap: [
    "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  ],
  puzzle: [
    "M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z",
  ],
  waves: [
    "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
  ],
  sprout: [
    "M7 20h10",
    "M10 20c5.5-2.5.8-6.4 3-10",
    "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z",
    "M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z",
  ],
  handshake: [
    "m11 17 2 2a1 1 0 1 0 3-3",
    "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
    "m21 3 1 11h-2",
    "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3",
    "M3 4h8",
  ],
  frown: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
    "M16 16s-1.5-2-4-2-4 2-4 2",
    "M9 9h.01", "M15 9h.01",
  ],
  clipboard: [
    "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
    "M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z",
    "M12 11h4", "M12 16h4", "M8 11h.01", "M8 16h.01",
  ],
  notebookPen: [
    "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4",
    "M2 6h4", "M2 10h4", "M2 14h4", "M2 18h4",
    "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
  ],
  briefcase: [
    "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    "M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z",
  ],
  mailHeart: [
    "M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5",
    "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
    "M18.8 14.3a2 2 0 0 0-2.8 2.8l3 3 3-3a2 2 0 1 0-2.8-2.8l-.2.2z",
  ],
  flower: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5",
    "M12 7.5V9", "M7.5 12H9", "M16.5 12H15", "M12 16.5V15",
  ],
  pawPrint: [
    "M11 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M20 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M4 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z",
  ],
  plane: [
    "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  ],
  camera: [
    "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
    "M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  ],
  hand: [
    "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2",
    "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2",
    "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8",
    "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
  ],
  image: [
    "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z",
    "M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
  ],
};

/* Emoji → icon-name map. Covers every emoji in contentSchema.js
   plus common ones an admin might type in the CMS editor. */
const EMOJI_ICON_MAP = {
  "🏖️": "umbrella", "🏖": "umbrella", "⛱️": "umbrella", "🌴": "umbrella",
  "☕": "coffee", "🍵": "coffee",
  "✨": "sparkles", "⭐": "sparkle", "🌟": "sparkles", "💫": "sparkles",
  "💅": "sparkle",
  "⚡": "zap",
  "🧩": "puzzle",
  "🌊": "waves",
  "🌱": "sprout", "🌿": "sprout", "🪴": "sprout",
  "🤝": "handshake",
  "😵‍💫": "frown", "😵": "frown", "😫": "frown", "😩": "frown",
  "📋": "clipboard", "✅": "clipboard",
  "📝": "notebookPen", "✏️": "notebookPen",
  "💼": "briefcase",
  "💌": "mailHeart", "📧": "mailHeart", "✉️": "mailHeart",
  "🧘‍♀️": "flower", "🧘": "flower", "🧘‍♂️": "flower", "🌸": "flower",
  "🐕": "pawPrint", "🐶": "pawPrint", "🐾": "pawPrint",
  "✈️": "plane", "🛫": "plane",
  "📸": "camera", "📷": "camera",
  "👋": "hand",
  "🖼️": "image", "🖼": "image",
};

/* Filled brand glyphs (Simple Icons, CC0) for the trusted-by strip. */
const BRAND_PATHS = {
  asana: "M18.78 12.653c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.34 5.22-5.22-2.336-5.22-5.22-5.22zm-13.56 0c-2.88 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.336-5.22-5.22-5.22zm12-6.525c0 2.883-2.337 5.22-5.22 5.22-2.882 0-5.22-2.337-5.22-5.22 0-2.88 2.338-5.22 5.22-5.22 2.883 0 5.22 2.34 5.22 5.22z",
  notion: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z",
};

export function BrandGlyph({ brand, size = 16, color = "currentColor", style = {} }) {
  const d = BRAND_PATHS[brand];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle", ...style }} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* Match a trusted-by badge label to its brand glyph, if any. */
// eslint-disable-next-line react-refresh/only-export-components
export function brandForLabel(label) {
  const l = (label || "").toLowerCase();
  if (l.includes("asana")) return "asana";
  if (l.includes("notion")) return "notion";
  return null;
}

export function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.8, style = {} }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle", ...style }}
      aria-hidden="true"
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

/* Renders a stored emoji string as its mapped brand icon;
   falls back to the raw emoji when there's no mapping. */
export function EmojiIcon({ emoji, size = 20, color = "currentColor", strokeWidth = 1.8, style = {} }) {
  const name = EMOJI_ICON_MAP[(emoji || "").trim()];
  if (name) return <Icon name={name} size={size} color={color} strokeWidth={strokeWidth} style={style} />;
  if (!emoji) return null;
  return <span style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-block", ...style }}>{emoji}</span>;
}
