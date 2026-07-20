import { useState } from "react";
import { C } from "../theme";
import { Btn, ScriptLabel } from "./ui";
import { EditableText } from "../cms/EditableText";

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
export { Nav, Footer, BackToTop };
