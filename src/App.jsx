import { useState, useEffect, useRef, useCallback } from "react";

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
    const h = () => setY(window.scrollY);
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

/* ══════════════════════════════════════════════════════════════
   MARQUEE / INFINITE TICKER (PLM pattern)
   ══════════════════════════════════════════════════════════════ */
function Marquee({ text, bg = C.charcoal, color = C.sand, speed = 30 }) {
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
        display: "flex", gap, overflowX: "auto", scrollSnapType: "x mandatory",
        padding: "8px 0 20px", scrollbarWidth: "thin", scrollbarColor: `${C.sand} transparent`,
        WebkitOverflowScrolling: "touch",
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
  const base = { fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, border: "none", borderRadius: 50, padding: "14px 34px", cursor: "pointer", transition: "all 0.3s ease", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "0.2px" };
  const v = {
    primary: { ...base, background: C.charcoal, color: C.cream, border: `2px solid ${C.charcoal}` },
    sand: { ...base, background: C.sand, color: C.charcoal, border: `2px solid ${C.sand}` },
    outline: { ...base, background: "transparent", color: C.charcoal, border: `2px solid ${C.charcoal}` },
    ocean: { ...base, background: C.oceanBlue, color: C.white, border: `2px solid ${C.oceanBlue}` },
    yellow: { ...base, background: C.yellow, color: C.charcoal, border: `2px solid ${C.charcoal}` },
    white: { ...base, background: C.white, color: C.charcoal, border: `2px solid ${C.charcoal}` },
  };
  return <button onClick={onClick} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }} style={{ ...v[variant], ...style }}>{children}</button>;
}

function SectionWrap({ children, bg, bgImage, py = "80px", style = {} }) {
  return (
    <section style={{ background: bgImage || bg || C.cream, padding: `${py} clamp(20px, 5vw, 56px)`, ...style }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function ProcessStep({ num, text, accent = C.oceanBlue }) {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "22px 0", borderBottom: `1px solid ${C.sand}` }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.white, flexShrink: 0 }}>{num}</div>
      <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  );
}

function TwoColFit({ perfect, notFit }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}` }}>
        <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 16px" }}>perfect if you:</h4>
        {perfect.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.55 }}><span style={{ color: C.oceanBlue, flexShrink: 0 }}>✦</span>{p}</div>)}
      </div>
      <div style={{ background: C.warmWhite, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.sand}` }}>
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

function NewsletterForm({ compact = false }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const inputS = { fontFamily: "'Rubik', sans-serif", fontSize: 15, border: `1.5px solid ${C.sand}`, borderRadius: 50, padding: "13px 22px", outline: "none", background: C.white, width: "100%", boxSizing: "border-box" };

  if (done) return <div style={{ textAlign: "center", padding: 16 }}><span style={{ fontSize: 28 }}>🎉</span><p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, marginTop: 8 }}>you're in! check your inbox.</p></div>;

  return (
    <div style={{ display: "flex", flexDirection: compact ? "row" : "column", gap: 12, maxWidth: compact ? 500 : 400, flexWrap: "wrap" }}>
      {!compact && <input placeholder="first name" value={name} onChange={e => setName(e.target.value)} style={inputS} />}
      <input type="email" placeholder="email address" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputS, flex: compact ? 1 : undefined, minWidth: compact ? 200 : undefined }} />
      <Btn variant="primary" onClick={() => { if (email.includes("@")) setDone(true); }} style={compact ? { whiteSpace: "nowrap" } : {}}>sign me up →</Btn>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PHOTO PLACEHOLDER (PLM uses real imagery — placeholder for now)
   ══════════════════════════════════════════════════════════════ */
