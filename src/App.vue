<script setup>
import { ref, reactive, computed, nextTick, onMounted, watch } from 'vue'
import html2canvas from 'html2canvas'
import shipBg    from '../assets/ship-bg-new.png'
import mapBg     from '../assets/map-bg-new.png'
import jumpSprite from '../assets/jump-sprite.png'
import arrowLeft  from '../assets/arrow-left.png'
import arrowRight from '../assets/arrow-right.png'
import soliChar   from '../assets/soli-char.png'
import girlSprite from '../assets/girl-sprite.png'
import alien1     from '../assets/alien-1.png'
import alien2     from '../assets/alien-2.png'
import alien3     from '../assets/alien-3.png'

// ─── Speech Bubble ────────────────────────────────────────────────────────────
function SpeechBubble(el, options) {
  const opt = Object.assign(
    { speed: 95, holdBetween: 1500, clearGap: 320, startDelay: 260, loop: false },
    options || {}
  )
  el.innerHTML =
    '<span class="sb-text"></span>' +
    '<span class="sb-caret"></span>' +
    '<span class="sb-tail-border"></span>' +
    '<span class="sb-tail-fill"></span>'
  const textEl  = el.querySelector('.sb-text')
  const caretEl = el.querySelector('.sb-caret')
  let lines = parseLines(el.getAttribute('data-lines'))
  let timer = null, alive = true

  function parseLines(str) {
    if (!str) return ['']
    return str.split('|').map(s => s.trim()).filter(Boolean)
  }
  function setText(t, typing) {
    textEl.textContent = t
    caretEl.classList.toggle('sb-hidden', !typing)
  }
  function typeLine(idx) {
    if (!alive) return
    const line = lines[idx] || ''
    let i = 0
    setText('', true)
    const step = () => {
      if (!alive) return
      i++
      setText(line.slice(0, i), i < line.length)
      if (i < line.length) { timer = setTimeout(step, opt.speed); return }
      const isLast = idx >= lines.length - 1
      if (isLast) {
        if (opt.loop) { timer = setTimeout(() => start(), opt.holdBetween) }
        else { el.classList.add('sb-done') }
        return
      }
      timer = setTimeout(() => {
        if (!alive) return
        setText('', true)
        timer = setTimeout(() => typeLine(idx + 1), opt.clearGap)
      }, opt.holdBetween)
    }
    timer = setTimeout(step, opt.startDelay)
  }
  function start() { clearTimeout(timer); alive = true; el.classList.remove('sb-done'); typeLine(0) }
  start()
  return {
    setLines(arr) { lines = Array.isArray(arr) ? arr : parseLines(arr); start() },
    replay() { start() },
    stop() { alive = false; clearTimeout(timer) },
    el
  }
}
function initBubble(el, lines, opts = {}) {
  if (!el) return null
  if (el.querySelector('.sb-text')) return null  // already initialised; re-render, not remount
  el.setAttribute('data-lines', Array.isArray(lines) ? lines.join('|') : lines)
  return SpeechBubble(el, { loop: false, speed: 85, holdBetween: 600, clearGap: 200, ...opts })
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
function detectLang() {
  const bl = (navigator.language || 'en').toLowerCase()
  if (bl.startsWith('ko')) return 'kr'
  if (bl.startsWith('ja')) return 'ja'
  return 'en'
}
const lang         = ref(detectLang())
const downloadState = ref('idle') // 'idle' | 'loading' | 'done'
const LANGS = ['en', 'kr', 'ja']
const I18N  = {
  zh: {
    depart:'出發', am:'早', noon:'中', pm:'晚',
    stop1:'第一站', stop2:'第二站', stop3:'第三站',
    questHeader:'冒險任務 · QUEST',
    questTitle:'準備好開始\n你的台灣之旅了嗎？',
    questSub:'READY FOR YOUR TAIWAN ADVENTURE?',
    yesBtn:'YES 出發！', noBtn:'NO 再想想',
    pick:'選一個地點展開探索', pickLast:'選一個地點完成旅程',
    pick2:'選 1-2 個地點（可複選，最多 2 個）',
    deselect:'取消選擇',
    locked1:'🔒 先回到起點回答問題，即可解鎖',
    locked:'🔒 完成上一站，解鎖此地點',
    complete:'🏝️ 你的台灣旅程 · COMPLETE',
    confirmPick:'確認選擇', download:'📥 下載截圖',
    downloadHint:'下載圖片分享給 Justin 吧 📮',
    downloadFail:'截圖失敗，請用手機截圖功能',
    hint:'偷偷說…「NO」好像有點滑溜 😏', selected:'✓ 已選擇',
    mYesEmoji:'🎁', mYesTitle:'神秘禮盒 GET!',
    mYesBody:'恭喜獲得「越南禮盒」\n\n你的台灣冒險正式展開～',
    mYesBtn:'開啟旅程',
    mNoonEmoji:'🎇', mNoonTitle:'獲得神秘道具！',
    mNoonBody:'🎇 🎇 🎇\n獲得火與夜的祝福',
    mNoonBtn:'收入背包',
    mDoneEmoji:'🏆', mDoneTitle:'旅程完成！',
    mDoneBody:'你已選好台灣一日行程，\n準備出發了嗎？',
    mDoneBtn:'查看行程',
    boyGreet:['歡迎來到台灣！', '期待在台灣見到你！'],
    girl1Pre:'早上要去哪裡呢？', girl1Post:'好期待！',
    girl2Pre:'要去哪裡玩呢？',   girl2Post:'走吧！走吧',
    girl3Pre:'台灣的晚上在幹嘛呢？', girl3Post:'❤️',
    girl4Bubble:'好開心！',
    boy4Bubble:'我很期待一起出去玩！',
  },
  en: {
    depart:'Start', am:'AM', noon:'Noon', pm:'PM',
    stop1:'Stop 1', stop2:'Stop 2', stop3:'Stop 3',
    questHeader:'ADVENTURE · QUEST',
    questTitle:'Ready for your\nTaiwan adventure?',
    questSub:'READY FOR YOUR TAIWAN ADVENTURE?',
    yesBtn:"YES, Let's Go!", noBtn:'NO, hmm...',
    pick:'Choose a destination', pickLast:'Choose your final stop',
    pick2:'Choose 1-2 destinations (up to 2)',
    deselect:'Deselect',
    locked1:'🔒 Go back to start to unlock',
    locked:'🔒 Complete the previous stop first',
    complete:'🏝️ Your Taiwan Journey · COMPLETE',
    confirmPick:'Confirm', download:'📥 Save Screenshot',
    downloadHint:'Download & share with Justin 📮',
    downloadFail:'Screenshot failed — use your phone\'s screen capture',
    hint:"Psst… the NO button is a bit slippery 😏", selected:'✓ Selected',
    mYesEmoji:'🎁', mYesTitle:'Mystery Box GET!',
    mYesBody:'You received a "Vietnam Gift Box"!\n\nYour Taiwan adventure begins～',
    mYesBtn:'Start Journey',
    mNoonEmoji:'🎇', mNoonTitle:'Mysterious Item Found!',
    mNoonBody:'🎇 🎇 🎇\nBlessing of Fire and Night received',
    mNoonBtn:'Add to Bag',
    mDoneEmoji:'🏆', mDoneTitle:'Journey Complete!',
    mDoneBody:'Your Taiwan day trip is planned!\nReady to go?',
    mDoneBtn:'View Itinerary',
    boyGreet:['Welcome to Taiwan!', "Can't wait to see you here!"],
    girl1Pre:'Where should we go this morning?', girl1Post:'So excited!',
    girl2Pre:'Where shall we explore?',          girl2Post:"Let's go! Let's go!",
    girl3Pre:"What's the plan for tonight?",     girl3Post:'❤️',
    girl4Bubble:'So happy!',
    boy4Bubble:"Can't wait to see you!",
  },
  kr: {
    depart:'출발', am:'아침', noon:'점심', pm:'저녁',
    stop1:'1번째', stop2:'2번째', stop3:'3번째',
    questHeader:'어드벤처 · 퀘스트',
    questTitle:'대만 여행을\n시작할 준비가 됐나요?',
    questSub:'대만 어드벤처 준비 완료?',
    yesBtn:'YES, 출발!', noBtn:'NO, 글쎄...',
    pick:'목적지를 선택하세요', pickLast:'마지막 목적지를 선택하세요',
    pick2:'목적지 1-2개 선택 (최대 2개)',
    deselect:'선택 취소',
    locked1:'🔒 시작 지점으로 돌아가서 잠금 해제',
    locked:'🔒 이전 단계를 완료해야 합니다',
    complete:'🏝️ 대만 여행 · 완료',
    confirmPick:'확인', download:'📥 스크린샷 저장',
    downloadHint:'Justin에게 사진 공유하기 📮',
    downloadFail:'스크린샷 실패 — 핸드폰 화면 캡처를 사용해주세요',
    hint:'잠깐... NO 버튼이 좀 미끄럽네요 😏', selected:'✓ 선택됨',
    mYesEmoji:'🎁', mYesTitle:'신비 상자 GET!',
    mYesBody:'「베트남 선물 상자」획득!\n\n대만 어드벤처 시작～',
    mYesBtn:'여행 시작',
    mNoonEmoji:'🎇', mNoonTitle:'신비 아이템 획득!',
    mNoonBody:'🎇 🎇 🎇\n불과 밤의 축복을 받았다',
    mNoonBtn:'가방에 넣기',
    mDoneEmoji:'🏆', mDoneTitle:'여행 완료!',
    mDoneBody:'대만 하루 여행 계획 완성!\n출발할 준비 됐나요?',
    mDoneBtn:'일정 보기',
    boyGreet:['대만에 오신 걸 환영해요!', '대만에서 만나길 기대해요!'],
    girl1Pre:'오늘 아침엔 어디 갈까요?', girl1Post:'너무 기대돼요!',
    girl2Pre:'어디를 탐험할까요?',       girl2Post:'가자! 가자!',
    girl3Pre:'오늘 저녁 계획은요?',      girl3Post:'❤️',
    girl4Bubble:'너무 행복해요!',
    boy4Bubble:'같이 놀러 가기 너무 기대돼요!',
  },
  ja: {
    depart:'出発', am:'朝', noon:'昼', pm:'夜',
    stop1:'第1スポット', stop2:'第2スポット', stop3:'第3スポット',
    questHeader:'アドベンチャー · クエスト',
    questTitle:'台湾の旅へ\n出発する準備はできた？',
    questSub:'READY FOR YOUR TAIWAN ADVENTURE?',
    yesBtn:'YES 出発！', noBtn:'NO まだかな…',
    pick:'目的地を選ぼう', pickLast:'最後の場所を選ぼう',
    pick2:'目的地を1-2つ選ぼう（最大2つ）',
    deselect:'選択解除',
    locked1:'🔒 最初に戻って質問に答えてね',
    locked:'🔒 前のステージをクリアしてね',
    complete:'🏝️ 台湾の旅 · COMPLETE',
    confirmPick:'確認', download:'📥 スクリーンショット保存',
    downloadHint:'Justinに画像を送ってね 📮',
    downloadFail:'スクリーンショット失敗 — スマホの画面キャプチャをご利用ください',
    hint:'「NO」ボタン、なんか滑ってる 😏', selected:'✓ 選択済み',
    mYesEmoji:'🎁', mYesTitle:'ミステリーボックス GET!',
    mYesBody:'「ベトナムギフトボックス」ゲット！\n\n台湾アドベンチャーが始まる～',
    mYesBtn:'旅を始める',
    mNoonEmoji:'🎇', mNoonTitle:'神秘アイテム獲得！',
    mNoonBody:'🎇 🎇 🎇\n火と夜の祝福を受け取った',
    mNoonBtn:'バッグに入れる',
    mDoneEmoji:'🏆', mDoneTitle:'旅完了！',
    mDoneBody:'台湾一日旅行の計画完成！\n出発の準備はできた？',
    mDoneBtn:'旅程を見る',
    boyGreet:['台湾へようこそ！', 'ここで会えるのを楽しみにしてるよ！'],
    girl1Pre:'今朝はどこ行こうか？', girl1Post:'楽しみ！',
    girl2Pre:'どこを探検しようか？', girl2Post:'行こう！行こう！',
    girl3Pre:'今夜の予定は？',       girl3Post:'❤️',
    girl4Bubble:'嬉しい！',
    boy4Bubble:'一緒に遊びに行くの楽しみだよ！',
  },
}
const tr = computed(() => I18N[lang.value] ?? I18N.en)

// ─── Spot Images (Vite glob — auto-picks up downloaded files) ────────────────
const _imgs = import.meta.glob('../assets/s*/**/*.{jpg,jpeg,png}', { eager: true, import: 'default' })
function si(path) { return _imgs[`../assets/${path}`] || null }

// ─── Spot Data ────────────────────────────────────────────────────────────────
const S1 = [
  { key:'dadaocheng1', emoji:'👘', name:'大稻埕',
    desc:'百年迪化街漫步，在專業師傅的旗袍店挑選一套屬於你的旗袍，穿著它拍下最美的台灣記憶。',
    photos:[ si('s1/dadaocheng/1.jpg'), si('s1/dadaocheng/2.jpg'), si('s1/dadaocheng/3.jpg') ].filter(Boolean) },
  { key:'palace',  emoji:'🏛️', name:'故宮博物院',
    desc:'珍藏全球最豐富的中華文物，翠玉白菜、肉形石等鎮館之寶，走進五千年文明史。',
    photos:[ si('s1/palace/1.jpg'), si('s1/palace/2.jpg'), si('s1/palace/3.jpg') ].filter(Boolean) },
  { key:'101',     emoji:'🏙️', name:'台北 101',
    desc:'508 公尺的世界地標，頂樓觀景台 360° 俯瞰台北全景，日夜各有絕美風貌。',
    photos:[ si('s1/101/1.jpg'), si('s1/101/2.jpg'), si('s1/101/3.jpg') ].filter(Boolean) },
]
const S2 = [
  { key:'shifen',   emoji:'💧', name:'十分瀑布 + 平溪',
    desc:'台灣版尼加拉瀑布壯觀雄渾，平溪老街放天燈許願，是山林間最浪漫的半日遊。',
    photos:[ si('s2/shifen/1.jpg'), si('s2/shifen/2.jpg'), si('s2/shifen/3.jpg') ].filter(Boolean) },
  { key:'jiufen',  emoji:'🏘️', name:'九份老街',
    desc:'依山傍海的百年礦業聚落，蜿蜒石階巷弄、紅燈籠倒映雨霧，是台灣最具代表性的懷舊風景。',
    photos:[ si('s2/jiufen/1.jpg'), si('s2/jiufen/2.jpg'), si('s2/jiufen/3.jpg') ].filter(Boolean) },
  { key:'houtong', emoji:'🐱', name:'猴硐貓村',
    desc:'全台最著名的貓咪聚落，到處都是慵懶的貓咪迎客，是愛貓人士絕對不能錯過的療癒景點。',
    photos:[ si('s2/houtong/1.jpg'), si('s2/houtong/2.jpg'), si('s2/houtong/3.jpg') ].filter(Boolean) },
  { key:'danshui', emoji:'🌅', name:'淡水老街',
    desc:'淡水河口的百年老街，吃阿給、鐵蛋配河岸夕陽，是台北近郊最輕鬆寫意的午後散策。',
    photos:[ si('s2/danshui/1.jpg'), si('s2/danshui/2.jpg'), si('s2/danshui/3.jpg') ].filter(Boolean) },
  { key:'art',     emoji:'🎨', name:'展覽',
    desc:'台北最精彩的三檔展覽：波特羅、共織宇宙、世界是一片感知的膜，藝術能量滿滿的一天。',
    photos:[ si('s2/art/1.jpg'), si('s2/art/2.jpg'), si('s2/art/3.jpg') ].filter(Boolean),
    links:['https://www.instagram.com/p/DahwZzNgdGy/', 'https://www.instagram.com/p/DWL0XM8Ep_d/', 'https://www.instagram.com/p/DYt7IqXTEKr/'] },
  { key:'other',   emoji:'🗺️', name:'我有其他想去的地方',
    desc:'有心動的地方嗎？找到之後一定要跟我說喔！不管是夜景、小吃街、特色咖啡廳，Justin 幫你把它排進行程 ✨',
    photos:[ si('s2/other/1.jpg') ].filter(Boolean) },
]
const S3 = [
  { key:'raohe',   emoji:'🏮', name:'饒河街夜市',
    desc:'百年歷史的老牌夜市，胡椒餅、藥燉排骨飄香，在廟宇前品嚐最道地的台北滋味。',
    photos:[ si('s3/raohe/1.jpg'), si('s3/raohe/2.jpg'), si('s3/raohe/3.jpg') ].filter(Boolean) },
  { key:'shilin',  emoji:'🍢', name:'士林夜市',
    desc:'台灣最大最知名的夜市，豪大大雞排、鹹酥雞、草莓泡泡冰，每樣都讓你難以抗拒。',
    photos:[ si('s3/shilin/1.jpg'), si('s3/shilin/2.jpg'), si('s3/shilin/3.jpg') ].filter(Boolean) },
  { key:'ningxia',   emoji:'🧧', name:'寧夏夜市',
    desc:'台北最受在地人喜愛的傳統夜市，蚵仔煎、蔥肉餅、天婦羅樣樣道地，密度高、氣氛熱鬧，吃完保證滿足。',
    photos:[ si('s3/ningxia/1.jpg'), si('s3/ningxia/2.jpg'), si('s3/ningxia/3.jpg') ].filter(Boolean) },
]

// ─── Spot i18n ────────────────────────────────────────────────────────────────
const SPOT_L10N = {
  dadaocheng1: {
    en: { name: 'Dadaocheng', desc: 'Stroll through century-old Dihua Street, pick a custom qipao at a master tailor\'s shop, and capture your most beautiful Taiwan memories wearing it.' },
    kr: { name: '다다오청', desc: '100년 역사의 디화제를 산책하며, 전문 장인의 가게에서 나만의 치파오를 골라 입고 아름다운 대만의 추억을 담아보세요.' },
    ja: { name: '大稻埕', desc: '100年の歴史を持つ迪化街を散策し、職人のお店でチャイナドレスを一着選んで、最高の台湾の思い出を作ろう。' },
  },
  palace: {
    en: { name: 'National Palace Museum', desc: 'Home to the world\'s richest collection of Chinese artifacts — the iconic Jadeite Cabbage, the Meat-shaped Stone — stepping inside is stepping into 5,000 years of civilization.' },
    kr: { name: '국립고궁박물원', desc: '세계 최고의 중화 문물 컬렉션. 취옥 배추와 육형석 등 국보를 만나며 5천 년 문명의 역사 속으로 들어가보세요.' },
    ja: { name: '国立故宮博物院', desc: '翠玉白菜、肉形石など至宝に出会いながら、世界最高峰の中国文物コレクションで5000年の歴史を体感しよう。' },
  },
  '101': {
    en: { name: 'Taipei 101', desc: 'The iconic 508-meter skyscraper offers a breathtaking 360° view of Taipei from its observation deck — stunning by day and magical at night.' },
    kr: { name: '타이베이 101', desc: '508미터의 랜드마크에서 360° 파노라마로 타이베이 전경을 감상하세요. 낮과 밤 모두 환상적인 경치를 자랑합니다.' },
    ja: { name: '台北101', desc: '高さ508メートルの世界的ランドマーク。展望台から台北を360°見渡せる絶景は、昼も夜も格別の美しさ。' },
  },
  shifen: {
    en: { name: 'Shifen Waterfall + Pingxi', desc: 'Taiwan\'s very own Niagara Falls thunders with raw power. Release a sky lantern at Pingxi Old Street and let your wishes float away into the mountain air.' },
    kr: { name: '스펀 폭포 + 핑시', desc: '대만의 나이아가라 폭포라 불리는 장대한 스펀 폭포와, 핑시 올드 스트리트에서 소원 풍등 날리기 — 가장 낭만적인 반나절 여행.' },
    ja: { name: '十分滝 + 平溪', desc: '台湾のナイアガラと呼ばれる十分滝の迫力を体感し、平溪老街でランタンに願いを込めて空へ飛ばそう。' },
  },
  jiufen: {
    en: { name: 'Jiufen Old Street', desc: 'A century-old mining village perched between mountains and sea. Winding stone steps, glowing red lanterns in the mist — the most iconic nostalgic scenery in Taiwan.' },
    kr: { name: '지우펀 올드 스트리트', desc: '산과 바다 사이에 자리한 100년 광산 마을. 구불구불한 돌계단과 빗속에 붉게 빛나는 홍등이 어우러진, 대만에서 가장 낭만적인 풍경.' },
    ja: { name: '九份老街', desc: '山と海に挟まれた百年の鉱山集落。石段の路地と霧の中に輝く赤いランタンが織りなす、台湾一ノスタルジックな風景。' },
  },
  houtong: {
    en: { name: 'Houtong Cat Village', desc: 'Taiwan\'s most famous cat haven — laid-back kitties greet you around every corner. A must-visit for all cat lovers.' },
    kr: { name: '허우통 고양이 마을', desc: '대만 최고의 고양이 마을. 느긋한 고양이들이 곳곳에서 반겨주는, 고양이를 사랑한다면 절대 놓칠 수 없는 힐링 명소.' },
    ja: { name: '猴硐猫村', desc: '台湾一有名な猫の村。のんびりした猫たちがあちこちで出迎えてくれる、猫好きなら絶対に外せない癒しスポット。' },
  },
  danshui: {
    en: { name: 'Danshui Old Street', desc: 'A century-old riverside street where you snack on agei and iron eggs while watching the most beautiful sunset in Taipei — the perfect lazy afternoon.' },
    kr: { name: '단수이 올드 스트리트', desc: '타이베이 근교의 백년 올드 스트리트. 아게이와 철란을 먹으며 강가 석양을 바라보는, 가장 여유로운 오후 산책.' },
    ja: { name: '淡水老街', desc: '淡水河沿いの百年の老街。阿給や鉄卵を食べながら台北近郊で最も美しい夕日を眺める、気ままな午後の散策。' },
  },
  art: {
    en: { name: 'Exhibitions', desc: 'Three unmissable Taipei shows: Botero, Weaving the Cosmos, and The World is a Membrane of Perception — an art-packed day unlike any other.' },
    kr: { name: '전시회', desc: '타이베이 최고의 세 전시: 보테로, 우주를 짜다, 세계는 지각의 막 — 예술로 가득 찬 하루.' },
    ja: { name: '展覧会', desc: '台北で見逃せない三つの展示：ボテロ、宇宙を織る、知覚の膜としての世界 — アートに満ちた特別な一日。' },
  },
  other: {
    en: { name: 'I have somewhere in mind', desc: 'Have a place that caught your eye? Find it and make sure to tell me — whether it\'s a scenic spot, a food street, or a hidden café, Justin will make it happen ✨' },
    kr: { name: '다른 가고 싶은 곳이 있어요', desc: '마음에 드는 곳이 있나요? 찾아보고 꼭 알려주세요! 야경, 맛집 거리, 숨은 카페 등 어디든 Justin이 일정에 넣어드릴게요 ✨' },
    ja: { name: '他に行きたい場所がある', desc: '気になる場所はある？見つけたら絶対に教えてね！夜景でも、グルメ通りでも、隠れカフェでも、Justinが旅程に入れてあげるよ ✨' },
  },
  raohe: {
    en: { name: 'Raohe Night Market', desc: 'A century-old market beloved by locals — pepper pork buns and herbal pork ribs fill the air. Taste the most authentic Taipei street food in front of the temple.' },
    kr: { name: '라오허 야시장', desc: '100년 전통의 야시장. 후추빵과 한방 돼지갈비 향이 가득한, 사원 앞에서 즐기는 가장 정통 타이베이 야식.' },
    ja: { name: '饒河街夜市', desc: '百年の歴史の老舗夜市。胡椒餅と薬膳スペアリブの香りに包まれ、廟の前で最も地元らしい台北の味を堪能しよう。' },
  },
  shilin: {
    en: { name: 'Shilin Night Market', desc: 'Taiwan\'s largest and most famous night market — giant fried chicken, salt & pepper popcorn chicken, strawberry bubble ice... every bite makes you want more.' },
    kr: { name: '스린 야시장', desc: '대만 최대·최고의 야시장. 거대한 닭튀김, 소금후추 팝콘치킨, 딸기 버블 아이스… 모든 것이 하나같이 맛있어요.' },
    ja: { name: '士林夜市', desc: '台湾最大・最有名の夜市。巨大フライドチキン、塩コショウポップコーンチキン、イチゴバブルアイス…どれも抗いがたいおいしさ。' },
  },
  ningxia: {
    en: { name: 'Ningxia Night Market', desc: 'Taipei\'s most beloved traditional night market among locals — oyster omelette, onion pork pancake, tempura... all hyper-authentic. Lively atmosphere, guaranteed satisfaction.' },
    kr: { name: '닝시아 야시장', desc: '현지인들이 가장 사랑하는 전통 야시장. 굴전, 파고기빵, 튀김… 모두 정통 그 자체. 활기찬 분위기로 먹고 나면 100% 만족!' },
    ja: { name: '寧夏夜市', desc: '地元の人に最も愛される伝統夜市。蚵仔煎、ネギ肉餅、天ぷら…どれも本格派。活気があり、食べ終わったら必ず大満足。' },
  },
}

function localizeSpot(spot) {
  const l = SPOT_L10N[spot.key]?.[lang.value]
  return l ? { ...spot, name: l.name, desc: l.desc, sub: '' } : { ...spot, sub: '' }
}

const localizedS1 = computed(() => S1.map(localizeSpot))
const localizedS2 = computed(() => S2.map(localizeSpot))
const localizedS3 = computed(() => S3.map(localizeSpot))

// ─── State ────────────────────────────────────────────────────────────────────
const state = reactive({
  started:       false,
  girlIn:        false,
  noPos:         null,
  noSize:        null,
  unlocked:      0,
  sel:           {},
  modal:         null,
  spotModal:     null,
  cur:           0,
  jumping:       false,
  jumpSeq:       0,
  scene4Entered:       false,
  scene4PanelVisible:  false,
  girlExcited:         false,
})

const worldEl      = ref(null)
const noBtnEl      = ref(null)
const questVisible = ref(false)
const sceneEls = reactive({})
let jumpTimer        = null
let scene4Interval   = null
let scene4JumpDelay  = null
let shownResultModal = false
let shownNoonModal   = false
let scene4Blob       = null  // pre-generated screenshot blob
const carouselImgLoaded = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────
const sceneCount   = computed(() => state.unlocked >= 4 ? 5 : 4)
const done         = computed(() => state.unlocked >= 4)
const leftVisible  = computed(() => state.cur >= 2 && state.cur < 4)
const rightVisible = computed(() => {
  if (state.cur < 1 || state.cur >= 4) return false
  if (state.cur === 2) return (Array.isArray(state.sel[2]) ? state.sel[2].length : 0) > 0
  return !!state.sel[state.cur]
})

const steps = computed(() => [
  { label: tr.value.depart, isDone: state.started,  alienImg: null   },
  { label: tr.value.am,     isDone: !!state.sel[1], alienImg: alien1 },
  { label: tr.value.noon,   isDone: (Array.isArray(state.sel[2]) ? state.sel[2].length : 0) > 0, alienImg: alien2 },
  { label: tr.value.pm,     isDone: !!state.sel[3], alienImg: alien3 },
])
const picks = computed(() => {
  const sel2keys = Array.isArray(state.sel[2]) ? state.sel[2] : []
  const sel2spots = sel2keys.map(k => localizedS2.value.find(o => o.key === k)).filter(Boolean)

  let noon = null
  if (sel2spots.length === 1) {
    noon = { ...sel2spots[0], stage: 2 }
  } else if (sel2spots.length === 2) {
    noon = {
      key: '__combo2',
      emoji: sel2spots[0].emoji + sel2spots[1].emoji,
      name: sel2spots[0].name + ' + ' + sel2spots[1].name,
      sub: '',
      desc: sel2spots[0].desc + '\n\n' + sel2spots[1].desc,
      photos: [...(sel2spots[0].photos ?? []), ...(sel2spots[1].photos ?? [])],
      stage: 2,
    }
  }

  return [
    state.sel[1] ? { ...localizedS1.value.find(o => o.key === state.sel[1]), stage: 1 } : null,
    noon,
    state.sel[3] ? { ...localizedS3.value.find(o => o.key === state.sel[3]), stage: 3 } : null,
  ].filter(Boolean)
})

// NO button
const noBaseStyle = {
  fontSize:'clamp(18px,4.4vw,23px)', padding:'13px clamp(24px,5vw,38px)',
  border:'2px solid #8e2323', borderRadius:'14px',
  background:'linear-gradient(#ff9a8a 0%,#e85548 46%,#d84437 54%,#c23a2e 100%)',
  color:'#fff', letterSpacing:'1px', whiteSpace:'nowrap',
  boxShadow:'0 4px 0 #7a1d1d, 0 10px 18px rgba(60,0,0,.3), inset 0 2px 0 rgba(255,255,255,.45)',
  textShadow:'0 2px 2px rgba(80,0,0,.4)', cursor:'pointer',
  fontFamily:"'ZCOOL KuaiLe','Baloo 2',sans-serif",
  transition:'left .4s ease, top .4s ease', lineHeight:'1.2',
}
const noStyle = computed(() => ({
  ...noBaseStyle,
  ...(state.noPos
    ? { position:'fixed', left:state.noPos.left+'px', top:state.noPos.top+'px', zIndex:210 }
    : { position:'relative' })
}))
const noWrapStyle = computed(() =>
  state.noSize
    ? { position:'relative', width:state.noSize.w+'px', height:state.noSize.h+'px', flex:'none', display:'inline-flex' }
    : { position:'relative', display:'inline-flex', alignItems:'center' }
)

// Girl sprite background-image (Vite hashes asset URL, must be inline style)
const girlBgStyle = computed(() => ({ backgroundImage: `url('${girlSprite}')` }))

// Scene 1-3 girl bubble — key triggers remount on scene/state/lang change
const girlBubbleKey   = computed(() => `${lang.value}-${state.cur}-${state.girlExcited}`)
const girlBubbleLines = computed(() => {
  const exc = state.girlExcited, c = state.cur, t = tr.value
  if (exc) return { 1:[t.girl1Post], 2:[t.girl2Post], 3:[t.girl3Post] }[c] || ['']
  return { 1:[t.girl1Pre], 2:[t.girl2Pre], 3:[t.girl3Pre] }[c] || ['']
})

// Scene 4 girl col + sprite refs — animations reset via DOM (no key remount → no flash)
const scene4GirlColRef    = ref(null)
const scene4GirlSpriteRef = ref(null)
watch(() => state.jumpSeq, () => {
  const col    = scene4GirlColRef.value
  const sprite = scene4GirlSpriteRef.value
  if (col) {
    col.style.animation = 'none'
    void col.offsetHeight
    col.style.animation = 'jumpY .62s ease-in-out'
  }
  if (sprite) {
    sprite.style.animation = 'none'
    void sprite.offsetHeight
    sprite.style.animation = 'frameSwap .62s step-end'
  }
})

// Sprite style — scene 4 girl (animation controlled via DOM ref above)
const scene4SpriteFrameStyle = computed(() => ({
  width:'clamp(72px,10vw,118px)', aspectRatio:'356 / 611',
  backgroundImage:`url('${jumpSprite}')`,
  backgroundPosition:'0% 0', backgroundSize:'200% 100%', backgroundRepeat:'no-repeat',
  filter:'drop-shadow(0 8px 6px rgba(10,30,60,.35))',
}))

// Sprite style — kept for reference (unused in template after refactor)
const spriteStyle = computed(() => ({
  width:'clamp(72px,10vw,118px)', aspectRatio:'356 / 611',
  backgroundImage:`url('${jumpSprite}')`,
  backgroundPosition:'0% 0', backgroundSize:'200% 100%', backgroundRepeat:'no-repeat',
  filter:'drop-shadow(0 8px 6px rgba(10,30,60,.35))',
  animation: state.jumping ? 'jumpY .62s ease-in-out, frameSwap .62s step-end' : 'none',
}))

// Boy sprite
const soliSpriteStyle = {
  width:'clamp(72px,10vw,118px)', aspectRatio:'367 / 626',
  backgroundImage:`url('${soliChar}')`,
  backgroundPosition:'0% 0%', backgroundSize:'300% 100%', backgroundRepeat:'no-repeat',
  imageRendering:'pixelated',
  filter:'drop-shadow(0 8px 8px rgba(10,30,60,.3))',
  animation:'wave3 1s step-end infinite',
}
const soliScene0Style = { ...soliSpriteStyle }

// ─── Methods ──────────────────────────────────────────────────────────────────
function scrollToScene(i) {
  const c  = worldEl.value
  const el = sceneEls[i]
  if (c && el) c.scrollTo({ left: el.offsetLeft, behavior:'smooth' })
  else if (c)  c.scrollTo({ left: i * c.clientWidth, behavior:'smooth' })
}
function triggerJump() {
  state.jumpSeq++
  state.jumping = true
  clearTimeout(jumpTimer)
  jumpTimer = setTimeout(() => { state.jumping = false }, 640)
}
function onWorldScroll(e) {
  const c   = e.currentTarget
  const cur = Math.round(c.scrollLeft / c.clientWidth)
  if (cur !== state.cur) {
    state.cur = cur
    state.girlExcited = !!state.sel[cur]
    triggerJump()
    if (cur === 4) {
      setTimeout(() => { state.scene4Entered = true }, 100)
      scene4JumpDelay = setTimeout(() => {
        if (state.cur === 4 && !scene4Interval) {
          triggerJump()
          scene4Interval = setInterval(() => triggerJump(), 1400)
        }
      }, 1350)
      if (done.value && !shownResultModal) {
        shownResultModal = true
        setTimeout(() => {
          state.modal = {
            emoji: tr.value.mDoneEmoji, title: tr.value.mDoneTitle,
            body: tr.value.mDoneBody,   btn:   tr.value.mDoneBtn,
            after: () => { state.scene4PanelVisible = true },
          }
        }, 2000)
      }
    } else {
      clearTimeout(scene4JumpDelay)
      scene4JumpDelay = null
      clearInterval(scene4Interval)
      scene4Interval = null
      state.scene4Entered = false
      state.scene4PanelVisible = false
    }
  }
}
function goPrev() { scrollToScene(Math.max(0, state.cur - 1)) }
async function goNext() {
  const next = Math.min(sceneCount.value - 1, state.cur + 1)
  if (state.cur === 2 && !shownNoonModal) {
    shownNoonModal = true
    state.modal = {
      emoji: tr.value.mNoonEmoji,
      title: tr.value.mNoonTitle,
      body:  tr.value.mNoonBody,
      btn:   tr.value.mNoonBtn,
      after: async () => { await nextTick(); scrollToScene(3) },
    }
    return
  }
  await nextTick()
  scrollToScene(next)
}

function onYes() {
  if (state.started) return
  state.started = true
  if (state.unlocked < 1) state.unlocked = 1
  state.noPos = null
  state.modal = {
    emoji: tr.value.mYesEmoji,
    title: tr.value.mYesTitle,
    body:  tr.value.mYesBody,
    btn:   tr.value.mYesBtn,
    after: () => {
      scrollToScene(1)
      setTimeout(() => { state.girlIn = true }, 600)
    },
  }
}
function onNo() {
  const el = noBtnEl.value
  const w = (el ? el.offsetWidth  : 0) || 150
  const h = (el ? el.offsetHeight : 0) || 50
  if (!state.noSize) state.noSize = { w, h }
  const m    = 10
  const maxX = window.innerWidth  - w - m
  const maxY = window.innerHeight - h - m
  state.noPos = {
    left: Math.floor(m + Math.random() * Math.max(0, maxX - m)),
    top:  Math.floor(m + Math.random() * Math.max(0, maxY - m)),
  }
}

function select(stage, key) {
  if (state.unlocked < stage) return
  if (stage === 2) {
    const arr = Array.isArray(state.sel[2]) ? state.sel[2] : []
    if (arr.includes(key)) {
      state.sel = { ...state.sel, 2: arr.filter(k => k !== key) }
    } else if (arr.length < 2) {
      state.sel = { ...state.sel, 2: [...arr, key] }
    }
    if ((state.sel[2]?.length ?? 0) > 0 && state.unlocked < 3) state.unlocked = 3
  } else {
    state.sel = { ...state.sel, [stage]: key }
    if (stage === 1 && state.unlocked < 2) state.unlocked = 2
    else if (stage === 3 && state.unlocked < 4) state.unlocked = 4
  }
}
function openSpotDetail(stage, opt) {
  if (!opt.isActive) return
  carouselImgLoaded.value = false
  state.spotModal = { stage, opt, viewOnly: false, photoIdx: 0 }
}
function openSpotDetailViewOnly(p) {
  carouselImgLoaded.value = false
  state.spotModal = { stage: p.stage, opt: { ...p, isActive: false }, viewOnly: true, photoIdx: 0 }
}
function closeSpotModal() { state.spotModal = null }
function confirmSpot() {
  if (!state.spotModal) return
  const { stage, opt } = state.spotModal
  const sel2     = Array.isArray(state.sel[2]) ? state.sel[2] : []
  const wasSel2  = stage === 2 && sel2.includes(opt.key)
  closeSpotModal()
  select(stage, opt.key)
  if (!wasSel2) {
    setTimeout(() => { state.girlExcited = true }, 300)
  }
}
function prevPhoto() {
  if (state.spotModal && state.spotModal.photoIdx > 0) {
    carouselImgLoaded.value = false
    state.spotModal.photoIdx--
  }
}
function nextPhoto() {
  const m = state.spotModal
  if (m && m.photoIdx < (m.opt.photos?.length ?? 1) - 1) {
    carouselImgLoaded.value = false
    m.photoIdx++
  }
}

function makeSpots(stage, arrOrRef) {
  const arr = arrOrRef?.value ?? arrOrRef
  const isUnlocked = state.unlocked >= stage
  if (stage === 2) {
    const sel2 = Array.isArray(state.sel[2]) ? state.sel[2] : []
    return arr.map(o => ({ ...o, isSel: sel2.includes(o.key), isActive: isUnlocked, isDisabled: !isUnlocked }))
  }
  const sel = state.sel[stage]
  return arr.map(o => ({ ...o, isSel: sel===o.key, isActive: isUnlocked, isDisabled: !isUnlocked }))
}

function closeModal() {
  const a = state.modal?.after
  state.modal = null
  if (a) setTimeout(a, 380)
}

// ─── HUD reveal + flash on scene navigation ──────────────────────────────────
const hudShown    = reactive([false, false, false, false])
const hudFlashKeys = reactive([0, 0, 0, 0])
watch(() => state.cur, (cur) => {
  for (let prev = 1; prev < cur && prev <= 3; prev++) {
    if (state.sel[prev] && !hudShown[prev]) {
      hudShown[prev] = true
      hudFlashKeys[prev]++
    }
  }
})

// ─── Arrow position (below panel) ────────────────────────────────────────────
const arrowTopPx = ref(null)
function updateArrowPos() {
  const sceneEl = sceneEls[state.cur]
  if (!sceneEl) { arrowTopPx.value = null; return }
  const panelEl = sceneEl.querySelector('.panel-wrap')
  if (!panelEl) { arrowTopPx.value = null; return }
  const rect = panelEl.getBoundingClientRect()
  arrowTopPx.value = Math.min(rect.bottom + 22, window.innerHeight - 66)
}
watch([() => state.cur, () => state.unlocked, () => state.scene4PanelVisible], () => nextTick(updateArrowPos))

function hudCircleStyle(isDone) {
  return {
    width:'28px', height:'28px', borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'13px', border:'2px solid #fff',
    boxShadow:'0 2px 4px rgba(60,40,10,.3), inset 0 1px 0 rgba(255,255,255,.5)',
    background: isDone ? 'linear-gradient(#57b85f,#2f8e3a)' : 'linear-gradient(#f2e3c0,#dcc394)',
    color: isDone ? '#fff' : '#8a6a3a',
  }
}

function preloadImages(srcs) {
  srcs.forEach(src => { if (src) { const img = new Image(); img.src = src } })
}
const allS1Photos = S1.flatMap(s => s.photos)
const allS2Photos = S2.flatMap(s => s.photos)
const allS3Photos = S3.flatMap(s => s.photos)
const sceneAssets = [
  [shipBg, soliChar],
  [mapBg, girlSprite, arrowLeft, alien1, ...allS1Photos],
  [arrowRight, alien2, ...allS2Photos],
  [alien3, jumpSprite, ...allS3Photos],
  [],
]
watch(() => state.cur, (cur) => {
  const next = cur + 1
  if (sceneAssets[next]?.length) preloadImages(sceneAssets[next])
})

// Pre-generate screenshot after panel becomes visible (panel renders AFTER modal closes)
watch(() => state.scene4PanelVisible, async (visible) => {
  if (!visible) { scene4Blob = null; return }
  setTimeout(async () => {
    if (!state.scene4PanelVisible) return
    try {
      const c = await html2canvas(document.body, {
        useCORS: true,
        scale: Math.min(window.devicePixelRatio || 2, 2),
        width: window.innerWidth, height: window.innerHeight,
        x: 0, y: 0, scrollX: 0, scrollY: 0,
        windowWidth: window.innerWidth, windowHeight: window.innerHeight,
        ignoreElements: el =>
          el.classList?.contains('spot-overlay') ||
          el.classList?.contains('modal-overlay'),
      })
      scene4Blob = await new Promise((res, rej) =>
        c.toBlob(b => b ? res(b) : rej(new Error('toBlob null')), 'image/png')
      )
    } catch (e) { console.warn('Pre-gen screenshot failed:', e) }
  }, 1200)
})

// ─── Background Music (YouTube IFrame API) ───────────────────────────────────
const bgMuted = ref(false)
let ytPlayer = null

function initYTPlayer() {
  ytPlayer = new window.YT.Player('yt-bg-player', {
    videoId: 'iqEr3P78fz8',
    playerVars: { autoplay: 1, loop: 1, playlist: 'iqEr3P78fz8', controls: 0, rel: 0, mute: 0 },
    events: {
      onReady(e) { e.target.setVolume(60); e.target.playVideo() },
    }
  })
}

function toggleBgMute() {
  if (!ytPlayer) return
  bgMuted.value = !bgMuted.value
  bgMuted.value ? ytPlayer.mute() : ytPlayer.unMute()
}

onMounted(() => {
  preloadImages(sceneAssets[0])
  setTimeout(() => preloadImages(sceneAssets[1]), 2000)
  window.addEventListener('resize', updateArrowPos)
  nextTick(updateArrowPos)
  setTimeout(() => { questVisible.value = true }, 1000)
  // Load YouTube IFrame API
  if (window.YT?.Player) { initYTPlayer() }
  else {
    window.onYouTubeIframeAPIReady = initYTPlayer
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  }
})

async function downloadResult() {
  if (downloadState.value !== 'idle') return
  downloadState.value = 'loading'
  try {
    // Use pre-generated blob if ready (avoids iOS user-gesture timeout)
    let blob = scene4Blob
    if (!blob) {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: Math.min(window.devicePixelRatio || 2, 2),
        width:  window.innerWidth,
        height: window.innerHeight,
        x: 0, y: 0,
        scrollX: 0, scrollY: 0,
        windowWidth:  window.innerWidth,
        windowHeight: window.innerHeight,
        ignoreElements: el =>
          el.classList?.contains('spot-overlay') ||
          el.classList?.contains('modal-overlay'),
      })
      blob = await new Promise((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob null')), 'image/png')
      )
    }
    const file = new File([blob], 'taiwan-trip.png', { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Taiwan Trip' })
        downloadState.value = 'done'
      } catch (shareErr) {
        // AbortError = user dismissed share sheet — not a failure
        downloadState.value = shareErr.name === 'AbortError' ? 'idle' : 'idle'
        if (shareErr.name !== 'AbortError') alert(tr.value.downloadFail)
      }
    } else {
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href = url
      a.download = 'taiwan-trip.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      downloadState.value = 'done'
    }
  } catch(e) {
    console.error('Screenshot failed:', e)
    downloadState.value = 'idle'
    alert(tr.value.downloadFail)
  }
}
</script>

