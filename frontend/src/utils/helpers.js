/**
 * Utility helper functions for USDTide application
 */

/**
 * Format currency with appropriate decimals
 * @param {number|string} amount - The amount to format
 * @param {number} decimals - Number of decimal places
 * @param {string} symbol - Currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2, symbol = '$') => {
  const num = parseFloat(amount) || 0
  return `${symbol}${num.toFixed(decimals)}`
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number|string} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  const n = parseFloat(num) || 0
  
  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(1) + 'B'
  }
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M'
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K'
  }
  
  return n.toString()
}

/**
 * Format blockchain balance with proper decimals
 * @param {string|number} balance - Raw balance
 * @param {number} decimals - Token decimals (default 18)
 * @param {number} displayDecimals - Display decimal places
 * @returns {string} Formatted balance
 */
export const formatBalance = (balance, decimals = 18, displayDecimals = 4) => {
  if (!balance || balance === '0') return '0'
  
  const divisor = Math.pow(10, decimals)
  const formatted = (parseFloat(balance) / divisor).toFixed(displayDecimals)
  
  // Remove trailing zeros
  return parseFloat(formatted).toString()
}

/**
 * Format date relative to now (e.g., "2 days ago", "3 hours ago")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative date string
 */
export const formatDateRelative = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInMs = now - targetDate
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  } else {
    return targetDate.toLocaleDateString()
  }
}

/**
 * Format date to display string
 * @param {Date|string} date - The date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-US') => {
  const targetDate = new Date(date)
  return targetDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time to display string
 * @param {Date|string} date - The date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted time string
 */
export const formatTime = (date, locale = 'en-US') => {
  const targetDate = new Date(date)
  return targetDate.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Generate a unique code for invitations
 * @param {number} length - Length of the code
 * @returns {string} Unique code
 */
export const generateUniqueCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  return result
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Truncate address for display
 * @param {string} address - Address to truncate
 * @param {number} prefixLength - Length of prefix
 * @param {number} suffixLength - Length of suffix
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!address) return ''
  if (address.length <= prefixLength + suffixLength) return address
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid address
 */
export const isValidAddress = (address) => {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key])
    })
    return clonedObj
  }
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total, decimals = 2) => {
  if (!total || total === 0) return 0
  return parseFloat(((value / total) * 100).toFixed(decimals))
}

/**
 * Generate avatar URL from name
 * @param {string} name - Name for avatar
 * @returns {string} Avatar URL
 */
export const generateAvatar = (name = 'User') => {
  const encodedName = encodeURIComponent(name)
  return `https://ui-avatars.com/api/?name=${encodedName}&size=128&background=667eea&color=ffffff&rounded=true`
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Convert wei to ether
 * @param {string|number} wei - Wei amount
 * @returns {string} Ether amount
 */
export const weiToEther = (wei) => {
  return formatBalance(wei, 18, 6)
}

/**
 * Convert ether to wei
 * @param {string|number} ether - Ether amount
 * @returns {string} Wei amount
 */
export const etherToWei = (ether) => {
  const etherNum = parseFloat(ether) || 0
  return (etherNum * Math.pow(10, 18)).toString()
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if running on mobile device
 * @returns {boolean} Is mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Check if running in LINE app
 * @returns {boolean} Is LINE app
 */
export const isLineApp = () => {
  return /Line/i.test(navigator.userAgent)
}

/**
 * Format APY percentage
 * @param {number} apy - APY value (e.g., 0.05 for 5%)
 * @returns {string} Formatted APY string
 */
export const formatAPY = (apy) => {
  const percentage = apy * 100
  return `${percentage.toFixed(2)}%`
}

/**
 * Calculate compound interest
 * @param {number} principal - Initial amount
 * @param {number} rate - Interest rate (annual, as decimal)
 * @param {number} time - Time in years
 * @param {number} compounds - Compounding frequency per year
 * @returns {number} Final amount
 */
export const calculateCompoundInterest = (principal, rate, time, compounds = 365) => {
  return principal * Math.pow((1 + rate / compounds), compounds * time)
}

/**
 * Calculate simple interest
 * @param {number} principal - Initial amount
 * @param {number} rate - Interest rate (annual, as decimal)
 * @param {number} time - Time in years
 * @returns {number} Interest amount
 */
export const calculateSimpleInterest = (principal, rate, time) => {
  return principal * rate * time
}

export default {
  formatCurrency,
  formatNumber,
  formatBalance,
  formatDateRelative,
  formatDate,
  formatTime,
  generateUniqueCode,
  generateRandomString,
  truncateText,
  truncateAddress,
  isValidEmail,
  isValidAddress,
  debounce,
  throttle,
  deepClone,
  calculatePercentage,
  generateAvatar,
  copyToClipboard,
  weiToEther,
  etherToWei,
  sleep,
  isMobile,
  isLineApp,
  formatAPY,
  calculateCompoundInterest,
  calculateSimpleInterest
}