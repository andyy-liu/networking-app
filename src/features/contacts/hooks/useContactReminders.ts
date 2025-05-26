import { useMemo } from 'react';
import { Contact } from '../types';
import { 
  categorizeContactsByReminder, 
  ReminderCategory,
  getReminderCategoryTitle 
} from '../utils/reminder-utils';

export function useContactReminders(contacts: Contact[]) {
  // Categories in the order we want to display them
  const categoryOrder = [
    ReminderCategory.OVER_MONTH,
    ReminderCategory.OVER_THREE_WEEKS,
    ReminderCategory.OVER_TWO_WEEKS,
    ReminderCategory.OVER_ONE_WEEK,
    ReminderCategory.LESS_THAN_WEEK
  ];
  
  // Get categorized contacts with no overlap between categories
  const categorizedContacts = useMemo(() => {
    // Initial categorization
    const initialCategories = categorizeContactsByReminder(contacts);
    
    // Create a map to track which contacts have been processed
    const processedContactIds = new Set<string>();
    
    // Final object with no overlap between categories
    const finalCategories: Record<ReminderCategory, Contact[]> = {
      [ReminderCategory.OVER_MONTH]: [],
      [ReminderCategory.OVER_THREE_WEEKS]: [],
      [ReminderCategory.OVER_TWO_WEEKS]: [],
      [ReminderCategory.OVER_ONE_WEEK]: [],
      [ReminderCategory.LESS_THAN_WEEK]: [],
    };
    
    // Process categories in order of priority (higher priority categories get the contacts first)
    categoryOrder.forEach(category => {
      initialCategories[category].forEach(contact => {
        // Only add the contact if it hasn't been processed yet
        if (!processedContactIds.has(contact.id)) {
          finalCategories[category].push(contact);
          processedContactIds.add(contact.id);
        }
      });
    });
    
    return finalCategories;
  }, [contacts]);
  
  // Calculate total counts for each category
  const categoryCounts = useMemo(() => {
    return Object.entries(categorizedContacts).reduce((acc, [category, contacts]) => {
      acc[category as ReminderCategory] = contacts.length;
      return acc;
    }, {} as Record<ReminderCategory, number>);
  }, [categorizedContacts]);
  
  return {
    categoryOrder,
    categorizedContacts,
    categoryCounts,
    getReminderCategoryTitle
  };
}