function PhotoBlock({ emoji = "📸", label = "", h = 320, bg = C.sandLight, radius = 16 }) {
  return (
    <div style={{ width: "100%", height: h, background: bg, borderRadius: radius, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, overflow: "hidden" }}>
      <span style={{ fontSize: 48 }}>{emoji}</span>
      {label && <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.warmTan }}>{label}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════════ */
function Nav({ page, setPage, scrollY }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servDrop, setServDrop] = useState(false);
  const scrolled = scrollY > 50;

  const go = (p) => { setPage(p); setMenuOpen(false); setServDrop(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const navBtn = (label, target) => (
    <button onClick={() => go(target)} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: page === target ? 600 : 400, fontSize: 14, color: C.charcoal, background: "none", border: "none", cursor: "pointer", padding: "6px 2px", borderBottom: page === target ? `2px solid ${C.oceanBlue}` : "2px solid transparent", transition: "all 0.3s", letterSpacing: "0.2px" }}>{label}</button>
  );

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(250,247,242,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.sand}` : "none",
      transition: "all 0.4s", padding: "0 clamp(16px, 4vw, 48px)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? 56 : 66, transition: "height 0.3s" }}>
        <button onClick={() => go("home")} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 17, color: C.charcoal, background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.3px" }}>by samantha brown</button>

        <nav style={{ display: "flex", gap: 28, alignItems: "center" }} className="dsk-nav">
          {navBtn("home", "home")}
          <div style={{ position: "relative" }} onMouseEnter={() => setServDrop(true)} onMouseLeave={() => setServDrop(false)}>
            <button style={{ fontFamily: "'Rubik', sans-serif", fontWeight: page.startsWith("serv") || page === "audit" || page === "implementation" || page === "fractional" || page === "corporate" ? 600 : 400, fontSize: 14, color: C.charcoal, background: "none", border: "none", cursor: "pointer", padding: "6px 2px" }}>services ▾</button>
            {servDrop && (
              <div style={{ position: "absolute", top: "100%", left: -8, background: C.white, border: `1px solid ${C.sand}`, borderRadius: 14, padding: "8px 0", minWidth: 240, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}>
                {[["services", "all services"], ["audit", "brand experience audit"], ["implementation", "full implementation"], ["fractional", "fractional consulting"], ["corporate", "workshops & training"]].map(([k, l]) => (
                  <button key={k} onClick={() => go(k)} style={{ display: "block", width: "100%", textAlign: "left", fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.charcoal, background: "none", border: "none", cursor: "pointer", padding: "10px 20px" }}>{l}</button>
                ))}
              </div>
            )}
          </div>
          {navBtn("about", "about")}
          {navBtn("resources", "resources")}
          {navBtn("contact", "contact")}
          <Btn variant="ocean" onClick={() => go("services")} style={{ padding: "10px 24px", fontSize: 13 }}>work with me</Btn>
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mob-toggle" style={{ display: "none", background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.charcoal }}>{menuOpen ? "✕" : "☰"}</button>
      </div>

      {menuOpen && (
        <div className="mob-menu" style={{ background: C.cream, padding: "12px 20px 24px", borderTop: `1px solid ${C.sand}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {[["home", "home"], ["services", "services"], ["audit", "— brand experience audit"], ["implementation", "— full implementation"], ["fractional", "— fractional consulting"], ["corporate", "— workshops & training"], ["about", "about"], ["resources", "resources"], ["contact", "contact"]].map(([k, l]) => (
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
function Footer({ setPage }) {
  const go = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <footer style={{ background: C.charcoal, padding: "56px clamp(20px, 5vw, 48px) 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.cream, marginBottom: 8 }}>by samantha brown</div>
          <ScriptLabel color={C.sand} size={18} style={{ marginBottom: 0 }}>built with intention, not perfection</ScriptLabel>
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
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: `${C.sand}55` }}>© 2025 by samantha brown | built with intention, not perfection</p>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: HOME
   ══════════════════════════════════════════════════════════════ */
function HomePage({ setPage }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <>
      {/* ── HERO (PLM: grid bg, big bold text, centered) ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: gridBgWhite, padding: "120px clamp(20px, 5vw, 56px) 40px", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: 820 }}>
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(36px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.15s" }}>
            <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(40px, 7vw, 80px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 28px", textTransform: "lowercase", letterSpacing: "-1.5px" }}>
              your business should fit your life, not hijack it
            </h1>
          </div>
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(28px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.35s" }}>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 400, fontSize: "clamp(15px, 1.8vw, 18px)", color: C.body, lineHeight: 1.65, maxWidth: 620, margin: "0 auto 36px" }}>
              feel-good systems, revenue expansion & brand experiences for established creators, service providers & leaders who are done choosing between growth and their sanity
            </p>
          </div>
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.9s cubic-bezier(.22,.61,.36,1) 0.55s", display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={() => { setPage("services"); window.scrollTo({ top: 0 }); }}>work with me</Btn>
            <Btn variant="outline" onClick={() => { setPage("contact"); window.scrollTo({ top: 0 }); }}>brand partnerships</Btn>
          </div>
        </div>
      </section>

      {/* ── MARQUEE (PLM pattern) ── */}
      <Marquee text="feel-good systems" />

      {/* ── WELCOME / PERMISSION SLIP ── */}
      <SectionWrap bgImage={gridBgSand} py="72px">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
          <FadeIn>
            <PhotoBlock emoji="🏖️" label="your new ops partner" h={400} bg={C.oceanLight} radius={20} />
          </FadeIn>
          <FadeIn delay={120}>
            <ScriptLabel size={22}>welcome to by samantha brown</ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 40px)", color: C.charcoal, lineHeight: 1.1, margin: "0 0 20px" }}>the permission slip you didn't know you needed</h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 20 }}>if you're tired of forcing yourself into someone else's 5am routine, having all your income tied to one stream, downloading notion templates that immediately collect dust, and feeling like you need to be "on" 24/7 to be successful...</p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: C.oceanBlue, fontWeight: 600, marginBottom: 16 }}>you're in the right place.</p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.7 }}>no hustle culture. no cookie-cutter frameworks. just systems that work with how you actually operate and support from someone who's been through the burnout and rebuilt differently.</p>
          </FadeIn>
        </div>
      </SectionWrap>

      {/* ── HOW WE WORK (PLM: photo cards with descriptions) ── */}
      <SectionWrap bg={C.cream} py="80px">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <ScriptLabel size={22} style={{ textAlign: "center" }}>how we'll work together</ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: C.charcoal, margin: 0, lineHeight: 1.1 }}>choose your path</h2>
          </div>
        </FadeIn>

        <HorizontalScroll gap={24}>
          {[
            { emoji: "🏖️", label: "systems & strategy", title: "for creators & service providers", body: "your backend shouldn't feel like a full-time job. and your income shouldn't rely on just one thing. let's build something that scales without burning you out—whether that's finally launching that email list, planning your first in-person event, or creating new income streams that actually fit your life.", cta: "explore services →", page: "services", bg: C.pinkSoft },
            { emoji: "🤝", label: "leadership & teams", title: "for corporate teams & leaders", body: "high-performing teams don't need micromanaging—they need systems that make collaboration easy and leaders who've learned (often the hard way) how to build sustainability into their approach.", cta: "explore workshops →", page: "corporate", bg: C.oceanLight },
            { emoji: "✨", label: "partnerships", title: "for brands & organizations", body: "collaborations for brands who value authenticity over aesthetics. let's create something people actually want to engage with.", cta: "let's collaborate →", page: "contact", bg: C.lavenderLight },
          ].map((c, i) => (
            <div key={i} style={{ minWidth: 320, maxWidth: 360, flexShrink: 0, scrollSnapAlign: "start", background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, transition: "transform 0.3s", cursor: "pointer", display: "flex", flexDirection: "column" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              onClick={() => { setPage(c.page); window.scrollTo({ top: 0 }); }}>
              <PhotoBlock emoji={c.emoji} label={c.label} h={220} bg={c.bg} radius={0} />
              <div style={{ padding: "24px 22px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 18, color: C.charcoal, margin: "0 0 10px", lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>{c.body}</p>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.oceanBlue, marginTop: "auto" }}>{c.cta}</span>
              </div>
            </div>
          ))}
        </HorizontalScroll>
      </SectionWrap>

      {/* ── PROOF / STATS (PLM: grid of stat cards) ── */}
      <SectionWrap bgImage={gridBgOcean} py="80px">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <ScriptLabel size={22} color={C.oceanBlue} style={{ textAlign: "center" }}>the proof</ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: C.charcoal, margin: 0 }}>proof this actually works</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 36 }}>
          {[
            { stat: "6+", label: "years building & leading high-performing teams across 8 global regions" },
            { stat: "8.9+", label: "/10 team engagement scores (consistently, not just once)" },
            { stat: "15+", label: "hires onboarded & trained, 5 now in leadership roles" },
            { stat: "94%", label: "adoption rate for Asana across distributed teams" },
            { stat: "96%", label: "adoption rate for major platform transitions" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 80} style={{ height: "100%" }}>
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
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  cursor: "default",
                  boxShadow: "0 4px 12px rgba(123, 167, 179, 0.05)"
                }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 36, color: C.oceanBlue, marginBottom: 8 }}>{s.stat}</div>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12.5, color: C.body, lineHeight: 1.5, margin: 0 }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={400}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
              {["certified asana ambassador", "notion certified", "4-day corporate week"].map(t => (
                <span key={t} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 11, color: C.charcoal, background: C.yellow, padding: "5px 16px", borderRadius: 50, letterSpacing: "0.3px" }}>{t}</span>
              ))}
            </div>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>but here's the real story: i got here by burning out first, then rebuilding everything—my systems, my boundaries, my entire approach. now i help you skip the burnout part.</p>
          </div>
        </FadeIn>
      </SectionWrap>

      {/* ── TESTIMONIAL (PLM: full-width featured card) ── */}
      <SectionWrap bg={C.cream} py="72px">
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
            <PhotoBlock emoji="💼" label="martech transformation" h={340} bg={C.lavenderLight} radius={20} />
            <div>
              <ScriptLabel>kind words</ScriptLabel>
              <div style={{ position: "relative", paddingLeft: 28 }}>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 72, color: C.lavender, position: "absolute", top: -20, left: -4, lineHeight: 1 }}>"</span>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 16 }}>
                  Sam consistently demonstrated excellent communication skills, ensuring both my team and I were fully informed. She was particularly adept at identifying and highlighting key areas that required our attention, which was critical to the project's success. Her pragmatic approach to decision-making and remarkable ability to see the big picture allowed her to make well-considered decisions that balanced immediate needs with long-term strategic goals.
                </p>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: C.warmTan, margin: 0, fontWeight: 500 }}>— cross-functional project lead, martech transformation</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionWrap>

      {/* ── NEWSLETTER / CABANA CLUB (PLM: branded signup section) ── */}
      <SectionWrap bgImage={gridBgLavender} py="72px">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>🏖️</span>
            <ScriptLabel size={24} color={C.oceanBlue} style={{ textAlign: "center" }}>every wednesday in your inbox</ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 40px)", color: C.charcoal, margin: "0 0 16px" }}>join the cabana club 🏖️</h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, marginBottom: 28 }}>bi-weekly insights on building a business that doesn't require you to be a different person. no productivity guilt, no "monetize your mornings" bs. just real talk about systems, revenue expansion, and growing sustainably.</p>
            <div style={{ display: "flex", justifyContent: "center" }}><NewsletterForm /></div>
          </FadeIn>
        </div>
      </SectionWrap>

      {/* ── CLOSING ── */}
      <SectionWrap bg={C.charcoal} py="72px">
        <PullQuote quote="Almost everything will work again if you unplug it for a few minutes, including you." author="anne lamott" bg={`${C.warmTan}15`} />
      </SectionWrap>

      <SectionWrap bgImage={gridBgWhite} py="72px">
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: C.body, lineHeight: 1.75, marginBottom: 20 }}>
              this isn't about doing more. it's about building smarter so you can actually enjoy what you've created. whether you're a creator ready to expand your income streams, a service provider who needs backend systems that don't make you want to cry, a leader trying to stop the burnout cycle, or a brand looking for partnerships that feel authentic—welcome.
            </p>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.warmTan, marginBottom: 32 }}>grab an iced latte, pull up a chair, and let's figure this out together. ☕</p>
            <Btn variant="primary" onClick={() => { setPage("services"); window.scrollTo({ top: 0 }); }}>let's work together →</Btn>
          </FadeIn>
        </div>
      </SectionWrap>

      <Marquee text="feel-good systems" bg={C.oceanBlue} color={C.white} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: SERVICES HUB
   ══════════════════════════════════════════════════════════════ */
