import { useCMS } from "./useContent";
import { adminSignOut } from "../supabase/auth";

const C = {
  charcoal: "#2D2D2D",
  cream: "#FAF7F2",
  oceanBlue: "#7BA7B3",
  yellow: "#E0E24A",
  coral: "#E8A87C",
};

function ToolbarButton({ children, onClick, variant = "default", disabled = false }) {
  const styles = {
    default: { background: "rgba(255,255,255,0.12)", color: C.cream, border: "1px solid rgba(255,255,255,0.15)" },
    primary: { background: C.oceanBlue, color: "#fff", border: `1px solid ${C.oceanBlue}` },
    accent: { background: C.yellow, color: C.charcoal, border: `1px solid ${C.yellow}` },
    danger: { background: "transparent", color: C.coral, border: `1px solid ${C.coral}` },
    muted: { background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid transparent" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Rubik', sans-serif",
        fontWeight: 600,
        fontSize: 12,
        borderRadius: 8,
        padding: "7px 16px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

export function AdminToolbar() {
  const { isAdmin, isEditing, setIsEditing, saveDraft, publish, discardChanges, hasPendingChanges } = useCMS();

  if (!isAdmin) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10000,
      background: "rgba(45, 45, 45, 0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: 16,
      padding: "10px 20px",
      display: "flex",
      gap: 10,
      alignItems: "center",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: isEditing ? C.yellow : C.oceanBlue,
        flexShrink: 0,
      }} />

      {!isEditing ? (
        <>
          <ToolbarButton onClick={() => setIsEditing(true)}>Edit Page</ToolbarButton>
          <ToolbarButton onClick={() => adminSignOut()} variant="muted">Sign Out</ToolbarButton>
        </>
      ) : (
        <>
          <span style={{
            fontFamily: "'Rubik', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: C.yellow,
            marginRight: 4,
          }}>
            EDITING
          </span>
          {hasPendingChanges && (
            <>
              <ToolbarButton onClick={saveDraft} variant="primary">Save Draft</ToolbarButton>
              <ToolbarButton onClick={publish} variant="accent">Publish</ToolbarButton>
              <ToolbarButton onClick={discardChanges} variant="danger">Discard</ToolbarButton>
            </>
          )}
          <ToolbarButton onClick={() => setIsEditing(false)} variant="muted">Exit</ToolbarButton>
        </>
      )}
    </div>
  );
}
