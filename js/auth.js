/**
 * Auth Module (CloudBase)
 * Handles authentication: register, login, logout, role checking.
 * Manages header auth UI and login/register modal.
 *
 * Dependencies: cloudbase-config.js (global `app`, `auth`, `db`), i18n.js (global `t()`)
 */

var Auth = (function () {
  'use strict';

  // ==========================================
  // State
  // ==========================================

  var currentUser = null;     // CloudBase user object
  var userRole = null;        // 'user' | 'admin' | null
  var listeners = [];         // callbacks called on auth state change

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

  /** Fetch user role from CloudBase database */
  function fetchUserRole(uid) {
    if (!uid) {
      userRole = null;
      return Promise.resolve(null);
    }
    return db.collection('users').where({ _openid: uid }).get().then(function (res) {
      if (res.data && res.data.length > 0) {
        userRole = res.data[0].role || 'user';
      } else {
        userRole = 'user';
      }
      return userRole;
    }).catch(function () {
      userRole = 'user';
      return userRole;
    });
  }

  /** Step 1: Send verification code to email */
  function sendVerification(email) {
    return auth.getVerification({ email: email });
  }

  /** Step 2: Verify code and complete registration */
  function verifyAndRegister(email, password, displayName, verificationInfo) {
    return auth.verify({
      verification_id: verificationInfo.verification_id,
      verification_code: verificationInfo.verification_code,
    }).then(function (tokenRes) {
      return auth.signUp({
        email: email,
        verification_code: verificationInfo.verification_code,
        verification_token: tokenRes.verification_token,
        password: password,
        name: displayName || email.split('@')[0],
      });
    }).then(function () {
      return auth.getCurrentUser().then(function (user) {
        if (!user) return;
        return db.collection('users').add({
          email: email,
          displayName: displayName || email.split('@')[0],
          role: 'user',
          createdAt: db.serverDate(),
        });
      });
    });
  }

  /** Login with email + password */
  function login(email, password) {
    return auth.signIn({ username: email, password: password });
  }

  /** Logout */
  function logout() {
    return auth.signOut().then(function () {
      localStorage.removeItem('cloudbase_session');
    });
  }

  // ==========================================
  // Auth State Listener (manual)
  // ==========================================

  function onAuthStateChanged(callback) {
    listeners.push(callback);
  }

  function notifyListeners() {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](currentUser, userRole);
    }
  }

  /** Check current auth state and notify listeners */
  function refreshAuthState() {
    return auth.getCurrentUser().then(function (user) {
      currentUser = user;
      if (user && user.uid) {
        return fetchUserRole(user.uid).then(function () {
          notifyListeners();
        });
      } else {
        userRole = null;
        notifyListeners();
      }
    }).catch(function () {
      currentUser = null;
      userRole = null;
      notifyListeners();
    });
  }

  // Initialize on load
  refreshAuthState();

  // ==========================================
  // Header Auth Area Rendering
  // ==========================================

  function renderHeaderAuth() {
    var html = '';
    if (isLoggedIn()) {
      var name = (currentUser.name) || (currentUser.email) || '';
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
      btnLogin.addEventListener('click', function () { showModal('login'); });
    }
    if (btnRegister) {
      btnRegister.addEventListener('click', function () { showModal('register'); });
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        logout().then(function () {
          refreshAuthState();
        });
      });
    }
  }

  // ==========================================
  // Modal Rendering
  // ==========================================

  function showModal(tab) {
    var modal = document.getElementById('authModal');
    if (!modal) return;
    modal.innerHTML = renderModal(tab);
    modal.classList.add('modal-visible');
    bindModalEvents(tab);
  }

  function hideModal() {
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
      html += '<div class="auth-form-group"><label class="auth-label">' + (t('email') || '邮箱') + '</label>';
      html += '<input type="email" class="auth-input" id="authEmail" placeholder="email@example.com" required autofocus></div>';
      html += '<div class="auth-form-group"><label class="auth-label">' + (t('password') || '密码') + '</label>';
      html += '<input type="password" class="auth-input" id="authPassword" placeholder="········" required></div>';
      html += '<p class="auth-error" id="authError" style="display:none;"></p>';
      html += '<button type="submit" class="auth-submit">' + (t('loginBtn') || '登录') + '</button>';
      html += '</form>';
    } else {
      // Register - Step 1: send verification code
      html += '<div id="registerStep1">';
      html += '<form id="authForm" class="auth-form">';
      html += '<div class="auth-form-group"><label class="auth-label">' + (t('displayName') || '显示名称') + '</label>';
      html += '<input type="text" class="auth-input" id="authDisplayName" placeholder="' + (t('displayNamePlaceholder') || '你的昵称') + '" required></div>';
      html += '<div class="auth-form-group"><label class="auth-label">' + (t('email') || '邮箱') + '</label>';
      html += '<input type="email" class="auth-input" id="authEmail" placeholder="email@example.com" required></div>';
      html += '<div class="auth-form-group"><label class="auth-label">' + (t('password') || '密码') + ' <span class="auth-label-hint">' + (t('passwordHint') || '8-32位，含字母和数字') + '</span></label>';
      html += '<input type="password" class="auth-input" id="authPassword" placeholder="········" required minlength="8"></div>';
      html += '<p class="auth-error" id="authError" style="display:none;"></p>';
      html += '<button type="submit" class="auth-submit" id="btnSendCode">' + (t('sendCode') || '发送验证码') + '</button>';
      html += '</form></div>';

      // Register - Step 2: enter verification code (hidden initially)
      html += '<div id="registerStep2" style="display:none;">';
      html += '<form id="authForm2" class="auth-form">';
      html += '<p style="color:var(--accent);text-align:center;margin-bottom:8px;">' + (t('codeSent') || '验证码已发送到你的邮箱') + '</p>';
      html += '<div class="auth-form-group"><label class="auth-label">' + (t('verificationCode') || '验证码') + '</label>';
      html += '<input type="text" class="auth-input" id="authVerificationCode" placeholder="123456" required autofocus></div>';
      html += '<p class="auth-error" id="authError2" style="display:none;"></p>';
      html += '<button type="submit" class="auth-submit">' + (t('registerBtn') || '完成注册') + '</button>';
      html += '<button type="button" class="auth-submit" style="background:var(--bg);color:var(--text);border:1px solid var(--border);margin-top:8px;" id="btnBackStep1">← ' + (t('back') || '返回') + '</button>';
      html += '</form></div>';
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

    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        showModal(this.getAttribute('data-tab'));
      });
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
          if (password.length < 8) {
            showError(errorEl, t('passwordHint') || '密码至少8位');
            return;
          }
          // Step 1: Send verification code
          var btn = document.getElementById('btnSendCode');
          if (btn) { btn.textContent = (t('sending') || '发送中...'); btn.disabled = true; }
          sendVerification(email).then(function (verification) {
            // Store verification info and show step 2
            document.getElementById('registerStep1').style.display = 'none';
            var step2 = document.getElementById('registerStep2');
            step2.style.display = 'block';
            step2.setAttribute('data-verification-id', verification.verification_id);
            // Pre-fill email/password for step 2
            step2.setAttribute('data-email', email);
            step2.setAttribute('data-password', password);
            step2.setAttribute('data-name', displayName);
          }).catch(function (err) {
            if (btn) { btn.textContent = (t('sendCode') || '发送验证码'); btn.disabled = false; }
            showError(errorEl, translateError(err));
          });
        } else {
          login(email, password).then(function () {
            hideModal();
            return refreshAuthState();
          }).catch(function (err) {
            showError(errorEl, translateError(err));
          });
        }
      });
    }

    // Step 2 form
    var form2 = document.getElementById('authForm2');
    if (form2) {
      form2.addEventListener('submit', function (e) {
        e.preventDefault();
        var step2 = document.getElementById('registerStep2');
        var email = step2.getAttribute('data-email');
        var password = step2.getAttribute('data-password');
        var displayName = step2.getAttribute('data-name');
        var verificationId = step2.getAttribute('data-verification-id');
        var code = document.getElementById('authVerificationCode').value.trim();
        var errorEl = document.getElementById('authError2');

        if (!code) {
          showError(errorEl, (t('enterCode') || '请输入验证码'));
          return;
        }

        verifyAndRegister(email, password, displayName, {
          verification_id: verificationId,
          verification_code: code,
        }).then(function () {
          hideModal();
          return refreshAuthState();
        }).catch(function (err) {
          showError(errorEl, translateError(err));
        });
      });
    }

    var backBtn = document.getElementById('btnBackStep1');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        document.getElementById('registerStep2').style.display = 'none';
        document.getElementById('registerStep1').style.display = 'block';
        var btn = document.getElementById('btnSendCode');
        if (btn) { btn.textContent = (t('sendCode') || '发送验证码'); btn.disabled = false; }
      });
    }
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  function translateError(err) {
    var msg = (err && err.message) || '';
    if (msg.indexOf('INVALID_EMAIL') !== -1) return t('authInvalidEmail') || '邮箱格式不正确';
    if (msg.indexOf('EMAIL_ALREADY_EXISTS') !== -1) return t('authEmailInUse') || '该邮箱已被注册';
    if (msg.indexOf('INVALID_PASSWORD') !== -1 || msg.indexOf('PASSWORD') !== -1) return t('authWrongPassword') || '密码错误';
    if (msg.indexOf('USER_NOT_FOUND') !== -1) return t('authUserNotFound') || '该账号不存在';
    if (msg.indexOf('RATE_LIMIT') !== -1) return t('authTooManyRequests') || '尝试次数过多，请稍后再试';
    if (msg.indexOf('NETWORK') !== -1) return t('authNetworkError') || '网络连接失败';
    return msg || (t('authUnknownError') || '发生未知错误');
  }

  // ==========================================
  // Post Submission
  // ==========================================

  function submitPost(postData) {
    if (!isLoggedIn()) {
      return Promise.reject(new Error('Not logged in'));
    }
    var user = getCurrentUser();
    var doc = {
      title: postData.title || { zh: '', en: '' },
      summary: postData.summary || { zh: '', en: '' },
      content: postData.content || { zh: '', en: '' },
      category: postData.category || { zh: '', en: '' },
      tags: postData.tags || [],
      slug: postData.slug || generateSlugFromTitle(postData.title),
      authorId: user.uid,
      authorName: user.name || user.email,
      status: 'pending',
      reviewComment: '',
      reviewedBy: '',
      createdAt: db.serverDate(),
      reviewedAt: null,
    };
    return db.collection('posts').add(doc);
  }

  function generateSlugFromTitle(title) {
    var str = (title && (title.zh || title.en || '')) || '';
    return str.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/[^\x00-\x7F]/g, '').replace(/-+/g, '-')
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
    sendVerification: sendVerification,
    verifyAndRegister: verifyAndRegister,
    login: login,
    logout: logout,
    refreshAuthState: refreshAuthState,
    onAuthStateChanged: onAuthStateChanged,
    renderHeaderAuth: renderHeaderAuth,
    bindHeaderEvents: bindHeaderEvents,
    showModal: showModal,
    hideModal: hideModal,
    submitPost: submitPost,
  };
})();
