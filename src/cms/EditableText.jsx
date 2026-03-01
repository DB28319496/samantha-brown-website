import { useRef, useState, useCallback, useEffect } from "react";
import { useContent } from "./useContent";

export function EditableText({
  contentKey,
  as: Tag = "span",
  style = {},
  children,
  ...rest
}) {
  const { value, update, isEditing } = useContent(contentKey);
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayValue = value ?? children ?? "";

  // Sync contentEditable with external value changes
  useEffect(() => {
    if (ref.current && !isFocused && ref.current.textContent !== String(displayValue)) {
      ref.current.textContent = String(displayValue);
    }
  }, [displayValue, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current) return;
    const newText = ref.current.textContent;
    if (newText !== String(displayValue)) {
      update(newText);
    }
  }, [displayValue, update]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  // Visitor mode — render plain tag
  if (!isEditing) {
    return <Tag style={style} {...rest}>{displayValue}</Tag>;
  }

  // Admin editing mode
  const editStyle = {
    ...style,
    outline: isFocused
      ? "2px solid #3B82F6"
      : isHovered
        ? "2px dashed rgba(59, 130, 246, 0.4)"
        : "2px solid transparent",
    outlineOffset: "4px",
    cursor: "text",
    transition: "outline 0.2s ease",
    minWidth: "1em",
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={editStyle}
      onBlur={handleBlur}
      onFocus={() => setIsFocused(true)}
      onPaste={handlePaste}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {displayValue}
    </Tag>
  );
}

export function EditableArrayText({
  contentKey,
  index,
  field,
  as: Tag = "span",
  style = {},
  ...rest
}) {
  const { value: array, update, isEditing } = useContent(contentKey);
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const itemValue = array?.[index]?.[field] ?? "";

  useEffect(() => {
    if (ref.current && !isFocused && ref.current.textContent !== String(itemValue)) {
      ref.current.textContent = String(itemValue);
    }
  }, [itemValue, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current || !Array.isArray(array)) return;
    const newText = ref.current.textContent;
    if (newText !== String(itemValue)) {
      const newArray = array.map((item, i) =>
        i === index ? { ...item, [field]: newText } : item
      );
      update(newArray);
    }
  }, [array, index, field, itemValue, update]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  if (!isEditing) {
    return <Tag style={style} {...rest}>{itemValue}</Tag>;
  }

  const editStyle = {
    ...style,
    outline: isFocused
      ? "2px solid #3B82F6"
      : isHovered
        ? "2px dashed rgba(59, 130, 246, 0.4)"
        : "2px solid transparent",
    outlineOffset: "4px",
    cursor: "text",
    transition: "outline 0.2s ease",
    minWidth: "1em",
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={editStyle}
      onBlur={handleBlur}
      onFocus={() => setIsFocused(true)}
      onPaste={handlePaste}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {itemValue}
    </Tag>
  );
}

// Simple editable for flat array items (strings, not objects)
export function EditableArrayString({
  contentKey,
  index,
  as: Tag = "span",
  style = {},
  ...rest
}) {
  const { value: array, update, isEditing } = useContent(contentKey);
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const itemValue = array?.[index] ?? "";

  useEffect(() => {
    if (ref.current && !isFocused && ref.current.textContent !== String(itemValue)) {
      ref.current.textContent = String(itemValue);
    }
  }, [itemValue, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current || !Array.isArray(array)) return;
    const newText = ref.current.textContent;
    if (newText !== String(itemValue)) {
      const newArray = [...array];
      newArray[index] = newText;
      update(newArray);
    }
  }, [array, index, itemValue, update]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  if (!isEditing) {
    return <Tag style={style} {...rest}>{itemValue}</Tag>;
  }

  const editStyle = {
    ...style,
    outline: isFocused
      ? "2px solid #3B82F6"
      : isHovered
        ? "2px dashed rgba(59, 130, 246, 0.4)"
        : "2px solid transparent",
    outlineOffset: "4px",
    cursor: "text",
    transition: "outline 0.2s ease",
    minWidth: "1em",
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={editStyle}
      onBlur={handleBlur}
      onFocus={() => setIsFocused(true)}
      onPaste={handlePaste}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {itemValue}
    </Tag>
  );
}
