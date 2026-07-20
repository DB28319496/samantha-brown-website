import { C, gridBgWhite } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import {
  FadeIn, Marquee, ScriptLabel, SectionWrap, BubbleTag, EditableBtn, RotatingText,
} from "../components/ui";

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
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 21, color: C.oceanBlue, marginBottom: 20, minHeight: 30 }}>
              <RotatingText phrases={["global team leader", "fractional consultant", "certified notion nerd", "part-time mermaid", "pilates enthusiast", "iced latte connoisseur"]} interval={2600} />
            </p>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.75 }}><EditableText contentKey="about.hero.body" as="span" /></p>
          </div>
        </div>
      </section>

      <Marquee text="feel-good systems · built with intention · sustainable growth" bg={C.oceanBlue} color={C.white} />

      {/* THE PROBLEM — What Sam saw wrong */}
      <EditableSection contentKey="visibility.about.backstory">
      <SectionWrap bg={C.sandLight} py="72px">
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
                      fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
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
      <SectionWrap bg={C.lavenderLight} py="72px">
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
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 20, color: C.sand, marginBottom: 28 }}>
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
export default AboutPage;
