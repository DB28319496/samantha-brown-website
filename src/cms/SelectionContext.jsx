import { createContext, useState, useCallback, useContext } from "react";

const SelectionContext = createContext();

export function SelectionProvider({ children }) {
  const [selectedElement, setSelectedElement] = useState(null);
  // selectedElement shape: { contentKey, type, index, rect, ref, groupKey }
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

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
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, { ...action, oldValue: action.newValue, newValue: action.oldValue }]);
    updateContent(action.contentKey, action.oldValue);
  }, [undoStack]);

  const redo = useCallback((getContent, updateContent) => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, { ...action, oldValue: action.newValue, newValue: action.oldValue }]);
    updateContent(action.contentKey, action.newValue);
  }, [redoStack]);

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

export function useSelection() {
  return useContext(SelectionContext);
}