<template>
  <!-- ── Fixed Background ──────────────────────────────────────── -->
  <div class="fixed-bg" aria-hidden="true">
    <img :src="shipBg" class="scene-bg" style="object-position:50% 40%"
         :style="{ opacity: state.started ? 0 : 1, transition:'opacity 0.8s ease' }" />
    <img :src="mapBg"  class="scene-bg" style="object-position:50% 50%"
         :style="{ opacity: state.started ? 1 : 0, transition:'opacity 0.8s ease' }" />
  </div>

  <!-- ── Petals (only scene 4) ───────────────────────────────── -->
  <div v-if="state.cur === 4" class="petals-overlay" aria-hidden="true">
    <div class="petal" style="left:16%;width:10px;height:9px;animation-duration:10s;background:linear-gradient(135deg,#ffb7d2,#ff8fb8)"></div>
    <div class="petal" style="left:42%;width:8px;height:7px;animation-duration:13s;animation-delay:-5s;background:linear-gradient(135deg,#ffcde0,#ffa7c6)"></div>
    <div class="petal" style="left:66%;width:11px;height:10px;animation-duration:11s;animation-delay:-8s;background:linear-gradient(135deg,#ffb7d2,#ff8fb8)"></div>
    <div class="petal" style="left:87%;width:8px;height:7px;animation-duration:14s;animation-delay:-2s;background:linear-gradient(135deg,#ffd9e8,#ffb0cc)"></div>
  </div>

  <!-- ── YouTube BG Player ────────────────────────────────────── -->
  <div style="position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;left:-9999px">
    <div id="yt-bg-player"></div>
  </div>

  <!-- ── Music Toggle ──────────────────────────────────────────── -->
  <button class="music-btn" @click="toggleBgMute" :title="bgMuted ? '開啟音樂' : '靜音'">
    {{ bgMuted ? '🔇' : '🔊' }}
  </button>

  <!-- ── Language Toggle ──────────────────────────────────────── -->
  <div class="lang-bar">
    <button :class="['lang-icon', { active: lang === 'en' }]" @click="lang = 'en'" title="English">🇺🇸</button>
    <button :class="['lang-icon', { active: lang === 'kr' }]" @click="lang = 'kr'" title="한국어">🇰🇷</button>
    <button :class="['lang-icon', { active: lang === 'ja' }]" @click="lang = 'ja'" title="日本語">🇯🇵</button>
  </div>

  <!-- ── Progress HUD ─────────────────────────────────────────── -->
  <div class="hud">
    <template v-for="(st, i) in steps" :key="i">
      <div class="hud-node">
        <img v-if="hudShown[i] && st.alienImg"
             :key="'a' + i + hudFlashKeys[i]"
             :src="st.alienImg" class="hud-alien-img"
             :class="{ 'hud-flash': hudFlashKeys[i] > 0 }" />
        <div v-else :style="hudCircleStyle(st.isDone && !st.alienImg)">{{ (st.isDone && !st.alienImg) ? '✓' : String(i+1) }}</div>
      </div>
      <div v-if="i < steps.length - 1" class="hud-sep"></div>
    </template>
  </div>

  <!-- ── Girl (scenes 1–3) ─────────────────────────────────────── -->
  <Transition name="fade-girl">
    <div v-if="state.cur > 0 && state.cur < 4 && state.girlIn" class="char-wrap" aria-hidden="true">
      <div class="char-col">
        <div :key="girlBubbleKey" class="speech-bubble"
             :ref="el => el && initBubble(el, girlBubbleLines)"></div>
        <div :class="['girl-char', { 'is-excited': state.girlExcited }]"
             :style="girlBgStyle"></div>
      </div>
    </div>
  </Transition>

  <!-- ── Scene 4 dual characters ──────────────────────────────── -->
  <div v-if="state.cur === 4 && state.girlIn" class="scene4-chars" aria-hidden="true">
    <Transition name="girl4">
      <div v-if="state.scene4Entered" class="scene4-char-slot">
        <div ref="scene4GirlColRef" class="char-col">
          <div :key="lang + '4g'" class="speech-bubble" :ref="el => el && initBubble(el, [tr.girl4Bubble], { startDelay: 1350 })"></div>
          <div ref="scene4GirlSpriteRef" :style="scene4SpriteFrameStyle"></div>
        </div>
      </div>
    </Transition>
    <Transition name="boy4">
      <div v-if="state.scene4Entered" class="scene4-char-slot">
        <div class="char-col">
          <div :key="lang + '4b'" class="speech-bubble" :ref="el => el && initBubble(el, [tr.boy4Bubble], { startDelay: 1700 })"></div>
          <div :style="soliSpriteStyle"></div>
        </div>
      </div>
    </Transition>
  </div>

  <!-- ── Nav Arrows ───────────────────────────────────────────── -->
  <div class="nav-arrows"
       :style="arrowTopPx != null ? { top: arrowTopPx + 'px', bottom: 'auto' } : {}">
    <div class="arrow-slot">
      <button v-if="leftVisible" class="arrow-btn" aria-label="上一站" @click="goPrev">
        <img :src="arrowLeft" alt="" />
      </button>
    </div>
    <div class="arrow-slot arrow-slot-right">
      <button v-if="rightVisible" class="arrow-btn" aria-label="下一站" @click="goNext">
        <img :src="arrowRight" alt="" />
      </button>
    </div>
  </div>

  <!-- ── World ────────────────────────────────────────────────── -->
  <div class="world" ref="worldEl" @scroll.passive="onWorldScroll">

    <!-- Scene 0 · 出發 -->
    <section :ref="el => { if (el) sceneEls[0] = el }" class="scene">
      <div class="panel-wrap"
           :style="{ transform:'translate(-50%,-54%)', opacity: state.started ? 0 : questVisible ? 1 : 0, transition:'opacity 0.5s ease' }">
        <div class="panel" style="width:min(600px,88vw)">
          <div class="panel-header">
            <span>🍁</span>
            <span class="panel-header-text">{{ tr.questHeader }}</span>
            <span>🍁</span>
          </div>
          <div class="panel-body" style="text-align:center">
            <h1 class="quest-title" style="white-space:pre-line">{{ tr.questTitle }}</h1>
            <p class="quest-sub">{{ tr.questSub }}</p>
            <template v-if="!state.started">
              <div class="btn-row">
                <button class="btn-yes" @click="onYes">{{ tr.yesBtn }}</button>
                <div :style="noWrapStyle">
                  <button ref="noBtnEl" class="btn-no" :style="noStyle" @click="onNo">{{ tr.noBtn }}</button>
                </div>
              </div>
              <p class="hint-text">{{ tr.hint }}</p>
            </template>
          </div>
        </div>
      </div>
      <!-- Boy (scene 0) -->
      <div class="scene-0-char" :style="{ opacity: state.started ? 0 : questVisible ? 1 : 0, transition:'opacity 0.5s ease' }" aria-hidden="true">
        <div class="char-col">
          <div :key="lang + '0'" class="speech-bubble" :ref="el => el && initBubble(el, tr.boyGreet)"></div>
          <div :style="soliScene0Style"></div>
        </div>
      </div>
    </section>

    <!-- Scene 1 · 早上 -->
    <section :ref="el => { if (el) sceneEls[1] = el }" class="scene">
      <div class="panel-wrap">
        <div class="panel" style="width:min(680px,90vw)">
          <div class="panel-header"><span class="panel-header-text">{{ tr.stop1 }}</span></div>
          <div class="panel-body">
            <h2 class="pick-title">{{ tr.pick }}</h2>
            <div v-if="state.unlocked < 1" class="locked-msg">{{ tr.locked1 }}</div>
            <div v-else class="spots-list">
              <div v-for="opt in makeSpots(1, localizedS1)" :key="opt.key"
                   class="spot-row"
                   :class="{ 'spot-row-selected':opt.isSel, 'spot-row-active':opt.isActive && !opt.isSel, 'spot-row-disabled':opt.isDisabled }"
                   @click="openSpotDetail(1, opt)">
                <span class="spot-row-emoji">{{ opt.emoji }}</span>
                <div class="spot-row-info">
                  <div class="spot-row-name">{{ opt.name }}</div>
                </div>
                <span v-if="opt.isSel" class="spot-row-check">✓</span>
                <span v-else-if="opt.isActive" class="spot-row-arr">›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Scene 2 · 中午 -->
    <section :ref="el => { if (el) sceneEls[2] = el }" class="scene">
      <div class="panel-wrap">
        <div class="panel" style="width:min(680px,90vw)">
          <div class="panel-header"><span class="panel-header-text">{{ tr.stop2 }}</span></div>
          <div class="panel-body">
            <h2 class="pick-title">{{ tr.pick2 }}</h2>
            <div v-if="state.unlocked < 2" class="locked-msg">{{ tr.locked }}</div>
            <div v-else class="spots-list spots-list-2col">
              <div v-for="opt in makeSpots(2, localizedS2)" :key="opt.key"
                   class="spot-row"
                   :class="{ 'spot-row-selected':opt.isSel, 'spot-row-active':opt.isActive && !opt.isSel, 'spot-row-disabled':opt.isDisabled }"
                   @click="openSpotDetail(2, opt)">
                <span class="spot-row-emoji">{{ opt.emoji }}</span>
                <div class="spot-row-info">
                  <div class="spot-row-name">{{ opt.name }}</div>
                </div>
                <span v-if="opt.isSel" class="spot-row-check">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Scene 3 · 晚上 -->
    <section :ref="el => { if (el) sceneEls[3] = el }" class="scene">
      <div class="panel-wrap">
        <div class="panel" style="width:min(680px,90vw)">
          <div class="panel-header"><span class="panel-header-text">{{ tr.stop3 }}</span></div>
          <div class="panel-body">
            <h2 class="pick-title">{{ tr.pickLast }}</h2>
            <div v-if="state.unlocked < 3" class="locked-msg">{{ tr.locked }}</div>
            <div v-else class="spots-list">
              <div v-for="opt in makeSpots(3, localizedS3)" :key="opt.key"
                   class="spot-row"
                   :class="{ 'spot-row-selected':opt.isSel, 'spot-row-active':opt.isActive && !opt.isSel, 'spot-row-disabled':opt.isDisabled }"
                   @click="openSpotDetail(3, opt)">
                <span class="spot-row-emoji">{{ opt.emoji }}</span>
                <div class="spot-row-info">
                  <div class="spot-row-name">{{ opt.name }}</div>
                </div>
                <span v-if="opt.isSel" class="spot-row-check">✓</span>
                <span v-else-if="opt.isActive" class="spot-row-arr">›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Scene 4 · 完成 -->
    <section v-if="done" :ref="el => { if (el) sceneEls[4] = el }" class="scene">
      <div v-if="state.scene4PanelVisible" class="panel-wrap" style="transform:translate(-50%,-54%)">
        <div class="panel panel-gold" style="width:min(520px,90vw)">
          <div class="panel-header panel-header-gold">
            <span class="panel-header-text" style="color:#5c3c05;text-shadow:0 1px 0 rgba(255,255,255,.5)">{{ tr.complete }}</span>
          </div>
          <div class="panel-body">
            <div class="picks-list">
              <div v-for="p in picks" :key="p.key"
                   class="pick-item pick-item-clickable"
                   @click="openSpotDetailViewOnly(p)">
                <span class="pick-emoji">{{ p.emoji }}</span>
                <span class="pick-name">{{ p.name }}</span>
                <span class="pick-arr">›</span>
              </div>
            </div>
            <div class="result-actions">
              <button class="result-btn result-btn-dl"
                      :disabled="downloadState !== 'idle'"
                      :class="{ 'dl-loading': downloadState === 'loading', 'dl-done': downloadState === 'done' }"
                      @click="downloadResult">
                <span v-if="downloadState === 'loading'" class="dl-spinner"></span>
                <template v-else>{{ downloadState === 'done' ? tr.download.replace('📥','✅') : tr.download }}</template>
              </button>
              <p class="result-hint">{{ tr.downloadHint }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>

  <!-- ── Spot Detail Popup ─────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="state.spotModal" class="spot-overlay" @click.self="closeSpotModal">
      <div class="spot-popup" role="dialog">
        <button class="spot-popup-x" @click="closeSpotModal" aria-label="關閉">✕</button>
        <div class="spot-popup-hero">{{ state.spotModal.opt.emoji }}</div>
        <div class="spot-popup-content">
          <h3 class="spot-popup-name">{{ state.spotModal.opt.name }}</h3>
          <p  class="spot-popup-desc">{{ state.spotModal.opt.desc }}</p>
          <!-- Photo Carousel -->
          <div v-if="state.spotModal.opt.photos?.length" class="spot-carousel">
            <div class="carousel-track">
              <div v-if="!carouselImgLoaded" class="carousel-skeleton"></div>
              <img :src="state.spotModal.opt.photos[state.spotModal.photoIdx]"
                   class="carousel-img" :class="{ 'carousel-img-loaded': carouselImgLoaded }"
                   @load="carouselImgLoaded = true" @error="carouselImgLoaded = true" alt="" />
              <!-- Tap hint + link (art spot only) -->
              <a v-if="state.spotModal.opt.links?.[state.spotModal.photoIdx]"
                 :href="state.spotModal.opt.links[state.spotModal.photoIdx]"
                 target="_blank" rel="noopener noreferrer"
                 class="carousel-link-badge" @click.stop aria-label="查看展覽資訊">
                <span class="tap-ring"></span>
                <span class="tap-finger">👆</span>
              </a>
              <button v-if="state.spotModal.photoIdx > 0"
                      class="carousel-arrow carousel-arrow-l" @click.stop="prevPhoto">‹</button>
              <button v-if="state.spotModal.photoIdx < state.spotModal.opt.photos.length - 1"
                      class="carousel-arrow carousel-arrow-r" @click.stop="nextPhoto">›</button>
            </div>
            <div class="carousel-dots">
              <span v-for="(_, i) in state.spotModal.opt.photos" :key="i"
                    :class="['carousel-dot', { active: i === state.spotModal.photoIdx }]"
                    @click.stop="state.spotModal.photoIdx = i"></span>
            </div>
          </div>
        </div>
        <div v-if="!state.spotModal.viewOnly" class="spot-popup-footer">
          <button class="spot-popup-confirm"
                  :class="{ 'spot-popup-desel': state.spotModal.stage === 2 && (Array.isArray(state.sel[2]) ? state.sel[2] : []).includes(state.spotModal.opt.key) }"
                  @click="confirmSpot">
            {{ state.spotModal.stage === 2 && (Array.isArray(state.sel[2]) ? state.sel[2] : []).includes(state.spotModal.opt.key) ? tr.deselect : tr.confirmPick }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Generic Modal ────────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="state.modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-glow"></div>
        <div class="modal-emoji">{{ state.modal.emoji }}</div>
        <h3 class="modal-title">{{ state.modal.title }}</h3>
        <p class="modal-body">{{ state.modal.body }}</p>
        <button class="modal-btn" @click="closeModal">{{ state.modal.btn }}</button>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* ── Petals ──────────────────────────────────────────────────── */
.petals-overlay {
  position: fixed; inset: 0; z-index: 20; pointer-events: none; overflow: hidden;
}
.petal {
  position: absolute; top: 0; border-radius: 60% 0 60% 60%;
  animation: petal linear infinite;
}

/* ── Fixed Background ────────────────────────────────────────── */
.fixed-bg {
  position: fixed; inset: 0; z-index: 1; overflow: hidden;
}
.fixed-bg .scene-bg {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
@media (min-width: 769px) {
  .fixed-bg .scene-bg {
    object-fit: contain; width: auto; height: 100%;
    left: 50%; transform: translateX(-50%);
    inset: unset; top: 0; bottom: 0;
  }
}

/* ── Language Toggle ─────────────────────────────────────────── */
.music-btn {
  position: fixed;
  top: max(22px, calc(env(safe-area-inset-top) + 10px));
  left: max(14px, env(safe-area-inset-left));
  z-index: 70;
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid rgba(107,78,42,.35);
  background: rgba(255,255,255,.97);
  cursor: pointer; font-size: 20px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 0;
  box-shadow: 0 2px 7px rgba(0,0,0,.22);
  transition: transform .14s ease;
}
.music-btn:hover { transform: scale(1.1); }
.carousel-link-badge {
  position: absolute; top: 8px; left: 8px;
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; z-index: 5;
}
.tap-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,.85);
  box-shadow: 0 0 0 1.5px rgba(0,0,0,.15);
  animation: tapRing 1.7s ease-out infinite;
}
.tap-finger {
  font-size: 28px; line-height: 1;
  animation: tapBounce 1.7s ease-in-out infinite;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,.5));
}
@keyframes tapRing {
  0%   { transform: scale(.5); opacity: 1; }
  75%  { transform: scale(1.7); opacity: 0; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes tapBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30%       { transform: translateY(6px) scale(.9); }
  55%       { transform: translateY(0) scale(1.08); }
}
.lang-bar {
  position: fixed;
  top: max(10px, env(safe-area-inset-top));
  right: max(14px, env(safe-area-inset-right));
  z-index: 70;
  display: flex; flex-direction: column; gap: 5px;
}
.lang-icon {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid rgba(107,78,42,.35);
  background: rgba(255,255,255,.97);
  cursor: pointer; font-size: 20px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 0; overflow: hidden;
  box-shadow: 0 2px 7px rgba(0,0,0,.22);
  transition: transform .14s ease, border-color .14s ease, box-shadow .14s ease;
}
.lang-icon.active {
  border-color: #c9962e;
  box-shadow: 0 0 0 2.5px rgba(201,150,46,.45), 0 2px 7px rgba(0,0,0,.22);
  transform: scale(1.18);
}
.lang-icon:not(.active):hover { transform: scale(1.1); }

/* ── Progress HUD ────────────────────────────────────────────── */
.hud {
  position: fixed;
  top: max(22px, calc(env(safe-area-inset-top) + 10px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex; align-items: center;
  gap: clamp(8px, 2vw, 16px);
  background: linear-gradient(#fdf6e3, #f2e3c0);
  border: 2px solid #6b4e2a; border-radius: 999px;
  padding: 7px clamp(14px,3.4vw,24px);
  box-shadow: 0 0 0 3px rgba(255,255,255,.5), 0 8px 18px rgba(20,40,80,.3), inset 0 2px 0 rgba(255,255,255,.85);
  max-width: 62vw;
}
.hud-node { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.hud-label {
  font-size: clamp(9px, 2.4vw, 11px); color: #6b4e2a;
  white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.7);
}
.hud-sep {
  width: clamp(12px, 2.4vw, 24px); height: 2px;
  background: linear-gradient(90deg,#c9a96e,#e0cc9a,#c9a96e);
  border-radius: 2px; opacity: .7;
}
.hud-alien-img {
  width: clamp(34px, 7vw, 42px); height: clamp(34px, 7vw, 42px);
  object-fit: contain; margin: -5px 0 -2px;
  filter: drop-shadow(0 2px 3px rgba(60,40,10,.3));
}

/* ── Characters ──────────────────────────────────────────────── */
.char-col {
  display: flex; flex-direction: column; align-items: center;
}
.char-wrap {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(max(12px, env(safe-area-inset-bottom)) + 4px);
  z-index: 15; pointer-events: none;
}
.scene4-chars {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(max(12px, env(safe-area-inset-bottom)) + 4px);
  z-index: 15; pointer-events: none;
  display: flex; align-items: flex-end; justify-content: center;
  gap: clamp(20px, 6vw, 60px);
  width: min(96vw, 560px);
}
.scene-0-char {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(max(12px, env(safe-area-inset-bottom)) + 4px);
  z-index: 15; pointer-events: none;
}

/* ── Speech Bubble ───────────────────────────────────────────── */
.speech-bubble {
  position: relative;
  display: inline-block;
  background: #f4f4f4;
  border: 3px solid #96a7b3;
  border-radius: 16px;
  padding: 9px 16px 10px;
  box-shadow: 0 4px 0 rgba(120,140,155,.5), 0 8px 14px rgba(10,30,60,.28);
  animation: sb-bob 2.8s ease-in-out infinite;
  margin-bottom: 6px;
  pointer-events: none;
  min-width: 5em;
  max-width: clamp(140px, 30vw, 210px);
  text-align: center;
}
.speech-bubble .sb-text {
  font-family: 'ZCOOL KuaiLe', system-ui, sans-serif;
  font-size: clamp(13px, 2.6vw, 16px);
  line-height: 1.45;
  color: #e23b3b;
  text-align: center;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: break-word;
  hyphens: none;
  min-height: 1.45em;
  text-shadow: 0 1px 0 rgba(255,255,255,.8);
  letter-spacing: 1px;
}
.speech-bubble .sb-caret {
  display: inline-block;
  width: 2px; height: 1em; margin-left: 2px;
  background: #e23b3b; vertical-align: -2px;
  animation: sb-caret .7s step-end infinite;
}
.speech-bubble .sb-caret.sb-hidden { display: none; }
.speech-bubble.sb-done { animation: none; }
.speech-bubble .sb-tail-border,
.speech-bubble .sb-tail-fill {
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 0; height: 0;
}
.speech-bubble .sb-tail-border {
  bottom: -11px;
  border-left: 11px solid transparent; border-right: 11px solid transparent;
  border-top: 12px solid #96a7b3;
}
.speech-bubble .sb-tail-fill {
  bottom: -6px;
  border-left: 8px solid transparent; border-right: 8px solid transparent;
  border-top: 9px solid #f4f4f4;
}

/* ── Nav Arrows ──────────────────────────────────────────────── */
.nav-arrows {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: max(14px, env(safe-area-inset-bottom));
  width: min(720px, 90vw);
  display: flex; align-items: flex-end; justify-content: space-between;
  z-index: 60; pointer-events: none;
}
.arrow-slot { pointer-events: none; display: flex; }
.arrow-btn {
  pointer-events: auto; padding: 0; border: none; background: none;
  cursor: pointer; line-height: 0;
  transition: transform .14s ease;
  animation: arrowpulse 1.4s ease-in-out infinite, arrowGlow 2.4s ease-in-out infinite;
}
.arrow-btn:hover {
  transform: translateY(-3px) scale(1.05); animation: none;
  filter: drop-shadow(0 5px 6px rgba(10,30,60,.35)) drop-shadow(0 0 18px rgba(255,220,80,.9));
}
.arrow-btn:active { transform: translateY(1px) scale(.96); animation: none; }
@keyframes jumpY {
  0%, 100% { transform: translateY(0); }
  40%      { transform: translateY(-40px); }
  60%      { transform: translateY(-35px); }
}
@keyframes frameSwap {
  0%  { background-position-x: 0%; }
  50% { background-position-x: 100%; }
}
@keyframes wave3 {
  0%      { background-position-x: 0%; }
  33.33%  { background-position-x: 50%; }
  66.67%  { background-position-x: 100%; }
}
@keyframes arrowpulse {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}
@keyframes arrowGlow {
  0%,100% { filter: drop-shadow(0 5px 6px rgba(10,30,60,.35)) drop-shadow(0 0 4px rgba(255,220,80,.2)); }
  50%      { filter: drop-shadow(0 5px 6px rgba(10,30,60,.35)) drop-shadow(0 0 18px rgba(255,220,80,.85)); }
}
.arrow-btn img { display: block; width: clamp(52px, 9vw, 86px); height: auto; }

/* ── World ───────────────────────────────────────────────────── */
.world {
  position: relative; z-index: 10;
  display: flex; height: 100dvh;
  overflow-x: hidden; overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

/* ── Scene ───────────────────────────────────────────────────── */
.scene {
  position: relative; flex: none;
  width: 100vw; height: 100%;
  overflow: hidden; background: transparent;
}

/* ── Panel ───────────────────────────────────────────────────── */
.panel-wrap {
  position: absolute; top: 45%; left: 50%;
  transform: translate(-50%, -53%); z-index: 5;
}
.panel {
  border-radius: 18px;
  background: linear-gradient(#fdf6e3,#f4e6c2);
  border: 2px solid #5f4526;
  box-shadow: 0 0 0 4px rgba(255,255,255,.55), 0 0 0 6px rgba(95,69,38,.35), 0 28px 56px rgba(5,25,60,.45);
  overflow: hidden;
}
.panel-gold {
  box-shadow: 0 0 0 4px rgba(255,220,120,.75), 0 0 0 7px rgba(95,69,38,.4), 0 30px 60px rgba(5,25,60,.5);
}
.panel-header {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(#6d9bd9 0%,#4272b4 48%,#35619e 52%,#2c5288 100%);
  padding: 10px 18px; border-bottom: 2px solid #244570;
  box-shadow: inset 0 2px 0 rgba(255,255,255,.45);
}
.panel-header-gold {
  background: linear-gradient(#f2c14e 0%,#e0a72e 48%,#cf9722 52%,#bd881a 100%);
  border-bottom-color: #96690f;
}
.panel-header-text {
  color: #fff; font-size: clamp(13px,3.2vw,17px); letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0,20,60,.6);
}
.panel-body {
  padding: clamp(16px,3.2vw,30px) clamp(16px,3.2vw,30px) clamp(20px,3.6vw,30px);
  box-shadow: inset 0 2px 0 rgba(255,255,255,.8);
  overflow-y: auto;
  max-height: calc(100dvh - 68px - 90px - 44px);
}

/* ── Scene 0 ─────────────────────────────────────────────────── */
.quest-title {
  margin: 0 0 8px; font-size: clamp(22px,5vw,34px); line-height: 1.38;
  color: #3e2c10; text-shadow: 0 1px 0 rgba(255,255,255,.8);
}
.quest-sub {
  margin: 0 0 24px; font-size: clamp(11px,2.6vw,14px); color: #a08050;
  font-family: 'Baloo 2', sans-serif; letter-spacing: 1px;
}
.btn-row {
  display: flex; gap: clamp(10px,3vw,22px);
  justify-content: center; align-items: center; flex-wrap: nowrap;
}
.btn-yes {
  font-size: clamp(17px,4.2vw,22px); padding: 13px clamp(26px,6vw,42px);
  border: 2px solid #23632a; border-radius: 14px;
  background: linear-gradient(#8be374 0%,#4db049 46%,#3f9d3c 54%,#358534 100%);
  color: #fff; cursor: pointer; letter-spacing: 1px; line-height: 1.2;
  box-shadow: 0 4px 0 #1d5323, 0 10px 18px rgba(0,30,10,.3), inset 0 2px 0 rgba(255,255,255,.55);
  text-shadow: 0 2px 2px rgba(0,40,10,.4);
  transition: transform .14s ease, box-shadow .14s ease;
}
.btn-yes:hover { transform: translateY(-3px); }
.btn-yes:active { transform: translateY(1px); }
.hint-text {
  margin: 20px 0 0; font-size: clamp(10px,2.6vw,12px); color: #b08a52;
  animation: floatnote 2.6s ease-in-out infinite;
}

/* ── Spot List ───────────────────────────────────────────────── */
.pick-title {
  margin: 0 0 12px; font-size: clamp(17px,4vw,24px); color: #3e2c10;
  text-shadow: 0 1px 0 rgba(255,255,255,.8);
}
.pick2-note {
  margin: 10px 0 0; font-size: clamp(17px,4vw,24px);
  color: #c0392b; font-weight: 600;
  text-shadow: 0 1px 0 rgba(255,255,255,.8);
}
.spots-list.spots-list-2col {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  flex-direction: unset;
}
.spots-list-2col .spot-row {
  padding: 10px 8px; gap: 6px;
}
.spots-list-2col .spot-row-emoji { font-size: clamp(20px, 4.5vw, 26px); }
.spots-list-2col .spot-row-name  { font-size: clamp(11px, 2.6vw, 14px); }
.spots-list-2col .spot-row-sub   { font-size: clamp(9px, 1.9vw, 11px); }
.locked-msg {
  margin: 10px auto 0; background: rgba(95,69,38,.07);
  border: 2px dashed #bb9560; border-radius: 14px;
  padding: 20px; color: #8a6a3a; font-size: clamp(13px,3vw,16px); text-align: center;
}
.spots-list { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.spot-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; border-radius: 14px;
  background: linear-gradient(#fffdf4,#f7ecd2);
  border: 2px solid #cfae74;
  box-shadow: 0 2px 0 #cfae74, 0 4px 10px rgba(60,40,10,.12), inset 0 1px 0 #fff;
  cursor: default; user-select: none;
  transition: transform .14s ease, box-shadow .14s ease;
}
.spot-row-active { cursor: pointer; }
.spot-row-active:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 0 #cfae74, 0 8px 16px rgba(60,40,10,.18), inset 0 1px 0 #fff;
}
.spot-row-selected {
  border-color: #3f9d4a; cursor: pointer;
  background: linear-gradient(#f4fbef,#e2f3d8);
  box-shadow: 0 2px 0 #3f9d4a, 0 0 0 3px rgba(76,175,80,.25), 0 4px 10px rgba(20,80,20,.15), inset 0 1px 0 #fff;
}
.spot-row-disabled { opacity: .45; }
.spot-row-emoji { font-size: clamp(28px,6vw,36px); flex: none; }
.spot-row-info { flex: 1; min-width: 0; text-align: left; }
.spot-row-name { font-size: clamp(15px,3.6vw,19px); color: #3e2c10; }
.spot-row-sub { font-family:'Baloo 2',sans-serif; font-size: clamp(10px,2.2vw,12px); color: #ab8b58; letter-spacing:1px; margin-top:2px; }
.spot-row-check { font-size: 18px; color: #2f8e3a; font-weight: bold; flex: none; }
.spot-row-arr { font-size: 24px; color: #b08a52; flex: none; line-height: 1; }

/* ── Scene 4 Result ──────────────────────────────────────────── */
.picks-list { display: flex; flex-direction: column; gap: 10px; }
.pick-item {
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(#fffdf4,#f7ecd2);
  border: 2px solid #d9bd85; border-radius: 12px;
  padding: 10px 16px;
  box-shadow: inset 0 2px 0 #fff, 0 2px 5px rgba(90,60,20,.12);
}
.pick-item-clickable {
  cursor: pointer; transition: transform .13s ease, box-shadow .13s ease;
}
.pick-item-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(90,60,20,.2), inset 0 2px 0 #fff;
}
.pick-item-clickable:active { transform: translateY(0); }
.pick-emoji { font-size: 24px; flex: none; }
.pick-name { font-size: clamp(15px,3.6vw,18px); color: #3e2c10; flex: 1; }
.pick-arr { font-size: 20px; color: #b08a52; flex: none; line-height: 1; }
.result-actions {
  display: flex; flex-direction: column; gap: 10px; margin-top: 16px; align-items: center;
}
.result-hint {
  margin: 0; font-size: clamp(12px, 2.8vw, 14px); color: #8a6a3a;
  text-align: center; animation: floatnote 2.6s ease-in-out infinite;
}
.result-btn {
  font-family: 'ZCOOL KuaiLe','Baloo 2',sans-serif;
  font-size: clamp(14px,3.4vw,17px);
  padding: 10px clamp(16px,4vw,28px);
  border-radius: 12px; cursor: pointer;
  transition: transform .13s ease;
  letter-spacing: 1px;
}
.result-btn:hover  { transform: translateY(-2px); }
.result-btn:active { transform: translateY(1px);  }
.result-btn-dl {
  border: 2px solid #23632a;
  background: linear-gradient(#8be374,#358534);
  color: #fff; text-shadow: 0 1px 2px rgba(0,30,10,.4);
  box-shadow: 0 3px 0 #1d5323, 0 6px 14px rgba(0,30,10,.25), inset 0 1px 0 rgba(255,255,255,.5);
}
.result-btn-dl:disabled { opacity: .75; cursor: default; transform: none !important; }
.result-btn-dl.dl-done  { background: linear-gradient(#74c46e,#2d7a2a); }
.dl-spinner {
  display: inline-block; width: 17px; height: 17px; vertical-align: middle;
  border: 3px solid rgba(255,255,255,.35); border-top-color: #fff;
  border-radius: 50%; animation: dlSpin .65s linear infinite;
}
@keyframes dlSpin { to { transform: rotate(360deg); } }

/* ── Spot Popup ──────────────────────────────────────────────── */
.spot-overlay {
  position: fixed; inset: 0; z-index: 280;
  background: rgba(8,18,40,.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0 0 max(0px, env(safe-area-inset-bottom));
}
.spot-popup {
  width: min(480px, 100vw); max-height: 80dvh;
  background: linear-gradient(#fdf6e3,#f4e6c2);
  border: 2px solid #5f4526;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 40px rgba(5,25,60,.45), 0 0 0 3px rgba(255,255,255,.4);
  display: flex; flex-direction: column;
  animation: slideUp .32s cubic-bezier(.2,1.3,.5,1) both;
  position: relative; overflow: hidden;
}
.spot-popup-x {
  position: absolute; top: 14px; right: 16px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(95,69,38,.15); border: none; cursor: pointer;
  font-size: 16px; color: #6b4e2a; display: flex; align-items: center; justify-content: center;
  transition: background .14s ease; z-index: 2;
}
.spot-popup-x:hover { background: rgba(95,69,38,.28); }
.spot-popup-hero {
  font-size: clamp(64px,16vw,88px); text-align: center;
  padding: 28px 24px 12px; line-height: 1;
}
.spot-popup-content { padding: 0 24px 16px; overflow-y: auto; flex: 1; }
.spot-popup-name { margin: 0 0 4px; font-size: clamp(20px,5vw,26px); color: #3e2c10; }
.spot-popup-sub {
  margin: 0 0 12px; font-size: clamp(11px,2.6vw,13px);
  color: #ab8b58; font-family:'Baloo 2',sans-serif; letter-spacing:1px;
}
.spot-popup-desc { margin: 0 0 16px; font-size: clamp(14px,3.4vw,16px); color: #5a3e18; line-height: 1.75; }

/* ── Carousel ────────────────────────────────────────────────── */
.spot-carousel { margin: 0 0 8px; }
.carousel-track {
  position: relative; border-radius: 12px; overflow: hidden;
  background: #e8dfc4;
}
.carousel-img {
  display: block; width: 100%; height: clamp(200px, 52vw, 300px);
  object-fit: cover; border-radius: 12px;
  opacity: 0; transition: opacity .25s ease;
}
.carousel-img.carousel-img-loaded { opacity: 1; }
.carousel-skeleton {
  position: absolute; inset: 0; border-radius: 12px;
  background: linear-gradient(90deg, #e8dfc4 25%, #f5edd9 50%, #e8dfc4 75%);
  background-size: 200% 100%;
  animation: skelShimmer 1.2s ease-in-out infinite;
}
@keyframes skelShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,.42); border: none; cursor: pointer;
  color: #fff; font-size: 22px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background .14s ease;
}
.carousel-arrow:hover { background: rgba(0,0,0,.62); }
.carousel-arrow-l { left: 8px; }
.carousel-arrow-r { right: 8px; }
.carousel-dots {
  display: flex; justify-content: center; gap: 6px; margin-top: 8px;
}
.carousel-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #cfae74; cursor: pointer; transition: background .15s ease, transform .15s ease;
}
.carousel-dot.active { background: #5f4526; transform: scale(1.25); }

.spot-popup-footer {
  padding: 14px 24px max(20px,env(safe-area-inset-bottom));
  border-top: 1px solid rgba(107,78,42,.2);
  background: rgba(255,255,255,.5);
}
.spot-popup-confirm {
  width: 100%; font-family:'ZCOOL KuaiLe','Baloo 2',sans-serif;
  font-size: clamp(17px,4.2vw,20px); padding: 14px;
  border: 2px solid #23632a; border-radius: 13px;
  background: linear-gradient(#8be374 0%,#4db049 46%,#3f9d3c 54%,#358534 100%);
  color: #fff; cursor: pointer; letter-spacing: 2px;
  box-shadow: 0 4px 0 #1d5323, 0 8px 16px rgba(0,30,10,.3), inset 0 2px 0 rgba(255,255,255,.55);
  text-shadow: 0 2px 2px rgba(0,40,10,.4);
  transition: transform .14s ease;
}
.spot-popup-confirm:hover  { transform: translateY(-2px); }
.spot-popup-confirm:active { transform: translateY(1px);  }
.spot-popup-desel { background: linear-gradient(135deg,#c0392b,#962d22) !important; }

/* ── Generic Modal ───────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(8,18,40,.6); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card {
  width: min(400px,92vw); border-radius: 20px;
  background: linear-gradient(#fdf6e3,#f4e6c2);
  border: 2px solid #5f4526;
  box-shadow: 0 0 0 4px #f7c948, 0 0 0 7px rgba(95,69,38,.55), 0 34px 70px rgba(0,0,0,.55);
  padding: clamp(28px,5.5vw,38px) clamp(24px,5vw,34px);
  text-align: center; animation: pop .38s cubic-bezier(.2,1.3,.5,1) both;
  position: relative; overflow: hidden;
}
.modal-glow {
  position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
  width: 260px; height: 200px;
  background: radial-gradient(circle,rgba(255,214,100,.65),transparent 68%);
  animation: glowpulse 2.4s ease-in-out infinite; pointer-events: none;
}
.modal-emoji  { position: relative; font-size: clamp(72px,18vw,88px); line-height: 1; margin-bottom: 4px; }
.modal-title  { position: relative; margin: 8px 0 12px; font-size: clamp(22px,5.8vw,28px); color: #c0291a; font-weight: 700; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
.modal-body   { position: relative; margin: 0 0 22px; font-size: clamp(14px,3.7vw,16px); line-height: 1.85; white-space: pre-line; color: #4a3212; }
.modal-btn {
  position: relative; font-size: clamp(16px,4.4vw,19px); padding: 12px 42px;
  border: 2px solid #23632a; border-radius: 13px;
  background: linear-gradient(#8be374 0%,#4db049 46%,#3f9d3c 54%,#358534 100%);
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 0 #1d5323, 0 8px 16px rgba(0,30,10,.3), inset 0 2px 0 rgba(255,255,255,.55);
  text-shadow: 0 2px 2px rgba(0,40,10,.4); letter-spacing: 2px;
  transition: transform .14s ease;
  font-family: 'ZCOOL KuaiLe','Baloo 2',sans-serif;
}
.modal-btn:hover  { transform: translateY(-2px); }
.modal-btn:active { transform: translateY(1px);  }

/* ── Girl fade-in transition (scenes 1-3) ────────────────────── */
.fade-girl-enter-active { transition: opacity .8s ease; }
.fade-girl-enter-from   { opacity: 0; }

/* ── Scene 4 character entrances ─────────────────────────────── */
.scene4-char-slot { display: flex; align-items: flex-end; }
.scene4-chars .speech-bubble { max-width: min(44vw, 230px); }

.girl4-enter-active {
  transition: transform 0.9s cubic-bezier(.15,1.1,.4,1), opacity 0.5s ease;
}
.girl4-enter-from { transform: translateX(60vw); opacity: 0; }

.boy4-enter-active {
  transition: transform 0.9s cubic-bezier(.15,1.1,.4,1) 0.28s, opacity 0.5s ease 0.28s;
}
.boy4-enter-from { transform: translateX(120vw); opacity: 0; }

/* ── Girl Character (scenes 1-3) ─────────────────────────────── */
.girl-char {
  width: clamp(72px, 10vw, 110px);
  aspect-ratio: 355 / 614;
  background: 0% 0 / 200% 100% no-repeat;
  filter: drop-shadow(0 8px 6px rgba(10,30,60,.35));
}
.girl-char.is-excited { background-position-x: 100%; }

/* ── Speech Bubble Keyframes ─────────────────────────────────── */
@keyframes sb-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
@keyframes sb-caret { 0%,50% { opacity:1 } 50.01%,100% { opacity:0 } }

/* ── HUD node flash (on scene navigation only) ───────────────── */
.hud-flash { animation: hudFlash .55s cubic-bezier(.2,1.3,.5,1); }
@keyframes hudFlash {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; filter: brightness(5) drop-shadow(0 0 10px #fff); }
  55%  { transform: scale(1.3) rotate(6deg);  filter: brightness(2) drop-shadow(0 0 14px #ffd700cc); }
  80%  { transform: scale(0.92) rotate(-2deg); filter: brightness(1.1); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; filter: none; }
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .panel-body { padding: 14px 12px 16px; }
  .btn-yes { padding: 11px 14px; font-size: 16px; }
  .hud { padding: 6px 10px; gap: 5px; max-width: 80vw; }
  .btn-row { gap: 8px; }
  .spot-row { padding: 10px 12px; gap: 10px; }
  .spot-row-emoji { font-size: 26px; }
  .lang-icon { width: 28px; height: 28px; font-size: 18px; }
  .speech-bubble { padding: 7px 12px 8px; }
  .speech-bubble .sb-text { font-size: 13px; }
}
</style>
