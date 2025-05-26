import { Contact } from "../types";

/**
 * Different reminder categories for contacts
 */
export enum ReminderCategory {
  OVER_MONTH = "over-month",
  OVER_THREE_WEEKS = "over-three-weeks",
  OVER_TWO_WEEKS = "over-two-weeks", 
  OVER_ONE_WEEK = "over-one-week",
  LESS_THAN_WEEK = "less-than-week"
}

/**
 * Calculate days since last contact
 */
export const getDaysSinceLastContact = (dateOfContact: string): number => {
  const contactDate = new Date(dateOfContact);
  const today = new Date();
  
  // Reset time components to ensure accurate day calculation
  contactDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const diffTime = today.getTime() - contactDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Get appropriate reminder category based on days since last contact
 */
export const getReminderCategory = (daysSinceContact: number): ReminderCategory => {
  if (daysSinceContact >= 30) {
    return ReminderCategory.OVER_MONTH;
  } else if (daysSinceContact >= 21) {
    return ReminderCategory.OVER_THREE_WEEKS;
  } else if (daysSinceContact >= 14) {
    return ReminderCategory.OVER_TWO_WEEKS;
  } else if (daysSinceContact >= 7) {
    return ReminderCategory.OVER_ONE_WEEK;
  } else {
    return ReminderCategory.LESS_THAN_WEEK;
  }
};

/**
 * Categorize contacts into reminder categories
 */
export const categorizeContactsByReminder = (contacts: Contact[]): Record<ReminderCategory, Contact[]> => {
  // Initialize categories with empty arrays
  const categorized: Record<ReminderCategory, Contact[]> = {
    [ReminderCategory.OVER_MONTH]: [],
    [ReminderCategory.OVER_THREE_WEEKS]: [],
    [ReminderCategory.OVER_TWO_WEEKS]: [],
    [ReminderCategory.OVER_ONE_WEEK]: [],
    [ReminderCategory.LESS_THAN_WEEK]: [],
  };
  
  // Categorize each contact
  contacts.forEach(contact => {
    if (contact.dateOfContact) {
      const daysSinceContact = getDaysSinceLastContact(contact.dateOfContact);
      const category = getReminderCategory(daysSinceContact);
      categorized[category].push(contact);
    }
  });
  
  // Sort contacts within each category by days since last contact (oldest first)
  Object.keys(categorized).forEach(key => {
    const category = key as ReminderCategory;
    categorized[category].sort((a, b) => {
      const daysA = getDaysSinceLastContact(a.dateOfContact);
      const daysB = getDaysSinceLastContact(b.dateOfContact);
      return daysB - daysA; // Descending order (oldest first)
    });
  });
  
  return categorized;
};

/**
 * Get a human-readable description for a reminder category
 */
export const getReminderCategoryTitle = (category: ReminderCategory): string => {
  switch (category) {
    case ReminderCategory.OVER_MONTH:
      return "Haven't reached out in over a month";
    case ReminderCategory.OVER_THREE_WEEKS:
      return "Haven't reached out in over three weeks";
    case ReminderCategory.OVER_TWO_WEEKS:
      return "Haven't reached out in over two weeks";
    case ReminderCategory.OVER_ONE_WEEK:
      return "Haven't reached out in over a week";
    case ReminderCategory.LESS_THAN_WEEK:
      return "Contacted within the last week";
    default:
      return "Unknown category";
  }
};
