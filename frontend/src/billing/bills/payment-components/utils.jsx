// Utility functions
export const formatCurrency = (value, currency = "USD") => {
    if (value == null || value === "") return "-";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2,
      }).format(Number(value));
    } catch {
      return `${currency} ${Number(value).toFixed(2)}`;
    }
  };
  
export const maskIntentId = (id) => {
    if (!id) return "";
    const prefix = id.slice(0, 3);
    const suffix = id.slice(-4);
    return `${prefix}****${suffix}`;
  };
  
export const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  