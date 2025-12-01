// Modern Sidebar JavaScript
(function() {
  'use strict';

  const PINNED_STORAGE_KEY = 'sidebarPinned';
  let documentListenerAttached = false;

  function initSidebar() {
    const sidebar = document.querySelector('.chat-sidebar');
    if (!sidebar || sidebar.dataset.initialized === 'true') {
      // Even if initialized, we might need to re-bind the mobile toggle if the header was reloaded
      bindMobileToggle();
      return;
    }
    sidebar.dataset.initialized = 'true';

    // Add overlay for mobile
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
      
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    const dashboardLayout = document.querySelector('.dashboard-layout');

    const setExpanded = (expanded) => {
      // Do not expand on mobile
      if (window.innerWidth <= 768) return;
      sidebar.classList.toggle('is-expanded', expanded);
    };

    const setPinned = (pinned) => {
      // Do not pin on mobile
      if (window.innerWidth <= 768) return;
      
      sidebar.classList.toggle('pinned', pinned);
      if (dashboardLayout) {
        dashboardLayout.classList.toggle('sidebar-pinned', pinned);
      }
      if (pinned) {
        setExpanded(true);
      } else if (!sidebar.matches(':hover')) {
        setExpanded(false);
      }
      localStorage.setItem(PINNED_STORAGE_KEY, pinned ? 'true' : 'false');
    };

    const navigateInternal = (href) => {
      if (typeof window.handleNavigation === 'function') {
        window.handleNavigation(href, true);
      } else {
        window.location.href = href;
      }
      
      // Close mobile menu after navigation
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
      }
    };

    const toggleBtn = sidebar.querySelector('.sidebar-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextPinned = !sidebar.classList.contains('pinned');
        setPinned(nextPinned);
      });
    }
    
    // Bind mobile toggle button in header
    bindMobileToggle();

    const handleHoverExpand = (event) => {
      if (window.innerWidth <= 768) return;
      if (sidebar.classList.contains('pinned')) return;
      if (event.target.closest && event.target.closest('.sidebar-toggle-btn')) return;
      setExpanded(true);
    };

    const handleHoverCollapse = () => {
      if (window.innerWidth <= 768) return;
      if (sidebar.classList.contains('pinned')) return;
      setExpanded(false);
    };

    sidebar.addEventListener('pointerover', handleHoverExpand);
    sidebar.addEventListener('pointerleave', handleHoverCollapse);

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        // Mobile view
        sidebar.classList.remove('pinned');
        sidebar.classList.remove('is-expanded');
        if (dashboardLayout) {
          dashboardLayout.classList.remove('sidebar-pinned');
        }
        // We don't force close mobile menu here, user might want it open if they just resized
        // But usually pinned state is desktop specific, so clearing it is correct.
      } else {
        // Desktop view - restore pinned state if saved
        const wasPinned = localStorage.getItem(PINNED_STORAGE_KEY) === 'true';
        if (wasPinned) {
           sidebar.classList.add('pinned');
           sidebar.classList.add('is-expanded');
           if (dashboardLayout) {
             dashboardLayout.classList.add('sidebar-pinned');
           }
        }
      }
    });

    // Only restore pinned state on desktop
    if (window.innerWidth > 768) {
    const wasPinned = localStorage.getItem(PINNED_STORAGE_KEY) === 'true';
    if (wasPinned) {
      setPinned(true);
      }
    }

    const dropdownTriggers = sidebar.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener('click', function(event) {
        event.preventDefault();
        const navItem = this.closest('.nav-dropdown');
        if (!navItem) return;

        sidebar.querySelectorAll('.nav-dropdown.open').forEach((item) => {
          if (item !== navItem) {
            item.classList.remove('open');
          }
        });

        navItem.classList.toggle('open');
      });
    });

    const links = sidebar.querySelectorAll('.nav-link:not(.dropdown-trigger), .dropdown-link');
    links.forEach((link) => {
      link.addEventListener('click', function(event) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('http')) {
          event.preventDefault();
          setActiveItem(href);
          navigateInternal(href);
        }
      });
    });

    setTimeout(() => setActiveItem(), 100);

    if (!documentListenerAttached) {
      document.addEventListener('click', handleDocumentClick);
      documentListenerAttached = true;
    }
  }
  
  function bindMobileToggle() {
    const mobileToggleBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.chat-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (mobileToggleBtn && sidebar) {
      // Remove old listener if any (by cloning)
      const newBtn = mobileToggleBtn.cloneNode(true);
      mobileToggleBtn.parentNode.replaceChild(newBtn, mobileToggleBtn);
      
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
        if (overlay) {
          overlay.classList.toggle('active', sidebar.classList.contains('mobile-open'));
        }
      });
    }
  }

  function handleDocumentClick(event) {
    const sidebar = document.querySelector('.chat-sidebar');
    if (!sidebar || sidebar.contains(event.target)) {
      return;
    }
    sidebar.querySelectorAll('.nav-dropdown.open').forEach((item) => {
      item.classList.remove('open');
    });
  }

  function setActiveItem(targetPath) {
    const sidebar = document.querySelector('.chat-sidebar');
    if (!sidebar) {
      return;
    }

    if (!targetPath) {
      targetPath = window.location.pathname.split('/').pop() || 'chat.html';
      if (targetPath === '' || targetPath === '/') {
        targetPath = 'chat.html';
      }
    } else {
      targetPath = targetPath.split('/').pop();
    }

    sidebar.querySelectorAll('.nav-item, .dropdown-item').forEach((item) => {
      item.classList.remove('active');
    });
    sidebar.querySelectorAll('.nav-dropdown').forEach((item) => {
      item.classList.remove('has-active-child');
    });

    let found = false;

    sidebar.querySelectorAll('.dropdown-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href === targetPath || href.endsWith('/' + targetPath))) {
        const item = link.closest('.dropdown-item');
        const dropdown = link.closest('.nav-dropdown');

        if (item) {
          item.classList.add('active');
        }
        if (dropdown) {
          dropdown.classList.add('open');
          dropdown.classList.add('has-active-child');
        }
        found = true;
      }
    });

    if (!found) {
      sidebar.querySelectorAll('.nav-link:not(.dropdown-trigger)').forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (href === targetPath || href.endsWith('/' + targetPath))) {
          const item = link.closest('.nav-item');
          if (item) {
            item.classList.add('active');
          }
          found = true;
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeType === 1 &&
          (node.classList.contains('chat-sidebar') ||
            (typeof node.querySelector === 'function' && node.querySelector('.chat-sidebar')))
        ) {
          initSidebar();
        }
        // Also re-bind if header is reloaded
        if (
            node.nodeType === 1 && 
            (node.classList.contains('main-header') || 
             (typeof node.querySelector === 'function' && node.querySelector('.mobile-menu-btn')))
        ) {
            bindMobileToggle();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.initializeSidebar = initSidebar;
  window.setSidebarActive = setActiveItem;
})();
