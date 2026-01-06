/**
 * AgriTech Data Utilities
 * Helper functions for data manipulation, formatting, and conversion
 * ECWoC 2026 Contribution
 */

const DataUtils = {
  /**
   * Unit conversion utilities for agricultural measurements
   */
  convert: {
    /**
     * Convert acres to hectares
     * @param {number} acres - Area in acres
     * @returns {number} Area in hectares
     */
    acresToHectares(acres) {
      return acres * 0.404686;
    },

    /**
     * Convert hectares to acres
     * @param {number} hectares - Area in hectares
     * @returns {number} Area in acres
     */
    hectaresToAcres(hectares) {
      return hectares * 2.47105;
    },

    /**
     * Convert kilograms to quintals
     * @param {number} kg - Weight in kilograms
     * @returns {number} Weight in quintals
     */
    kgToQuintal(kg) {
      return kg / 100;
    },

    /**
     * Convert quintals to kilograms
     * @param {number} quintal - Weight in quintals
     * @returns {number} Weight in kilograms
     */
    quintalToKg(quintal) {
      return quintal * 100;
    },

    /**
     * Convert Celsius to Fahrenheit
     * @param {number} celsius - Temperature in Celsius
     * @returns {number} Temperature in Fahrenheit
     */
    celsiusToFahrenheit(celsius) {
      return (celsius * 9/5) + 32;
    },

    /**
     * Convert Fahrenheit to Celsius
     * @param {number} fahrenheit - Temperature in Fahrenheit
     * @returns {number} Temperature in Celsius
     */
    fahrenheitToCelsius(fahrenheit) {
      return (fahrenheit - 32) * 5/9;
    },

    /**
     * Convert meters per second to km/h (for wind speed)
     * @param {number} mps - Speed in m/s
     * @returns {number} Speed in km/h
     */
    mpsToKmh(mps) {
      return mps * 3.6;
    },

    /**
     * Convert km/h to meters per second
     * @param {number} kmh - Speed in km/h
     * @returns {number} Speed in m/s
     */
    kmhToMps(kmh) {
      return kmh / 3.6;
    },

    /**
     * Convert millimeters to inches (for rainfall)
     * @param {number} mm - Length in millimeters
     * @returns {number} Length in inches
     */
    mmToInches(mm) {
      return mm / 25.4;
    },

    /**
     * Convert inches to millimeters
     * @param {number} inches - Length in inches
     * @returns {number} Length in millimeters
     */
    inchesToMm(inches) {
      return inches * 25.4;
    }
  },

  /**
   * Formatting utilities
   */
  format: {
    /**
     * Format number with thousand separators (Indian numbering system)
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    indianNumber(num) {
      if (typeof num !== 'number' || isNaN(num)) return '0';
      
      const parts = num.toString().split('.');
      let intPart = parts[0];
      const decPart = parts[1] ? '.' + parts[1] : '';
      
      // Indian numbering: last 3 digits, then groups of 2
      const lastThree = intPart.slice(-3);
      const rest = intPart.slice(0, -3);
      
      if (rest !== '') {
        intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
      }
      
      return intPart + decPart;
    },

    /**
     * Format number with standard thousand separators
     * @param {number} num - Number to format
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted number string
     */
    number(num, decimals = 2) {
      if (typeof num !== 'number' || isNaN(num)) return '0';
      return num.toLocaleString('en-IN', { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      });
    },

    /**
     * Format currency in Indian Rupees
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    currency(amount) {
      if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
      return '₹' + this.indianNumber(Math.round(amount));
    },

    /**
     * Format area with unit
     * @param {number} area - Area value
     * @param {string} unit - Unit (hectares/acres)
     * @returns {string} Formatted area string
     */
    area(area, unit = 'hectares') {
      const unitLabels = {
        hectares: 'ha',
        acres: 'ac',
        sqm: 'm²',
        sqft: 'ft²'
      };
      return `${this.number(area, 2)} ${unitLabels[unit] || unit}`;
    },

    /**
     * Format weight with unit
     * @param {number} weight - Weight value
     * @param {string} unit - Unit (kg/quintal/ton)
     * @returns {string} Formatted weight string
     */
    weight(weight, unit = 'kg') {
      const unitLabels = {
        kg: 'kg',
        quintal: 'q',
        ton: 't',
        gram: 'g'
      };
      return `${this.number(weight, 2)} ${unitLabels[unit] || unit}`;
    },

    /**
     * Format temperature with unit
     * @param {number} temp - Temperature value
     * @param {string} unit - Unit (C/F)
     * @returns {string} Formatted temperature string
     */
    temperature(temp, unit = 'C') {
      return `${Math.round(temp)}°${unit}`;
    },

    /**
     * Format percentage
     * @param {number} value - Value to format
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage string
     */
    percentage(value, decimals = 1) {
      if (typeof value !== 'number' || isNaN(value)) return '0%';
      return `${value.toFixed(decimals)}%`;
    },

    /**
     * Format date in Indian format (DD/MM/YYYY)
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    date(date) {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      
      return `${day}/${month}/${year}`;
    },

    /**
     * Format date with time
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted datetime string
     */
    datetime(date) {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      const time = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return `${this.date(d)} ${time}`;
    },

    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {Date|string} date - Date to format
     * @returns {string} Relative time string
     */
    relativeTime(date) {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      const now = new Date();
      const diff = now - d;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      
      if (seconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  },

  /**
   * Data processing utilities
   */
  process: {
    /**
     * Calculate average of array
     * @param {number[]} arr - Array of numbers
     * @returns {number} Average value
     */
    average(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    },

    /**
     * Calculate sum of array
     * @param {number[]} arr - Array of numbers
     * @returns {number} Sum value
     */
    sum(arr) {
      if (!Array.isArray(arr)) return 0;
      return arr.reduce((sum, val) => sum + (val || 0), 0);
    },

    /**
     * Find min value in array
     * @param {number[]} arr - Array of numbers
     * @returns {number} Minimum value
     */
    min(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      return Math.min(...arr);
    },

    /**
     * Find max value in array
     * @param {number[]} arr - Array of numbers
     * @returns {number} Maximum value
     */
    max(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      return Math.max(...arr);
    },

    /**
     * Group array of objects by key
     * @param {Object[]} arr - Array of objects
     * @param {string} key - Key to group by
     * @returns {Object} Grouped object
     */
    groupBy(arr, key) {
      if (!Array.isArray(arr)) return {};
      return arr.reduce((groups, item) => {
        const value = item[key];
        groups[value] = groups[value] || [];
        groups[value].push(item);
        return groups;
      }, {});
    },

    /**
     * Sort array of objects by key
     * @param {Object[]} arr - Array of objects
     * @param {string} key - Key to sort by
     * @param {string} order - 'asc' or 'desc'
     * @returns {Object[]} Sorted array
     */
    sortBy(arr, key, order = 'asc') {
      if (!Array.isArray(arr)) return [];
      const sorted = [...arr].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      });
      return order === 'desc' ? sorted.reverse() : sorted;
    },

    /**
     * Filter unique values from array
     * @param {any[]} arr - Array of values
     * @param {string} key - Optional key for objects
     * @returns {any[]} Array with unique values
     */
    unique(arr, key = null) {
      if (!Array.isArray(arr)) return [];
      if (key) {
        const seen = new Set();
        return arr.filter(item => {
          const val = item[key];
          if (seen.has(val)) return false;
          seen.add(val);
          return true;
        });
      }
      return [...new Set(arr)];
    },

    /**
     * Chunk array into smaller arrays
     * @param {any[]} arr - Array to chunk
     * @param {number} size - Chunk size
     * @returns {any[][]} Array of chunks
     */
    chunk(arr, size) {
      if (!Array.isArray(arr) || size <= 0) return [];
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj);
      if (obj instanceof Array) return obj.map(item => this.deepClone(item));
      if (typeof obj === 'object') {
        const clone = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            clone[key] = this.deepClone(obj[key]);
          }
        }
        return clone;
      }
      return obj;
    }
  },

  /**
   * Agriculture-specific data utilities
   */
  agriculture: {
    /**
     * Calculate yield per hectare
     * @param {number} totalYield - Total yield in kg
     * @param {number} area - Area in hectares
     * @returns {number} Yield per hectare
     */
    yieldPerHectare(totalYield, area) {
      if (!area || area <= 0) return 0;
      return totalYield / area;
    },

    /**
     * Calculate profit margin
     * @param {number} revenue - Total revenue
     * @param {number} cost - Total cost
     * @returns {number} Profit margin percentage
     */
    profitMargin(revenue, cost) {
      if (!revenue || revenue <= 0) return 0;
      return ((revenue - cost) / revenue) * 100;
    },

    /**
     * Calculate water requirement based on crop and area
     * @param {string} crop - Crop name
     * @param {number} area - Area in hectares
     * @returns {number} Water requirement in liters
     */
    waterRequirement(crop, area) {
      const waterPerHectare = {
        rice: 12000000,      // 12 million liters/ha
        wheat: 4500000,
        sugarcane: 20000000,
        cotton: 7500000,
        maize: 5000000,
        groundnut: 5000000,
        soybean: 4500000,
        potato: 5000000,
        tomato: 6000000,
        onion: 3500000
      };
      
      const cropLower = crop.toLowerCase();
      const requirement = waterPerHectare[cropLower] || 5000000;
      return requirement * area;
    },

    /**
     * Get growing season for crop
     * @param {string} crop - Crop name
     * @returns {Object} Season information
     */
    getGrowingSeason(crop) {
      const seasons = {
        rice: { sowing: 'June-July', harvest: 'October-November', duration: '120-150 days' },
        wheat: { sowing: 'October-November', harvest: 'March-April', duration: '120-140 days' },
        maize: { sowing: 'June-July', harvest: 'September-October', duration: '90-120 days' },
        sugarcane: { sowing: 'February-March', harvest: 'December-March', duration: '12-18 months' },
        cotton: { sowing: 'April-May', harvest: 'October-December', duration: '150-180 days' },
        groundnut: { sowing: 'June-July', harvest: 'October-November', duration: '100-130 days' },
        potato: { sowing: 'October-November', harvest: 'February-March', duration: '90-120 days' },
        tomato: { sowing: 'Year-round', harvest: '60-90 days after sowing', duration: '60-90 days' }
      };
      
      return seasons[crop.toLowerCase()] || { sowing: 'Variable', harvest: 'Variable', duration: 'Variable' };
    },

    /**
     * Calculate fertilizer requirement
     * @param {string} crop - Crop name
     * @param {number} area - Area in hectares
     * @returns {Object} Fertilizer requirement (N, P, K in kg)
     */
    fertilizerRequirement(crop, area) {
      // NPK requirements per hectare (in kg)
      const requirements = {
        rice: { N: 120, P: 60, K: 60 },
        wheat: { N: 120, P: 60, K: 40 },
        maize: { N: 150, P: 75, K: 60 },
        sugarcane: { N: 250, P: 100, K: 125 },
        cotton: { N: 150, P: 75, K: 75 },
        groundnut: { N: 25, P: 50, K: 40 },
        potato: { N: 180, P: 80, K: 100 },
        tomato: { N: 120, P: 60, K: 80 }
      };
      
      const cropReq = requirements[crop.toLowerCase()] || { N: 100, P: 50, K: 50 };
      
      return {
        nitrogen: cropReq.N * area,
        phosphorus: cropReq.P * area,
        potassium: cropReq.K * area,
        unit: 'kg'
      };
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataUtils;
}

if (typeof window !== 'undefined') {
  window.DataUtils = DataUtils;
}
