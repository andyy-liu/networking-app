import { useContext } from "react";
import { TagContext, TagContextType } from "../types";

export type { TagContextType } from "../types";

export const useTags = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error("useTags must be used within a TagProvider");
  }
  return context;
};
