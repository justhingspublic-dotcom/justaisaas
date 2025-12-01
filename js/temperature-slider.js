// Temperature Slider
(function() {
  'use strict';

  function initTemperatureSlider() {
    // Initialize slider for settings page
    const settingsSlider = document.getElementById('temp-slider');
    if (settingsSlider) {
      bindSlider(
        'temp-slider',
        'temp-fill',
        'temp-thumb',
        'temp-display'
      );
    }

    // Initialize slider for chat page
    const chatSlider = document.getElementById('temperatureSlider');
    if (chatSlider) {
      bindSlider(
        'temperatureSlider',
        'sliderFill',
        'sliderThumb',
        'temperatureValue'
      );
    }
  }

  function bindSlider(sliderId, fillId, thumbId, displayId) {
    const slider = document.getElementById(sliderId);
    const fill = document.getElementById(fillId);
    const thumb = document.getElementById(thumbId);
    const display = document.getElementById(displayId);

    if (slider && fill && thumb && display) {
      // Check if already initialized
      if (slider.dataset.initialized === 'true') return;
      slider.dataset.initialized = 'true';

      function updateSlider() {
        const val = parseFloat(slider.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const percentage = ((val - min) / (max - min)) * 100;
        
        fill.style.width = percentage + '%';
        // thumb width is 18px, so half is 9px
        thumb.style.left = `calc(${percentage}% - 9px)`;
        display.textContent = val;
        
        // Add active class for visual feedback
        if (slider.parentElement) {
            slider.parentElement.classList.add('slider-active');
        }
      }
      
      function removeActiveClass() {
        if (slider.parentElement) {
            slider.parentElement.classList.remove('slider-active');
        }
      }

      slider.addEventListener('input', updateSlider);
      slider.addEventListener('change', removeActiveClass);
      slider.addEventListener('blur', removeActiveClass);
      
      // Initialize
      updateSlider();
    }
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTemperatureSlider);
  } else {
    initTemperatureSlider();
  }

  // Expose globally
  window.initTemperatureSlider = initTemperatureSlider;
})();
