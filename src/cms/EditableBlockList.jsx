import { useState, useRef, useCallback } from "react";
import { useContent } from "./useContent";
import { useSelection } from "./SelectionContext";
import { EDITOR } from "./editorConstants";

/* ══════════════════════════════════════════════════════════════
   EDITABLE BLOCK LIST — Add headings, paragraphs, spacers
   ══════════════════════════════════════════════════════════════ */
export function EditableBlockList({ contentKey, style = {} }) {
  const { value: blocks, update, isEditing } = useContent(contentKey);
  const { select, selectedElement, pushUndo } = useSelection();
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const arr = Array.isArray(blocks) ? blocks : [];

  const addBlock = useCallback((type) => {
    const defaults = {
      heading: { type: "heading", text: "New heading" },
      paragraph: { type: "paragraph", text: "New paragraph text..." },
      spacer: { type: "spacer", height: 32 },
    };
    const old = [...arr];
    const next = [...arr, { ...defaults[type] }];
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, contentKey, pushUndo, update]);

  const updateBlock = useCallback((index, field, value) => {
    const old = [...arr];
    const next = [...arr];
    next[index] = { ...next[index], [field]: value };
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, contentKey, pushUndo, update]);

  const removeBlock = useCallback((index) => {
    const old = [...arr];
    const next = arr.filter((_, i) => i !== index);
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, contentKey, pushUndo, update]);

  const moveBlock = useCallback((from, to) => {
    if (to < 0 || to >= arr.length) return;
    const old = [...arr];
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, contentKey, pushUndo, update]);

  // Drag handlers
  const onDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    setTimeout(() => { if (e.currentTarget) e.currentTarget.style.opacity = "0.5"; }, 0);
  };
  const onDragEnd = (e) => { e.currentTarget.style.opacity = "1"; setDragIndex(null); setDropIndex(null); };
  const onDragOver = (e, index) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropIndex(index); };
  const onDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== toIndex) moveBlock(fromIndex, toIndex);
    setDragIndex(null);
    setDropIndex(null);
  };

  const isSelected = (index) =>
    selectedElement?.contentKey === contentKey && selectedElement?.index === index;

  // Don't render anything in visitor mode if there are no blocks
  if (!isEditing && arr.length === 0) return null;

  return (
    <div style={style}>
      {arr.map((block, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            ...(isEditing ? {
              outline: isSelected(i) ? `2px solid ${EDITOR.selectColor}` : dropIndex === i ? `2px dashed ${EDITOR.selectColor}` : "2px solid transparent",
              outlineOffset: 2,
              borderRadius: 4,
              transition: EDITOR.transitionFast,
            } : {}),
          }}
          draggable={isEditing}
          onDragStart={isEditing ? (e) => onDragStart(e, i) : undefined}
          onDragEnd={isEditing ? onDragEnd : undefined}
          onDragOver={isEditing ? (e) => onDragOver(e, i) : undefined}
          onDrop={isEditing ? (e) => onDrop(e, i) : undefined}
          onMouseEnter={isEditing ? () => setHoveredBlock(i) : undefined}
          onMouseLeave={isEditing ? () => setHoveredBlock(null) : undefined}
          onClick={isEditing ? (e) => {
            if (e.target.contentEditable === "true") return;
            select({ contentKey, type: "block", index: i, ref: e.currentTarget });
          } : undefined}
        >
          <BlockContent
            block={block}
            index={i}
            isEditing={isEditing}
            onTextChange={(text) => updateBlock(i, "text", text)}
          />

          {/* Block hover toolbar */}
          {isEditing && hoveredBlock === i && (
            <div
              data-editor-panel
              style={{
                position: "absolute",
                top: -12,
                right: -4,
                display: "flex",
                gap: 4,
                zIndex: 50,
                background: "rgba(45, 45, 45, 0.9)",
                borderRadius: 8,
                padding: "4px 6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                backdropFilter: "blur(8px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ToolBtn title="Move up" onClick={() => moveBlock(i, i - 1)} disabled={i === 0}>↑</ToolBtn>
              <ToolBtn title="Move down" onClick={() => moveBlock(i, i + 1)} disabled={i === arr.length - 1}>↓</ToolBtn>
              <ToolBtn
                title="Delete"
                onClick={() => { if (window.confirm("Delete this block?")) removeBlock(i); }}
                style={{ color: "#EF4444" }}
              >✕</ToolBtn>
            </div>
          )}
        </div>
      ))}

      {/* Add block toolbar — only in edit mode */}
      {isEditing && (
        <div style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          padding: "14px 0",
          margin: "8px 0",
          border: `2px dashed ${EDITOR.selectColor}50`,
          borderRadius: 12,
          background: EDITOR.selectColorLight,
          transition: EDITOR.transition,
        }}>
          <AddBtn onClick={() => addBlock("heading")}>+ Heading</AddBtn>
          <AddBtn onClick={() => addBlock("paragraph")}>+ Text</AddBtn>
          <AddBtn onClick={() => addBlock("spacer")}>+ Spacer</AddBtn>
        </div>
      )}
    </div>
  );
}

