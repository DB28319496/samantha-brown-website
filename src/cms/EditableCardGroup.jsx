import { useState, useRef, useCallback, useMemo } from "react";
import { useContent } from "./useContent";
import { useSelection } from "./useSelection";
import { EDITOR } from "./editorConstants";

export function EditableCardGroup({
  contentKey,
  renderCard,
  defaultNewItem = {},
  gridStyle = {},
  gridClassName,
  minCards = 1,
  maxCards = 12,
  cardStyle = {},
}) {
  const { value: items, update, isEditing } = useContent(contentKey);
  const { select, selectedElement, pushUndo } = useSelection();
  const [, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const gridRef = useRef(null);
  const arr = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const addCard = useCallback(() => {
    if (arr.length >= maxCards) return;
    const old = [...arr];
    const next = [...arr, { ...defaultNewItem }];
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, maxCards, defaultNewItem, pushUndo, contentKey, update]);

  const removeCard = useCallback((index) => {
    if (arr.length <= minCards) return;
    const old = [...arr];
    const next = arr.filter((_, i) => i !== index);
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, minCards, pushUndo, contentKey, update]);

  const moveCard = useCallback((from, to) => {
    if (to < 0 || to >= arr.length) return;
    const old = [...arr];
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, pushUndo, contentKey, update]);

  const duplicateCard = useCallback((index) => {
    if (arr.length >= maxCards) return;
    const old = [...arr];
    const next = [...arr];
    next.splice(index + 1, 0, { ...arr[index] });
    pushUndo({ contentKey, oldValue: old, newValue: next });
    update(next);
  }, [arr, maxCards, pushUndo, contentKey, update]);

  // Drag handlers
  const onDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    // Make drag image slightly transparent
    if (e.currentTarget) {
      setTimeout(() => { e.currentTarget.style.opacity = "0.5"; }, 0);
    }
  };

  const onDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDragIndex(null);
    setDropIndex(null);
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndex(index);
  };

  const onDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== toIndex) {
      moveCard(fromIndex, toIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const isSelected = (index) =>
    selectedElement?.contentKey === contentKey && selectedElement?.index === index;

  return (
    <div ref={gridRef} className={gridClassName} style={{ ...gridStyle, position: "relative" }}>
      {arr.map((item, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            ...(isEditing ? {
              outline: isSelected(i) ? `2px solid ${EDITOR.selectColor}` : dropIndex === i ? `2px dashed ${EDITOR.selectColor}` : "2px solid transparent",
              outlineOffset: 2,
              borderRadius: 4,
              transition: EDITOR.transitionFast,
            } : {}),
            ...cardStyle,
          }}
          draggable={isEditing}
          onDragStart={isEditing ? (e) => onDragStart(e, i) : undefined}
          onDragEnd={isEditing ? onDragEnd : undefined}
          onDragOver={isEditing ? (e) => onDragOver(e, i) : undefined}
          onDrop={isEditing ? (e) => onDrop(e, i) : undefined}
          onMouseEnter={isEditing ? () => setHoveredCard(i) : undefined}
          onMouseLeave={isEditing ? () => setHoveredCard(null) : undefined}
          onClick={isEditing ? (e) => {
            // Don't select when clicking editable text inside
            if (e.target.contentEditable === "true") return;
            select({ contentKey, type: "card", index: i, ref: e.currentTarget });
          } : undefined}
        >
          {renderCard(item, i)}

          {/* Card hover toolbar */}
          {isEditing && hoveredCard === i && (
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
              {/* Drag handle */}
              <button
                title="Drag to reorder"
                style={toolBtnStyle}
                onMouseDown={(e) => { e.stopPropagation(); }}
              >
                ⠿
              </button>
              {/* Move up */}
              <button
                title="Move up"
                onClick={() => moveCard(i, i - 1)}
                disabled={i === 0}
                style={{ ...toolBtnStyle, opacity: i === 0 ? 0.3 : 1 }}
              >
                ↑
              </button>
              {/* Move down */}
              <button
                title="Move down"
                onClick={() => moveCard(i, i + 1)}
                disabled={i === arr.length - 1}
                style={{ ...toolBtnStyle, opacity: i === arr.length - 1 ? 0.3 : 1 }}
              >
                ↓
              </button>
              {/* Duplicate */}
              <button
                title="Duplicate"
                onClick={() => duplicateCard(i)}
                disabled={arr.length >= maxCards}
                style={{ ...toolBtnStyle, opacity: arr.length >= maxCards ? 0.3 : 1 }}
              >
                ⧉
              </button>
              {/* Delete */}
              <button
                title="Delete"
                onClick={() => { if (window.confirm("Delete this card?")) removeCard(i); }}
                disabled={arr.length <= minCards}
                style={{ ...toolBtnStyle, color: arr.length <= minCards ? "#666" : "#EF4444", opacity: arr.length <= minCards ? 0.3 : 1 }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add card button */}
      {isEditing && arr.length < maxCards && (
        <div
          onClick={addCard}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 120,
            border: `2px dashed ${EDITOR.selectColor}50`,
            borderRadius: 16,
            cursor: "pointer",
            background: `${EDITOR.selectColorLight}`,
            transition: EDITOR.transition,
            flexDirection: "column",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = EDITOR.selectColor;
            e.currentTarget.style.background = `${EDITOR.selectColor}18`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${EDITOR.selectColor}50`;
            e.currentTarget.style.background = EDITOR.selectColorLight;
          }}
        >
          <span style={{
            fontSize: 28,
            color: EDITOR.selectColor,
            fontWeight: 300,
            lineHeight: 1,
          }}>+</span>
          <span style={{
            fontFamily: "'Rubik', sans-serif",
            fontSize: 12,
            color: EDITOR.selectColor,
            fontWeight: 500,
          }}>Add card</span>
        </div>
      )}
    </div>
  );
}

const toolBtnStyle = {
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: 14,
  cursor: "pointer",
  padding: "2px 6px",
  borderRadius: 4,
  fontFamily: "system-ui",
  lineHeight: 1,
  transition: "background 0.15s",
};
