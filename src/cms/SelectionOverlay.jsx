import { useState, useEffect, useCallback } from "react";
import { useSelection } from "./useSelection";
import { EDITOR } from "./editorConstants";

export function SelectionOverlay() {
  const { selectedElement, deselect } = useSelection();
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    if (!selectedElement?.ref) { setRect(null); return; }
    const el = selectedElement.ref;
    if (!el || !document.body.contains(el)) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [selectedElement]);

  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    if (!selectedElement) return () => cancelAnimationFrame(raf);
    const onScroll = () => requestAnimationFrame(measure);
    const onResize = () => requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [selectedElement, measure]);

  // Click outside to deselect
  useEffect(() => {
    if (!selectedElement) return;
    const handler = (e) => {
      if (selectedElement.ref && selectedElement.ref.contains(e.target)) return;
      // Don't deselect if clicking on panel or toolbar
      if (e.target.closest("[data-editor-panel]") || e.target.closest("[data-editor-toolbar]")) return;
      deselect();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedElement, deselect]);

  // Escape to deselect
  useEffect(() => {
    if (!selectedElement) return;
    const handler = (e) => { if (e.key === "Escape") deselect(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedElement, deselect]);

  if (!rect || !selectedElement) return null;

  const label = selectedElement.type === "card"
    ? `Card ${(selectedElement.index ?? 0) + 1}`
    : selectedElement.type === "cardGroup"
    ? "Card Group"
    : selectedElement.contentKey?.split(".").pop() || selectedElement.type;

  return (
    <div style={{
      position: "fixed",
      top: rect.top - 2,
      left: rect.left - 2,
      width: rect.width + 4,
      height: rect.height + 4,
      border: `2px solid ${EDITOR.selectColor}`,
      borderRadius: 4,
      pointerEvents: "none",
      zIndex: EDITOR.zOverlay,
      transition: "all 0.15s ease",
    }}>
      {/* Label pill */}
      <div style={{
        position: "absolute",
        top: -24,
        left: -2,
        background: EDITOR.selectColor,
        color: "#fff",
        fontFamily: "'Rubik', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: "4px 4px 0 0",
        whiteSpace: "nowrap",
        lineHeight: "18px",
      }}>
        {label}
      </div>
    </div>
  );
}
