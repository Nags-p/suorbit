// ==========================================================================
// SuOrbit Search Results JS
// ==========================================================================

const SEARCH_PAGE_SIZE = 9;
let allNewsArticles = [];
let filteredArticles = [];
let currentSearchPage = 1;
let searchQuery = '';
let selectedCategory = '';
let selectedSort = 'newest';

document.addEventListener('DOMContentLoaded', () => {
  initSearchPage();
});

async function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  searchQuery = params.get('q') || '';
  selectedCategory = params.get('c') || '';
  selectedSort = params.get('sort') || 'newest';

  // Sync Input Elements
  const searchInput = document.getElementById('search-page-input');
  const categoryFilter = document.getElementById('filter-category');
  const sortFilter = document.getElementById('filter-sort');

  if (searchInput) searchInput.value = searchQuery;
  if (categoryFilter) categoryFilter.value = selectedCategory;
  if (sortFilter) sortFilter.value = selectedSort;

  // Load master news file
  const data = await fetchNewsData('data/news.json');
  if (!data || data.length === 0) {
    displaySearchErrorState("Unable to retrieve news database for index querying.");
    return;
  }

  allNewsArticles = data;

  // Execute Search
  performSearch();

  // Bind Events for Interactive Filters
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      updateSearchParams();
      performSearch();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      selectedSort = e.target.value;
      updateSearchParams();
      performSearch();
    });
  }

  const searchForm = document.getElementById('search-page-form');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchQuery = searchInput.value.trim();
      updateSearchParams();
      performSearch();
    });
  }
}

function updateSearchParams() {
  const newUrl = new URL(window.location.href);
  if (searchQuery) newUrl.searchParams.set('q', searchQuery);
  else newUrl.searchParams.delete('q');

  if (selectedCategory) newUrl.searchParams.set('c', selectedCategory);
  else newUrl.searchParams.delete('c');

  if (selectedSort !== 'newest') newUrl.searchParams.set('sort', selectedSort);
  else newUrl.searchParams.delete('sort');

  window.history.pushState({}, '', newUrl.toString());
}

function displaySearchErrorState(msg) {
  const grid = document.getElementById('search-results-grid');
  if (grid) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem 0;"><h3>Search Error</h3><p>${sanitizeHTML(msg)}</p></div>`;
  }
}

function performSearch() {
  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  // 1. Filter articles by search query
  filteredArticles = allNewsArticles.filter(article => {
    // If no query, match all (allows exploring files with filters)
    if (queryWords.length === 0) return true;

    const titleText = (article.title || '').toLowerCase();
    const summaryText = (article.summary || '').toLowerCase();
    const contentText = (article.content || '').toLowerCase();
    const tagsText = (article.tags || []).join(' ').toLowerCase();

    // Must match ALL query keywords (AND logic for higher precision)
    return queryWords.every(word => {
      return titleText.includes(word) || 
             summaryText.includes(word) || 
             contentText.includes(word) || 
             tagsText.includes(word);
    });
  });

  // 2. Filter by Category
  if (selectedCategory) {
    filteredArticles = filteredArticles.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  // 3. Sort articles
  if (selectedSort === 'newest') {
    filteredArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  } else if (selectedSort === 'oldest') {
    filteredArticles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
  } else if (selectedSort === 'alphabetical') {
    filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
  }

  // 4. Update Header Result count
  const countEl = document.getElementById('results-count-text');
  if (countEl) {
    if (searchQuery) {
      countEl.innerHTML = `Found ${filteredArticles.length} results for "<span style="color: var(--primary);">${sanitizeHTML(searchQuery)}</span>"`;
    } else {
      countEl.innerHTML = `Showing ${filteredArticles.length} articles matching filters`;
    }
  }

  // 5. Render Grid
  currentSearchPage = 1;
  renderSearchResultsGrid();
}

function renderSearchResultsGrid() {
  const gridContainer = document.getElementById('search-results-grid');
  const paginationContainer = document.getElementById('search-pagination');
  if (!gridContainer) return;

  if (filteredArticles.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <h3>No results matched your search</h3>
        <p style="color: var(--text-secondary); max-width: 450px; margin: 0.5rem auto;">Try checking your spelling, simplifying keywords, or adjusting your category filters.</p>
      </div>
    `;
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  const totalPages = Math.ceil(filteredArticles.length / SEARCH_PAGE_SIZE);
  const startIndex = (currentSearchPage - 1) * SEARCH_PAGE_SIZE;
  const endIndex = startIndex + SEARCH_PAGE_SIZE;
  const pageArticles = filteredArticles.slice(startIndex, endIndex);

  // Render cards with query highlighting
  gridContainer.innerHTML = pageArticles.map(article => {
    // Generate base card HTML
    let cardHTML = createArticleCardHTML(article);
    
    // Highlight matched words if searchQuery exists
    if (searchQuery.trim().length > 0) {
      const words = searchQuery.trim().split(/\s+/).filter(w => w.length > 1);
      
      words.forEach(word => {
        // We will perform highlighting by wrapping terms in <mark>.
        // To be safe, we only replace text contents within titles and descriptions.
        // Doing a simple regex replace on the entire HTML chunk can break tags.
        // A safer client-side highlighting mechanism:
        // We compile regex that looks for the word, but avoids replacing HTML tag names/attributes.
        // Let's create an anchored replace, but since this is mock highlight, we can use a safe regex that checks boundary:
        try {
          const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          // Match word outside HTML tags
          const regex = new RegExp(`(?![^<>]*>)(${escapedWord})`, 'gi');
          cardHTML = cardHTML.replace(regex, '<mark>$1</mark>');
        } catch(e) {
          // ignore
        }
      });
    }
    
    return cardHTML;
  }).join('');

  // Render pagination
  if (paginationContainer) {
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    let pagHTML = `
      <button class="page-btn" id="search-prev-btn" ${currentSearchPage === 1 ? 'disabled' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      pagHTML += `
        <button class="page-btn ${currentSearchPage === i ? 'active' : ''}" data-search-page="${i}">
          ${i}
        </button>
      `;
    }

    pagHTML += `
      <button class="page-btn" id="search-next-btn" ${currentSearchPage === totalPages ? 'disabled' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    `;

    paginationContainer.innerHTML = pagHTML;

    // Attach click events
    paginationContainer.querySelectorAll('[data-search-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentSearchPage = parseInt(e.target.getAttribute('data-search-page'));
        renderSearchResultsGrid();
        gridContainer.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const prevBtn = document.getElementById('search-prev-btn');
    const nextBtn = document.getElementById('search-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentSearchPage > 1) {
          currentSearchPage--;
          renderSearchResultsGrid();
          gridContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentSearchPage < totalPages) {
          currentSearchPage++;
          renderSearchResultsGrid();
          gridContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}
