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
  const wishesFile = 'c:/antigravity/1151025Gemini就是神奇/data_gm/net_10_wishes_72_540.json';
  const startFile = 'c:/antigravity/1151025Gemini就是神奇/data_gm/net_11_padlet_starting_state_72_539.json';

  const wishes = JSON.parse(fs.readFileSync(wishesFile, 'utf8')).data;
  const start = JSON.parse(fs.readFileSync(startFile, 'utf8'));

  const imgDir = 'c:/antigravity/1151025Gemini就是神奇/assets/images';
  const filesDir = 'c:/antigravity/1151025Gemini就是神奇/assets/files';

  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

  // 1. Wallpaper
  const bgUrl = start.wall?.background?.url || 'https://elvis.padletcdn.com/1/atat/e_in-u_1773398369/appbR1Qbe0DGnDKkS/tblhZFRy95OZHncLj/rec1OSzIqu9C6xR0L/fldJu5JvkUBo8MUFA';
  console.log('Downloading GM wallpaper...');
  await downloadFile(bgUrl, path.join(imgDir, 'gm_wallpaper.jpg'));

  // 2. Card Preview Images
  console.log('\nDownloading GM card preview images...');
  for (const w of wishes) {
    const a = w.attributes;
    const wid = w.id;
    const imgUrl = a.attachment_link?.preview_image?.url || a.attachment_link?.image || a.attachment_link?.thumbnail;
    if (imgUrl) {
      let ext = '.png';
      if (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('f_jpg')) ext = '.jpg';
      if (imgUrl.includes('.webp')) ext = '.webp';
      const dest = path.join(imgDir, `gm_img_${wid}${ext}`);
      await downloadFile(imgUrl, dest);
    }
  }

  // 3. Attachments & Files
  console.log('\nDownloading GM attachments & uploaded files...');
  for (const w of wishes) {
    const a = w.attributes;
    const wid = w.id;
    if (a.attachment && (a.attachment.includes('padletusercontent') || a.attachment.includes('storage.googleapis.com') || /\.(pdf|docx|pptx|txt|zip|mp4|png|jpg|jpeg)$/i.test(a.attachment))) {
      let filename = '';
      try {
        const u = new URL(a.attachment);
        filename = path.basename(u.pathname);
      } catch(e) {
        filename = `gm_file_${wid}.bin`;
      }
      try {
        filename = decodeURIComponent(filename);
      } catch(e) {}

      // Clean filename
      filename = filename.replace(/[\/\\:*?"<>|]/g, '_');
      if (!filename || filename === '_' || filename.length < 3) {
        filename = `gm_attachment_${wid}.bin`;
      }

      const dest = path.join(filesDir, `gm_file_${wid}_${filename}`);
      console.log(`Downloading attachment for wish ${wid} -> ${filename}`);
      await downloadFile(a.attachment, dest);
    }
  }

  console.log('\nGM assets download completed!');
}

main().catch(err => console.error(err));
