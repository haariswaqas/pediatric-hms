/**
 * Format date string to a more user-friendly format
 * @param {string} dateString - Date string in format 'YYYY-MM-DD'
 * @returns {string} Formatted date string (e.g., "May 1, 2025")
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', error);
      return dateString;
    }
  };
  
  /**
   * Format time string to a more user-friendly format
   * @param {string} timeString - Time string in format 'HH:MM:SS' or 'HH:MM'
   * @returns {string} Formatted time string (e.g., "2:30 PM")
   */
  export const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Add seconds if they don't exist in the time string
      const timeWithSeconds = timeString.split(':').length === 2 ? `${timeString}:00` : timeString;
      
      // Create a date object with the current date but with the time set to the provided time
      const date = new Date(`2000-01-01T${timeWithSeconds}`);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Invalid time format:', error);
      return timeString;
    }
  };

// Format date in a nice readable format
export const formatNewDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original if formatting fails
  }
};

  // Format date in a nice readable format


  // Format datetime for created_at and updated_at
  export const formatDateTime = (dateTimeString) => {
    try {
      const dateTime = new Date(dateTimeString);
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(dateTime);
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return dateTimeString; // Return original if formatting fails
    }
  };

  
  /**
   * Get the current date in YYYY-MM-DD format
   * @returns {string} Current date in YYYY-MM-DD format
   */
  export const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Get date range for filtering
   * @param {string} period - 'today', 'week', 'month', 'year'
   * @returns {Object} Object with startDate and endDate
   */
  export const getDateRange = (period) => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();
    
    switch(period) {
      case 'today':
        // Start and end are both today
        break;
      case 'week':
        // Start is 7 days ago
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Start is 30 days ago
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        // Start is 365 days ago
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        // Default to all time (past 5 years)
        startDate.setFullYear(now.getFullYear() - 5);
        break;
    }
    
    const formatDateToString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDateToString(startDate),
      endDate: formatDateToString(endDate)
    };
  };