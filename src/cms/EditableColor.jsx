import { useState } from "react";
import { useContent } from "./useContent";

const bgOptions = {
  cream: "#FAF7F2",
  white: "#FFFFFF",
  sand: "#EDE5D8",
  ocean: "#D6E8EC",
  lavender: "#EDE8F4",
  pink: "#F5E6DC",
  charcoal: "#2D2D2D",
};

export function EditableColor({ contentKey, defaultBg, children, style = {} }) {
  const { value: bgKey, update, isEditing } = useContent(contentKey);
  const [showPicker, setShowPicker] = useState(false);

  const currentBg = bgKey ? (bgOptions[bgKey] || defaultBg) : defaultBg;

  if (!isEditing) {
    return <div style={{ background: currentBg, ...style }}>{children}</div>;
  }

  return (
    <div style={{ background: currentBg, position: "relative", ...style }}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 100,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #7BA7B3",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
        title="Change background color"
      >
        🎨
      </button>

      {showPicker && (
        <div style={{
          position: "absolute",
          top: 48,
          right: 12,
          zIndex: 101,
          background: "#fff",
          borderRadius: 12,
          padding: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}>
          {Object.entries(bgOptions).map(([key, color]) => (
            <button
              key={key}
              onClick={() => { update(key); setShowPicker(false); }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: color,
                border: bgKey === key ? "3px solid #7BA7B3" : "2px solid #DDD0BE",
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              title={key}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
          ))}
          <button
            onClick={() => { update(null); setShowPicker(false); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #f00 0%, #fff 50%, #00f 100%)",
              border: "2px solid #DDD0BE",
              cursor: "pointer",
              fontSize: 10,
            }}
            title="Reset to default"
          >
            ↺
          </button>
        </div>
      )}

      {children}
    </div>
  );
}
