import { C, gridBgWhite } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import { Icon, EmojiIcon, BrandGlyph, brandForLabel } from "../icons";
import {
  FadeIn, Marquee, ScriptLabel, SectionWrap, HorizontalScroll, NewsletterForm,
} from "../components/ui";

function ResourcesPage() {
  const { getContent, isEditing } = useCMS();
  return (
    <>
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) clamp(32px, 8vw, 56px)", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="resources.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 20, color: C.warmTan }}><EditableText contentKey="resources.hero.subheading" as="span" /></p>
      </section>

      <Marquee text="systems that actually work · no hustle culture · revenue expansion" bg={C.sand} color={C.charcoal} />

      {/* NEWSLETTER with preferences */}
      <EditableSection contentKey="visibility.resources.newsletter">
      <SectionWrap bg={C.somethingBlue} py="72px">
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div style={{ marginBottom: 10 }}><Icon name="umbrella" size={34} color={C.olive} /></div>
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
            <FadeIn key={i} delay={i * 80} style={{ width: "min(280px, 75vw)", flexShrink: 0, scrollSnapAlign: "start", display: "flex" }}>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", background: C.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.sand}`, transition: "transform 0.3s, box-shadow 0.3s", cursor: "pointer", boxShadow: "0 1px 2px rgba(44,44,40,0.03), 0 6px 16px rgba(44,44,40,0.05)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ background: tool.bg || C.pinkSoft, padding: "28px 24px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 96 }}>
                  {isEditing
                    ? <span style={{ fontSize: 40 }}><EditableArrayText contentKey="resources.tools.items" index={i} field="emoji" as="span" /></span>
                    : (brandForLabel(tool.title)
                        ? <BrandGlyph brand={brandForLabel(tool.title)} size={34} color={C.charcoal} />
                        : <EmojiIcon emoji={tool.emoji} size={36} color={C.charcoal} />)}
                </div>
                <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
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
export default ResourcesPage;
