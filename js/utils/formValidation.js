/**
 * AgriTech Form Validation Utilities
 * Comprehensive form validation helpers for the AgriTech platform
 * ECWoC 2026 Contribution
 */

const FormValidation = {
  /**
   * Validation patterns for common input types
   */
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    pincode: /^[1-9][0-9]{5}$/,
    aadhar: /^[2-9]{1}[0-9]{11}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    farmerId: /^[A-Z]{2}[0-9]{8}$/,
    name: /^[a-zA-Z\s]{2,50}$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    numeric: /^[0-9]+$/,
    decimal: /^[0-9]*\.?[0-9]+$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  },

  /**
   * Error messages for validation failures
   */
  messages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    pincode: 'Please enter a valid 6-digit pincode',
    aadhar: 'Please enter a valid 12-digit Aadhar number',
    pan: 'Please enter a valid PAN number',
    farmerId: 'Please enter a valid Farmer ID (e.g., UP12345678)',
    name: 'Please enter a valid name (2-50 characters)',
    minLength: (min) => `Minimum ${min} characters required`,
    maxLength: (max) => `Maximum ${max} characters allowed`,
    min: (min) => `Value must be at least ${min}`,
    max: (max) => `Value must not exceed ${max}`,
    numeric: 'Please enter numbers only',
    decimal: 'Please enter a valid decimal number',
    match: 'Fields do not match',
    url: 'Please enter a valid URL'
  },

  /**
   * Validate a single field
   * @param {string} value - The value to validate
   * @param {Object} rules - Validation rules
   * @returns {Object} - { isValid: boolean, error: string | null }
   */
  validateField(value, rules) {
    const trimmedValue = value?.toString().trim() || '';

    // Required validation
    if (rules.required && !trimmedValue) {
      return { isValid: false, error: this.messages.required };
    }

    // Skip other validations if empty and not required
    if (!trimmedValue && !rules.required) {
      return { isValid: true, error: null };
    }

    // Pattern validation
    if (rules.pattern) {
      const pattern = typeof rules.pattern === 'string' 
        ? this.patterns[rules.pattern] 
        : rules.pattern;
      
      if (pattern && !pattern.test(trimmedValue)) {
        return { 
          isValid: false, 
          error: rules.patternMessage || this.messages[rules.pattern] || 'Invalid format'
        };
      }
    }

    // Min length validation
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return { 
        isValid: false, 
        error: this.messages.minLength(rules.minLength) 
      };
    }

    // Max length validation
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return { 
        isValid: false, 
        error: this.messages.maxLength(rules.maxLength) 
      };
    }

    // Numeric validations
    if (rules.min !== undefined || rules.max !== undefined) {
      const numValue = parseFloat(trimmedValue);
      
      if (isNaN(numValue)) {
        return { isValid: false, error: this.messages.numeric };
      }
      
      if (rules.min !== undefined && numValue < rules.min) {
        return { isValid: false, error: this.messages.min(rules.min) };
      }
      
      if (rules.max !== undefined && numValue > rules.max) {
        return { isValid: false, error: this.messages.max(rules.max) };
      }
    }

    // Match validation (for password confirmation, etc.)
    if (rules.match !== undefined && trimmedValue !== rules.match) {
      return { isValid: false, error: this.messages.match };
    }

    // Custom validator function
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(trimmedValue);
      if (customResult !== true) {
        return { 
          isValid: false, 
          error: typeof customResult === 'string' ? customResult : 'Validation failed'
        };
      }
    }

    return { isValid: true, error: null };
  },

  /**
   * Validate an entire form
   * @param {Object} formData - Form data object { fieldName: value }
   * @param {Object} schema - Validation schema { fieldName: rules }
   * @returns {Object} - { isValid: boolean, errors: { fieldName: error } }
   */
  validateForm(formData, schema) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(schema)) {
      const result = this.validateField(formData[fieldName], rules);
      if (!result.isValid) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    }

    return { isValid, errors };
  },

  /**
   * Real-time validation handler for input elements
   * @param {HTMLInputElement} input - The input element
   * @param {Object} rules - Validation rules
   * @param {Function} onError - Callback for error display
   * @param {Function} onSuccess - Callback for success display
   */
  attachValidator(input, rules, onError, onSuccess) {
    const validate = () => {
      const result = this.validateField(input.value, rules);
      if (result.isValid) {
        onSuccess?.(input);
      } else {
        onError?.(input, result.error);
      }
      return result;
    };

    input.addEventListener('blur', validate);
    input.addEventListener('input', () => {
      // Debounced validation on input
      clearTimeout(input._validationTimeout);
      input._validationTimeout = setTimeout(validate, 300);
    });

    return validate;
  },

  /**
   * Display error message near input
   * @param {HTMLInputElement} input - The input element
   * @param {string} message - Error message
   */
  showError(input, message) {
    this.clearError(input);
    
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    
    const errorEl = document.createElement('span');
    errorEl.className = 'validation-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;
    
    input.parentNode.insertBefore(errorEl, input.nextSibling);
  },

  /**
   * Clear error message from input
   * @param {HTMLInputElement} input - The input element
   */
  clearError(input) {
    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');
    
    const existingError = input.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }
  },

  /**
   * Agriculture-specific validators
   */
  agriculture: {
    /**
     * Validate crop name
     */
    cropName(value) {
      const validCrops = [
        'rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'jute',
        'groundnut', 'soybean', 'sunflower', 'mustard', 'potato',
        'tomato', 'onion', 'cabbage', 'cauliflower', 'brinjal',
        'okra', 'chilli', 'turmeric', 'ginger', 'banana', 'mango',
        'apple', 'grape', 'orange', 'papaya', 'coconut', 'tea', 'coffee'
      ];
      
      const normalized = value.toLowerCase().trim();
      return validCrops.includes(normalized) || 'Please enter a valid crop name';
    },

    /**
     * Validate soil type
     */
    soilType(value) {
      const validSoils = [
        'alluvial', 'black', 'red', 'laterite', 'arid', 
        'forest', 'peaty', 'saline', 'sandy', 'clay', 'loamy'
      ];
      
      const normalized = value.toLowerCase().trim();
      return validSoils.includes(normalized) || 'Please select a valid soil type';
    },

    /**
     * Validate land area (in hectares or acres)
     */
    landArea(value, unit = 'hectares') {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid land area';
      }
      if (num > 10000) {
        return `Land area seems too large. Please verify.`;
      }
      return true;
    },

    /**
     * Validate temperature (in Celsius)
     */
    temperature(value) {
      const temp = parseFloat(value);
      if (isNaN(temp)) {
        return 'Please enter a valid temperature';
      }
      if (temp < -20 || temp > 55) {
        return 'Temperature must be between -20°C and 55°C';
      }
      return true;
    },

    /**
     * Validate humidity percentage
     */
    humidity(value) {
      const humidity = parseFloat(value);
      if (isNaN(humidity)) {
        return 'Please enter a valid humidity value';
      }
      if (humidity < 0 || humidity > 100) {
        return 'Humidity must be between 0% and 100%';
      }
      return true;
    },

    /**
     * Validate pH level
     */
    phLevel(value) {
      const ph = parseFloat(value);
      if (isNaN(ph)) {
        return 'Please enter a valid pH level';
      }
      if (ph < 0 || ph > 14) {
        return 'pH level must be between 0 and 14';
      }
      return true;
    },

    /**
     * Validate rainfall (in mm)
     */
    rainfall(value) {
      const rainfall = parseFloat(value);
      if (isNaN(rainfall) || rainfall < 0) {
        return 'Please enter a valid rainfall amount';
      }
      if (rainfall > 15000) {
        return 'Rainfall amount seems too high. Please verify.';
      }
      return true;
    },

    /**
     * Validate nitrogen, phosphorus, potassium levels
     */
    npkLevel(value, element) {
      const level = parseFloat(value);
      if (isNaN(level) || level < 0) {
        return `Please enter a valid ${element} level`;
      }
      if (level > 200) {
        return `${element} level seems too high. Please verify.`;
      }
      return true;
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidation;
}

if (typeof window !== 'undefined') {
  window.FormValidation = FormValidation;
}
