# AgriTech JavaScript Utility Libraries

A comprehensive collection of JavaScript utility libraries for the AgriTech platform, providing reusable helper functions for form validation, data manipulation, API calls, storage management, and UI components.

## 📁 Files Overview

### 1. `formValidation.js`
Comprehensive form validation utilities with agriculture-specific validators.

**Features:**
- Email, phone, pincode, Aadhar, PAN validation
- Min/max length and value validations
- Real-time validation with debouncing
- Agriculture-specific validators (crop name, soil type, land area, temperature, humidity, pH, rainfall, NPK levels)

**Usage:**
```javascript
// Single field validation
const result = FormValidation.validateField('test@email.com', { 
  required: true, 
  pattern: 'email' 
});

// Form validation
const formResult = FormValidation.validateForm(formData, {
  email: { required: true, pattern: 'email' },
  phone: { required: true, pattern: 'phone' },
  area: { required: true, min: 0.1, max: 1000 }
});

// Agriculture validators
FormValidation.agriculture.cropName('wheat'); // true
FormValidation.agriculture.phLevel(7.5); // true
FormValidation.agriculture.humidity(85); // true
```

---

### 2. `dataUtils.js`
Data manipulation, formatting, and unit conversion utilities.

**Features:**
- Unit conversions (acres↔hectares, kg↔quintal, °C↔°F, mm↔inches)
- Number formatting (Indian numbering system, currency)
- Date formatting (Indian format, relative time)
- Array utilities (average, sum, min, max, groupBy, sortBy, unique, chunk)
- Agriculture calculations (yield per hectare, profit margin, water requirement, fertilizer needs)

**Usage:**
```javascript
// Unit conversion
DataUtils.convert.acresToHectares(10); // 4.04686
DataUtils.convert.celsiusToFahrenheit(30); // 86

// Formatting
DataUtils.format.indianNumber(1234567); // "12,34,567"
DataUtils.format.currency(50000); // "₹50,000"
DataUtils.format.relativeTime(new Date('2024-01-01')); // "2 months ago"

// Agriculture calculations
DataUtils.agriculture.waterRequirement('rice', 5); // 60,000,000 liters
DataUtils.agriculture.fertilizerRequirement('wheat', 10); // { nitrogen: 1200, ... }
```

---

### 3. `apiHelper.js`
HTTP client with retry logic, caching, and agriculture-specific endpoints.

**Features:**
- GET, POST, PUT, DELETE methods
- Automatic retry with exponential backoff
- Request timeout handling
- Response caching
- File upload with progress tracking
- Agriculture-specific API helpers (weather, crop recommendation, disease detection)

**Usage:**
```javascript
// Configure
ApiHelper.configure({ baseUrl: 'https://api.agritech.com', timeout: 30000 });

// Basic requests
const data = await ApiHelper.get('/crops', { category: 'cereals' });
const result = await ApiHelper.post('/predict', { n: 50, p: 40, k: 30 });

// Cached request
const crops = await ApiHelper.cachedGet('/crops', {}, 60 * 60 * 1000); // 1 hour cache

// File upload with progress
const prediction = await ApiHelper.uploadFile('/predict/disease', imageFile, {}, 
  (progress) => console.log(`${progress}%`)
);

// Agriculture APIs
const weather = await ApiHelper.agriculture.getWeather(28.6139, 77.209, API_KEY);
```

---

### 4. `storageUtils.js`
Local storage, session storage, cookies, and IndexedDB utilities.

**Features:**
- Local storage with expiry support
- Session storage helpers
- Cookie management
- IndexedDB for large data storage
- AgriTech-specific storage (preferences, recent searches, farm data, crop history, weather cache)

