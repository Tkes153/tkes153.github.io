/**
 * Blog Posts Data
 * Each post has bilingual titles, summaries, and full content.
 * Add new posts to this array to publish them.
 */

var posts = [
  {
    slug: 'why-i-love-programming',
    date: '2026-05-15',
    category: { zh: '技术', en: 'Tech' },
    tags: [
      { zh: '编程', en: 'Programming' },
      { zh: '心得', en: 'Reflection' },
    ],
    title: {
      zh: '为什么我热爱编程',
      en: 'Why I Love Programming',
    },
    summary: {
      zh: '编程不仅仅是写代码，它是一种创造性的表达方式，一种解决问题的艺术。在这篇文章中，我分享了我与编程的故事。',
      en: 'Programming is more than writing code — it\'s a creative expression and the art of problem-solving. Here I share my story with programming.',
    },
    content: {
      zh: '<p>我从中学时期第一次接触到编程，那是一台老旧的电脑上的 BASIC 语言。当时我并不知道，这个偶然的尝试会在未来改变我的人生轨迹。</p>' +
          '<h2>创造的乐趣</h2>' +
          '<p>编程最大的魅力在于<strong>创造</strong>。你可以从一个空白的文件开始，通过一行行代码，构建出能够解决实际问题的工具。这种从无到有的过程，让我深深着迷。</p>' +
          '<p>无论是写一个简单的计算器，还是构建一个完整的 Web 应用，每一次看到代码运行成功的那一刻，都让我感到无比的成就感。</p>' +
          '<h2>解决问题的艺术</h2>' +
          '<p>编程本质上是解决问题的过程。面对一个复杂的问题，你需要：</p>' +
          '<ul>' +
          '<li>分析问题的本质</li>' +
          '<li>将大问题分解为小问题</li>' +
          '<li>设计清晰的解决方案</li>' +
          '<li>不断测试和迭代</li>' +
          '</ul>' +
          '<p>这种思维方式不仅适用于编程，也帮助我在生活的其他方面更加理性和有条理。</p>' +
          '<h2>持续学习</h2>' +
          '<p>技术世界瞬息万变，这既是挑战也是机遇。保持好奇心，持续学习新知识，是我在这个领域不断前进的动力。</p>' +
          '<blockquote>编程教会我：世界上没有解决不了的问题，只有还没找到的方法。</blockquote>',
      en: '<p>I first encountered programming in middle school — it was BASIC on an old computer. I had no idea at the time that this accidental discovery would change the course of my life.</p>' +
          '<h2>The Joy of Creation</h2>' +
          '<p>The greatest allure of programming lies in <strong>creation</strong>. You start with a blank file and, line by line, build tools that solve real problems. This process of bringing something into existence from nothing fascinates me deeply.</p>' +
          '<p>Whether it\'s writing a simple calculator or building a complete web application, every time the code runs successfully, I feel an immense sense of accomplishment.</p>' +
          '<h2>The Art of Problem-Solving</h2>' +
          '<p>Programming is fundamentally about problem-solving. When faced with a complex problem, you need to:</p>' +
          '<ul>' +
          '<li>Analyze the essence of the problem</li>' +
          '<li>Break it down into smaller, manageable pieces</li>' +
          '<li>Design a clear solution</li>' +
          '<li>Test and iterate continuously</li>' +
          '</ul>' +
          '<p>This way of thinking applies not only to programming but also helps me be more rational and organized in other aspects of life.</p>' +
          '<h2>Continuous Learning</h2>' +
          '<p>The tech world evolves rapidly — this is both a challenge and an opportunity. Staying curious and continuously learning new things is what drives me forward in this field.</p>' +
          '<blockquote>Programming taught me: there are no unsolvable problems, only solutions yet to be found.</blockquote>',
    },
  },

  {
    slug: 'weekend-hiking-adventure',
    date: '2026-04-28',
    category: { zh: '生活', en: 'Life' },
    tags: [
      { zh: '徒步', en: 'Hiking' },
      { zh: '旅行', en: 'Travel' },
      { zh: '自然', en: 'Nature' },
    ],
    title: {
      zh: '周末徒步之旅：走进山林',
      en: 'A Weekend Hiking Trip: Into the Mountains',
    },
    summary: {
      zh: '远离城市的喧嚣，我踏上了一段周末山林徒步之旅。在山野之间，我找到了内心的平静和重新出发的力量。',
      en: 'Escaping the city noise, I embarked on a weekend mountain hike. Among the hills and forests, I found inner peace and renewed energy.',
    },
    content: {
      zh: '<p>上周末，我决定暂时放下键盘，背上行囊，去城市郊区的山林里走一走。这趟旅程让我重新认识了自然的力量。</p>' +
          '<h2>出发</h2>' +
          '<p>清晨六点，太阳刚刚升起，我已经在路上了。清晨的空气格外清新，带着泥土和青草的气息。远离了电脑屏幕的蓝光，眼前是郁郁葱葱的绿色。</p>' +
          '<h2>山间小径</h2>' +
          '<p>走在蜿蜒的山间小径上，耳边是鸟鸣和溪水的声音。没有手机信号，没有通知提醒，这种<strong>真正的断开连接</strong>让人感到无比自由。</p>' +
          '<p>我沿着溪流行走，看到了几处小瀑布，水质清澈见底。停下来用手捧起一捧水，那种冰凉的感觉瞬间让人精神焕发。</p>' +
          '<h2>山顶的风景</h2>' +
          '<p>经过两个多小时的攀登，终于到达了山顶。俯瞰整座城市，平日里高大的建筑此刻变得像积木一样微小。这种视角的转换，让我对很多事情的看法也发生了变化。</p>' +
          '<blockquote>有时候，我们需要走远一点，才能看清近在咫尺的事物。</blockquote>' +
          '<h2>归来</h2>' +
          '<p>下山的路似乎比上山更快。回到家时虽然身体疲惫，但精神却格外饱满。这次徒步让我明白：保持工作与生活的平衡，定期接触大自然，对于身心健康至关重要。</p>',
      en: '<p>Last weekend, I decided to step away from the keyboard, pack my bag, and head into the mountains on the outskirts of the city. This journey reminded me of the power of nature.</p>' +
          '<h2>Setting Off</h2>' +
          '<p>At 6 AM, as the sun was just rising, I was already on my way. The morning air was especially fresh, carrying the scent of earth and grass. Away from the blue light of computer screens, my eyes were met with lush greenery.</p>' +
          '<h2>Mountain Trails</h2>' +
          '<p>Walking along winding mountain trails, the sounds of birdsong and flowing streams filled my ears. No cell signal, no notifications — this <strong>true disconnection</strong> felt incredibly liberating.</p>' +
          '<p>I followed a stream and discovered several small waterfalls with crystal-clear water. Stopping to scoop up a handful, the icy sensation instantly refreshed my mind.</p>' +
          '<h2>The Summit View</h2>' +
          '<p>After over two hours of climbing, I finally reached the summit. Looking down at the entire city, the towering buildings that usually loom large appeared as tiny as toy blocks. This shift in perspective changed how I view many things.</p>' +
          '<blockquote>Sometimes, we need to step far away to see clearly what\'s right in front of us.</blockquote>' +
          '<h2>Coming Home</h2>' +
          '<p>The descent seemed faster than the ascent. Though my body was tired when I got home, my spirit was remarkably refreshed. This hike reminded me: maintaining work-life balance and regularly connecting with nature is essential for both physical and mental well-being.</p>',
    },
  },

  {
    slug: 'five-ways-to-learn-new-skills',
    date: '2026-04-10',
    category: { zh: '成长', en: 'Growth' },
    tags: [
      { zh: '学习', en: 'Learning' },
      { zh: '方法论', en: 'Methodology' },
      { zh: '自我提升', en: 'Self-Improvement' },
    ],
    title: {
      zh: '学习新技能的五个有效方法',
      en: 'Five Effective Ways to Learn New Skills',
    },
    summary: {
      zh: '在这个快速变化的时代，持续学习新技能至关重要。我总结了五个经过实践检验的高效学习方法，希望能对你有所帮助。',
      en: 'In this rapidly changing world, continuously learning new skills is essential. I\'ve summarized five battle-tested learning methods that I hope will help you.',
    },
    content: {
      zh: '<p>学习新技能是终身成长的关键。经过多年的尝试和总结，我找到了五个特别有效的方法，今天分享给大家。</p>' +
          '<h2>1. 费曼学习法</h2>' +
          '<p>用教别人的方式来学习。如果你不能用简单的语言解释一个概念，说明你还没有真正理解它。试着把学到的知识讲给一个完全不懂的人听，你会发现自己的知识盲区。</p>' +
          '<h2>2. 刻意练习</h2>' +
          '<p>不是重复已经掌握的内容，而是<strong>不断挑战舒适区的边缘</strong>。每次练习都应该比上一次更难一点，这种渐进式的挑战才能带来真正的进步。</p>' +
          '<h2>3. 项目驱动学习</h2>' +
          '<p>与其被动地看教程，不如给自己设定一个具体的项目目标。例如，学编程时直接尝试做一个 todo 应用，比看完一百个视频教程都有效。实践中遇到的问题，会让你记得更牢。</p>' +
          '<h2>4. 间隔重复</h2>' +
          '<p>遗忘是学习的一部分。根据艾宾浩斯遗忘曲线，在即将遗忘的时候进行复习，效果最好。可以使用 Anki 或其他间隔重复工具来安排复习时间。</p>' +
          '<h2>5. 建立知识网络</h2>' +
          '<p>将新知识和已有知识建立连接。孤立的知识点很容易忘记，但当它们和你的经验、已有认知形成网络时，记忆就会变得牢固。学习时多问自己：<strong>这个新知识和我知道的什么有关系？</strong></p>' +
          '<blockquote>最好的投资，就是投资自己。学习永远不嫌晚。</blockquote>',
      en: '<p>Learning new skills is key to lifelong growth. After years of trial and reflection, I\'ve found five particularly effective methods that I\'d like to share.</p>' +
          '<h2>1. The Feynman Technique</h2>' +
          '<p>Learn by teaching. If you can\'t explain a concept in simple terms, you haven\'t truly understood it. Try explaining what you\'ve learned to someone with no background in the subject — you\'ll quickly discover your knowledge gaps.</p>' +
          '<h2>2. Deliberate Practice</h2>' +
          '<p>Don\'t just repeat what you\'ve already mastered. Instead, <strong>constantly push the edge of your comfort zone</strong>. Each practice session should be slightly harder than the last — this progressive challenge is what drives real improvement.</p>' +
          '<h2>3. Project-Driven Learning</h2>' +
          '<p>Rather than passively watching tutorials, set yourself a concrete project goal. For example, when learning to code, building a todo app directly is more effective than watching a hundred video tutorials. Problems you encounter in practice stick with you longer.</p>' +
          '<h2>4. Spaced Repetition</h2>' +
          '<p>Forgetting is part of learning. According to the Ebbinghaus forgetting curve, reviewing just before you\'re about to forget yields the best results. Use tools like Anki to schedule your review sessions.</p>' +
          '<h2>5. Build a Knowledge Network</h2>' +
          '<p>Connect new knowledge with what you already know. Isolated facts are easily forgotten, but when woven into a network with your experience and existing understanding, memory becomes robust. While learning, ask yourself: <strong>How does this relate to something I already know?</strong></p>' +
          '<blockquote>The best investment you can make is in yourself. It\'s never too late to learn.</blockquote>',
    },
  },

  {
    slug: 'the-art-of-minimalism',
    date: '2026-03-22',
    category: { zh: '生活', en: 'Life' },
    tags: [
      { zh: '极简', en: 'Minimalism' },
      { zh: '生活方式', en: 'Lifestyle' },
      { zh: '效率', en: 'Productivity' },
    ],
    title: {
      zh: '极简主义的艺术：少即是多',
      en: 'The Art of Minimalism: Less Is More',
    },
    summary: {
      zh: '极简主义不只关于物质，更是一种思维方式和生活方式。减少不必要的，才能为真正重要的腾出空间。',
      en: 'Minimalism isn\'t just about possessions — it\'s a mindset and a lifestyle. By reducing the unnecessary, we make room for what truly matters.',
    },
    content: {
      zh: '<p>在这个物质和信息过载的时代，极简主义给了我一种新的生活方式。它不仅仅是扔掉多余的东西，更是一种思考什么才是真正重要的方式。</p>' +
          '<h2>从整理房间开始</h2>' +
          '<p>我的极简之旅始于一次大扫除。当我把一年没用过的东西全部清理掉后，房间变得宽敞明亮。更神奇的是，<strong>我的思维也变得清晰了</strong>。物理空间的整洁直接影响了心理空间。</p>' +
          '<h2>数字极简</h2>' +
          '<p>除了物理物品，数字生活也需要极简：</p>' +
          '<ul>' +
          '<li>取消不必要的邮件订阅</li>' +
          '<li>定期清理手机应用</li>' +
          '<li>限制社交媒体使用时间</li>' +
          '<li>保持桌面整洁</li>' +
          '</ul>' +
          '<h2>时间极简</h2>' +
          '<p>时间是每个人最宝贵的资源。学会说「不」，把时间留给真正重要的人和事。当你对一件事说「是」的时候，其实也在对其他事说「不」。</p>' +
          '<blockquote>简单是终极的复杂。——达·芬奇</blockquote>',
      en: '<p>In this age of material and information overload, minimalism has offered me a new way of living. It\'s not just about discarding excess — it\'s a way of thinking about what truly matters.</p>' +
          '<h2>Start with Tidying Up</h2>' +
          '<p>My minimalist journey began with a deep clean. After clearing out everything I hadn\'t used in a year, my room felt spacious and bright. Even more remarkably, <strong>my mind became clearer too</strong>. Physical space directly impacts mental space.</p>' +
          '<h2>Digital Minimalism</h2>' +
          '<p>Beyond physical items, our digital lives need decluttering too:</p>' +
          '<ul>' +
          '<li>Unsubscribe from unnecessary emails</li>' +
          '<li>Regularly clean up phone apps</li>' +
          '<li>Limit social media time</li>' +
          '<li>Keep your desktop clean</li>' +
          '</ul>' +
          '<h2>Time Minimalism</h2>' +
          '<p>Time is everyone\'s most precious resource. Learn to say "no" and reserve your time for people and things that truly matter. Every "yes" to one thing is a "no" to something else.</p>' +
          '<blockquote>Simplicity is the ultimate sophistication. — Leonardo da Vinci</blockquote>',
    },
  },
];