function ServicesPage({ setPage }) {
  return (
    <>
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px", textAlign: "center" }}>
        <ScriptLabel size={22} style={{ textAlign: "center" }}>find your fit</ScriptLabel>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 6vw, 64px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}>choose your path</h1>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: C.body, maxWidth: 460, margin: "0 auto" }}>not sure where to start? no worries—let's break it down.</p>
      </section>

      <Marquee text="systems that actually work" bg={C.sand} color={C.charcoal} />

      {/* CREATORS */}
      <SectionWrap bg={C.cream} py="72px">
        <FadeIn>
          <ScriptLabel size={22}>for the creators & service providers</ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: C.charcoal, margin: "0 0 12px" }}>systems that don't require you to be a different person</h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, maxWidth: 680, marginBottom: 36 }}>you didn't start your business to spend hours wrestling with dubsado, notion, or whatever "game-changing" tool someone sold you on. you started it because you're really good at what you do. but now your backend is held together with duct tape and desperate energy. that's where i come in.</p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40 }}>
          {[
            { num: "01", title: "the brand experience audit", price: "$350", body: "an unbiased look at your current client journey, backend systems, revenue streams, and where things are breaking down. detailed action plan + priority recommendations.", page: "audit", bg: C.pinkSoft },
            { num: "02", title: "the brand experience (full implementation)", price: "starting at $1.5k", body: "the \"do it for me\" option. we start with the audit, then i build your entire backend—client onboarding, workflows, automation, templates, email marketing, the whole thing.", page: "implementation", bg: C.oceanLight },
            { num: "03", title: "fractional consulting", price: "limited spots", body: "ongoing support without the agency retainer. think: a business bestie who actually knows what they're talking about. monthly strategy sessions + async access.", page: "fractional", bg: C.lavenderLight },
          ].map((c, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => { setPage(c.page); window.scrollTo({ top: 0 }); }}>
                <div style={{ background: c.bg, padding: "32px 24px 24px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 48, color: `${C.charcoal}20` }}>{c.num}</span>
                </div>
                <div style={{ padding: "24px 22px 28px" }}>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, color: C.oceanBlue, background: C.oceanLight, padding: "4px 14px", borderRadius: 50 }}>{c.price}</span>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 18, color: C.charcoal, margin: "12px 0 10px" }}>{c.title}</h3>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>{c.body}</p>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.oceanBlue }}>learn more →</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn><TwoColFit
          perfect={["have an established community (even if it's small but mighty)", "are ready to expand beyond your current revenue streams", "want to build an email list that actually converts", "need backend systems that can handle growth", "value strategic support over just \"here's another template\""]}
          notFit={["are just getting started (like, first 10 followers started)", "want someone to tell you exactly what to do without collaboration", "aren't ready to invest in your business infrastructure"]}
        /></FadeIn>
      </SectionWrap>

      {/* CORPORATE */}
      <SectionWrap bg={C.charcoal} py="72px">
        <FadeIn>
          <ScriptLabel size={22} color={C.sand}>for the corporate folks</ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: C.cream, margin: "0 0 12px" }}>leadership development that doesn't feel like corporate theater</h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: `${C.sand}cc`, lineHeight: 1.75, maxWidth: 600, marginBottom: 28 }}>i'm here to help you build teams that don't need constant hand-holding and systems that actually get adopted—not just rolled out and ignored.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {["team engagement workshops", "leadership consulting for managers", "custom training programs"].map(t => (
              <div key={t} style={{ background: `${C.warmTan}15`, borderRadius: 14, padding: "18px 22px", border: `1px solid ${C.warmTan}25` }}>
                <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, color: C.yellow, margin: 0 }}>{t}</h4>
              </div>
            ))}
          </div>
          <Btn variant="yellow" onClick={() => { setPage("corporate"); window.scrollTo({ top: 0 }); }}>explore workshops →</Btn>
        </FadeIn>
      </SectionWrap>

      {/* BRANDS */}
      <SectionWrap bgImage={gridBgLavender} py="72px">
        <FadeIn>
          <ScriptLabel size={22} color={C.oceanBlue}>for brands & organizations</ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 38px)", color: C.charcoal, margin: "0 0 12px" }}>partnerships for people who value authenticity</h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, maxWidth: 600, marginBottom: 28 }}>i'm not here to post a perfectly curated flat lay. i'm here to create content that actually converts, partnerships that feel aligned, and collaborations your audience will genuinely care about.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[{ icon: "🎤", t: "speaking engagements" }, { icon: "🤝", t: "brand collaborations" }, { icon: "📱", t: "ugc & content creation" }].map(c => (
              <div key={c.t} style={{ background: C.white, borderRadius: 16, padding: "24px 20px", textAlign: "center", border: `1px solid ${C.lavender}` }}>
                <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>{c.icon}</span>
                <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 14, color: C.charcoal, margin: 0 }}>{c.t}</h4>
              </div>
            ))}
          </div>
          <Btn variant="primary" onClick={() => { setPage("contact"); window.scrollTo({ top: 0 }); }}>let's collaborate →</Btn>
        </FadeIn>
        <div style={{ marginTop: 48 }}>
          <PullQuote quote="The most courageous act is still to think for yourself. Aloud." author="coco chanel" bg={C.charcoal} />
        </div>
      </SectionWrap>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SERVICE DETAIL PAGES (Audit, Implementation, Fractional, Corporate)
   ══════════════════════════════════════════════════════════════ */
