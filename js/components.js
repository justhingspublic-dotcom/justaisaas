// 載入組件的函數
async function loadComponent(elementId, componentPath) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', componentPath, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        const html = xhr.responseText;
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = html;
          resolve(element);
        } else {
          const error = `Element #${elementId} not found`;
          console.error(error);
          reject(new Error(error));
        }
      } else {
        const error = `HTTP ${xhr.status}: Failed to load ${componentPath}`;
        console.error(error);
        reject(new Error(error));
      }
    };
    xhr.onerror = function() {
      const error = `Network error loading ${componentPath}`;
      console.error(error);
      reject(new Error(error));
    };
    xhr.send();
  });
}

// 當 DOM 載入完成時載入所有組件
document.addEventListener('DOMContentLoaded', function() {
  // Check if we are handling a navigation event (popstate)
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.url) {
      handleNavigation(event.state.url, false);
    } else {
       // Fallback for initial load or external navigation
       window.location.reload(); 
    }
  });

  // 載入 Header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    loadComponent('header-container', 'components/header.html');
  }
  
  // 載入 Sidebar
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    loadComponent('sidebar-container', 'components/sidebar.html');
  }

  // 載入 Chat Sidebar
  const chatSidebarContainer = document.getElementById('chat-sidebar-container');
  if (chatSidebarContainer) {
    loadComponent('chat-sidebar-container', 'components/chat-sidebar.html').then(() => {
      // Initialize sidebar after HTML is loaded
      if (window.initializeSidebar) {
        window.initializeSidebar();
      }
      // Wait a bit for sidebar-new.js to initialize
      setTimeout(() => {
        if (window.setSidebarActive) {
          window.setSidebarActive();
        }
      }, 150);
    });
  }

  // 載入 Activity Sidebar
  const activitySidebarContainer = document.getElementById('activity-sidebar-container');
  if (activitySidebarContainer) {
    loadComponent('activity-sidebar-container', 'components/activity-sidebar.html');
  }
});

function initializeNavigation() {
  const links = document.querySelectorAll('.chat-sidebar-nav a');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const isArrow = e.target.classList.contains('nav-arrow');
      
      // If arrow clicked, do nothing (handled by toggle)
      if (isArrow) return;

      // If href is valid and internal
      if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('javascript')) {
        e.preventDefault();
        handleNavigation(href, true);
      }
    });
  });
}

async function handleNavigation(url, pushState = true) {
  try {
    // Fetch the new page content
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const text = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    const newDashboard = doc.querySelector('.dashboard-layout');
    const currentDashboard = document.querySelector('.dashboard-layout');
    
    if (newDashboard && currentDashboard) {
        syncStylesheets(doc);
        // Identify content to keep (Sidebar)
        // Note: We are NOT re-rendering sidebar to avoid flash and keep state
        
        // Identify content to replace
        // We'll remove all children of currentDashboard that are NOT #chat-sidebar-container
        Array.from(currentDashboard.children).forEach(child => {
            if (child.id !== 'chat-sidebar-container') {
                child.remove();
            }
        });
        
        // Append new children from newDashboard that are NOT #chat-sidebar-container
        Array.from(newDashboard.children).forEach(child => {
            if (child.id !== 'chat-sidebar-container') {
                // We need to import the node
                currentDashboard.appendChild(document.importNode(child, true));
            }
        });
        
        // Update Title
        document.title = doc.title;
        
        // Update URL
        if (pushState) {
            window.history.pushState({ url: url }, doc.title, url);
        }
        
        const hasChatSidebar = document.querySelector('.chat-sidebar');
        if (hasChatSidebar) {
            if (typeof window.setSidebarActive === 'function') {
                window.setSidebarActive();
            }
        } else if (typeof window.setActiveSidebarItem === 'function') {
            window.setActiveSidebarItem();
        }
    } else {
        // Fallback if structure doesn't match
        window.location.href = url;
    }
    
  } catch (error) {
    console.error('Navigation failed:', error);
    window.location.href = url; // Fallback
  }
}

function syncStylesheets(parsedDocument) {
  if (!parsedDocument) return;
  const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  const existingHrefs = existingLinks.map(link => link.getAttribute('href'));

  const newLinks = Array.from(parsedDocument.querySelectorAll('link[rel="stylesheet"]'));
  newLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || existingHrefs.includes(href)) {
      return;
    }

    const clone = document.createElement('link');
    clone.rel = 'stylesheet';
    clone.href = href;
    document.head.appendChild(clone);
    existingHrefs.push(href);
  });
}

