/**
 * Generic Dropdown Component
 * Handles interaction for custom dropdown selectors.
 */
(function() {
  'use strict';

  function initDropdown(dropdownId, options = {}) {
    // Support initializing by ID string or Element
    let wrapper;
    if (typeof dropdownId === 'string') {
      wrapper = document.getElementById(dropdownId);
    } else {
      wrapper = dropdownId;
    }

    if (!wrapper) return;
    
    // Avoid double init
    if (wrapper.dataset.dropdownInitialized === 'true') return;
    wrapper.dataset.dropdownInitialized = 'true';

    // Find parts
    const button = wrapper.querySelector('.dropdown-button');
    const menu = wrapper.querySelector('.ui-dropdown-menu');
    const options_list = wrapper.querySelectorAll('.dropdown-option');

    if (!button || !menu) {
      console.warn('Dropdown structure missing parts:', wrapper);
      return;
    }

    // Centralized click handler
    function handleDocumentClick(e) {
      const clickedButton = button.contains(e.target);
      const clickedMenu = menu.contains(e.target);
      const isCurrentlyOpen = menu.classList.contains('show');

      // Case 1: Clicked on button
      if (clickedButton) {
        if (isCurrentlyOpen) {
          closeDropdown();
        } else {
          openDropdown();
        }
        return;
      }

      // Case 2: Clicked on an option
      if (clickedMenu) {
        const option = e.target.closest('.dropdown-option');
        if (option && options.onSelect) {
          options.onSelect(option);
          closeDropdown();
        }
        return;
      }

      // Case 3: Clicked outside
      if (isCurrentlyOpen) {
        closeDropdown();
      }
    }

    function openDropdown() {
      menu.style.display = 'block';
      void menu.offsetWidth; // Force reflow
      button.classList.add('active');
      menu.classList.add('show');
    }

    function closeDropdown() {
      button.classList.remove('active');
      menu.classList.remove('show');
      setTimeout(() => {
        if (!menu.classList.contains('show')) {
          menu.style.display = 'none';
        }
      }, 200);
    }

    // Bind events
    document.addEventListener('click', handleDocumentClick);

    // Prevent scroll propagation in menu
    menu.addEventListener('wheel', function(e) {
      e.stopPropagation();
      const scrollTop = this.scrollTop;
      const scrollHeight = this.scrollHeight;
      const height = this.clientHeight;
      const delta = e.deltaY;
      
      if ((delta < 0 && scrollTop <= 0) || (delta > 0 && scrollTop + height >= scrollHeight)) {
        e.preventDefault();
      }
    }, { passive: false });

    // Expose close function
    wrapper.closeDropdown = closeDropdown;
  }

  // Expose globally
  window.initDropdown = initDropdown;

  // Auto-initialize dropdowns with data-auto-init
  function initAll() {
    document.querySelectorAll('.dropdown-wrapper[data-auto-init]').forEach(wrapper => {
      initDropdown(wrapper);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();

