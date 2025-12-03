/**
 * Generic Slider Component
 * Handles interaction for custom styled range inputs.
 */
(function() {
  'use strict';

  function initSlider(containerId, options = {}) {
    // Support initializing by ID string or Element
    let container;
    if (typeof containerId === 'string') {
      container = document.getElementById(containerId);
    } else {
      container = containerId;
    }

    if (!container) return;
    
    // Avoid double init
    if (container.dataset.sliderInitialized === 'true') return;
    container.dataset.sliderInitialized = 'true';

    // Find parts
    const sliderInput = container.querySelector('.slider-input');
    const fill = container.querySelector('.slider-fill');
    const thumb = container.querySelector('.slider-thumb');
    // Display element is optional, passed via options or found by data-attribute if we want to extend logic
    // For now, we keep it simple: if a display element ID is provided, update it.
    const displayElement = options.displayId ? document.getElementById(options.displayId) : null;

    if (!sliderInput || !fill || !thumb) {
      console.warn('Slider structure missing parts:', container);
      return;
    }

    function updateVisuals() {
      const val = parseFloat(sliderInput.value);
      const min = parseFloat(sliderInput.min || 0);
      const max = parseFloat(sliderInput.max || 100);
      const percentage = ((val - min) / (max - min)) * 100;

      // Update Fill Width
      fill.style.width = `${percentage}%`;
      
      // Update Thumb Position
      // Set left position and use transform for centering (CSS will handle additional transforms like scale)
      thumb.style.left = `${percentage}%`;
      thumb.style.transform = `translateY(-50%) translateX(-50%)`; // Center both axes
      
      // Update Text Display if present
      if (displayElement) {
        displayElement.textContent = val;
      }
    }

    function handleInput() {
      updateVisuals();
      container.classList.add('slider-active');
    }

    function removeActiveClass() {
      container.classList.remove('slider-active');
    }

    // Bind Events
    sliderInput.addEventListener('input', handleInput);
    sliderInput.addEventListener('change', removeActiveClass);
    
    // Add mouseup and touchend to ensure active class is removed
    sliderInput.addEventListener('mouseup', removeActiveClass);
    sliderInput.addEventListener('touchend', removeActiveClass);
    
    // Also remove on blur (when slider loses focus)
    sliderInput.addEventListener('blur', removeActiveClass);
    
    // Listen to document mouseup to catch cases where user releases outside slider
    document.addEventListener('mouseup', function(e) {
      if (container.classList.contains('slider-active')) {
        removeActiveClass();
      }
    });

    // Initial Update
    updateVisuals();
  }

  // Auto-initialize all .slider-container elements that have a data-auto-init attribute
  // Or we can expose the init function globally.
  window.initSlider = initSlider;

  // Legacy support for existing pages (optional, but good for transition)
  // We'll keep the specific page init logic separate or migrate it here.
  
  // Initialize all sliders on the page
  function initAll() {
    // Find all slider containers that haven't been initialized yet
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(container => {
      // Skip if already initialized
      if (container.dataset.sliderInitialized === 'true') {
        return;
      }
      
      // Try to find a display element for this slider
      const sliderInput = container.querySelector('.slider-input');
      let displayId = null;
      
      if (sliderInput) {
        // Check for common patterns
        if (sliderInput.id === 'temperatureSlider') {
          displayId = 'temperatureValue';
        } else if (sliderInput.id === 'temp-slider') {
          displayId = 'temp-display';
        }
      }
      
      initSlider(container, displayId ? { displayId } : {});
    });
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  
  // Also expose initAll globally so it can be called after page navigation
  window.reinitSliders = initAll;

})();

