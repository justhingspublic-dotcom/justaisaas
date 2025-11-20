// Modern Sidebar JavaScript
(function() {
  'use strict';

  const PINNED_STORAGE_KEY = 'sidebarPinned';
  let documentListenerAttached = false;

  function initSidebar() {
    const sidebar = document.querySelector('.chat-sidebar');
    if (!sidebar || sidebar.dataset.initialized === 'true') {
      return;
    }
    sidebar.dataset.initialized = 'true';

    const dashboardLayout = document.querySelector('.dashboard-layout');

    const setExpanded = (expanded) => {
      sidebar.classList.toggle('is-expanded', expanded);
    };

    const setPinned = (pinned) => {
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
    };

    const toggleBtn = sidebar.querySelector('.sidebar-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextPinned = !sidebar.classList.contains('pinned');
        setPinned(nextPinned);
      });
    }

    const handleHoverExpand = (event) => {
      if (sidebar.classList.contains('pinned')) return;
      if (event.target.closest && event.target.closest('.sidebar-toggle-btn')) return;
      setExpanded(true);
    };

    const handleHoverCollapse = () => {
      if (sidebar.classList.contains('pinned')) return;
      setExpanded(false);
    };

    sidebar.addEventListener('pointerover', handleHoverExpand);
    sidebar.addEventListener('pointerleave', handleHoverCollapse);

    const wasPinned = localStorage.getItem(PINNED_STORAGE_KEY) === 'true';
    if (wasPinned) {
      setPinned(true);
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
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.initializeSidebar = initSidebar;
  window.setSidebarActive = setActiveItem;
})();

