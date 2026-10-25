import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'https://padlet.com/academiciflimited/gemini-notebook-qdyw32vg7ay8egvc';
const port = 9410;
const userDataDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\chrome_temp_test_new_board';

const p = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--headless=new',
  '--no-first-run',
  '--no-default-browser-check',
  targetUrl
]);

setTimeout(async () => {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json`);
    const list = await res.json();
    const target = list.find(t => t.url && t.url.includes('padlet.com'));
    if (!target) {
      console.log('Target not found, targets:', list);
      p.kill();
      process.exit(1);
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    console.log('Connected! Waiting 8s for hydration...');
    await new Promise(r => setTimeout(r, 8000));
    
    let msgId = 1;
    function evalJs(expr) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === id) {
            ws.removeEventListener('message', handler);
            resolve(d.result?.result?.value);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
      });
    }

    const title = await evalJs('document.title');
    const sections = await evalJs(`
      Array.from(document.querySelectorAll('[data-testid="sectionTitleText"], h2, [class*="section"]')).map(el => el.innerText?.trim()).filter(Boolean).slice(0, 20)
    `);
    const cardsCount = await evalJs('document.querySelectorAll("[class*=\\"wish\\"], [class*=\\"post\\"]").length');
    const bodySnippet = await evalJs('document.body.innerText.slice(0, 400)');

    console.log('================ RESULTS ================');
    console.log('Title:', title);
    console.log('Sections sample:', sections);
    console.log('Cards count:', cardsCount);
    console.log('Body snippet:\n', bodySnippet);

    ws.close();
    p.kill();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    p.kill();
    process.exit(1);
  }
}, 4000);
