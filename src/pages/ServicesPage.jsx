import { useRef } from "react";
import { C, gridBgWhite } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import {
  FadeIn, Marquee, ScriptLabel, SectionWrap, Btn,
} from "../components/ui";

function ServicesPage({ setPage }) {
  const { isEditing } = useCMS();
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
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,44,40,0.04), 0 14px 32px rgba(44,44,40,0.10)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)"; }}
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
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,44,40,0.04), 0 14px 32px rgba(44,44,40,0.10)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)"; }}
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
      <SectionWrap bg={C.lavenderLight} py="72px">
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
              <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(44,44,40,0.04), 0 14px 32px rgba(44,44,40,0.10)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)"; }}
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
export default ServicesPage;
