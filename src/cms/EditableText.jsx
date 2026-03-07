import { useRef, useState, useCallback } from "react";
import { useContent, useCMS } from "./useContent";
import { useSelection } from "./SelectionContext";

/* Sanitize HTML — allow only safe inline formatting tags */
function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<(?!\/?(?:b|strong|i|em|u|s|br|span)\b)[^>]+>/gi, "");
}

export function EditableText({
  contentKey,
  as: Tag = "span",
  style = {},
  children,
  ...rest
}) {
  const { value, update, isEditing } = useContent(contentKey);
  const { getContent } = useCMS();
  const { select } = useSelection();
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayValue = value ?? children ?? "";

  // Read style overrides
  const fontSizeOverride = getContent(`style.${contentKey}.fontSize`);
  const colorOverride = getContent(`style.${contentKey}.color`);
  const lineHeightOverride = getContent(`style.${contentKey}.lineHeight`);
  const overrideStyle = {
    ...(fontSizeOverride ? { fontSize: fontSizeOverride } : {}),
    ...(colorOverride ? { color: colorOverride } : {}),
    ...(lineHeightOverride ? { lineHeight: lineHeightOverride } : {}),
  };

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current) return;
    const newHtml = sanitizeHtml(ref.current.innerHTML);
    if (newHtml !== String(displayValue)) {
      update(newHtml);
    }
  }, [displayValue, update]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  // Visitor mode — dangerouslySetInnerHTML preserves bold/italic
  if (!isEditing) {
    return (
      <Tag
        style={{ ...style, ...overrideStyle }}
        {...rest}
        dangerouslySetInnerHTML={{ __html: String(displayValue) }}
      />
    );
  }

  // Admin editing mode — when not focused, use dangerouslySetInnerHTML so content
  // is always visible. When focused, omit it so React won't touch innerHTML and
  // cause cursor jumps.
  const editStyle = {
    ...style,
    ...overrideStyle,
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
      onClick={() => select({ contentKey, type: "text" })}
      {...rest}
      {...(!isFocused ? { dangerouslySetInnerHTML: { __html: sanitizeHtml(String(displayValue)) } } : {})}
    />
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

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current || !Array.isArray(array)) return;
    const newHtml = sanitizeHtml(ref.current.innerHTML);
    if (newHtml !== String(itemValue)) {
      const newArray = array.map((item, i) =>
        i === index ? { ...item, [field]: newHtml } : item
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
    return <Tag style={style} {...rest} dangerouslySetInnerHTML={{ __html: String(itemValue) }} />;
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
      {...(!isFocused ? { dangerouslySetInnerHTML: { __html: sanitizeHtml(String(itemValue)) } } : {})}
    />
  );
}

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

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!ref.current || !Array.isArray(array)) return;
    const newHtml = sanitizeHtml(ref.current.innerHTML);
    if (newHtml !== String(itemValue)) {
      const newArray = [...array];
      newArray[index] = newHtml;
      update(newArray);
    }
  }, [array, index, itemValue, update]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  if (!isEditing) {
    return <Tag style={style} {...rest} dangerouslySetInnerHTML={{ __html: String(itemValue) }} />;
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
      {...(!isFocused ? { dangerouslySetInnerHTML: { __html: sanitizeHtml(String(itemValue)) } } : {})}
    />
  );
}
