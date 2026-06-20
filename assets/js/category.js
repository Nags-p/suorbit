// ==========================================================================
// SuOrbit Category Page JS
// ==========================================================================

const CAT_PAGE_SIZE = 9;
let categoryArticles = [];
let currentCategoryPage = 1;
let currentCategoryKey = 'technology';

const CATEGORY_META = {
  'technology': {
    title: 'Technology',
    tagline: 'The bleeding edge of hardware, infrastructure, computing, and cybersecurity.'
  },
  'ai': {
    title: 'Artificial Intelligence',
    tagline: 'Deep neural networks, LLM breakthroughs, autonomous software agents, and synthetic reasoning.'
  },
  'space': {
    title: 'Space Exploration',
    tagline: 'Astrobiology discoveries, lunar rocket trials, orbital refueling, and exoplanet observations.'
  },
  'science': {
    title: 'Science & Research',
    tagline: 'Commercial fusion grid testing, CRISPR therapies, breakthroughs in material science, and physics.'
  },
  'startups': {
    title: 'Startups & Ventures',
    tagline: 'Following solo SaaS builders, venture capital flows, climate-tech, and robotics platforms.'
  },
  'business': {
    title: 'Business & Finance',
    tagline: 'Monitored stock spikes, antitrust regulatory panels, corporate AI strategies, and digital tax policy.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Parse URL Parameters
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('c') || 'technology';
  currentCategoryKey = catParam.toLowerCase().trim();

  // Highlight active link in header nav
  syncNavHighlights();

  // Load category meta details
  loadCategoryMeta();

  // Fetch and display articles
  loadCategoryData();
});

function syncNavHighlights() {
  const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
  links.forEach(link => {
    try {
      const url = new URL(link.href);
      const linkCat = url.searchParams.get('c');
      if (linkCat && linkCat.toLowerCase() === currentCategoryKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    } catch(e) {
      // ignore
    }
  });
}

function loadCategoryMeta() {
  const meta = CATEGORY_META[currentCategoryKey] || CATEGORY_META['technology'];
  
  const pageTitle = document.getElementById('category-page-title');
  const pageTagline = document.getElementById('category-page-tagline');
  const docTitle = document.querySelector('title');

  if (pageTitle) pageTitle.textContent = meta.title;
  if (pageTagline) pageTagline.textContent = meta.tagline;
  if (docTitle) docTitle.textContent = `${meta.title} News - SuOrbit`;
}

async function loadCategoryData() {
  const dataPath = `data/${currentCategoryKey}.json`;
  const articles = await fetchNewsData(dataPath);
  
  if (!articles || articles.length === 0) {
    displayEmptyState();
    return;
  }

  categoryArticles = articles;
  renderCategoryGrid();
}

function displayEmptyState() {
  const grid = document.getElementById('category-news-grid');
  const pagination = document.getElementById('category-pagination');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        <h3>No articles found</h3>
        <p style="color: var(--text-secondary); max-width: 400px; margin: 0.5rem auto;">There are no articles populated in the category "${sanitizeHTML(currentCategoryKey)}" yet. Run the news updater script to gather data.</p>
      </div>
    `;
  }
  if (pagination) pagination.style.display = 'none';
}

function renderCategoryGrid() {
  const gridContainer = document.getElementById('category-news-grid');
  const paginationContainer = document.getElementById('category-pagination');
  if (!gridContainer) return;

  const totalPages = Math.ceil(categoryArticles.length / CAT_PAGE_SIZE);
  const startIndex = (currentCategoryPage - 1) * CAT_PAGE_SIZE;
  const endIndex = startIndex + CAT_PAGE_SIZE;
  const pageArticles = categoryArticles.slice(startIndex, endIndex);

  // Render Card HTML Elements
  gridContainer.innerHTML = pageArticles.map(createArticleCardHTML).join('');

  // Render Page buttons
  if (paginationContainer) {
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    let pagHTML = `
      <button class="page-btn" id="cat-prev-btn" ${currentCategoryPage === 1 ? 'disabled' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      pagHTML += `
        <button class="page-btn ${currentCategoryPage === i ? 'active' : ''}" data-cat-page="${i}">
          ${i}
        </button>
      `;
    }

    pagHTML += `
      <button class="page-btn" id="cat-next-btn" ${currentCategoryPage === totalPages ? 'disabled' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    `;

    paginationContainer.innerHTML = pagHTML;

    // Attach click events
    paginationContainer.querySelectorAll('[data-cat-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentCategoryPage = parseInt(e.target.getAttribute('data-cat-page'));
        renderCategoryGrid();
        gridContainer.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const prevBtn = document.getElementById('cat-prev-btn');
    const nextBtn = document.getElementById('cat-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentCategoryPage > 1) {
          currentCategoryPage--;
          renderCategoryGrid();
          gridContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentCategoryPage < totalPages) {
          currentCategoryPage++;
          renderCategoryGrid();
          gridContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}
