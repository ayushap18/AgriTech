/**
 * AgriTech API Helper Utilities
 * Helper functions for API calls, error handling, and response processing
 * ECWoC 2026 Contribution
 */

const ApiHelper = {
  /**
   * Default configuration
   */
  config: {
    baseUrl: '',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json'
    }
  },

  /**
   * Configure API helper
   * @param {Object} options - Configuration options
   */
  configure(options = {}) {
    this.config = { ...this.config, ...options };
  },

  /**
   * Make HTTP request with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    const config = {
      ...options,
      headers: { ...this.config.headers, ...options.headers }
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(fullUrl, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new ApiError(
            `HTTP error: ${response.status}`,
            response.status,
            await this.parseErrorResponse(response)
          );
        }
        
        return await this.parseResponse(response);
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error; // Don't retry client errors
        }
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }
    
    throw lastError || new ApiError('Request failed after retries');
  },

  /**
   * Parse response based on content type
   * @param {Response} response - Fetch response
   * @returns {Promise<any>} Parsed response
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    }
    
    if (contentType.includes('text/')) {
      return response.text();
    }
    
    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      return response.blob();
    }
    
    return response.json().catch(() => response.text());
  },

  /**
   * Parse error response
   * @param {Response} response - Fetch response
   * @returns {Promise<any>} Parsed error data
   */
  async parseErrorResponse(response) {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  },

  /**
   * Delay helper
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async get(url, params = {}, options = {}) {
    const queryString = this.buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { method: 'GET', ...options });
  },

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async post(url, data = {}, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  },

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async put(url, data = {}, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  },

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async delete(url, options = {}) {
    return this.request(url, { method: 'DELETE', ...options });
  },

  /**
   * Upload file with FormData
   * @param {string} url - Request URL
   * @param {File} file - File to upload
   * @param {Object} additionalData - Additional form data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Response data
   */
  async uploadFile(url, file, additionalData = {}, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    for (const [key, value] of Object.entries(additionalData)) {
      formData.append(key, value);
    }
    
    // Use XMLHttpRequest for progress tracking
    if (onProgress && typeof XMLHttpRequest !== 'undefined') {
      return this.uploadWithProgress(url, formData, onProgress);
    }
    
    // Use fetch without progress
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new ApiError(`Upload failed: ${response.status}`, response.status);
    }
    
    return this.parseResponse(response);
  },

  /**
   * Upload with progress tracking using XMLHttpRequest
   * @param {string} url - Request URL
   * @param {FormData} formData - Form data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Response data
   */
  uploadWithProgress(url, formData, onProgress) {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          reject(new ApiError(`Upload failed: ${xhr.status}`, xhr.status));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new ApiError('Network error during upload'));
      });
      
      xhr.addEventListener('timeout', () => {
        reject(new ApiError('Upload timeout', 408));
      });
      
      xhr.open('POST', fullUrl);
      xhr.timeout = this.config.timeout;
      xhr.send(formData);
    });
  },

  /**
   * Build query string from parameters
   * @param {Object} params - Query parameters
   * @returns {string} Query string
   */
  buildQueryString(params) {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    }
    
    return searchParams.toString();
  },

  /**
   * Cache management for API responses
   */
  cache: {
    store: new Map(),
    defaultTTL: 5 * 60 * 1000, // 5 minutes

    /**
     * Get cached response
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null
     */
    get(key) {
      const cached = this.store.get(key);
      if (!cached) return null;
      
      if (Date.now() > cached.expiry) {
        this.store.delete(key);
        return null;
      }
      
      return cached.data;
    },

    /**
     * Set cached response
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in ms
     */
    set(key, data, ttl = this.defaultTTL) {
      this.store.set(key, {
        data,
        expiry: Date.now() + ttl
      });
    },

    /**
     * Clear cache
     * @param {string} prefix - Optional key prefix to clear
     */
    clear(prefix = null) {
      if (prefix) {
        for (const key of this.store.keys()) {
          if (key.startsWith(prefix)) {
            this.store.delete(key);
          }
        }
      } else {
        this.store.clear();
      }
    }
  },

  /**
   * Cached GET request
   * @param {string} url - Request URL
   * @param {Object} params - Query parameters
   * @param {number} ttl - Cache TTL in ms
   * @returns {Promise<Object>} Response data
   */
  async cachedGet(url, params = {}, ttl = this.cache.defaultTTL) {
    const cacheKey = `${url}?${this.buildQueryString(params)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.get(url, params);
    this.cache.set(cacheKey, data, ttl);
    
    return data;
  },

  /**
   * Agriculture-specific API helpers
   */
  agriculture: {
    /**
     * Fetch weather data for location
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} apiKey - Weather API key
     * @returns {Promise<Object>} Weather data
     */
    async getWeather(lat, lon, apiKey) {
      const url = `https://api.openweathermap.org/data/2.5/weather`;
      return ApiHelper.get(url, { lat, lon, appid: apiKey, units: 'metric' });
    },

    /**
     * Fetch weather forecast
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} apiKey - Weather API key
     * @returns {Promise<Object>} Forecast data
     */
    async getWeatherForecast(lat, lon, apiKey) {
      const url = `https://api.openweathermap.org/data/2.5/forecast`;
      return ApiHelper.get(url, { lat, lon, appid: apiKey, units: 'metric' });
    },

    /**
     * Get crop recommendation from ML model
     * @param {Object} soilData - Soil parameters (N, P, K, pH, etc.)
     * @returns {Promise<Object>} Crop recommendation
     */
    async getCropRecommendation(soilData) {
      return ApiHelper.post('/predict/crop', soilData);
    },

    /**
     * Upload image for disease detection
     * @param {File} image - Image file
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<Object>} Disease detection result
     */
    async detectDisease(image, onProgress = null) {
      return ApiHelper.uploadFile('/predict/disease', image, {}, onProgress);
    },

    /**
     * Get market prices for crops
     * @param {string} crop - Crop name
     * @param {string} state - State name
     * @returns {Promise<Object>} Market price data
     */
    async getMarketPrices(crop, state) {
      return ApiHelper.cachedGet('/api/prices', { crop, state }, 30 * 60 * 1000); // 30 min cache
    },

    /**
     * Get soil health card data
     * @param {string} farmerId - Farmer ID
     * @returns {Promise<Object>} Soil health data
     */
    async getSoilHealthCard(farmerId) {
      return ApiHelper.get('/api/soil-health', { farmerId });
    }
  }
};

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiHelper, ApiError };
}

if (typeof window !== 'undefined') {
  window.ApiHelper = ApiHelper;
  window.ApiError = ApiError;
}
