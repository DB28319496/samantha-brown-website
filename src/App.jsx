import { useState, useEffect, useCallback } from "react";
import { C } from "./theme";
import { useScrollY } from "./hooks";
import { useCMS } from "./cms/useContent";
import { EditorToolbar } from "./cms/EditorToolbar";
import { SelectionOverlay } from "./cms/SelectionOverlay";
import { PropertyPanel } from "./cms/PropertyPanel";
import { AdminLoginListener, AdminLoginModal } from "./cms/AdminAuth";
import { Nav, Footer, BackToTop } from "./components/layout";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AboutPage from "./pages/AboutPage";
import ResourcesPage from "./pages/ResourcesPage";
import ContactPage from "./pages/ContactPage";

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
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; overflow-x: hidden; }
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

        /* Hero two-column responsive */
        .hero-two-col {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .hero-two-col {
            grid-template-columns: 1fr !important;
          }
          .hero-two-col > div:last-child {
            margin-left: 0 !important;
            text-align: center !important;
          }
          .hero-two-col > div:last-child > div > div {
            justify-content: center;
          }
          .hero-two-col > div:last-child > div[style*="flex"] {
            justify-content: center;
          }
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
          .testimonial-arrows-desktop { display: none !important; }
          .testimonial-arrows-mobile { display: flex !important; }
          /* Hero image: restore portrait 4/5 ratio at smaller width — natural photo format */
          .hero-img-wrap { width: 68% !important; max-width: 230px !important; height: auto !important; aspect-ratio: 4/5 !important; max-height: unset !important; margin: 0 auto !important; }
          /* Floating tags: smaller pill + emoji, right/left edges touch photo edge */
          .hero-float-tag > div > div { font-size: 8px !important; padding: 5px 9px !important; gap: 4px !important; }
          .hero-float-tag > div > div span:first-child { font-size: 12px !important; }
          /* feel-good: emerges from left screen edge, right end touches photo's left edge */
          .hero-float-tag-0 { top: 38% !important; left: -50px !important; right: auto !important; bottom: auto !important; transform: rotate(3deg) !important; }
          /* life-first: emerges from right screen edge, left end touches photo's right edge */
          .hero-float-tag-1 { top: 10% !important; right: -50px !important; left: auto !important; bottom: auto !important; transform: rotate(-5deg) !important; }
          /* built with intention: hangs just below photo */
          .hero-float-tag-2 { bottom: -18px !important; left: 50% !important; right: auto !important; top: auto !important; transform: translateX(-50%) rotate(-2deg) !important; }
          /* Pull image up closer to nav */
          .hero-section { padding-top: 74px !important; align-items: flex-start !important; }
          /* Tighten grid gap + image column on mobile; gap must clear the -18px bottom tag */
          .hero-two-col { gap: 42px !important; padding-top: 4px; }
          .hero-two-col > div:first-child { max-width: min(100%, 420px); margin-left: auto; margin-right: auto; }
          /* Smaller heading + tighter spacing so CTA fits on screen */
          .hero-two-col h1 { font-size: clamp(24px, 7vw, 64px) !important; line-height: 1.1 !important; margin-bottom: 10px !important; }
          .hero-two-col > div:last-child > div { margin-bottom: 8px !important; }
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
