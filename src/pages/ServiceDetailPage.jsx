import { C, gridBgWhite } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import {
  FadeIn, ScriptLabel, SectionWrap, BrandStar, ProcessStep, FAQAccordion,
  EditableTagList, TwoColFit, PullQuote, EditableBtn,
} from "../components/ui";

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
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 20, color: C.warmTan }}><EditableText contentKey={p + ".subtitle"} as="span" /></p>
      </section>

      <SectionWrap bg={C.charcoal} py="56px">
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <ScriptLabel color={C.sand}>the problem</ScriptLabel>
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: `${C.sand}dd`, lineHeight: 1.75 }}><EditableText contentKey={p + ".problem"} as="span" /></p>
          </div>
        </FadeIn>
      </SectionWrap>

      <SectionWrap bg={C.white} py="64px" sectionKey={p + ".whatThis"}>
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
        <SectionWrap bg={C.sandLight} py="64px">
          <FadeIn>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <ScriptLabel>who this is for</ScriptLabel>
              <TwoColFit perfect={fitPerfect} notFit={fitNotFit} />
            </div>
          </FadeIn>
        </SectionWrap>
      )}

      {faqs.length > 0 && (
        <SectionWrap bg={C.white} py="64px">
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
export default ServiceDetailPage;