/** Sort posts by date descending (newest first) */
posts.sort(function (a, b) {
  return new Date(b.date) - new Date(a.date);
});

/**
 * Get the effective posts list (async).
 * Loads approved posts from CloudBase, merges with bundled posts.
 * Falls back to bundled posts if CloudBase is unavailable.
 *
 * @returns {Promise<Array>} Sorted array of post objects
 */
function getPosts() {
  // Try CloudBase first
  if (typeof db !== 'undefined') {
    return db.collection('posts')
      .where({ status: 'approved' })
      .orderBy('createdAt', 'desc')
      .get()
      .then(function (res) {
        var cloudPosts = [];
        var data = res.data || [];
        for (var i = 0; i < data.length; i++) {
          var doc = data[i];
          doc._id = doc._id || '';
          // Convert server date to ISO date string
          if (doc.createdAt instanceof Date) {
            doc.date = doc.createdAt.toISOString().split('T')[0];
          } else if (doc.createdAt && typeof doc.createdAt === 'number') {
            doc.date = new Date(doc.createdAt).toISOString().split('T')[0];
          }
          cloudPosts.push(doc);
        }

        // Merge: CloudBase posts + bundled posts (deduplicate by slug)
        var slugs = {};
        for (var j = 0; j < cloudPosts.length; j++) {
          slugs[cloudPosts[j].slug] = true;
        }
        var merged = cloudPosts.slice();
        for (var k = 0; k < posts.length; k++) {
          if (!slugs[posts[k].slug]) {
            merged.push(posts[k]);
          }
        }
        merged.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        return merged;
      })
      .catch(function (err) {
        console.warn('CloudBase fetch failed, using bundled posts:', err.message);
        return posts;
      });
  }

  // Fallback: bundled posts only
  return Promise.resolve(posts);
}
