import { spawn } from 'child_process';
import path from 'path';

const remainingBoards = [
  { key: 'ai_sketch', title: 'AI素描課-圖片摹寫', url: 'https://padlet.com/inforissuescounseling/ai-1wamrh40ew4rj3wj', port: 9450 },
  { key: 'text_to_slides', title: '文生簡報', url: 'https://padlet.com/infor_issues_counseling_group/padlet-n1h3vafb774zkccg', port: 9455 },
  { key: 'music_creation', title: '歌曲創作', url: 'https://padlet.com/severalplacescience/padlet-8nj7hyvlkghogyvh', port: 9460 },
  { key: 'notebooklm_projects', title: 'NotebookLM教學專案產出', url: 'https://padlet.com/severalplacescience/notebooklm-5uvnt2kvsu2po18h', port: 9465 },
  { key: 'prompt_architecture', title: '提示詞架構練習', url: 'https://padlet.com/severalplacescience/padlet-np68pg4pklz341r0', port: 9470 }
];

function runBoard(board) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> STARTING CAPTURE: [${board.key}] ${board.title} ...`);
    const proc = spawn('node', [
      'c:/antigravity/1151025Gemini就是神奇/scripts/capture_single.mjs',
      board.key,
      board.url,
      board.port.toString()
    ], { stdio: 'inherit' });

    proc.on('close', (code) => {
      console.log(`>>> FINISHED [${board.key}] with code ${code}\n`);
      if (code === 0) resolve();
      else reject(new Error(`Board ${board.key} exited with code ${code}`));
    });
  });
}

async function main() {
  for (const board of remainingBoards) {
    await runBoard(board);
  }
  console.log('ALL REMAINING BOARDS CAPTURED!');
}

main().catch(err => {
  console.error('Batch failed:', err);
  process.exit(1);
});
