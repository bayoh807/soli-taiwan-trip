# Handoff：台灣之旅互動問卷（MapleStory 楓之谷風格）

> 給 Claude Code / 開發者的實作規格。此文件可獨立閱讀，不需看過原對話即可實作。

## Overview（概述）
一個「一頁式、橫向分頁」的互動問卷網頁，楓之谷（MapleStory）遊戲畫風。使用者從船頭場景出發，
回答「是否準備好開始台灣之旅」，接著在北 / 中 / 南三站各選一個景點，過程中會跳出「神秘獎勵」彈窗，
最後顯示旅程總覽。畫面底部有一隻像素角色，切換頁面時會原地跳一下。

流程共 5 個「場景（scene）」，透過底部左右箭頭切換（**不使用滑動 / 滾軸**）：
0. 出發（YES / NO）
1. 北台灣選點
2. 中台灣選點（選後跳獎勵彈窗）
3. 南台灣選點（選後跳完成彈窗）
4. 旅程總覽（完成後才出現）

## About the Design Files（關於設計檔）
本 bundle 內的檔案是**用 HTML 製作的「設計參考稿 / 原型」**，用來展示預期外觀與互動行為，
**不是拿來直接上線的產品程式碼**。任務是：把這些設計在**目標專案既有的技術環境**（React / Vue / Next.js…）
中，依該專案既有的元件與規範**重新實作**；若專案尚未建立環境，則挑選最合適的框架來實作。

`台灣之旅.dc.html` 使用一個自訂的輕量 runtime（`support.js`），採 `<x-dc>` 模板 + `class Component`
的寫法。**這是原型工具的格式，不需照搬**；請以它呈現的視覺與互動為準，用你們的框架重寫。
直接用瀏覽器開啟 `台灣之旅.dc.html` 即可預覽原型（需與 `support.js`、`image-slot.js`、`assets/` 同層）。

## Fidelity（完成度）
**High-fidelity（高保真）**：顏色、字體、間距、互動皆為最終樣式，請盡量像素級還原。
唯一的佔位素材是背景圖與角色 sprite（見 Assets），可替換為正式美術。

## Screens / Views（各場景）

共用版型：
- 每個 scene 佔滿整個視窗（100vw × 100dvh），為一張全幅背景圖 + 中央「任務視窗」面板。
- 背景圖上蓋兩層漸層：左右邊緣淡藍霧化 `rgba(190,228,250,.9)`，上下輕微暗角。
- 底部固定一列導覽箭頭；底部中央固定一隻角色 sprite。
- 頂部固定進度條 HUD（4 個節點：出發 / 北 / 中 / 南）。

### Scene 0 — 出發
- **Purpose**：詢問「準備好開始你的台灣之旅了嗎？」。
- **背景**：`assets/ship-bg.jpeg`，`object-position:50% 40%`。
- **面板**：寬 `min(600px,88vw)`，圓角 18px，米色羊皮紙漸層 `#fdf6e3→#f4e6c2`，
  2px 邊框 `#5f4526`，外層多層描邊 + 陰影（見 Design Tokens 的「面板」）。
  面板頂部藍色標題列（`冒險任務 · QUEST`），漸層 `#6d9bd9→#2c5288`。
- **標題**：`準備好開始你的台灣之旅了嗎？` 24–36px（`clamp(24px,5.4vw,36px)`），色 `#3e2c10`。
  副標 `READY FOR YOUR TAIWAN ADVENTURE?` 12–15px，色 `#a08050`，字距 1px。
- **按鈕**：
  - `YES 出發！`（綠）：漸層 `#8be374→#358534`，2px 邊 `#23632a`，圓角 14px，
    下緣 4px 立體陰影 `#1d5323`，文字白色帶陰影。**位置固定不可位移**。
  - `NO 再想想`（紅）：漸層 `#ff9a8a→#c23a2e`，2px 邊 `#8e2323`，其餘同上。
