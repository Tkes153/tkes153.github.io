/**
 * Admin Module
 * Handles authentication, post CRUD, and data export.
 * Posts are stored in localStorage under 'blog-custom-posts'.
 * Session is stored in sessionStorage under 'blog-admin-auth'.
 */

var Admin = (function () {
  'use strict';

  // SHA-256 hash of the default password "admin123456"
  // CHANGE THIS to your own hash after first login!
  var PASSWORD_HASH = 'ac0e7d037817094e9e0b4441f9bae3209d67b02fa484917065f71b16109a1a78';

  var STORAGE_KEY = 'blog-custom-posts';
  var SESSION_KEY = 'blog-admin-auth';

  // ==========================================
  // Crypto
  // ==========================================

  function sha256(message) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
      .then(function (hashBuffer) {
        return Array.from(new Uint8Array(hashBuffer))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  // ==========================================
  // Authentication
  // ==========================================

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function login(password) {
    return sha256(password).then(function (hash) {
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        return true;
      }
      return false;
    });
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function changePassword(oldPassword, newPassword) {
    return sha256(oldPassword).then(function (oldHash) {
      if (oldHash !== PASSWORD_HASH) {
        return false;
      }
      return sha256(newPassword).then(function (newHash) {
        PASSWORD_HASH = newHash;
        // Note: PASSWORD_HASH is in-memory only. On page reload it resets.
        // For now, we store it in localStorage so it persists.
        localStorage.setItem('blog-admin-hash', newHash);
        return true;
      });
    });
  }

  // Load persisted password hash if set
  (function () {
    var saved = localStorage.getItem('blog-admin-hash');
    if (saved) {
      PASSWORD_HASH = saved;
    }
  })();

  // ==========================================
  // Post CRUD
  // ==========================================

  /** Get custom posts from localStorage */
  function getCustomPosts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /** Save custom posts to localStorage */
  function saveCustomPosts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  /** Get all posts: custom posts + bundled posts */
  function getAllPosts() {
    var custom = getCustomPosts();
    // Deduplicate by slug: custom posts override bundled ones
    var slugs = {};
    for (var i = 0; i < custom.length; i++) {
      slugs[custom[i].slug] = true;
    }
    var merged = custom.slice();
    for (var j = 0; j < posts.length; j++) {
      if (!slugs[posts[j].slug]) {
        merged.push(posts[j]);
      }
    }
    // Sort by date descending
    merged.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    return merged;
  }

  function findPost(slug) {
    var all = getAllPosts();
    for (var i = 0; i < all.length; i++) {
      if (all[i].slug === slug) {
        return all[i];
      }
    }
    return null;
  }

  function addPost(post) {
    var custom = getCustomPosts();
    // Ensure slug uniqueness
    var existing = findPost(post.slug);
    if (existing) {
      // Overwrite
      for (var i = 0; i < custom.length; i++) {
        if (custom[i].slug === post.slug) {
          custom[i] = post;
          saveCustomPosts(custom);
          return true;
        }
      }
    }
    custom.unshift(post);
    saveCustomPosts(custom);
    return true;
  }

  function updatePost(slug, post) {
    var custom = getCustomPosts();
    for (var i = 0; i < custom.length; i++) {
      if (custom[i].slug === slug) {
        custom[i] = post;
        saveCustomPosts(custom);
        return true;
      }
    }
    // Not in custom posts — add it
    custom.unshift(post);
    saveCustomPosts(custom);
    return true;
  }

  function deletePost(slug) {
    var custom = getCustomPosts();
    for (var i = 0; i < custom.length; i++) {
      if (custom[i].slug === slug) {
        custom.splice(i, 1);
        saveCustomPosts(custom);
        return true;
      }
    }
    // Mark bundled posts as deleted by adding to a "deleted" list
    var deleted = getDeletedSlugs();
    deleted.push(slug);
    localStorage.setItem('blog-deleted-slugs', JSON.stringify(deleted));
    return true;
  }

  function getDeletedSlugs() {
    try {
      return JSON.parse(localStorage.getItem('blog-deleted-slugs')) || [];
    } catch (e) {
      return [];
    }
  }

  /** Generate slug from title (Chinese or English) */
  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/[^\x00-\x7F]/g, '')  // remove non-ASCII for URL safety
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'post-' + Date.now();
  }

  // ==========================================
  // Export
  // ==========================================

  function exportPostsJS() {
    var all = getAllPosts();
    var deleted = getDeletedSlugs();
    // Filter out deleted
    all = all.filter(function (p) { return deleted.indexOf(p.slug) === -1; });
    var json = JSON.stringify(all, null, 2);
    var content = '/**\n' +
      ' * Blog Posts Data\n' +
      ' * Auto-generated from admin panel on ' + new Date().toISOString().split('T')[0] + '\n' +
      ' */\n\n' +
      'var posts = ' + json + ';\n\n' +
      'posts.sort(function (a, b) {\n' +
      '  return new Date(b.date) - new Date(a.date);\n' +
      '});\n';
    return content;
  }

  function downloadPostsJS() {
    var content = exportPostsJS();
    var blob = new Blob([content], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'posts.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==========================================
  // Render: Login Page
  // ==========================================

  function renderLogin(errorMsg) {
    var html = '';
    html += '<div class="admin-login">';
    html += '<div class="admin-login-card">';
    html += '<div class="admin-login-icon">🔐</div>';
    html += '<h2 class="admin-login-title">' + t('adminLogin') + '</h2>';
    if (errorMsg) {
      html += '<p class="admin-error">' + errorMsg + '</p>';
    }
    html += '<form id="adminLoginForm" class="admin-login-form">';
    html += '<input type="password" id="adminPassword" class="admin-input" placeholder="' + t('adminPassword') + '" autofocus>';
    html += '<button type="submit" class="admin-btn admin-btn-primary">' + t('adminLoginBtn') + '</button>';
    html += '</form>';
    html += '<p class="admin-hint">' + t('adminHint') + '</p>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ==========================================
  // Render: Dashboard (Post List)
  // ==========================================

  function renderDashboard(successMsg) {
    var all = getAllPosts();
    var deleted = getDeletedSlugs();

    var html = '';
    html += '<div class="admin-dashboard">';
    html += '<div class="admin-header-bar">';
    html += '<h1 class="admin-page-title">' + t('adminDashboard') + '</h1>';
    html += '<div class="admin-header-actions">';
    html += '<button class="admin-btn admin-btn-primary" id="adminNewPost">+ ' + t('adminNewPost') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" id="adminExport">⬇ ' + t('adminExport') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" id="adminLogout">' + t('adminLogout') + '</button>';
    html += '</div>';
    html += '</div>';

    if (successMsg) {
      html += '<p class="admin-success">' + successMsg + '</p>';
    }

    if (all.length === 0) {
      html += '<div class="admin-empty">';
      html += '<p>' + t('adminNoPosts') + '</p>';
      html += '</div>';
    } else {
      html += '<div class="admin-table-wrap">';
      html += '<table class="admin-table">';
      html += '<thead><tr>';
      html += '<th>' + t('adminColTitle') + '</th>';
      html += '<th>' + t('adminColDate') + '</th>';
      html += '<th>' + t('adminColCategory') + '</th>';
      html += '<th>' + t('adminColActions') + '</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      for (var i = 0; i < all.length; i++) {
        var p = all[i];
        var isDeleted = deleted.indexOf(p.slug) !== -1;
        var title = localized(p.title);
        html += '<tr class="' + (isDeleted ? 'admin-row-deleted' : '') + '">';
        html += '<td class="admin-cell-title">' + title + (isDeleted ? ' <span class="admin-badge-deleted">' + t('adminDeleted') + '</span>' : '') + '</td>';
        html += '<td>' + p.date + '</td>';
        html += '<td>' + localized(p.category) + '</td>';
        html += '<td class="admin-cell-actions">';
        html += '<button class="admin-btn-sm admin-btn-edit" data-slug="' + p.slug + '">✎</button>';
        html += '<button class="admin-btn-sm admin-btn-delete" data-slug="' + p.slug + '">✕</button>';
        html += '</td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
      html += '</div>';
    }

    html += '<div class="admin-footer-bar">';
    html += '<p class="admin-count">' + t('adminTotalPosts', { n: all.length }) + '</p>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ==========================================
  // Render: Post Editor (Add / Edit)
  // ==========================================

  function renderEditor(post) {
    var isNew = !post;
    var p = post || {
      slug: '',
      date: new Date().toISOString().split('T')[0],
      category: { zh: '', en: '' },
      tags: [],
      title: { zh: '', en: '' },
      summary: { zh: '', en: '' },
      content: { zh: '', en: '' },
    };

    var html = '';
    html += '<div class="admin-editor">';
    html += '<div class="admin-header-bar">';
    html += '<h1 class="admin-page-title">' + (isNew ? t('adminNewPost') : t('adminEditPost')) + '</h1>';
    html += '<div class="admin-header-actions">';
    html += '<button class="admin-btn admin-btn-outline" id="adminBack">← ' + t('adminBack') + '</button>';
    html += '<button class="admin-btn admin-btn-primary" id="adminSave">' + t('adminSave') + '</button>';
    html += '</div>';
    html += '</div>';

    html += '<form id="adminEditorForm" class="admin-editor-form">';

    // Slug
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">Slug (URL) <span class="admin-label-hint">' + t('adminSlugHint') + '</span></label>';
    html += '<input type="text" class="admin-input" name="slug" value="' + escAttr(p.slug) + '" required>';
    html += '</div>';

    // Date
    html += '<div class="admin-form-row">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminDate') + '</label>';
    html += '<input type="date" class="admin-input" name="date" value="' + p.date + '" required>';
    html += '</div>';
    html += '</div>';

    // Category (bilingual)
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminCategoryZh') + '</label>';
    html += '<input type="text" class="admin-input" name="categoryZh" value="' + escAttr(p.category.zh) + '" placeholder="例如：技术">';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminCategoryEn') + '</label>';
    html += '<input type="text" class="admin-input" name="categoryEn" value="' + escAttr(p.category.en) + '" placeholder="e.g. Tech">';
    html += '</div>';
    html += '</div>';

    // Tags
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminTags') + ' <span class="admin-label-hint">' + t('adminTagsHint') + '</span></label>';
    html += '<div id="adminTagsContainer" class="admin-tags-editor">';
    for (var i = 0; i < p.tags.length; i++) {
      html += renderTagRow(p.tags[i], i);
    }
    html += '</div>';
    html += '<button type="button" class="admin-btn admin-btn-sm admin-btn-outline" id="adminAddTag">+ ' + t('adminAddTag') + '</button>';
    html += '</div>';

    // Title
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminTitleZh') + '</label>';
    html += '<input type="text" class="admin-input" name="titleZh" value="' + escAttr(p.title.zh) + '" placeholder="中文标题">';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminTitleEn') + '</label>';
    html += '<input type="text" class="admin-input" name="titleEn" value="' + escAttr(p.title.en) + '" placeholder="English title">';
    html += '</div>';
    html += '</div>';

    // Summary
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminSummaryZh') + '</label>';
    html += '<textarea class="admin-textarea" name="summaryZh" rows="3">' + escHtml(p.summary.zh) + '</textarea>';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminSummaryEn') + '</label>';
    html += '<textarea class="admin-textarea" name="summaryEn" rows="3">' + escHtml(p.summary.en) + '</textarea>';
    html += '</div>';
    html += '</div>';

    // Content
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminContentZh') + ' <span class="admin-label-hint">HTML</span></label>';
    html += '<textarea class="admin-textarea admin-textarea-lg" name="contentZh" rows="16">' + escHtml(p.content.zh) + '</textarea>';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminContentEn') + ' <span class="admin-label-hint">HTML</span></label>';
    html += '<textarea class="admin-textarea admin-textarea-lg" name="contentEn" rows="16">' + escHtml(p.content.en) + '</textarea>';
    html += '</div>';
    html += '</div>';

    html += '</form>';
    html += '</div>';
    return html;
  }

  function renderTagRow(tag, index) {
    return '<div class="admin-tag-row">' +
      '<input type="text" class="admin-input" name="tagZh_' + index + '" value="' + escAttr(tag.zh) + '" placeholder="中文标签">' +
      '<input type="text" class="admin-input" name="tagEn_' + index + '" value="' + escAttr(tag.en) + '" placeholder="English tag">' +
      '<button type="button" class="admin-btn-sm admin-btn-delete admin-remove-tag">✕</button>' +
      '</div>';
  }

  // ==========================================
  // HTML Escaping Helpers
  // ==========================================

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ==========================================
  // Event Binding (called after HTML is injected)
  // ==========================================

  function bindLoginEvents() {
    var form = document.getElementById('adminLoginForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var pw = document.getElementById('adminPassword').value;
      if (!pw) return;
      login(pw).then(function (ok) {
        if (ok) {
          window.location.hash = '#/admin';
        } else {
          document.getElementById('main').innerHTML = renderLogin(t('adminWrongPassword'));
          bindLoginEvents();
        }
      });
    });
  }

  function bindDashboardEvents() {
    var newBtn = document.getElementById('adminNewPost');
    var exportBtn = document.getElementById('adminExport');
    var logoutBtn = document.getElementById('adminLogout');
    var editBtns = document.querySelectorAll('.admin-btn-edit');
    var deleteBtns = document.querySelectorAll('.admin-btn-delete');

    if (newBtn) {
      newBtn.addEventListener('click', function () {
        window.location.hash = '#/admin/new';
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        downloadPostsJS();
        showToast(t('adminExportDone'));
      });
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        logout();
        window.location.hash = '#/admin';
      });
    }

    for (var i = 0; i < editBtns.length; i++) {
      editBtns[i].addEventListener('click', function () {
        var slug = this.getAttribute('data-slug');
        window.location.hash = '#/admin/edit/' + slug;
      });
    }

    for (var j = 0; j < deleteBtns.length; j++) {
      deleteBtns[j].addEventListener('click', function () {
        var slug = this.getAttribute('data-slug');
        if (confirm(t('adminConfirmDelete'))) {
          deletePost(slug);
          document.getElementById('main').innerHTML = renderDashboard(t('adminPostDeleted'));
          bindDashboardEvents();
        }
      });
    }
  }

  function bindEditorEvents(post) {
    var backBtn = document.getElementById('adminBack');
    var saveBtn = document.getElementById('adminSave');
    var addTagBtn = document.getElementById('adminAddTag');
    var titleZhInput = document.querySelector('[name="titleZh"]');

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        window.location.hash = '#/admin';
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        savePostFromForm(post);
      });
    }

    if (addTagBtn) {
      addTagBtn.addEventListener('click', function () {
        var container = document.getElementById('adminTagsContainer');
        var index = container.children.length;
        var row = document.createElement('div');
        row.innerHTML = renderTagRow({ zh: '', en: '' }, index);
        container.appendChild(row.firstElementChild);
        bindTagRemoveEvents();
      });
    }

    // Auto-generate slug from Chinese title
    if (titleZhInput && !post) {
      titleZhInput.addEventListener('blur', function () {
        var slugInput = document.querySelector('[name="slug"]');
        if (slugInput && !slugInput.value) {
          var slug = generateSlug(titleZhInput.value);
          if (slug) {
            slugInput.value = slug;
          }
        }
      });
    }

    bindTagRemoveEvents();
  }

  function bindTagRemoveEvents() {
    var removeBtns = document.querySelectorAll('.admin-remove-tag');
    for (var i = 0; i < removeBtns.length; i++) {
      removeBtns[i].onclick = function () {
        this.parentElement.remove();
      };
    }
  }

  function savePostFromForm(originalPost) {
    var form = document.getElementById('adminEditorForm');
    if (!form) return;

    var formData = {};
    var inputs = form.querySelectorAll('input, textarea');
    for (var i = 0; i < inputs.length; i++) {
      formData[inputs[i].name] = inputs[i].value;
    }

    // Build tags
    var tagContainer = document.getElementById('adminTagsContainer');
    var tagRows = tagContainer.querySelectorAll('.admin-tag-row');
    var tags = [];
    for (var j = 0; j < tagRows.length; j++) {
      var zhInput = tagRows[j].querySelector('[name^="tagZh_"]');
      var enInput = tagRows[j].querySelector('[name^="tagEn_"]');
      if (zhInput && enInput) {
        var zh = zhInput.value.trim();
        var en = enInput.value.trim();
        if (zh || en) {
          tags.push({ zh: zh, en: en });
        }
      }
    }

    var post = {
      slug: formData.slug || generateSlug(formData.titleZh || formData.titleEn || 'post'),
      date: formData.date || new Date().toISOString().split('T')[0],
      category: { zh: formData.categoryZh || '', en: formData.categoryEn || '' },
      tags: tags,
      title: { zh: formData.titleZh || '', en: formData.titleEn || '' },
      summary: { zh: formData.summaryZh || '', en: formData.summaryEn || '' },
      content: { zh: formData.contentZh || '', en: formData.contentEn || '' },
    };

    // Validate
    if (!post.title.zh && !post.title.en) {
      alert(t('adminValidationTitle'));
      return;
    }

    if (originalPost) {
      updatePost(originalPost.slug, post);
      showToast(t('adminPostUpdated'));
    } else {
      addPost(post);
      showToast(t('adminPostCreated'));
    }

    window.location.hash = '#/admin';
  }

  // ==========================================
  // Toast Notification
  // ==========================================

  function showToast(msg) {
    // Use the dashboard success message area
    // For now, just navigate to dashboard which will show the message
  }

  // ==========================================
  // Main Render Dispatcher
  // ==========================================

  function render(route) {
    if (!isLoggedIn()) {
      return renderLogin();
    }

    // route: { page: 'admin', sub: 'dashboard'|'new'|'edit', slug?: string }
    if (route.sub === 'new') {
      return renderEditor(null);
    }
    if (route.sub === 'edit' && route.slug) {
      var post = findPost(route.slug);
      if (!post) {
        return renderDashboard();
      }
      return renderEditor(post);
    }
    return renderDashboard();
  }

  function bindEvents(route) {
    if (!isLoggedIn()) {
      bindLoginEvents();
      return;
    }

    if (route.sub === 'new') {
      bindEditorEvents(null);
    } else if (route.sub === 'edit' && route.slug) {
      var post = findPost(route.slug);
      bindEditorEvents(post);
    } else {
      bindDashboardEvents();
    }
  }

  // ==========================================
  // Filter posts for public display
  // ==========================================

  function getPublicPosts() {
    var all = getAllPosts();
    var deleted = getDeletedSlugs();
    return all.filter(function (p) {
      return deleted.indexOf(p.slug) === -1;
    });
  }

  // ==========================================
  // Public API
  // ==========================================

  return {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    render: render,
    bindEvents: bindEvents,
    getPublicPosts: getPublicPosts,
    getAllPosts: getAllPosts,
    findPost: findPost,
    addPost: addPost,
    updatePost: updatePost,
    deletePost: deletePost,
    downloadPostsJS: downloadPostsJS,
    exportPostsJS: exportPostsJS,
  };
})();
