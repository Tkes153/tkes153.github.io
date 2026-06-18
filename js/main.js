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
    // Hero section
    html += '<div class="hero">';
    html += '<h1 class="hero-title">' + t('siteTitle') + '</h1>';
    html += '<p class="hero-subtitle">' + t('blogSubtitle') + '</p>';
    html += '<p class="hero-desc">' + (t('heroDesc') || '每个人都是自己梦境的探险家。记录、分享、解读那些在夜色中浮现的故事。') + '</p>';
    html += '</div>';

    // Dream category entrance cards
    html += '<div class="dream-entrance">';
    html += '<a href="#/sweet" class="entrance-card entrance-sweet">';
    html += '<span class="entrance-emoji">🌙</span>';
    html += '<span class="entrance-title">' + (t('sweetDreamsShort') || '美梦') + '</span>';
    html += '<span class="entrance-hint">' + (t('entranceSweet') || '温暖 · 治愈 · 美好') + '</span>';
    html += '</a>';
    html += '<a href="#/nightmare" class="entrance-card entrance-nightmare">';
    html += '<span class="entrance-emoji">💀</span>';
    html += '<span class="entrance-title">' + (t('nightmaresShort') || '噩梦') + '</span>';
    html += '<span class="entrance-hint">' + (t('entranceNightmare') || '恐惧 · 追逐 · 惊醒') + '</span>';
    html += '</a>';
    html += '<a href="#/weird" class="entrance-card entrance-weird">';
    html += '<span class="entrance-emoji">👽</span>';
    html += '<span class="entrance-title">' + (t('weirdDreamsShort') || '怪梦') + '</span>';
    html += '<span class="entrance-hint">' + (t('entranceWeird') || '荒诞 · 离奇 · 超现实') + '</span>';
    html += '</a>';
    html += '</div>';

    // Random posts
    html += '<div class="home-posts-section">';
    html += '<h2 class="section-title">' + (t('randomDreams') || '🌌 随机梦境') + '</h2>';
    html += '<div id="blogListContent"><p style="text-align:center;padding:40px;color:var(--text-tertiary);">' + (t('loading') || '...') + '</p></div>';
    html += '</div>';

    // Knowledge cards (randomly refreshed)
    html += renderDreamKnowledge();
    return html;
  }

  // Knowledge card pool - 12 cards from dream science
  var knowledgePool = [
    { icon: '🔄', key: 'kSleepCycle',    keyDesc: 'kSleepCycleDesc',    zh: '睡眠周期',     zhDesc: '每夜经历4-5个睡眠周期，每个约90分钟。NREM深睡修复身体，REM睡眠孕育梦境。',                               en: 'Sleep Cycles',    enDesc: '4-5 cycles per night, ~90 min each. NREM repairs the body, REM births dreams.' },
    { icon: '🧠', key: 'kREM',           keyDesc: 'kREMDesc',           zh: 'REM 睡眠',     zhDesc: '快速眼动睡眠期间大脑高度活跃，身体肌肉却处于麻痹状态——防止你把梦"演"出来。',                       en: 'REM Sleep',       enDesc: 'Brain highly active while body is paralyzed — preventing you from acting out dreams.' },
    { icon: '💾', key: 'kMemory',        keyDesc: 'kMemoryDesc',        zh: '记忆巩固',     zhDesc: '睡眠中大脑对白天经历进行整理归档，将短期记忆转化为长期记忆。熬夜复习不如睡一觉。',                 en: 'Memory Consolidation', enDesc: 'During sleep, the brain archives daily experiences, converting short-term to long-term memory.' },
    { icon: '📝', key: 'kRecord',        keyDesc: 'kRecordDesc',        zh: '记录梦境',     zhDesc: '醒来5分钟内遗忘50%梦境。床头放纸笔，醒来立刻记下关键词和情绪，不要等想清楚了再写。',           en: 'Recording Dreams', enDesc: '50% of dreams forgotten within 5 minutes. Keep a notebook by your bed, jot down keywords immediately.' },
    { icon: '🎭', key: 'kActivation',    keyDesc: 'kActivationDesc',    zh: '激活-合成模型', zhDesc: '梦境可能是大脑皮层对脑干随机信号的"叙事拼接"——大脑像即兴导演，用记忆碎片编织出自洽的故事。',       en: 'Activation-Synthesis', enDesc: 'Dreams may be the brains narrative stitching of random brainstem signals — like an improvisational director.' },
    { icon: '🌅', key: 'kMorning',       keyDesc: 'kMorningDesc',       zh: '清晨多梦',     zhDesc: '越接近清晨，REM睡眠时间越长。闹钟响前被长长的梦唤醒——那不是偶然。',                                en: 'Morning Dreams',  enDesc: 'REM sleep lengthens toward dawn. Being woken from a long dream by your alarm is not a coincidence.' },
    { icon: '😴', key: 'kNREM',          keyDesc: 'kNREMDesc',          zh: 'NREM 深睡',   zhDesc: '深度睡眠（N3期）是身体修复最强的阶段。生长激素分泌达高峰，组织修复、细胞再生都在此时进行。',          en: 'NREM Deep Sleep', enDesc: 'Deep sleep (N3) is when body repair peaks. Growth hormone surges, tissue repair and cell regeneration occur.' },
    { icon: '🔬', key: 'kBrainstem',     keyDesc: 'kBrainstemDesc',     zh: '脑干的角色',   zhDesc: '脑干（特别是脑桥）在REM睡眠中发出信号激活大脑皮层，是梦境的"开关"。同时抑制运动神经元防止身体乱动。',     en: 'Brainstem Role',  enDesc: 'The brainstem triggers REM sleep, activating the cortex while paralyzing muscles to prevent acting out dreams.' },
    { icon: '🎬', key: 'kPrefrontal',    keyDesc: 'kPrefrontalDesc',    zh: '前额叶"罢工"', zhDesc: '做梦时前额叶皮层活动降低，这是负责逻辑和自控的区域。所以梦中你可以飞、场景会突然切换——逻辑下线了。',  en: 'Prefrontal Offline', enDesc: 'The prefrontal cortex (logic, self-control) quiets during dreams — why you can fly and scenes shift absurdly.' },
    { icon: '⚡', key: 'kNeurotrans',    keyDesc: 'kNeurotransDesc',    zh: '神经递质',     zhDesc: 'REM睡眠中去甲肾上腺素和血清素分泌停止，乙酰胆碱活跃。这套化学变化让梦境天马行空、不受约束。',           en: 'Neurotransmitters', enDesc: 'Norepinephrine and serotonin stop during REM while acetylcholine surges — unleashing unbounded dream creativity.' },
    { icon: '👁️', key: 'kLucid',         keyDesc: 'kLucidDesc',         zh: '清醒梦',       zhDesc: '在梦中意识到"我在做梦"并可能控制梦境。前额叶部分恢复活跃，连接了意识和无意识的世界。',           en: 'Lucid Dreaming',  enDesc: 'Becoming aware you are dreaming and potentially controlling the dream. A bridge between consciousness and the unconscious.' },
    { icon: '🛡️', key: 'kThreat',        keyDesc: 'kThreatDesc',        zh: '威胁模拟',     zhDesc: '噩梦可能是大脑的"安全演习"——在虚拟环境中预演危险场景，帮助我们在现实中更好地应对威胁。',                en: 'Threat Simulation', enDesc: 'Nightmares may be the brains safety drills — rehearsing dangerous scenarios in a virtual environment to prepare for real threats.' },
  ];

  function renderDreamKnowledge() {
    // Pick 4 random cards
    var pool = knowledgePool.slice();
    shuffle(pool);
    var selected = pool.slice(0, 4);

    var html = '';
    html += '<div class="knowledge-section">';
    html += '<div class="knowledge-header">';
    html += '<h2 class="section-title">' + (t('dreamKnowledge') || '💤 梦境科学小知识') + '</h2>';
    html += '<button class="knowledge-refresh" id="btnRefreshKnowledge" title="' + (t('refreshKnowledge') || '换一批') + '">🔄</button>';
    html += '</div>';
    html += '<div class="knowledge-cards" id="knowledgeCards">';
    for (var i = 0; i < selected.length; i++) {
      var card = selected[i];
      html += '<div class="knowledge-card">';
      html += '<div class="knowledge-icon">' + card.icon + '</div>';
      html += '<h4>' + (t(card.key) || localized(card)) + '</h4>';
      html += '<p>' + (t(card.keyDesc) || '') + '</p>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function refreshKnowledgeCards() {
    var container = document.getElementById('knowledgeCards');
    if (!container) return;

    var pool = knowledgePool.slice();
    shuffle(pool);
    var selected = pool.slice(0, 4);

    var html = '';
    for (var i = 0; i < selected.length; i++) {
      var card = selected[i];
      html += '<div class="knowledge-card" style="animation: fadeInUp 0.3s ease forwards;">';
      html += '<div class="knowledge-icon">' + card.icon + '</div>';
      html += '<h4>' + (t(card.key) || card.zh || '') + '</h4>';
      html += '<p>' + (t(card.keyDesc) || '') + '</p>';
      html += '</div>';
    }
    container.innerHTML = html;
  }

  function bindKnowledgeRefresh() {
    var btn = document.getElementById('btnRefreshKnowledge');
    if (btn) {
      btn.addEventListener('click', function () {
        refreshKnowledgeCards();
        // Button spin animation
        this.style.transform = 'rotate(360deg)';
        setTimeout(function (el) { el.style.transform = ''; }, 400, this);
      });
    }
  }

  function localizedCard(card) {
    var lang = getLang();
    return { zh: card.zh, en: card.en }[lang] || card.zh;
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

  function renderPostCards(postsList) {
    var html = '';
    for (var i = 0; i < postsList.length; i++) {
      var post = postsList[i];
      var title = localized(post.title);
      var summary = localized(post.summary);
      var date = formatDate(post.date);
      var readingTime = estimateReadingTime(localized(post.content));
      var slug = post.slug;

      html += '<article class="post-card post-card-sm" data-slug="' + slug + '">';
      html += '<time class="post-card-date">' + date + ' · ' + t('readingTime', { n: readingTime }) + '</time>';
      html += '<h3 class="post-card-title">' + title + '</h3>';
      html += '<p class="post-card-summary">' + summary + '</p>';
      html += '</article>';
    }
    return html;
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
      bindKnowledgeRefresh();
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
