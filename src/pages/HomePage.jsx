import { useState, useEffect, useRef } from "react";
import { C, gridBgWhite, gridBgSand, gridBgOcean } from "../theme";
import { useInView } from "../hooks";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import { Icon, EmojiIcon, BrandGlyph, brandForLabel } from "../icons";
import {
  FadeIn, AnimatedCounter, RotatingText, FloatingTag, BubbleTag, Marquee,
  ScriptLabel, SectionWrap, SectionBgControl, BrandStar, EditableBtn,
  NewsletterForm,
} from "../components/ui";

function SocialProof() {
  const { getContent, updateContent, isEditing } = useCMS();
  const badges = getContent("home.socialProof.badges") || [];
  const images = getContent("home.socialProof.images") || [];
  const [ref, inView] = useInView(0.1);
  const sectionRef = useRef(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        setParallaxOffset((viewH / 2 - rect.top) * 0.04);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

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
                    const { uploadImage } = await import("../supabase/storage");
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
            const brand = brandForLabel(badge);
            return (
              <div key={i} style={{
                fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
                letterSpacing: "0.4px",
                color: C.charcoal, background: C.white,
                padding: "12px 24px", borderRadius: 50,
                border: `1px solid ${C.sand}`,
                boxShadow: "0 1px 3px rgba(44,44,40,0.05)",
                display: "inline-flex", alignItems: "center", gap: 8,
                transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
                transitionDelay: `${0.3 + i * 0.1}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(44,44,40,0.05)"; }}>
                {brand
                  ? <BrandGlyph brand={brand} size={15} color={C.charcoal} />
                  : <BrandStar size={12} color={C.olive} />}
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
function TestimonialSection() {
  const { getContent, updateContent, isEditing } = useCMS();
  const sectionRef = useRef(null);
  const bgUrl = getContent("image.home.testimonials.bg");
  const bgOpacity = getContent("style.home.testimonials.bgOpacity") ?? 0.82;
  const fitMode = getContent("style.image.home.testimonials.bg.objectFit") || "cover";
  const fitPosition = getContent("style.image.home.testimonials.bg.objectPosition") || "center";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    if (isMobile) return;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        setParallaxOffset((viewH - rect.top) * 0.08);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [isMobile]);

  return (
    <section ref={sectionRef} style={{
      position: "relative", overflow: "hidden",
      padding: "clamp(56px, 8vw, 80px) clamp(20px, 5vw, 56px)",
      background: bgUrl ? C.charcoal : C.sandLight,
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
                fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
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
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

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
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(85,84,7,0.04) 0%, rgba(216,235,249,0.06) 50%, rgba(242,232,75,0.04) 100%)", zIndex: 0, pointerEvents: "none" }} />

          <div style={{ maxWidth: 1140, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 6vw, 72px)", alignItems: "center", position: "relative", zIndex: 1 }} className="hero-two-col">

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
                    background: headingGradient,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } : { color: C.charcoal })),
                  lineHeight: 1.15, margin: "0 0 20px", textTransform: "lowercase", letterSpacing: "-1px",
                }}>
                  <EditableText contentKey="home.hero.heading" as="span" style={{ background: "inherit", WebkitBackgroundClip: "inherit", WebkitTextFillColor: "inherit", backgroundClip: "inherit" }} />
                </h1>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,.61,.36,1) 0.35s", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: "clamp(18px, 2.2vw, 24px)", color: C.olive, minHeight: 32 }}>
                  <RotatingText phrases={getContent("home.hero.typewriterPhrases") || ["systems that scale", "revenue that grows", "a life you actually enjoy"]} />
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
        <SectionWrap bg={C.sandLight} py="80px" sectionKey="home.welcome">
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
              <div style={{ background: C.cream, borderRadius: 20, padding: "28px 24px", border: `1px solid ${C.sand}`, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", transition: "transform 0.3s, box-shadow 0.3s", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,44,40,0.04), 0 14px 32px rgba(44,44,40,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)"; }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${C.olive}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <EmojiIcon emoji={v.emoji} size={26} color={C.olive} />
                </div>
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
      <section style={{ background: C.somethingBlue, padding: "72px clamp(20px, 5vw, 56px)", overflowX: "hidden" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <ScriptLabel size={22} color={C.olive} style={{ textAlign: "center" }}><EditableText contentKey="home.systemsComparison.scriptLabel" as="span" /></ScriptLabel>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: C.charcoal, margin: 0 }}><EditableText contentKey="home.systemsComparison.heading" as="span" /></h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24, maxWidth: 800, margin: "0 auto", alignItems: "stretch" }}>
            <FadeIn delay={0} style={{ display: "flex" }}>
              <div style={{ background: `${C.motherEarth}18`, borderRadius: 20, padding: "28px 24px", border: `1px solid ${C.motherEarth}40`, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.motherEarth, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <EmojiIcon emoji="😵‍💫" size={20} color={C.motherEarth} /> without systems
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
              <div style={{ background: `${C.olive}10`, borderRadius: 20, padding: "28px 24px", border: `1px solid ${C.olive}30`, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: C.olive, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <EmojiIcon emoji="✨" size={20} color={C.olive} /> with systems
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
                <div onClick={() => nav(c.page || "contact")} style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: isEditing ? "default" : "pointer", display: "flex", flexDirection: "column", flex: 1, transition: "transform 0.3s, box-shadow 0.3s", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}
                  onMouseEnter={isEditing ? undefined : e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,44,40,0.04), 0 14px 32px rgba(44,44,40,0.10)"; }}
                  onMouseLeave={isEditing ? undefined : e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)"; }}>
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
      <SectionWrap bg={C.somethingBlue} py="80px" sectionKey="home.stats">
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
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,44,40,0.04), 0 14px 32px rgba(44,44,40,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)"; }}
              style={{ background: C.white, borderRadius: 16, padding: "28px 20px", textAlign: "center", border: `1px solid ${C.sand}`, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", cursor: "default", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}>
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
              {(getContent("home.stats.badges") || []).map((t, i) => {
                const brand = brandForLabel(t);
                return (
                  <span key={i} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 11, color: C.charcoal, background: C.yellow, padding: "5px 16px", borderRadius: 50, letterSpacing: "0.3px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {brand && <BrandGlyph brand={brand} size={12} color={C.charcoal} />}
                    <EditableArrayString contentKey="home.stats.badges" index={i} />
                  </span>
                );
              })}
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
      <TestimonialSection />
      </EditableSection>
    ),

    newsletter: () => (
      <EditableSection contentKey="visibility.home.newsletter">
      <SectionWrap bg={C.lavenderLight} py="72px" sectionKey="home.newsletter">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div style={{ marginBottom: 12 }}><Icon name="umbrella" size={36} color={C.olive} /></div>
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
              <div style={{ marginBottom: 16 }}><Icon name="sparkles" size={32} color={C.butter} /></div>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: C.cream, lineHeight: 1.1, margin: "0 0 16px" }}>
                <EditableText contentKey="home.closing.heading" as="span" />
              </h2>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: `${C.sand}cc`, lineHeight: 1.7, marginBottom: 12 }}>
                <EditableText contentKey="home.closing.body" as="span" />
              </p>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 22, color: C.sand, marginBottom: 32 }}><EditableText contentKey="home.closing.script" as="span" /></p>
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
export default HomePage;
