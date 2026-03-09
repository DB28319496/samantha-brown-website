import { useState, useEffect, useRef, useCallback } from "react";
import { useCMS } from "./cms/useContent";
import { useContent } from "./cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "./cms/EditableText";
import { EditableImage } from "./cms/EditableImage";
import { EditableSection } from "./cms/EditableSection";
import { EditableCardGroup } from "./cms/EditableCardGroup";
import { EditableBlockList } from "./cms/EditableBlockList";
import { EditorToolbar } from "./cms/EditorToolbar";
import { SelectionOverlay } from "./cms/SelectionOverlay";
import { PropertyPanel } from "./cms/PropertyPanel";
import { AdminLoginListener, AdminLoginModal } from "./cms/AdminAuth";

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

const C = {
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
const gridBgWhite    = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23FDFAF4'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23E2DDD4' stroke-width='0.7' fill='none' opacity='0.8'/%3E%3C/svg%3E")`;
const gridBgSand     = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23EEE9E2'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23C8C2B8' stroke-width='0.7' fill='none' opacity='0.85'/%3E%3C/svg%3E")`;
const gridBgOcean    = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23D8EBF9'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23555407' stroke-width='0.7' fill='none' opacity='0.22'/%3E%3C/svg%3E")`;
const gridBgLavender = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23EBF4FC'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23B8D0E8' stroke-width='0.7' fill='none' opacity='0.8'/%3E%3C/svg%3E")`;

/* ── Hooks ── */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const h = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useInView(threshold = 0.08) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
}

function FadeIn({ children, delay = 0, y = 28, style = {} }) {
  const [ref, v] = useInView(0.05);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : `translateY(${y}px)`, transition: `opacity 0.7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,.61,.36,1) ${delay}ms`, ...style }}>{children}</div>
  );
}

