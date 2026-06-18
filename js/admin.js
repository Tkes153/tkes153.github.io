/**
 * Admin Module v2 (CloudBase)
 * Handles admin authentication, post review, user management, and post editing.
 * All data stored in CloudBase Database.
 *
 * Dependencies: cloudbase-config.js (app, auth, db), i18n.js (t, localized), auth.js (Auth)
 */

var Admin = (function () {
  'use strict';

  // ==========================================
  // Admin Auth Check
  // ==========================================

  function isLoggedIn() {
    return Auth.isLoggedIn() && Auth.isAdmin();
  }

  function ensureAdmin() {
    if (!isLoggedIn()) {
      window.location.hash = '#/admin';
      return false;
    }
    return true;
  }

  // ==========================================
  // Firestore Helpers
  // ==========================================

  function postsRef() {
    return db.collection('posts');
  }

  function usersRef() {
    return db.collection('users');
  }

  function docToPost(doc) {
    doc._id = doc._id || '';
    if (doc.createdAt instanceof Date) {
      doc.date = doc.createdAt.toISOString().split('T')[0];
    } else if (doc.createdAt && typeof doc.createdAt === 'number') {
      doc.date = new Date(doc.createdAt).toISOString().split('T')[0];
    }
    return doc;
  }

  // ==========================================
  // Post Operations (Firestore)
  // ==========================================

  function getPendingPosts() {
    return postsRef()
      .where({ status: 'pending' })
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (res) {
        var result = [];
        var data = res.data || [];
        for (var i = 0; i < data.length; i++) {
          result.push(docToPost(data[i]));
        }
        return result;
      });
  }

  function getAllPosts() {
    return postsRef()
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (res) {
        var result = [];
        var data = res.data || [];
        for (var i = 0; i < data.length; i++) {
          result.push(docToPost(data[i]));
        }
        return result;
      });
  }

  function approvePost(postId, comment) {
    return postsRef().doc(postId).update({
      status: 'approved',
      reviewComment: comment || '',
      reviewedBy: Auth.getCurrentUser().uid,
      reviewedAt: db.serverDate(),
    });
  }

  function rejectPost(postId, comment) {
    return postsRef().doc(postId).update({
      status: 'rejected',
      reviewComment: comment || '',
      reviewedBy: Auth.getCurrentUser().uid,
      reviewedAt: db.serverDate(),
    });
  }

  function updatePost(postId, data) {
    return postsRef().doc(postId).update(data);
  }

  function deletePost(postId) {
    return postsRef().doc(postId).remove();
  }

  // ==========================================
  // User Operations
  // ==========================================

  function getAllUsers() {
    return usersRef()
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (res) {
        var result = [];
        var data = res.data || [];
        for (var i = 0; i < data.length; i++) {
          var u = data[i];
          u._id = u._id || '';
          result.push(u);
        }
        return result;
      });
  }

  function updateUserRole(uid, newRole) {
    return usersRef().doc(uid).update({ role: newRole });
  }

  // ==========================================
  // Render: Login Required
  // ==========================================

  function renderLoginRequired() {
    var html = '';
    html += '<div class="admin-login">';
    html += '<div class="admin-login-card">';
    html += '<div class="admin-login-icon">🔐</div>';
    html += '<h2 class="admin-login-title">' + t('adminLogin') + '</h2>';
    html += '<p style="color:var(--text-secondary);margin-bottom:20px;">' + (t('adminLoginRequired') || '请使用管理员账号登录') + '</p>';
    html += '<button class="admin-btn admin-btn-primary" id="adminGoLogin">' + (t('login') || '去登录') + '</button>';
    html += '</div></div>';
    return html;
  }

  // ==========================================
  // Render: Dashboard with Tabs
  // ==========================================

  function renderDashboard(activeTab, message) {
    if (!ensureAdmin()) {
      return renderLoginRequired();
    }

    activeTab = activeTab || 'review';

    var html = '';
    html += '<div class="admin-dashboard">';

    // Header
    html += '<div class="admin-header-bar">';
    html += '<h1 class="admin-page-title">' + t('adminPanel') + '</h1>';
    html += '<div class="admin-header-actions">';
    html += '<button class="admin-btn admin-btn-outline" id="adminLogout">' + t('logout') + '</button>';
    html += '</div>';
    html += '</div>';

    // Tabs
    html += '<div class="admin-tabs">';
    html += '<button class="admin-tab-btn' + (activeTab === 'review' ? ' active' : '') + '" data-tab="review">' + t('adminTabReview') + '</button>';
    html += '<button class="admin-tab-btn' + (activeTab === 'users' ? ' active' : '') + '" data-tab="users">' + t('adminTabUsers') + '</button>';
    html += '<button class="admin-tab-btn' + (activeTab === 'posts' ? ' active' : '') + '" data-tab="posts">' + t('adminTabPosts') + '</button>';
    html += '</div>';

    // Message
    if (message) {
      html += '<p class="admin-success">' + message + '</p>';
    }

    // Tab content placeholder (loaded async)
    html += '<div id="adminTabContent" class="admin-tab-content">';
    html += '<p style="text-align:center;padding:40px;color:var(--text-tertiary);">' + (t('loading') || '加载中...') + '</p>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ==========================================
  // Render: Review Queue Tab
  // ==========================================

  function renderReviewQueue(pendingPosts) {
    var html = '';
    if (!pendingPosts || pendingPosts.length === 0) {
      html += '<div class="admin-empty">';
      html += '<p>' + t('noPendingPosts') + '</p>';
      html += '</div>';
      return html;
    }

    for (var i = 0; i < pendingPosts.length; i++) {
      var p = pendingPosts[i];
      var title = localized(p.title);
      var summary = localized(p.summary);
      var content = localized(p.content);

      html += '<div class="review-card" data-post-id="' + p._id + '">';
      html += '<div class="review-card-header">';
      html += '<div>';
      html += '<h3 class="review-card-title">' + escHtml(title) + '</h3>';
      html += '<span class="review-card-meta">' + (p.authorName || '') + ' · ' + (p.date || '') + '</span>';
      html += '</div>';
      html += '<span class="status-badge status-badge-pending">' + t('statusPending') + '</span>';
      html += '</div>';
      html += '<p class="review-card-summary">' + escHtml(summary) + '</p>';
      html += '<details class="review-card-details">';
      html += '<summary style="cursor:pointer;font-size:0.85rem;color:var(--accent);">' + (t('viewContent') || '查看正文') + '</summary>';
      html += '<div class="review-card-content">' + content + '</div>';
      html += '</details>';
      html += '<div class="review-card-actions" style="margin-top:12px;">';
      html += '<input type="text" class="admin-input review-comment-input" placeholder="' + t('reviewComment') + '" style="flex:1;min-width:150px;">';
      html += '<button class="admin-btn admin-btn-primary btn-approve">✓ ' + t('approve') + '</button>';
      html += '<button class="admin-btn admin-btn-delete btn-reject">✕ ' + t('reject') + '</button>';
      html += '</div>';
      html += '</div>';
    }
    return html;
  }

  // ==========================================
  // Render: User Management Tab
  // ==========================================

  function renderUserManagement(users) {
    if (!users || users.length === 0) {
      return '<div class="admin-empty"><p>' + (t('noUsers') || '没有用户') + '</p></div>';
    }

    var html = '';
    html += '<div class="admin-table-wrap">';
    html += '<table class="admin-user-table">';
    html += '<thead><tr>';
    html += '<th>Email</th>';
    html += '<th>' + t('displayName') + '</th>';
    html += '<th>' + t('userRoleLabel') + '</th>';
    html += '<th>' + t('adminColActions') + '</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var isAdmin = u.role === 'admin';
      var isSelf = Auth.getCurrentUser() && Auth.getCurrentUser().uid === u._id;

      html += '<tr>';
      html += '<td>' + escHtml(u.email || '') + (isSelf ? ' <span style="color:var(--text-tertiary);">(' + (t('you') || '你') + ')</span>' : '') + '</td>';
      html += '<td>' + escHtml(u.displayName || '') + '</td>';
      html += '<td>';
      html += '<select class="admin-role-select" data-uid="' + u._id + '"' + (isSelf ? ' disabled' : '') + '>';
      html += '<option value="user"' + (!isAdmin ? ' selected' : '') + '>' + t('userRoleUser') + '</option>';
      html += '<option value="admin"' + (isAdmin ? ' selected' : '') + '>' + t('userRoleAdmin') + '</option>';
      html += '</select>';
      html += '</td>';
      html += '<td>';
      if (!isSelf) {
        html += '<button class="admin-btn-sm admin-btn-delete btn-delete-user" data-uid="' + u._id + '">' + t('adminDeleteUser') + '</button>';
      }
      html += '</td></tr>';
    }

    html += '</tbody></table></div>';
    return html;
  }

  // ==========================================
  // Render: Post Management Tab
  // ==========================================

  function renderPostManagement(allPosts) {
    if (!allPosts || allPosts.length === 0) {
      return '<div class="admin-empty"><p>' + t('adminNoPosts') + '</p></div>';
    }

    var html = '';
    html += '<div class="admin-table-wrap">';
    html += '<table class="admin-table">';
    html += '<thead><tr>';
    html += '<th>' + t('adminColTitle') + '</th>';
    html += '<th>' + t('adminColDate') + '</th>';
    html += '<th>' + (t('author') || '作者') + '</th>';
    html += '<th>' + (t('status') || '状态') + '</th>';
    html += '<th>' + t('adminColActions') + '</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < allPosts.length; i++) {
      var p = allPosts[i];
      var status = p.status || 'approved';
      var badgeClass = 'status-badge-approved';
      var badgeText = t('statusApproved');
      if (status === 'pending') {
        badgeClass = 'status-badge-pending';
        badgeText = t('statusPending');
      } else if (status === 'rejected') {
        badgeClass = 'status-badge-rejected';
        badgeText = t('statusRejected');
      }

      html += '<tr>';
      html += '<td class="admin-cell-title">' + escHtml(localized(p.title)) + '</td>';
      html += '<td>' + (p.date || '') + '</td>';
      html += '<td>' + escHtml(p.authorName || '') + '</td>';
      html += '<td><span class="status-badge ' + badgeClass + '">' + badgeText + '</span></td>';
      html += '<td class="admin-cell-actions">';
      html += '<button class="admin-btn-sm admin-btn-edit btn-edit-post" data-post-id="' + (p._id || '') + '" data-slug="' + (p.slug || '') + '">✎</button>';
      html += '<button class="admin-btn-sm admin-btn-delete btn-delete-post" data-post-id="' + (p._id || '') + '">✕</button>';
      html += '</td></tr>';
    }

    html += '</tbody></table></div>';
    return html;
  }

  // ==========================================
  // Render: Post Editor (admin editing)
  // ==========================================

  function renderEditor(post) {
    if (!ensureAdmin()) return renderLoginRequired();

    var isNew = !post;
    var p = post || {
      _id: '',
      slug: '',
      date: new Date().toISOString().split('T')[0],
      category: { zh: '', en: '' },
      tags: [],
      title: { zh: '', en: '' },
      summary: { zh: '', en: '' },
      content: { zh: '', en: '' },
      status: 'approved',
      authorId: Auth.getCurrentUser().uid,
      authorName: Auth.getCurrentUser().displayName || 'Admin',
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
    html += '<input type="hidden" name="_id" value="' + escAttr(p._id || '') + '">';
    html += '<input type="hidden" name="status" value="' + escAttr(p.status || 'approved') + '">';

    // Slug
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">Slug (URL) <span class="admin-label-hint">' + t('adminSlugHint') + '</span></label>';
    html += '<input type="text" class="admin-input" name="slug" value="' + escAttr(p.slug) + '" required>';
    html += '</div>';

    // Date
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminDate') + '</label>';
    html += '<input type="date" class="admin-input" name="date" value="' + p.date + '" required>';
    html += '</div>';

    // Category
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
    html += '<label class="admin-label">' + t('adminTags') + '</label>';
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

    html += '</form></div>';
    return html;
  }

  function renderTagRow(tag, index) {
    return '<div class="admin-tag-row">' +
      '<input type="text" class="admin-input" name="tagZh_' + index + '" value="' + escAttr(tag.zh || '') + '" placeholder="中文标签">' +
      '<input type="text" class="admin-input" name="tagEn_' + index + '" value="' + escAttr(tag.en || '') + '" placeholder="English tag">' +
      '<button type="button" class="admin-btn-sm admin-btn-delete admin-remove-tag">✕</button>' +
      '</div>';
  }

  // ==========================================
  // Render: Submit Post (for regular users)
  // ==========================================

  function renderSubmitPost(successMsg) {
    if (!Auth.isLoggedIn()) {
      return '<div class="admin-login"><div class="admin-login-card">' +
        '<p>' + (t('loginRequired') || '请先登录再发帖') + '</p>' +
        '<button class="admin-btn admin-btn-primary" id="adminGoLogin">' + (t('login') || '登录') + '</button>' +
        '</div></div>';
    }

    var html = '';
    html += '<div class="submit-post-page">';
    html += '<h1 class="page-title">' + t('newPostTitle') + '</h1>';

    if (successMsg) {
      html += '<p class="admin-success">' + successMsg + '</p>';
    } else {
      html += '<div class="submit-notice">' + t('postPendingNotice') + '</div>';
    }

    html += '<form id="submitPostForm" class="admin-editor-form">';

    // Category
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminCategoryZh') + '</label>';
    html += '<input type="text" class="admin-input" name="categoryZh" placeholder="例如：技术">';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminCategoryEn') + '</label>';
    html += '<input type="text" class="admin-input" name="categoryEn" placeholder="e.g. Tech">';
    html += '</div>';
    html += '</div>';

    // Tags
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminTags') + '</label>';
    html += '<div id="submitTagsContainer" class="admin-tags-editor">';
    html += renderTagRow({ zh: '', en: '' }, 0);
    html += '</div>';
    html += '<button type="button" class="admin-btn admin-btn-sm admin-btn-outline" id="submitAddTag">+ ' + t('adminAddTag') + '</button>';
    html += '</div>';

    // Title
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminTitleZh') + ' <span style="color:#ef4444;">*</span></label>';
    html += '<input type="text" class="admin-input" name="titleZh" placeholder="中文标题" required>';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminTitleEn') + '</label>';
    html += '<input type="text" class="admin-input" name="titleEn" placeholder="English title">';
    html += '</div>';
    html += '</div>';

    // Summary
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminSummaryZh') + '</label>';
    html += '<textarea class="admin-textarea" name="summaryZh" rows="3"></textarea>';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminSummaryEn') + '</label>';
    html += '<textarea class="admin-textarea" name="summaryEn" rows="3"></textarea>';
    html += '</div>';
    html += '</div>';

    // Content
    html += '<div class="admin-form-row admin-form-row-2">';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminContentZh') + ' <span style="color:#ef4444;">*</span> <span class="admin-label-hint">HTML</span></label>';
    html += '<textarea class="admin-textarea admin-textarea-lg" name="contentZh" rows="16" required></textarea>';
    html += '</div>';
    html += '<div class="admin-form-group">';
    html += '<label class="admin-label">' + t('adminContentEn') + ' <span class="admin-label-hint">HTML</span></label>';
    html += '<textarea class="admin-textarea admin-textarea-lg" name="contentEn" rows="16"></textarea>';
    html += '</div>';
    html += '</div>';

    html += '<div style="text-align:right;">';
    html += '<button type="submit" class="admin-btn admin-btn-primary" style="padding:12px 32px;font-size:1rem;">' + t('submitPost') + '</button>';
    html += '</div>';

    html += '</form></div>';
    return html;
  }

  // ==========================================
  // Event Binding
  // ==========================================

  function bindDashboardEvents() {
    // Tab switching
    var tabs = document.querySelectorAll('.admin-tab-btn');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var tab = this.getAttribute('data-tab');
        window.location.hash = '#/admin/' + tab;
      });
    }

    // Logout
    var logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        Auth.logout().then(function () {
          window.location.hash = '#/';
        });
      });
    }

    // Load tab content async
    loadTabContent();
  }

  function loadTabContent() {
    var container = document.getElementById('adminTabContent');
    if (!container) return;

    var hash = window.location.hash || '';
    var tab = 'review';
    if (hash.indexOf('#/admin/users') === 0) tab = 'users';
    else if (hash.indexOf('#/admin/posts') === 0) tab = 'posts';
    else if (hash.indexOf('#/admin/review') === 0) tab = 'review';

    switch (tab) {
      case 'review':
        getPendingPosts().then(function (pending) {
          if (container) container.innerHTML = renderReviewQueue(pending);
          bindReviewEvents();
        });
        break;
      case 'users':
        getAllUsers().then(function (users) {
          if (container) container.innerHTML = renderUserManagement(users);
          bindUserEvents();
        });
        break;
      case 'posts':
        getAllPosts().then(function (all) {
          if (container) container.innerHTML = renderPostManagement(all);
          bindPostManagementEvents();
        });
        break;
    }
  }

  function bindReviewEvents() {
    // Approve buttons
    var approveBtns = document.querySelectorAll('.btn-approve');
    for (var i = 0; i < approveBtns.length; i++) {
      approveBtns[i].addEventListener('click', function () {
        var card = this.closest('.review-card');
        var postId = card.getAttribute('data-post-id');
        var commentInput = card.querySelector('.review-comment-input');
        var comment = commentInput ? commentInput.value : '';
        if (confirm(t('reviewApproveConfirm'))) {
          approvePost(postId, comment).then(function () {
            card.style.opacity = '0.4';
            card.querySelector('.review-card-actions').innerHTML = '<span style="color:var(--text-tertiary);">✓ ' + t('statusApproved') + '</span>';
          });
        }
      });
    }

    // Reject buttons
    var rejectBtns = document.querySelectorAll('.btn-reject');
    for (var j = 0; j < rejectBtns.length; j++) {
      rejectBtns[j].addEventListener('click', function () {
        var card = this.closest('.review-card');
        var postId = card.getAttribute('data-post-id');
        var commentInput = card.querySelector('.review-comment-input');
        var comment = commentInput ? commentInput.value : '';
        if (confirm(t('reviewRejectConfirm'))) {
          rejectPost(postId, comment).then(function () {
            card.style.opacity = '0.4';
            card.querySelector('.review-card-actions').innerHTML = '<span style="color:#ef4444;">✕ ' + t('statusRejected') + '</span>';
          });
        }
      });
    }
  }

  function bindUserEvents() {
    // Role change
    var selects = document.querySelectorAll('.admin-role-select');
    for (var i = 0; i < selects.length; i++) {
      selects[i].addEventListener('change', function () {
        var uid = this.getAttribute('data-uid');
        var newRole = this.value;
        updateUserRole(uid, newRole).then(function () {
          alert(t('userRoleUpdated') || '角色已更新');
        });
      });
    }

    // Delete user
    var deleteBtns = document.querySelectorAll('.btn-delete-user');
    for (var j = 0; j < deleteBtns.length; j++) {
      deleteBtns[j].addEventListener('click', function () {
        var uid = this.getAttribute('data-uid');
        if (confirm(t('confirmDeleteUser'))) {
          // Delete from Firestore (auth deletion requires admin SDK)
          usersRef().doc(uid).remove().then(function () {
            alert(t('adminPostDeleted'));
            window.location.reload();
          }).catch(function () {
            alert(t('authUnknownError'));
          });
        }
      });
    }
  }

  function bindPostManagementEvents() {
    // Edit post
    var editBtns = document.querySelectorAll('.btn-edit-post');
    for (var i = 0; i < editBtns.length; i++) {
      editBtns[i].addEventListener('click', function () {
        var postId = this.getAttribute('data-post-id');
        if (postId) {
          window.location.hash = '#/admin/edit/' + postId;
        }
      });
    }

    // Delete post
    var deleteBtns = document.querySelectorAll('.btn-delete-post');
    for (var j = 0; j < deleteBtns.length; j++) {
      deleteBtns[j].addEventListener('click', function () {
        var postId = this.getAttribute('data-post-id');
        if (postId && confirm(t('adminConfirmDelete'))) {
          deletePost(postId).then(function () {
            alert(t('adminPostDeleted'));
            window.location.hash = '#/admin/posts';
          });
        }
      });
    }
  }

  function bindEditorEvents(originalPost) {
    var backBtn = document.getElementById('adminBack');
    var saveBtn = document.getElementById('adminSave');
    var addTagBtn = document.getElementById('adminAddTag');

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        window.history.back();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        savePostFromForm(originalPost);
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

  function bindSubmitEvents() {
    var form = document.getElementById('submitPostForm');
    var addTagBtn = document.getElementById('submitAddTag');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = collectFormData(form);
        if (!data.title.zh && !data.title.en) {
          alert(t('adminValidationTitle'));
          return;
        }
        if (!data.content.zh && !data.content.en) {
          alert((t('contentRequired') || '请填写正文内容'));
          return;
        }

        Auth.submitPost(data).then(function () {
          document.getElementById('main').innerHTML = renderSubmitPost(t('postSubmitted'));
        }).catch(function (err) {
          alert(err.message);
        });
      });
    }

    if (addTagBtn) {
      addTagBtn.addEventListener('click', function () {
        var container = document.getElementById('submitTagsContainer');
        var index = container.children.length;
        var row = document.createElement('div');
        row.innerHTML = renderTagRow({ zh: '', en: '' }, index);
        container.appendChild(row.firstElementChild);
        bindSubmitTagRemoveEvents();
      });
    }

    bindSubmitTagRemoveEvents();
  }

  function bindSubmitTagRemoveEvents() {
    var removeBtns = document.querySelectorAll('#submitTagsContainer .admin-remove-tag');
    for (var i = 0; i < removeBtns.length; i++) {
      removeBtns[i].onclick = function () {
        this.parentElement.remove();
      };
    }
  }

  function bindLoginRequiredEvents() {
    var btn = document.getElementById('adminGoLogin');
    if (btn) {
      btn.addEventListener('click', function () {
        Auth.showModal('login');
      });
    }
  }

  function collectFormData(form) {
    var data = {};
    var inputs = form.querySelectorAll('input, textarea, select');
    for (var i = 0; i < inputs.length; i++) {
      data[inputs[i].name] = inputs[i].value;
    }

    // Build tags
    var tagContainer = form.querySelector('.admin-tags-editor');
    var tagRows = tagContainer ? tagContainer.querySelectorAll('.admin-tag-row') : [];
    var tags = [];
    for (var j = 0; j < tagRows.length; j++) {
      var zhInput = tagRows[j].querySelector('[name^="tagZh_"]');
      var enInput = tagRows[j].querySelector('[name^="tagEn_"]');
      if (zhInput && enInput) {
        var zh = zhInput.value.trim();
        var en = enInput.value.trim();
        if (zh || en) tags.push({ zh: zh, en: en });
      }
    }

    return {
      title: { zh: data.titleZh || '', en: data.titleEn || '' },
      summary: { zh: data.summaryZh || '', en: data.summaryEn || '' },
      content: { zh: data.contentZh || '', en: data.contentEn || '' },
      category: { zh: data.categoryZh || '', en: data.categoryEn || '' },
      tags: tags,
      slug: data.slug || '',
      date: data.date || new Date().toISOString().split('T')[0],
    };
  }

  function savePostFromForm(originalPost) {
    var form = document.getElementById('adminEditorForm');
    if (!form) return;

    var postData = collectFormData(form);
    var postId = form.querySelector('[name="_id"]').value;

    if (!postData.title.zh && !postData.title.en) {
      alert(t('adminValidationTitle'));
      return;
    }

    if (postId && originalPost) {
      // Update existing Firestore post
      updatePost(postId, {
        title: postData.title,
        summary: postData.summary,
        content: postData.content,
        category: postData.category,
        tags: postData.tags,
        slug: postData.slug,
      }).then(function () {
        alert(t('adminPostUpdated'));
        window.location.hash = '#/admin/posts';
      }).catch(function (err) {
        alert(err.message);
      });
    } else {
      // Create new post as admin (auto-approved)
      var doc = postData;
      doc.authorId = Auth.getCurrentUser().uid;
      doc.authorName = Auth.getCurrentUser().displayName || 'Admin';
      doc.status = 'approved';
      doc.createdAt = db.serverDate();
      doc.reviewComment = '';
      doc.reviewedBy = '';
      doc.reviewedAt = null;

      postsRef().add(doc).then(function () {
        alert(t('adminPostCreated'));
        window.location.hash = '#/admin/posts';
      }).catch(function (err) {
        alert(err.message);
      });
    }
  }

  // ==========================================
  // Helpers
  // ==========================================

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==========================================
  // Main Render Dispatcher
  // ==========================================

  function render(route) {
    // Check if admin editor
    if (route.page === 'admin' && route.sub === 'edit' && route.slug) {
      if (!isLoggedIn()) return renderLoginRequired();
      // The slug is the Firestore post ID
      return '<div class="admin-dashboard"><p style="text-align:center;padding:40px;color:var(--text-tertiary);">' +
        (t('loading') || '加载中...') + '</p></div>';
    }

    // Submit post page
    if (route.page === 'submit') {
      return renderSubmitPost();
    }

    // Admin dashboard
    if (route.page === 'admin') {
      return renderDashboard(route.sub);
    }

    return renderLoginRequired();
  }

  function bindEvents(route) {
    // Admin editor (async load post data)
    if (route.page === 'admin' && route.sub === 'edit' && route.slug) {
      postsRef().doc(route.slug).get().then(function (res) {
          var data = res.data || [];
          if (data.length > 0) {
            var post = docToPost(data[0]);
            document.getElementById('main').innerHTML = renderEditor(post);
            bindEditorEvents(post);
          } else {
            document.getElementById('main').innerHTML = renderDashboard('posts');
            bindDashboardEvents();
          }
        }).catch(function () {
        window.location.hash = '#/admin/posts';
      });
      return;
    }

    // Submit page
    if (route.page === 'submit') {
      bindSubmitEvents();
      return;
    }

    // Admin dashboard
    if (route.page === 'admin') {
      if (!isLoggedIn()) {
        bindLoginRequiredEvents();
        return;
      }
      bindDashboardEvents();
      return;
    }
  }

  // ==========================================
  // Export (download Firestore posts as JS)
  // ==========================================

  function exportPostsJS() {
    return getAllPosts().then(function (allPosts) {
      var content = '/**\n * Blog Posts Data\n * Exported from Firestore on ' +
        new Date().toISOString().split('T')[0] + '\n */\n\nvar posts = ' +
        JSON.stringify(allPosts, null, 2) + ';\n';
      return content;
    });
  }

  function downloadPostsJS() {
    exportPostsJS().then(function (content) {
      var blob = new Blob([content], { type: 'application/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'posts.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(t('adminExportDone'));
    });
  }

  // ==========================================
  // Public API
  // ==========================================

  return {
    isLoggedIn: isLoggedIn,
    ensureAdmin: ensureAdmin,
    render: render,
    bindEvents: bindEvents,
    approvePost: approvePost,
    rejectPost: rejectPost,
    downloadPostsJS: downloadPostsJS,
    getAllPosts: getAllPosts,
  };
})();
