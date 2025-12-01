// Model Selector Dropdown
(function() {
  'use strict';

  function initModelSelector() {
    const modelSelector = document.getElementById('modelSelector');
    const modelDropdown = document.getElementById('modelDropdown');
    const currentModelLogo = document.getElementById('currentModelLogo');
    const currentModelName = document.getElementById('currentModelName');
    const modelOptions = document.querySelectorAll('.model-option');

    if (!modelSelector || !modelDropdown) return;

    // Remove existing listeners to prevent duplicates (if any)
    // Note: Cloning node removes listeners but might break other references.
    // Better to just ensure we don't re-bind or handle it safely.
    // For simplicity in this context, we assume init is called once per page load/nav.
    // But to be safe against multiple calls, we can check a flag.
    if (modelSelector.dataset.initialized === 'true') return;
    modelSelector.dataset.initialized = 'true';

    // Prevent scroll propagation
    modelDropdown.addEventListener('wheel', function(e) {
      e.stopPropagation();
      const scrollTop = this.scrollTop;
      const scrollHeight = this.scrollHeight;
      const height = this.clientHeight;
      const delta = e.deltaY;
      
      // Prevent scroll chaining
      if ((delta < 0 && scrollTop <= 0) || (delta > 0 && scrollTop + height >= scrollHeight)) {
        e.preventDefault();
      }
    }, { passive: false });

    // Toggle dropdown
    // Note: This element listener is removed if the component is re-created,
    // but since we check initialized flag, we don't re-bind.
    // However, if the element itself is replaced in the DOM, the old listener is gone, and dataset is gone.
    // So initialized check is actually good for preventing double bind on existing element.
    modelSelector.addEventListener('click', function(e) {
      e.stopPropagation();
      // Using classList.toggle is fine, but let's be more explicit
      // to handle potential desync issues.
      const isCurrentlyActive = modelSelector.classList.contains('active');
      
      if (isCurrentlyActive) {
          // Close it
          modelSelector.classList.remove('active');
          modelDropdown.classList.remove('show');
          setTimeout(() => {
            if (!modelSelector.classList.contains('active')) {
              modelDropdown.style.display = 'none';
            }
          }, 300);
      } else {
          // Open it
          modelSelector.classList.add('active');
          modelDropdown.style.display = 'block';
          // Trigger reflow
          modelDropdown.offsetHeight;
          modelDropdown.classList.add('show');
      }
    });

    // Select model
    modelOptions.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        const logo = this.getAttribute('data-logo');
        const name = this.getAttribute('data-name');
        
        if (currentModelLogo) currentModelLogo.src = logo;
        if (currentModelName) currentModelName.textContent = name;
        
        modelSelector.classList.remove('active');
        modelDropdown.classList.remove('show');
        setTimeout(() => {
          if (!modelSelector.classList.contains('active')) {
            modelDropdown.style.display = 'none';
          }
        }, 300);
      });
    });

    // Close dropdown when clicking outside
    // Note: This adds a document listener every time init is called.
    // We should check if it's already added or make it a named function.
    if (!window.modelSelectorDocumentClickBound) {
        document.addEventListener('click', function(e) {
            // Check if click is inside selector or dropdown
            if (modelSelector.contains(e.target) || modelDropdown.contains(e.target)) {
                return;
            }
            modelSelector.classList.remove('active');
            modelDropdown.classList.remove('show');
            setTimeout(() => {
                if (!modelSelector.classList.contains('active')) {
                    modelDropdown.style.display = 'none';
                }
            }, 300);
        });
        window.modelSelectorDocumentClickBound = true;
    }
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModelSelector);
  } else {
    initModelSelector();
  }

  // Expose init function globally
  window.initModelSelector = initModelSelector;
})();
