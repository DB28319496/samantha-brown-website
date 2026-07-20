import { useState, useEffect, useCallback, useRef } from "react";
import { ContentContext } from "./ContentContext";
import { onAuthChange } from "../supabase/auth";
import { fetchContent, saveContent } from "../supabase/firestore";
import { defaultContent } from "./contentSchema";

export { ContentContext };

export function ContentProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [liveContent, setLiveContent] = useState({});
  const [draftContent, setDraftContent] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const autoSaveTimer = useRef(null);

  // Auth listener
  useEffect(() => {
    return onAuthChange((user) => {
      setIsAdmin(!!user);
      if (!user) {
        setIsEditing(false);
        setPendingChanges({});
      }
    });
  }, []);

  // Fetch content on mount and when admin status changes
  useEffect(() => {
    async function load() {
      try {
        const live = await fetchContent("live");
        setLiveContent(live);
        if (isAdmin) {
          const draft = await fetchContent("draft");
          setDraftContent(draft);
        }
      } catch (err) {
        console.error("Content fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin]);

  // Auto-save drafts every 30 seconds
  useEffect(() => {
    if (!isEditing || Object.keys(pendingChanges).length === 0) return;
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const merged = { ...draftContent, ...pendingChanges };
        await saveContent("draft", merged);
        setDraftContent(merged);
        setPendingChanges({});
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 30000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [isEditing, pendingChanges, draftContent]);

  // Unsaved changes warning
  useEffect(() => {
    if (Object.keys(pendingChanges).length === 0) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pendingChanges]);

  const getContent = useCallback((key) => {
    if (isEditing) {
      if (key in pendingChanges) return pendingChanges[key];
      if (key in draftContent) return draftContent[key];
    }
    if (key in liveContent) return liveContent[key];
    return defaultContent[key];
  }, [isEditing, pendingChanges, draftContent, liveContent]);

  const updateContent = useCallback((key, value) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveDraft = useCallback(async () => {
    clearTimeout(autoSaveTimer.current);
    const merged = { ...draftContent, ...pendingChanges };
    await saveContent("draft", merged);
    setDraftContent(merged);
    setPendingChanges({});
  }, [draftContent, pendingChanges]);

  const publish = useCallback(async () => {
    clearTimeout(autoSaveTimer.current);
    const merged = { ...liveContent, ...draftContent, ...pendingChanges };
    await saveContent("live", merged);
    await saveContent("draft", {});
    setLiveContent(merged);
    setDraftContent({});
    setPendingChanges({});
  }, [liveContent, draftContent, pendingChanges]);

  const discardChanges = useCallback(async () => {
    clearTimeout(autoSaveTimer.current);
    setPendingChanges({});
    setDraftContent({});
    try { await saveContent("draft", {}); } catch (err) { console.error("Discard draft failed:", err); }
  }, []);

  const hasPendingChanges = Object.keys(pendingChanges).length > 0 || Object.keys(draftContent).length > 0;

  return (
    <ContentContext.Provider value={{
      isAdmin,
      isEditing,
      setIsEditing,
      loading,
      getContent,
      updateContent,
      saveDraft,
      publish,
      discardChanges,
      hasPendingChanges,
      showLoginModal,
      setShowLoginModal,
    }}>
      {children}
    </ContentContext.Provider>
  );
}
