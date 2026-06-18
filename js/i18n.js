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
  const lang = getLang();
  let str = (i18n[lang] && i18n[lang][key]) || i18n['en'][key] || key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.replace('{' + k + '}', vars[k]);
    });
  }
  return str;
}
