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
  charcoal: "#2D2D2D",
  warmTan: "#9B8B6B",
  sand: "#DDD0BE",
  sandLight: "#EDE5D8",
  olive: "#5C5C00",
  lavender: "#D5CEE3",
  lavenderLight: "#EDE8F4",
  yellow: "#E0E24A",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  warmWhite: "#FDF9F3",
  pinkSoft: "#F5E6DC",
  oceanBlue: "#7BA7B3",
  oceanLight: "#D6E8EC",
  coral: "#E8A87C",
  body: "#555550",
  muted: "#999990",
};

/* ── Grid paper SVG pattern (PLM signature element) ── */
const gridBgWhite = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23FAF7F2'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23DDD0BE' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3C/svg%3E")`;
const gridBgSand = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23EDE5D8'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23DDD0BE' stroke-width='0.5' fill='none' opacity='0.6'/%3E%3C/svg%3E")`;
const gridBgOcean = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23D6E8EC'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%237BA7B3' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E")`;
const gridBgLavender = `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23EDE8F4'/%3E%3Cpath d='M40 0v40M0 40h40' stroke='%23D5CEE3' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3C/svg%3E")`;

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

/* ── Animated Counter (counts up when scrolled into view) ── */
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
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!phrases.length) return;
    const current = phrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
          return;
        }
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % phrases.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [text, phraseIndex, isDeleting, phrases, speed, deleteSpeed, pauseDuration]);

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
   MARQUEE / INFINITE TICKER (PLM pattern)
   ══════════════════════════════════════════════════════════════ */
