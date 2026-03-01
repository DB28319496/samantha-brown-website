import { useState, useEffect } from "react";
import { adminSignIn, adminSignOut } from "../supabase/auth";
import { useCMS } from "./useContent";

const C = {
  charcoal: "#2D2D2D",
  cream: "#FAF7F2",
  sand: "#DDD0BE",
  oceanBlue: "#7BA7B3",
  body: "#555550",
  coral: "#E8A87C",
};

export function AdminLoginListener() {
  const { setShowLoginModal, isAdmin } = useCMS();

  // URL trigger: add ?admin to the URL to open login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("admin") && !isAdmin) {
      setShowLoginModal(true);
      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setShowLoginModal, isAdmin]);

  // Keyboard trigger: Ctrl+Shift+A (Cmd+Shift+A on Mac)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setShowLoginModal(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setShowLoginModal]);

  return null;
}

export function AdminLoginModal() {
  const { showLoginModal, setShowLoginModal, isAdmin } = useCMS();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showLoginModal || isAdmin) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminSignIn(email, password);
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    fontFamily: "'Rubik', sans-serif",
    fontSize: 15,
    border: `1.5px solid ${C.sand}`,
    borderRadius: 12,
    padding: "13px 18px",
    outline: "none",
    background: C.cream,
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      onClick={() => setShowLoginModal(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(45, 45, 45, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "36px 32px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: C.charcoal, margin: "0 0 4px" }}>
          Admin Login
        </h2>
        <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: C.body, margin: "0 0 24px" }}>
          Sign in to edit site content
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: C.coral, margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              fontFamily: "'Rubik', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              background: C.charcoal,
              color: C.cream,
              border: "none",
              borderRadius: 50,
              padding: "14px 34px",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          onClick={() => setShowLoginModal(false)}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: C.body,
            padding: 4,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export { adminSignOut };
