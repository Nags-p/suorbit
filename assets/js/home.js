// ==========================================================================
// SuOrbit Homepage JS
// ==========================================================================

const GRID_PAGE_SIZE = 6;
let latestArticles = [];
let currentGridPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadHomepageData();
  initNewsletterForm();
});

async function loadHomepageData() {
  const articles = await fetchNewsData('data/news.json');
  if (!articles || articles.length === 0) {
    displayErrorState();
    return;
  }

  latestArticles = articles;

  // 1. Render Hero Feature (Article 0)
  renderHeroFeature(articles[0]);

  // 2. Render Trending News (Articles 1-4)
  renderTrendingSidebar(articles.slice(1, 5));

  // 3. Render Latest News Grid (Articles 5 onwards)
  renderLatestGrid();

  // 4. Render Category Previews on Home
  renderCategoryPreviews(articles);
}

function displayErrorState() {
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGrid) {
    heroGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
        <h2>Failed to load news</h2>
        <p>There was an error loading the news files. Please run the fetch script or check configuration.</p>
      </div>
    `;
  }
}

// Render Hero Section
function renderHeroFeature(article) {
  const featuredWrapper = document.getElementById('featured-story-wrapper');
  if (!featuredWrapper || !article) return;

  const safeTitle = sanitizeHTML(article.title);
  const safeSummary = sanitizeHTML(article.summary || article.content.substring(0, 200) + '...');
  const safeCategory = sanitizeHTML(article.category);
  const safeSource = sanitizeHTML(article.source);
  const formattedDate = formatDate(article.publishedAt);
  const readingTime = sanitizeHTML(article.readingTime || '3 min');

  featuredWrapper.innerHTML = `
    <div class="hero-featured">
      <div class="featured-img-wrapper">
        <span class="card-badge">${safeCategory}</span>
        <a href="article.html?id=${article.id}">
          <img src="${article.image}" alt="${safeTitle}" width="800" height="450">
        </a>
      </div>
      <div class="featured-content">
        <div class="featured-meta">
          <span>${safeSource}</span>
          <span class="meta-dot"></span>
          <span>${formattedDate}</span>
          <span class="meta-dot"></span>
          <span>${readingTime}</span>
        </div>
        <h2 class="featured-title">
          <a href="article.html?id=${article.id}">${safeTitle}</a>
        </h2>
        <p class="featured-summary">${safeSummary}</p>
        <div style="margin-top: 0.5rem;">
          <a href="article.html?id=${article.id}" class="read-more-btn" style="font-size: 0.95rem;">
            Read Full Article
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

// Render Trending Sidebar
function renderTrendingSidebar(articles) {
  const trendingList = document.getElementById('trending-list-wrapper');
  if (!trendingList) return;

  if (articles.length === 0) {
    trendingList.innerHTML = '<p>No trending items available.</p>';
    return;
  }

  const listHTML = articles.map((article, index) => {
    const safeTitle = sanitizeHTML(article.title);
    const safeSource = sanitizeHTML(article.source);
    const formattedDate = formatDate(article.publishedAt);
    const numStr = String(index + 1).padStart(2, '0');

    return `
      <div class="trending-item">
        <span class="trending-number">${numStr}</span>
        <div class="trending-item-content">
          <h4 class="trending-item-title">
            <a href="article.html?id=${article.id}">${safeTitle}</a>
          </h4>
          <div class="trending-item-meta">
            <span>${safeSource}</span>
            <span>•</span>
            <span>${formattedDate}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  trendingList.innerHTML = listHTML;
}

// Render Latest News Grid with Pagination
function renderLatestGrid() {
  const gridContainer = document.getElementById('latest-news-grid');
  const paginationContainer = document.getElementById('grid-pagination');
  if (!gridContainer) return;

  // We slice starting from index 5 to keep the Hero & Trending unique
  const gridArticles = latestArticles.slice(5);

  if (gridArticles.length === 0) {
    gridContainer.innerHTML = '<p>No additional articles found.</p>';
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  const totalPages = Math.ceil(gridArticles.length / GRID_PAGE_SIZE);
  const startIndex = (currentGridPage - 1) * GRID_PAGE_SIZE;
  const endIndex = startIndex + GRID_PAGE_SIZE;
  const pageArticles = gridArticles.slice(startIndex, endIndex);

  // Render cards
  gridContainer.innerHTML = pageArticles.map(createArticleCardHTML).join('');

  // Render pagination buttons
  if (paginationContainer) {
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }
    
    paginationContainer.style.display = 'flex';
    let pagHTML = `
      <button class="page-btn" id="prev-page-btn" ${currentGridPage === 1 ? 'disabled' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      pagHTML += `
        <button class="page-btn ${currentGridPage === i ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    pagHTML += `
      <button class="page-btn" id="next-page-btn" ${currentGridPage === totalPages ? 'disabled' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    `;

    paginationContainer.innerHTML = pagHTML;

    // Attach event listeners
    paginationContainer.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentGridPage = parseInt(e.target.getAttribute('data-page'));
        renderLatestGrid();
        // Scroll to grid top
        gridContainer.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentGridPage > 1) {
          currentGridPage--;
          renderLatestGrid();
          gridContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentGridPage < totalPages) {
          currentGridPage++;
          renderLatestGrid();
          gridContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}

// Render Category Preview Blocks on Home Page
function renderCategoryPreviews(articles) {
  const categories = ['Technology', 'AI', 'Space', 'Science', 'Startups'];
  
  categories.forEach(cat => {
    const elementId = `category-preview-${cat.toLowerCase()}`;
    const container = document.getElementById(elementId);
    if (!container) return;

    // Filter top 3 articles for this category
    const catArticles = articles.filter(a => a.category.toLowerCase() === cat.toLowerCase()).slice(0, 3);
    
    if (catArticles.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No articles in ${cat} yet.</p>`;
      return;
    }

    container.innerHTML = catArticles.map(createArticleCardHTML).join('');
  });
}

// Initialize Newsletter form submit handler
function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const email = input ? input.value.trim() : '';

      if (email) {
        // Display nice UI confirmation
        const card = form.closest('.newsletter-card');
        if (card) {
          card.innerHTML = `
            <div style="padding: 2rem 0; animation: fadeIn 0.5s ease;">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <h3 class="newsletter-title" style="font-size: 1.75rem;">Welcome to the Orbit!</h3>
              <p class="newsletter-desc">You have successfully subscribed with <strong>${sanitizeHTML(email)}</strong>. Prepare to receive tech, space, and AI news simplified weekly.</p>
            </div>
          `;
        }
      }
    });
  });
}
