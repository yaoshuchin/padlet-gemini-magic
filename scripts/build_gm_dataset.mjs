import fs from 'fs';
import path from 'path';

const wishesData = JSON.parse(fs.readFileSync('c:/antigravity/1151025Gemini就是神奇/data_gm/net_10_wishes_72_540.json', 'utf8')).data;
const sectionsData = JSON.parse(fs.readFileSync('c:/antigravity/1151025Gemini就是神奇/data_gm/net_5_wall_sections_2_1019.json', 'utf8')).data;
const startState = JSON.parse(fs.readFileSync('c:/antigravity/1151025Gemini就是神奇/data_gm/net_11_padlet_starting_state_72_539.json', 'utf8'));

const colorMap = {
  yellow: { label: '資料', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200' },
  orange: { label: '資料', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200' },
  white: { label: '資料', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200' },
  red: { label: '範例', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200' },
  coral: { label: '範例', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200' },
  blue: { label: '工具', badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200' },
  oceanic: { label: '工具', badge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/40 dark:text-sky-200' },
  green: { label: '實作', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200' },
  lime: { label: '實作', badge: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/40 dark:text-lime-200' }
};

const imgDir = 'c:/antigravity/1151025Gemini就是神奇/assets/images';
const filesDir = 'c:/antigravity/1151025Gemini就是神奇/assets/files';

const localImages = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
const localFiles = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

const sections = [];
const secMap = new Map();

for (const s of sectionsData) {
  const sid = String(s.id);
  const secObj = {
    id: 'gm-sec-' + sid,
    section_id: sid,
    title: s.attributes.title,
    cards_count: 0,
    cards: []
  };
  sections.push(secObj);
  secMap.set(sid, secObj);
}

// Sort wishes by sort_index or created_at
wishesData.sort((a, b) => {
  if (a.attributes.sort_index !== undefined && b.attributes.sort_index !== undefined) {
    return a.attributes.sort_index - b.attributes.sort_index;
  }
  return new Date(a.attributes.created_at).getTime() - new Date(b.attributes.created_at).getTime();
});

const allCards = [];
const colorStats = { '資料 (黃標)': 0, '範例 (紅標)': 0, '工具 (藍標)': 0, '實作 (綠標)': 0 };

for (const w of wishesData) {
  const attr = w.attributes;
  const wid = String(w.id);
  const sid = String(attr.wall_section_id);
  const sec = secMap.get(sid);

  const rawColor = attr.color || 'white';
  const colorInfo = colorMap[rawColor] || colorMap.white;

  if (colorInfo.label === '資料') colorStats['資料 (黃標)']++;
  else if (colorInfo.label === '範例') colorStats['範例 (紅標)']++;
  else if (colorInfo.label === '工具') colorStats['工具 (藍標)']++;
  else if (colorInfo.label === '實作') colorStats['實作 (綠標)']++;

  let title = (attr.headline || attr.subject || attr.attachment_link?.title || '').trim();
  if (!title || title === '空白') {
    title = (attr.attachment_link?.title || attr.subject || '').trim();
  }
  if (!title && attr.attachment) {
    try {
      const u = new URL(attr.attachment);
      title = decodeURIComponent(u.pathname.split('/').pop() || attr.attachment);
    } catch(e) {
      title = attr.attachment;
    }
  }
  if (!title) title = '教學重點';

  let body = (attr.body || '').trim();

  let link = attr.attachment || attr.attachment_link?.canonical_url || attr.attachment_link?.url || '';
  let linkDomain = '相關連結';
  let linkType = 'link';
  let linkLabel = '網頁連結';

  if (link) {
    try {
      const u = new URL(link);
      linkDomain = u.hostname.replace('www.', '');
      if (linkDomain.includes('gemini.google.com') && link.includes('/gem/')) {
        linkType = 'gem';
        linkLabel = 'Gem 機器人';
      } else if (linkDomain.includes('gemini.google.com') && link.includes('/share/')) {
        linkType = 'gemini-share';
        linkLabel = 'Gemini 對話分享';
      } else if (linkDomain.includes('notebooklm.google.com')) {
        linkType = 'notebook';
        linkLabel = 'NotebookLM 筆記';
      } else if (linkDomain.includes('canva.com') || linkDomain.includes('canva.link')) {
        linkType = 'canva';
        linkLabel = 'Canva 簡報';
      } else if (linkDomain.includes('chromewebstore.google.com')) {
        linkType = 'extension';
        linkLabel = 'Chrome 擴充程式';
      } else if (linkDomain.includes('chatgpt.com')) {
        linkType = 'chatgpt';
        linkLabel = 'ChatGPT 分享';
      } else if (link.endsWith('.pdf')) {
        linkType = 'pdf';
        linkLabel = 'PDF 教材文件';
      }
    } catch(e) {}
  }

  // Find local preview image
  let localImage = '';
  const matchedImg = localImages.find(f => f.startsWith(`gm_img_${wid}.`));
  if (matchedImg) {
    localImage = `assets/images/${matchedImg}`;
  }

  // Find local file
  let localFile = '';
  let isPdf = false;
  let isTxt = false;
  let isPptx = false;
  const matchedFile = localFiles.find(f => f.startsWith(`gm_file_${wid}_`));
  if (matchedFile) {
    localFile = `assets/files/${matchedFile}`;
    if (matchedFile.endsWith('.pdf')) isPdf = true;
    if (matchedFile.endsWith('.txt')) isTxt = true;
    if (matchedFile.endsWith('.pptx')) isPptx = true;
  }

  if (!localImage && localFile && /\.(png|jpg|jpeg|webp)$/i.test(localFile)) {
    localImage = localFile;
  }

  const cardObj = {
    id: wid,
    section_id: sid,
    section_title: sec ? sec.title : '未分類',
    title,
    body,
    color: rawColor,
    color_label: colorInfo.label,
    badge_class: colorInfo.badge,
    link,
    link_domain: linkDomain,
    link_type: linkType,
    link_label: linkLabel,
    local_image: localImage,
    local_file: localFile,
    is_pdf: isPdf,
    is_txt: isTxt,
    is_pptx: isPptx,
    created_at: attr.created_at,
    author: '姚述勤'
  };

  allCards.push(cardObj);
  if (sec) {
    sec.cards.push(cardObj);
    sec.cards_count++;
  }
}

const gmBoardData = {
  title: '公明國中-Gemini Notebook',
  subtitle: 'Google AI 雙刀流與全方位功能實戰 · 從提示詞到自動化工作流看板',
  description: '黃標是資料、紅標有範例、藍標歸工具、綠標要實作',
  original_url: 'https://padlet.com/academiciflimited/gemini-notebook-qdyw32vg7ay8egvc',
  creator: '姚述勤',
  wallpaper: 'assets/images/gm_wallpaper.jpg',
  total_cards: allCards.length,
  total_sections: sections.length,
  stats: {
    color_distribution: colorStats,
    sections: sections.map(s => ({ title: s.title, count: s.cards_count }))
  },
  sections: sections,
  cards: allCards
};

// Write board_data.json
fs.writeFileSync('c:/antigravity/1151025Gemini就是神奇/data_gm/board_data.json', JSON.stringify(gmBoardData, null, 2), 'utf8');

// Write data_gm.js
const dataJsContent = `// 公明國中-Gemini Notebook - 離線資料集
window.GM_BOARD_DATA = ${JSON.stringify(gmBoardData, null, 2)};
`;
fs.writeFileSync('c:/antigravity/1151025Gemini就是神奇/data_gm.js', dataJsContent, 'utf8');

console.log('Successfully generated:');
console.log(' - data_gm/board_data.json');
console.log(' - data_gm.js');
console.log('Total Cards:', allCards.length);
console.log('Total Sections:', sections.length);
console.log('Color Stats:', colorStats);