function ServiceDetailPage({ setPage, config }) {
  return (
    <>
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px", textAlign: "center" }}>
        {config.price && <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 13, color: C.white, background: C.oceanBlue, padding: "6px 20px", borderRadius: 50, display: "inline-block", marginBottom: 16 }}>{config.price}</span>}
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 5vw, 52px)", color: C.charcoal, lineHeight: 1.05, margin: "0 0 8px", letterSpacing: "-0.8px" }}>{config.title}</h1>
        {config.subtitle && <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.warmTan }}>{config.subtitle}</p>}
      </section>

      <SectionWrap bg={C.charcoal} py="56px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel color={C.sand}>the problem</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: `${C.sand}dd`, lineHeight: 1.75 }}>{config.problem}</p>
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bgImage={gridBgWhite} py="64px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel>what this is</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 20 }}>{config.whatIntro}</p>
            {config.includes.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                <span style={{ color: C.oceanBlue, flexShrink: 0, paddingTop: 2 }}>✦</span>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
            {config.timeline && <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {config.timeline.map(t => <span key={t} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, background: C.yellow, color: C.charcoal, padding: "5px 16px", borderRadius: 50 }}>{t}</span>)}
            </div>}
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bg={C.cream} py="64px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel>the process</ScriptLabel>
            {config.process.map((t, i) => <ProcessStep key={i} num={i + 1} text={t} />)}
          </div>
        </FadeIn>
      </SectionWrap>

      {config.fit && (
        <SectionWrap bgImage={gridBgSand} py="64px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <ScriptLabel>who this is for</ScriptLabel>
              <TwoColFit perfect={config.fit.perfect} notFit={config.fit.notFit} />
            </div>
          </FadeIn>
        </SectionWrap>
      )}

      {config.different && (
        <SectionWrap bg={C.white} py="64px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <ScriptLabel>what makes this different</ScriptLabel>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}>{config.different}</p>
            </div>
          </FadeIn>
        </SectionWrap>
      )}

      {config.quote && (
        <SectionWrap bg={C.charcoal} py="56px">
          <PullQuote quote={config.quote.text} author={config.quote.author} bg={`${C.warmTan}15`} />
        </SectionWrap>
      )}

      <SectionWrap bg={C.cream} py="48px">
        <div style={{ textAlign: "center" }}><Btn variant="primary" onClick={() => { setPage("contact"); window.scrollTo({ top: 0 }); }}>{config.cta || "let's do this →"}</Btn></div>
      </SectionWrap>
    </>
  );
}

