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
    return localStorage.getItem('blog-theme') || 'dark';
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

  // ==========================================
  // Page Renderers
  // ==========================================

  function renderBlogList(random) {
    var html = '';
    html += '<h1 class="page-title">' + t('siteTitle') + '</h1>';
    html += '<p class="page-subtitle">' + t('blogSubtitle') + '</p>';
    html += '<div id="blogListContent"><p style="text-align:center;padding:40px;color:var(--text-tertiary);">' + (t('loading') || '...') + '</p></div>';
    return html;
  }

  function loadBlogListContent(random) {
    getPosts().then(function (allPosts) {
      var list = document.getElementById('blogListContent');
      if (!list) return;

      var postsToShow = allPosts;
      if (random && allPosts.length > 1) {
        // Shuffle and take up to 6 random posts
        postsToShow = shuffle(allPosts.slice()).slice(0, 6);
      }

      if (postsToShow.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>' + t('noPosts') + '</p></div>';
      } else {
        list.innerHTML = '<div class="post-list">' + renderPostCards(postsToShow) + '</div>';
        attachPostCardListeners();
      }
    });
  }

  function renderDreamPage(dream) {
    var titles = { sweet: t('sweetDreams'), nightmare: t('nightmares'), weird: t('weirdDreams') };
    var html = '';
    html += '<h1 class="page-title">' + (titles[dream] || dream) + '</h1>';
    html += '<div id="dreamContent"><p style="text-align:center;padding:40px;color:var(--text-tertiary);">' + (t('loading') || '...') + '</p></div>';
    return html;
  }

  function loadDreamContent(dream) {
    getPosts().then(function (allPosts) {
      var container = document.getElementById('dreamContent');
      if (!container) return;

      var categories = {
        sweet: ['美梦', 'Sweet Dreams', 'SweetDreams', 'sweet'],
        nightmare: ['噩梦', 'Nightmares', 'Nightmare', 'nightmare'],
        weird: ['怪梦', 'Weird Dreams', 'WeirdDreams', 'weird'],
      };

      var filtered = [];
      for (var i = 0; i < allPosts.length; i++) {
        var cat = localized(allPosts[i].category);
        if (categories[dream] && categories[dream].indexOf(cat) !== -1) {
          filtered.push(allPosts[i]);
        }
      }

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>' + t('noPosts') + '</p></div>';
      } else {
        container.innerHTML = '<div class="post-list">' + renderPostCards(filtered) + '</div>';
        attachPostCardListeners();
      }
    });
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function renderBlogListOld() {
    var html = '';

    html += '<h1 class="page-title">' + t('siteTitle') + '</h1>';
    html += '<p class="page-subtitle">' + t('blogSubtitle') + '</p>';
    html += '<div id="blogListContent"><p style="text-align:center;padding:40px;color:var(--text-tertiary);">' + (t('loading') || 'Loading...') + '</p></div>';
    return html;
  }

  function renderPostDetail(slug) {
    var html = '';
    html += '<div id="postDetailContent"><p style="text-align:center;padding:60px;color:var(--text-tertiary);">' + (t('loading') || 'Loading...') + '</p></div>';
    loadPostDetailContent(slug);
    return html;
  }

  function loadPostDetailContent(slug) {
    var container = document.getElementById('postDetailContent');
    if (!container) return;

    getPosts().then(function (allPosts) {
      var post = null;
      for (var i = 0; i < allPosts.length; i++) {
        if (allPosts[i].slug === slug) {
          post = allPosts[i];
          break;
        }
      }

      if (!post) {
        container.innerHTML = renderNotFound();
        return;
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
      container.innerHTML = html;
    });
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
    var path = hash.replace(/^#/, '') || '/';

    // Submit post route
    if (path === '/submit') {
      return { path: path, page: 'submit', sub: null, slug: null, dream: null };
    }

    // Admin routes
    if (path.indexOf('/admin') === 0) {
      if (path === '/admin') return { path: path, page: 'admin', sub: 'review', slug: null, dream: null };
      if (path === '/admin/review') return { path: path, page: 'admin', sub: 'review', slug: null, dream: null };
      if (path === '/admin/users') return { path: path, page: 'admin', sub: 'users', slug: null, dream: null };
      if (path === '/admin/posts') return { path: path, page: 'admin', sub: 'posts', slug: null, dream: null };
      if (path === '/admin/new') return { path: path, page: 'admin', sub: 'new', slug: null, dream: null };
      var adminEditMatch = path.match(/^\/admin\/edit\/(.+)/);
      if (adminEditMatch) return { path: path, page: 'admin', sub: 'edit', slug: adminEditMatch[1], dream: null };
    }

    // Dream category pages
    if (path === '/sweet') return { path: path, page: 'dream', sub: null, slug: null, dream: 'sweet' };
    if (path === '/nightmare') return { path: path, page: 'dream', sub: null, slug: null, dream: 'nightmare' };
    if (path === '/weird') return { path: path, page: 'dream', sub: null, slug: null, dream: 'weird' };

    // About page
    if (path === '/about') return { path: path, page: 'about', sub: null, slug: null, dream: null };

    // Post detail
    if (path.indexOf('/post/') === 0) {
      return { path: path, page: 'post', sub: null, slug: path.replace('/post/', ''), dream: null };
    }

    // Home
    return { path: path, page: 'home', sub: null, slug: null, dream: null };
  }

  function handleRoute() {
    var route = getRoute();
    var html = '';

    // Set dream theme
    main.removeAttribute('data-dream');
    if (route.dream) {
      main.setAttribute('data-dream', route.dream);
    }

    // Admin / Submit routes are handled by the Admin module
    if (route.page === 'admin' || route.page === 'submit') {
      if (typeof Admin !== 'undefined') {
        html = Admin.render(route);
      } else {
        html = renderNotFound();
      }
    } else {
      switch (route.page) {
        case 'home':
          html = renderBlogList(true);
          break;
        case 'dream':
          html = renderDreamPage(route.dream);
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
    }

    main.innerHTML = html;
    main.classList.add('page-enter');
    setTimeout(function () {
      main.classList.remove('page-enter');
    }, 350);

    updateActiveNav(route);
    updateLangUI();
    refreshHeaderAuth();

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Attach event handlers and trigger async loading
    if (route.page === 'admin' || route.page === 'submit') {
      if (typeof Admin !== 'undefined') {
        Admin.bindEvents(route);
      }
    } else if (route.page === 'home') {
      loadBlogListContent(true);
    } else if (route.page === 'dream') {
      loadDreamContent(route.dream);
    } else if (route.page === 'post') {
      loadPostDetailContent(route.slug);
    }
  }

  function updateActiveNav(route) {
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove('active');
    }
    if (route.page === 'submit') return;

    var selector = 'a[href="#/"]';
    if (route.page === 'dream' && route.dream) {
      selector = 'a[href="#/' + route.dream + '"]';
    }
    var activeLink = document.querySelector(selector);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  /** Refresh the header auth area (called on auth state change and route changes) */
  function refreshHeaderAuth() {
    var authArea = document.getElementById('authArea');
    if (authArea && typeof Auth !== 'undefined') {
      authArea.innerHTML = Auth.renderHeaderAuth();
      Auth.bindHeaderEvents();
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
  // Auth State Listener
  // ==========================================

  if (typeof Auth !== 'undefined') {
    Auth.onAuthStateChanged(function (user, role) {
      refreshHeaderAuth();
      // Re-render if on admin page (auth state changed)
      var route = getRoute();
      if (route.page === 'admin' || route.page === 'submit') {
        handleRoute();
      }
    });
  }

  // ==========================================
  // Initial Render
  // ==========================================

  handleRoute();
  refreshHeaderAuth();
})();
