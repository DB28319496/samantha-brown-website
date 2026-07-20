import { useState, useEffect, useRef, useCallback } from "react";
import { C, gridBgWhite, gridBgSand, gridBgOcean } from "../theme";
import { useInView } from "../hooks";
import { useCMS, useContent } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EmojiIcon } from "../icons";

function FadeIn({ children, delay = 0, y = 28, style = {} }) {
  const [ref, v] = useInView(0.05);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : `translateY(${y}px)`, transition: `opacity 0.7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,.61,.36,1) ${delay}ms`, ...style }}>{children}</div>
  );
}

/* ── Animated Counter (counts up once on scroll into view) ── */
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [ref, v] = useInView(0.1);
  const [count, setCount] = useState(0);

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
  }, [v, end, duration]);

  const formatted = end.toString().includes('+')
    ? `${Math.floor(count)}+`
    : end.toString().includes('%')
    ? `${Math.floor(count)}%`
    : end.toString().includes('.')
    ? count.toFixed(1)
    : Math.floor(count);

  return <div ref={ref}>{formatted}{suffix}</div>;
}

/* ── Rotating Text (soft crossfade through phrases) ── */
function RotatingText({ phrases = [], interval = 3200, style = {} }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (phrases.length < 2) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  if (!phrases.length) return null;
  return (
    <span style={{
      display: "inline-block",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(6px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
      ...style,
    }}>
      {phrases[index]}
    </span>
  );
}

/* ── Brand icon (emoji strings from the CMS render as line icons) ── */
function BlinkEmoji({ emoji, size = 24, color = C.olive, style = {} }) {
  return <EmojiIcon emoji={emoji} size={size} color={color} style={style} />;
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
        borderRadius: 50,
        padding: "10px 18px",
        border: `1px solid ${borderColor}`,
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
            <EmojiIcon emoji={emojiVal} size={16} color={textColor} />
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
      border: `1px solid ${C.sand}`,
      whiteSpace: "nowrap",
      ...style,
    }}>
      <EmojiIcon emoji={emoji} size={16} color={C.olive} />{text}
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
    <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: size, color, fontWeight: 400, letterSpacing: "0.3px", display: "block", marginBottom: 8, ...style }}>{children}</span>
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
function EditableBtn({ contentKey, variant = "primary", defaultLabel = "button", defaultLink = "contact", nav, style = {} }) {
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
                const { uploadImage } = await import("../supabase/storage");
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
      <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}`, height: "100%", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}>
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
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: "clamp(24px, 3.5vw, 36px)", color: C.sand, lineHeight: 1.4, margin: "0 0 14px" }}>"{quote}"</p>
        {author && <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: `${C.sand}88`, margin: 0 }}>— {author}</p>}
      </div>
    </FadeIn>
  );
}

/* ── Social Proof — parallax-style scroll-in with uploadable logos ── */
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

export {
  FadeIn, AnimatedCounter, RotatingText, BlinkEmoji, FloatingTag, BubbleTag,
  Marquee, ScriptLabel, HorizontalScroll, Btn, EditableBtn, SectionWrap,
  SectionBgControl, BrandStar, ProcessStep, FAQAccordion, EditableTagList,
  TwoColFit, PullQuote, NewsletterForm,
};
