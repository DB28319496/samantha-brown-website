import { createContext, useContext } from "react";

export const SelectionContext = createContext();

export function useSelection() {
  return useContext(SelectionContext);
}
