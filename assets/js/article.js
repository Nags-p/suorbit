// ==========================================================================
// SuOrbit Article Page JS
// ==========================================================================

let currentArticle = null;

document.addEventListener('DOMContentLoaded', () => {
  initArticlePage();
  initReadingProgressBar();
});

async function initArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');

  if (!articleId) {
    displayErrorState("No article ID specified.");
    return;
  }

  // Smart Category Resolver from ID Prefix
  // IDs are structured as: article-catprefix-uniquehash
  const idParts = articleId.split('-');
  let categoryKey = 'news'; // Fallback to main news.json

  if (idParts.length >= 2) {
    const prefix = idParts[1].toLowerCase();
    switch (prefix) {
      case 'tec': categoryKey = 'technology'; break;
      case 'ai':  categoryKey = 'ai'; break;
      case 'spa': categoryKey = 'space'; break;
      case 'sci': categoryKey = 'science'; break;
      case 'sta': categoryKey = 'startups'; break;
      case 'bus': categoryKey = 'business'; break;
    }
  }

  // Load from category database, fallback to main database
  let articles = await fetchNewsData(`data/${categoryKey}.json`);
  if (!articles || articles.length === 0) {
    articles = await fetchNewsData('data/news.json');
  }

  if (!articles || articles.length === 0) {
    displayErrorState("Could not retrieve news data storage.");
    return;
  }

  // Search for the article
  currentArticle = articles.find(a => a.id === articleId);

  if (!currentArticle) {
    // If not found in primary file, scan the main news.json file as a final fallback
    if (categoryKey !== 'news') {
      const fallbackArticles = await fetchNewsData('data/news.json');
      if (fallbackArticles) {
        currentArticle = fallbackArticles.find(a => a.id === articleId);
      }
    }
  }

  if (!currentArticle) {
    displayErrorState("The requested article could not be found.");
    return;
  }

  // Render article details
  renderArticle(currentArticle);

  // Load Related Articles
  renderRelatedArticles(articles, currentArticle);
}

function displayErrorState(message) {
  const container = document.getElementById('article-content-wrapper');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 5rem 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>Unable to load article</h2>
        <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 2rem;">${sanitizeHTML(message)}</p>
        <a href="index.html" class="error-btn">Return to Homepage</a>
      </div>
    `;
  }
}

function renderArticle(article) {
  const safeTitle = sanitizeHTML(article.title);
  const safeSource = sanitizeHTML(article.source);
  const safeAuthor = sanitizeHTML(article.author || 'Staff Writer');
  const safeCategory = sanitizeHTML(article.category);
  const formattedDate = formatDate(article.publishedAt);
  const readingTime = sanitizeHTML(article.readingTime || '3 min');

  // Update Page Title
  document.querySelector('title').textContent = `${safeTitle} - SuOrbit`;

  // Set Schema & Breadcrumb nodes if needed, update DOM directly
  document.getElementById('article-category-tag').textContent = safeCategory;
  document.getElementById('article-category-tag').href = `category.html?c=${safeCategory.toLowerCase()}`;
  document.getElementById('article-reading-time').textContent = readingTime;
  document.getElementById('article-headline').textContent = safeTitle;
  document.getElementById('article-author-name').textContent = safeAuthor;
  document.getElementById('article-publish-date').textContent = formattedDate;
  const sourceEl = document.getElementById('article-source-name');
  if (sourceEl) sourceEl.textContent = safeSource;
  
  // Set Image
  const imgEl = document.getElementById('article-hero-image');
  if (imgEl) {
    imgEl.src = article.image;
    imgEl.alt = safeTitle;
  }

  // Set AI Summary
  const summaryEl = document.getElementById('ai-summary-text');
  if (summaryEl) {
    summaryEl.textContent = article.summary || "No automated summary is available for this article.";
  }

  // Set Key Takeaways
  const takeawaysList = document.getElementById('key-takeaways-list');
  if (takeawaysList) {
    if (article.keyTakeaways && article.keyTakeaways.length > 0) {
      takeawaysList.innerHTML = article.keyTakeaways.map(t => `<li>${sanitizeHTML(t)}</li>`).join('');
    } else {
      takeawaysList.innerHTML = `<li>Read the original publication for full context.</li>`;
    }
  }

  // Set Body Content
  const bodyEl = document.getElementById('article-body-content');
  if (bodyEl) {
    // Break content into paragraphs if it has newlines, or synthesize a nice readable flow
    let bodyHTML = '';
    const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 0) {
      bodyHTML = paragraphs.map(p => `<p>${sanitizeHTML(p)}</p>`).join('');
    } else {
      bodyHTML = `<p>${sanitizeHTML(article.content)}</p>`;
    }

    // Add extra mock paragraph for visual length since NewsAPI truncates
    if (article.originalUrl.includes('example.com') === false) {
      bodyHTML += `
        <p>This article represents a developing story in the tech landscape. As companies accelerate integrations and investments, issues surrounding ethics, security audits, and global standards continue to provoke significant debate among policy groups, academic institutions, and industry engineers.</p>
        <p>For deep technical specifications, design details, and quotes from leadership, you can review the original publication by clicking the source reference block below.</p>
      `;
    }

    bodyEl.innerHTML = bodyHTML;
  }

  // Set Original Link
  const sourceText = document.getElementById('original-source-name-link');
  const sourceBtn = document.getElementById('original-source-button');
  if (sourceText) sourceText.textContent = safeSource;
  if (sourceBtn) {
    sourceBtn.href = article.originalUrl;
    sourceBtn.target = '_blank';
    sourceBtn.rel = 'noopener noreferrer';
  }

  // Configure Sharing Buttons
  setupShareButtons(article);
}

function setupShareButtons(article) {
  const currentUrl = window.location.href;
  const articleTitle = article.title;

  const twBtn = document.getElementById('share-twitter');
  const liBtn = document.getElementById('share-linkedin');
  const cpBtn = document.getElementById('share-copy');

  if (twBtn) {
    twBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(currentUrl)}`;
    twBtn.target = '_blank';
  }

  if (liBtn) {
    liBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    liBtn.target = '_blank';
  }

  if (cpBtn) {
    cpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(currentUrl).then(() => {
        // Change copy icon or display feedback text
        const originalHTML = cpBtn.innerHTML;
        cpBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
        cpBtn.style.borderColor = 'var(--primary)';
        cpBtn.style.color = 'var(--primary)';
        
        setTimeout(() => {
          cpBtn.innerHTML = originalHTML;
          cpBtn.style.borderColor = '';
          cpBtn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    });
  }
}

function renderRelatedArticles(articles, currentArticle) {
  const gridContainer = document.getElementById('related-articles-grid');
  if (!gridContainer) return;

  // Filter articles from the same category, excluding the current article
  const related = articles
    .filter(a => a.category.toLowerCase() === currentArticle.category.toLowerCase() && a.id !== currentArticle.id)
    .slice(0, 3);

  if (related.length === 0) {
    // If no related articles in same category, just take other recent articles
    const otherRecent = articles.filter(a => a.id !== currentArticle.id).slice(0, 3);
    gridContainer.innerHTML = otherRecent.map(createArticleCardHTML).join('');
  } else {
    gridContainer.innerHTML = related.map(createArticleCardHTML).join('');
  }
}

function initReadingProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    } else {
      progressBar.style.width = '0%';
    }
  });
}
