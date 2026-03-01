import { useContent } from "./useContent";

export function EditableSection({ contentKey, children }) {
  const { value: isVisible, update, isEditing } = useContent(contentKey);

  // Visitor mode: if hidden, render nothing
  if (!isEditing && isVisible === false) return null;

  // Admin mode: show section with visibility toggle
  if (isEditing) {
    return (
      <div style={{
        position: "relative",
        opacity: isVisible === false ? 0.35 : 1,
        transition: "opacity 0.3s",
      }}>
        <button
          onClick={() => update(isVisible === false ? true : false)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 100,
            background: isVisible === false ? "#E8A87C" : "#7BA7B3",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 11,
            fontFamily: "'Rubik', sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            letterSpacing: "0.3px",
          }}
        >
          {isVisible === false ? "Hidden" : "Visible"}
        </button>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