/* ── Animated Counter (counts up on scroll + repeats every 5s) ── */
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [ref, v] = useInView(0.1);
  const [count, setCount] = useState(0);
  const [tick, setTick] = useState(0);

  // Auto-replay every 5 seconds once in view
  useEffect(() => {
    if (!v) return;
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, [v]);

  useEffect(() => {
    if (!v) return;

    const endValue = parseFloat(end);
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(easeOut * endValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [v, tick, end, duration]);

  const formatted = end.toString().includes('+')
    ? `${Math.floor(count)}+`
    : end.toString().includes('%')
    ? `${Math.floor(count)}%`
    : end.toString().includes('.')
    ? count.toFixed(1)
    : Math.floor(count);

  return <div ref={ref}>{formatted}{suffix}</div>;
}

/* ── 3D Card Tilt Hook (premium hover effect) ── */
function use3DTilt() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return { ref, tilt, handleMouseMove, handleMouseLeave };
}

/* ── Text Reveal Animation ── */
function TextReveal({ children, delay = 0 }) {
  const [ref, v] = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(20px)",
      transition: `all 0.8s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
      willChange: "opacity, transform"
    }}>
      {children}
    </div>
  );
}

/* ── 3D Tilt Card Component ── */
function TiltCard({ children, style = {}, onClick }) {
  const { ref, tilt, handleMouseMove, handleMouseLeave } = use3DTilt();
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        willChange: "transform",
        ...style
      }}
    >
      {children}
    </div>
  );
}

/* ── Typewriter Animation (cycles through phrases) ── */
function TypewriterText({ phrases = [], speed = 80, deleteSpeed = 40, pauseDuration = 2000, style = {} }) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  useEffect(() => {
    if (!phrases.length) return;
    const current = phrases[phraseIndex];

    if (phase === "typing") {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
        return () => clearTimeout(t);
      }
      // Fully typed — pause before deleting
      const t = setTimeout(() => setPhase("deleting"), pauseDuration);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
        return () => clearTimeout(t);
      }
      // Fully deleted — move to next phrase
      setPhraseIndex((phraseIndex + 1) % phrases.length);
      setPhase("typing");
    }
  }, [text, phraseIndex, phase, phrases, speed, deleteSpeed, pauseDuration]);

  return (
    <span style={{ ...style }}>
      {text}<span className="typewriter-cursor" style={{ opacity: 1, animation: "blink 0.8s step-end infinite" }}>|</span>
    </span>
  );
}

/* ── Blinking Emoji (pulse animation) ── */
function BlinkEmoji({ emoji, size = 24, style = {} }) {
  return (
    <span style={{ fontSize: size, display: "inline-block", animation: "emojiPulse 2.5s ease-in-out infinite", ...style }}>
      {emoji}
    </span>
  );
}

/* ── Floating Tag (angled pill that hangs off image edges) ── */
const bubbleColorOptions = [
  { label: "white",  value: "#FFFFFF" },
  { label: "cream",  value: "#FDFAF4" },
  { label: "butter", value: "#F2E84B" },
  { label: "blue",   value: "#D8EBF9" },
  { label: "earth",  value: "#7A5C4E" },
  { label: "olive",  value: "#555407" },
  { label: "sand",   value: "#E2DDD4" },
  { label: "charcoal", value: "#2C2C28" },
];

function FloatingTag({ emoji, text, contentKey, index, field, style = {} }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const item = contentKey ? getContent(contentKey)?.[index] : null;
  const val = item?.[field] ?? text ?? "";
  const emojiVal = item?.emoji ?? emoji ?? "";
  const bgVal = item?.bg ?? style.background ?? C.white;

  const [editingEmoji, setEditingEmoji] = useState(false);
  const [emojiDraft, setEmojiDraft] = useState(emojiVal);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateField = (fields) => {
    if (!contentKey) return;
    const arr = getContent(contentKey) || [];
    const next = arr.map((it, i) => i === index ? { ...it, ...fields } : it);
    updateContent(contentKey, next);
  };

  const saveEmoji = () => { updateField({ emoji: emojiDraft }); setEditingEmoji(false); };

  // Text color: dark bg → white text, light bg → charcoal text
  const isDarkBg = ["#555407", "#2C2C28", "#7A5C4E"].includes(bgVal);
  const textColor = isDarkBg ? C.white : C.charcoal;
  const borderColor = isDarkBg ? "transparent" : C.sand;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: bgVal, borderRadius: 50,
        padding: "10px 18px",
        border: `1.5px solid ${borderColor}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 13,
        color: textColor, whiteSpace: "nowrap",
        ...style, background: bgVal,
      }}>
        {isEditing && contentKey ? (
          <>
            {editingEmoji ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  value={emojiDraft}
                  onChange={e => setEmojiDraft(e.target.value)}
                  onBlur={saveEmoji}
                  onKeyDown={e => e.key === "Enter" && saveEmoji()}
                  autoFocus
                  style={{ width: 36, fontSize: 16, border: "1px solid #ccc", borderRadius: 4, padding: "2px 4px", textAlign: "center" }}
                />
              </span>
            ) : (
              <span
                onClick={(e) => { e.stopPropagation(); setEmojiDraft(emojiVal); setEditingEmoji(true); }}
                title="Click to edit emoji"
                style={{ fontSize: 16, cursor: "pointer" }}
              >{emojiVal}</span>
            )}
            <EditableArrayText contentKey={contentKey} index={index} field={field} as="span" style={{ color: textColor }} />
            {/* Color picker toggle */}
            <span
              data-editor-panel
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(p => !p); }}
              title="Change bubble color"
              style={{ fontSize: 12, cursor: "pointer", opacity: 0.6, marginLeft: 2 }}
            >🎨</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 16 }}>{emojiVal}</span>
            <span style={{ color: textColor }}>{val}</span>
          </>
        )}
      </div>

      {/* Bubble color picker popover */}
      {showColorPicker && isEditing && (
        <div data-editor-panel style={{
          position: "absolute", top: "110%", left: 0, zIndex: 9999,
          background: "rgba(28,28,28,0.97)", backdropFilter: "blur(12px)",
          borderRadius: 12, padding: 10, display: "flex", gap: 6, flexWrap: "wrap",
          border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          width: 140,
        }}>
          {bubbleColorOptions.map(opt => (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); updateField({ bg: opt.value }); setShowColorPicker(false); }}
              title={opt.label}
              style={{
                width: 24, height: 24, borderRadius: "50%", background: opt.value,
                border: bgVal === opt.value ? "2px solid #3B82F6" : "1.5px solid rgba(255,255,255,0.2)",
                cursor: "pointer", flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Bubble Tag (pill with emoji + text) ── */
function BubbleTag({ emoji, text, bg = C.white, color = C.charcoal, style = {} }) {
  return (
    <span style={{
      fontFamily: "'Rubik', sans-serif",
      fontWeight: 600,
      fontSize: 13,
      color,
      background: bg,
      padding: "8px 18px",
      borderRadius: 50,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      border: `1.5px solid ${C.sand}`,
      whiteSpace: "nowrap",
      ...style,
    }}>
      <BlinkEmoji emoji={emoji} size={16} />{text}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   MARQUEE / INFINITE TICKER (CMS-editable text)
   ══════════════════════════════════════════════════════════════ */
function Marquee({ text, contentKey, bg = C.charcoal, color = C.sand, speed = 60 }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayText = contentKey ? (getContent(contentKey) || text) : text;
  const items = Array(8).fill(displayText);

  const openEdit = () => { setDraft(displayText); setEditing(true); };
  const saveEdit = () => {
    if (contentKey) updateContent(contentKey, draft);
    setEditing(false);
  };

  return (
    <div style={{ overflow: "hidden", background: bg, padding: "14px 0", whiteSpace: "nowrap", position: "relative", zIndex: 0 }}>
      <div style={{ display: "inline-flex", animation: `marquee ${speed}s linear infinite` }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 500, fontSize: 14, color, letterSpacing: "0.5px", textTransform: "lowercase", padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 32 }}>
            {t} <span style={{ color: C.butter, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
      <div style={{ display: "inline-flex", animation: `marquee ${speed}s linear infinite` }}>
        {items.map((t, i) => (
          <span key={`d-${i}`} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 500, fontSize: 14, color, letterSpacing: "0.5px", textTransform: "lowercase", padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 32 }}>
            {t} <span style={{ color: C.butter, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>

      {/* Edit button — admin only */}
      {isEditing && contentKey && (
        <button
          onClick={openEdit}
          data-editor-panel
          style={{
            position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", fontSize: 11, fontWeight: 600, fontFamily: "'Rubik', sans-serif",
            padding: "4px 12px", borderRadius: 20, cursor: "pointer", zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          ✏️ edit text
        </button>
      )}

      {/* Inline edit popup */}
      {editing && (
        <div data-editor-panel style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(28,28,28,0.97)", backdropFilter: "blur(16px)",
          borderRadius: 16, padding: 28, zIndex: 9999, width: "min(560px, 90vw)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Edit marquee text</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            style={{
              width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14,
              fontFamily: "'Rubik', sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
            Separate segments with · (middle dot)
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={saveEdit} style={{ flex: 1, background: C.olive, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCRIPT LABEL (brand: Georgia italic accent)
   ══════════════════════════════════════════════════════════════ */
function ScriptLabel({ children, color = C.olive, size = 20, style = {} }) {
  return (
    <span style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: size, color, fontWeight: 400, letterSpacing: "0.3px", display: "block", marginBottom: 8, ...style }}>{children}</span>
  );
}

/* ══════════════════════════════════════════════════════════════
   HORIZONTAL SCROLL CAROUSEL (PLM pattern)
   ══════════════════════════════════════════════════════════════ */
function HorizontalScroll({ children, gap = 20 }) {
  const ref = useRef(null);
  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} style={{
        display: "flex", gap, overflowX: "auto", scrollSnapType: "x proximity",
        padding: "8px 0 20px", scrollbarWidth: "thin", scrollbarColor: `${C.sand} transparent`,
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        willChange: "scroll-position"
      }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ══════════════════════════════════════════════════════════════ */
function Btn({ children, variant = "primary", onClick, style = {} }) {
  const btnRef = useRef(null);
  const [magnetic, setMagnetic] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 80;

    if (distance < maxDistance) {
      const strength = (1 - distance / maxDistance) * 0.3;
      setMagnetic({ x: x * strength, y: y * strength });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMagnetic({ x: 0, y: 0 });
  }, []);

  const base = { fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, border: "none", borderRadius: 100, padding: "13px 32px", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "1px", textTransform: "uppercase", position: "relative" };
  const v = {
    primary: { ...base, background: C.olive, color: C.cream, border: `2px solid ${C.olive}` },
    sand:    { ...base, background: C.sand, color: C.charcoal, border: `2px solid ${C.sand}` },
    outline: { ...base, background: "transparent", color: C.olive, border: `2px solid ${C.olive}` },
    ocean:   { ...base, background: C.olive, color: C.white, border: `2px solid ${C.olive}` },
    yellow:  { ...base, background: C.butter, color: C.charcoal, border: `2px solid ${C.butter}` },
    white:   { ...base, background: C.white, color: C.charcoal, border: `2px solid ${C.charcoal}` },
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={e => { e.currentTarget.style.transform = `translate(${magnetic.x}px, ${magnetic.y}px) translateY(-2px)`; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { handleMouseLeave(); e.currentTarget.style.transform = "translate(0, 0)"; e.currentTarget.style.boxShadow = "none"; }}
      style={{ ...v[variant], transform: `translate(${magnetic.x}px, ${magnetic.y}px)`, ...style }}>
      {children}
    </button>
  );
}

/* ── Editable Button (label + link destination in edit mode) ── */
function EditableBtn({ contentKey, variant = "primary", defaultLabel = "button", defaultLink = "contact", nav, style = {}, setPage }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const label = getContent(`${contentKey}.label`) ?? defaultLabel;
  const link = getContent(`${contentKey}.link`) ?? defaultLink;
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftLink, setDraftLink] = useState(link);

  const save = () => {
    updateContent(`${contentKey}.label`, draftLabel);
    updateContent(`${contentKey}.link`, draftLink);
    setEditing(false);
  };

  const handleClick = () => {
    if (isEditing) { setDraftLabel(label); setDraftLink(link); setEditing(true); return; }
    if (link.startsWith("http")) { window.open(link, "_blank", "noopener"); }
    else if (nav) { nav(link); }
  };

  const base = { fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, border: "none", borderRadius: 100, padding: "13px 32px", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "1px", textTransform: "uppercase" };
  const variants = {
    primary: { ...base, background: C.olive, color: C.cream, border: `2px solid ${C.olive}` },
    outline: { ...base, background: "transparent", color: C.olive, border: `2px solid ${C.olive}` },
    sand: { ...base, background: C.sand, color: C.charcoal, border: `2px solid ${C.sand}` },
    yellow: { ...base, background: C.butter, color: C.charcoal, border: `2px solid ${C.butter}` },
    ocean: { ...base, background: C.olive, color: C.white, border: `2px solid ${C.olive}` },
  };

  return (
    <>
      <button onClick={handleClick} style={{ ...variants[variant] || variants.primary, position: "relative", ...style }}>
        {label}
        {isEditing && (
          <span data-editor-panel style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "2px 6px", marginLeft: 4 }}>✏️</span>
        )}
      </button>
      {editing && (
        <div data-editor-panel style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(28,28,28,0.97)", backdropFilter: "blur(16px)", borderRadius: 16, padding: 24, zIndex: 9999, width: "min(440px, 90vw)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Edit button</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>LABEL</label>
            <input value={draftLabel} onChange={e => setDraftLabel(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: "'Rubik', sans-serif", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>LINK (page name or full URL)</label>
            <input value={draftLink} onChange={e => setDraftLink(e.target.value)} placeholder="services, contact, https://..." style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: "'Rubik', sans-serif", boxSizing: "border-box" }} />
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Use a page name (home, services, about, contact) or a full URL (https://...)</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} style={{ flex: 1, background: C.olive, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

function SectionWrap({ children, bg, bgImage, py = "80px", style = {}, sectionKey }) {
  const { getContent, updateContent, isEditing } = useCMS();

  // CMS-controlled background (overrides props when set)
  const bgType = sectionKey ? getContent(`style.section.${sectionKey}.bgType`) : null;
  const bgValue = sectionKey ? getContent(`style.section.${sectionKey}.bgValue`) : null;
  const bgOverlayOpacity = sectionKey ? (getContent(`style.section.${sectionKey}.bgOverlayOpacity`) ?? 0.85) : 0.85;

  const solidColorOptions = [
    { label: "cream", value: C.cream },
    { label: "charcoal", value: C.charcoal },
    { label: "sand", value: C.sand },
    { label: "olive", value: C.olive },
    { label: "butter", value: C.butter },
    { label: "blue", value: C.somethingBlue },
    { label: "earth", value: C.motherEarth },
  ];

  const gridOptions = [
    { label: "cream grid", value: "gridBgWhite" },
    { label: "sand grid", value: "gridBgSand" },
    { label: "blue grid", value: "gridBgOcean" },
  ];

  const gridMap = { gridBgWhite, gridBgSand, gridBgOcean };

  // Resolved background
  let resolvedBg = bgImage || bg || C.cream;

  if (bgType === "solid" && bgValue) resolvedBg = bgValue;
  else if (bgType === "grid" && bgValue) resolvedBg = gridMap[bgValue] || resolvedBg;
  else if (bgType === "image" && bgValue) {
    // Use CSS background-attachment for native parallax (degrades gracefully on mobile)
    resolvedBg = `url(${bgValue}) center / cover fixed`;
  }

  return (
    <section style={{ background: resolvedBg, padding: `${py} clamp(20px, 5vw, 56px)`, overflowX: "hidden", position: "relative", ...style }}>
      {/* Color overlay when image bg is set */}
      {bgType === "image" && bgValue && (
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: `rgba(253,250,244,${bgOverlayOpacity})`, pointerEvents: "none" }} />
      )}

      {/* Section background control — edit mode only */}
      {isEditing && sectionKey && (
        <SectionBgControl
          sectionKey={sectionKey}
          bgType={bgType}
          bgValue={bgValue}
          bgOverlayOpacity={bgOverlayOpacity}
          solidColorOptions={solidColorOptions}
          gridOptions={gridOptions}
          updateContent={updateContent}
        />
      )}

      <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}

function SectionBgControl({ sectionKey, bgType, bgValue, bgOverlayOpacity, solidColorOptions, gridOptions, updateContent }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  return (
    <div data-editor-panel style={{ position: "absolute", top: 8, right: 8, zIndex: 100 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "rgba(28,28,28,0.7)", color: "#fff", border: "none", cursor: "pointer", backdropFilter: "blur(8px)" }}
      >🎨 bg</button>
      {open && (
        <div style={{ position: "absolute", top: 30, right: 0, background: "rgba(28,28,28,0.97)", borderRadius: 12, padding: 16, zIndex: 200, width: 240, boxShadow: "0 16px 40px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Background</p>

          {/* Solid colors */}
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Solid Color</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {solidColorOptions.map(opt => (
              <button key={opt.value} title={opt.label} onClick={() => { updateContent(`style.section.${sectionKey}.bgType`, "solid"); updateContent(`style.section.${sectionKey}.bgValue`, opt.value); }} style={{ width: 24, height: 24, borderRadius: 6, background: opt.value, border: bgType === "solid" && bgValue === opt.value ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }} />
            ))}
          </div>

          {/* Grid patterns */}
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Grid Pattern</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {gridOptions.map(opt => (
              <button key={opt.value} onClick={() => { updateContent(`style.section.${sectionKey}.bgType`, "grid"); updateContent(`style.section.${sectionKey}.bgValue`, opt.value); }} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: bgType === "grid" && bgValue === opt.value ? "#fff" : "rgba(255,255,255,0.1)", color: bgType === "grid" && bgValue === opt.value ? "#000" : "rgba(255,255,255,0.7)", border: "none", cursor: "pointer" }}>{opt.label}</button>
            ))}
          </div>

          {/* Image parallax upload */}
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Image Parallax</p>
          <label style={{ display: "block", fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 600, color: bgType === "image" ? C.butter : "rgba(255,255,255,0.7)", background: bgType === "image" ? `${C.butter}20` : "rgba(255,255,255,0.08)", border: bgType === "image" ? `1px solid ${C.butter}40` : "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", cursor: uploading ? "wait" : "pointer", textAlign: "center", marginBottom: bgType === "image" ? 8 : 0 }}>
            {uploading ? "Uploading…" : bgType === "image" ? "✓ image set (click to change)" : "Upload image"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setUploading(true);
              try {
                const { uploadImage } = await import("./supabase/storage");
                const url = await uploadImage(file, `section.bg.${sectionKey}`);
                updateContent(`style.section.${sectionKey}.bgType`, "image");
                updateContent(`style.section.${sectionKey}.bgValue`, url);
              } catch (err) { alert("Upload failed: " + err.message); }
              finally { setUploading(false); e.target.value = ""; }
            }} />
          </label>

          {/* Overlay opacity when image set */}
          {bgType === "image" && bgValue && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>Overlay</span>
              <input type="range" min={0} max={1} step={0.05} value={bgOverlayOpacity} onChange={e => updateContent(`style.section.${sectionKey}.bgOverlayOpacity`, parseFloat(e.target.value))} style={{ flex: 1, accentColor: C.butter }} />
              <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.5)", minWidth: 28 }}>{Math.round(bgOverlayOpacity * 100)}%</span>
            </div>
          )}

          {/* Reset */}
          <button onClick={() => { updateContent(`style.section.${sectionKey}.bgType`, null); updateContent(`style.section.${sectionKey}.bgValue`, null); setOpen(false); }} style={{ width: "100%", marginTop: 4, fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", textAlign: "center", padding: "4px 0" }}>reset to default</button>
        </div>
      )}
    </div>
  );
}

// Process step brand colors (alternating angles: odd = left tilt, even = right tilt)
const stepBrandColors = [C.butter, C.motherEarth, C.somethingBlue, C.olive, C.butter];
const stepTextColors = [C.charcoal, C.white, C.charcoal, C.white, C.charcoal];
const stepRotations = [-8, 6, -10, 7, -9]; // alternating left / right

// Brand star SVG (4-pointed, filled) used as bullet/icon across all pages
function BrandStar({ size = 16, color = C.olive, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...style }}>
      <path d="M12 2 L13.8 9.2 L21 12 L13.8 14.8 L12 22 L10.2 14.8 L3 12 L10.2 9.2 Z" />
    </svg>
  );
}

function ProcessStep({ num, text, total }) {
  const idx = (num - 1) % stepBrandColors.length;
  const bgColor = stepBrandColors[idx];
  const textColor = stepTextColors[idx];
  const rotation = stepRotations[idx];
  const isLast = num === total;

  return (
    <div style={{ padding: "28px 0 20px", position: "relative" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: textColor,
          flexShrink: 0,
          transform: `rotate(${rotation}deg)`,
          boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
        }}>
          {String(num).padStart(2, "0")}
        </div>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, margin: 0 }}>{text}</p>
      </div>
      {!isLast && (
        <div style={{ height: 2, background: C.sand, opacity: 0.6, marginTop: 24, borderRadius: 2 }} />
      )}
    </div>
  );
}

function FAQAccordion({ faqs, contentKey }) {
  const { update, isEditing } = useContent(contentKey || "__none__");
  const [openIndex, setOpenIndex] = useState(null);

  const addFaq = () => {
    const next = [...faqs, { q: "New question?", a: "Answer here..." }];
    update(next);
  };

  const deleteFaq = (idx) => {
    const next = faqs.filter((_, i) => i !== idx);
    update(next);
  };

  return (
    <div>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${C.sand}`, position: "relative" }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                padding: "20px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 15, color: C.charcoal, lineHeight: 1.4 }}>
                {contentKey ? <EditableArrayText contentKey={contentKey} index={i} field="q" as="span" /> : faq.q}
              </span>
              <span style={{
                fontFamily: "system-ui",
                fontSize: 20,
                color: C.olive,
                flexShrink: 0,
                transition: "transform 0.3s",
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
              }}>+</span>
            </button>
            <div style={{
              maxHeight: isOpen ? 300 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s ease",
            }}>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.7, margin: "0 0 20px", paddingRight: 40 }}>
                {contentKey ? <EditableArrayText contentKey={contentKey} index={i} field="a" as="span" /> : faq.a}
              </p>
            </div>
            {isEditing && contentKey && (
              <button
                data-editor-panel
                onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this FAQ?")) deleteFaq(i); }}
                style={{
                  position: "absolute", top: 18, right: 40,
                  background: `${C.charcoal}18`, border: `1px solid ${C.charcoal}40`,
                  color: C.charcoal, fontSize: 11, fontWeight: 600,
                  fontFamily: "'Rubik', sans-serif", padding: "3px 10px",
                  borderRadius: 20, cursor: "pointer",
                }}
              >✕ delete</button>
            )}
          </div>
        );
      })}
      {isEditing && contentKey && (
        <button
          data-editor-panel
          onClick={addFaq}
          style={{
            marginTop: 16, width: "100%", padding: "12px",
            background: `${C.olive}08`, border: `2px dashed ${C.olive}40`,
            borderRadius: 10, fontFamily: "'Rubik', sans-serif",
            fontSize: 13, fontWeight: 600, color: C.olive,
            cursor: "pointer",
          }}
        >+ add FAQ</button>
      )}
    </div>
  );
}

/* ── Editable tag list (feature tags, timeline items) with add/delete in edit mode ── */
function EditableTagList({ contentKey, items = [], tagBg = C.butter, tagColor = C.charcoal }) {
  const { update, isEditing } = useContent(contentKey);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const deleteTag = (idx) => {
    update(items.filter((_, i) => i !== idx));
  };

  const addTag = () => {
    if (!newTag.trim()) { setAdding(false); return; }
    update([...items, newTag.trim()]);
    setNewTag("");
    setAdding(false);
  };

  if (items.length === 0 && !isEditing) return null;

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
      {items.map((t, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, background: tagBg, color: tagColor, padding: "5px 16px", borderRadius: 50, position: "relative" }}>
          <EditableArrayString contentKey={contentKey} index={i} as="span" />
          {isEditing && (
            <button onClick={() => deleteTag(i)} style={{ background: "none", border: "none", cursor: "pointer", color: tagColor, fontSize: 12, padding: 0, lineHeight: 1, opacity: 0.6 }}>✕</button>
          )}
        </span>
      ))}
      {isEditing && (
        adding ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addTag(); if (e.key === "Escape") { setAdding(false); setNewTag(""); } }}
              placeholder="tag text..."
              autoFocus
              style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.olive}`, outline: "none", width: 120 }}
            />
            <button onClick={addTag} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 700, background: C.olive, color: "#fff", border: "none", borderRadius: 20, padding: "4px 10px", cursor: "pointer" }}>add</button>
          </span>
        ) : (
          <button onClick={() => setAdding(true)} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 600, color: C.olive, background: `${C.olive}10`, border: `1px dashed ${C.olive}60`, borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>+ tag</button>
        )
      )}
    </div>
  );
}

function TwoColFit({ perfect, notFit }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}`, height: "100%" }}>
        <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 16px" }}>perfect if you:</h4>
        {perfect.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}><BrandStar size={14} color={C.olive} style={{ marginTop: 2 }} />{p}</div>)}
      </div>
      <div style={{ background: C.cream, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}`, height: "100%" }}>
        <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 16px" }}>not a fit if you:</h4>
        {notFit.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.warmTan, lineHeight: 1.55 }}><span style={{ flexShrink: 0, color: C.warmTan }}>—</span>{p}</div>)}
      </div>
    </div>
  );
}

