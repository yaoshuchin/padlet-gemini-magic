import fs from 'fs';
import path from 'path';

const srcDir = 'c:/antigravity/1151025AI專家系統建置練習';
const destDir = 'c:/antigravity/1151025Gemini就是神奇';

// 1. Copy images
const srcImgDir = path.join(srcDir, 'assets/images');
const destImgDir = path.join(destDir, 'assets/images');
fs.mkdirSync(destImgDir, { recursive: true });

if (fs.existsSync(srcImgDir)) {
  const files = fs.readdirSync(srcImgDir);
  for (const f of files) {
    if (f === 'wallpaper.png') {
      fs.copyFileSync(path.join(srcImgDir, f), path.join(destImgDir, 'ai_wallpaper.png'));
    } else {
      const newName = f.startsWith('img_') ? f.replace('img_', 'ai_img_') : `ai_${f}`;
      fs.copyFileSync(path.join(srcImgDir, f), path.join(destImgDir, newName));
    }
  }
  console.log(`Copied ${files.length} images from AI專家系統建置練習`);
}

// 2. Copy files
const srcFilesDir = path.join(srcDir, 'assets/files');
const destFilesDir = path.join(destDir, 'assets/files');
fs.mkdirSync(destFilesDir, { recursive: true });

if (fs.existsSync(srcFilesDir)) {
  const files = fs.readdirSync(srcFilesDir);
  for (const f of files) {
    const newName = f.startsWith('file_') ? f.replace('file_', 'ai_file_') : `ai_${f}`;
    fs.copyFileSync(path.join(srcFilesDir, f), path.join(destFilesDir, newName));
  }
  console.log(`Copied ${files.length} files from AI專家系統建置練習`);
}

// 3. Build data_ai_expert.js
const srcDataJs = fs.readFileSync(path.join(srcDir, 'data.js'), 'utf8');
// Extract the JSON object inside window.PADLET_DATA = { ... };
const jsonMatch = srcDataJs.match(/window\.PADLET_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
if (jsonMatch) {
  const rawData = JSON.parse(jsonMatch[1]);
  
  // Transform cards to match unified schema
  const unifiedCards = rawData.cards.map((c, idx) => {
    let localImg = c.local_image || '';
    if (localImg) {
      const base = path.basename(localImg);
      localImg = 'assets/images/' + (base.startsWith('img_') ? base.replace('img_', 'ai_img_') : `ai_${base}`);
    }
    let localFile = c.local_file || '';
    if (localFile) {
      const base = path.basename(localFile);
      localFile = 'assets/files/' + (base.startsWith('file_') ? base.replace('file_', 'ai_file_') : `ai_${base}`);
    }

    // Determine color label and badge class
    let colorLabel = '資料';
    let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200';
    if (c.platform === 'Poe') {
      colorLabel = '工具';
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200';
    } else if (c.platform === 'Edcafe AI') {
      colorLabel = '實作';
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200';
    } else if (c.platform === 'ChatGPT' || c.platform === 'HuggingChat') {
      colorLabel = '範例';
      badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200';
    }

    return {
      id: c.id,
      title: c.title,
      body: c.description || c.clean_body || c.body || '',
      section_title: c.category || '專家系統',
      color_label: colorLabel,
      color_name: c.color || 'yellow',
      badge_class: badgeClass,
      local_image: localImg,
      local_file: localFile,
      link: c.url || c.permalink || '',
      link_label: c.platform ? `${c.platform} 機器人` : '前往專家系統',
      link_type: 'expert',
      comments: c.author ? [{ body: `作者/教師：${c.author} | 平台：${c.platform || 'AI'} | 領域：${c.category}` }] : []
    };
  });

  // Group into sections by category
  const categories = Object.keys(rawData.stats.categories || {});
  const sections = categories.map((cat, sIdx) => {
    const secCards = unifiedCards.filter(c => c.section_title === cat);
    return {
      id: `ai-sec-${sIdx + 1}`,
      title: cat,
      cards_count: secCards.length,
      cards: secCards
    };
  });

  const boardObj = {
    title: 'AI專家系統建置練習',
    subtitle: rawData.subtitle,
    description: '涵蓋 141 位教師自製專家機器人 (Edcafe AI × Poe × ChatGPT)',
    original_url: rawData.original_url,
    creator: rawData.creator,
    wallpaper: 'assets/images/ai_wallpaper.png',
    total_cards: unifiedCards.length,
    total_sections: sections.length,
    sections: sections,
    cards: unifiedCards
  };

  const outJs = `// AI專家系統建置練習 - 離線資料集\nwindow.AI_EXPERT_BOARD_DATA = ${JSON.stringify(boardObj, null, 2)};\n`;
  fs.writeFileSync(path.join(destDir, 'data_ai_expert.js'), outJs, 'utf8');
  console.log(`Generated data_ai_expert.js with ${unifiedCards.length} cards in ${sections.length} sections!`);
}
