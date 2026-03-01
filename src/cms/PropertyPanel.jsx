import { useState, useEffect } from "react";
import { useSelection } from "./SelectionContext";
import { useCMS } from "./useContent";
import { EDITOR } from "./editorConstants";

export function PropertyPanel() {
  const { selectedElement, deselect } = useSelection();
  const { isEditing, getContent, updateContent } = useCMS();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (selectedElement && isEditing) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [selectedElement, isEditing]);

  if (!visible || !selectedElement) return null;

  const { type, contentKey, index } = selectedElement;

  return (
    <div
      data-editor-panel
      style={{
        position: "fixed",
        top: 80,
        right: visible ? 0 : -EDITOR.panelWidth,
        width: EDITOR.panelWidth,
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
        background: "rgba(45, 45, 45, 0.97)",
        backdropFilter: "blur(16px)",
        borderLeft: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.2)",
        zIndex: EDITOR.zPanel,
        transition: "right 0.25s cubic-bezier(.22,.61,.36,1)",
        color: "#fff",
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {type === "card" ? "Edit Card" : type === "text" ? "Edit Text" : "Properties"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {contentKey}
          </div>
        </div>
        <button
          onClick={deselect}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >✕</button>
      </div>

      {/* Panel body — context-sensitive */}
      <div style={{ padding: "16px 20px" }}>
        {type === "card" && contentKey && index !== undefined && (
          <CardEditor contentKey={contentKey} index={index} />
        )}
        {type === "text" && contentKey && (
          <TextInfo contentKey={contentKey} />
        )}
      </div>
    </div>
  );
}

/* ── Card Editor — Edit all fields of a single card ── */
function CardEditor({ contentKey, index }) {
  const { getContent, updateContent } = useCMS();
  const { pushUndo } = useSelection();
  const items = getContent(contentKey) || [];
  const card = items[index];

  if (!card) return <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Card not found</p>;

  const updateField = (field, value) => {
    const oldItems = [...items];
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    pushUndo({ contentKey, oldValue: oldItems, newValue: newItems });
    updateContent(contentKey, newItems);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(card).map(([key, val]) => {
        // Skip internal/color fields
        if (key === "bg" || key === "accent" || key === "page") return null;
        return (
          <div key={key}>
            <label style={labelStyle}>{key}</label>
            {typeof val === "string" && val.length > 60 ? (
              <textarea
                value={val}
                onChange={(e) => updateField(key, e.target.value)}
                rows={3}
                style={textareaStyle}
              />
            ) : typeof val === "string" ? (
              <input
                type="text"
                value={val}
                onChange={(e) => updateField(key, e.target.value)}
                style={inputStyle}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ── Text Info — shows info about selected text element ── */
function TextInfo({ contentKey }) {
  const { getContent } = useCMS();
  const value = getContent(contentKey);

  return (
    <div>
      <label style={labelStyle}>Content Key</label>
      <div style={{ ...inputStyle, background: "rgba(255,255,255,0.05)", cursor: "default" }}>
        {contentKey}
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Current Value</label>
        <div style={{
          ...inputStyle,
          background: "rgba(255,255,255,0.05)",
          cursor: "default",
          maxHeight: 120,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          fontSize: 12,
        }}>
          {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
        </div>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 12, lineHeight: 1.5 }}>
        Click on the text directly to edit it inline.
      </p>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 6,
  fontFamily: "'Rubik', sans-serif",
};

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6,
  padding: "8px 12px",
  color: "#fff",
  fontSize: 13,
  fontFamily: "'Rubik', sans-serif",
  outline: "none",
  transition: "border 0.2s",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.5,
};
