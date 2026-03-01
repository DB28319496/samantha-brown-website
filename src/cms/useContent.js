import { useContext } from "react";
import { ContentContext } from "./ContentProvider";

export function useContent(key) {
  const ctx = useContext(ContentContext);
  return {
    value: ctx.getContent(key),
    update: (newValue) => ctx.updateContent(key, newValue),
    isEditing: ctx.isEditing,
    isAdmin: ctx.isAdmin,
  };
}

export function useCMS() {
  return useContext(ContentContext);
}
