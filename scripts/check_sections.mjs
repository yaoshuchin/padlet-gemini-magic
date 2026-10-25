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

  const secIds = new Set();
  const colors = new Map();
  for (const [wid, w] of wishesMap) {
    const sid = w.attributes?.wall_section_id;
    if (sid) secIds.add(String(sid));
    const c = w.attributes?.color || 'white';
    colors.set(c, (colors.get(c) || 0) + 1);
  }

  // Look for section files
  const secFiles = files.filter(f => f.includes('sections'));
  const secTitles = [];
  for (const sf of secFiles) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dirPath, sf), 'utf8'));
      if (json.data && Array.isArray(json.data)) {
        for (const s of json.data) {
          secTitles.push({ id: String(s.id), title: s.attributes?.title });
        }
      }
    } catch(e) {}
  }

  console.log(`\n[${b.key}] ${b.name}: ${wishesMap.size} unique wishes`);
  console.log(`  wall_section_ids in wishes: ${secIds.size}`);
  console.log(`  sections in sections files: ${secTitles.length}`);
  if (secTitles.length > 0) {
    console.log(`  Sample sections:`, secTitles.slice(0, 5).map(s => s.title));
  }
  console.log(`  Colors:`, Object.fromEntries(colors));
}
