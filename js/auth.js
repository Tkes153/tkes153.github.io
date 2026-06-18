/**
 * Auth Module
 * Handles Firebase Authentication: register, login, logout, role checking.
 * Manages header auth UI and login/register modal.
 *
 * Dependencies: firebase-config.js (global `auth`, `db`), i18n.js (global `t()`)
 */

var Auth = (function () {
  'use strict';

  // ==========================================
  // State
  // ==========================================

  var currentUser = null;     // Firebase user object
  var userRole = null;        // 'user' | 'admin' | null
  var listeners = [];         // callbacks called on auth state change
  var authModalVisible = false;

  // ==========================================
  // Core Auth Functions
  // ==========================================

  function isLoggedIn() {
    return currentUser !== null;
  }

  function isAdmin() {
    return userRole === 'admin';
  }

  function getCurrentUser() {
    return currentUser;
  }

  function getUserRole() {
    return userRole;
  }

  /** Fetch user role from Firestore */
  function fetchUserRole(uid) {
    return db.collection('users').doc(uid).get().then(function (doc) {
      if (doc.exists) {
        userRole = doc.data().role || 'user';
      } else {
        userRole = 'user';
      }
      return userRole;
    }).catch(function () {
      userRole = 'user';
      return userRole;
    });
  }

  /** Register a new user with email + password */
  function register(email, password, displayName) {
    return auth.createUserWithEmailAndPassword(email, password).then(function (cred) {
      // Create user document in Firestore
      return db.collection('users').doc(cred.user.uid).set({
        email: email,
        displayName: displayName || email.split('@')[0],
        role: 'user',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(function () {
        return cred.user;
      });
    });
  }

  /** Login with email + password */
  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  /** Logout */
  function logout() {
    return auth.signOut();
  }

  // ==========================================
  // Auth State Listener
  // ==========================================

  function onAuthStateChanged(callback) {
    listeners.push(callback);
  }

  function notifyListeners() {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](currentUser, userRole);
    }
  }

  // Firebase auth state listener
  auth.onAuthStateChanged(function (user) {
    currentUser = user;
    if (user) {
      fetchUserRole(user.uid).then(function () {
        notifyListeners();
      });
    } else {
      userRole = null;
      notifyListeners();
    }
  });

  // ==========================================
  // Header Auth Area Rendering
  // ==========================================

  function renderHeaderAuth() {
    var html = '';
    if (isLoggedIn()) {
      var name = currentUser.displayName || currentUser.email || '';
      var roleLabel = isAdmin() ? ' [' + (t('adminRole') || 'Admin') + ']' : '';
      html += '<span class="header-user-name">' + escHtml(name) + roleLabel + '</span>';
      if (isAdmin()) {
        html += '<a href="#/admin" class="header-auth-link header-admin-link">' + (t('adminPanel') || '后台') + '</a>';
      }
      html += '<a href="#/submit" class="header-auth-link">' + (t('submitPost') || '发帖') + '</a>';
      html += '<button class="header-auth-btn" id="btnLogout">' + (t('logout') || '退出') + '</button>';
    } else {
      html += '<button class="header-auth-btn header-auth-btn-primary" id="btnShowLogin">' + (t('login') || '登录') + '</button>';
      html += '<button class="header-auth-btn" id="btnShowRegister">' + (t('register') || '注册') + '</button>';
    }
    return html;
  }

  function bindHeaderEvents() {
    var btnLogin = document.getElementById('btnShowLogin');
    var btnRegister = document.getElementById('btnShowRegister');
    var btnLogout = document.getElementById('btnLogout');

    if (btnLogin) {
      btnLogin.addEventListener('click', function () {
        showModal('login');
      });
    }
    if (btnRegister) {
      btnRegister.addEventListener('click', function () {
        showModal('register');
      });
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        logout();
      });
    }
  }

  // ==========================================
  // Modal Rendering
  // ==========================================

  function showModal(tab) {
    authModalVisible = true;
    var modal = document.getElementById('authModal');
    if (!modal) return;
    modal.innerHTML = renderModal(tab);
    modal.classList.add('modal-visible');
    bindModalEvents(tab);
  }

  function hideModal() {
    authModalVisible = false;
    var modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('modal-visible');
    modal.innerHTML = '';
  }

  function renderModal(tab) {
    var isLogin = tab === 'login';
    var html = '';
    html += '<div class="modal-overlay" id="modalOverlay"></div>';
    html += '<div class="modal-card">';
    html += '<button class="modal-close" id="modalClose">&times;</button>';
    html += '<div class="auth-tabs">';
    html += '<button class="auth-tab ' + (isLogin ? 'auth-tab-active' : '') + '" data-tab="login">' + (t('login') || '登录') + '</button>';
    html += '<button class="auth-tab ' + (!isLogin ? 'auth-tab-active' : '') + '" data-tab="register">' + (t('register') || '注册') + '</button>';
    html += '</div>';

    if (isLogin) {
      html += '<form id="authForm" class="auth-form">';
      html += '<div class="auth-form-group">';
      html += '<label class="auth-label">' + (t('email') || '邮箱') + '</label>';
      html += '<input type="email" class="auth-input" id="authEmail" placeholder="email@example.com" required autofocus>';
      html += '</div>';
      html += '<div class="auth-form-group">';
      html += '<label class="auth-label">' + (t('password') || '密码') + '</label>';
      html += '<input type="password" class="auth-input" id="authPassword" placeholder="········" required>';
      html += '</div>';
      html += '<p class="auth-error" id="authError" style="display:none;"></p>';
      html += '<button type="submit" class="auth-submit">' + (t('loginBtn') || '登录') + '</button>';
      html += '</form>';
    } else {
      html += '<form id="authForm" class="auth-form">';
      html += '<div class="auth-form-group">';
      html += '<label class="auth-label">' + (t('displayName') || '显示名称') + '</label>';
      html += '<input type="text" class="auth-input" id="authDisplayName" placeholder="' + (t('displayNamePlaceholder') || '你的昵称') + '" required>';
      html += '</div>';
      html += '<div class="auth-form-group">';
      html += '<label class="auth-label">' + (t('email') || '邮箱') + '</label>';
      html += '<input type="email" class="auth-input" id="authEmail" placeholder="email@example.com" required>';
      html += '</div>';
      html += '<div class="auth-form-group">';
      html += '<label class="auth-label">' + (t('password') || '密码') + ' <span class="auth-label-hint">' + (t('passwordHint') || '至少6位') + '</span></label>';
      html += '<input type="password" class="auth-input" id="authPassword" placeholder="········" required minlength="6">';
      html += '</div>';
      html += '<p class="auth-error" id="authError" style="display:none;"></p>';
      html += '<button type="submit" class="auth-submit">' + (t('registerBtn') || '注册') + '</button>';
      html += '</form>';
    }

    html += '</div>';
    return html;
  }

  function bindModalEvents(tab) {
    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    var form = document.getElementById('authForm');
    var tabs = document.querySelectorAll('.auth-tab');

    if (overlay) overlay.addEventListener('click', hideModal);
    if (closeBtn) closeBtn.addEventListener('click', hideModal);

    if (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () {
          var newTab = this.getAttribute('data-tab');
          showModal(newTab);
        });
      }
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('authEmail').value.trim();
        var password = document.getElementById('authPassword').value;
        var errorEl = document.getElementById('authError');

        if (!email || !password) {
          showError(errorEl, t('validationRequired') || '请填写所有必填项');
          return;
        }

        if (tab === 'register') {
          var displayName = document.getElementById('authDisplayName').value.trim();
          if (!displayName) {
            showError(errorEl, t('validationRequired') || '请填写显示名称');
            return;
          }
          if (password.length < 6) {
            showError(errorEl, t('passwordHint') || '密码至少6位');
            return;
          }
          register(email, password, displayName).then(function () {
            hideModal();
          }).catch(function (err) {
            showError(errorEl, translateFirebaseError(err));
          });
        } else {
          login(email, password).then(function () {
            hideModal();
          }).catch(function (err) {
            showError(errorEl, translateFirebaseError(err));
          });
        }
      });
    }
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  /** Translate common Firebase auth errors to user-friendly messages */
  function translateFirebaseError(err) {
    var code = err.code || '';
    var map = {
      'auth/email-already-in-use': t('authEmailInUse') || '该邮箱已被注册',
      'auth/invalid-email': t('authInvalidEmail') || '邮箱格式不正确',
      'auth/weak-password': t('authWeakPassword') || '密码强度不够，请至少使用6位密码',
      'auth/user-not-found': t('authUserNotFound') || '该账号不存在',
      'auth/wrong-password': t('authWrongPassword') || '密码错误',
      'auth/invalid-credential': t('authInvalidCredential') || '邮箱或密码错误',
      'auth/too-many-requests': t('authTooManyRequests') || '尝试次数过多，请稍后再试',
      'auth/network-request-failed': t('authNetworkError') || '网络连接失败，请检查网络',
    };
    return map[code] || err.message || (t('authUnknownError') || '发生未知错误');
  }

  // ==========================================
  // Post Submission
  // ==========================================

  function submitPost(postData) {
    if (!isLoggedIn()) {
      return Promise.reject(new Error('Not logged in'));
    }
    var doc = {
      title: postData.title || { zh: '', en: '' },
      summary: postData.summary || { zh: '', en: '' },
      content: postData.content || { zh: '', en: '' },
      category: postData.category || { zh: '', en: '' },
      tags: postData.tags || [],
      slug: postData.slug || generateSlugFromTitle(postData.title),
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email,
      status: 'pending',
      reviewComment: '',
      reviewedBy: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      reviewedAt: null,
    };
    return db.collection('posts').add(doc);
  }

  function generateSlugFromTitle(title) {
    var str = (title && (title.zh || title.en || '')) || '';
    return str
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'post-' + Date.now();
  }

  // ==========================================
  // Helpers
  // ==========================================

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================
  // Public API
  // ==========================================

  return {
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    getCurrentUser: getCurrentUser,
    getUserRole: getUserRole,
    register: register,
    login: login,
    logout: logout,
    onAuthStateChanged: onAuthStateChanged,
    renderHeaderAuth: renderHeaderAuth,
    bindHeaderEvents: bindHeaderEvents,
    showModal: showModal,
    hideModal: hideModal,
    submitPost: submitPost,
  };
})();
