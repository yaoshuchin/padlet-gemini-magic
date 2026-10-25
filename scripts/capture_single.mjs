import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const boardKey = process.argv[2] || 'interactive_web';
const targetUrl = process.argv[3] || 'https://padlet.com/inforissuescounseling/padlet-3p2828w2uj1n79gs';
const port = parseInt(process.argv[4] || '9440', 10);
const outDir = path.resolve(`c:/antigravity/1151025Gemini就是神奇/data_${boardKey}`);

fs.mkdirSync(outDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = `C:\\Users\\Administrator\\.gemini\\antigravity\\chrome_temp_${boardKey}`;

console.log(`Launching Chrome for [${boardKey}] -> ${targetUrl} on port ${port}...`);

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--headless=new',
  '--window-size=16000,4000',
  '--no-first-run',
  '--no-default-browser-check',
  targetUrl
]);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await sleep(3500);

  let wsUrl = '';
  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const list = await res.json();
      const padletTarget = list.find(t => t.url && t.url.includes('padlet.com'));
      if (padletTarget) {
        wsUrl = padletTarget.webSocketDebuggerUrl;
        console.log('Target found:', padletTarget.url);
        break;
      }
    } catch (e) {}
    await sleep(1000);
  }

  if (!wsUrl) {
    console.error('Could not find debugging target');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();
  const networkRequests = [];

  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Network.responseReceived') {
        const resp = data.params.response;
        const u = resp.url;
        // Targeted capture for essential Padlet API endpoints
        if (u.includes('padlet.com') && (u.includes('wishes') || u.includes('sections') || u.includes('starting_state') || u.includes('comments') || u.includes('surface-settings') || u.includes('/api/5/'))) {
          networkRequests.push({
            requestId: data.params.requestId,
            url: resp.url,
            mimeType: resp.mimeType,
            status: resp.status
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
  console.log('Connected to CDP. Enabling Network and Page...');
  await send('Network.enable');
  await send('Page.enable');

  console.log('Reloading page to capture all initial API calls...');
  await send('Page.reload');

  console.log('Waiting 14 seconds for full hydration and columns...');
  await sleep(14000);

  // Set ultra-wide viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 16000,
    height: 4000,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(3000);

  console.log(`Captured ${networkRequests.length} candidate requests. Fetching response bodies...`);

  let count = 0;
  for (const item of networkRequests) {
    try {
      const bodyRes = await send('Network.getResponseBody', { requestId: item.requestId }, 2500);
      if (bodyRes && bodyRes.result && bodyRes.result.body) {
        let cleanName = item.url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        if (cleanName.length > 80) cleanName = cleanName.slice(-80);
        const fileName = `net_${cleanName}.json`;
        fs.writeFileSync(path.join(outDir, fileName), bodyRes.result.body, 'utf8');
        count++;
      }
    } catch (e) {}
  }
  console.log(`Saved ${count} network payloads into ${outDir}`);

  // Screenshot
  const ssRes = await send('Page.captureScreenshot', { format: 'png' }, 5000);
  if (ssRes && ssRes.result && ssRes.result.data) {
    fs.writeFileSync(path.join(outDir, 'screenshot.png'), Buffer.from(ssRes.result.data, 'base64'));
    console.log('Saved screenshot.png');
  }

  // DOM Info
  const checkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        title: document.title,
        shelves: document.querySelectorAll('.wall-section, [data-wall-section-id]').length,
        wishes: document.querySelectorAll('.wish-container, [data-wish-id]').length
      };
    })()`,
    returnByValue: true
  }, 3000);
  console.log('DOM check:', checkRes ? checkRes.result?.result?.value : 'none');

  ws.close();
  try { chromeProc.kill(); } catch (e) {}
  console.log(`[${boardKey}] Done!`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  try { chromeProc.kill(); } catch (e) {}
  process.exit(1);
});
