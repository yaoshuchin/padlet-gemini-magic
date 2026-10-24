import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve('c:/antigravity/1151025Gemini就是神奇/index.html');
const targetUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const port = 9380;
const userDataDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\chrome_temp_test_gemini_magic';

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--headless=new',
  '--window-size=1600,1000',
  '--no-first-run',
  '--no-default-browser-check',
  targetUrl
]);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await sleep(3000);
  let wsUrl = '';
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const list = await res.json();
      const target = list.find(t => t.url && (t.url.includes('index.html') || t.url.includes('file:')));
      if (target) {
        wsUrl = target.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
    await sleep(1000);
  }

  if (!wsUrl) {
    console.error('Target not found');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const cb = pending.get(data.id);
      pending.delete(data.id);
      cb(data);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await sleep(4000);

  // Check DOM
  const checkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        title: document.title,
        shelvesCount: document.querySelectorAll('#boardView > div').length,
        cardsCount: document.querySelectorAll('.card-transition').length,
        boardTitleText: document.getElementById('boardTitle')?.innerText
      };
    })()`,
    returnByValue: true
  });

  console.log('DOM check result:', checkRes.result?.result?.value);

  // Screenshot
  const ssRes = await send('Page.captureScreenshot', { format: 'png' });
  if (ssRes.result?.data) {
    fs.writeFileSync('c:/antigravity/1151025Gemini就是神奇/preview_screenshot.png', Buffer.from(ssRes.result.data, 'base64'));
    console.log('Saved preview_screenshot.png successfully!');
  }

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
