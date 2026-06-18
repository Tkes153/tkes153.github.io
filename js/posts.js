/**
 * Blog Posts Data
 * Each post has bilingual titles, summaries, and full content.
 * Categorized by dream type: 美梦 (Sweet) / 噩梦 (Nightmare) / 怪梦 (Weird)
 */

var posts = [
  {
    slug: 'a-sweet-dream',
    date: '2026-06-18',
    category: { zh: '美梦', en: 'Sweet Dreams' },
    tags: [
      { zh: '美梦', en: 'Sweet Dream' },
      { zh: '测试', en: 'Test' },
    ],
    title: {
      zh: '一场温暖的美梦',
      en: 'A Warm Sweet Dream',
    },
    summary: {
      zh: '在梦中，我回到了童年的老屋，阳光透过窗棂洒在地板上，一切都那么宁静美好。',
      en: 'In the dream, I returned to my childhood home, sunlight filtering through the window onto the wooden floor. Everything was peaceful and beautiful.',
    },
    content: {
      zh: '<p>昨夜我做了一个很美很美的梦。</p>' +
          '<p>梦里我回到了小时候住的老房子。阳光透过木窗棂洒在木地板上，空气中飘着妈妈做饭的香味。院子里那棵老槐树还在，树下放着爷爷的藤椅。</p>' +
          '<p>我坐在门槛上，看着蝴蝶在花丛中飞舞。一切都那么安静，那么温暖。没有烦恼，没有压力，只有纯粹的美好。</p>' +
          '<p>醒来时枕边湿了一片，但嘴角是上扬的。也许这就是美梦的意义——让我们记得，世界曾经温柔待我们，未来也值得期待。</p>',
      en: '<p>Last night I had a truly beautiful dream.</p>' +
          '<p>I went back to the old house where I grew up. Sunlight streamed through wooden window frames onto the floor, and the air was filled with the aroma of my mother\'s cooking. The old locust tree still stood in the yard, with grandfather\'s rattan chair beneath it.</p>' +
          '<p>I sat on the doorstep, watching butterflies dance among the flowers. Everything was quiet and warm. No worries, no pressure — just pure beauty.</p>' +
          '<p>When I woke up, my pillow was damp but there was a smile on my face. Perhaps that\'s the meaning of sweet dreams — to remind us that the world was once gentle with us, and the future is worth looking forward to.</p>',
    },
  },

  {
    slug: 'a-terrible-nightmare',
    date: '2026-06-17',
    category: { zh: '噩梦', en: 'Nightmares' },
    tags: [
      { zh: '噩梦', en: 'Nightmare' },
      { zh: '测试', en: 'Test' },
    ],
    title: {
      zh: '那个让我惊醒的噩梦',
      en: 'The Nightmare That Woke Me Up',
    },
    summary: {
      zh: '无尽的长廊，身后越来越近的脚步声，想跑却迈不动腿——典型的噩梦，却让我想了很多。',
      en: 'Endless corridors, footsteps growing closer behind me, wanting to run but unable to move my legs — a classic nightmare that made me think.',
    },
    content: {
      zh: '<p>已经是连续第三天了。凌晨三点，我从同一个噩梦中惊醒。</p>' +
          '<p>梦里我在一条没有尽头的走廊里。墙壁是暗绿色的，像是某种生物的皮肤。身后有脚步声，不紧不慢，却越来越近。我想跑，但双腿像灌了铅一样沉重。</p>' +
          '<p>走廊两侧有无数的门，每一扇都打不开。直到最后一扇——我推开门，看到的是一面镜子，镜子里是我的脸，但眼睛是绿色的，像猫一样，正对着我笑。</p>' +
          '<p>每次梦到这里我就醒了。或许我们最深的恐惧并不是未知的追逐者，而是那个我们不愿面对的、镜中的自己。</p>',
      en: '<p>Three nights in a row. 3 AM, I jolted awake from the same nightmare.</p>' +
          '<p>I was in an endless corridor. The walls were dark green, like the skin of some creature. Footsteps behind me — unhurried, yet growing closer. I tried to run, but my legs felt like lead.</p>' +
          '<p>Countless doors lined both sides of the corridor, and every single one was locked. Until the very last one — I pushed it open and saw a mirror. In the mirror was my own face, but the eyes were green, like a cat\'s, smiling back at me.</p>' +
          '<p>I always wake up at this point. Perhaps our deepest fear isn\'t the unknown pursuer, but the version of ourselves in the mirror that we refuse to face.</p>',
    },
  },

  {
    slug: 'a-weird-surreal-dream',
    date: '2026-06-16',
    category: { zh: '怪梦', en: 'Weird Dreams' },
    tags: [
      { zh: '怪梦', en: 'Weird Dream' },
      { zh: '测试', en: 'Test' },
    ],
    title: {
      zh: '光怪陆离的梦境漫游',
      en: 'A Bizarre Dreamscape Journey',
    },
    summary: {
      zh: '天空是紫色的，鱼在空气中游动，我在和一只戴礼帽的猫下棋——怪诞却又逻辑自洽的梦。',
      en: 'The sky was purple, fish swam through the air, and I was playing chess with a top-hat-wearing cat — bizarre yet internally logical.',
    },
    content: {
      zh: '<p>如果说美梦是温暖的港湾，噩梦是黑暗的深渊，那么怪梦就是一座没有重力的美术馆。</p>' +
          '<p>天空是深紫色的，像打翻的葡萄汁。云朵是几何形状的——正方形、三角形、六边形，排列得像数学课本上的图案。鱼在空气中游来游去，鳞片反射着不知从哪来的光。</p>' +
          '<p>我坐在一张漂浮的棋盘前，对面是一只戴着礼帽的猫。它用爪子推了一步棋，然后优雅地喝了口茶。“该你了，”它的嘴唇没有动，但我听到了声音。</p>' +
          '<p>梦里的逻辑总是自洽的。你接受一切荒谬的设定，就像那是世界上最自然的事情。醒来后我画了整整一上午，试图记住那些转瞬即逝的画面。</p>',
      en: '<p>If sweet dreams are warm harbors and nightmares are dark abysses, then weird dreams are weightless art galleries.</p>' +
          '<p>The sky was deep purple, like spilled grape juice. The clouds were geometric shapes — squares, triangles, hexagons — arranged like a math textbook illustration. Fish swam through the air, their scales reflecting light from an unknown source.</p>' +
          '<p>I sat at a floating chessboard across from a cat wearing a top hat. It pushed a piece with its paw, then elegantly sipped some tea. "Your move," I heard, though its lips never moved.</p>' +
          '<p>The logic of dreams is always internally consistent. You accept every absurd premise as if it were the most natural thing in the world. After waking, I spent the entire morning drawing, trying to capture those fleeting images.</p>',
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
 */
function getPosts() {
  // Try CloudBase first
  if (typeof db !== 'undefined') {
    return db.collection('posts')
      .where({ status: 'approved' })
      .get()
      .then(function (res) {
        var cloudPosts = [];
        var data = res.data || [];
        for (var i = 0; i < data.length; i++) {
          var doc = data[i];
          doc._id = doc._id || '';
          if (doc.createdAt instanceof Date) {
            doc.date = doc.createdAt.toISOString().split('T')[0];
          } else if (doc.createdAt && typeof doc.createdAt === 'number') {
            doc.date = new Date(doc.createdAt).toISOString().split('T')[0];
          }
          cloudPosts.push(doc);
        }
        // Sort in JS instead of CloudBase (avoids index requirement)
        cloudPosts.sort(function (a, b) {
          return new Date(b.date || 0) - new Date(a.date || 0);
        });

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
        console.warn('CloudBase fetch failed, using bundled posts:', err);
        return posts;
      });
  }

  // Fallback: bundled posts only
  return Promise.resolve(posts);
}
