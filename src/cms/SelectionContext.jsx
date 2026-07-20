import { useState, useCallback, useRef, useEffect } from "react";
import { SelectionContext } from "./useSelection";

export function SelectionProvider({ children }) {
  const [selectedElement, setSelectedElement] = useState(null);
  // selectedElement shape: { contentKey, type, index, rect, ref, groupKey }
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const undoRef = useRef(undoStack);
  const redoRef = useRef(redoStack);
  useEffect(() => { undoRef.current = undoStack; }, [undoStack]);
  useEffect(() => { redoRef.current = redoStack; }, [redoStack]);

  const select = useCallback((info) => {
    setSelectedElement(info);
  }, []);

  const deselect = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const pushUndo = useCallback((action) => {
    // action: { contentKey, oldValue, newValue }
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback((getContent, updateContent) => {
    const stack = undoRef.current;
    if (stack.length === 0) return;
    const action = stack[stack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, { ...action, oldValue: action.newValue, newValue: action.oldValue }]);
    updateContent(action.contentKey, action.oldValue);
  }, []);

  const redo = useCallback((getContent, updateContent) => {
    const stack = redoRef.current;
    if (stack.length === 0) return;
    const action = stack[stack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, { ...action, oldValue: action.newValue, newValue: action.oldValue }]);
    updateContent(action.contentKey, action.newValue);
  }, []);

  return (
    <SelectionContext.Provider value={{
      selectedElement, select, deselect,
      undoStack, redoStack, pushUndo, undo, redo,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
    }}>
      {children}
    </SelectionContext.Provider>
  );
}