function PullQuote({ quote, author, bg = C.charcoal }) {
  return (
    <FadeIn>
      <div style={{ background: bg, borderRadius: 20, padding: "clamp(36px, 5vw, 56px)", textAlign: "center", margin: "0 auto", maxWidth: 800 }}>
        <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "clamp(24px, 3.5vw, 36px)", color: C.sand, lineHeight: 1.4, margin: "0 0 14px" }}>"{quote}"</p>
        {author && <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: `${C.sand}88`, margin: 0 }}>— {author}</p>}
      </div>
    </FadeIn>
  );
}

/* ── Social Proof — parallax-style scroll-in with uploadable logos ── */
function SocialProof() {
  const { getContent, updateContent, isEditing } = useCMS();
  const badges = getContent("home.socialProof.badges") || [];
  const images = getContent("home.socialProof.images") || [];
  const [ref, inView] = useInView(0.1);
  const scrollY = useScrollY();
  const sectionRef = useRef(null);

  let parallaxOffset = 0;
  if (sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.top < viewH && rect.bottom > 0) {
      parallaxOffset = (viewH / 2 - rect.top) * 0.04;
    }
  }

  const removeImage = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    updateContent("home.socialProof.images", next);
  };

  return (
    <div ref={sectionRef} style={{ textAlign: "center", padding: "56px 0" }}>
      <div ref={ref}>
        <h2 style={{
          fontFamily: "'Rubik', sans-serif", fontWeight: 900,
          fontSize: "clamp(28px, 4vw, 48px)", color: C.charcoal,
          letterSpacing: "-0.5px", marginBottom: 6,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s cubic-bezier(.22,.61,.36,1)",
        }}>
          <EditableText contentKey="home.socialProof.label" as="span" />
        </h2>
        <div style={{
          width: 64, height: 4, background: C.butter, borderRadius: 2,
          margin: "0 auto 48px",
          opacity: inView ? 1 : 0,
          transition: "opacity 0.7s 0.2s",
        }} />

        {/* Logo/image grid — parallax on scroll */}
        {images.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: "clamp(24px, 4vw, 56px)", flexWrap: "wrap", marginBottom: 40,
            transform: `translateY(${parallaxOffset}px)`,
            transition: "transform 0.1s linear",
          }}>
            {images.map((imgUrl, i) => (
              <div key={i} style={{
                position: "relative",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0) scale(1)" : "translateY(40px) scale(0.85)",
                transition: `all 0.7s cubic-bezier(.22,.61,.36,1) ${0.1 + i * 0.12}s`,
              }}>
                <img
                  src={imgUrl}
                  alt={`certification ${i + 1}`}
                  style={{
                    height: "clamp(56px, 8vw, 96px)",
                    maxWidth: 180,
                    objectFit: "contain",
                    filter: "grayscale(20%)",
                    transition: "filter 0.3s, transform 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = "grayscale(0%)"; e.currentTarget.style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = "grayscale(20%)"; e.currentTarget.style.transform = "scale(1)"; }}
                />
                {isEditing && (
                  <button
                    data-editor-panel
                    onClick={() => removeImage(i)}
                    style={{
                      position: "absolute", top: -8, right: -8,
                      width: 22, height: 22, borderRadius: "50%",
                      background: C.charcoal, border: "none",
                      color: C.white, fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Rubik', sans-serif", fontWeight: 700,
                    }}
                  >✕</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload button in edit mode */}
        {isEditing && images.length < 6 && (
          <div data-editor-panel style={{ marginBottom: 32 }}>
            <label style={{
              display: "inline-block",
              fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
              color: C.olive, background: `${C.olive}08`,
              border: `2px dashed ${C.olive}40`,
              borderRadius: 10, padding: "10px 24px", cursor: "pointer",
            }}>
              + upload certification logo ({images.length}/6)
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const { uploadImage } = await import("./supabase/storage");
                    const url = await uploadImage(file, `socialProof.image.${Date.now()}`);
                    const next = [...images, url];
                    updateContent("home.socialProof.images", next);
                  } catch (err) {
                    alert("Upload failed: " + err.message);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        {/* Text badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {badges.map((badge, i) => {
            const badgeBgs = [C.butter, C.somethingBlue, `${C.motherEarth}30`, `${C.motherEarth}20`, C.sand];
            return (
              <div key={i} style={{
                fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 700,
                color: C.charcoal, background: badgeBgs[i % badgeBgs.length],
                padding: "12px 24px", borderRadius: 50,
                border: `1.5px solid ${C.sand}`,
                transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
                transitionDelay: `${0.3 + i * 0.1}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
                <EditableArrayString contentKey="home.socialProof.badges" index={i} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Testimonial Carousel (bubble card + left/right overlapping arrows) ── */
function TestimonialCarousel() {
  const { getContent } = useCMS();
  const [current, setCurrent] = useState(0);
  const testimonials = getContent("home.testimonials") || [];
  const bubbleBg = C.motherEarth;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const goPrev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const goNext = () => setCurrent((prev) => (prev + 1) % testimonials.length);

  const arrowBtn = (dir, onClick) => (
    <button onClick={onClick} style={{
      width: 48, height: 48, borderRadius: "50%", background: C.charcoal,
      border: `2px solid ${C.white}`, cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center", color: C.white, fontSize: 20,
      boxShadow: "0 4px 16px rgba(44,44,40,0.25)",
      transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      flexShrink: 0, zIndex: 2,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.background = C.olive; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = C.charcoal; }}
    aria-label={dir === "prev" ? "Previous testimonial" : "Next testimonial"}>
      {dir === "prev" ? "←" : "→"}
    </button>
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Arrows overlap the card on each side */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ flexShrink: 0, marginRight: -24, zIndex: 2 }}>{arrowBtn("prev", goPrev)}</div>

        {/* Bubble card */}
        <div style={{
          flex: 1, background: bubbleBg, borderRadius: 28,
          padding: "clamp(32px, 5vw, 48px) clamp(48px, 6vw, 64px)",
          position: "relative", overflow: "hidden", minHeight: 240,
        }}>
          <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3.5vw, 34px)", color: "#fff", margin: "0 0 6px", lineHeight: 1.15, textTransform: "lowercase" }}>
            <EditableText contentKey="home.testimonials.heading" as="span" style={{ color: "inherit" }} />
          </h3>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 24px" }}>
            <EditableText contentKey="home.testimonials.scriptLabel" as="span" style={{ color: "inherit" }} />
          </p>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? 20 : 8, height: 8, borderRadius: 4,
                background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s",
              }} />
            ))}
          </div>

          <div style={{ position: "relative", minHeight: 120 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                position: i === 0 ? "relative" : "absolute",
                top: 0, left: 0, width: "100%",
                opacity: current === i ? 1 : 0,
                transform: current === i ? "translateY(0)" : "translateY(16px)",
                transition: "all 0.6s cubic-bezier(.22,.61,.36,1)",
                pointerEvents: current === i ? "auto" : "none",
              }}>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: "clamp(14px, 1.6vw, 16px)", color: "#fff", lineHeight: 1.75, margin: "0 0 20px" }}>{t.text}</p>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>— {t.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0, marginLeft: -24, zIndex: 2 }}>{arrowBtn("next", goNext)}</div>
      </div>
    </div>
  );
}

