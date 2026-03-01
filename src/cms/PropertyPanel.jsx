import { useState, useEffect, useRef } from "react";
import { useSelection } from "./SelectionContext";
import { useCMS } from "./useContent";
import { EDITOR } from "./editorConstants";

/* ══════════════════════════════════════════════════════════════
   PROPERTY PANEL — Context-sensitive editing panel
   ══════════════════════════════════════════════════════════════ */
export function PropertyPanel() {
  const { selectedElement, deselect } = useSelection();
  const { isEditing } = useCMS();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!(selectedElement && isEditing));
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
        borderLeft: "1px solid rgba(255,255,255,0.08)",
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
            {type === "card" ? "Edit Card" : type === "block" ? "Edit Block" : type === "text" ? "Edit Text" : "Properties"}
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
          <TextEditor contentKey={contentKey} />
        )}
        {type === "block" && contentKey && index !== undefined && (
          <BlockEditor contentKey={contentKey} index={index} />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COLOR PICKER FIELD — Reusable inline color picker
   ══════════════════════════════════════════════════════════════ */
const colorPalette = {
  cream: "#FAF7F2",
  white: "#FFFFFF",
  sand: "#EDE5D8",
  ocean: "#D6E8EC",
  lavender: "#EDE8F4",
  pink: "#F5E6DC",
  charcoal: "#2D2D2D",
  coral: "#E8A87C",
  oceanBlue: "#7BA7B3",
  yellow: "#E0E24A",
};

function ColorPickerField({ label, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  return (
    <div ref={pickerRef}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: value || "#ccc",
            border: showPicker ? `2px solid ${EDITOR.selectColor}` : "2px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
      {showPicker && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 5,
          marginTop: 8,
          padding: 10,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {Object.entries(colorPalette).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => { onChange(hex); setShowPicker(false); }}
              title={name}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 6,
                background: hex,
                border: value === hex ? `2px solid ${EDITOR.selectColor}` : "1.5px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.12)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE SELECT FIELD — Dropdown for navigation target
   ══════════════════════════════════════════════════════════════ */
const allPages = ["home", "services", "audit", "implementation", "fractional", "corporate", "about", "resources", "contact"];

function PageSelectField({ label, value, onChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
      >
        {allPages.map((p) => (
          <option key={p} value={p} style={{ background: "#2D2D2D", color: "#fff" }}>{p}</option>
        ))}
      </select>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CARD EDITOR — Edit all fields of a single card
   ══════════════════════════════════════════════════════════════ */
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
        // Color fields → color picker
        if (key === "bg" || key === "accent") {
          return (
            <ColorPickerField
              key={key}
              label={key === "bg" ? "Background Color" : "Accent Color"}
              value={val}
              onChange={(newColor) => updateField(key, newColor)}
            />
          );
        }
        // Navigation target → dropdown
        if (key === "page") {
          return (
            <PageSelectField
              key={key}
              label="Link To"
              value={val}
              onChange={(newPage) => updateField(key, newPage)}
            />
          );
        }
        // String fields → text input or textarea
        if (typeof val === "string") {
          return (
            <div key={key}>
              <label style={labelStyle}>{key}</label>
              {val.length > 60 ? (
                <textarea
                  value={val}
                  onChange={(e) => updateField(key, e.target.value)}
                  rows={3}
                  style={textareaStyle}
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateField(key, e.target.value)}
                  style={inputStyle}
                />
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEXT EDITOR — Edit text styling (font size, color)
   ══════════════════════════════════════════════════════════════ */
function TextEditor({ contentKey }) {
  const { getContent, updateContent } = useCMS();
  const { pushUndo } = useSelection();
  const value = getContent(contentKey);
  const fontSize = getContent(`style.${contentKey}.fontSize`);
  const textColor = getContent(`style.${contentKey}.color`);

  const updateStyle = (prop, val) => {
    const key = `style.${contentKey}.${prop}`;
    const oldVal = getContent(key);
    pushUndo({ contentKey: key, oldValue: oldVal, newValue: val });
    updateContent(key, val);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Content preview */}
      <div>
        <label style={labelStyle}>Content</label>
        <div style={{
          ...inputStyle,
          background: "rgba(255,255,255,0.05)",
          cursor: "default",
          maxHeight: 80,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          fontSize: 12,
        }}>
          {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, lineHeight: 1.5 }}>
          Click the text on the page to edit inline.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Font size */}
      <div>
        <label style={labelStyle}>Font Size</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="range"
            min={10}
            max={72}
            step={1}
            value={parseInt(fontSize) || 16}
            onChange={(e) => updateStyle("fontSize", `${e.target.value}px`)}
            style={{ flex: 1, accentColor: EDITOR.selectColor }}
          />
          <input
            type="text"
            value={fontSize || ""}
            onChange={(e) => updateStyle("fontSize", e.target.value || null)}
            placeholder="default"
            style={{ ...inputStyle, width: 72, textAlign: "center" }}
          />
        </div>
      </div>

      {/* Text color */}
      <ColorPickerField
        label="Text Color"
        value={textColor}
        onChange={(val) => updateStyle("color", val || null)}
      />

      {/* Reset button */}
      <button
        onClick={() => {
          updateStyle("fontSize", null);
          updateStyle("color", null);
        }}
        style={{
          ...inputStyle,
          background: "rgba(255,255,255,0.05)",
          cursor: "pointer",
          textAlign: "center",
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
          marginTop: 4,
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      >
        Reset to defaults
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BLOCK EDITOR — Edit content block styling
   ══════════════════════════════════════════════════════════════ */
function BlockEditor({ contentKey, index }) {
  const { getContent, updateContent } = useCMS();
  const { pushUndo } = useSelection();
  const blocks = getContent(contentKey) || [];
  const block = blocks[index];

  if (!block) return <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Block not found</p>;

  const updateBlock = (field, value) => {
    const oldBlocks = [...blocks];
    const newBlocks = [...blocks];
    if (field.startsWith("style.")) {
      const prop = field.replace("style.", "");
      newBlocks[index] = { ...newBlocks[index], style: { ...newBlocks[index].style, [prop]: value } };
    } else {
      newBlocks[index] = { ...newBlocks[index], [field]: value };
    }
    pushUndo({ contentKey, oldValue: oldBlocks, newValue: newBlocks });
    updateContent(contentKey, newBlocks);
  };

  const deleteBlock = () => {
    if (!window.confirm("Delete this block?")) return;
    const oldBlocks = [...blocks];
    const newBlocks = blocks.filter((_, i) => i !== index);
    pushUndo({ contentKey, oldValue: oldBlocks, newValue: newBlocks });
    updateContent(contentKey, newBlocks);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Block Type</label>
        <div style={{ ...inputStyle, background: "rgba(255,255,255,0.05)", cursor: "default", textTransform: "capitalize" }}>
          {block.type}
        </div>
      </div>

      {(block.type === "heading" || block.type === "paragraph") && (
        <>
          <div>
            <label style={labelStyle}>Font Size</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="range"
                min={10}
                max={72}
                step={1}
                value={parseInt(block.style?.fontSize) || (block.type === "heading" ? 24 : 15)}
                onChange={(e) => updateBlock("style.fontSize", `${e.target.value}px`)}
                style={{ flex: 1, accentColor: EDITOR.selectColor }}
              />
              <input
                type="text"
                value={block.style?.fontSize || ""}
                onChange={(e) => updateBlock("style.fontSize", e.target.value || null)}
                placeholder="default"
                style={{ ...inputStyle, width: 72, textAlign: "center" }}
              />
            </div>
          </div>
          <ColorPickerField
            label="Text Color"
            value={block.style?.color}
            onChange={(val) => updateBlock("style.color", val || null)}
          />
        </>
      )}

      {block.type === "spacer" && (
        <div>
          <label style={labelStyle}>Height (px)</label>
          <input
            type="number"
            min={8}
            max={200}
            value={block.height || 32}
            onChange={(e) => updateBlock("height", parseInt(e.target.value) || 32)}
            style={inputStyle}
          />
        </div>
      )}

      <button
        onClick={deleteBlock}
        style={{
          ...inputStyle,
          background: "rgba(239, 68, 68, 0.15)",
          cursor: "pointer",
          textAlign: "center",
          color: "#EF4444",
          fontSize: 12,
          marginTop: 4,
          border: "1px solid rgba(239, 68, 68, 0.25)",
        }}
      >
        Delete Block
      </button>
    </div>
  );
}

/* ── Shared Styles ── */
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
