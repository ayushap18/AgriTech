/**
 * AgriTech Storage Utilities
 * Local storage, session storage, and IndexedDB helpers
 * ECWoC 2026 Contribution
 */

const StorageUtils = {
  /**
   * Check if storage is available
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   * @returns {boolean} Whether storage is available
   */
  isAvailable(type) {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Local Storage operations
   */
  local: {
    /**
     * Get item from local storage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Stored value or default
     */
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        
        // Try to parse JSON
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      } catch (e) {
        console.warn(`Error reading from localStorage: ${e.message}`);
        return defaultValue;
      }
    },

    /**
     * Set item in local storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {number} expiryDays - Optional expiry in days
     * @returns {boolean} Success status
     */
    set(key, value, expiryDays = null) {
      try {
        const item = {
          value,
          timestamp: Date.now()
        };
        
        if (expiryDays) {
          item.expiry = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
        }
        
        localStorage.setItem(key, JSON.stringify(item));
        return true;
      } catch (e) {
        console.warn(`Error writing to localStorage: ${e.message}`);
        return false;
      }
    },

    /**
     * Remove item from local storage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn(`Error removing from localStorage: ${e.message}`);
        return false;
      }
    },

    /**
     * Clear all items from local storage
     * @param {string} prefix - Optional prefix to clear only matching keys
     * @returns {boolean} Success status
     */
    clear(prefix = null) {
      try {
        if (prefix) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } else {
          localStorage.clear();
        }
        return true;
      } catch (e) {
        console.warn(`Error clearing localStorage: ${e.message}`);
        return false;
      }
    },

    /**
     * Get all keys from local storage
     * @param {string} prefix - Optional prefix to filter keys
     * @returns {string[]} Array of keys
     */
    keys(prefix = null) {
      const keys = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!prefix || key.startsWith(prefix)) {
            keys.push(key);
          }
        }
      } catch (e) {
        console.warn(`Error reading localStorage keys: ${e.message}`);
      }
      return keys;
    },

    /**
     * Get storage size in bytes
     * @returns {number} Size in bytes
     */
    size() {
      let total = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          total += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
        }
      } catch (e) {
        console.warn(`Error calculating localStorage size: ${e.message}`);
      }
      return total;
    },

    /**
     * Clean expired items
     * @returns {number} Number of items cleaned
     */
    cleanExpired() {
      let cleaned = 0;
      try {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item.expiry && Date.now() > item.expiry) {
              keysToRemove.push(key);
            }
          } catch {
            // Not a JSON item with expiry, skip
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          cleaned++;
        });
      } catch (e) {
        console.warn(`Error cleaning expired items: ${e.message}`);
      }
      return cleaned;
    }
  },

  /**
   * Session Storage operations
   */
  session: {
    /**
     * Get item from session storage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Stored value or default
     */
    get(key, defaultValue = null) {
      try {
        const item = sessionStorage.getItem(key);
        if (item === null) return defaultValue;
        
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      } catch (e) {
        console.warn(`Error reading from sessionStorage: ${e.message}`);
        return defaultValue;
      }
    },

    /**
     * Set item in session storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn(`Error writing to sessionStorage: ${e.message}`);
        return false;
      }
    },

    /**
     * Remove item from session storage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn(`Error removing from sessionStorage: ${e.message}`);
        return false;
      }
    },

    /**
     * Clear session storage
     * @returns {boolean} Success status
     */
    clear() {
      try {
        sessionStorage.clear();
        return true;
      } catch (e) {
        console.warn(`Error clearing sessionStorage: ${e.message}`);
        return false;
      }
    }
  },

  /**
   * Cookie operations
   */
  cookie: {
    /**
     * Get cookie value
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null
     */
    get(name) {
      const matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
      ));
      return matches ? decodeURIComponent(matches[1]) : null;
    },

    /**
     * Set cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {Object} options - Cookie options
     */
    set(name, value, options = {}) {
      const defaults = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'Lax'
      };
      
      options = { ...defaults, ...options };
      
      if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
      } else if (typeof options.expires === 'number') {
        // Convert days to date
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        options.expires = date.toUTCString();
      }
      
      let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      
      for (const [key, val] of Object.entries(options)) {
        cookie += `; ${key}`;
        if (val !== true) {
          cookie += `=${val}`;
        }
      }
      
      document.cookie = cookie;
    },

    /**
     * Remove cookie
     * @param {string} name - Cookie name
     * @param {Object} options - Cookie options (path, domain)
     */
    remove(name, options = {}) {
      this.set(name, '', { ...options, expires: -1 });
    },

    /**
     * Get all cookies as object
     * @returns {Object} Cookies object
     */
    getAll() {
      const cookies = {};
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value || '');
        }
      });
      return cookies;
    }
  },

  /**
   * IndexedDB operations for larger data storage
   */
  indexedDB: {
    db: null,
    dbName: 'AgriTechDB',
    dbVersion: 1,
    storeName: 'data',

    /**
     * Initialize IndexedDB
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
      if (this.db) return this.db;
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      });
    },

    /**
     * Get item from IndexedDB
     * @param {string} key - Item key
     * @returns {Promise<any>}
     */
    async get(key) {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };
        
        request.onerror = () => reject(request.error);
      });
    },

    /**
     * Set item in IndexedDB
     * @param {string} key - Item key
     * @param {any} value - Item value
     * @returns {Promise<void>}
     */
    async set(key, value) {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ key, value, timestamp: Date.now() });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    /**
     * Remove item from IndexedDB
     * @param {string} key - Item key
     * @returns {Promise<void>}
     */
    async remove(key) {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    /**
     * Clear all items from IndexedDB
     * @returns {Promise<void>}
     */
    async clear() {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    /**
     * Get all keys from IndexedDB
     * @returns {Promise<string[]>}
     */
    async keys() {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  },

  /**
   * AgriTech-specific storage helpers
   */
  agri: {
    /**
     * Save user preferences
     * @param {Object} prefs - User preferences
     */
    savePreferences(prefs) {
      StorageUtils.local.set('agritech_preferences', prefs);
    },

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getPreferences() {
      return StorageUtils.local.get('agritech_preferences', {
        language: 'en',
        units: 'metric',
        theme: 'light',
        notifications: true
      });
    },

    /**
     * Save recent searches
     * @param {string} search - Search term
     * @param {number} maxItems - Maximum items to keep
     */
    addRecentSearch(search, maxItems = 10) {
      const searches = this.getRecentSearches();
      const filtered = searches.filter(s => s !== search);
      filtered.unshift(search);
      StorageUtils.local.set('agritech_recent_searches', filtered.slice(0, maxItems));
    },

    /**
     * Get recent searches
     * @returns {string[]} Recent searches
     */
    getRecentSearches() {
      return StorageUtils.local.get('agritech_recent_searches', []);
    },

    /**
     * Save farm data
     * @param {Object} farmData - Farm information
     */
    saveFarmData(farmData) {
      StorageUtils.local.set('agritech_farm_data', farmData, 30); // 30 days expiry
    },

    /**
     * Get farm data
     * @returns {Object|null} Farm data
     */
    getFarmData() {
      return StorageUtils.local.get('agritech_farm_data', null);
    },

    /**
     * Save crop history
     * @param {Object} cropEntry - Crop history entry
     */
    addCropHistory(cropEntry) {
      const history = this.getCropHistory();
      history.push({
        ...cropEntry,
        timestamp: Date.now()
      });
      StorageUtils.local.set('agritech_crop_history', history);
    },

    /**
     * Get crop history
     * @returns {Object[]} Crop history
     */
    getCropHistory() {
      return StorageUtils.local.get('agritech_crop_history', []);
    },

    /**
     * Cache weather data
     * @param {string} location - Location identifier
     * @param {Object} weatherData - Weather data
     */
    cacheWeather(location, weatherData) {
      const key = `agritech_weather_${location}`;
      StorageUtils.session.set(key, {
        data: weatherData,
        timestamp: Date.now()
      });
    },

    /**
     * Get cached weather data (valid for 30 minutes)
     * @param {string} location - Location identifier
     * @returns {Object|null} Cached weather data or null
     */
    getCachedWeather(location) {
      const key = `agritech_weather_${location}`;
      const cached = StorageUtils.session.get(key);
      
      if (!cached) return null;
      
      // Check if cache is still valid (30 minutes)
      if (Date.now() - cached.timestamp > 30 * 60 * 1000) {
        StorageUtils.session.remove(key);
        return null;
      }
      
      return cached.data;
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtils;
}

if (typeof window !== 'undefined') {
  window.StorageUtils = StorageUtils;
}
