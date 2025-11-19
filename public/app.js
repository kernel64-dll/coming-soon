// public/app.js
const newsGridEl = document.getElementById('news-grid');
const leadEl = document.getElementById('lead-article');
const feedsFilterEl = document.getElementById('feed-filters');
const sourcesListEl = document.getElementById('sources-list');
const lastUpdatedEl = document.getElementById('last-updated');
const statusMessageEl = document.getElementById('status-message');
const yearEl = document.getElementById('year');

yearEl.textContent = new Date().getFullYear();

let currentSourceId = 'all';
let feeds = [];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

function setStatus(message) {
  statusMessageEl.textContent = message || '';
}

function setNavActive(sourceId) {
  document
    .querySelectorAll('.nav-btn')
    .forEach((btn) => btn.classList.remove('nav-btn-active'));

  const selector =
    sourceId === 'all'
      ? '.nav-btn[data-source="all"]'
      : `.nav-btn[data-source="${sourceId}"]`;

  const activeBtn = document.querySelector(selector);
  if (activeBtn) activeBtn.classList.add('nav-btn-active');
}

async function loadFeeds() {
  try {
    const res = await fetch('/api/feeds');
    feeds = await res.json();

    // Render filter buttons
    feedsFilterEl.innerHTML = '';
    feeds.forEach((feed) => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.textContent = feed.name;
      btn.dataset.source = feed.id;
      btn.addEventListener('click', () => {
        currentSourceId = feed.id;
        setNavActive(feed.id);
        loadNews(feed.id);
      });
      feedsFilterEl.appendChild(btn);
    });

    // Render sources list in sidebar
    sourcesListEl.innerHTML = '';
    feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.textContent = feed.name;
      sourcesListEl.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load feeds', err);
    setStatus('Failed to load sources.');
  }
}

function renderLeadArticle(articles) {
  if (!articles || !articles.length) {
    leadEl.classList.add('empty');
    leadEl.innerHTML = '';
    return;
  }

  const lead = articles[0];
  leadEl.classList.remove('empty');
  leadEl.innerHTML = `
    <div class="lead-source">${lead.source}</div>
    <h3 class="lead-title">
      <a href="${lead.link}" target="_blank" rel="noopener noreferrer">
        ${lead.title}
      </a>
    </h3>
    <div class="lead-meta">
      ${lead.publishedAt ? formatDate(lead.publishedAt) : 'Just in'}
    </div>
    <p class="lead-description">
      ${lead.description ? lead.description : ''}
    </p>
  `;
}

function renderArticles(articles) {
  newsGridEl.innerHTML = '';

  if (!articles || !articles.length) {
    setStatus('No articles available at the moment.');
    return;
  }

  // Lead article handled separately; remaining go to grid
  const rest = articles.slice(1);

  rest.forEach((article) => {
    const card = document.createElement('article');
    card.className = 'news-card';

    card.innerHTML = `
      <span class="news-source-pill">${article.source}</span>
      <h4 class="news-title">
        <a href="${article.link}" target="_blank" rel="noopener noreferrer">
          ${article.title}
        </a>
      </h4>
      <div class="news-meta">
        ${article.publishedAt ? formatDate(article.publishedAt) : 'Just now'}
      </div>
      <p class="news-description">
        ${article.description ? article.description : ''}
      </p>
    `;

    newsGridEl.appendChild(card);
  });
}

function updateLastUpdated(timestamp) {
  if (!timestamp) return;
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return;
  lastUpdatedEl.textContent = `Last updated: ${d.toLocaleTimeString()}`;
}

async function loadNews(sourceId = 'all') {
  try {
    setStatus('Loading news…');

    const url =
      sourceId && sourceId !== 'all'
        ? `/api/news?source=${encodeURIComponent(sourceId)}`
        : '/api/news';

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const articles = data.articles || [];

    renderLeadArticle(articles);
    renderArticles(articles);
    updateLastUpdated(data.lastUpdated);
    setStatus('');
  } catch (err) {
    console.error('Failed to load news', err);
    setStatus('Failed to load news. Please try again later.');
  }
}

function initNav() {
  const allBtn = document.querySelector('.nav-btn[data-source="all"]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      currentSourceId = 'all';
      setNavActive('all');
      loadNews('all');
    });
  }
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadFeeds().then(() => {
    loadNews('all');
    // auto-refresh every 3 minutes
    setInterval(() => loadNews(currentSourceId), 3 * 60 * 1000);
  });
});
