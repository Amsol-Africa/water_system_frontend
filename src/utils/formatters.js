// Display-oriented formatters (no external libs)

/** Format a number as currency. */
export const formatCurrency = (value, { currency = 'USD', locale = 'en-US' } = {}) => {
  if (value == null || isNaN(value)) return '';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
};

/** Format a number with thousand separators. */
export const formatNumber = (value, { locale = 'en-US', maximumFractionDigits = 2 } = {}) => {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(Number(value));
};

/** Compact number (e.g., 1.2K, 3.4M). */
export const formatCompactNumber = (value, { locale = 'en-US' } = {}) => {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(Number(value));
};

/** Format a Date/string into a readable date. */
export const formatDate = (date, { locale = 'en-GB', options } = {}) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(locale, options ?? { year: 'numeric', month: 'short', day: '2-digit' });
};

/** Format a Date/string into a date+time. */
export const formatDateTime = (date, { locale = 'en-GB', options } = {}) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleString(locale, options ?? {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatMeterStatus = (status) => {
  switch (status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'maintenance': return 'Under Maintenance';
    case 'decommissioned': return 'Decommissioned';
    default: return 'Unknown';
  }
};

export const formatTokenStatus = (status) => {
  switch (status) {
    case 'created': return 'Created';
    case 'delivered': return 'Delivered';
    case 'redeemed': return 'Redeemed';
    case 'expired': return 'Expired';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
};

export const formatPaymentStatus = (status) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'verified': return 'Verified';
    case 'failed': return 'Failed';
    case 'refunded': return 'Refunded';
    default: return 'Unknown';
  }
};


export const getStatusColor = (status, type) => {
  const statusColors = {
    meter: {
      active: 'bg-green-100 text-green-800 border-green-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      maintenance: 'bg-blue-100 text-blue-800 border-blue-300',
      decommissioned: 'bg-red-100 text-red-800 border-red-300',
    },
    token: {
      created: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      redeemed: 'bg-blue-100 text-blue-800 border-blue-300',
      expired: 'bg-gray-100 text-gray-800 border-gray-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    },
    payment: {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      verified: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300',
    },
    alert: {
      open: 'bg-red-100 text-red-800 border-red-300',
      acknowledged: 'bg-amber-100 text-amber-800 border-amber-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
    },
  }
  return statusColors[type]?.[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}



/** Mask a string, keeping first/last `keep` chars visible. */
export const mask = (value = '', keep = 2, maskChar = '•') => {
  if (!value) return '';
  if (value.length <= keep * 2) return value;
  return value.slice(0, keep) + maskChar.repeat(value.length - keep * 2) + value.slice(-keep);
};

/** Format a phone number lightly (non-strict). */
export const formatPhone = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
  return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,10)}`;
};
