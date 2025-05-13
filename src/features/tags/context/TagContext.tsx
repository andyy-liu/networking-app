import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/client";
import { useAuth } from "../../auth/hooks/useAuth";
import { useCallback } from "react";
import { TagContext } from "../types";

// Default available tags
const DEFAULT_TAGS = ["Recruiter", "Alumni", "Employee"];

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);

  // Fetch all unique tags from existing contacts
  const fetchAllTags = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("tags")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching tags:", error);
        return;
      }

      // Extract all tags and flatten the array
      const allTags = data.reduce((acc: string[], item) => {
        return [...acc, ...(item.tags || [])];
      }, []);

      // Remove duplicates and merge with default tags
      const uniqueTags = [...new Set([...DEFAULT_TAGS, ...allTags])];
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error("Error processing tags:", error);
    }
  }, [user]);

  // Load tags when user changes
  useEffect(() => {
    if (user) {
      fetchAllTags();
    }
  }, [user, fetchAllTags]);

  // Check if a tag is a default tag
  const isDefaultTag = (tag: string): boolean => {
    return DEFAULT_TAGS.includes(tag);
  };

  // Add a new tag to the available tags list
  const addTag = (tag: string) => {
    if (!tag || availableTags.includes(tag)) return;

    setAvailableTags((prev) => [...prev, tag]);
  };

  // Delete a tag from the available tags list
  // Returns a Promise that resolves to true if deletion was successful
  const deleteTag = async (tag: string): Promise<boolean> => {
    // Don't allow deletion of default tags
    if (isDefaultTag(tag)) {
      console.warn(`Cannot delete default tag: ${tag}`);
      return false;
    }

    try {
      if (!user) return false;

      // If the tag is in use by contacts, update those contacts
      const { data, error } = await supabase
        .from("contacts")
        .select("id, tags")
        .eq("user_id", user.id)
        .contains("tags", [tag]);

      if (error) {
        console.error("Error checking tag usage:", error);
        return false;
      }

      // Update any contacts that use this tag
      for (const contact of data || []) {
        const updatedTags = contact.tags.filter((t: string) => t !== tag);

        const { error: updateError } = await supabase
          .from("contacts")
          .update({ tags: updatedTags })
          .eq("id", contact.id)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating contact tags:", updateError);
          return false;
        }
      }

      // Update local state
      setAvailableTags((prev) => prev.filter((t) => t !== tag));
      return true;
    } catch (error) {
      console.error("Error deleting tag:", error);
      return false;
    }
  };

  return (
    <TagContext.Provider
      value={{ availableTags, addTag, deleteTag, isDefaultTag }}
    >
      {children}
    </TagContext.Provider>
  );
};

// Custom hook to use the tag context