/* Service configs */
const auditConfig = {
  price: "$350", title: "the brand experience audit", subtitle: "the deep dive",
  problem: "you know something's not working, but you can't quite put your finger on it. maybe it's clients asking the same questions over and over, all your income coming from one source and that starting to feel really risky, everyone telling you to \"build your email list\" but you haven't because overwhelm, or spending hours on admin tasks that should take 10 minutes. you can't fix what you can't see clearly. and you definitely can't scale what's barely holding together right now.",
  whatIntro: "a no-bs audit of your entire client journey & backend systems, delivered in a detailed loom walkthrough + written action plan.",
  includes: ["deep dive into your current client experience (from inquiry to offboarding)", "analysis of your backend systems (or lack thereof)", "revenue stream evaluation & expansion opportunities", "identification of what's working, what's broken, and what's missing", "prioritized recommendations (because \"do everything\" isn't a strategy)", "30-minute debrief call to walk through findings & answer questions"],
  timeline: ["timeline: 1 week", "investment: $350"],
  process: ["you fill out the intake form — tell me what's going on, what you've tried, where you're stuck", "i audit everything — client touchpoints, automation, workflows, templates, revenue streams, the whole backend", "you get a loom walkthrough — i walk you through exactly what i found & why it matters", "we debrief — 30-minute call to answer questions & prioritize next steps"],
  fit: { perfect: ["know your backend is a mess but don't know where to start", "want an outside perspective before investing in a full buildout", "are DIY-ing your systems but keep getting stuck", "need validation that you're not crazy for thinking things could be better", "are considering expanding income streams but need strategic direction"], notFit: ["want someone to just build it for you (that's the full implementation)", "aren't ready to actually implement changes", "are looking for a \"quick fix\" without putting in any work"] },
  cta: "let's do this →",
};

const implementationConfig = {
  price: "starting at $1.5k", title: "the brand experience", subtitle: "full implementation — everyone starts with the audit",
  problem: "you're really good at what you do. but every time you bring on a new client, you're copying & pasting from 17 different google docs, forgetting to send that one email, manually doing tasks that should be automated, and feeling like your business owns you instead of the other way around. they don't have more time. they just have better systems.",
  whatIntro: "the \"do it for me\" option. i build your entire brand experience & backend systems from scratch—or burn down what's not working and rebuild it properly.",
  includes: ["the audit (we always start here—no skipping)", "full client journey mapping (inquiry → onboarding → delivery → offboarding)", "custom workflows & automation", "templates for every client touchpoint (emails, contracts, welcome guides, questionnaires)", "revenue expansion strategy & income stream planning", "email marketing setup & strategy", "event/community coordination systems", "notion workspace setup (or whatever platform fits your brain)", "loom walkthrough of how everything works", "2 weeks of post-launch support"],
  timeline: ["timeline: 3-4 weeks", "starting at $1.5k"],
  process: ["we start with the audit — gotta know what we're working with", "strategy session — we map out your ideal client journey, revenue expansion & backend setup", "i build everything — you get async updates, i ask clarifying questions, you live your life", "walkthrough & training — i show you how everything works (via loom + live call)", "post-launch support — 2 weeks of 'hey quick question' access while you settle in"],
  fit: { perfect: ["don't have the time (or desire) to DIY your systems", "want a client experience that feels professional without feeling sterile", "are ready to invest in your business infrastructure", "value your time more than saving a few hundred bucks", "are ready to expand beyond your current revenue model"], notFit: ["just want templates you can plug & play", "aren't ready to invest at this level", "want to control every single detail of the buildout"] },
  different: "i'm not handing you a template and calling it custom. i'm building something that works with your brain (not against it), doesn't require you to change who you are, your clients will feel (in the best way), you can maintain without hiring a VA, and supports multiple income streams without multiplying your workload. the goal isn't to make your business look good. it's to make it feel sustainable.",
  cta: "let's start with the audit →",
};

