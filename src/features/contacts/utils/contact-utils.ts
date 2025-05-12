
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
 * Using a hash function to generate consistent colors for the same tag
 */
export const getTagColor = (tag: string) => {
  // Use a simple hash function to generate a consistent number from the tag
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Use the hash to select from predefined color combinations
  const colorIndex = Math.abs(hash) % 10;
  
  switch (colorIndex) {
    case 0:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 1:
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 2:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 3:
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 4:
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 5:
      return 'bg-green-100 text-green-800 border-green-200';
    case 6:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 7:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 8:
      return 'bg-red-100 text-red-800 border-red-200';
    case 9:
      return 'bg-pink-100 text-pink-800 border-pink-200';
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
