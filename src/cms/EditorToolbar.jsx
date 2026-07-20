import { useEffect } from "react";
import { useCMS } from "./useContent";
import { useSelection } from "./useSelection";
import { adminSignOut } from "../supabase/auth";
import { EDITOR } from "./editorConstants";

const C = {
  charcoal: "#2D2D2D",
  cream: "#FAF7F2",
  oceanBlue: "#7BA7B3",
  yellow: "#E0E24A",
  coral: "#E8A87C",
};

function ToolbarBtn({ children, onClick, variant = "default", disabled = false, title }) {
  const styles = {
    default: { background: "rgba(255,255,255,0.12)", color: C.cream, border: "1px solid rgba(255,255,255,0.15)" },
    primary: { background: C.oceanBlue, color: "#fff", border: `1px solid ${C.oceanBlue}` },
    accent: { background: C.yellow, color: C.charcoal, border: `1px solid ${C.yellow}` },
    danger: { background: "transparent", color: C.coral, border: `1px solid ${C.coral}` },
    muted: { background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid transparent" },
    icon: { background: "rgba(255,255,255,0.08)", color: C.cream, border: "1px solid rgba(255,255,255,0.1)", padding: "7px 10px" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        fontFamily: "'Rubik', sans-serif",
        fontWeight: 600,
        fontSize: 12,
        borderRadius: 8,
        padding: "7px 16px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        opacity: disabled ? 0.4 : 1,
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

export function EditorToolbar() {
  const { isAdmin, isEditing, setIsEditing, saveDraft, publish, discardChanges, hasPendingChanges, updateContent } = useCMS();
  const { canUndo, canRedo, undo, redo, deselect } = useSelection();
  const { getContent } = useCMS();

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;

    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd+S → Save draft
      if (mod && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        if (hasPendingChanges) saveDraft();
      }
      // Cmd+Shift+P → Publish
      if (mod && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (hasPendingChanges) publish();
      }
      // Cmd+Z → Undo
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo(getContent, updateContent);
      }
      // Cmd+Shift+Z → Redo
      if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo(getContent, updateContent);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isEditing, hasPendingChanges, saveDraft, publish, undo, redo, getContent, updateContent]);

  if (!isAdmin) return null;

  return (
    <div
      data-editor-toolbar
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: EDITOR.zToolbar,
        background: "rgba(45, 45, 45, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        padding: "10px 20px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Status dot */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: isEditing ? C.yellow : C.oceanBlue,
        flexShrink: 0,
      }} />

      {!isEditing ? (
        <>
          <ToolbarBtn onClick={() => setIsEditing(true)}>Edit Page</ToolbarBtn>
          <ToolbarBtn onClick={() => adminSignOut()} variant="muted">Sign Out</ToolbarBtn>
        </>
      ) : (
        <>
          <span style={{
            fontFamily: "'Rubik', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: C.yellow,
            marginRight: 2,
          }}>
            EDITING
          </span>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />

          {/* Undo / Redo */}
          <ToolbarBtn onClick={() => undo(getContent, updateContent)} disabled={!canUndo} variant="icon" title="Undo (⌘Z)">↩</ToolbarBtn>
          <ToolbarBtn onClick={() => redo(getContent, updateContent)} disabled={!canRedo} variant="icon" title="Redo (⌘⇧Z)">↪</ToolbarBtn>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />

          {/* Save / Publish */}
          {hasPendingChanges && (
            <>
              <ToolbarBtn onClick={saveDraft} variant="primary" title="Save Draft (⌘S)">Save Draft</ToolbarBtn>
              <ToolbarBtn onClick={publish} variant="accent" title="Publish (⌘⇧P)">Publish</ToolbarBtn>
              <ToolbarBtn onClick={discardChanges} variant="danger">Discard</ToolbarBtn>
            </>
          )}

          {!hasPendingChanges && (
            <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              No changes
            </span>
          )}

          <ToolbarBtn onClick={() => { deselect(); setIsEditing(false); }} variant="muted">Exit</ToolbarBtn>
        </>
      )}
    </div>
  );
}
