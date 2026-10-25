import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\chrome_temp_api_test';
const port = 9398;

const p = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--headless=new',
  '--no-first-run',
  '--no-default-browser-check',
  'https://padlet.com/inforissuescounseling/gemini-notebook-5oeo73b93q2co043'
]);

setTimeout(async () => {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json`);
    const list = await res.json();
    const target = list.find(t => t.url && t.url.includes('padlet.com'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    ws.send(JSON.stringify({ id: 1, method: 'Network.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.reload' }));

    const responses = [];
    ws.onmessage = async (e) => {
      const d = JSON.parse(e.data);
      if (d.method === 'Network.responseReceived') {
        const url = d.params.response.url;
        const status = d.params.response.status;
        if (url.includes('api') || url.includes('wishes') || url.includes('sections') || url.includes('starting_state')) {
          console.log(`API [${status}]: ${url}`);
          responses.push({ requestId: d.params.requestId, url, status });
        }
      }
    };

    await new Promise(r => setTimeout(r, 6000));
    console.log('Total intercepted relevant APIs:', responses.length);
    for (let r of responses) {
      ws.send(JSON.stringify({ id: 100, method: 'Network.getResponseBody', params: { requestId: r.requestId } }));
    }

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === 100) {
        console.log('Response body:', d.result?.body?.slice(0, 300));
      }
    };

    await new Promise(r => setTimeout(r, 3000));
    ws.close();
    p.kill();
    process.exit(0);
  } catch(e) {
    console.error(e);
    p.kill();
    process.exit(1);
  }
}, 3000);
