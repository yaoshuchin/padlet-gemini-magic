import fs from 'fs';
import path from 'path';

const baseDir = 'c:/antigravity/1151025Gemini就是神奇';
const imgDir = path.join(baseDir, 'assets/images');
const filesDir = path.join(baseDir, 'assets/files');

fs.mkdirSync(imgDir, { recursive: true });
fs.mkdirSync(filesDir, { recursive: true });

const colorMap = {
  yellow: { label: '資料', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200' },
  orange: { label: '資料', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200' },
  white: { label: '資料', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200' },
  red: { label: '範例', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200' },
  coral: { label: '範例', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200' },
  blue: { label: '工具', badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200' },
  oceanic: { label: '工具', badge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/40 dark:text-sky-200' },
  green: { label: '實作', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200' },
  lime: { label: '實作', badge: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/40 dark:text-lime-200' },
  purple: { label: '資料', badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-200' }
};

const boardConfigs = [
  {
    key: 'interactive_web',
    varName: 'IW_BOARD_DATA',
    title: '互動網頁實作',
    subtitle: '國小教學與教學輔助 · AI 互動網頁與教材設計成果集',
    description: 'PARTS 提示詞框架、引導小幫手與教師互動網頁成品',
    url: 'https://padlet.com/inforissuescounseling/padlet-3p2828w2uj1n79gs',
    prefix: 'iw',
    wallpaper: 'assets/images/wallpaper.png',
    dir: 'data_interactive_web'
  },
  {
    key: 'ai_sketch',
    varName: 'AS_BOARD_DATA',
    title: 'AI素描課-圖片摹寫',
    subtitle: 'AI 視覺摹寫與提示詞生成實踐 · 人物、景物、事件與四格漫畫專題',
    description: '從發散到聚焦、圖像細節摹寫與提示詞藝術風格案例全覽',
    url: 'https://padlet.com/inforissuescounseling/ai-1wamrh40ew4rj3wj',
    prefix: 'as',
    wallpaper: 'assets/images/gm_wallpaper.jpg',
    dir: 'data_ai_sketch'
  },
  {
    key: 'text_to_slides',
    varName: 'TS_BOARD_DATA',
    title: '文生簡報',
    subtitle: '文字一鍵生成教學簡報 · Gamma / Canvas / Gemini 雙刀流實戰應用',
    description: '文生簡報實作、版面結構化思維與課堂教案簡報生成成果',
    url: 'https://padlet.com/infor_issues_counseling_group/padlet-n1h3vafb774zkccg',
    prefix: 'ts',
    wallpaper: 'assets/images/wallpaper.png',
    dir: 'data_text_to_slides'
  },
  {
    key: 'music_creation',
    varName: 'MC_BOARD_DATA',
    title: '歌曲創作',
    subtitle: 'AI 音樂與歌詞創作工坊 · Suno / Udio / Gem 跨領域音樂教學',
    description: '教學歌曲創作、歌詞發想、旋律風格設計與課堂音樂專題',
    url: 'https://padlet.com/severalplacescience/padlet-8nj7hyvlkghogyvh',
    prefix: 'mc',
    wallpaper: 'assets/images/gm_wallpaper.jpg',
    dir: 'data_music_creation'
  },
  {
    key: 'notebooklm_projects',
    varName: 'NP_BOARD_DATA',
    title: 'NotebookLM教學專案產出',
    subtitle: 'NotebookLM 逆天神應用 · 跨學科專案研究、音訊對話與知識庫建置',
    description: '黃標是資料、紅標有範例、藍標歸工具、綠標要實作',
    url: 'https://padlet.com/severalplacescience/notebooklm-5uvnt2kvsu2po18h',
    prefix: 'np',
    wallpaper: 'assets/images/wallpaper.png',
    dir: 'data_notebooklm_projects'
  },
  {
    key: 'prompt_architecture',
    varName: 'PA_BOARD_DATA',
    title: '提示詞架構練習',
    subtitle: '從提問到精準提示 · PARTS 結構化提示詞與教學工作流全案庫',
    description: '涵蓋各領域教師之優質提示詞模板、情境設計與延伸實作成果',
    url: 'https://padlet.com/severalplacescience/padlet-np68pg4pklz341r0',
    prefix: 'pa',
    wallpaper: 'assets/images/gm_wallpaper.jpg',
    dir: 'data_prompt_architecture'
  }
];

// Concurrent Downloader Queue
async function downloadQueue(tasks, concurrency = 20) {
  let index = 0;
  let completed = 0;
  let failed = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = tasks[index++];
      try {
        if (fs.existsSync(current.dest) && fs.statSync(current.dest).size > 0) {
          completed++;
          continue;
        }
        const res = await fetch(current.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (res.ok) {
          const buf = await res.arrayBuffer();
          fs.writeFileSync(current.dest, Buffer.from(buf));
          completed++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
      if ((completed + failed) % 50 === 0 || completed + failed === tasks.length) {
        console.log(`Download progress: ${completed + failed} / ${tasks.length} (Success: ${completed}, Failed: ${failed})`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  console.log(`Queue completed: ${completed} downloaded, ${failed} failed.`);
}

async function processBoard(cfg) {
  console.log(`\n========================================`);
  console.log(`Processing [${cfg.key}] ${cfg.title}...`);
  console.log(`========================================`);

  const dataDir = path.join(baseDir, cfg.dir);
  const files = fs.readdirSync(dataDir);

  // 1. Collect all unique wishes
  const wishesMap = new Map();
  for (const f of files) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
      if (json.data && Array.isArray(json.data) && json.data[0]?.type === 'wish') {
        for (const w of json.data) {
          if (w.id) wishesMap.set(String(w.id), w);
        }
      }
    } catch(e) {}
  }
  const wishes = Array.from(wishesMap.values());
  console.log(`Found ${wishes.length} unique wishes for ${cfg.title}`);

  // 2. Collect sections
  const secMap = new Map();
  const secFiles = files.filter(f => f.includes('sections'));
  for (const sf of secFiles) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dataDir, sf), 'utf8'));
      if (json.data && Array.isArray(json.data)) {
        for (const s of json.data) {
          secMap.set(String(s.id), s.attributes?.title || `Section ${s.id}`);
        }
      }
    } catch(e) {}
  }
  console.log(`Found ${secMap.size} sections in sections files`);

  // Sort wishes
  wishes.sort((a, b) => {
    if (a.attributes.sort_index !== undefined && b.attributes.sort_index !== undefined) {
      return a.attributes.sort_index - b.attributes.sort_index;
    }
    return new Date(a.attributes.created_at).getTime() - new Date(b.attributes.created_at).getTime();
  });

  // Prepare download tasks
  const downloadTasks = [];
  const processedCards = [];
  const colorStats = { '資料': 0, '範例': 0, '工具': 0, '實作': 0 };

  for (const w of wishes) {
    const a = w.attributes;
    const wid = String(w.id);
    const sid = String(a.wall_section_id || '');
    const secTitle = secMap.get(sid) || (secMap.size > 0 ? `其他資源` : `教學精選成果`);

    const rawColor = a.color || 'white';
    const colorInfo = colorMap[rawColor] || colorMap.white;
    colorStats[colorInfo.label] = (colorStats[colorInfo.label] || 0) + 1;

    // Title
    let title = (a.headline || a.subject || a.attachment_link?.title || '').trim();
    if (!title || title === '空白') {
      title = (a.attachment_link?.title || a.subject || '').trim();
    }
    if (!title && a.attachment) {
      try {
        const u = new URL(a.attachment);
        title = decodeURIComponent(u.pathname.split('/').pop() || a.attachment);
      } catch(e) {
        title = a.attachment;
      }
    }
    if (!title) title = '教學重點成果';

    // Body
    let body = (a.body || a.attachment_caption || '').trim();

    // Link
    let link = a.attachment || a.attachment_link?.canonical_url || a.attachment_link?.url || '';
    let linkLabel = '相關連結';
    let linkType = 'link';

    if (link) {
      try {
        const u = new URL(link);
        const host = u.hostname.replace('www.', '');
        if (host.includes('gemini.google.com')) {
          linkType = 'gem';
          linkLabel = 'Gemini 機器人/對話';
        } else if (host.includes('notebooklm.google.com')) {
          linkType = 'notebook';
          linkLabel = 'NotebookLM 筆記本';
        } else if (host.includes('gamma.app')) {
          linkType = 'gamma';
          linkLabel = 'Gamma 簡報';
        } else if (host.includes('suno.com') || host.includes('udio.com')) {
          linkType = 'music';
          linkLabel = 'AI 音樂作品';
        } else if (host.includes('padlet.com')) {
          linkType = 'padlet';
          linkLabel = 'Padlet 成果';
        } else {
          linkLabel = host;
        }
      } catch(e) {}
    }

    // Media & Files
    let localImage = '';
    let localFile = '';

    // Check preview image
    const imgUrl = a.attachment_link?.preview_image?.url || a.wish_content?.attachment_props?.custom_thumbnail_url || a.attachment_link?.image;
    if (imgUrl && !imgUrl.includes('placeholder')) {
      let ext = '.png';
      if (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('f_jpg')) ext = '.jpg';
      if (imgUrl.includes('.webp')) ext = '.webp';
      const destName = `${cfg.prefix}_img_${wid}${ext}`;
      const destPath = path.join(imgDir, destName);
      localImage = `assets/images/${destName}`;
      downloadTasks.push({ url: imgUrl, dest: destPath });
    }

    // Check attachment file
    if (a.attachment && (a.attachment.includes('padletusercontent') || a.attachment.includes('storage.googleapis.com') || /\.(pdf|docx?|pptx?|txt|zip|mp4|mp3|png|jpg|jpeg)$/i.test(a.attachment))) {
      let filename = '';
      try {
        const u = new URL(a.attachment);
        filename = path.basename(u.pathname);
      } catch(e) {
        filename = `${wid}.bin`;
      }
      try { filename = decodeURIComponent(filename); } catch(e) {}
      filename = filename.replace(/[\/\\:*?"<>|]/g, '_');
      if (!filename || filename === '_' || filename.length < 3) filename = `${wid}.bin`;

      const destName = `${cfg.prefix}_file_${wid}_${filename}`;
      const destPath = path.join(filesDir, destName);
      localFile = `assets/files/${destName}`;
      downloadTasks.push({ url: a.attachment, dest: destPath });
      if (!localImage && /\.(png|jpg|jpeg|webp)$/i.test(filename)) {
        localImage = localFile;
      }
    }

    // Comments / Prompts
    const comments = [];
    if (a.attachment_caption && a.attachment_caption !== body) {
      comments.push({ body: a.attachment_caption });
    }

    processedCards.push({
      id: wid,
      title: title,
      body: body,
      section_title: secTitle,
      color_label: colorInfo.label,
      color_name: rawColor,
      badge_class: colorInfo.badge,
      local_image: localImage,
      local_file: localFile,
      link: link,
      link_label: linkLabel,
      link_type: linkType,
      is_pdf: !!(localFile && localFile.endsWith('.pdf')),
      is_video: !!(localFile && localFile.endsWith('.mp4')),
      is_pptx: !!(localFile && (localFile.endsWith('.pptx') || localFile.endsWith('.ppt'))),
      comments: comments
    });
  }

  // Execute downloads for this board
  console.log(`Downloading ${downloadTasks.length} assets for ${cfg.title}...`);
  await downloadQueue(downloadTasks, 20);

  // Group into sections
  const secGroups = new Map();
  for (const c of processedCards) {
    if (!secGroups.has(c.section_title)) secGroups.set(c.section_title, []);
    secGroups.get(c.section_title).push(c);
  }

  const sections = Array.from(secGroups.entries()).map(([secTitle, cards], idx) => ({
    id: `${cfg.prefix}-sec-${idx + 1}`,
    title: secTitle,
    cards_count: cards.length,
    cards: cards
  }));

  const boardDataObj = {
    title: cfg.title,
    subtitle: cfg.subtitle,
    description: cfg.description,
    original_url: cfg.url,
    creator: '臺中市資訊教育議題分團輔導員 (moodlela)',
    wallpaper: cfg.wallpaper,
    total_cards: processedCards.length,
    total_sections: sections.length,
    stats: {
      color_distribution: colorStats
    },
    sections: sections,
    cards: processedCards
  };

  const outJsPath = path.join(baseDir, `data_${cfg.key}.js`);
  const jsContent = `// ${cfg.title} - 離線資料集\nwindow.${cfg.varName} = ${JSON.stringify(boardDataObj, null, 2)};\n`;
  fs.writeFileSync(outJsPath, jsContent, 'utf8');
  console.log(`Generated ${path.basename(outJsPath)} with ${processedCards.length} cards across ${sections.length} sections!`);
}

async function main() {
  for (const cfg of boardConfigs) {
    await processBoard(cfg);
  }
  console.log('\nAll 6 boards datasets and assets successfully built!');
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
