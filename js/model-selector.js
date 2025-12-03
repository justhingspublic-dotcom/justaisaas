// Model Selector Dropdown - Event Delegation Version
(function() {
  'use strict';

  // Centralized click handler for better reliability
  function handleDocumentClick(e) {
    const modelSelector = document.getElementById('modelSelector');
    const modelDropdown = document.getElementById('modelDropdown');

    // If elements don't exist, do nothing
    if (!modelSelector || !modelDropdown) return;

    const clickedSelector = modelSelector.contains(e.target);
    const clickedDropdown = modelDropdown.contains(e.target);
    const isCurrentlyOpen = modelDropdown.classList.contains('show');

    // Case 1: Clicked on the selector button
    if (clickedSelector) {
      // If clicking the selector while open -> close it
      if (isCurrentlyOpen) {
        closeDropdown(modelSelector, modelDropdown);
      } else {
        openDropdown(modelSelector, modelDropdown);
      }
      return;
    }

    // Case 2: Clicked inside the dropdown (on an option)
    if (clickedDropdown) {
      const option = e.target.closest('.model-option');
      if (option) {
        selectModel(option, modelSelector, modelDropdown);
      }
      // If clicked inside dropdown but not on an option, do nothing (stay open)
      return;
    }

    // Case 3: Clicked outside -> close if open
    if (isCurrentlyOpen) {
      closeDropdown(modelSelector, modelDropdown);
    }
  }

  function openDropdown(selector, dropdown) {
    // Position adjustment if needed (though CSS absolute should handle it)
    dropdown.style.display = 'block';
    // Force reflow to ensure transition works
    void dropdown.offsetWidth;
    
    selector.classList.add('active');
    dropdown.classList.add('show');
  }

  function closeDropdown(selector, dropdown) {
    selector.classList.remove('active');
    dropdown.classList.remove('show');
    
    // Wait for transition to finish before hiding
    setTimeout(() => {
      if (!dropdown.classList.contains('show')) {
        dropdown.style.display = 'none';
      }
    }, 200);
  }

  function selectModel(option, selector, dropdown) {
    const logo = option.getAttribute('data-logo');
    const name = option.getAttribute('data-name');
    
    const currentLogo = document.getElementById('currentModelLogo');
    const currentName = document.getElementById('currentModelName');

    if (currentLogo) currentLogo.src = logo;
    if (currentName) currentName.textContent = name;

    closeDropdown(selector, dropdown);
  }

  // Init function
  function init() {
    // Remove any existing listeners to avoid duplicates if re-initialized
    document.removeEventListener('click', handleDocumentClick);
    
    // Add the single global listener
    document.addEventListener('click', handleDocumentClick);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose for manual re-init if needed
  window.initModelSelector = init;

})();