**Usage:**
```javascript
// Local storage
StorageUtils.local.set('key', { data: 'value' }, 7); // 7 days expiry
StorageUtils.local.get('key', defaultValue);
StorageUtils.local.cleanExpired();

// Cookies
StorageUtils.cookie.set('session', 'abc123', { expires: 7, secure: true });
StorageUtils.cookie.get('session');

// IndexedDB
await StorageUtils.indexedDB.set('largeData', bigObject);
const data = await StorageUtils.indexedDB.get('largeData');

// AgriTech specific
StorageUtils.agri.savePreferences({ language: 'hi', units: 'metric' });
StorageUtils.agri.addCropHistory({ crop: 'wheat', yield: 4500 });
StorageUtils.agri.cacheWeather('delhi', weatherData);
```

---

### 5. `uiUtils.js`
UI components and DOM manipulation utilities.

**Features:**
- Toast notifications (success, error, warning, info)
- Modal dialogs (confirm, alert, custom)
- Loading overlay
- DOM utilities (query, create elements, event delegation)
- Animation helpers (fadeIn, fadeOut, slideUp, slideDown)

**Usage:**
```javascript
// Toast notifications
UIUtils.toast.success('Crop recommendation generated!');
UIUtils.toast.error('Failed to upload image');
UIUtils.toast.warning('Low moisture detected', 5000);

// Modal dialogs
const confirmed = await UIUtils.modal.confirm('Delete this record?', {
  title: 'Confirm Delete',
  confirmText: 'Delete',
  confirmType: 'danger'
});

await UIUtils.modal.alert('Data saved successfully!', 'Success');

// Loading
UIUtils.loading.show('Analyzing image...');
UIUtils.loading.updateMessage('Processing...');
UIUtils.loading.hide();

// DOM utilities
const element = UIUtils.dom.$('#crop-form');
const inputs = UIUtils.dom.$$('input[type="text"]');
const btn = UIUtils.dom.create('button', { className: 'btn', onClick: handleClick }, 'Submit');

// Animations
await UIUtils.animate.fadeIn(element, 300);
await UIUtils.animate.slideDown(dropdown);
```

---

## 🔧 Installation

Include the utility files in your HTML:

```html
<script src="js/utils/formValidation.js"></script>
<script src="js/utils/dataUtils.js"></script>
<script src="js/utils/apiHelper.js"></script>
<script src="js/utils/storageUtils.js"></script>
<script src="js/utils/uiUtils.js"></script>
```

Or use as ES modules:

```javascript
import FormValidation from './js/utils/formValidation.js';
import DataUtils from './js/utils/dataUtils.js';
import { ApiHelper, ApiError } from './js/utils/apiHelper.js';
import StorageUtils from './js/utils/storageUtils.js';
import UIUtils from './js/utils/uiUtils.js';
```

---

## 📊 Statistics

| File | Lines | Functions | Purpose |
|------|-------|-----------|---------|
| formValidation.js | ~320 | 15+ | Form validation |
| dataUtils.js | ~380 | 40+ | Data manipulation |
| apiHelper.js | ~350 | 25+ | API communication |
| storageUtils.js | ~400 | 35+ | Data persistence |
| uiUtils.js | ~450 | 30+ | UI components |
| **Total** | **~1,900** | **145+** | |

---

## 🌾 Agriculture-Specific Features

- **Crop validation**: Validate crop names against known Indian crops
- **Soil type validation**: Validate soil types (alluvial, black, red, etc.)
- **NPK level validation**: Validate nitrogen, phosphorus, potassium levels
- **Weather caching**: Cache weather data for 30 minutes
- **Farm data persistence**: Store farm information with 30-day expiry
- **Crop history tracking**: Track crop planting and yield history
- **Water requirement calculation**: Calculate irrigation needs by crop
- **Fertilizer recommendations**: Calculate NPK requirements by crop and area

---

## 🤝 Contributing

This utility library was created as part of ECWoC 2026 (Elite Coders Winter of Code).

**Author**: Ayush Pawar ([@ayushap18](https://github.com/ayushap18))

---

## 📜 License

MIT License - Feel free to use and modify for your agricultural applications.
