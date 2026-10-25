import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const boards = [
  { key: 'interactive_web', url: 'https://padlet.com/inforissuescounseling/padlet-3p2828w2uj1n79gs', port: 9510 },
  { key: 'ai_sketch', url: 'https://padlet.com/inforissuescounseling/ai-1wamrh40ew4rj3wj', port: 9515 },
  { key: 'text_to_slides', url: 'https://padlet.com/infor_issues_counseling_group/padlet-n1h3vafb774zkccg', port: 9520 },
  { key: 'music_creation', url: 'https://padlet.com/severalplacescience/padlet-8nj7hyvlkghogyvh', port: 9525 }
];

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureFullBoard(b) {
  console.log(`\n========================================`);
  console.log(`Scrolling & Capturing all pages for [${b.key}] -> ${b.url}`);
  console.log(`========================================`);

  const outDir = path.resolve(`c:/antigravity/1151025Gemini就是神奇/data_${b.key}`);
  const userDataDir = `C:\\Users\\Administrator\\.gemini\\antigravity\\chrome_scroll_${b.key}`;

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${b.port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1920,1080',
    '--no-first-run',
    '--no-default-browser-check',
    b.url
  ]);

  await sleep(3500);

  let wsUrl = '';
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${b.port}/json`);
      const list = await res.json();
      const target = list.find(t => t.url && t.url.includes('padlet.com'));
      if (target) {
        wsUrl = target.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
    await sleep(1000);
  }

  if (!wsUrl) {
    console.error(`Failed to find target for ${b.key}`);
    chromeProc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();
  const wishRequests = [];

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Network.responseReceived') {
        const resp = data.params.response;
        if (resp.url.includes('/api/10/wishes')) {
          console.log(`[${b.key}] Intercepted wishes page:`, resp.url.slice(0, 100));
          wishRequests.push({
            requestId: data.params.requestId,
            url: resp.url
          });
        }
      }
      if (data.id && pending.has(data.id)) {
        const cb = pending.get(data.id);
        pending.delete(data.id);
        cb(data);
      }
    } catch (e) {}
  };

  function send(method, params = {}, timeoutMs = 4000) {
    return new Promise((resolve) => {
      const id = msgId++;
      let timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          resolve(null);
        }
      }, timeoutMs);
      pending.set(id, (res) => {
        clearTimeout(timer);
        resolve(res);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Network.enable');
  await send('Page.enable');

  console.log('Waiting 8 seconds for initial load...');
  await sleep(8000);

  // Scroll loop
  console.log('Starting scroll loop...');
  let lastCount = 0;
  let stagnantCycles = 0;

  for (let cycle = 1; cycle <= 20; cycle++) {
    // Scroll both vertically and horizontally
    await send('Runtime.evaluate', {
      expression: `(() => {
        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
        window.scrollBy(1000, 1000);
        document.querySelectorAll('div').forEach(el => {
          if (el.scrollHeight > el.clientHeight) el.scrollTop = el.scrollHeight;
          if (el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
        });
      })()`
    });

    await sleep(2500);

    if (wishRequests.length === lastCount) {
      stagnantCycles++;
      if (stagnantCycles >= 3) {
        console.log(`No new wish requests after 3 scroll cycles. Finished scrolling for ${b.key}.`);
        break;
      }
    } else {
      stagnantCycles = 0;
      lastCount = wishRequests.length;
      console.log(`[${b.key}] Total wish requests intercepted so far: ${wishRequests.length}`);
    }
  }

  // Fetch response bodies for all wishes
  console.log(`Saving ${wishRequests.length} wishes responses...`);
  let idx = 1;
  for (const item of wishRequests) {
    try {
      const bodyRes = await send('Network.getResponseBody', { requestId: item.requestId }, 3000);
      if (bodyRes?.result?.body) {
        const fileName = `net_page_${idx++}_wishes.json`;
        fs.writeFileSync(path.join(outDir, fileName), bodyRes.result.body, 'utf8');
      }
    } catch (e) {}
  }

  ws.close();
  try { chromeProc.kill(); } catch (e) {}
  console.log(`[${b.key}] Done scrolling!`);
}

async function main() {
  for (const b of boards) {
    await captureFullBoard(b);
  }
  console.log('\nAll 4 boards full scroll completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