function initializeSidebarToggles() {
  const toggles = document.querySelectorAll('.nav-link-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      const isArrowClick = e.target.classList.contains('nav-arrow');
      const hasLink = this.getAttribute('href') && this.getAttribute('href') !== '#' && this.getAttribute('href') !== 'javascript:void(0)';

      // If clicking the arrow, or if there's no link, toggle the menu
      if (isArrowClick || !hasLink) {
        e.preventDefault();
        e.stopPropagation();
        const navItem = this.parentElement;
        const wasExpanded = navItem.classList.contains('expanded');
        const hasActiveChild = navItem.classList.contains('has-active-child');
        
        navItem.classList.toggle('expanded');
        
        // If collapsing and there's an active sub-item, move highlight to parent
        if (wasExpanded && !navItem.classList.contains('expanded') && hasActiveChild) {
          // Make parent temporarily active for highlight
          navItem.classList.add('active');
          setTimeout(() => {
            updateHighlightPosition();
          }, 50);
        } else if (!wasExpanded && navItem.classList.contains('expanded') && hasActiveChild) {
          // Re-expanding, remove parent active and show child
          navItem.classList.remove('active');
          setTimeout(() => {
            updateHighlightPosition();
          }, 400);
        } else {
          setTimeout(updateHighlightPosition, 300);
        }
      }
    });
  });
  
  window.addEventListener('resize', updateHighlightPosition);
}

function setActiveSidebarItem() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const targetFile = (currentPath === '' || currentPath === '/') ? 'chat.html' : currentPath;

  // Reset all active classes first
  document.querySelectorAll('.nav-item, .sub-nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.classList.contains('nav-item')) {
      el.classList.remove('has-active-child');
    }
  });

  // Helper to check if href matches target
  const matchesTarget = (href) => {
    if (!href) return false;
    return href === targetFile || href.endsWith('/' + targetFile);
  };

  // 1. Try to find a matching SUB-NAV item first
  const subNavLinks = document.querySelectorAll('.sub-nav-item a');
  let activeSubItem = null;
  
  for (const link of subNavLinks) {
    if (matchesTarget(link.getAttribute('href'))) {
      const subNavItem = link.closest('.sub-nav-item');
      if (subNavItem) {
        subNavItem.classList.add('active');
        activeSubItem = subNavItem;
        
        // Expand parent and mark it as having active child
        const parentNavItem = subNavItem.closest('.nav-item');
        if (parentNavItem) {
           parentNavItem.classList.add('expanded');
           parentNavItem.classList.add('has-active-child');
        }
        break;
      }
    }
  }

  // 2. If no sub-item matched, check main nav items
  if (!activeSubItem) {
    const mainNavLinks = document.querySelectorAll('.nav-item > a');
    for (const link of mainNavLinks) {
      if (matchesTarget(link.getAttribute('href'))) {
        const navItem = link.parentElement;
        
        if (navItem.classList.contains('has-submenu')) {
           navItem.classList.add('expanded');
           
           // Select first child
           const firstSubItem = navItem.querySelector('.sub-nav-item');
           if (firstSubItem) {
             firstSubItem.classList.add('active');
             navItem.classList.add('has-active-child');
           }
        } else {
           // Normal item (like Playground)
           navItem.classList.add('active');
        }
        break;
      }
    }
  }
  
  updateHighlightPosition();
}

function updateHighlightPosition() {
  const highlight = document.querySelector('.nav-highlight');
  
  // Find active item - prioritize visible sub-nav items, then check for collapsed parent
  let activeItem = null;
  
  // First check if there's a visible sub-nav-item that's active
  const activeSubItem = document.querySelector('.sub-nav-item.active');
  if (activeSubItem) {
    const parentNav = activeSubItem.closest('.nav-item');
    if (parentNav && parentNav.classList.contains('expanded')) {
      // Sub-item is visible, use it
      activeItem = activeSubItem.querySelector('a');
    } else if (parentNav) {
      // Sub-item exists but parent is collapsed, use parent
      activeItem = parentNav.querySelector('> a');
    }
  }
  
  // If no sub-item, check for direct nav-item active
  if (!activeItem) {
    const activeNav = document.querySelector('.nav-item.active > a');
    if (activeNav) {
      activeItem = activeNav;
    }
  }
  
  if (highlight && activeItem) {
    const navRect = document.querySelector('.chat-sidebar-nav').getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    
    const top = itemRect.top - navRect.top;
    const height = itemRect.height;
    
    highlight.style.top = `${top}px`;
    highlight.style.height = `${height}px`;
    highlight.style.opacity = '1';
  } else if (highlight) {
    highlight.style.opacity = '0';
  }
}
