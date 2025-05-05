
import { ContactTag } from "@/lib/types";

/**
 * Returns the appropriate CSS classes for contact status badges
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Reached Out':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'Responded':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'Chatted':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

/**
 * Returns the appropriate CSS classes for contact tag badges
 */
export const getTagColor = (tag: string) => {
  switch (tag) {
    case 'Club':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Recruiter':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Alumni':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Professor':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'Other':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Format date to a localized format
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};
