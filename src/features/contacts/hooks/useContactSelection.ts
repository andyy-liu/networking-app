import { useState, useCallback } from 'react';
import { Contact } from '../types';

/**
 * Hook for managing contact selection across components
 * Provides methods to select, deselect, and clear selections
 */
export function useContactSelection() {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Toggle selection for a single contact
  const toggleContactSelection = useCallback((contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        // Remove from selection
        return prev.filter(c => c.id !== contact.id);
      } else {
        // Add to selection
        return [...prev, contact];
      }
    });
  }, []);

  // Select multiple contacts at once
  const selectContacts = useCallback((contacts: Contact[]) => {
    setSelectedContacts(prev => {
      // Create a new set to avoid duplicates
      const selectedIds = new Set(prev.map(c => c.id));
      const newContacts = contacts.filter(c => !selectedIds.has(c.id));
      
      return [...prev, ...newContacts];
    });
  }, []);

  // Deselect multiple contacts at once
  const deselectContacts = useCallback((contacts: Contact[]) => {
    const contactIds = new Set(contacts.map(c => c.id));
    setSelectedContacts(prev => prev.filter(c => !contactIds.has(c.id)));
  }, []);

  // Check if a contact is selected
  const isContactSelected = useCallback((contactId: string) => {
    return selectedContacts.some(c => c.id === contactId);
  }, [selectedContacts]);

  // Clear all selections
  const clearSelectedContacts = useCallback(() => {
    setSelectedContacts([]);
  }, []);

  return {
    selectedContacts,
    toggleContactSelection,
    selectContacts,
    deselectContacts,
    isContactSelected,
    clearSelectedContacts,
    selectionCount: selectedContacts.length
  };
}