/* ── Testimonial Section (parallax background + bubble carousel) ── */
function TestimonialSection({ scrollY }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const sectionRef = useRef(null);
  const bgUrl = getContent("image.home.testimonials.bg");
  const bgOpacity = getContent("style.home.testimonials.bgOpacity") ?? 0.82;
  const fitMode = getContent("style.image.home.testimonials.bg.objectFit") || "cover";
  const fitPosition = getContent("style.image.home.testimonials.bg.objectPosition") || "center";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  let parallaxOffset = 0;
  if (!isMobile && sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.top < viewH && rect.bottom > 0) {
      parallaxOffset = (viewH - rect.top) * 0.08;
    }
  }

  return (
    <section ref={sectionRef} style={{
      position: "relative", overflow: "hidden",
      padding: "clamp(56px, 8vw, 80px) clamp(20px, 5vw, 56px)",
      background: bgUrl ? "transparent" : gridBgSand,
      backgroundColor: bgUrl ? C.charcoal : undefined,
    }}>
      {/* Parallax background image — uses <img> so objectFit/objectPosition work */}
      {bgUrl && (
        <>
          <img
            src={bgUrl}
            alt=""
            style={{
              position: "absolute", top: "-40px", left: 0, right: 0,
              width: "100%", height: "calc(100% + 80px)",
              objectFit: fitMode, objectPosition: fitPosition,
              zIndex: 0,
              transform: isMobile ? "none" : `translateY(${parallaxOffset}px)`,
              willChange: isMobile ? "auto" : "transform",
              display: "block",
            }}
          />
          <div style={{ position: "absolute", inset: 0, zIndex: 0, background: `rgba(250,247,242,${bgOpacity})` }} />
        </>
      )}

      {/* Admin controls — compact toolbar at top */}
      {isEditing && (
        <div data-editor-panel style={{ position: "relative", zIndex: 10, marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Upload / change BG button */}
          <div style={{ flexShrink: 0 }}>
            <EditableImage
              contentKey="image.home.testimonials.bg"
              placeholderEmoji="🖼️"
              placeholderLabel="upload parallax background"
              placeholderHeight={48}
              placeholderBg="rgba(221,208,190,0.5)"
              placeholderRadius={8}
              style={{ maxWidth: bgUrl ? 120 : 240, height: 48 }}
            />
          </div>
          {/* Transparency slider — only when bg is set */}
          {bgUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "6px 14px" }}>
              <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "#fff", whiteSpace: "nowrap" }}>Overlay opacity</span>
              <input
                type="range" min={0} max={1} step={0.05}
                value={bgOpacity}
                onChange={(e) => updateContent("style.home.testimonials.bgOpacity", parseFloat(e.target.value))}
                style={{ width: 80, accentColor: C.butter }}
              />
              <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "#fff", minWidth: 28 }}>{Math.round(bgOpacity * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <FadeIn>
          <TestimonialCarousel />
        </FadeIn>
      </div>
    </section>
  );
}

function NewsletterForm() {
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="flodesk"]');
    if (!existingScript) {
      (function(w, d, t, h, s, n) {
        w.FlodeskObject = n;
        var fn = function() { (w[n].q = w[n].q || []).push(arguments); };
        w[n] = w[n] || fn;
        var f = d.getElementsByTagName(t)[0];
        var v = '?v=' + Math.floor(new Date().getTime() / (120 * 1000)) * 60;
        var sm = d.createElement(t);
        sm.async = true; sm.type = 'module';
        sm.src = h + s + '.mjs' + v;
        f.parentNode.insertBefore(sm, f);
        var sn = d.createElement(t);
        sn.async = true; sn.noModule = true;
        sn.src = h + s + '.js' + v;
        f.parentNode.insertBefore(sn, f);
      })(window, document, 'script', 'https://assets.flodesk.com', '/universal', 'fd');
    }
    window.fd('form', {
      formId: '69a492cf680779e5364b6ffe',
      containerEl: '#fd-form-69a492cf680779e5364b6ffe'
    });
  }, []);

  return <div id="fd-form-69a492cf680779e5364b6ffe" />;
}

/* ── Nav button with hover effect ── */
function NavBtn({ label, isActive, disabled, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Rubik', sans-serif",
        fontWeight: isActive ? 600 : 400,
        fontSize: 14,
        color: hovered ? C.olive : C.charcoal,
        background: "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: "6px 2px",
        borderBottom: isActive ? `2px solid ${C.olive}` : hovered ? `2px solid ${C.butter}` : "2px solid transparent",
        transition: "color 0.2s, border-color 0.2s",
        letterSpacing: "0.2px",
        opacity: disabled ? 0.5 : 1,
      }}
    >{label}</button>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════════ */
