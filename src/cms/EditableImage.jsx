import { useRef, useState } from "react";
import { useContent } from "./useContent";
import { uploadImage } from "../supabase/storage";

export function EditableImage({
  contentKey,
  alt = "",
  style = {},
  placeholderEmoji = "📸",
  placeholderLabel = "",
  placeholderHeight = 320,
  placeholderBg = "#EDE5D8",
  placeholderRadius = 16,
}) {
  const { value: imageUrl, update, isEditing } = useContent(contentKey);
  const [uploading, setUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  const Placeholder = () => (
    <div style={{
      width: "100%",
      height: placeholderHeight,
      background: placeholderBg,
      borderRadius: placeholderRadius,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      overflow: "hidden",
      ...style,
    }}>
      <span style={{ fontSize: 48 }}>{placeholderEmoji}</span>
      {placeholderLabel && <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#9B8B6B" }}>{placeholderLabel}</span>}
    </div>
  );

  // Visitor mode
  if (!isEditing) {
    if (!imageUrl) return <Placeholder />;
    return <img src={imageUrl} alt={alt} style={{ width: "100%", objectFit: "cover", borderRadius: placeholderRadius, height: placeholderHeight, ...style }} />;
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, contentKey);
      update(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // Admin mode
  return (
    <div
      style={{ position: "relative", borderRadius: placeholderRadius, overflow: "hidden", ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt} style={{ width: "100%", objectFit: "cover", display: "block", height: placeholderHeight }} />
      ) : (
        <Placeholder />
      )}

      {/* Upload overlay */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(45, 45, 45, 0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s",
          cursor: "pointer",
          borderRadius: "inherit",
        }}
      >
        <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600, color: "#FAF7F2" }}>
          {uploading ? "Uploading..." : imageUrl ? "Replace Image" : "Upload Image"}
        </span>
        {imageUrl && (
          <button
            onClick={(e) => { e.stopPropagation(); update(null); }}
            style={{
              fontFamily: "'Rubik', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#E8A87C",
              background: "rgba(232, 168, 124, 0.15)",
              border: "1px solid rgba(232, 168, 124, 0.3)",
              borderRadius: 8,
              padding: "5px 14px",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
}
