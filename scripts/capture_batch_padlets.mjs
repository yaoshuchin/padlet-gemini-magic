import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9435;
const userDataDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\chrome_temp_profile_batch';

const boardsToCapture = [
  { key: 'interactive_web', title: '互動網頁實作', url: 'https://padlet.com/inforissuescounseling/padlet-3p2828w2uj1n79gs' },
  { key: 'ai_sketch', title: 'AI素描課-圖片摹寫', url: 'https://padlet.com/inforissuescounseling/ai-1wamrh40ew4rj3wj' },
  { key: 'text_to_slides', title: '文生簡報', url: 'https://padlet.com/infor_issues_counseling_group/padlet-n1h3vafb774zkccg' },
  { key: 'music_creation', title: '歌曲創作', url: 'https://padlet.com/severalplacescience/padlet-8nj7hyvlkghogyvh' },
  { key: 'notebooklm_projects', title: 'NotebookLM教學專案產出', url: 'https://padlet.com/severalplacescience/notebooklm-5uvnt2kvsu2po18h' },
  { key: 'prompt_architecture', title: '提示詞架構練習', url: 'https://padlet.com/severalplacescience/padlet-np68pg4pklz341r0' }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let chromeProc = null;

async function startChrome() {
  chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=16000,4000',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);
  await sleep(3000);
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const list = await res.json();
      if (list.length > 0) {
        return list[0].webSocketDebuggerUrl;
      }
    } catch (e) {}
    await sleep(1000);
  }
  return null;
}

async function captureBoard(ws, send, boardInfo) {
  console.log(`\n========================================`);
  console.log(`Capturing [${boardInfo.key}] ${boardInfo.title} (${boardInfo.url})...`);
  console.log(`========================================`);

  const outDir = path.resolve(`c:/antigravity/1151025Gemini就是神奇/data_${boardInfo.key}`);
  fs.mkdirSync(outDir, { recursive: true });

  const networkResponses = [];
  const onMsg = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Network.responseReceived') {
        const resp = data.params.response;
        if (resp.url.includes('padlet') && (resp.mimeType.includes('json') || resp.url.includes('api') || resp.url.includes('wishes') || resp.url.includes('sections') || resp.url.includes('comments'))) {
          networkResponses.push({
            requestId: data.params.requestId,
            url: resp.url,
            mimeType: resp.mimeType,
            status: resp.status
          });
        }
      }
    } catch (e) {}
  };

  ws.addEventListener('message', onMsg);

  // Navigate to target URL
  console.log('Navigating to', boardInfo.url);
  await send('Page.navigate', { url: boardInfo.url });

  // Wait for loading and network calls
  console.log('Waiting 15 seconds for page load and API responses...');
  await sleep(15000);

  // Set ultra-wide viewport to ensure all horizontal columns are rendered
  await send('Emulation.setDeviceMetricsOverride', {
    width: 16000,
    height: 4000,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(4000);

  // Scroll across horizontally to trigger lazy loading
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.scrollingElement || document.body;
      window.scrollTo(5000, 0);
      setTimeout(() => window.scrollTo(10000, 0), 1000);
      setTimeout(() => window.scrollTo(0, 0), 2000);
    })()`
  });
  await sleep(4000);

  // Fetch response bodies
  console.log(`Intercepted ${networkResponses.length} candidate network requests.`);
  let savedCount = 0;
  for (const item of networkResponses) {
    try {
      const bodyRes = await send('Network.getResponseBody', { requestId: item.requestId });
      if (bodyRes && bodyRes.result && bodyRes.result.body) {
        let cleanName = item.url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        if (cleanName.length > 80) cleanName = cleanName.slice(-80);
        const fileName = `net_${cleanName}.json`;
        fs.writeFileSync(path.join(outDir, fileName), bodyRes.result.body, 'utf8');
        savedCount++;
      }
    } catch (e) {}
  }
  console.log(`Saved ${savedCount} network response payloads to ${outDir}`);

  // Extract DOM data as fallback
  const domData = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.title;
      const subtitle = document.querySelector('p[class*="subtitle"], [class*="description"]')?.textContent || '';
      const wallpaper = getComputedStyle(document.body).backgroundImage || '';

      const sections = [];
      document.querySelectorAll('[data-wall-section-id], [class*="section"], [class*="column"], [class*="shelf"]').forEach((sec, sIdx) => {
        const titleEl = sec.querySelector('h1, h2, h3, h4, [class*="title"]');
        const sTitle = titleEl ? titleEl.textContent.trim() : ('Section ' + (sIdx + 1));
        const cards = [];
        sec.querySelectorAll('[data-wish-id], [class*="wish"], [class*="card"]').forEach(c => {
          const t = c.querySelector('h2, h3, h4, [class*="title"], [class*="headline"]')?.textContent?.trim() || '';
          const b = c.querySelector('[class*="body"], p')?.textContent?.trim() || '';
          const img = c.querySelector('img')?.src || '';
          const a = c.querySelector('a')?.href || '';
          cards.push({ title: t, body: b, img, link: a });
        });
        if (cards.length > 0 || sTitle) {
          sections.push({ title: sTitle, cardsCount: cards.length, cards });
        }
      });

      return {
        title,
        subtitle,
        wallpaper,
        sectionsCount: sections.length,
        totalCardsFound: sections.reduce((acc, s) => acc + s.cards.length, 0),
        sections
      };
    })()`,
    returnByValue: true
  });

  const pageState = domData.result?.result?.value || {};
  fs.writeFileSync(path.join(outDir, 'page_state.json'), JSON.stringify(pageState, null, 2), 'utf8');
  console.log(`Extracted DOM state: title="${pageState.title}", sections=${pageState.sectionsCount}, cards=${pageState.totalCardsFound}`);

  // Take screenshot
  const ssRes = await send('Page.captureScreenshot', { format: 'png' });
  if (ssRes.result?.data) {
    fs.writeFileSync(path.join(outDir, 'screenshot.png'), Buffer.from(ssRes.result.data, 'base64'));
    console.log(`Saved screenshot.png for ${boardInfo.key}`);
  }

  ws.removeEventListener('message', onMsg);
}

async function main() {
  await startChrome();
  const wsUrl = await getWsUrl();
  if (!wsUrl) {
    console.error('Cannot connect to Chrome debugging URL');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const cb = pending.get(data.id);
        pending.delete(data.id);
        cb(data);
      }
    } catch (e) {}
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Network.enable');
  await send('Page.enable');

  for (const board of boardsToCapture) {
    await captureBoard(ws, send, board);
  }

  ws.close();
  chromeProc.kill();
  console.log('\nAll 6 boards captured successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  if (chromeProc) chromeProc.kill();
  process.exit(1);
});
