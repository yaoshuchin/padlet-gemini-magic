import fs from 'fs';

const urls = [
  { key: 'ai_expert', name: 'AI專家系統建置練習', url: 'https://padlet.com/inforissuescounseling/ai-ok7vcvfs07ktjwx6' },
  { key: 'interactive_web', name: '互動網頁實作', url: 'https://padlet.com/inforissuescounseling/padlet-3p2828w2uj1n79gs' },
  { key: 'gemini_magic', name: 'Gemini就是神奇', url: 'https://padlet.com/inforissuescounseling/gemini-jlkd6q3f4kuet6gh' },
  { key: 'ai_sketch', name: 'AI素描課-圖片摹寫', url: 'https://padlet.com/inforissuescounseling/ai-1wamrh40ew4rj3wj' },
  { key: 'text_to_slides', name: '文生簡報', url: 'https://padlet.com/infor_issues_counseling_group/padlet-n1h3vafb774zkccg' },
  { key: 'music_creation', name: '歌曲創作', url: 'https://padlet.com/severalplacescience/padlet-8nj7hyvlkghogyvh' },
  { key: 'notebooklm_projects', name: 'NotebookLM教學專案產出', url: 'https://padlet.com/severalplacescience/notebooklm-5uvnt2kvsu2po18h' },
  { key: 'prompt_architecture', name: '提示詞架構練習', url: 'https://padlet.com/severalplacescience/padlet-np68pg4pklz341r0' }
];

async function main() {
  for (const item of urls) {
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      console.log(`[${item.key}] status: ${res.status}, length: ${html.length}`);
      
      // Look for title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      console.log(`  Title: ${titleMatch ? titleMatch[1] : 'N/A'}`);

      // Check if starting state is in HTML or API
      const wallIdMatch = html.match(/\"wall_id\"[ :]+(\d+)/) || html.match(/\"id\"[ :]+(\d+)[^}]*\"name\"[ :]+\"wishes\"/);
      // Let's check feed.xml or json
      const feedRes = await fetch(`${item.url}.xml`);
      console.log(`  Feed.xml: ${feedRes.status}`);
      const jsonRes = await fetch(`${item.url}.json`);
      console.log(`  .json: ${jsonRes.status}`);
    } catch (e) {
      console.error(`  Error:`, e.message);
    }
  }
}

main();
