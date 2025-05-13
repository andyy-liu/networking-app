import { createContext } from "react";

export interface TagContextType {
  availableTags: string[];
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => Promise<boolean>;
  isDefaultTag: (tag: string) => boolean;
};

export const TagContext = createContext<TagContextType | undefined>(undefined);