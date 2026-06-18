/**
 * Internationalization (i18n) module
 * Stores all UI translation strings for Chinese and English.
 */

const i18n = {
  zh: {
    siteTitle: '我的博客',
    home: '首页',
    about: '关于',
    blogSubtitle: '记录思考、技术与生活',
    aboutTitle: '关于我',
    aboutName: '你好，我是博主',
    aboutBio: '欢迎来到我的个人博客！这里记录了我对技术、生活和学习的思考。我喜欢编程、写作、徒步和摄影。希望你能在这里找到有趣的内容。',
    aboutContact: '联系方式',
    emailLabel: '邮箱',
    githubLabel: 'GitHub',
    twitterLabel: 'Twitter',
    footerText: '用 ❤️ 和纯 HTML、CSS、JS 构建',
    backToBlog: '← 返回博客',
    readingTime: '{n} 分钟阅读',
    noPosts: '还没有文章',
    noPostsDesc: '博客文章正在路上，请稍后再来查看！',
    pageNotFound: '页面未找到',
    pageNotFoundDesc: '你访问的页面不存在。',
    postedOn: '发布于',
    tagsLabel: '标签',

    // Admin
    adminLogin: '管理员登录',
    adminLoginBtn: '登录',
    adminPassword: '输入密码',
    adminHint: '默认密码：admin123456，登录后请在设置中修改',
    adminWrongPassword: '密码错误，请重试',
    adminDashboard: '文章管理',
    adminNewPost: '新建文章',
    adminExport: '导出 posts.js',
    adminExportDone: '导出成功！将下载的 posts.js 替换服务器上的文件即可',
    adminLogout: '退出登录',
    adminBack: '返回列表',
    adminSave: '保存',
    adminEditPost: '编辑文章',
    adminColTitle: '标题',
    adminColDate: '日期',
    adminColCategory: '分类',
    adminColActions: '操作',
    adminNoPosts: '还没有文章，点击「新建文章」开始吧',
    adminTotalPosts: '共 {n} 篇文章',
    adminDeleted: '已删除',
    adminConfirmDelete: '确定要删除这篇文章吗？',
    adminPostDeleted: '文章已删除',
    adminPostCreated: '文章已创建',
    adminPostUpdated: '文章已更新',
    adminSlugHint: '唯一标识，用于 URL',
    adminDate: '发布日期',
    adminCategoryZh: '分类（中文）',
    adminCategoryEn: '分类（英文）',
    adminTags: '标签',
    adminTagsHint: '每行一个标签，格式：中文, 英文',
    adminAddTag: '添加标签',
    adminTitleZh: '标题（中文）',
    adminTitleEn: '标题（英文）',
    adminSummaryZh: '摘要（中文）',
    adminSummaryEn: '摘要（英文）',
    adminContentZh: '正文（中文）',
    adminContentEn: '正文（英文）',
    adminValidationTitle: '请至少填写一个语言的标题',
  },

  en: {
    siteTitle: 'My Blog',
    home: 'Home',
    about: 'About',
    blogSubtitle: 'Thoughts on tech, life & learning',
    aboutTitle: 'About Me',
    aboutName: "Hi, I'm the Author",
    aboutBio: "Welcome to my personal blog! Here I share my thoughts on technology, life, and learning. I enjoy programming, writing, hiking, and photography. Hope you find something interesting here.",
    aboutContact: 'Get in Touch',
    emailLabel: 'Email',
    githubLabel: 'GitHub',
    twitterLabel: 'Twitter',
    footerText: 'Built with ❤️ using plain HTML, CSS & JS',
    backToBlog: '← Back to Blog',
    readingTime: '{n} min read',
    noPosts: 'No Posts Yet',
    noPostsDesc: 'Blog posts are on the way. Check back soon!',
    pageNotFound: 'Page Not Found',
    pageNotFoundDesc: "The page you're looking for doesn't exist.",
    postedOn: 'Posted on',
    tagsLabel: 'Tags',

    // Admin
    adminLogin: 'Admin Login',
    adminLoginBtn: 'Login',
    adminPassword: 'Enter password',
    adminHint: 'Default password: admin123456. Please change it after logging in.',
    adminWrongPassword: 'Wrong password, please try again',
    adminDashboard: 'Post Management',
    adminNewPost: 'New Post',
    adminExport: 'Export posts.js',
    adminExportDone: 'Export successful! Replace posts.js on your server with the downloaded file.',
    adminLogout: 'Logout',
    adminBack: 'Back to List',
    adminSave: 'Save',
    adminEditPost: 'Edit Post',
    adminColTitle: 'Title',
    adminColDate: 'Date',
    adminColCategory: 'Category',
    adminColActions: 'Actions',
    adminNoPosts: 'No posts yet. Click "New Post" to get started.',
    adminTotalPosts: '{n} posts total',
    adminDeleted: 'Deleted',
    adminConfirmDelete: 'Are you sure you want to delete this post?',
    adminPostDeleted: 'Post deleted',
    adminPostCreated: 'Post created',
    adminPostUpdated: 'Post updated',
    adminSlugHint: 'Unique identifier for the URL',
    adminDate: 'Publish Date',
    adminCategoryZh: 'Category (Chinese)',
    adminCategoryEn: 'Category (English)',
    adminTags: 'Tags',
    adminTagsHint: 'One tag per row, format: Chinese, English',
    adminAddTag: 'Add Tag',
    adminTitleZh: 'Title (Chinese)',
    adminTitleEn: 'Title (English)',
    adminSummaryZh: 'Summary (Chinese)',
    adminSummaryEn: 'Summary (English)',
    adminContentZh: 'Content (Chinese)',
    adminContentEn: 'Content (English)',
    adminValidationTitle: 'Please fill in at least one language title',
  },
};

/** Get current language from localStorage, default to 'zh' */
function getLang() {
  return localStorage.getItem('blog-lang') || 'zh';
}

/** Set language and save to localStorage */
function setLang(lang) {
  localStorage.setItem('blog-lang', lang);
}

/** Translate a key to the given language, with optional variable substitution */
function t(key, vars) {
  var lang = getLang();
  var str = (i18n[lang] && i18n[lang][key]) || i18n['en'][key] || key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.replace('{' + k + '}', vars[k]);
    });
  }
  return str;
}

/** Get localized value from a bilingual field { zh: '...', en: '...' } */
function localized(field) {
  var lang = getLang();
  if (!field) return '';
  return field[lang] || field['en'] || '';
}