/* ── Block content renderer ── */
function BlockContent({ block, isEditing, onTextChange }) {
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Use innerText on blur to preserve line breaks as \n
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current) return;
    // innerText preserves newlines; trim trailing newline added by contentEditable
    const newText = ref.current.innerText.replace(/\n$/, "");
    if (newText !== (block.text || "")) onTextChange(newText);
  }, [block.text, onTextChange]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  }, []);

  // Sync text into element when not focused
  const syncRef = useCallback((el) => {
    if (el && !isFocused) {
      ref.current = el;
      if (el.innerText !== (block.text || "")) {
        el.innerText = block.text || "";
      }
    } else {
      ref.current = el;
    }
  }, [block.text, isFocused]);

  const editOutline = isEditing ? {
    outline: isFocused ? `2px solid ${EDITOR.selectColor}` : "2px solid transparent",
    outlineOffset: 4,
    cursor: "text",
    transition: "outline 0.2s",
    minWidth: "1em",
  } : {};

  if (block.type === "heading") {
    return (
      <h3
        ref={isEditing ? syncRef : undefined}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={isEditing ? handleBlur : undefined}
        onFocus={isEditing ? () => setIsFocused(true) : undefined}
        onPaste={isEditing ? handlePaste : undefined}
        style={{
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 700,
          fontSize: block.style?.fontSize || "24px",
          color: block.style?.color || "#2D2D2D",
          margin: "16px 0 8px",
          lineHeight: 1.2,
          whiteSpace: "pre-wrap",
          ...editOutline,
        }}
      >
        {!isEditing ? block.text : undefined}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p
        ref={isEditing ? syncRef : undefined}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={isEditing ? handleBlur : undefined}
        onFocus={isEditing ? () => setIsFocused(true) : undefined}
        onPaste={isEditing ? handlePaste : undefined}
        style={{
          fontFamily: "'Rubik', sans-serif",
          fontSize: block.style?.fontSize || "15px",
          color: block.style?.color || "#555550",
          lineHeight: 1.75,
          margin: "8px 0",
          whiteSpace: "pre-wrap",
          ...editOutline,
        }}
      >
        {!isEditing ? block.text : undefined}
      </p>
    );
  }

  if (block.type === "spacer") {
    return (
      <div style={{
        height: block.height || 32,
        ...(isEditing ? {
          background: `${EDITOR.selectColor}08`,
          border: `1px dashed ${EDITOR.selectColor}30`,
          borderRadius: 4,
        } : {}),
      }} />
    );
  }

  return null;
}

/* ── Tiny button helpers ── */
function ToolBtn({ children, disabled, style: s = {}, ...rest }) {
  return (
    <button
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: 14,
        cursor: disabled ? "default" : "pointer",
        padding: "2px 6px",
        borderRadius: 4,
        fontFamily: "system-ui",
        lineHeight: 1,
        opacity: disabled ? 0.3 : 1,
        transition: "background 0.15s",
        ...s,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function AddBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Rubik', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: EDITOR.selectColor,
        background: "rgba(59, 130, 246, 0.08)",
        border: `1px solid ${EDITOR.selectColor}40`,
        borderRadius: 8,
        padding: "6px 14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)"; }}
    >
      {children}
    </button>
  );
}