const fractionalConfig = {
  price: "$2,200/month · 3 clients/quarter max", title: "fractional consulting", subtitle: "your business bestie who actually knows what they're talking about",
  problem: "you don't need a full-time consultant or an agency retainer. but you do need someone who gets it, a second brain for the strategic stuff, accountability that doesn't feel like shame, troubleshooting help when things break, permission to do things differently, and support while you figure out new income streams or plan that first event. basically, you need a business bestie who actually knows what they're talking about.",
  whatIntro: "ongoing support without the agency retainer or the \"you're on your own\" vibe of a one-off project.",
  includes: ["monthly 90-minute strategy sessions (via zoom or loom, your choice)", "async access via slack or email for quick questions", "support for whatever you're working on: expanding income streams, launching that email list, planning events, building systems", "system audits & optimization as needed", "accountability check-ins (the kind that feel supportive, not judgey)", "access to my templates, frameworks, and resources"],
  timeline: ["minimum 3-month commitment", "$2,200/month"],
  process: ["application — tell me what's going on, what you need, what you've tried", "intro call — let's make sure we're a good fit (chemistry matters)", "kickoff — we set goals, establish communication rhythms, and map out priorities", "monthly sessions — we strategize, troubleshoot, optimize, repeat", "async support — you send questions, i respond within 48 hours (business days)"],
  fit: { perfect: ["are past the \"just getting started\" phase but not at the \"hire a full team\" phase", "want strategic support, not just task execution", "value having someone in your corner who sees the full picture", "are implementing systems but need guidance & accountability", "are exploring new revenue streams and want strategic input"], notFit: ["need someone to execute tasks for you (this is consulting, not a VA service)", "want instant responses 24/7", "aren't ready to commit to at least 3 months"] },
  different: "i'm not here to tell you what you \"should\" be doing. i'm here to help you build a business that actually works for your life. no shame if you didn't do the thing you said you'd do. no cookie-cutter advice. systems designed for your brain. support that feels like texting a friend who gets it. sustainable growth > hustle culture every single time.",
  quote: { text: "Taking on a client is easy. Taking on the right client is an investment.", author: "seth godin" },
  cta: "apply now →",
};

const corporateConfig = {
  price: "custom pricing", title: "workshops & training for corporate teams", subtitle: "leadership development that doesn't feel like corporate theater",
  problem: "your team engagement scores are... not great. your managers are drowning in admin work, firefighting constantly, and heading toward burnout. onboarding is basically \"here's your login, figure it out.\" you rolled out a new platform 6 months ago and adoption is sitting at 30%. sound familiar? i've been there. led teams through it. burned out from it. then figured out how to fix it.",
  whatIntro: "workshops & training programs that actually create change—not just check a box on someone's quarterly goals.",
  includes: ["building high-performing teams without micromanaging (8.9+/10 engagement scores)", "platform adoption that actually sticks (94-96% adoption rates)", "energy management for leaders (you can't time-manage your way out of burnout)", "custom programs designed for your team's specific challenges", "certified asana ambassador & notion expert credentials"],
  timeline: ["custom program design", "ongoing consulting available"],
  process: ["discovery call — what's going on, what've you tried, what does success look like", "proposal — custom program design based on your needs", "delivery — workshop, training series, or ongoing consulting", "follow-up — because real change doesn't happen in a 2-hour session"],
  fit: { perfect: ["are tired of workshops that feel like corporate theater", "want actionable strategies, not just motivational speeches", "value retention & engagement over \"just hire more people\"", "need someone who's actually done this (not just read about it)"], notFit: ["want a one-hour motivational talk with no substance", "aren't ready to actually implement changes", "are looking for the cheapest option"] },
  different: "i'm currently leading teams across 8 global regions while building a fractional consulting business on a 4-day work week. but i didn't start here. i started checking teams at 10pm, working weekends, and thinking that's just what good leaders do. i burned out. then i rebuilt everything. this isn't theory. this is what actually works.",
  cta: "let's talk →",
};

/* ══════════════════════════════════════════════════════════════
   PAGE: ABOUT
   ══════════════════════════════════════════════════════════════ */
