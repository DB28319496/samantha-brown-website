import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { useContent, useCMS } from "./useContent";
import { useSelection } from "./SelectionContext";

/* Sanitize HTML — allow only safe inline formatting tags */
function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<(?!\/?(?:b|strong|i|em|u|s|br|span)\b)[^>]+>/gi, "");
}

/* Get the cursor's character offset within an element's text content */
function getCursorOffset(el) {
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer)) return null;
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  } catch (e) {
    return null;
  }
}

/* Restore cursor to a saved character offset within an element */
function restoreCursor(el, savedOffset) {
  try {
    const sel = window.getSelection();
    const range = document.createRange();
    const textLen = (el.textContent || "").length;
    const target = savedOffset !== null ? Math.min(savedOffset, textLen) : textLen;
    let current = 0;
    let found = false;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const len = node.textContent.length;
      if (current + len >= target) {
        range.setStart(node, target - current);
        range.collapse(true);
        found = true;
        break;
      }
      current += len;
    }
    if (!found) {
      range.selectNodeContents(el);
      range.collapse(false);
    }
    sel?.removeAllRanges();
    sel?.addRange(range);
  } catch (e) {
    // ignore
  }
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
  const savedCursorRef = useRef(null);

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

  // Save cursor offset in onFocus, BEFORE React re-renders and clears innerHTML.
  // (React clears innerHTML when dangerouslySetInnerHTML prop is removed on re-render.)
  const handleFocus = useCallback(() => {
    savedCursorRef.current = ref.current ? getCursorOffset(ref.current) : null;
    setIsFocused(true);
  }, []);

  // After React commits (innerHTML cleared), restore content + cursor.
  // Runs only when isFocused transitions to true — not on every keystroke.
  useLayoutEffect(() => {
    if (!isFocused || !ref.current) return;
    const html = sanitizeHtml(String(displayValue));
    if (ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
      restoreCursor(ref.current, savedCursorRef.current);
    }
  }, [isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Visitor mode
  if (!isEditing) {
    return (
      <Tag
        style={{ ...style, ...overrideStyle }}
        {...rest}
        dangerouslySetInnerHTML={{ __html: String(displayValue) }}
      />
    );
  }

  // Admin mode:
  // - Not focused: dangerouslySetInnerHTML keeps content always visible.
  // - Focused: prop is removed so React won't interfere while user types;
  //   content + cursor are restored by useLayoutEffect above.
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
      onFocus={handleFocus}
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
  const savedCursorRef = useRef(null);

  const itemValue = array?.[index]?.[field] ?? "";

  const handleFocus = useCallback(() => {
    savedCursorRef.current = ref.current ? getCursorOffset(ref.current) : null;
    setIsFocused(true);
  }, []);

  useLayoutEffect(() => {
    if (!isFocused || !ref.current) return;
    const html = sanitizeHtml(String(itemValue));
    if (ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
      restoreCursor(ref.current, savedCursorRef.current);
    }
  }, [isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

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
      onFocus={handleFocus}
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
  const savedCursorRef = useRef(null);

  const itemValue = array?.[index] ?? "";

  const handleFocus = useCallback(() => {
    savedCursorRef.current = ref.current ? getCursorOffset(ref.current) : null;
    setIsFocused(true);
  }, []);

  useLayoutEffect(() => {
    if (!isFocused || !ref.current) return;
    const html = sanitizeHtml(String(itemValue));
    if (ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
      restoreCursor(ref.current, savedCursorRef.current);
    }
  }, [isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

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
      onFocus={handleFocus}
      onPaste={handlePaste}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
      {...(!isFocused ? { dangerouslySetInnerHTML: { __html: sanitizeHtml(String(itemValue)) } } : {})}
    />
  );
}
