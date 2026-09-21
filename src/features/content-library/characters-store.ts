"use client";

import { create } from "zustand";
import {
  EXAMPLE_CHARACTERS,
  type Character,
} from "@/features/content-library/characters-data";

interface CharactersState {
  characters: Character[];
  add: (character: Character) => void;
  update: (id: string, patch: Partial<Character>) => void;
  setArchived: (id: string, archived: boolean) => void;
}

/**
 * A real store rather than the seeded array, for the same reason the Product
 * Library has one: a character you just generated has to appear in the grid,
 * be editable, and survive moving between tabs — not flash a toast and vanish.
 *
 * Not persisted. A reload puts the workspace back to the four examples, which
 * is what every other mock here does.
 */
export const useCharactersStore = create<CharactersState>((set) => ({
  characters: EXAMPLE_CHARACTERS,
  /* Anything this workspace made goes in front of the examples. */
  add: (character) => set((state) => ({ characters: [character, ...state.characters] })),
  update: (id, patch) =>
    set((state) => ({
      characters: state.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  setArchived: (id, archived) =>
    set((state) => ({
      characters: state.characters.map((c) => (c.id === id ? { ...c, archived } : c)),
    })),
}));