function AboutPage({ setPage }) {
  return (
    <>
      {/* HERO (PLM: founder photo + intro side by side) */}
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
          <PhotoBlock emoji="👋" label="hi, i'm sam" h={440} bg={C.pinkSoft} radius={20} />
          <div>
            <ScriptLabel size={22}>a little about me</ScriptLabel>
            <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", color: C.charcoal, lineHeight: 1.05, margin: "0 0 8px" }}>hi, i'm sam 👋</h1>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: C.oceanBlue, marginBottom: 20 }}>global team leader, fractional consultant, certified notion nerd, and part-time mermaid</p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}>currently managing teams across 8 regions from my home office in san diego (usually with an iced oat latte in an anthropologie cloud cup and my dog bentley judging my meetings from his bed).</p>
          </div>
        </div>
      </section>

      <Marquee text="systems that don't suck · sustainable growth · feel-good ops" bg={C.oceanBlue} color={C.white} />

      {/* BACKSTORY */}
      <SectionWrap bgImage={gridBgSand} py="72px">
        <FadeIn>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ScriptLabel size={22}>the backstory</ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3vw, 34px)", color: C.charcoal, margin: "0 0 20px" }}>credibility without the stuffiness</h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 16 }}>i've spent 6+ years building high-performing teams in performance marketing—the kind that don't need micromanaging, consistently hit 8.9+/10 engagement scores, and actually want to show up on mondays.</p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 16 }}>but here's what those achievements don't show: the burnout i went through to get there. checking teams at 10pm. working through weekends "just to catch up." saying yes to everything because i thought that's what good leaders did.</p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}>i hit a wall. and when i did, i realized: this isn't sustainable. so i rebuilt everything—my systems, my boundaries, my entire approach. now i help you skip the burnout part and go straight to what actually works.</p>
          </div>
        </FadeIn>
      </SectionWrap>

      {/* BELIEFS */}
      <SectionWrap bg={C.charcoal} py="72px">
        <FadeIn>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ScriptLabel size={22} color={C.sand}>what i believe</ScriptLabel>
            {[
              { b: "energy management > time management", d: "you can't calendar your way out of exhaustion. sustainable business is about protecting your capacity, not squeezing more into your day." },
              { b: "the best system is the one you'll actually use", d: "i don't care how beautiful someone's notion template is—if it doesn't match your brain, you won't use it." },
              { b: "sustainable growth beats hustle culture every time", d: "quick wins are fun. building something that lasts without burning out? that's the real flex." },
              { b: "you don't need to be \"always on\" to be successful", d: "i'm literally building a consulting business while working corporate 4 days a week. proof of concept, baby." },
            ].map((c, i) => (
              <div key={i} style={{ borderBottom: i < 3 ? `1px solid ${C.warmTan}22` : "none", padding: "22px 0" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 17, color: C.yellow, margin: "0 0 8px" }}>{c.b}</h3>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14.5, color: `${C.sand}cc`, lineHeight: 1.65, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </SectionWrap>

      {/* LIFESTYLE (PLM: casual personality grid) */}
      <SectionWrap bgImage={gridBgLavender} py="72px">
        <FadeIn>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <ScriptLabel size={22} color={C.oceanBlue}>when i'm not consulting</ScriptLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              {["☕ getting iced oat lattes in ridiculous cloud cups", "🏖️ walking the beach in san diego", "🧘‍♀️ at pilates (moving my body >> grinding)", "💅 getting polka dot nails (it's a vibe)", "🐕 hanging with bentley (my coworker)", "✈️ planning trips (30th birthday in italy & spain!)"].map((t, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 14, padding: "16px 18px", border: `1px solid ${C.lavender}`, fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.5 }}>{t}</div>
              ))}
            </div>
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bg={C.charcoal} py="56px">
        <PullQuote quote="The question isn't who's going to let me; it's who's going to stop me." author="ayn rand" bg={`${C.warmTan}15`} />
      </SectionWrap>

      <SectionWrap bg={C.cream} py="48px">
        <div style={{ textAlign: "center", display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn variant="primary" onClick={() => { setPage("services"); window.scrollTo({ top: 0 }); }}>work with me →</Btn>
          <Btn variant="ocean" onClick={() => { setPage("resources"); window.scrollTo({ top: 0 }); }}>join the cabana club →</Btn>
        </div>
      </SectionWrap>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: RESOURCES
   ══════════════════════════════════════════════════════════════ */
function ResourcesPage() {
  return (
    <>
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}>welcome to the cabana club 🏖️</h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.warmTan }}>your corner of the internet for feel-good systems and doing things differently</p>
      </section>

      <Marquee text="real talk · no productivity guilt · systems that work" bg={C.sand} color={C.charcoal} />

      {/* NEWSLETTER */}
      <SectionWrap bgImage={gridBgOcean} py="72px">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <ScriptLabel size={24} color={C.oceanBlue} style={{ textAlign: "center" }}>the newsletter</ScriptLabel>
            <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 38px)", color: C.charcoal, margin: "0 0 16px" }}>every wednesday in your inbox</h2>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, marginBottom: 28 }}>real talk about building businesses that don't own you, systems & strategy for sustainable growth, revenue expansion ideas, behind-the-scenes of building while working corporate, and permission slips you didn't know you needed. no "monetize your mornings" bs.</p>
            <div style={{ display: "flex", justifyContent: "center" }}><NewsletterForm /></div>
          </FadeIn>
        </div>
      </SectionWrap>

      {/* FREE RESOURCES (PLM: numbered template cards) */}
      <SectionWrap bg={C.cream} py="72px">
        <FadeIn>
          <ScriptLabel size={22} style={{ textAlign: "center" }}>the free stuff</ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 38px)", color: C.charcoal, margin: "0 0 8px", textAlign: "center" }}>free resources</h2>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, textAlign: "center", marginBottom: 36 }}>because not everything needs a price tag</p>
        </FadeIn>
        <HorizontalScroll gap={20}>
          {[
            { num: "01", title: "the timesplit framework guide", desc: "how to structure your week so you're not just reacting to fires. strategic 20% | operational 60% | ad-hoc 20%.", bg: C.pinkSoft },
            { num: "02", title: "client outreach templates", desc: "the dating (not cold-calling) method. my exact templates for warming up prospects and crafting personalized pitches.", bg: C.oceanLight },
            { num: "03", title: "the feel-good systems starter kit", desc: "5 plug-and-play notion templates: weekly planning, content batching, client onboarding, project tracker, and win log.", bg: C.lavenderLight },
          ].map((r, i) => (
            <div key={i} style={{ minWidth: 300, maxWidth: 340, flexShrink: 0, scrollSnapAlign: "start", background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, transition: "transform 0.3s", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ background: r.bg, padding: "36px 24px", textAlign: "center" }}>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 56, color: `${C.charcoal}18` }}>{r.num}</span>
              </div>
              <div style={{ padding: "22px 22px 26px" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 17, color: C.charcoal, margin: "0 0 8px" }}>{r.title}</h3>
                <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.6, margin: "0 0 16px" }}>{r.desc}</p>
                <Btn variant="outline" style={{ padding: "8px 20px", fontSize: 13 }}>download →</Btn>
              </div>
            </div>
          ))}
        </HorizontalScroll>
      </SectionWrap>

      {/* BLOG (PLM: horizontal blog card scroll) */}
      <SectionWrap bgImage={gridBgSand} py="72px">
        <FadeIn>
          <ScriptLabel size={22}>from the blog</ScriptLabel>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3.5vw, 34px)", color: C.charcoal, margin: "0 0 8px" }}>real experiences, real lessons, zero fluff</h2>
        </FadeIn>
        <div style={{ marginTop: 24 }}>
          <HorizontalScroll gap={18}>
            {[
              { t: "how i built a consulting business while working corporate", p: "the honest breakdown of managing teams across 8 regions on a 4-day week. spoiler: systems > willpower.", bg: C.oceanLight },
              { t: "why your notion workspace is a graveyard", p: "you downloaded 47 templates and use exactly zero. here's why—and what to do instead.", bg: C.pinkSoft },
              { t: "the timesplit framework", p: "strategic 20%, operational 60%, ad-hoc 20%. the breakdown that changed how i manage my time.", bg: C.lavenderLight },
              { t: "energy management for women", p: "time management is a myth. energy management is the answer. here's how to protect your capacity.", bg: C.sandLight },
            ].map((b, i) => (
              <div key={i} style={{ minWidth: 260, maxWidth: 280, flexShrink: 0, scrollSnapAlign: "start", background: C.white, borderRadius: 18, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ height: 140, background: b.bg }} />
                <div style={{ padding: "18px 18px 22px" }}>
                  <h4 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 8px", lineHeight: 1.3 }}>{b.t}</h4>
                  <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: C.body, lineHeight: 1.6, margin: "0 0 10px" }}>{b.p}</p>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: C.oceanBlue, fontWeight: 600 }}>read more →</span>
                </div>
              </div>
            ))}
          </HorizontalScroll>
        </div>
      </SectionWrap>

      <SectionWrap bg={C.charcoal} py="56px">
        <PullQuote quote="You can't use up creativity. The more you use, the more you have." author="maya angelou" bg={`${C.warmTan}15`} />
      </SectionWrap>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE: CONTACT
   ══════════════════════════════════════════════════════════════ */
