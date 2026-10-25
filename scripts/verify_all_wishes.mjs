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
  const wishFiles = files.filter(f => f.includes('wishes'));

  for (const f of wishFiles) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dirPath, f), 'utf8'));
      if (json.data && Array.isArray(json.data)) {
        for (const w of json.data) {
          if (w.id) wishesMap.set(String(w.id), w);
        }
      }
    } catch(e) {}
  }

  // Count sections
  const secFiles = files.filter(f => f.includes('sections'));
  let secCount = 0;
  for (const sf of secFiles) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dirPath, sf), 'utf8'));
      if (json.data && Array.isArray(json.data)) secCount += json.data.length;
    } catch(e) {}
  }

  console.log(`[${b.key}] ${b.name}: ${wishesMap.size} unique wishes, ${secCount} sections (from ${wishFiles.length} files)`);
}
