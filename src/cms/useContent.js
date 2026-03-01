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

export function useContentStyle(contentKey) {
  const ctx = useContext(ContentContext);
  return {
    fontSize: ctx.getContent(`style.${contentKey}.fontSize`),
    color: ctx.getContent(`style.${contentKey}.color`),
    updateStyle: (prop, value) => ctx.updateContent(`style.${contentKey}.${prop}`, value),
  };
}