- **NO 按鈕閃避行為**（重點互動，見下方 Interactions）。
- 答完 YES 後，此頁按鈕區改顯示「🎒 旅程已啟程！往右探索 →」。

### Scene 1 / 2 / 3 — 北 / 中 / 南台灣選點
- **Purpose**：從 3 張景點卡選 1 張。
- **背景**：`assets/map-bg.png`，三頁分別 `object-position:38% 40% / 62% 55% / 88% 48%`（模擬鏡頭平移）。
- **面板**：寬 `min(720px,90vw)`，同上樣式；標題列文字為「第一站 · 北台灣」等。
- **標題**：`選一個地點展開探索`（第三站為「選一個地點完成旅程」）。
- **鎖定態**：尚未解鎖時，面板內顯示虛線框提示 `🔒 完成上一站，解鎖此地點`
  （Scene 1 為 `🔒 先回到起點回答問題，即可解鎖`）。
- **景點卡（每頁 3 張，flex wrap，gap `clamp(12px,2.4vw,20px)`）**：
  - 卡片寬 `clamp(148px,40vw,196px)`，圓角 16px，米白漸層 `#fffdf4→#f7ecd2`，
    2px 邊 `#cfae74`，下緣 3px 立體陰影 + 外陰影 + 內高光。hover：`translateY(-5px)`。
  - 卡內：頂部 emoji 圖示磁磚（`clamp(56px,12vw,72px)` 方形圓角 16px，米色漸層，
    內含 emoji `clamp(30px,7vw,40px)`），下方中文名 `clamp(16px,3.8vw,20px)`、
    英文副標 `clamp(10px,2.4vw,12px)` 色 `#ab8b58`。
  - **選中態**：邊框 `#3f9d4a`（綠），背景轉綠 `#f4fbef→#e2f3d8`，外圈 3px 綠光，`translateY(-4px)`，
    並顯示 `✓ 已選擇`。
  - **未選 + 該頁已完成**：`opacity:0.5`，不可點。
- **景點資料**：
  - 北：`🏙️ 台北 101 / SKYLINE TOWER`、`🏮 九份老街 / LANTERN TOWN`、`🪨 野柳女王頭 / SEA ROCKS`
  - 中：`🚣 日月潭 / SUN MOON LAKE`、`🐑 清境農場 / GREEN MEADOWS`、`🌅 高美濕地 / SUNSET WETLAND`
  - 南：`🏖️ 墾丁海灘 / SOUTH BEACH`、`🏯 台南古都 / OLD CAPITAL`、`🚤 高雄愛河 / LOVE RIVER`
- Scene 3（南）右下另有一個可拖曳角色框（image-slot）；正式版可移除或換成裝飾。

### Scene 4 — 旅程總覽（完成後出現）
- **Purpose**：條列使用者選的 3 個景點 + 稱號。
- 面板標題列為金色漸層 `#f2c14e→#bd881a`，標題 `🏝️ 你的台灣旅程 · COMPLETE`。
- 內容：3 列「emoji + 景點名」清單（米白卡片，2px 邊 `#d9bd85`），
  底部 `🏆 稱號「台灣旅人」已入手！`（金色 `#a5741a`）。

## Interactions & Behavior（互動與行為）

### 1) NO 按鈕閃避（Scene 0）
- 點第 1、2 次 NO：按鈕變 `position:fixed`，跳到可視範圍內的隨機座標
  （範圍需扣掉按鈕自身寬高與 14px 邊距，**保證不跑出畫面**），
  過場 `left/top .4s ease`。
- 點第 3 次 NO：按鈕旋轉縮小飛出畫面（`opacity→0, transform:rotate(24deg) scale(.7)`，約 .45s）後
  **永久消失**；提示文字改為「『NO』逃跑了！看來只能點 YES 出發囉 🍁」。
- **YES 必須固定不動**：NO 一旦離開原位，原位保留一個「同尺寸佔位方塊」，使 YES 不因 NO 消失而位移。

