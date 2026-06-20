// ==========================================================================
// SuOrbit Global JS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadHeaderAndFooter();
});

// Helper: Sanitize string to prevent XSS
function sanitizeHTML(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Helper: Format relative or full dates
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    // Check if it's already YYYY-MM-DD or standard ISO
    const datePart = dateStr.split(' ')[0];
    const dateObj = new Date(datePart);
    if (isNaN(dateObj.getTime())) return dateStr;
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Helper: Fetch JSON helper
async function fetchNewsData(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${filePath}:`, error);
    return null;
  }
}

// ==========================================================================
// Theme Controller (Dark / Light Mode)
// ==========================================================================
function initTheme() {
  const currentTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(currentTheme);
}

function bindThemeToggle() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  console.log('[Theme Toggle Init] Toggles found:', themeToggleBtns.length);
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Update theme icons on all buttons
  const themeToggleIcons = document.querySelectorAll('.theme-toggle-icon');
  themeToggleIcons.forEach(icon => {
    if (theme === 'dark') {
      // Show sun icon in dark mode
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    } else {
      // Show moon icon in light mode
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
  });
}

// ==========================================================================
// Sticky Header Scroll Event
// ==========================================================================
function initStickyHeader() {
  const header = document.querySelector('.header-wrapper');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ==========================================================================
// Mobile Nav Drawer Toggle
// ==========================================================================
function initMobileMenu() {
  const openBtn = document.querySelector('.mobile-menu-toggle');
  const closeBtn = document.querySelector('.mobile-menu-close');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');

  if (!openBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

// ==========================================================================
// Search Bar Dropdown Overlay
// ==========================================================================
function initSearchOverlay() {
  const searchToggles = document.querySelectorAll('.search-toggle-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('.search-input-field');
  const searchForm = document.querySelector('.search-form-element');

  console.log('[Search Overlay Init] Found:', {
    toggles: searchToggles.length,
    overlay: !!searchOverlay,
    input: !!searchInput,
    form: !!searchForm
  });

  if (!searchOverlay || !searchInput) return;

  searchToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchOverlay.classList.toggle('open');
      if (searchOverlay.classList.contains('open')) {
        searchInput.focus();
      }
    });
  });

  // Close search overlay on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      searchOverlay.classList.remove('open');
    }
  });

  // Handle Search Submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
}

// ==========================================================================
// Breaking News Ticker Loader
// ==========================================================================
async function initBreakingNewsTicker() {
  const tickerScroll = document.querySelector('.ticker-scroll');
  if (!tickerScroll) return;

  const data = await fetchNewsData('data/news.json');
  if (!data || data.length === 0) {
    tickerScroll.innerHTML = '<span class="ticker-item">No active news items found.</span>';
    return;
  }

  // Display the top 8 latest headlines
  const tickerItems = data.slice(0, 8).map(article => {
    return `<a href="article.html?id=${article.id}" class="ticker-item">${sanitizeHTML(article.title)}</a>`;
  }).join('');

  tickerScroll.innerHTML = tickerItems;
}

// ==========================================================================
// Base Card Component Generator
// ==========================================================================
function createArticleCardHTML(article) {
  const safeTitle = sanitizeHTML(article.title);
  const safeSummary = sanitizeHTML(article.summary || article.content.substring(0, 150) + "...");
  const safeSource = sanitizeHTML(article.source);
  const formattedDate = formatDate(article.publishedAt);
  const safeCategory = sanitizeHTML(article.category);
  const readingTime = sanitizeHTML(article.readingTime || '3 min');

  return `
    <article class="news-card">
      <div class="card-img-wrapper">
        <span class="card-badge">${safeCategory}</span>
        <a href="article.html?id=${article.id}">
          <img src="${article.image}" alt="${safeTitle}" loading="lazy" width="400" height="250">
        </a>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span>${safeSource}</span>
          <span class="meta-dot"></span>
          <span>${readingTime}</span>
        </div>
        <h3 class="card-title">
          <a href="article.html?id=${article.id}">${safeTitle}</a>
        </h3>
        <p class="card-summary">${safeSummary}</p>
        <div class="card-footer">
          <span class="card-meta">${formattedDate}</span>
          <a href="article.html?id=${article.id}" class="read-more-btn">
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

// ==========================================================================
// Dynamic Components Loader (Header & Footer)
// ==========================================================================
async function loadHeaderAndFooter() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    try {
      const response = await fetch('components/header.html');
      if (response.ok) {
        headerPlaceholder.innerHTML = await response.text();
        
        // Initialize header-related functionalities once DOM elements exist
        bindThemeToggle();
        initStickyHeader();
        initMobileMenu();
        initSearchOverlay();
        initBreakingNewsTicker();
        highlightActiveLinks();
      } else {
        console.error("Failed to load header component: HTTP status " + response.status);
      }
    } catch (e) {
      console.error("Error loading header component:", e);
    }
  }

  if (footerPlaceholder) {
    try {
      const response = await fetch('components/footer.html');
      if (response.ok) {
        footerPlaceholder.innerHTML = await response.text();
      } else {
        console.error("Failed to load footer component: HTTP status " + response.status);
      }
    } catch (e) {
      console.error("Error loading footer component:", e);
    }
  }
}

// Dynamically highlight navigation links based on current path and parameters
function highlightActiveLinks() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const params = new URLSearchParams(window.location.search);
  const category = params.get('c');

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Parse the link's target path and parameters
    let linkPath = href;
    let linkCategory = null;

    if (href.includes('?')) {
      const parts = href.split('?');
      linkPath = parts[0];
      const linkParams = new URLSearchParams(parts[1]);
      linkCategory = linkParams.get('c');
    }

    // Clean paths
    linkPath = linkPath.split('/').pop() || 'index.html';

    if (linkPath === currentPath) {
      if (linkCategory) {
        if (linkCategory === category) {
          link.classList.add('active');
        }
      } else if (!category) {
        link.classList.add('active');
      }
    }
  });
}
