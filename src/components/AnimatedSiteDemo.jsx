import { useState, useEffect, useRef } from "react";

/*  AnimatedSiteDemo — A mini browser window mockup that auto-scrolls
    through a stylized representation of the site's key sections.
    Pure CSS animations, no video file needed. */

const C = {
  charcoal: "#2D2D2D",
  sand: "#DDD0BE",
  sandLight: "#EDE5D8",
  cream: "#FAF7F2",
  white: "#FFFFFF",
  pinkSoft: "#F5E6DC",
  oceanBlue: "#7BA7B3",
  oceanLight: "#D6E8EC",
  lavenderLight: "#EDE8F4",
  yellow: "#E0E24A",
  body: "#555550",
  coral: "#E8A87C",
};

export function AnimatedSiteDemo({ height = 400, borderRadius = 20 }) {
  const scrollRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Start animation when component enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-scroll the inner content
  useEffect(() => {
    if (!isVisible || !scrollRef.current) return;
    const el = scrollRef.current;
    let frame;
    let scrollPos = 0;
    const totalHeight = el.scrollHeight - el.clientHeight;
    const duration = 18000; // 18s full scroll
    const pauseAtTop = 2000;
    const pauseAtBottom = 2000;
    let startTime = null;
    let phase = "pause-top"; // pause-top -> scroll-down -> pause-bottom -> scroll-up -> repeat

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (phase === "pause-top") {
        if (elapsed > pauseAtTop) {
          phase = "scroll-down";
          startTime = timestamp;
        }
      } else if (phase === "scroll-down") {
        const progress = Math.min(elapsed / duration, 1);
        // Ease in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        el.scrollTop = eased * totalHeight;
        if (progress >= 1) {
          phase = "pause-bottom";
          startTime = timestamp;
        }
      } else if (phase === "pause-bottom") {
        if (elapsed > pauseAtBottom) {
          phase = "scroll-up";
          startTime = timestamp;
        }
      } else if (phase === "scroll-up") {
        const progress = Math.min(elapsed / (duration * 0.6), 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        el.scrollTop = totalHeight * (1 - eased);
        if (progress >= 1) {
          phase = "pause-top";
          startTime = timestamp;
        }
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        borderRadius,
        overflow: "hidden",
        background: C.charcoal,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      {/* Browser chrome */}
      <div style={{
        padding: "10px 14px",
        background: C.charcoal,
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid #444",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        </div>
        <div style={{
          flex: 1,
          background: "#3A3A3A",
          borderRadius: 6,
          padding: "5px 12px",
          fontSize: 10,
          fontFamily: "'Rubik', sans-serif",
          color: "#999",
          textAlign: "center",
        }}>
          bysamanthabrown.com
        </div>
      </div>

      {/* Scrolling site content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ transform: "scale(1)", transformOrigin: "top left" }}>

          {/* HERO */}
          <div style={{
            background: C.cream,
            padding: "40px 20px 30px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 10,
              color: C.oceanBlue,
              marginBottom: 4,
            }}>by samantha brown</div>
            <div style={{
              fontFamily: "'Rubik', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: C.charcoal,
              lineHeight: 1.15,
              maxWidth: 240,
              margin: "0 auto 8px",
            }}>
              your business should work for your life
            </div>
            <div style={{
              fontFamily: "'Rubik', sans-serif",
              fontSize: 7,
              color: C.body,
              lineHeight: 1.5,
              maxWidth: 200,
              margin: "0 auto 10px",
            }}>
              feel-good systems, revenue expansion & brand experiences
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              <MiniBtn bg={C.oceanBlue} color={C.white}>work with me</MiniBtn>
              <MiniBtn bg="transparent" color={C.charcoal} border={C.sand}>partnerships</MiniBtn>
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 10 }}>
              <MiniBubble>🏖️ feel-good systems</MiniBubble>
              <MiniBubble>☕ life-first business</MiniBubble>
            </div>
          </div>

          {/* MARQUEE */}
          <MiniMarquee text="feel-good systems · built with intention · sustainable growth" bg={C.oceanBlue} color={C.white} />

          {/* WELCOME */}
          <div style={{
            background: C.sandLight,
            padding: "20px 16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            alignItems: "center",
          }}>
            <div style={{
              background: C.oceanLight,
              borderRadius: 10,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}>🏖️</div>
            <div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 9, color: C.oceanBlue, marginBottom: 2 }}>welcome</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 10, color: C.charcoal, lineHeight: 1.2, marginBottom: 4 }}>the permission slip you didn't know you needed</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 6.5, color: C.body, lineHeight: 1.5 }}>no hustle culture. no cookie-cutter frameworks. just systems that work.</div>
            </div>
          </div>

          {/* CORE VALUES */}
          <div style={{ background: C.white, padding: "20px 16px" }}>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 9, color: C.oceanBlue }}>what we believe in</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 10, color: C.charcoal }}>built different, on purpose</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {["🌴", "☕", "💛", "✨"].map((e, i) => (
                <MiniCard key={i} emoji={e} bg={[C.pinkSoft, C.oceanLight, C.lavenderLight, C.sandLight][i]} />
              ))}
            </div>
          </div>

          {/* SYSTEMS COMPARISON */}
          <div style={{ background: C.charcoal, padding: "20px 16px" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 9, color: C.sand }}>the difference</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 10, color: C.cream }}>without systems vs. with systems</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#3A3A3A", borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 6, color: "#ff8888", fontFamily: "'Rubik', sans-serif", fontWeight: 600, marginBottom: 4 }}>without ✕</div>
                {["burnout on repeat", "one revenue stream", "duct tape backend"].map((t, i) => (
                  <div key={i} style={{ fontSize: 5.5, color: "#aaa", fontFamily: "'Rubik', sans-serif", lineHeight: 1.8 }}>• {t}</div>
                ))}
              </div>
              <div style={{ background: "#3A3A3A", borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 6, color: C.yellow, fontFamily: "'Rubik', sans-serif", fontWeight: 600, marginBottom: 4 }}>with systems ✓</div>
                {["multiple revenue streams", "workflows on autopilot", "time for what you love"].map((t, i) => (
                  <div key={i} style={{ fontSize: 5.5, color: "#ccc", fontFamily: "'Rubik', sans-serif", lineHeight: 1.8 }}>✦ {t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* PATH CARDS */}
          <div style={{ background: C.cream, padding: "20px 16px" }}>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 9, color: C.oceanBlue }}>how we'll work together</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 10, color: C.charcoal }}>choose your path</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {[
                { bg: C.pinkSoft, accent: C.coral, title: "founders" },
                { bg: C.oceanLight, accent: C.oceanBlue, title: "corporate" },
                { bg: C.lavenderLight, accent: "#D5CEE3", title: "brands" },
              ].map((c, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 6, overflow: "hidden", border: `0.5px solid ${C.sand}` }}>
                  <div style={{ background: c.bg, padding: "8px 6px", borderBottom: `2px solid ${c.accent}` }}>
                    <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 6, color: C.charcoal }}>{c.title}</div>
                  </div>
                  <div style={{ padding: "6px", height: 20 }}>
                    <div style={{ width: "80%", height: 2, background: C.sand, borderRadius: 1, marginBottom: 3 }} />
                    <div style={{ width: "60%", height: 2, background: C.sand, borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div style={{ background: C.sandLight, padding: "20px 16px" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 9, color: C.oceanBlue }}>the proof</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {[
                { stat: "94%", label: "adoption rate" },
                { stat: "8+", label: "global regions" },
                { stat: "500+", label: "creators helped" },
              ].map((s, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 8, padding: "10px 6px", textAlign: "center", border: `0.5px solid ${C.sand}` }}>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 14, color: C.oceanBlue }}>{s.stat}</div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 5.5, color: C.body }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICES PREVIEW */}
          <MiniMarquee text="systems that actually work · no hustle culture · revenue expansion" bg={C.sand} color={C.charcoal} />

          <div style={{ background: C.cream, padding: "20px 16px" }}>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 9, color: C.oceanBlue }}>find your fit</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 10, color: C.charcoal }}>services designed for you</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {[
                { num: "01", bg: C.pinkSoft, title: "brand audit" },
                { num: "02", bg: C.oceanLight, title: "full implementation" },
                { num: "03", bg: C.lavenderLight, title: "fractional consulting" },
              ].map((s, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 6, overflow: "hidden", border: `0.5px solid ${C.sand}` }}>
                  <div style={{ background: s.bg, padding: "8px 6px" }}>
                    <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 12, color: `${C.charcoal}25` }}>{s.num}</div>
                  </div>
                  <div style={{ padding: "6px" }}>
                    <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 6, color: C.charcoal, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ width: "90%", height: 2, background: C.sand, borderRadius: 1, marginBottom: 2 }} />
                    <div style={{ width: "70%", height: 2, background: C.sand, borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: C.charcoal, padding: "24px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 11, color: C.cream, marginBottom: 4 }}>ready to build something that works?</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 8, color: C.sand, marginBottom: 10 }}>grab an iced latte and let's figure this out ☕</div>
            <MiniBtn bg={C.oceanBlue} color={C.white}>explore services →</MiniBtn>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Tiny helper components ── */

function MiniBtn({ bg, color, border, children }) {
  return (
    <span style={{
      fontFamily: "'Rubik', sans-serif",
      fontSize: 6.5,
      fontWeight: 600,
      color,
      background: bg,
      border: border ? `1px solid ${border}` : "none",
      borderRadius: 50,
      padding: "3px 10px",
      display: "inline-block",
    }}>{children}</span>
  );
}

function MiniBubble({ children }) {
  return (
    <span style={{
      fontFamily: "'Rubik', sans-serif",
      fontSize: 5.5,
      color: C.charcoal,
      background: C.white,
      borderRadius: 50,
      padding: "2px 8px",
      border: `0.5px solid ${C.sand}`,
    }}>{children}</span>
  );
}

function MiniCard({ emoji, bg }) {
  return (
    <div style={{
      background: bg,
      borderRadius: 6,
      padding: "8px 4px",
      textAlign: "center",
    }}>
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <div style={{ width: "70%", height: 2, background: `${C.charcoal}15`, borderRadius: 1, margin: "4px auto 2px" }} />
      <div style={{ width: "50%", height: 2, background: `${C.charcoal}10`, borderRadius: 1, margin: "0 auto" }} />
    </div>
  );
}

function MiniMarquee({ text, bg, color }) {
  return (
    <div style={{
      background: bg,
      padding: "6px 0",
      overflow: "hidden",
      whiteSpace: "nowrap",
    }}>
      <div style={{
        fontFamily: "'Rubik', sans-serif",
        fontSize: 6,
        fontWeight: 600,
        color,
        animation: "miniMarquee 12s linear infinite",
        display: "inline-block",
      }}>
        {text} · {text} · {text}
      </div>
      <style>{`
        @keyframes miniMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
