/**
 * AgriTech UI Utilities
 * DOM manipulation, UI components, and animation helpers
 * ECWoC 2026 Contribution
 */

const UIUtils = {
  /**
   * Toast notification system
   */
  toast: {
    container: null,
    queue: [],
    maxVisible: 3,

    /**
     * Initialize toast container
     */
    init() {
      if (this.container) return;
      
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      this.container.setAttribute('role', 'alert');
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
      
      // Add styles if not already present
      if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
          .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .toast {
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 350px;
          }
          .toast.success { background: #10b981; }
          .toast.error { background: #ef4444; }
          .toast.warning { background: #f59e0b; }
          .toast.info { background: #3b82f6; }
          .toast.hiding { animation: slideOut 0.3s ease-in forwards; }
          .toast-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            margin-left: auto;
            opacity: 0.8;
          }
          .toast-close:hover { opacity: 1; }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in ms (0 for persistent)
     */
    show(message, type = 'info', duration = 3000) {
      this.init();
      
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      const icon = this.getIcon(type);
      toast.innerHTML = `
        ${icon}
        <span>${message}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
      `;
      
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.hide(toast));
      
      this.container.appendChild(toast);
      
      if (duration > 0) {
        setTimeout(() => this.hide(toast), duration);
      }
      
      return toast;
    },

    /**
     * Get icon SVG for toast type
     * @param {string} type - Toast type
     * @returns {string} SVG icon HTML
     */
    getIcon(type) {
      const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>'
      };
      return icons[type] || icons.info;
    },

    /**
     * Hide toast
     * @param {HTMLElement} toast - Toast element
     */
    hide(toast) {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    },

    // Convenience methods
    success(message, duration) { return this.show(message, 'success', duration); },
    error(message, duration) { return this.show(message, 'error', duration); },
    warning(message, duration) { return this.show(message, 'warning', duration); },
    info(message, duration) { return this.show(message, 'info', duration); }
  },

  /**
   * Modal dialog system
   */
  modal: {
    /**
     * Show modal dialog
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    show(options = {}) {
      const {
        title = '',
        content = '',
        size = 'medium', // small, medium, large, fullscreen
        closable = true,
        onClose = null,
        actions = []
      } = options;

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = `modal modal-${size}`;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      
      modal.innerHTML = `
        ${title ? `<div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          ${closable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
        </div>` : ''}
        <div class="modal-body">${content}</div>
        ${actions.length ? `<div class="modal-footer"></div>` : ''}
      `;
      
      // Add action buttons
      if (actions.length) {
        const footer = modal.querySelector('.modal-footer');
        actions.forEach(action => {
          const btn = document.createElement('button');
          btn.className = `btn btn-${action.type || 'secondary'}`;
          btn.textContent = action.text;
          btn.addEventListener('click', () => {
            if (action.handler) action.handler();
            if (action.closeOnClick !== false) this.close(overlay);
          });
          footer.appendChild(btn);
        });
      }
      
      // Close handlers
      if (closable) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            if (onClose) onClose();
            this.close(overlay);
          });
        }
        
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            if (onClose) onClose();
            this.close(overlay);
          }
        });
      }
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      modal.focus();
      
      // Add styles
      this.addStyles();
      
      return overlay;
    },

    /**
     * Close modal
     * @param {HTMLElement} overlay - Modal overlay element
     */
    close(overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
        // Restore body scroll if no other modals
        if (!document.querySelector('.modal-overlay')) {
          document.body.style.overflow = '';
        }
      }, 300);
    },

    /**
     * Confirm dialog
     * @param {string} message - Confirmation message
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>}
     */
    confirm(message, options = {}) {
      return new Promise((resolve) => {
        this.show({
          title: options.title || 'Confirm',
          content: `<p>${message}</p>`,
          size: 'small',
          closable: false,
          actions: [
            {
              text: options.cancelText || 'Cancel',
              type: 'secondary',
              handler: () => resolve(false)
            },
            {
              text: options.confirmText || 'Confirm',
              type: options.confirmType || 'primary',
              handler: () => resolve(true)
            }
          ]
        });
      });
    },

    /**
     * Alert dialog
     * @param {string} message - Alert message
     * @param {string} title - Alert title
     * @returns {Promise<void>}
     */
    alert(message, title = 'Alert') {
      return new Promise((resolve) => {
        this.show({
          title,
          content: `<p>${message}</p>`,
          size: 'small',
          actions: [
            {
              text: 'OK',
              type: 'primary',
              handler: () => resolve()
            }
          ]
        });
      });
    },

    /**
     * Add modal styles
     */
    addStyles() {
      if (document.getElementById('modal-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }
        .modal-overlay.closing { animation: fadeOut 0.3s ease-in forwards; }
        .modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          animation: scaleIn 0.3s ease-out;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .modal-small { width: 90%; max-width: 400px; }
        .modal-medium { width: 90%; max-width: 600px; }
        .modal-large { width: 90%; max-width: 900px; }
        .modal-fullscreen { width: 95%; height: 95%; max-width: none; }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-title { margin: 0; font-size: 18px; font-weight: 600; }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .modal-close:hover { color: #111827; }
        .modal-body { padding: 20px; overflow-y: auto; flex: 1; }
        .modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `;
      document.head.appendChild(style);
    }
  },

  /**
   * Loading indicator
   */
  loading: {
    overlay: null,

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loading overlay
     */
    show(message = 'Loading...') {
      if (this.overlay) return this.overlay;
      
      this.overlay = document.createElement('div');
      this.overlay.className = 'loading-overlay';
      this.overlay.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">${message}</p>
        </div>
      `;
      
      document.body.appendChild(this.overlay);
      this.addStyles();
      
      return this.overlay;
    },

    /**
     * Hide loading overlay
     */
    hide() {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    },

    /**
     * Update loading message
     * @param {string} message - New message
     */
    updateMessage(message) {
      if (this.overlay) {
        const text = this.overlay.querySelector('.loading-text');
        if (text) text.textContent = message;
      }
    },

    /**
     * Add loading styles
     */
    addStyles() {
      if (document.getElementById('loading-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'loading-styles';
      style.textContent = `
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
        }
        .loading-spinner { text-align: center; }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        .loading-text { color: #374151; font-size: 16px; margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }
  },

  /**
   * DOM utility methods
   */
  dom: {
    /**
     * Query selector shorthand
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element
     * @returns {Element|null}
     */
    $(selector, context = document) {
      return context.querySelector(selector);
    },

    /**
     * Query selector all shorthand
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element
     * @returns {Element[]}
     */
    $$(selector, context = document) {
      return Array.from(context.querySelectorAll(selector));
    },

    /**
     * Create element with attributes
     * @param {string} tag - Tag name
     * @param {Object} attrs - Attributes
     * @param {string|Element|Element[]} children - Child content
     * @returns {Element}
     */
    create(tag, attrs = {}, children = null) {
      const el = document.createElement(tag);
      
      for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
          el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'dataset' && typeof value === 'object') {
          Object.assign(el.dataset, value);
        } else {
          el.setAttribute(key, value);
        }
      }
      
      if (children) {
        if (typeof children === 'string') {
          el.innerHTML = children;
        } else if (Array.isArray(children)) {
          children.forEach(child => el.appendChild(child));
        } else {
          el.appendChild(children);
        }
      }
      
      return el;
    },

    /**
     * Add event listener with delegation
     * @param {Element} element - Parent element
     * @param {string} event - Event type
     * @param {string} selector - Delegate selector
     * @param {Function} handler - Event handler
     */
    delegate(element, event, selector, handler) {
      element.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target && element.contains(target)) {
          handler.call(target, e);
        }
      });
    },

    /**
     * Smooth scroll to element
     * @param {Element|string} target - Target element or selector
     * @param {number} offset - Offset from top
     */
    scrollTo(target, offset = 0) {
      const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
      
      if (!element) return;
      
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    },

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @param {number} threshold - Visibility threshold (0-1)
     * @returns {boolean}
     */
    isInViewport(element, threshold = 0) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      
      const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                         ((rect.top + rect.height) >= windowHeight * threshold);
      const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                        ((rect.left + rect.width) >= windowWidth * threshold);
      
      return vertInView && horInView;
    }
  },

  /**
   * Animation utilities
   */
  animate: {
    /**
     * Fade in element
     * @param {Element} element - Element to animate
     * @param {number} duration - Duration in ms
     * @returns {Promise<void>}
     */
    fadeIn(element, duration = 300) {
      return new Promise((resolve) => {
        element.style.opacity = '0';
        element.style.display = '';
        element.style.transition = `opacity ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          setTimeout(resolve, duration);
        });
      });
    },

    /**
     * Fade out element
     * @param {Element} element - Element to animate
     * @param {number} duration - Duration in ms
     * @returns {Promise<void>}
     */
    fadeOut(element, duration = 300) {
      return new Promise((resolve) => {
        element.style.transition = `opacity ${duration}ms ease-in`;
        element.style.opacity = '0';
        
        setTimeout(() => {
          element.style.display = 'none';
          resolve();
        }, duration);
      });
    },

    /**
     * Slide down element
     * @param {Element} element - Element to animate
     * @param {number} duration - Duration in ms
     * @returns {Promise<void>}
     */
    slideDown(element, duration = 300) {
      return new Promise((resolve) => {
        element.style.overflow = 'hidden';
        element.style.display = '';
        const height = element.scrollHeight;
        element.style.height = '0';
        element.style.transition = `height ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
          element.style.height = height + 'px';
          setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
            resolve();
          }, duration);
        });
      });
    },

    /**
     * Slide up element
     * @param {Element} element - Element to animate
     * @param {number} duration - Duration in ms
     * @returns {Promise<void>}
     */
    slideUp(element, duration = 300) {
      return new Promise((resolve) => {
        element.style.overflow = 'hidden';
        element.style.height = element.scrollHeight + 'px';
        element.style.transition = `height ${duration}ms ease-in`;
        
        requestAnimationFrame(() => {
          element.style.height = '0';
          setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            resolve();
          }, duration);
        });
      });
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIUtils;
}

if (typeof window !== 'undefined') {
  window.UIUtils = UIUtils;
}