function Nav({ page, setPage, scrollY, isEditing }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = scrollY > 50;

  const isServicesPage = page === "services" || page === "audit" || page === "implementation" || page === "fractional" || page === "corporate";
  const go = (p) => { if (isEditing) return; setPage(p); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const navBtn = (label, target) => {
    const isActive = target === "services" ? isServicesPage : page === target;
    return (
      <NavBtn key={target} label={label} isActive={isActive} disabled={isEditing} onClick={() => go(target)} />
    );
  };

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(250,247,242,0.8)" : "transparent",
      backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      borderBottom: scrolled ? `1px solid rgba(221, 208, 190, 0.3)` : "none",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.04)" : "none",
      transition: "all 0.4s cubic-bezier(.22,.61,.36,1)",
      padding: "0 clamp(16px, 4vw, 48px)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? 56 : 66, transition: "height 0.3s" }}>
        <button onClick={() => go("home")} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 17, color: C.charcoal, background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.3px" }}><EditableText contentKey="global.siteName" as="span" /></button>

        <nav style={{ display: "flex", gap: 28, alignItems: "center" }} className="dsk-nav">
          {navBtn("home", "home")}
          {navBtn("services", "services")}
          {navBtn("about", "about")}
          {navBtn("resources", "resources")}
          <Btn variant="ocean" onClick={() => go("contact")} style={{ padding: "10px 24px", fontSize: 13 }}>work with me</Btn>
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mob-toggle" style={{ display: "none", background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.charcoal }}>{menuOpen ? "✕" : "☰"}</button>
      </div>

      {menuOpen && (
        <div className="mob-menu" style={{ background: C.cream, padding: "12px 20px 24px", borderTop: `1px solid ${C.sand}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {[["home", "home"], ["services", "services"], ["about", "about"], ["resources", "resources"], ["contact", "work with me"]].map(([k, l]) => (
            <button key={k} onClick={() => go(k)} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.charcoal, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "8px 0", fontWeight: page === k ? 700 : 400 }}>{l}</button>
          ))}
        </div>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════ */
function Footer({ setPage, isEditing }) {
  const go = (p) => { if (isEditing) return; setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <footer style={{ background: C.charcoal, padding: "56px clamp(20px, 5vw, 48px) 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.cream, marginBottom: 8 }}><EditableText contentKey="global.siteName" as="span" /></div>
          <ScriptLabel color={C.sand} size={18} style={{ marginBottom: 0 }}><EditableText contentKey="footer.tagline" as="span" /></ScriptLabel>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, color: C.sand, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>explore</span>
          {[["work with me", "services"], ["the cabana club", "resources"], ["about", "about"], ["contact", "contact"]].map(([l, p]) => (
            <button key={p} onClick={() => go(p)} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: `${C.sand}bb`, background: "none", border: "none", cursor: "pointer", padding: "3px 0", textAlign: "left" }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, color: C.sand, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>connect</span>
          <a href="#" style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: `${C.sand}bb`, textDecoration: "none", padding: "3px 0" }}>linkedin</a>
          <a href="#" style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: `${C.sand}bb`, textDecoration: "none", padding: "3px 0" }}>instagram</a>
          <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: `${C.sand}77`, padding: "3px 0" }}>sam@bysamanthabrown.com</span>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.warmTan}22`, paddingTop: 20, textAlign: "center" }}>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: `${C.sand}55` }}><EditableText contentKey="global.copyright" as="span" /></p>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ══════════════════════════════════════════════════════════════ */
function BackToTop({ scrollY }) {
  const [isHovered, setIsHovered] = useState(false);
  const visible = scrollY > 500;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: C.charcoal,
        border: `2px solid ${C.cream}`,
        color: C.cream,
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(44,44,40,0.25)",
        opacity: visible ? 1 : 0,
        transform: visible ? (isHovered ? "translateY(-4px) scale(1.05)" : "translateY(0)") : "translateY(20px)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 999
      }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROBLEM SECTION — "The loop you're in" with JS parallax bg
   ══════════════════════════════════════════════════════════════ */
function ProblemSection() {
  const { getContent, updateContent, isEditing } = useCMS();
  const sectionRef = useRef(null);
  const [bgY, setBgY] = useState(0);

  const bgType  = getContent("style.section.home.problem.bgType");
  const bgValue = getContent("style.section.home.problem.bgValue");
  const bgOverlayOpacity = getContent("style.section.home.problem.bgOverlayOpacity") ?? 0.72;
  const hasParallaxImg = bgType === "image" && bgValue;

  useEffect(() => {
    if (!hasParallaxImg) return;
    const el = sectionRef.current;
    const update = () => {
      if (!el) return;
      if (window.innerWidth < 768) { setBgY(0); return; }
      const rect = el.getBoundingClientRect();
      setBgY((rect.top + rect.height / 2 - window.innerHeight / 2) * 0.25);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [hasParallaxImg]);

  const points = getContent("home.problem.points") || [];

  // Resolve non-image backgrounds
  const gridMap = { gridBgWhite, gridBgSand, gridBgOcean };
  let sectionBg = C.charcoal;
  if (bgType === "solid" && bgValue) sectionBg = bgValue;
  else if (bgType === "grid" && bgValue) sectionBg = gridMap[bgValue] || C.charcoal;

  const solidColorOptions = [
    { label: "charcoal", value: C.charcoal },
    { label: "cream",    value: C.cream    },
    { label: "sand",     value: C.sand     },
    { label: "olive",    value: C.olive    },
    { label: "butter",   value: C.butter   },
    { label: "blue",     value: C.somethingBlue },
    { label: "earth",    value: C.motherEarth   },
  ];
  const gridOptions = [
    { label: "cream grid", value: "gridBgWhite" },
    { label: "sand grid",  value: "gridBgSand"  },
    { label: "blue grid",  value: "gridBgOcean" },
  ];

  // Text colors depend on whether bg is light or dark
  const lightBgs = [C.cream, C.sand, C.somethingBlue, C.butter, "#FFFFFF", gridBgWhite, gridBgSand, gridBgOcean];
  const isLight = !hasParallaxImg && lightBgs.some(lb => sectionBg === lb || (typeof sectionBg === "string" && sectionBg.includes(lb.replace("#", ""))));
  const headingColor   = isLight ? C.charcoal : C.cream;
  const bodyColor      = isLight ? C.body     : `${C.sand}e0`;
  const accentColor    = isLight ? C.olive    : C.butter;
  const borderColor    = isLight ? `${C.sand}` : "rgba(255,255,255,0.1)";
  const cardBg         = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const dividerColor   = isLight ? C.sand : "rgba(255,255,255,0.12)";

  return (
    <EditableSection contentKey="visibility.home.problem">
      <section ref={sectionRef} style={{ position: "relative", overflowX: "hidden", padding: "clamp(64px, 8vw, 96px) clamp(20px, 5vw, 56px)" }}>

        {/* Parallax image background */}
        {hasParallaxImg ? (
          <>
            <img src={bgValue} alt="" style={{
              position: "absolute", top: -60, left: 0, right: 0,
              width: "100%", height: "calc(100% + 120px)",
              objectFit: "cover", objectPosition: "center",
              transform: `translateY(${bgY}px)`,
              zIndex: 0, display: "block",
            }} />
            <div style={{ position: "absolute", inset: 0, background: `rgba(28,28,28,${bgOverlayOpacity})`, zIndex: 1 }} />
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: sectionBg, zIndex: 0 }} />
        )}

        {/* Background control (edit mode) */}
        {isEditing && (
          <SectionBgControl
            sectionKey="home.problem"
            bgType={bgType}
            bgValue={bgValue}
            bgOverlayOpacity={bgOverlayOpacity}
            solidColorOptions={solidColorOptions}
            gridOptions={gridOptions}
            updateContent={updateContent}
          />
        )}

        {/* Content */}
        <FadeIn>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto" }}>

            <ScriptLabel color={accentColor} size={22} style={{ textAlign: "center" }}>
              <EditableText contentKey="home.problem.scriptLabel" as="span" />
            </ScriptLabel>

            <h2 style={{
              fontFamily: "'Rubik', sans-serif", fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 52px)", color: headingColor,
              margin: "0 0 44px", textAlign: "center", lineHeight: 1.1,
            }}>
              <EditableText contentKey="home.problem.heading" as="span" />
            </h2>

            {/* Bullet list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
              {points.map((point, i) => (
                <div key={i} style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "16px 22px",
                  background: cardBg, borderRadius: 14,
                  border: `1px solid ${borderColor}`,
                }}>
                  <span style={{ color: accentColor, fontWeight: 700, fontSize: 18, flexShrink: 0, lineHeight: 1.65 }}>✕</span>
                  <p style={{
                    fontFamily: "'Rubik', sans-serif",
                    fontSize: "clamp(14px, 1.8vw, 16px)",
                    color: bodyColor, lineHeight: 1.7, margin: 0,
                  }}>
                    <EditableArrayString contentKey="home.problem.points" index={i} />
                  </p>
                </div>
              ))}
            </div>

            {/* Punchline */}
            <div style={{ textAlign: "center", borderTop: `1px solid ${dividerColor}`, paddingTop: 36 }}>
              <p style={{
                fontFamily: "'Georgia', serif", fontStyle: "italic",
                fontSize: "clamp(18px, 2.5vw, 24px)", color: accentColor,
                lineHeight: 1.5, margin: 0,
              }}>
                <EditableText contentKey="home.problem.punchline" as="span" />
              </p>
            </div>

          </div>
        </FadeIn>
      </section>
    </EditableSection>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: HOME
   ══════════════════════════════════════════════════════════════ */
function HomePage({ setPage }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  const [loaded, setLoaded] = useState(false);
  const scrollY = useScrollY();
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const parallaxY = isMobile ? 0 : Math.min(scrollY * 0.15, 150);

  const defaultOrder = ["hero", "marquee", "welcome", "problem", "coreValues", "systems", "pathCards", "stats", "socialProof", "testimonials", "newsletter", "closing", "closingMarquee"];
  const sectionOrder = getContent("home.sectionOrder") || defaultOrder;

  const moveSection = (from, to) => {
    if (to < 0 || to >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateContent("home.sectionOrder", next);
  };

  const sectionLabels = {
    hero: "Hero", marquee: "Marquee", welcome: "Welcome", coreValues: "Core Values",
    problem: "Problem", systems: "Systems", pathCards: "Path Cards", stats: "Stats",
    socialProof: "Social Proof", testimonials: "Testimonials", newsletter: "Newsletter",
    closing: "Closing CTA", closingMarquee: "Marquee",
  };

  const sectionDefs = {
    hero: () => {
      const heroColor = getContent("style.home.hero.heading.color");
      const useOmbre = getContent("style.home.hero.heading.useOmbre") !== false;
      const headingGradient = "linear-gradient(135deg, #2C2C28 0%, #555407 45%, #7A5C4E 100%)";
      return (
        <section className="hero-section" style={{ minHeight: "100svh", display: "flex", alignItems: "center", background: gridBgWhite, padding: "clamp(88px, 12vw, 112px) clamp(20px, 5vw, 56px) clamp(60px, 8vw, 80px)", position: "relative", overflowX: "hidden", zIndex: 2 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(85,84,7,0.04) 0%, rgba(216,235,249,0.06) 50%, rgba(242,232,75,0.04) 100%)", backgroundSize: "200% 200%", animation: "gradientShift 15s ease infinite", zIndex: 0, pointerEvents: "none" }} />

          <div style={{ maxWidth: 1140, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 6vw, 72px)", alignItems: "center", position: "relative", zIndex: 1, transform: `translate3d(0, ${parallaxY}px, 0)`, willChange: "transform" }} className="hero-two-col">

            {/* LEFT COLUMN: image + floating tags */}
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateX(-32px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.1s", position: "relative" }}>
              {/* Rounded image */}
              <div className="hero-img-wrap" style={{ borderRadius: 28, overflow: "hidden", position: "relative", aspectRatio: "4/5", maxHeight: 580 }}>
                <EditableImage contentKey="image.home.hero" alt="samantha brown" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", borderRadius: 28 }} placeholderEmoji="📸" placeholderLabel="upload your photo" placeholderHeight={520} placeholderBg={C.sandLight} placeholderRadius={28} />
              </div>

              {/* Floating tags — angled, hanging off image edges */}
              {/* index 0: feel-good systems — far left (75% off image, 25% on), opposite angle */}
              <div className="hero-float-tag hero-float-tag-0" style={{ position: "absolute", top: "42%", left: -100, transform: "rotate(5deg)", zIndex: 10 }}>
                <FloatingTag contentKey="home.hero.bubbleTags" index={0} field="text" style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }} />
              </div>
              {/* index 1: life-first business — top right */}
              <div className="hero-float-tag hero-float-tag-1" style={{ position: "absolute", top: "10%", right: -28, transform: "rotate(-8deg)", zIndex: 10 }}>
                <FloatingTag contentKey="home.hero.bubbleTags" index={1} field="text" style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }} />
              </div>
              {/* index 2: built with intention — hanging off the bottom edge */}
              <div className="hero-float-tag hero-float-tag-2" style={{ position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%) rotate(-4deg)", zIndex: 10 }}>
                <FloatingTag contentKey="home.hero.bubbleTags" index={2} field="text" style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }} />
              </div>
            </div>

            {/* RIGHT COLUMN: text — slightly overlapping image */}
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateX(32px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.2s", marginLeft: "clamp(-24px, -3vw, -48px)", textAlign: "left" }}>
              <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.7s 0.3s" }}>
                <h1 style={{
                  fontFamily: "'Rubik', sans-serif", fontWeight: 700,
                  fontSize: "clamp(32px, 5vw, 64px)",
                  ...(heroColor ? { color: heroColor } : (useOmbre ? {
                    background: headingGradient, backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", animation: "gradientText 8s ease infinite",
                  } : { color: C.charcoal })),
                  lineHeight: 1.15, margin: "0 0 20px", textTransform: "lowercase", letterSpacing: "-1px",
                }}>
                  <EditableText contentKey="home.hero.heading" as="span" style={{ background: "inherit", WebkitBackgroundClip: "inherit", WebkitTextFillColor: "inherit", backgroundClip: "inherit" }} />
                </h1>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,.61,.36,1) 0.35s", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "clamp(18px, 2.2vw, 24px)", color: C.olive, minHeight: 32 }}>
                  <TypewriterText phrases={getContent("home.hero.typewriterPhrases") || ["systems that scale", "revenue that grows", "a life you actually enjoy"]} speed={70} deleteSpeed={35} pauseDuration={2200} />
                </p>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,.61,.36,1) 0.45s" }}>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: "clamp(14px, 1.5vw, 17px)", color: C.body, lineHeight: 1.7, marginBottom: 32 }}>
                  <EditableText contentKey="home.hero.subheading" as="span" />
                </p>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,.61,.36,1) 0.55s", display: "flex", gap: 14, flexWrap: "wrap" }}>
                <EditableBtn contentKey="home.hero.ctaPrimary" variant="primary" defaultLabel="work with me" defaultLink="services" nav={nav} />
                <EditableBtn contentKey="home.hero.ctaSecondary" variant="outline" defaultLabel="brand partnerships" defaultLink="contact" nav={nav} />
              </div>

              {/* Ombre toggle — admin only */}
              {isEditing && (
                <div data-editor-panel style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => updateContent("style.home.hero.heading.useOmbre", !useOmbre)}
                    style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: `1px solid ${C.sand}`, background: useOmbre ? C.olive : "transparent", color: useOmbre ? "#fff" : C.body, cursor: "pointer" }}
                  >
                    {useOmbre ? "✓ Ombre On" : "Ombre Off"}
                  </button>
                  {!useOmbre && (
                    <input type="color" value={heroColor || "#2C2C28"} onChange={(e) => updateContent("style.home.hero.heading.color", e.target.value)}
                      style={{ width: 36, height: 28, borderRadius: 6, border: `1px solid ${C.sand}`, cursor: "pointer", padding: 2 }}
                      title="Heading color"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      );
    },

    marquee: () => (
      <Marquee contentKey="global.marquee1" text="feel-good systems · built with intention · sustainable growth" />
    ),

    welcome: () => (
      <>
        <SectionWrap bgImage={gridBgSand} py="80px" sectionKey="home.welcome">
          <FadeIn>
            <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
              <ScriptLabel size={22} color={C.olive} style={{ textAlign: "center" }}><EditableText contentKey="home.welcome.scriptLabel" as="span" /></ScriptLabel>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 46px)", color: C.charcoal, lineHeight: 1.1, margin: "0 0 24px" }}>
                <EditableText contentKey="home.welcome.heading" as="span" />
              </h2>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: C.body, lineHeight: 1.8, marginBottom: 20 }}>
                <EditableText contentKey="home.welcome.body1" as="span" />
              </p>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 18, color: C.olive, fontWeight: 700, marginBottom: 20 }}>
                <EditableText contentKey="home.welcome.highlight" as="span" />
              </p>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}>
                <EditableText contentKey="home.welcome.body2" as="span" />
              </p>
            </div>
          </FadeIn>
        </SectionWrap>
        <EditableBlockList contentKey="blocks.home.welcome2" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />
      </>
    ),

    coreValues: () => (
      <>
        <SectionWrap bg={C.white} py="72px" sectionKey="home.coreValues">
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <ScriptLabel size={22} color={C.oceanBlue} style={{ textAlign: "center" }}><EditableText contentKey="home.coreValues.scriptLabel" as="span" /></ScriptLabel>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.coreValues.heading" as="span" /></h2>
            </div>
          </FadeIn>
          <EditableCardGroup
            contentKey="home.coreValues.cards"
            defaultNewItem={{ emoji: "✨", title: "new value", desc: "description here" }}
            gridStyle={{ maxWidth: 900, margin: "0 auto", alignItems: "stretch" }}
            gridClassName="core-values-grid"
            renderCard={(v, i) => (
              <div style={{ background: C.cream, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${C.sand}`, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", transition: "transform 0.3s, box-shadow 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <BlinkEmoji emoji={v.emoji} size={32} style={{ marginBottom: 12 }} />
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.charcoal, margin: "0 0 8px" }}>
                  <EditableArrayText contentKey="home.coreValues.cards" index={i} field="title" as="span" />
                </h3>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13.5, color: C.body, lineHeight: 1.6, margin: 0 }}>
                  <EditableArrayText contentKey="home.coreValues.cards" index={i} field="desc" as="span" />
                </p>
              </div>
            )}
          />
        </SectionWrap>
        <EditableBlockList contentKey="blocks.home.coreValues" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />
      </>
    ),

    problem: () => <ProblemSection />,

    systems: () => (
      <section style={{ background: gridBgOcean, padding: "72px clamp(20px, 5vw, 56px)", overflowX: "hidden" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <ScriptLabel size={22} color={C.olive} style={{ textAlign: "center" }}><EditableText contentKey="home.systemsComparison.scriptLabel" as="span" /></ScriptLabel>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.systemsComparison.heading" as="span" /></h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24, maxWidth: 800, margin: "0 auto", alignItems: "stretch" }}>
            <FadeIn delay={0} style={{ display: "flex" }}>
              <div style={{ background: `${C.motherEarth}18`, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${C.motherEarth}40`, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.motherEarth, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <BlinkEmoji emoji="😵‍💫" size={20} /> without systems
                </h3>
                {(getContent("home.systemsComparison.without") || []).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}>
                    <span style={{ color: C.motherEarth, flexShrink: 0 }}>✕</span>
                    <EditableArrayString contentKey="home.systemsComparison.without" index={i} />
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={150} style={{ display: "flex" }}>
              <div style={{ background: `${C.olive}10`, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${C.olive}30`, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.olive, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <BlinkEmoji emoji="✨" size={20} /> with systems
                </h3>
                {(getContent("home.systemsComparison.with") || []).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}>
                    <span style={{ color: C.olive, flexShrink: 0 }}>✦</span>
                    <EditableArrayString contentKey="home.systemsComparison.with" index={i} />
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    ),

    pathCards: () => (
      <>
        <SectionWrap bg={C.cream} py="80px" sectionKey="home.pathCards">
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <ScriptLabel size={22} style={{ textAlign: "center" }}><EditableText contentKey="home.pathCards.scriptLabel" as="span" /></ScriptLabel>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: C.charcoal, margin: "0 0 20px", lineHeight: 1.1 }}><EditableText contentKey="home.pathCards.heading" as="span" /></h2>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
              {(getContent("home.pathCards.anchorButtons") || []).map((t, i) => (
                <BubbleTag key={i} emoji={t.emoji} text={t.text} bg={[C.pinkSoft, C.oceanLight, C.lavenderLight][i] || C.cream} style={{ cursor: "pointer" }} />
              ))}
            </div>
          </FadeIn>
          <EditableCardGroup
            contentKey="home.pathCards"
            defaultNewItem={{ title: "new path", body: "description here", cta: "learn more →", page: "contact" }}
            gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24, alignItems: "stretch" }}
            renderCard={(c, i) => {
              const bgColors = [`${C.motherEarth}20`, `${C.somethingBlue}`, `${C.butter}40`];
              const accents = [C.motherEarth, C.olive, C.motherEarth];
              return (
                <div onClick={() => nav(c.page || "contact")} style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: isEditing ? "default" : "pointer", display: "flex", flexDirection: "column", flex: 1, transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={isEditing ? undefined : e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={isEditing ? undefined : e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ background: bgColors[i % 3], padding: "32px 24px 28px", borderBottom: `3px solid ${accents[i % 3]}` }}>
                    <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: C.charcoal, margin: 0, lineHeight: 1.2 }}>
                      <EditableArrayText contentKey="home.pathCards" index={i} field="title" as="span" />
                    </h3>
                  </div>
                  <div style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>
                      <EditableArrayText contentKey="home.pathCards" index={i} field="body" as="span" />
                    </p>
                    <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.olive, marginTop: "auto" }}>
                      <EditableArrayText contentKey="home.pathCards" index={i} field="cta" as="span" />
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </SectionWrap>
        <EditableBlockList contentKey="blocks.home.pathCards" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />
      </>
    ),

    stats: () => (
      <EditableSection contentKey="visibility.home.stats">
      <SectionWrap bgImage={gridBgOcean} py="80px" sectionKey="home.stats">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <ScriptLabel size={22} color={C.oceanBlue} style={{ textAlign: "center" }}><EditableText contentKey="home.stats.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.stats.heading" as="span" /></h2>
          </div>
        </FadeIn>
        <EditableCardGroup
          contentKey="home.stats"
          defaultNewItem={{ stat: "0+", label: "new stat description" }}
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 36, alignItems: "stretch" }}
          renderCard={(s, i) => (
            <div
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(123, 167, 179, 0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 167, 179, 0.05)"; }}
              style={{ background: C.white, borderRadius: 16, padding: "28px 20px", textAlign: "center", border: `1px solid ${C.sand}`, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", cursor: "default", boxShadow: "0 4px 12px rgba(44,44,40,0.05)" }}>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 7vw, 36px)", color: C.olive, marginBottom: 8 }}>
                <AnimatedCounter end={s.stat} duration={2000} />
              </div>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12.5, color: C.body, lineHeight: 1.5, margin: 0 }}>
                <EditableArrayText contentKey="home.stats" index={i} field="label" as="span" />
              </p>
            </div>
          )}
        />
        <FadeIn delay={400}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
              {(getContent("home.stats.badges") || []).map((t, i) => (
                <span key={i} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 11, color: C.charcoal, background: C.yellow, padding: "5px 16px", borderRadius: 50, letterSpacing: "0.3px" }}>
                  <EditableArrayString contentKey="home.stats.badges" index={i} />
                </span>
              ))}
            </div>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}><EditableText contentKey="home.stats.footnote" as="span" /></p>
          </div>
        </FadeIn>
      </SectionWrap>
      </EditableSection>
    ),

    socialProof: () => (
      <EditableSection contentKey="visibility.home.socialProof">
      <SectionWrap bg={C.white} py="56px">
        <SocialProof />
      </SectionWrap>
      </EditableSection>
    ),

    testimonials: () => (
      <EditableSection contentKey="visibility.home.testimonials">
      <TestimonialSection scrollY={scrollY} />
      </EditableSection>
    ),

    newsletter: () => (
      <EditableSection contentKey="visibility.home.newsletter">
      <SectionWrap bgImage={gridBgLavender} py="72px" sectionKey="home.newsletter">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>🏖️</span>
            <ScriptLabel size={24} color={C.oceanBlue} style={{ textAlign: "center" }}><EditableText contentKey="home.newsletter.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 40px)", color: C.charcoal, margin: "0 0 16px" }}><EditableText contentKey="home.newsletter.heading" as="span" /></h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, marginBottom: 28 }}><EditableText contentKey="home.newsletter.body" as="span" /></p>
            <div style={{ display: "flex", justifyContent: "center" }}><NewsletterForm /></div>
          </FadeIn>
        </div>
      </SectionWrap>
      </EditableSection>
    ),

    closing: () => (
      <>
        <EditableBlockList contentKey="blocks.home.stats" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />
        <EditableSection contentKey="visibility.home.closing">
        <SectionWrap bg={C.charcoal} py="80px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <BlinkEmoji emoji="✨" size={36} style={{ marginBottom: 16 }} />
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: C.cream, lineHeight: 1.1, margin: "0 0 16px" }}>
                <EditableText contentKey="home.closing.heading" as="span" />
              </h2>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: `${C.sand}cc`, lineHeight: 1.7, marginBottom: 12 }}>
                <EditableText contentKey="home.closing.body" as="span" />
              </p>
              <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 22, color: C.sand, marginBottom: 32 }}><EditableText contentKey="home.closing.script" as="span" /></p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <EditableBtn contentKey="home.closing.cta" variant="ocean" defaultLabel="explore services →" defaultLink="services" nav={nav} />
                <EditableBtn contentKey="home.closing.ctaSecondary" variant="outline" defaultLabel="book a discovery call →" defaultLink="contact" nav={nav} style={{ borderColor: C.sand, color: C.sand }} />
              </div>
            </div>
          </FadeIn>
        </SectionWrap>
        </EditableSection>
      </>
    ),

    closingMarquee: () => (
      <Marquee contentKey="global.marquee2" text="life-first business · grow without burnout · real systems for real people" bg={C.olive} color={C.cream} />
    ),
  };

  const sectionMoveBtn = (direction, onClick, disabled) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: "50%", background: C.charcoal,
      border: `2px solid ${C.cream}`, cursor: disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.cream, fontSize: 16,
      boxShadow: "0 4px 16px rgba(44,44,40,0.25)",
      opacity: disabled ? 0.3 : 1,
      transition: "all 0.3s",
    }} aria-label={direction === "up" ? "Move section up" : "Move section down"}>
      {direction === "up" ? "↑" : "↓"}
    </button>
  );

  return (
    <>
      {sectionOrder.map((id, i) => {
        const renderFn = sectionDefs[id];
        if (!renderFn) return null;
        return (
          <div key={id} style={{ position: "relative" }}>
            {isEditing && (
              <div style={{
                position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 100,
              }}>
                {sectionMoveBtn("up", () => moveSection(i, i - 1), i === 0)}
                <span style={{
                  fontFamily: "'Rubik', sans-serif", fontSize: 9, fontWeight: 700,
                  color: "#fff", background: "rgba(45,45,45,0.85)", borderRadius: 6,
                  padding: "3px 8px", whiteSpace: "nowrap", letterSpacing: "0.3px",
                }}>{sectionLabels[id] || id}</span>
                {sectionMoveBtn("down", () => moveSection(i, i + 1), i === sectionOrder.length - 1)}
              </div>
            )}
            {renderFn()}
          </div>
        );
      })}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: SERVICES HUB
   ══════════════════════════════════════════════════════════════ */
function ServicesPage({ setPage }) {
  const { getContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  const foundersRef = useRef(null);
  const corporateRef = useRef(null);
  const brandsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) 36px", textAlign: "center" }}>
        <ScriptLabel size={22} style={{ textAlign: "center" }}><EditableText contentKey="services.hero.scriptLabel" as="span" /></ScriptLabel>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 6vw, 64px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="services.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: C.body, maxWidth: 460, margin: "0 auto 28px" }}><EditableText contentKey="services.hero.subheading" as="span" /></p>
        {/* Anchor navigation buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn variant="sand" onClick={() => scrollToSection(foundersRef)} style={{ padding: "10px 22px", fontSize: 13 }}>for founders</Btn>
          <Btn variant="outline" onClick={() => scrollToSection(corporateRef)} style={{ padding: "10px 22px", fontSize: 13 }}>for corporate teams</Btn>
          <Btn variant="outline" onClick={() => scrollToSection(brandsRef)} style={{ padding: "10px 22px", fontSize: 13 }}>for brands</Btn>
        </div>
      </section>

      <Marquee text="systems that actually work · no hustle culture · revenue expansion" bg={C.sand} color={C.charcoal} />

      {/* CREATORS */}
      <EditableSection contentKey="visibility.services.creators">
      <div ref={foundersRef} style={{ scrollMarginTop: 80 }} />
      <SectionWrap bg={C.cream} py="72px">
        <FadeIn>
          <ScriptLabel size={22}><EditableText contentKey="services.creators.scriptLabel" as="span" /></ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: C.charcoal, margin: "0 0 12px" }}><EditableText contentKey="services.creators.heading" as="span" /></h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, maxWidth: 680, marginBottom: 36 }}><EditableText contentKey="services.creators.body" as="span" /></p>
        </FadeIn>

        <EditableCardGroup
          contentKey="services.creators.cards"
          defaultNewItem={{ num: "04", title: "new service", price: "TBD", body: "description here", page: "contact", bg: "#F5E6DC" }}
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20, marginBottom: 40, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            return (
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => nav(c.page || "contact")}>
                <div style={{ background: c.bg || bgColors[i % 3], padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(32px, 8vw, 48px)", color: `${C.charcoal}20` }}>{c.num}</span>
                </div>
                <div style={{ padding: "24px 22px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, color: C.oceanBlue, background: C.oceanLight, padding: "4px 14px", borderRadius: 50 }}>
                    <EditableArrayText contentKey="services.creators.cards" index={i} field="price" as="span" />
                  </span>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 18, color: C.charcoal, margin: "12px 0 10px" }}>
                    <EditableArrayText contentKey="services.creators.cards" index={i} field="title" as="span" />
                  </h3>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>
                    <EditableArrayText contentKey="services.creators.cards" index={i} field="body" as="span" />
                  </p>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.oceanBlue, marginTop: "auto" }}>learn more →</span>
                </div>
              </div>
            );
          }}
        />

      </SectionWrap>
      </EditableSection>

      <EditableBlockList contentKey="blocks.services.creators" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* CORPORATE */}
      <EditableSection contentKey="visibility.services.corporate">
      <div ref={corporateRef} style={{ scrollMarginTop: 80 }} />
      <SectionWrap bg={C.charcoal} py="72px">
        <FadeIn>
          <ScriptLabel size={22} color={C.sand}><EditableText contentKey="services.corporate.scriptLabel" as="span" /></ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: C.cream, margin: "0 0 12px" }}><EditableText contentKey="services.corporate.heading" as="span" /></h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: `${C.sand}cc`, lineHeight: 1.75, maxWidth: 680, marginBottom: 36 }}><EditableText contentKey="services.corporate.body" as="span" /></p>
        </FadeIn>

        <EditableCardGroup
          contentKey="services.corporate.cards"
          defaultNewItem={{ num: "03", title: "new offering", price: "custom pricing", body: "description here", page: "corporate", bg: "#E8DDD4" }}
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20, marginBottom: 40, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            return (
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => nav(c.page || "contact")}>
                <div style={{ background: c.bg || bgColors[i % 3], padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(32px, 8vw, 48px)", color: `${C.charcoal}20` }}>{c.num}</span>
                </div>
                <div style={{ padding: "24px 22px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, color: C.oceanBlue, background: C.oceanLight, padding: "4px 14px", borderRadius: 50 }}>
                    <EditableArrayText contentKey="services.corporate.cards" index={i} field="price" as="span" />
                  </span>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 18, color: C.charcoal, margin: "12px 0 10px" }}>
                    <EditableArrayText contentKey="services.corporate.cards" index={i} field="title" as="span" />
                  </h3>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>
                    <EditableArrayText contentKey="services.corporate.cards" index={i} field="body" as="span" />
                  </p>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.oceanBlue, marginTop: "auto" }}>learn more →</span>
                </div>
              </div>
            );
          }}
        />

      </SectionWrap>
      </EditableSection>

      <EditableBlockList contentKey="blocks.services.corporate" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* BRANDS */}
      <EditableSection contentKey="visibility.services.brands">
      <div ref={brandsRef} style={{ scrollMarginTop: 80 }} />
      <SectionWrap bgImage={gridBgLavender} py="72px">
        <FadeIn>
          <ScriptLabel size={22} color={C.oceanBlue}><EditableText contentKey="services.brands.scriptLabel" as="span" /></ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: C.charcoal, margin: "0 0 12px" }}><EditableText contentKey="services.brands.heading" as="span" /></h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, maxWidth: 680, marginBottom: 36 }}><EditableText contentKey="services.brands.body" as="span" /></p>
        </FadeIn>

        <EditableCardGroup
          contentKey="services.brands.cards"
          defaultNewItem={{ num: "04", title: "new partnership", price: "inquire", body: "description here", page: "contact", bg: "#F5E6DC" }}
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20, marginBottom: 40, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            return (
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => nav(c.page || "contact")}>
                <div style={{ background: c.bg || bgColors[i % 3], padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(32px, 8vw, 48px)", color: `${C.charcoal}20` }}>{c.num}</span>
                </div>
                <div style={{ padding: "24px 22px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, color: C.oceanBlue, background: C.oceanLight, padding: "4px 14px", borderRadius: 50 }}>
                    <EditableArrayText contentKey="services.brands.cards" index={i} field="price" as="span" />
                  </span>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 18, color: C.charcoal, margin: "12px 0 10px" }}>
                    <EditableArrayText contentKey="services.brands.cards" index={i} field="title" as="span" />
                  </h3>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>
                    <EditableArrayText contentKey="services.brands.cards" index={i} field="body" as="span" />
                  </p>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.oceanBlue, marginTop: "auto" }}>learn more →</span>
                </div>
              </div>
            );
          }}
        />

      </SectionWrap>
      </EditableSection>

      <EditableBlockList contentKey="blocks.services.brands" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SERVICE DETAIL PAGES (Audit, Implementation, Fractional, Corporate)
   ══════════════════════════════════════════════════════════════ */
function ServiceDetailPage({ setPage, serviceKey }) {
  const { getContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  const p = serviceKey === "corporate" ? "services.corporate.detail" : `services.${serviceKey}`;

  const includes = getContent(p + ".includes") || [];
  const timeline = getContent(p + ".timeline") || [];
  const process = getContent(p + ".process") || [];
  const fitPerfect = getContent(p + ".fit.perfect") || [];
  const fitNotFit = getContent(p + ".fit.notFit") || [];
  const hasFit = fitPerfect.length > 0 || fitNotFit.length > 0;
  const faqs = getContent(p + ".faqs") || [];
  const quoteText = getContent(p + ".quote.text");
  const quoteAuthor = getContent(p + ".quote.author");
  const price = getContent(p + ".price");
  const different = getContent(p + ".different");

  return (
    <>
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) clamp(32px, 8vw, 56px)", textAlign: "center" }}>
        {price && <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 13, color: C.white, background: C.oceanBlue, padding: "6px 20px", borderRadius: 50, display: "inline-block", marginBottom: 16 }}>{price}</span>}
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 5vw, 52px)", color: C.charcoal, lineHeight: 1.05, margin: "0 0 8px", letterSpacing: "-0.8px" }}><EditableText contentKey={p + ".title"} as="span" /></h1>
        <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 20, color: C.warmTan }}><EditableText contentKey={p + ".subtitle"} as="span" /></p>
      </section>

      <SectionWrap bg={C.charcoal} py="56px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel color={C.sand}>the problem</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: `${C.sand}dd`, lineHeight: 1.75 }}><EditableText contentKey={p + ".problem"} as="span" /></p>
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bgImage={gridBgWhite} py="64px" sectionKey={p + ".whatThis"}>
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel>what this is</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 20 }}><EditableText contentKey={p + ".whatIntro"} as="span" /></p>
            {includes.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                <BrandStar size={14} color={C.olive} style={{ marginTop: 3 }} />
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.6 }}><EditableArrayString contentKey={p + ".includes"} index={i} /></span>
              </div>
            ))}
            <EditableTagList contentKey={p + ".timeline"} items={timeline} tagBg={C.butter} tagColor={C.charcoal} />
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bg={C.cream} py="64px" sectionKey={p + ".process"}>
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel>the process</ScriptLabel>
            {process.map((t, i) => <ProcessStep key={i} num={i + 1} total={process.length} text={<EditableArrayString contentKey={p + ".process"} index={i} />} />)}
          </div>
        </FadeIn>
      </SectionWrap>

      {hasFit && (
        <SectionWrap bgImage={gridBgSand} py="64px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <ScriptLabel>who this is for</ScriptLabel>
              <TwoColFit perfect={fitPerfect} notFit={fitNotFit} />
            </div>
          </FadeIn>
        </SectionWrap>
      )}

      {faqs.length > 0 && (
        <SectionWrap bgImage={gridBgWhite} py="64px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <ScriptLabel>frequently asked</ScriptLabel>
              <FAQAccordion faqs={faqs} contentKey={p + ".faqs"} />
            </div>
          </FadeIn>
        </SectionWrap>
      )}

      {different && (
        <SectionWrap bg={C.white} py="64px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <ScriptLabel>what makes this different</ScriptLabel>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}><EditableText contentKey={p + ".different"} as="span" /></p>
            </div>
          </FadeIn>
        </SectionWrap>
      )}

      {quoteText && (
        <SectionWrap bg={C.charcoal} py="56px">
          <PullQuote quote={quoteText} author={quoteAuthor} bg={`${C.warmTan}15`} />
        </SectionWrap>
      )}

      <SectionWrap bg={C.cream} py="48px">
        <div style={{ textAlign: "center" }}><EditableBtn contentKey={p + ".cta"} variant="primary" defaultLabel="work with me →" defaultLink="contact" nav={nav} /></div>
      </SectionWrap>
    </>
  );
}

/* Service configs removed — data now lives in contentSchema.js and is accessed via CMS */

/* ══════════════════════════════════════════════════════════════
   PAGE: ABOUT
   ══════════════════════════════════════════════════════════════ */
function AboutPage({ setPage }) {
  const { getContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  return (
    <>
      {/* THE CHARACTER — Hero with typewriter traits */}
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) clamp(32px, 8vw, 56px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "clamp(24px, 5vw, 48px)", alignItems: "center" }}>
          <EditableImage contentKey="image.about.hero" placeholderEmoji="👋" placeholderLabel="hi, i'm sam" placeholderHeight={440} placeholderBg={C.pinkSoft} placeholderRadius={20} />
          <div>
            <ScriptLabel size={22}><EditableText contentKey="about.hero.scriptLabel" as="span" /></ScriptLabel>
            <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", color: C.charcoal, lineHeight: 1.05, margin: "0 0 12px" }}><EditableText contentKey="about.hero.title" as="span" /></h1>
            {/* Typewriter personality traits */}
            <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 21, color: C.oceanBlue, marginBottom: 20, minHeight: 30 }}>
              <TypewriterText phrases={["global team leader", "fractional consultant", "certified notion nerd", "part-time mermaid", "pilates enthusiast", "iced latte connoisseur"]} speed={65} deleteSpeed={30} pauseDuration={1800} />
            </p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}><EditableText contentKey="about.hero.body" as="span" /></p>
          </div>
        </div>
      </section>

      <Marquee text="feel-good systems · built with intention · sustainable growth" bg={C.oceanBlue} color={C.white} />

      {/* THE PROBLEM — What Sam saw wrong */}
      <EditableSection contentKey="visibility.about.backstory">
      <SectionWrap bgImage={gridBgSand} py="72px">
        <FadeIn>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ScriptLabel size={22}><EditableText contentKey="about.backstory.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3vw, 34px)", color: C.charcoal, margin: "0 0 20px" }}><EditableText contentKey="about.backstory.heading" as="span" /></h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 16 }}><EditableText contentKey="about.backstory.body1" as="span" /></p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 16 }}><EditableText contentKey="about.backstory.body2" as="span" /></p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}><EditableText contentKey="about.backstory.body3" as="span" /></p>
          </div>
        </FadeIn>
      </SectionWrap>
      </EditableSection>

      <EditableBlockList contentKey="blocks.about.backstory" style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* THE GUIDE — Credentials & beliefs */}
      <EditableSection contentKey="visibility.about.beliefs">
      <SectionWrap bg={C.cream} py="80px">
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <ScriptLabel size={22} color={C.oceanBlue}><EditableText contentKey="about.beliefs.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 800, fontSize: "clamp(16px, 2.2vw, 20px)", color: C.charcoal, margin: "0 0 56px", textTransform: "uppercase", letterSpacing: "2px", lineHeight: 1.5 }}>
              <EditableText contentKey="about.beliefs.heading" as="span" />
            </h2>
          </FadeIn>

          {(getContent("about.beliefs") || []).map((c, i) => {
            const colors = [C.motherEarth, C.butter, C.olive, C.somethingBlue];
            const headingColors = [`${C.motherEarth}70`, `${C.olive}50`, `${C.olive}80`, `${C.somethingBlue}`];
            const rotations = [-10, 8, -7, 12];
            const badgeAligns = ["flex-start", "flex-end", "flex-start", "flex-end"];
            return (
              <FadeIn key={i}>
                <div style={{ marginBottom: i < 3 ? "clamp(32px, 8vw, 64px)" : 0, position: "relative", overflow: "visible", paddingTop: 20 }}>
                  {/* Tilted badge */}
                  <div style={{ display: "flex", justifyContent: badgeAligns[i % 4], marginBottom: -8, paddingLeft: badgeAligns[i % 4] === "flex-start" ? "5%" : 0, paddingRight: badgeAligns[i % 4] === "flex-end" ? "5%" : 0 }}>
                    <span style={{
                      display: "inline-block",
                      fontFamily: "'Georgia', serif", fontStyle: "italic",
                      fontSize: 15,
                      color: "#fff",
                      background: colors[i % 4],
                      padding: "8px 18px",
                      borderRadius: 8,
                      transform: `rotate(${rotations[i % 4]}deg)`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      whiteSpace: "normal",
                    }}>
                      <EditableArrayText contentKey="about.beliefs" index={i} field="tag" as="span" />
                    </span>
                  </div>

                  {/* Large pastel heading */}
                  <h3 style={{
                    fontFamily: "'Rubik', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(32px, 5vw, 52px)",
                    color: headingColors[i % 4],
                    margin: "0 0 16px",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    letterSpacing: "-0.5px",
                  }}>
                    <EditableArrayText contentKey="about.beliefs" index={i} field="b" as="span" />
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontFamily: "'Rubik', sans-serif",
                    fontSize: 15,
                    color: C.body,
                    lineHeight: 1.7,
                    margin: "0 auto",
                    maxWidth: 600,
                  }}>
                    <EditableArrayText contentKey="about.beliefs" index={i} field="d" as="span" />
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </SectionWrap>
      </EditableSection>

      <EditableBlockList contentKey="blocks.about.beliefs" style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* THE PERSON — Lifestyle (tightened) */}
      <EditableSection contentKey="visibility.about.lifestyle">
      <SectionWrap bgImage={gridBgLavender} py="72px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <ScriptLabel size={22} color={C.oceanBlue} style={{ textAlign: "center" }}>when i'm not consulting</ScriptLabel>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
              {(getContent("about.lifestyle") || []).map((t, i) => (
                <BubbleTag key={i} emoji={t.emoji} text={t.text} bg={C.white} />
              ))}
            </div>
          </div>
        </FadeIn>
      </SectionWrap>
      </EditableSection>

      {/* THE CALL TO ACTION */}
      <SectionWrap bg={C.charcoal} py="64px">
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3vw, 34px)", color: C.cream, margin: "0 0 12px" }}>
              <EditableText contentKey="about.cta.heading" as="span" />
            </h2>
            <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 20, color: C.sand, marginBottom: 28 }}>
              <EditableText contentKey="about.cta.script" as="span" />
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <EditableBtn contentKey="about.closing.cta" variant="ocean" defaultLabel="work with me →" defaultLink="services" nav={nav} />
              <EditableBtn contentKey="about.closing.ctaSecondary" variant="outline" defaultLabel="join the cabana club →" defaultLink="resources" nav={nav} style={{ borderColor: C.sand, color: C.sand }} />
            </div>
          </div>
        </FadeIn>
      </SectionWrap>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: RESOURCES
   ══════════════════════════════════════════════════════════════ */
function ResourcesPage() {
  const { getContent } = useCMS();
  return (
    <>
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) clamp(32px, 8vw, 56px)", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="resources.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 20, color: C.warmTan }}><EditableText contentKey="resources.hero.subheading" as="span" /></p>
      </section>

      <Marquee text="systems that actually work · no hustle culture · revenue expansion" bg={C.sand} color={C.charcoal} />

      {/* NEWSLETTER with preferences */}
      <EditableSection contentKey="visibility.resources.newsletter">
      <SectionWrap bgImage={gridBgOcean} py="72px">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <BlinkEmoji emoji="🏖️" size={36} style={{ marginBottom: 8 }} />
            <ScriptLabel size={24} color={C.oceanBlue} style={{ textAlign: "center" }}><EditableText contentKey="resources.newsletter.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 38px)", color: C.charcoal, margin: "0 0 16px" }}><EditableText contentKey="resources.newsletter.heading" as="span" /></h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, marginBottom: 20 }}><EditableText contentKey="resources.newsletter.body" as="span" /></p>
            <div style={{ display: "flex", justifyContent: "center" }}><NewsletterForm /></div>
          </FadeIn>
        </div>
      </SectionWrap>
      </EditableSection>

      {/* THE TOOLKIT (affiliate/recommended tools) */}
      <EditableSection contentKey="visibility.resources.free">
      <SectionWrap bg={C.cream} py="72px">
        <FadeIn>
          <ScriptLabel size={22} style={{ textAlign: "center" }}><EditableText contentKey="resources.tools.scriptLabel" as="span" /></ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 38px)", color: C.charcoal, margin: "0 0 8px", textAlign: "center" }}><EditableText contentKey="resources.tools.heading" as="span" /></h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, textAlign: "center", marginBottom: 36 }}><EditableText contentKey="resources.tools.subheading" as="span" /></p>
        </FadeIn>
        <HorizontalScroll gap={20}>
          {(getContent("resources.tools.items") || []).map((tool, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{ minWidth: "min(260px, 75vw)", maxWidth: 280, flexShrink: 0, scrollSnapAlign: "start", background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, transition: "transform 0.3s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ background: tool.bg || C.pinkSoft, padding: "28px 24px", textAlign: "center" }}>
                  <span style={{ fontSize: 40 }}><EditableArrayText contentKey="resources.tools.items" index={i} field="emoji" as="span" /></span>
                </div>
                <div style={{ padding: "20px 20px 24px" }}>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 17, color: C.charcoal, margin: "0 0 8px" }}><EditableArrayText contentKey="resources.tools.items" index={i} field="title" as="span" /></h3>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13.5, color: C.body, lineHeight: 1.6, margin: 0 }}><EditableArrayText contentKey="resources.tools.items" index={i} field="desc" as="span" /></p>
                </div>
              </div>
            </FadeIn>
          ))}
        </HorizontalScroll>
      </SectionWrap>
      </EditableSection>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: CONTACT
   ══════════════════════════════════════════════════════════════ */
function ContactPage() {
  const { getContent } = useCMS();
  const dubsadoUrl = getContent("contact.dubsado.embedUrl");
  const iframeRef = useRef(null);

  // Load iframe-resizer script and apply to Dubsado iframe
  useEffect(() => {
    if (!dubsadoUrl) return;
    const existingScript = document.querySelector('script[src*="iframeResizer"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.14/iframeResizer.min.js";
      script.onload = () => {
        if (iframeRef.current && window.iFrameResize) {
          window.iFrameResize({ checkOrigin: false, heightCalculationMethod: "taggedElement" }, iframeRef.current);
        }
      };
      document.head.appendChild(script);
    } else if (window.iFrameResize && iframeRef.current) {
      setTimeout(() => {
        window.iFrameResize({ checkOrigin: false, heightCalculationMethod: "taggedElement" }, iframeRef.current);
      }, 30);
    }
  }, [dubsadoUrl]);

  return (
    <>
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) 36px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="contact.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 20, color: C.warmTan }}><EditableText contentKey="contact.hero.subheading" as="span" /></p>
      </section>

      <SectionWrap bgImage={gridBgSand} py="64px">
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {/* Dubsado form embed */}
          {dubsadoUrl ? (
            <div style={{
              background: C.white,
              borderRadius: 24,
              overflow: "hidden",
              border: `1px solid ${C.sand}`,
            }}>
              <iframe
                ref={iframeRef}
                src={dubsadoUrl}
                frameBorder="0"
                style={{
                  width: "1px",
                  minWidth: "100%",
                  border: "none",
                  display: "block",
                }}
                title="Book a Discovery Call"
              />
            </div>
          ) : (
            <div style={{
              background: C.white,
              borderRadius: 24,
              padding: "clamp(32px, 5vw, 56px)",
              border: `1px solid ${C.sand}`,
              textAlign: "center",
            }}>
              <BlinkEmoji emoji="📋" size={40} style={{ marginBottom: 12 }} />
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: C.charcoal, margin: "0 0 8px" }}>discovery call booking</h2>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 20px" }}>
                <EditableText contentKey="contact.dubsado.placeholder" as="span" />
              </p>
              <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 18, color: C.warmTan }}>
                dubsado form embed coming soon
              </p>
            </div>
          )}

          {/* Email alternative */}
          <div style={{ marginTop: 28, background: C.white, borderRadius: 16, padding: "22px 24px", border: `1px solid ${C.sand}`, textAlign: "center" }}>
            <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 6px" }}><EditableText contentKey="contact.emailAlt.heading" as="span" /></h3>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, margin: 0 }}><EditableText contentKey="contact.emailAlt.body" as="span" /> <strong>sam@bysamanthabrown.com</strong></p>
          </div>
        </div>
      </SectionWrap>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */
export default function App() {
  // URL-aware routing: read initial page from hash, sync with browser history
  const getPageFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
  };

  const [page, setPageState] = useState(getPageFromHash);
  const scrollY = useScrollY();
  const { isEditing } = useCMS();

  // Wrap setPage to push browser history — blocked during edit mode
  const setPage = useCallback((newPage) => {
    if (isEditing) return;
    setPageState(newPage);
    const hash = newPage === "home" ? "" : `#${newPage}`;
    window.history.pushState({ page: newPage }, "", `/${hash}`);
  }, [isEditing]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setPageState(getPageFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pages = {
    home: <HomePage setPage={setPage} />,
    services: <ServicesPage setPage={setPage} />,
    audit: <ServiceDetailPage setPage={setPage} serviceKey="audit" />,
    implementation: <ServiceDetailPage setPage={setPage} serviceKey="implementation" />,
    fractional: <ServiceDetailPage setPage={setPage} serviceKey="fractional" />,
    corporate: <ServiceDetailPage setPage={setPage} serviceKey="corporate" />,
    about: <AboutPage setPage={setPage} />,
    resources: <ResourcesPage />,
    contact: <ContactPage />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        body {
          background: ${C.cream};
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        ::selection { background: ${C.oceanLight}; color: ${C.charcoal}; }
        input::placeholder, textarea::placeholder { font-family: 'Rubik', sans-serif; color: ${C.muted}; }
        button:hover { opacity: 0.93; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes gradientText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        @keyframes emojiPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Hero two-column responsive */
        .hero-two-col {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .hero-two-col {
            grid-template-columns: 1fr !important;
          }
          .hero-two-col > div:last-child {
            margin-left: 0 !important;
            text-align: center !important;
          }
          .hero-two-col > div:last-child > div > div {
            justify-content: center;
          }
          .hero-two-col > div:last-child > div[style*="flex"] {
            justify-content: center;
          }
        }

        /* Enhanced Form Inputs */
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: ${C.oceanBlue} !important;
          box-shadow: 0 0 0 3px rgba(123, 167, 179, 0.1), 0 4px 12px rgba(123, 167, 179, 0.15) !important;
          transform: translateY(-1px);
        }

        input, textarea, select {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.sand}; border-radius: 10px; }

        .core-values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; align-items: stretch; }
        @media (max-width: 768px) {
          .core-values-grid { grid-template-columns: repeat(2, 1fr); }
          .dsk-nav { display: none !important; }
          .mob-toggle { display: block !important; }
          .testimonial-arrows-desktop { display: none !important; }
          .testimonial-arrows-mobile { display: flex !important; }
          /* Hero image: restore portrait 4/5 ratio at smaller width — natural photo format */
          .hero-img-wrap { width: 68% !important; max-width: 230px !important; height: auto !important; aspect-ratio: 4/5 !important; max-height: unset !important; margin: 0 auto !important; }
          /* Floating tags: smaller pill + emoji, right/left edges touch photo edge */
          .hero-float-tag > div > div { font-size: 8px !important; padding: 5px 9px !important; gap: 4px !important; }
          .hero-float-tag > div > div span:first-child { font-size: 12px !important; }
          /* feel-good: emerges from left screen edge, right end touches photo's left edge */
          .hero-float-tag-0 { top: 38% !important; left: -50px !important; right: auto !important; bottom: auto !important; transform: rotate(3deg) !important; }
          /* life-first: emerges from right screen edge, left end touches photo's right edge */
          .hero-float-tag-1 { top: 10% !important; right: -50px !important; left: auto !important; bottom: auto !important; transform: rotate(-5deg) !important; }
          /* built with intention: hangs just below photo */
          .hero-float-tag-2 { bottom: -18px !important; left: 50% !important; right: auto !important; top: auto !important; transform: translateX(-50%) rotate(-2deg) !important; }
          /* Pull image up closer to nav */
          .hero-section { padding-top: 74px !important; align-items: flex-start !important; }
          /* Tighten grid gap + image column on mobile */
          .hero-two-col { gap: 14px !important; padding-top: 4px; }
          .hero-two-col > div:first-child { max-width: min(100%, 420px); margin-left: auto; margin-right: auto; }
          /* Smaller heading + tighter spacing so CTA fits on screen */
          .hero-two-col h1 { font-size: clamp(24px, 7vw, 64px) !important; line-height: 1.1 !important; margin-bottom: 10px !important; }
          .hero-two-col > div:last-child > div { margin-bottom: 8px !important; }
        }
        @media (max-width: 480px) {
          .core-values-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 769px) {
          .mob-toggle { display: none !important; }
          .mob-menu { display: none !important; }
        }
        @media (max-width: 640px) {
          select, input, textarea { font-size: 16px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <AdminLoginListener />
      <AdminLoginModal />
      <Nav page={page} setPage={setPage} scrollY={scrollY} isEditing={isEditing} />
      <main>{pages[page]}</main>
      <Footer setPage={setPage} isEditing={isEditing} />
      <BackToTop scrollY={scrollY} />
      <EditorToolbar />
      <SelectionOverlay />
      <PropertyPanel />
    </>
  );
}