### 2) 導覽箭頭（底部）
- **關閉橫向滾軸 / 滑動**：容器 `overflow-x:hidden`，使用者不能手動滑，只能用箭頭。
- 箭頭切換是**程式化捲動**到目標 scene（`scrollLeft`，smooth）。
- 箭頭定位：固定於底部，置於寬 `min(720px,90vw)` 的列兩端（左箭靠左、右箭靠右，與上方面板左右邊切齊）。
  箭頭圖 `clamp(58px,10vw,92px)`。hover `translateY(-3px) scale(1.05)`、active `scale(.96)`。
- **顯示規則（重要）**：
  - 左箭頭：`目前頁 index > 0` 才顯示。
  - 右箭頭：`下一頁已解鎖`（`unlocked >= 目前頁+1`）且未到最後一頁才顯示。
  - 結果：**初始頁（未答 YES）無任何箭頭**；**每一站選完才出現右箭頭**；
    **第一頁只有右箭頭**；**最後一頁只有左箭頭**。

### 3) 角色跳躍（底部中央）
- 平時顯示「站立」影格；**只在切換頁面（scene 改變）時**觸發一次跳躍：
  起跳蹲 → 上升（`translateY(-44px)`）→ 下降 → 落地切回站立，約 0.62s，播完即停（非循環）。
- 實作：2 影格 sprite sheet（`assets/jump-sprite.png`，橫向兩格，`background-size:200% 100%`）。
  垂直用 `jumpY`（ease-in-out），影格切換用 `frameSwap`（step-end：0%站立→12%起飛切空中格→88%空中→100%落地切回站立）。
  以「重新掛載元件（key 遞增）」的方式讓動畫每次重播。

### 4) 獎勵彈窗（Modal）
- 觸發：選完中台灣、選完南台灣時各一次；答 YES 後一次（神秘禮盒）。
- 樣式：置中卡片，金框 `#f7c948`，背後有脈動光暈 `glowpulse`，emoji 左右搖擺 `sway`，
  進場 `pop .38s cubic-bezier(.2,1.3,.5,1)`。點卡片外或按鈕關閉。
- 文案：
  - YES 後：`🎁 神秘禮盒 GET!` — 「恭喜獲得「旅程通行證」以及 100 楓幣！你的台灣冒險正式展開～」按鈕「開啟旅程」
  - 中台灣後：`🎀 隱藏驚喜出現！` — 「解鎖成就「中台灣探險家」獲得 神秘楓葉徽章 ×1！」按鈕「繼續前進」
  - 南台灣後：`🏆 旅程完成！` — 「獲得稱號「台灣旅人」以及 神秘驚喜大禮包 ×1！感謝你走完整趟台灣之旅～」按鈕「太棒了」
- 關閉彈窗後自動前進到下一 scene。

### 5) 進度 HUD（頂部）
- 4 個節點：出發 / 北 / 中 / 南。完成的節點顯示 🍁（綠底），未完成顯示序號（米色底）。

### 6) 其他動態
- 櫻花花瓣 `petal` 由上往下飄（4 片，固定於全畫面 overlay）。
- 面板進場、雲朵等皆為裝飾性 CSS 動畫。

## State Management（狀態）
需要的狀態變數（原型用單一 Component state）：
- `started: boolean` — 是否已答 YES。
- `noClicks: number` — NO 被點次數（0→飛走）。
- `noPos: {left,top} | null`、`noGone: boolean`、`noSize: {w,h}` — NO 閃避 / 消失 / 佔位尺寸。
- `unlocked: number` — 已解鎖到第幾個 scene（0=只有出發；答 YES→1；選北→2；選中→3；選南→4）。
- `sel: { [stage:number]: key }` — 各站選的景點 key。
- `modal: {emoji,title,body,btn,after} | null` — 目前彈窗。
- `cur: number` — 目前顯示的 scene index（由捲動位置推算：`round(scrollLeft/clientWidth)`）。
- `jumping: boolean` + `jumpSeq: number` — 觸發 / 重播角色跳躍。

