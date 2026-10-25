import fs from 'fs';
import path from 'path';

const boardDirs = [
  { key: 'interactive_web', name: '互動網頁實作', dir: 'data_interactive_web' },
  { key: 'ai_sketch', name: 'AI素描課-圖片摹寫', dir: 'data_ai_sketch' },
  { key: 'text_to_slides', name: '文生簡報', dir: 'data_text_to_slides' },
  { key: 'music_creation', name: '歌曲創作', dir: 'data_music_creation' },
  { key: 'notebooklm_projects', name: 'NotebookLM教學專案產出', dir: 'data_notebooklm_projects' },
  { key: 'prompt_architecture', name: '提示詞架構練習', dir: 'data_prompt_architecture' }
];

for (const b of boardDirs) {
  const dirPath = path.resolve(`c:/antigravity/1151025Gemini就是神奇/${b.dir}`);
  const files = fs.readdirSync(dirPath);
  const wishesMap = new Map();

  for (const f of files) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dirPath, f), 'utf8'));
      if (json.data && Array.isArray(json.data) && json.data[0]?.type === 'wish') {
        for (const w of json.data) {
          if (w.id) wishesMap.set(String(w.id), w);
        }
      }
    } catch(e) {}
  }

  let fileUploads = 0;
  let previewImages = 0;
  let externalLinks = 0;

  for (const [wid, w] of wishesMap) {
    const attr = w.attributes;
    const att = attr.attachment || '';
    const attLink = attr.attachment_link || {};
    const prev = attLink.preview_image?.url || attr.wish_content?.attachment_props?.custom_thumbnail_url;

    if (prev) previewImages++;

    if (att) {
      if (att.includes('padletusercontent.com') || att.includes('padlet-uploads') || att.match(/\.(pdf|zip|mp4|mp3|docx?|pptx?|txt|csv|xlsx?)$/i)) {
        fileUploads++;
      } else {
        externalLinks++;
      }
    }
  }

  console.log(`[${b.key}] Total wishes: ${wishesMap.size} | File uploads: ${fileUploads} | Preview images: ${previewImages} | External links: ${externalLinks}`);
}