function Marquee({ text, bg = C.charcoal, color = C.sand, speed = 60 }) {
  const items = Array(8).fill(text);
  return (
    <div style={{ overflow: "hidden", background: bg, padding: "14px 0", whiteSpace: "nowrap", position: "relative" }}>
      <div style={{ display: "inline-flex", animation: `marquee ${speed}s linear infinite` }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 500, fontSize: 14, color, letterSpacing: "0.5px", textTransform: "lowercase", padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 32 }}>
            {t} <span style={{ color: C.yellow, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
      <div style={{ display: "inline-flex", animation: `marquee ${speed}s linear infinite` }}>
        {items.map((t, i) => (
          <span key={`d-${i}`} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 500, fontSize: 14, color, letterSpacing: "0.5px", textTransform: "lowercase", padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 32 }}>
            {t} <span style={{ color: C.yellow, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCRIPT LABEL (PLM's handwritten accent font)
   ══════════════════════════════════════════════════════════════ */
function ScriptLabel({ children, color = C.warmTan, size = 20, style = {} }) {
  return (
    <span style={{ fontFamily: "'Caveat', cursive", fontSize: size, color, fontWeight: 600, display: "block", marginBottom: 8, ...style }}>{children}</span>
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

  const base = { fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, border: "none", borderRadius: 50, padding: "14px 34px", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "0.2px", position: "relative" };
  const v = {
    primary: { ...base, background: C.charcoal, color: C.cream, border: `2px solid ${C.charcoal}` },
    sand: { ...base, background: C.sand, color: C.charcoal, border: `2px solid ${C.sand}` },
    outline: { ...base, background: "transparent", color: C.charcoal, border: `2px solid ${C.charcoal}` },
    ocean: { ...base, background: C.oceanBlue, color: C.white, border: `2px solid ${C.oceanBlue}` },
    yellow: { ...base, background: C.yellow, color: C.charcoal, border: `2px solid ${C.charcoal}` },
    white: { ...base, background: C.white, color: C.charcoal, border: `2px solid ${C.charcoal}` },
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

function SectionWrap({ children, bg, bgImage, py = "80px", style = {} }) {
  return (
    <section style={{ background: bgImage || bg || C.cream, padding: `${py} clamp(20px, 5vw, 56px)`, ...style }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

const stepColors = ["#F4B8A8", "#9AABE0", "#A8D5A2", "#E07E6A", "#D4A8E0"];
const stepDividers = ["#F4B8A8", "#9AABE0", "#A8D5A2", "#E07E6A", "#D4A8E0"];
const stepRotations = [-8, -6, -10, -7, -9];

function ProcessStep({ num, text, total }) {
  const idx = (num - 1) % stepColors.length;
  const color = stepColors[idx];
  const rotation = stepRotations[idx];
  const dividerColor = stepDividers[idx];
  const isLast = num === total;

  return (
    <div style={{ padding: "28px 0 20px", position: "relative" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: C.white,
          flexShrink: 0,
          transform: `rotate(${rotation}deg)`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          {String(num).padStart(2, "0")}
        </div>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, margin: 0 }}>{text}</p>
      </div>
      {!isLast && (
        <div style={{ height: 2, background: dividerColor, opacity: 0.45, marginTop: 24, borderRadius: 2 }} />
      )}
    </div>
  );
}

function FAQAccordion({ faqs, contentKey }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${C.sand}` }}>
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
                color: C.oceanBlue,
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
          </div>
        );
      })}
    </div>
  );
}

function TwoColFit({ perfect, notFit }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}`, height: "100%" }}>
        <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 16px" }}>perfect if you:</h4>
        {perfect.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}><span style={{ color: C.oceanBlue, flexShrink: 0 }}>✦</span>{p}</div>)}
      </div>
      <div style={{ background: C.warmWhite, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}`, height: "100%" }}>
        <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 16px" }}>not a fit if you:</h4>
        {notFit.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.55 }}><span style={{ flexShrink: 0 }}>—</span>{p}</div>)}
      </div>
    </div>
  );
}

function PullQuote({ quote, author, bg = C.charcoal }) {
  return (
    <FadeIn>
      <div style={{ background: bg, borderRadius: 20, padding: "clamp(36px, 5vw, 56px)", textAlign: "center", margin: "0 auto", maxWidth: 800 }}>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(24px, 3.5vw, 36px)", color: C.sand, lineHeight: 1.4, margin: "0 0 14px" }}>"{quote}"</p>
        {author && <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: `${C.sand}88`, margin: 0 }}>— {author}</p>}
      </div>
    </FadeIn>
  );
}

/* ── Social Proof / Logos ── */
function SocialProof() {
  const { getContent } = useCMS();
  const badges = getContent("home.socialProof.badges") || [];
  return (
    <FadeIn>
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>
          <EditableText contentKey="home.socialProof.label" as="span" />
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
          {badges.map((badge, i) => (
            <div key={i} style={{
              fontFamily: "'Rubik', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: C.charcoal,
              background: C.white,
              padding: "12px 24px",
              borderRadius: 50,
              border: `1.5px solid ${C.sand}`,
              transition: "all 0.3s",
              cursor: "default"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <EditableArrayString contentKey="home.socialProof.badges" index={i} />
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

/* ── Testimonial Carousel ── */
function TestimonialCarousel() {
  const { getContent } = useCMS();
  const [current, setCurrent] = useState(0);
  const testimonials = getContent("home.testimonials") || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ overflow: "hidden", position: "relative", minHeight: 200 }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{
            position: "absolute",
            width: "100%",
            opacity: current === i ? 1 : 0,
            transform: current === i ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.6s cubic-bezier(.22,.61,.36,1)",
            pointerEvents: current === i ? "auto" : "none"
          }}>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: C.warmTan, margin: 0, fontWeight: 500 }}>— {t.author}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: current === i ? 32 : 8,
              height: 8,
              borderRadius: 4,
              background: current === i ? C.oceanBlue : C.sand,
              border: "none",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
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

/* ══════════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════════ */
function Nav({ page, setPage, scrollY, isEditing }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = scrollY > 50;

  const isServicesPage = page === "services" || page === "audit" || page === "implementation" || page === "fractional" || page === "corporate";
  const go = (p) => { if (isEditing) return; setPage(p); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const navBtn = (label, target) => (
    <button onClick={() => go(target)} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: (target === "services" ? isServicesPage : page === target) ? 600 : 400, fontSize: 14, color: C.charcoal, background: "none", border: "none", cursor: isEditing ? "default" : "pointer", padding: "6px 2px", borderBottom: (target === "services" ? isServicesPage : page === target) ? `2px solid ${C.oceanBlue}` : "2px solid transparent", transition: "all 0.3s", letterSpacing: "0.2px", opacity: isEditing ? 0.5 : 1 }}>{label}</button>
  );

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
        background: C.oceanBlue,
        border: `2px solid ${C.white}`,
        color: C.white,
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(123, 167, 179, 0.3)",
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
   PAGE: HOME
   ══════════════════════════════════════════════════════════════ */
function HomePage({ setPage }) {
  const { getContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  const [loaded, setLoaded] = useState(false);
  const scrollY = useScrollY();
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const parallaxY = Math.min(scrollY * 0.15, 150);

  return (
    <>
      {/* ── HERO (PLM: grid bg, big bold text, centered) ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: gridBgWhite, padding: "120px clamp(20px, 5vw, 56px) 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Animated gradient background */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(123, 167, 179, 0.08) 0%, rgba(213, 206, 227, 0.08) 50%, rgba(245, 230, 220, 0.08) 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 15s ease infinite",
          zIndex: 0,
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 820, position: "relative", zIndex: 1, transform: `translate3d(0, ${parallaxY}px, 0)`, willChange: "transform" }}>
          {/* Bubble tags */}
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(36px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.1s", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            {(getContent("home.hero.bubbleTags") || []).map((t, i) => (
              <BubbleTag key={i} emoji={t.emoji} text={t.text} />
            ))}
          </div>

          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(36px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.15s" }}>
            <h1 style={{
              fontFamily: "'Rubik', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(40px, 7vw, 80px)",
              background: "linear-gradient(135deg, #2D2D2D 0%, #7BA7B3 50%, #9B8B6B 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.02,
              margin: "0 0 20px",
              textTransform: "lowercase",
              letterSpacing: "-1.5px",
              animation: "gradientText 8s ease infinite"
            }}>
              <EditableText contentKey="home.hero.heading" as="span" style={{ background: "inherit", WebkitBackgroundClip: "inherit", WebkitTextFillColor: "inherit", backgroundClip: "inherit" }} />
            </h1>
          </div>

          {/* Typewriter animation */}
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(28px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.3s", marginBottom: 20 }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 2.5vw, 28px)", color: C.oceanBlue, minHeight: 36 }}>
              <TypewriterText phrases={["systems that scale", "revenue that grows", "a life you actually enjoy", "boundaries that stick", "growth without burnout"]} speed={70} deleteSpeed={35} pauseDuration={2200} />
            </p>
          </div>

          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(28px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.35s" }}>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 400, fontSize: "clamp(15px, 1.8vw, 18px)", color: C.body, lineHeight: 1.65, maxWidth: 620, margin: "0 auto 36px" }}>
              <EditableText contentKey="home.hero.subheading" as="span" />
            </p>
          </div>
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.55s", display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={() => nav("services")}><EditableText contentKey="home.hero.ctaPrimary" as="span" /></Btn>
            <Btn variant="outline" onClick={() => nav("contact")}><EditableText contentKey="home.hero.ctaSecondary" as="span" /></Btn>
          </div>
        </div>
      </section>

      {/* ── MARQUEE (PLM pattern) ── */}
      <Marquee text="feel-good systems · built with intention · sustainable growth" />

      {/* ── WELCOME / PERMISSION SLIP ── */}
      <SectionWrap bgImage={gridBgSand} py="72px">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
          <FadeIn>
            <EditableImage contentKey="image.home.welcome" placeholderEmoji="🏖️" placeholderLabel="your new ops partner" placeholderHeight={400} placeholderBg={C.oceanLight} placeholderRadius={20} />
          </FadeIn>
          <FadeIn delay={120}>
            <ScriptLabel size={22}><EditableText contentKey="home.welcome.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 40px)", color: C.charcoal, lineHeight: 1.1, margin: "0 0 20px" }}><EditableText contentKey="home.welcome.heading" as="span" /></h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 20 }}><EditableText contentKey="home.welcome.body1" as="span" /></p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: C.oceanBlue, fontWeight: 600, marginBottom: 16 }}><EditableText contentKey="home.welcome.highlight" as="span" /></p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.7 }}><EditableText contentKey="home.welcome.body2" as="span" /></p>
          </FadeIn>
        </div>
      </SectionWrap>

      <EditableBlockList contentKey="blocks.home.welcome" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* ── CORE VALUES ── */}
      <SectionWrap bg={C.white} py="72px">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <ScriptLabel size={22} color={C.oceanBlue} style={{ textAlign: "center" }}><EditableText contentKey="home.coreValues.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.coreValues.heading" as="span" /></h2>
          </div>
        </FadeIn>
        <EditableCardGroup
          contentKey="home.coreValues.cards"
          defaultNewItem={{ emoji: "✨", title: "new value", desc: "description here" }}
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 900, margin: "0 auto", alignItems: "stretch" }}
          renderCard={(v, i) => (
            <div style={{
              background: C.cream,
              borderRadius: 20,
              padding: "28px 24px",
              border: `1.5px solid ${C.sand}`,
              textAlign: "center",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
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

      {/* ── WHAT GOOD SYSTEMS LOOK LIKE (before/after comparison) ── */}
      <SectionWrap bgImage={gridBgOcean} py="72px">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <ScriptLabel size={22} color={C.oceanBlue} style={{ textAlign: "center" }}><EditableText contentKey="home.systemsComparison.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.systemsComparison.heading" as="span" /></h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 800, margin: "0 auto", alignItems: "stretch" }}>
          <FadeIn delay={0} style={{ display: "flex" }}>
            <div style={{ background: `${C.coral}15`, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${C.coral}30`, flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.coral, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <BlinkEmoji emoji="😵‍💫" size={20} /> without systems
              </h3>
              {(getContent("home.systemsComparison.without") || []).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}>
                  <span style={{ color: C.coral, flexShrink: 0 }}>✕</span>
                  <EditableArrayString contentKey="home.systemsComparison.without" index={i} />
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={150} style={{ display: "flex" }}>
            <div style={{ background: `${C.oceanBlue}12`, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${C.oceanBlue}30`, flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.oceanBlue, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <BlinkEmoji emoji="✨" size={20} /> with systems
              </h3>
              {(getContent("home.systemsComparison.with") || []).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}>
                  <span style={{ color: C.oceanBlue, flexShrink: 0 }}>✦</span>
                  <EditableArrayString contentKey="home.systemsComparison.with" index={i} />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </SectionWrap>

      {/* ── CHOOSE YOUR PATH (audience cards) ── */}
      <SectionWrap bg={C.cream} py="80px">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <ScriptLabel size={22} style={{ textAlign: "center" }}><EditableText contentKey="home.pathCards.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: C.charcoal, margin: "0 0 20px", lineHeight: 1.1 }}><EditableText contentKey="home.pathCards.heading" as="span" /></h2>
          </div>
          {/* Audience anchor buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            {(getContent("home.pathCards.anchorButtons") || []).map((t, i) => (
              <BubbleTag key={i} emoji={t.emoji} text={t.text} bg={[C.pinkSoft, C.oceanLight, C.lavenderLight][i] || C.cream} style={{ cursor: "pointer" }} />
            ))}
          </div>
        </FadeIn>

        <EditableCardGroup
          contentKey="home.pathCards"
          defaultNewItem={{ title: "new path", body: "description here", cta: "learn more →", page: "contact" }}
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            const accents = [C.coral, C.oceanBlue, C.lavender];
            return (
              <div
                onClick={() => nav(c.page || "contact")}
                style={{
                  background: C.white,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: `1px solid ${C.sand}`,
                  cursor: isEditing ? "default" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={isEditing ? undefined : e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={isEditing ? undefined : e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ background: bgColors[i % 3], padding: "32px 24px 28px", borderBottom: `3px solid ${accents[i % 3]}` }}>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: C.charcoal, margin: 0, lineHeight: 1.2 }}>
                    <EditableArrayText contentKey="home.pathCards" index={i} field="title" as="span" />
                  </h3>
                </div>
                <div style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>
                    <EditableArrayText contentKey="home.pathCards" index={i} field="body" as="span" />
                  </p>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.oceanBlue, marginTop: "auto" }}>
                    <EditableArrayText contentKey="home.pathCards" index={i} field="cta" as="span" />
                  </span>
                </div>
              </div>
            );
          }}
        />
      </SectionWrap>

      <EditableBlockList contentKey="blocks.home.pathCards" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* ── PROOF / STATS (PLM: grid of stat cards) ── */}
      <EditableSection contentKey="visibility.home.stats">
      <SectionWrap bgImage={gridBgOcean} py="80px">
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
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(123, 167, 179, 0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 167, 179, 0.05)";
              }}
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "28px 20px",
                textAlign: "center",
                border: `1px solid ${C.oceanLight}`,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: "default",
                boxShadow: "0 4px 12px rgba(123, 167, 179, 0.05)"
              }}>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 36, color: C.oceanBlue, marginBottom: 8 }}>
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

      {/* ── SOCIAL PROOF ── */}
      <EditableSection contentKey="visibility.home.socialProof">
      <SectionWrap bg={C.white} py="56px">
        <SocialProof />
      </SectionWrap>
      </EditableSection>

      {/* ── TESTIMONIALS CAROUSEL ── */}
      <EditableSection contentKey="visibility.home.testimonials">
      <SectionWrap bg={C.cream} py="72px">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <ScriptLabel size={22} style={{ textAlign: "center" }}><EditableText contentKey="home.testimonials.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 38px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.testimonials.heading" as="span" /></h2>
          </div>
          <TestimonialCarousel />
        </FadeIn>
      </SectionWrap>
      </EditableSection>

      {/* ── NEWSLETTER / CABANA CLUB (PLM: branded signup section) ── */}
      <EditableSection contentKey="visibility.home.newsletter">
      <SectionWrap bgImage={gridBgLavender} py="72px">
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

      <EditableBlockList contentKey="blocks.home.stats" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }} />

      {/* ── CLOSING CTA ── */}
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
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sand, marginBottom: 32 }}><EditableText contentKey="home.closing.script" as="span" /></p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn variant="ocean" onClick={() => nav("services")}><EditableText contentKey="home.closing.cta" as="span" /></Btn>
              <Btn variant="outline" onClick={() => nav("contact")} style={{ borderColor: C.sand, color: C.sand }}>book a discovery call →</Btn>
            </div>
          </div>
        </FadeIn>
      </SectionWrap>
      </EditableSection>

      <Marquee text="life-first business · grow without burnout · real systems for real people" bg={C.oceanBlue} color={C.white} />
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
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 36px", textAlign: "center" }}>
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
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            return (
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => nav(c.page || "contact")}>
                <div style={{ background: c.bg || bgColors[i % 3], padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 48, color: `${C.charcoal}20` }}>{c.num}</span>
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
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            return (
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => nav(c.page || "contact")}>
                <div style={{ background: c.bg || bgColors[i % 3], padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 48, color: `${C.charcoal}20` }}>{c.num}</span>
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
          gridStyle={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40, alignItems: "stretch" }}
          renderCard={(c, i) => {
            const bgColors = [C.pinkSoft, C.oceanLight, C.lavenderLight];
            return (
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => nav(c.page || "contact")}>
                <div style={{ background: c.bg || bgColors[i % 3], padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 48, color: `${C.charcoal}20` }}>{c.num}</span>
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
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px", textAlign: "center" }}>
        {price && <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 13, color: C.white, background: C.oceanBlue, padding: "6px 20px", borderRadius: 50, display: "inline-block", marginBottom: 16 }}>{price}</span>}
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 5vw, 52px)", color: C.charcoal, lineHeight: 1.05, margin: "0 0 8px", letterSpacing: "-0.8px" }}><EditableText contentKey={p + ".title"} as="span" /></h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.warmTan }}><EditableText contentKey={p + ".subtitle"} as="span" /></p>
      </section>

      <SectionWrap bg={C.charcoal} py="56px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel color={C.sand}>the problem</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: `${C.sand}dd`, lineHeight: 1.75 }}><EditableText contentKey={p + ".problem"} as="span" /></p>
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bgImage={gridBgWhite} py="64px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel>what this is</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 20 }}><EditableText contentKey={p + ".whatIntro"} as="span" /></p>
            {includes.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                <span style={{ color: C.oceanBlue, flexShrink: 0, paddingTop: 2 }}>✦</span>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.6 }}><EditableArrayString contentKey={p + ".includes"} index={i} /></span>
              </div>
            ))}
            {timeline.length > 0 && <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {timeline.map((t, i) => <span key={i} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, background: C.yellow, color: C.charcoal, padding: "5px 16px", borderRadius: 50 }}>{t}</span>)}
            </div>}
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bg={C.cream} py="64px">
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
        <div style={{ textAlign: "center" }}><Btn variant="primary" onClick={() => nav("contact")}><EditableText contentKey={p + ".cta"} as="span" /></Btn></div>
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
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
          <EditableImage contentKey="image.about.hero" placeholderEmoji="👋" placeholderLabel="hi, i'm sam" placeholderHeight={440} placeholderBg={C.pinkSoft} placeholderRadius={20} />
          <div>
            <ScriptLabel size={22}><EditableText contentKey="about.hero.scriptLabel" as="span" /></ScriptLabel>
            <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", color: C.charcoal, lineHeight: 1.05, margin: "0 0 12px" }}><EditableText contentKey="about.hero.title" as="span" /></h1>
            {/* Typewriter personality traits */}
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 21, color: C.oceanBlue, marginBottom: 20, minHeight: 30 }}>
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
      <SectionWrap bg={C.charcoal} py="72px">
        <FadeIn>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ScriptLabel size={22} color={C.sand}><EditableText contentKey="about.beliefs.scriptLabel" as="span" /></ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3vw, 34px)", color: C.cream, margin: "0 0 24px" }}><EditableText contentKey="about.beliefs.heading" as="span" /></h2>
            {(getContent("about.beliefs") || []).map((c, i, arr) => (
              <div key={i} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.warmTan}22` : "none", padding: "22px 0" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 17, color: C.yellow, margin: "0 0 8px" }}><EditableArrayText contentKey="about.beliefs" index={i} field="b" as="span" /></h3>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14.5, color: `${C.sand}cc`, lineHeight: 1.65, margin: 0 }}><EditableArrayText contentKey="about.beliefs" index={i} field="d" as="span" /></p>
              </div>
            ))}
          </div>
        </FadeIn>
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
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sand, marginBottom: 28 }}>
              <EditableText contentKey="about.cta.script" as="span" />
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn variant="ocean" onClick={() => nav("services")}>work with me →</Btn>
              <Btn variant="outline" onClick={() => nav("resources")} style={{ borderColor: C.sand, color: C.sand }}>join the cabana club →</Btn>
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
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="resources.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.warmTan }}><EditableText contentKey="resources.hero.subheading" as="span" /></p>
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
              <div style={{ minWidth: 260, maxWidth: 280, flexShrink: 0, scrollSnapAlign: "start", background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, transition: "transform 0.3s", cursor: "pointer" }}
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
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 36px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="contact.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.warmTan }}><EditableText contentKey="contact.hero.subheading" as="span" /></p>
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
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.warmTan }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Rubik:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
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