轉場觸發：
- 答 YES → `started=true, unlocked>=1`，開「神秘禮盒」彈窗，關閉後前進 scene 1。
- 選北（stage1）→ `unlocked=2`，直接前進 scene 2。
- 選中（stage2）→ `unlocked=3`，開彈窗，關閉後前進 scene 3。
- 選南（stage3）→ `unlocked=4`，開完成彈窗，關閉後前進 scene 4。
- `cur` 改變時觸發一次角色跳躍。

## Design Tokens（設計 token）
- **字體**：標題 / 中文 `ZCOOL KuaiLe`（Google Fonts）；英文 / 數字 `Baloo 2`（500/700/800）。
- **主色**：
  - 羊皮紙面板：`#fdf6e3 → #f4e6c2`，邊框 `#5f4526`，主要文字 `#3e2c10`、次要 `#a08050 / #ab8b58`。
  - 藍標題列：`#6d9bd9 → #4272b4 → #35619e → #2c5288`，底邊 `#244570`。
  - 綠（YES / 選中 / 確認）：`#8be374 → #4db049 → #358534`，邊 `#23632a`，陰影 `#1d5323`。
  - 紅（NO）：`#ff9a8a → #e85548 → #c23a2e`，邊 `#8e2323`，陰影 `#7a1d1d`。
  - 金（完成 / 彈窗框）：`#f2c14e → #bd881a`、光框 `#f7c948`。
  - 卡片：`#fffdf4 → #f7ecd2`，邊 `#cfae74`（選中 `#3f9d4a`）。
  - 邊緣霧化：`rgba(190,228,250,.9)`。
- **圓角**：面板 18px、彈窗 20px、卡片 16px、按鈕 13–14px、emoji 磚 16px。
- **面板陰影**：`0 0 0 4px rgba(255,255,255,.55), 0 0 0 6px rgba(95,69,38,.35), 0 28px 56px rgba(5,25,60,.45)`。
- **立體按鈕陰影**：`0 4px 0 <深色>, 0 10px 18px rgba(...,.3), inset 0 2px 0 rgba(255,255,255,.45)`。
- **響應式**：所有尺寸用 `clamp()`；高度用 `100dvh`；面板寬 `min(px, vw)`；支援 `env(safe-area-inset-*)`。
- **動畫時間**：跳躍 .62s；NO 位移 .4s / 飛走 .45s；彈窗進場 .38s；hover .14s。

## Assets（素材）
全部在 `assets/`，皆為**佔位美術**，可替換為正式圖：
- `ship-bg.jpeg` — Scene 0 背景（船頭「看到陸地」，使用者提供）。
- `map-bg.png` — Scene 1–4 背景（楓之谷式平台場景，使用者提供）。
- `jump-sprite.png` — 角色 2 影格 sprite sheet（站立 + 騰空），橫向排列，等寬等高、底部對齊；
  由使用者提供的兩張像素圖去背裁切合成（原圖白底已轉透明）。
- `arrow-left.png` / `arrow-right.png` — 底部導覽箭頭（紅 / 黃），由一張雙箭頭圖去浮水印後左右切開。

字型透過 Google Fonts CDN 載入，無本機字型檔。

## Files（檔案）
- `台灣之旅.dc.html` — 設計原型主檔（模板 + 邏輯）。**設計參考用**。
- `support.js` — 原型 runtime（原型工具產生，實作時不需移植）。
- `image-slot.js` — 可拖曳圖片框元件（Scene 3 用；正式版可省略）。
- `assets/*` — 見上。

## 建議實作步驟（供 Claude Code 參考）
1. 建立 5 個全幅 scene，用一個 `translateX` 的 track 或 route 切換（不要用可滑動的 overflow）。
2. 實作狀態機（見 State Management）與箭頭顯示規則。
3. 逐頁還原面板 / 卡片 / 按鈕樣式（見 Design Tokens）。
4. 實作 NO 閃避、角色跳躍、獎勵彈窗三段互動。
5. 替換正式美術與文案，接上真正的獎勵 / 表單提交邏輯。