function ContactPage({ setPage }) {
  const [form, setForm] = useState({ interest: "", name: "", email: "", message: "", source: "", extra: "" });
  const [sent, setSent] = useState(false);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputS = { fontFamily: "'Rubik', sans-serif", fontSize: 15, border: `1.5px solid ${C.sand}`, borderRadius: 12, padding: "13px 18px", outline: "none", background: C.white, width: "100%", boxSizing: "border-box" };
  const labelS = { fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, color: C.charcoal, display: "block", marginBottom: 6 };

  if (sent) return (
    <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: gridBgWhite, padding: "120px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <span style={{ fontSize: 48 }}>🎉</span>
        <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 28, color: C.charcoal, margin: "16px 0 8px" }}>sent!</h2>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7 }}>i'll get back to you within 48 hours (business days). if you don't hear from me, check your spam—sometimes my emails get lost in the sauce.</p>
      </div>
    </section>
  );

  return (
    <>
      <section style={{ background: gridBgWhite, padding: "130px clamp(20px, 5vw, 56px) 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}>let's chat 💬</h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.warmTan }}>not sure where to start? tell me what's going on and we'll figure it out together</p>
      </section>

      <SectionWrap bgImage={gridBgSand} py="64px">
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ background: C.white, borderRadius: 24, padding: "clamp(24px, 4vw, 44px)", border: `1px solid ${C.sand}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelS}>what are you interested in?</label>
                <select value={form.interest} onChange={e => upd("interest", e.target.value)} style={{ ...inputS, appearance: "auto" }}>
                  <option value="">select one...</option>
                  <option>brand experience audit or consulting (creators/service providers)</option>
                  <option>workshops or leadership consulting (corporate teams)</option>
                  <option>brand partnerships or speaking</option>
                  <option>just saying hi / not sure yet</option>
                </select>
              </div>
              <div><label style={labelS}>your name</label><input value={form.name} onChange={e => upd("name", e.target.value)} style={inputS} /></div>
              <div><label style={labelS}>email</label><input type="email" value={form.email} onChange={e => upd("email", e.target.value)} style={inputS} /></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelS}>what's going on?</label>
                <textarea value={form.message} onChange={e => upd("message", e.target.value)} rows={5} style={{ ...inputS, resize: "vertical", lineHeight: 1.6 }} placeholder='"my client onboarding is chaos" or "our team engagement scores are tanking"' />
              </div>
              <div><label style={labelS}>how'd you find me?</label><select value={form.source} onChange={e => upd("source", e.target.value)} style={{ ...inputS, appearance: "auto" }}><option value="">select one...</option><option>LinkedIn</option><option>Instagram</option><option>Google</option><option>Referral</option><option>Other</option></select></div>
              <div><label style={labelS}>anything else?</label><input value={form.extra} onChange={e => upd("extra", e.target.value)} style={inputS} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Btn variant="primary" onClick={() => setSent(true)}>send it →</Btn></div>
            </div>
          </div>

          <div style={{ marginTop: 28, background: C.white, borderRadius: 16, padding: "22px 24px", border: `1px solid ${C.sand}` }}>
            <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 15, color: C.charcoal, margin: "0 0 6px" }}>prefer email?</h3>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, margin: 0 }}>for brand partnerships, speaking inquiries, or collabs: <strong>sam@bysamanthabrown.com</strong></p>
          </div>

          <div style={{ marginTop: 36, textAlign: "center" }}>
            <ScriptLabel size={20} style={{ textAlign: "center" }}>while you're here</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, marginBottom: 16 }}>join the cabana club for bi-weekly insights on life-first business building.</p>
            <div style={{ display: "flex", justifyContent: "center" }}><NewsletterForm compact /></div>
          </div>
        </div>
      </SectionWrap>

      <SectionWrap bg={C.charcoal} py="48px">
        <PullQuote quote="Start before you're ready." author="steven pressfield" bg={`${C.warmTan}15`} />
      </SectionWrap>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const scrollY = useScrollY();

  const pages = {
    home: <HomePage setPage={setPage} />,
    services: <ServicesPage setPage={setPage} />,
    audit: <ServiceDetailPage setPage={setPage} config={auditConfig} />,
    implementation: <ServiceDetailPage setPage={setPage} config={implementationConfig} />,
    fractional: <ServiceDetailPage setPage={setPage} config={fractionalConfig} />,
    corporate: <ServiceDetailPage setPage={setPage} config={corporateConfig} />,
    about: <AboutPage setPage={setPage} />,
    resources: <ResourcesPage />,
    contact: <ContactPage setPage={setPage} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Rubik:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { background: ${C.cream}; overflow-x: hidden; }
        ::selection { background: ${C.oceanLight}; color: ${C.charcoal}; }
        input::placeholder, textarea::placeholder { font-family: 'Rubik', sans-serif; color: ${C.muted}; }
        button:hover { opacity: 0.93; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.sand}; border-radius: 10px; }

        @media (max-width: 768px) {
          .dsk-nav { display: none !important; }
          .mob-toggle { display: block !important; }
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

      <Nav page={page} setPage={setPage} scrollY={scrollY} />
      <main>{pages[page]}</main>
      <Footer setPage={setPage} />
    </>
  );
}
