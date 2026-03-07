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
        background: "rgba(28, 28, 28, 0.97)",
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
   BRAND COLOR PALETTE — Matches brand guidelines
   ══════════════════════════════════════════════════════════════ */
const colorPalette = {
  charcoal:    "#2C2C28",
  cream:       "#FDFAF4",
  sand:        "#E2DDD4",
  olive:       "#555407",
  butter:      "#F2E84B",
  coral:       "#E8A87C",
  motherEarth: "#7A5C4E",
  skyBlue:     "#D8EBF9",
  white:       "#FFFFFF",
  warmTan:     "#8A877E",
};

/* ══════════════════════════════════════════════════════════════
   COLOR PICKER FIELD
   ══════════════════════════════════════════════════════════════ */
function ColorPickerField({ label, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

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
            width: 32, height: 32, borderRadius: 8,
            background: value || "#ccc",
            border: showPicker ? `2px solid ${EDITOR.selectColor}` : "2px solid rgba(255,255,255,0.2)",
            cursor: "pointer", flexShrink: 0,
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
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5,
          marginTop: 8, padding: 10,
          background: "rgba(255,255,255,0.06)", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {Object.entries(colorPalette).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => { onChange(hex); setShowPicker(false); }}
              title={name}
              style={{
                width: "100%", aspectRatio: "1", borderRadius: 6, background: hex,
                border: value === hex ? `2px solid ${EDITOR.selectColor}` : "1.5px solid rgba(255,255,255,0.15)",
                cursor: "pointer", transition: "transform 0.15s",
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
   FONT SIZE FIELD — +/- stepper with manual input
   ══════════════════════════════════════════════════════════════ */
function FontSizeField({ label = "Font Size", value, onChange }) {
  const numVal = parseInt(value) || 16;

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => onChange(`${Math.max(8, numVal - 1)}px`)}
          style={stepBtnStyle}
          title="Decrease font size"
        >−</button>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="default"
          style={{ ...inputStyle, flex: 1, textAlign: "center" }}
        />
        <button
          onClick={() => onChange(`${Math.min(120, numVal + 1)}px`)}
          style={stepBtnStyle}
          title="Increase font size"
        >+</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LINE HEIGHT FIELD
   ══════════════════════════════════════════════════════════════ */
function LineHeightField({ value, onChange }) {
  const numVal = parseFloat(value) || 1.5;

  return (
    <div>
      <label style={labelStyle}>Line Height</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => onChange((Math.max(0.8, numVal - 0.1)).toFixed(1))}
          style={stepBtnStyle}
        >−</button>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="default"
          style={{ ...inputStyle, flex: 1, textAlign: "center" }}
        />
        <button
          onClick={() => onChange((Math.min(3.0, numVal + 0.1)).toFixed(1))}
          style={stepBtnStyle}
        >+</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEXT STYLE PRESETS
   ══════════════════════════════════════════════════════════════ */
const textPresets = [
  { label: "Title",      fontSize: "48px", lineHeight: "1.1", fontWeight: "700" },
  { label: "Subheading", fontSize: "28px", lineHeight: "1.3", fontWeight: "600" },
  { label: "Body",       fontSize: "16px", lineHeight: "1.7", fontWeight: "400" },
  { label: "Caption",    fontSize: "13px", lineHeight: "1.5", fontWeight: "400" },
];

/* ══════════════════════════════════════════════════════════════
   PAGE SELECT FIELD
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
   CARD EDITOR — ordered: title, subheading, body, CTA, link to
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

  // Ordered field rendering: title → subheading → body → cta → page → others
  const fieldOrder = ["title", "subheading", "body", "cta", "page", "bg", "accent"];
  const fieldLabels = {
    title: "Title",
    subheading: "Subheading",
    body: "Body",
    cta: "CTA Button Text",
    page: "Link To",
    bg: "Background Color",
    accent: "Accent Color",
  };

  const allKeys = [...new Set([...fieldOrder, ...Object.keys(card)])];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {allKeys.map((key) => {
        if (!(key in card)) return null;
        const val = card[key];

        if (key === "bg" || key === "accent") {
          return (
            <ColorPickerField
              key={key}
              label={fieldLabels[key] || key}
              value={val}
              onChange={(newColor) => updateField(key, newColor)}
            />
          );
        }
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
        if (typeof val === "string") {
          const label = fieldLabels[key] || key;
          return (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
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
   TEXT EDITOR — Font size +/-, line height, color, presets
   ══════════════════════════════════════════════════════════════ */
function TextEditor({ contentKey }) {
  const { getContent, updateContent } = useCMS();
  const { pushUndo } = useSelection();
  const value = getContent(contentKey);
  const fontSize = getContent(`style.${contentKey}.fontSize`);
  const textColor = getContent(`style.${contentKey}.color`);
  const lineHeight = getContent(`style.${contentKey}.lineHeight`);

  const updateStyle = (prop, val) => {
    const key = `style.${contentKey}.${prop}`;
    const oldVal = getContent(key);
    pushUndo({ contentKey: key, oldValue: oldVal, newValue: val });
    updateContent(key, val);
  };

  const applyPreset = (preset) => {
    updateStyle("fontSize", preset.fontSize);
    updateStyle("lineHeight", preset.lineHeight);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Content preview */}
      <div>
        <label style={labelStyle}>Content</label>
        <div style={{
          ...inputStyle,
          background: "rgba(255,255,255,0.05)", cursor: "default",
          maxHeight: 80, overflow: "auto", whiteSpace: "pre-wrap", fontSize: 12,
        }}>
          {typeof value === "string" ? value.replace(/<[^>]+>/g, "") : JSON.stringify(value, null, 2)}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, lineHeight: 1.5 }}>
          Click the text on the page to edit inline.
        </p>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Text style presets */}
      <div>
        <label style={labelStyle}>Style Presets</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {textPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              style={{
                ...inputStyle,
                cursor: "pointer",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 10px",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Font size */}
      <FontSizeField value={fontSize} onChange={(val) => updateStyle("fontSize", val)} />

      {/* Line height */}
      <LineHeightField value={lineHeight} onChange={(val) => updateStyle("lineHeight", val)} />

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
          updateStyle("lineHeight", null);
        }}
        style={{
          ...inputStyle,
          background: "rgba(255,255,255,0.05)", cursor: "pointer",
          textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12,
          marginTop: 4, border: "1px solid rgba(255,255,255,0.08)", transition: "background 0.2s",
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
   BLOCK EDITOR — Font size +/-, line height, color
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
          <FontSizeField
            value={block.style?.fontSize}
            onChange={(val) => updateBlock("style.fontSize", val)}
          />
          {block.type === "paragraph" && (
            <LineHeightField
              value={block.style?.lineHeight}
              onChange={(val) => updateBlock("style.lineHeight", val)}
            />
          )}
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => updateBlock("height", Math.max(8, (block.height || 32) - 8))}
              style={stepBtnStyle}
            >−</button>
            <input
              type="number"
              min={8}
              max={200}
              value={block.height || 32}
              onChange={(e) => updateBlock("height", parseInt(e.target.value) || 32)}
              style={{ ...inputStyle, textAlign: "center" }}
            />
            <button
              onClick={() => updateBlock("height", Math.min(200, (block.height || 32) + 8))}
              style={stepBtnStyle}
            >+</button>
          </div>
        </div>
      )}

      <button
        onClick={deleteBlock}
        style={{
          ...inputStyle,
          background: "rgba(239, 68, 68, 0.15)", cursor: "pointer",
          textAlign: "center", color: "#EF4444", fontSize: 12,
          marginTop: 4, border: "1px solid rgba(239, 68, 68, 0.25)",
        }}
      >
        Delete Block
      </button>
    </div>
  );
}

/* ── Shared Styles ── */
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
  letterSpacing: "0.5px", marginBottom: 6, fontFamily: "'Rubik', sans-serif",
};

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
  padding: "8px 12px", color: "#fff", fontSize: 13,
  fontFamily: "'Rubik', sans-serif", outline: "none",
  transition: "border 0.2s", boxSizing: "border-box",
};

const textareaStyle = { ...inputStyle, resize: "vertical", lineHeight: 1.5 };

const stepBtnStyle = {
  width: 32, height: 36, borderRadius: 6,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff", fontSize: 18, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0, fontFamily: "system-ui", lineHeight: 1,
  transition: "background 0.15s",
};
