/**
 * Main Application Logic
 * Handles routing, rendering, language/theme toggles, and UI interactions.
 */

(function () {
  'use strict';

  // ==========================================
  // DOM References
  // ==========================================

  var main = document.getElementById('main');
  var langToggle = document.getElementById('langToggle');
  var themeToggle = document.getElementById('themeToggle');
  var backToTop = document.getElementById('backToTop');
  var langText = langToggle.querySelector('.lang-text');

  // ==========================================
  // Theme Management
  // ==========================================

  function getTheme() {
    return localStorage.getItem('blog-theme') || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blog-theme', theme);
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
  }

  // Initialize theme
  applyTheme(getTheme());

  themeToggle.addEventListener('click', toggleTheme);

  // ==========================================
  // Language Management
  // ==========================================

  function updateLangUI() {
    var lang = getLang();
    langText.textContent = lang === 'zh' ? 'EN' : '中';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // Update all elements with data-i18n attribute
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    }
  }

  function toggleLang() {
    var current = getLang();
    var next = current === 'zh' ? 'en' : 'zh';
    setLang(next);
    updateLangUI();
    // Re-render current page with new language
    handleRoute();
  }

  langToggle.addEventListener('click', toggleLang);

  // ==========================================
  // Utility Functions
  // ==========================================

  /** Estimate reading time based on character count */
  function estimateReadingTime(text) {
    // Strip HTML tags for character count
    var plain = text.replace(/<[^>]*>/g, '');
    // Average Chinese reading: ~400 chars/min; English: ~200 words/min
    // Simplified: ~500 chars per minute for mixed content
    var chars = plain.length;
    var minutes = Math.max(1, Math.round(chars / 500));
    return minutes;
  }

  /** Format date as locale string */
  function formatDate(dateStr) {
    var lang = getLang();
    var d = new Date(dateStr);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', options);
  }

  /** Get localized value from a bilingual field */
  function localized(field) {
    var lang = getLang();
    return field[lang] || field['en'] || '';
  }

  // ==========================================
  // Page Renderers
  // ==========================================

  function renderBlogList() {
    var html = '';

    html += '<h1 class="page-title">' + t('siteTitle') + '</h1>';
    html += '<p class="page-subtitle">' + t('blogSubtitle') + '</p>';

    if (posts.length === 0) {
      html += '<div class="empty-state">';
      html += '<div class="empty-state-icon">📝</div>';
      html += '<div class="empty-state-title">' + t('noPosts') + '</div>';
      html += '<p>' + t('noPostsDesc') + '</p>';
      html += '</div>';
    } else {
      html += '<div class="post-list">';
      for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        var title = localized(post.title);
        var summary = localized(post.summary);
        var date = formatDate(post.date);
        var readingTime = estimateReadingTime(localized(post.content));
        var category = localized(post.category);
        var slug = post.slug;

        html += '<article class="post-card" data-slug="' + slug + '">';
        html += '<time class="post-card-date">' + date + ' · ' + category + '</time>';
        html += '<h2 class="post-card-title">' + title + '</h2>';
        html += '<p class="post-card-summary">' + summary + '</p>';
        html += '<div class="post-card-meta">';
        for (var j = 0; j < post.tags.length; j++) {
          html += '<span class="post-card-tag">' + localized(post.tags[j]) + '</span>';
        }
        html += '<span class="post-card-reading-time">' + t('readingTime', { n: readingTime }) + '</span>';
        html += '</div>';
        html += '</article>';
      }
      html += '</div>';
    }

    return html;
  }

  function renderPostDetail(slug) {
    var post = null;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].slug === slug) {
        post = posts[i];
        break;
      }
    }

    if (!post) {
      return renderNotFound();
    }

    var title = localized(post.title);
    var content = localized(post.content);
    var date = formatDate(post.date);
    var readingTime = estimateReadingTime(content);
    var category = localized(post.category);

    var html = '';
    html += '<article class="post-detail">';
    html += '<a href="#/" class="back-link">' + t('backToBlog') + '</a>';
    html += '<header class="post-detail-header">';
    html += '<time class="post-detail-date">' + t('postedOn') + ' ' + date + ' · ' + category + ' · ' + t('readingTime', { n: readingTime }) + '</time>';
    html += '<h1 class="post-detail-title">' + title + '</h1>';
    html += '<div class="post-detail-tags">';
    for (var j = 0; j < post.tags.length; j++) {
      html += '<span class="post-card-tag">' + localized(post.tags[j]) + '</span>';
    }
    html += '</div>';
    html += '<hr class="post-detail-divider">';
    html += '</header>';
    html += '<div class="post-detail-body">' + content + '</div>';
    html += '</article>';

    return html;
  }

  function renderAbout() {
    var lang = getLang();
    var html = '';
    html += '<div class="about-page">';
    html += '<h1 class="page-title">' + t('aboutTitle') + '</h1>';
    html += '<div class="about-card">';
    html += '<div class="about-avatar">' + (lang === 'zh' ? '博' : 'A') + '</div>';
    html += '<h2 class="about-name">' + t('aboutName') + '</h2>';
    html += '<p class="about-bio">' + t('aboutBio') + '</p>';
    html += '<p style="color:var(--text-secondary);margin-bottom:16px;font-weight:500;">' + t('aboutContact') + '</p>';
    html += '<div class="about-links">';
    html += '<a href="mailto:hello@example.com" class="about-link">✉ ' + t('emailLabel') + '</a>';
    html += '<a href="https://github.com" target="_blank" rel="noopener" class="about-link">⌘ ' + t('githubLabel') + '</a>';
    html += '<a href="https://twitter.com" target="_blank" rel="noopener" class="about-link">𝕏 ' + t('twitterLabel') + '</a>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderNotFound() {
    var html = '';
    html += '<div class="empty-state">';
    html += '<div class="empty-state-icon">🔍</div>';
    html += '<div class="empty-state-title">' + t('pageNotFound') + '</div>';
    html += '<p>' + t('pageNotFoundDesc') + '</p>';
    html += '<p style="margin-top:16px;"><a href="#/">' + t('backToBlog') + '</a></p>';
    html += '</div>';
    return html;
  }

  // ==========================================
  // Router
  // ==========================================

  function getRoute() {
    var hash = window.location.hash || '#/';
    // Remove leading # and split
    var path = hash.replace(/^#/, '') || '/';
    // Match: /, /post/slug, /about
    var match = path.match(/^\/(post\/([^/]+)|about)?$/);
    return {
      path: path,
      page: path === '/about' ? 'about' : (path.indexOf('/post/') === 0 ? 'post' : 'home'),
      slug: path.indexOf('/post/') === 0 ? path.replace('/post/', '') : null,
    };
  }

  function handleRoute() {
    var route = getRoute();
    var html = '';

    switch (route.page) {
      case 'home':
        html = renderBlogList();
        break;
      case 'post':
        html = renderPostDetail(route.slug);
        break;
      case 'about':
        html = renderAbout();
        break;
      default:
        html = renderNotFound();
    }

    main.innerHTML = html;
    main.classList.add('page-enter');
    setTimeout(function () {
      main.classList.remove('page-enter');
    }, 350);

    // Update active nav link
    updateActiveNav(route.page);
    updateLangUI();

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Attach click handlers to post cards (for the home page)
    attachPostCardListeners();
  }

  function updateActiveNav(page) {
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove('active');
    }
    var selector = page === 'about' ? 'a[href="#/about"]' : 'a[href="#/"]';
    var activeLink = document.querySelector(selector);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  function attachPostCardListeners() {
    var cards = document.querySelectorAll('.post-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var slug = this.getAttribute('data-slug');
        if (slug) {
          window.location.hash = '#/post/' + slug;
        }
      });
    }
  }

  // ==========================================
  // Back to Top Button
  // ==========================================

  function handleScroll() {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ==========================================
  // Hash Change Listener
  // ==========================================

  window.addEventListener('hashchange', handleRoute);

  // ==========================================
  // Initial Render
  // ==========================================

  handleRoute();
})();
