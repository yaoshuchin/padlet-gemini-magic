import fs from 'fs';
import path from 'path';

const dirs = [
  'data_interactive_web',
  'data_ai_sketch',
  'data_text_to_slides',
  'data_music_creation',
  'data_notebooklm_projects',
  'data_prompt_architecture'
];

for (const d of dirs) {
  const fullPath = path.resolve(`c:/antigravity/1151025Gemini就是神奇/${d}`);
  if (!fs.existsSync(fullPath)) {
    console.log(`Directory ${d} NOT found!`);
    continue;
  }
  const files = fs.readdirSync(fullPath);
  console.log(`\n=== [${d}] (${files.length} files) ===`);
  const wishesFiles = files.filter(f => f.includes('wishes'));
  const sectionsFiles = files.filter(f => f.includes('sections'));
  const startFiles = files.filter(f => f.includes('starting_state'));
  console.log('  Wishes files:', wishesFiles);
  console.log('  Sections files:', sectionsFiles);
  console.log('  Starting state files:', startFiles);

  for (const wf of wishesFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(fullPath, wf), 'utf8'));
      const wishesCount = content.data ? content.data.length : 'no data array';
      console.log(`    ${wf} -> ${wishesCount} wishes`);
    } catch (e) {
      console.log(`    ${wf} -> parse error: ${e.message}`);
    }
  }

  for (const sf of sectionsFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(fullPath, sf), 'utf8'));
      const secCount = content.data ? content.data.length : 'no data array';
      console.log(`    ${sf} -> ${secCount} sections`);
    } catch (e) {
      console.log(`    ${sf} -> parse error: ${e.message}`);
    }
  }
}
