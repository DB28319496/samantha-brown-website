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
  const [uploadError, setUploadError] = useState(null);
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
      {placeholderLabel && <span style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 16, color: "#8A877E" }}>{placeholderLabel}</span>}
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
    setUploadError(null);
    try {
      const url = await uploadImage(file, contentKey);
      update(url);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed — check console for details.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Admin mode
  return (
    <div
      style={{ position: "relative", borderRadius: placeholderRadius, overflow: "visible", ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      <div style={{ borderRadius: placeholderRadius, overflow: "hidden", position: "relative" }}>
        {imageUrl ? (
          <img src={imageUrl} alt={alt} style={{ width: "100%", objectFit: "cover", display: "block", height: placeholderHeight }} />
        ) : (
          <Placeholder />
        )}

        {/* Upload overlay */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
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
            cursor: uploading ? "wait" : "pointer",
            borderRadius: "inherit",
          }}
        >
          <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600, color: "#FDFAF4" }}>
            {uploading ? "Uploading…" : imageUrl ? "Replace Image" : "Upload Image"}
          </span>
          {imageUrl && !uploading && (
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
      </div>

      {/* Error message shown below the image */}
      {uploadError && (
        <div style={{
          marginTop: 8,
          padding: "10px 14px",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 8,
          fontFamily: "'Rubik', sans-serif",
          fontSize: 12,
          color: "#DC2626",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#DC2626", fontSize: 16, lineHeight: 1, flexShrink: 0 }}
          >×</button>
        </div>
      )}

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
