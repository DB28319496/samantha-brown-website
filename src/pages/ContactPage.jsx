import { useRef, useEffect } from "react";
import { C, gridBgWhite } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import { Icon } from "../icons";
import { SectionWrap } from "../components/ui";

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
      <section style={{ background: gridBgWhite, padding: "clamp(80px, 18vw, 130px) clamp(20px, 5vw, 56px) 36px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 6vw, 60px)", color: C.charcoal, lineHeight: 1.02, margin: "0 0 12px", letterSpacing: "-1px" }}><EditableText contentKey="contact.hero.heading" as="span" /></h1>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 20, color: C.warmTan }}><EditableText contentKey="contact.hero.subheading" as="span" /></p>
      </section>

      <SectionWrap bg={C.sandLight} py="64px">
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
              <div style={{ marginBottom: 12 }}><Icon name="clipboard" size={36} color={C.olive} /></div>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: C.charcoal, margin: "0 0 8px" }}>discovery call booking</h2>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: C.body, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 20px" }}>
                <EditableText contentKey="contact.dubsado.placeholder" as="span" />
              </p>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: 18, color: C.warmTan }}>
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
export default ContactPage;
