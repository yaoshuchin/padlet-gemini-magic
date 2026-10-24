import fs from 'fs';
import path from 'path';

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    return true;
  }
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.warn(`Failed ${res.status}: ${url}`);
      return false;
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    console.log(`Downloaded (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB): ${path.basename(destPath)}`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function main() {
  const wishesFile = 'c:/antigravity/1151025Gemini就是神奇/data/net_10_wishes_52_706.json';
  const startFile = 'c:/antigravity/1151025Gemini就是神奇/data/net_11_padlet_starting_state_52_705.json';

  const wishes = JSON.parse(fs.readFileSync(wishesFile, 'utf8')).data;
  const start = JSON.parse(fs.readFileSync(startFile, 'utf8'));

  const imgDir = 'c:/antigravity/1151025Gemini就是神奇/assets/images';
  const filesDir = 'c:/antigravity/1151025Gemini就是神奇/assets/files';

  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

  // 1. Wallpaper
  const bgUrl = start.wall?.background?.url || 'https://padlet-uploads-usc1.storage.googleapis.com/1736270122/0c23519d7ad8c8d43e22f8181bc11e96/Gemini_Generated_Image_ms8ar0ms8ar0ms8a.png';
  console.log('Downloading wallpaper...');
  await downloadFile(bgUrl, path.join(imgDir, 'wallpaper.png'));

  // 2. Card Preview Images
  console.log('\nDownloading card preview images...');
  for (const w of wishes) {
    const a = w.attributes;
    const wid = w.id;
    const imgUrl = a.attachment_link?.preview_image?.url || a.attachment_link?.image || a.attachment_link?.thumbnail;
    if (imgUrl) {
      let ext = '.png';
      if (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('f_jpg')) ext = '.jpg';
      if (imgUrl.includes('.webp')) ext = '.webp';
      const dest = path.join(imgDir, `img_${wid}${ext}`);
      await downloadFile(imgUrl, dest);
    }
  }

  // 3. Attachments & Files
  console.log('\nDownloading attachments & uploaded files...');
  for (const w of wishes) {
    const a = w.attributes;
    const wid = w.id;
    if (a.attachment) {
      let filename = '';
      try {
        const u = new URL(a.attachment);
        filename = path.basename(u.pathname);
      } catch(e) {
        filename = `file_${wid}.bin`;
      }
      try {
        filename = decodeURIComponent(filename);
      } catch(e) {}

      // Clean filename
      filename = filename.replace(/[\/\\:*?"<>|]/g, '_');
      if (!filename || filename === '_' || filename.length < 3) {
        filename = `attachment_${wid}.bin`;
      }

      const dest = path.join(filesDir, `file_${wid}_${filename}`);
      console.log(`Downloading attachment for wish ${wid} -> ${filename}`);
      await downloadFile(a.attachment, dest);
    }
  }

  console.log('\nAll asset downloads completed!');
}

main().catch(err => console.error(err));
