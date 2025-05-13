import { useState, useMemo } from 'react';
import { Contact, ContactTag } from '../types';

export function useContactFilters(contacts: Contact[]) {
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | "default">("default");
  const [activeTagFilter, setActiveTagFilter] = useState<ContactTag | null>(null);
  
  const handleSort = (key: string, direction: "asc" | "desc" | "default") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterByTag = (tag: ContactTag | null) => {
    setActiveTagFilter(tag);
  };

  // Apply sorting and filtering
  const filteredAndSortedContacts = useMemo(() => {
    // First apply tag filtering
    const filtered = activeTagFilter
      ? contacts.filter((contact) => contact.tags.includes(activeTagFilter))
      : contacts;

    // Then apply sorting
    if (sortKey && sortDirection !== "default") {
      return [...filtered].sort((a, b) => {
        const aValue = a[sortKey as keyof Contact];
        const bValue = b[sortKey as keyof Contact];

        // Handle different types of values
        if (typeof aValue === "string" && typeof bValue === "string") {
          // For dates, convert to timestamp first
          if (sortKey === "dateOfContact") {
            const aDate = new Date(aValue).getTime();
            const bDate = new Date(bValue).getTime();
            return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
          }

          // For normal strings
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Fallback for non-string values
        return 0;
      });
    }

    return filtered;
  }, [contacts, sortKey, sortDirection, activeTagFilter]);

  return {
    sortKey,
    sortDirection,
    activeTagFilter,
    filteredAndSortedContacts,
    handleSort,
    handleFilterByTag
  };
}
