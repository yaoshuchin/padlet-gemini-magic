# Gemini就是神奇 × 國中-Gemini Notebook · 雙看板整合平台 (2026年最新版)

> **原始來源**：
> 1. [Padlet 看板 1：Gemini就是神奇](https://padlet.com/inforissuescounseling/gemini-jlkd6q3f4kuet6gh)  
> 2. [Padlet 看板 2：國中-Gemini Notebook](https://padlet.com/inforissuescounseling/gemini-notebook-5oeo73b93q2co043)  
> **作者**：臺中市資訊教育議題分團輔導員 (moodlela)  
> **核心分類規則**：**紫標是資料 (24)、紅標有範例 (21)、藍標歸工具 (26)、綠標要實作 (11)**  
> **專案定位**：雙看板合一架構，在最上方配置一鍵標籤切換，結合 100% 離線鏡像資料集 (`data.js`) 與即時連動視窗，免外網即可直通全套提示詞、教材手冊 PDF 與示範影片！

---

## 🌟 雙看板頂部導覽切換 (Top Tabs Navigation)

在網頁最頂部內建 **雙看板一鍵無縫切換標籤**：

1. **🌟 Gemini就是神奇 (85 張卡片全量離線)**：
   - 包含 19 個主題分欄、85 張卡片、71 張高解析度預覽縮圖與 56 份下載素材庫。
   - 支援分欄看板 (Shelves)、瀑布網格 (Grid)、清單條列 (List) 三種檢視視圖。
   - 具備關鍵字即時搜尋 (`/` 快捷鍵)、顏色標籤篩選、隨機抽籤、Excel 相容 CSV 報表匯出功能。
2. **📘 國中-Gemini Notebook (最新連動看板)**：
   - 整合由臺中市資訊教育議題分團輔導員規劃之「國中-Gemini Notebook」專題看板。
   - 內嵌高畫質自適應互動視窗，並附帶在新分頁開啟、重新載入與存取說明面板。

---

## 📋 19 個分欄主題 (Gemini就是神奇)

1. **說在前面** (6 張)：自我介紹、Google AI 雙刀流、Gemini 全方位介紹、Gemini 3.0 Pro 功能解析、中小學使用指南、同意書
2. **Google三兄弟** (3 張)：Gemini、NotebookLM、AI Studio
3. **有關Prompt** (4 張)：從發散到聚焦、最神PARTS咒語王、PARTS 提示詞產生器、動態提示詞庫
4. **行事曆匯入** (2 張)：行事曆事件擷取與自動匯入
5. **繪本生成** (3 張)：下載繪本為 PDF、繪本生成實作（含 20 頁繁中繪本提示詞）
6. **簡報生成** (3 張)：簡報生成(思考型)+(Canvas)、西力衝擊下的東亞世界、簡報實作
7. **測驗生成** (3 張)：臺灣 228 事件測驗、測驗設計與解析
8. **圖片生成** (13 張)：Gemini 圖片編輯大升級、官方 5 大訣竅、Nano Banana 提示詞案例庫、55 種藝術風格、成語圖卡、台語諺語圖卡、句型轉海報精靈、電子書櫃系統
9. **Deep Research** (5 張)：產出多元化、HTML 部署工具、PDF 轉 DOC/DOCX、深度研究多元產出
10. **Gem工具實作** (7 張)：Gem 特性、跨領域課程設計總監、教學手繪筆記生成器、文件生成宣傳海報、Memphis design prompt
11. **互動網站製作** (4 張)：PARTS 原則、引導小幫手登場、互動網頁實作
12. **網站範例** (6 張)：職業羅盤、名畫與我、水果英文配對遊戲、白色恐怖：記憶的回聲、南陽國小閱讀打卡牆、飲料訂購系統
13. **引導式學習** (3 張)：化學純物質與混合物、中文形容詞副詞差異引導
14. **影片生成** (8 張)：Tap dance step 示範、Flow、PixVerse、影片生成實作
15. **Opal** (4 張)：Clip Creator 8 秒短影片產生器
16. **好用外掛** (2 張)：Gemini EDU Prompt Assistant、Kortex
17. **結語** (1 張)：AI 時代學習的深度剖析
18. **生圖創意工具(補充)** (5 張)：One Click Sticker V3、LINE 貼圖產生器、PictureMe、7DAYS ME、外拍攝影棚
19. **語音摘要** (3 張)：語音摘要實作、注意事項、Podcast 生成實作

---

## 📦 本機素材與下載庫規格 (100% Offline Ready)

- **高清壁紙**：`assets/images/wallpaper.png`（2816×1536 Gemini Generated Image 主題壁紙）
- **70 張卡片預覽圖**：`assets/images/img_*.png` / `*.jpg`
- **56 份本機下載附件**：
  - 🎬 **示範影片 (MP4)**：直接於卡片與彈窗內建播放器播放。
  - 📄 **教材手冊 (PDF)**：中小學生成式 AI 使用手冊、測驗解析。
  - 📝 **結構化提示詞 (TXT)**：繪本生成、簡報生成、引導式教學等結構化 Prompt。

---

## 🚀 快速開啟方式

- **方式 1（直接點開）**：直接雙擊 [**`start.bat`**](./start.bat) 或以瀏覽器直接開啟 [**`index.html`**](./index.html)。
- **方式 2（本機靜態伺服器）**：
  ```bash
  npx serve .
  # 或使用 Python
  python -m http.server 8080
  ```

---

## 🌐 線上部署 (GitHub Pages & Netlify)

### GitHub Pages
1. 本專案已推播至 GitHub 倉庫：`https://github.com/yaoshuchin/padlet-gemini-magic`
2. 進入倉庫 **Settings** -> **Pages**
3. **Build and deployment** 來源選擇 **Deploy from a branch**
4. Branch 選擇 `master`，目錄選擇 `/ (root)`，點擊 **Save**。
5. 線上瀏覽網址：[**https://yaoshuchin.github.io/padlet-gemini-magic/**](https://yaoshuchin.github.io/padlet-gemini-magic/)
