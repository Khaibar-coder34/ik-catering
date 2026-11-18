"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Catalog } from "@/src/lib/catalog-schema";
import {
  EMPTY_SELECTION, removeSelectionDish,
  resolveSelection, restoreSelection, serializeSelection, toggleSelectionDish, validateSelection, type Selection,
} from "@/src/lib/selection";

function createSelectionStore(catalog: Catalog) {
  let selection = EMPTY_SELECTION;
  const listeners = new Set<() => void>();
  const storageKey = `ik-catering-selection:v2:${catalog.isDemo ? "demo" : "published"}`;
  const notify = () => listeners.forEach((listener) => listener());
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => selection,
    hydrate() {
      try { selection = restoreSelection(catalog, sessionStorage.getItem(storageKey)); }
      catch { selection = EMPTY_SELECTION; }
      notify();
    },
    update(updater: (current: Selection) => Selection) {
      // The current quote flow only accepts individual dishes, never legacy arrangements.
      selection = validateSelection(catalog, { ...updater(selection), arrangementId: null, arrangementDishIds: [] });
      try { sessionStorage.setItem(storageKey, serializeSelection(selection)); }
      catch { /* Selection still works during navigation when storage is unavailable. */ }
      notify();
    },
  };
}

type SelectionContextValue = {
  catalog: Catalog;
  selection: Selection;
  selectedDishes: ReturnType<typeof resolveSelection>["dishes"];
  count: number;
  toggleDish: (id: string) => void;
  removeDish: (id: string) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const [store] = useState(() => createSelectionStore(catalog));
  const selection = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY_SELECTION);
  useEffect(() => { store.hydrate(); }, [store]);
  const value = useMemo<SelectionContextValue>(() => {
    const resolved = resolveSelection(catalog, selection);
    return {
      catalog, selection, selectedDishes: resolved.dishes, count: resolved.dishIds.length,
      toggleDish: (id) => store.update((current) => toggleSelectionDish(catalog, current, id)),
      removeDish: (id) => store.update((current) => removeSelectionDish(catalog, current, id)),
      clearSelection: () => store.update(() => EMPTY_SELECTION),
    };
  }, [catalog, selection, store]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("SelectionProvider ontbreekt.");
  return context;
}
