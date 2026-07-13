<script setup>
import { ref, reactive, computed, nextTick, onMounted, watch } from 'vue'
import html2canvas from 'html2canvas'
import shipBg    from '../assets/ship-bg.jpeg'
import mapBg     from '../assets/map-bg.png'
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
  el.setAttribute('data-lines', Array.isArray(lines) ? lines.join('|') : lines)
  return SpeechBubble(el, { loop: false, speed: 85, holdBetween: 1000, clearGap: 200, ...opts })
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
function detectLang() {
  const bl = (navigator.language || 'en').toLowerCase()
  if (bl.startsWith('ko')) return 'kr'
  if (bl.startsWith('ja')) return 'ja'
  return 'en'
}
const lang  = ref(detectLang())
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
    girl2Pre:'要去哪裡玩呢？',   girl2Post:'走吧！走吧！',
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
    boy4Bubble:"I can't wait to hang out with you!",
  },
  kr: {
    depart:'출발', am:'아침', noon:'점심', pm:'저녁',
    stop1:'1번째', stop2:'2번째', stop3:'3번째',
    questHeader:'어드벤처 · 퀘스트',
    questTitle:'대만 여행을\n시작할 준비가 됐나요?',
    questSub:'대만 어드벤처 준비 완료?',
    yesBtn:'YES, 출발!', noBtn:'NO, 글쎄...',
    pick:'목적지를 선택하세요', pickLast:'마지막 목적지를 선택하세요',
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

// ─── Spot Data ────────────────────────────────────────────────────────────────
const S1 = [
  { key:'101',    emoji:'🏙️', name:'台北 101',  sub:'SKYLINE TOWER',
    desc:'508 公尺的世界地標，頂樓觀景台 360° 俯瞰台北全景，日夜各有絕美風貌。',
    photos:[
      'https://picsum.photos/seed/tp101a/480/280',
      'https://picsum.photos/seed/tp101b/480/280',
    ]},
  { key:'jiufen', emoji:'🏮', name:'九份老街',   sub:'LANTERN TOWN',
    desc:'山城老街掛滿紅燈籠，傳說是宮崎駿《神隱少女》的靈感來源，霧雨中格外有詩意。',
    photos:[
      'https://picsum.photos/seed/jiufen1/480/280',
      'https://picsum.photos/seed/jiufen2/480/280',
    ]},
  { key:'yehliu', emoji:'🪨', name:'野柳女王頭', sub:'SEA ROCKS',
    desc:'大海與風雨共同雕刻的地質奇觀，女王頭造型獨特，每年吸引百萬旅人朝聖。',
    photos:[
      'https://picsum.photos/seed/yehliu1/480/280',
      'https://picsum.photos/seed/yehliu2/480/280',
    ]},
]
const S2 = [
  { key:'sunmoon',  emoji:'🚣', name:'日月潭',   sub:'SUN MOON LAKE',
    desc:'台灣最大高山湖泊，清晨薄霧如仙境，可搭船遊湖或騎自行車欣賞環湖美景。',
    photos:[
      'https://picsum.photos/seed/sunmoon1/480/280',
      'https://picsum.photos/seed/sunmoon2/480/280',
    ]},
  { key:'qingjing', emoji:'🐑', name:'清境農場', sub:'GREEN MEADOWS',
    desc:'海拔 1748 公尺的高山草原，近距離接觸綿羊，遠眺合歡山群峰，雲霧繚繞令人心醉。',
    photos:[
      'https://picsum.photos/seed/qingjing1/480/280',
      'https://picsum.photos/seed/qingjing2/480/280',
    ]},
  { key:'gaomei',   emoji:'🌅', name:'高美濕地', sub:'SUNSET WETLAND',
    desc:'台中最美夕陽觀賞地，退潮時水面如鏡，倒映天空與風車，是攝影師的天堂。',
    photos:[
      'https://picsum.photos/seed/gaomei1/480/280',
      'https://picsum.photos/seed/gaomei2/480/280',
    ]},
]
const S3 = [
  { key:'kenting', emoji:'🏖️', name:'墾丁海灘', sub:'SOUTH BEACH',
    desc:'台灣最南端熱帶天堂，澄澈海水白沙灘，夏日衝浪浮潛，夜晚逛夜市，每天都精彩。',
    photos:[
      'https://picsum.photos/seed/kenting1/480/280',
      'https://picsum.photos/seed/kenting2/480/280',
    ]},
  { key:'tainan',  emoji:'🏯', name:'台南古都', sub:'OLD CAPITAL',
    desc:'台灣最古老城市，赤崁樓、安平古堡等百年古蹟，加上牛肉湯與蝦仁飯的小吃天堂。',
    photos:[
      'https://picsum.photos/seed/tainan1/480/280',
      'https://picsum.photos/seed/tainan2/480/280',
    ]},
  { key:'love',    emoji:'🚤', name:'高雄愛河', sub:'LOVE RIVER',
    desc:'高雄市中心的浪漫愛河，夜晚燈光倒映水面，搭船夜遊是最浪漫的約會方式。',
    photos:[
      'https://picsum.photos/seed/loveharbor1/480/280',
      'https://picsum.photos/seed/loveharbor2/480/280',
    ]},
]

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
  scene4Entered: false,
  girlExcited:   false,
})

const worldEl  = ref(null)
const noBtnEl  = ref(null)
const sceneEls = reactive({})
let jumpTimer        = null
let scene4Interval   = null
let scene4JumpDelay  = null
let shownResultModal = false

// ─── Computed ─────────────────────────────────────────────────────────────────
const sceneCount   = computed(() => state.unlocked >= 4 ? 5 : 4)
const done         = computed(() => state.unlocked >= 4)
const leftVisible  = computed(() => state.cur >= 2 && state.cur < 4 && !!state.sel[state.cur])
const rightVisible = computed(() => state.cur >= 1 && state.cur < 4 && !!state.sel[state.cur])

const steps = computed(() => [
  { label: tr.value.depart, isDone: state.started,  alienImg: null   },
  { label: tr.value.am,     isDone: !!state.sel[1], alienImg: alien1 },
  { label: tr.value.noon,   isDone: !!state.sel[2], alienImg: alien2 },
  { label: tr.value.pm,     isDone: !!state.sel[3], alienImg: alien3 },
])
const picks = computed(() => [
  { stage: 1, spot: S1.find(o => o.key === state.sel[1]) },
  { stage: 2, spot: S2.find(o => o.key === state.sel[2]) },
  { stage: 3, spot: S3.find(o => o.key === state.sel[3]) },
].filter(o => o.spot).map(o => ({ ...o.spot, stage: o.stage })))

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

// Scene 4 girl col ref — jumpY animation applied via DOM (bubble moves with char)
const scene4GirlColRef = ref(null)
watch(() => state.jumpSeq, () => {
  const el = scene4GirlColRef.value
  if (!el) return
  el.style.animation = 'none'
  void el.offsetHeight
  el.style.animation = 'jumpY .62s ease-in-out'
})

// Sprite style — scene 4 girl: frameSwap only (jumpY on col wrapper now)
const scene4SpriteFrameStyle = computed(() => ({
  width:'clamp(72px,10vw,118px)', aspectRatio:'356 / 611',
  backgroundImage:`url('${jumpSprite}')`,
  backgroundPosition:'0% 0', backgroundSize:'200% 100%', backgroundRepeat:'no-repeat',
  filter:'drop-shadow(0 8px 6px rgba(10,30,60,.35))',
  animation: state.jumping ? 'frameSwap .62s step-end' : 'none',
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
          }
        }, 2000)
      }
    } else {
      clearTimeout(scene4JumpDelay)
      scene4JumpDelay = null
      clearInterval(scene4Interval)
      scene4Interval = null
      state.scene4Entered = false
    }
  }
}
function goPrev() { scrollToScene(Math.max(0, state.cur - 1)) }
async function goNext() {
  const next = Math.min(sceneCount.value - 1, state.cur + 1)
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
  state.sel = { ...state.sel, [stage]: key }
  if (stage === 1 && state.unlocked < 2) state.unlocked = 2
  else if (stage === 2 && state.unlocked < 3) state.unlocked = 3
  else if (stage === 3 && state.unlocked < 4) state.unlocked = 4
}
function openSpotDetail(stage, opt) {
  if (!opt.isActive) return
  state.spotModal = { stage, opt, viewOnly: false, photoIdx: 0 }
}
function openSpotDetailViewOnly(p) {
  state.spotModal = { stage: p.stage, opt: { ...p, isActive: false }, viewOnly: true, photoIdx: 0 }
}
function closeSpotModal() { state.spotModal = null }
function confirmSpot() {
  if (!state.spotModal) return
  const { stage, opt } = state.spotModal
  closeSpotModal()
  select(stage, opt.key)
  setTimeout(() => { state.girlExcited = true }, 300)
  if (stage === 2) {
    setTimeout(() => {
      state.modal = {
        emoji: tr.value.mNoonEmoji,
        title: tr.value.mNoonTitle,
        body:  tr.value.mNoonBody,
        btn:   tr.value.mNoonBtn,
      }
    }, 200)
  }
}
function prevPhoto() {
  if (state.spotModal && state.spotModal.photoIdx > 0) state.spotModal.photoIdx--
}
function nextPhoto() {
  const m = state.spotModal
  if (m && m.photoIdx < (m.opt.photos?.length ?? 1) - 1) state.spotModal.photoIdx++
}

function makeSpots(stage, arr) {
  const sel        = state.sel[stage]
  const isUnlocked = state.unlocked >= stage
  return arr.map(o => ({ ...o, isSel: sel===o.key, isActive: isUnlocked, isDisabled: !isUnlocked }))
}

function closeModal() {
  const a = state.modal?.after
  state.modal = null
  if (a) setTimeout(a, 380)
}

// ─── HUD flash on scene navigation ───────────────────────────────────────────
const hudFlashKeys = reactive([0, 0, 0, 0])
watch(() => state.cur, (cur) => {
  const prev = cur - 1
  if (prev >= 1 && prev <= 3 && state.sel[prev]) hudFlashKeys[prev]++
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
watch([() => state.cur, () => state.unlocked], () => nextTick(updateArrowPos))

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
const sceneAssets = [
  [shipBg, soliChar],
  [mapBg, girlSprite, arrowLeft, alien1],
  [arrowRight, alien2],
  [alien3, jumpSprite],
  [],
]
watch(() => state.cur, (cur) => {
  const next = cur + 1
  if (sceneAssets[next]?.length) preloadImages(sceneAssets[next])
})

onMounted(() => {
  preloadImages(sceneAssets[0])
  preloadImages(sceneAssets[1])
  window.addEventListener('resize', updateArrowPos)
  nextTick(updateArrowPos)
})

async function downloadResult() {
  try {
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
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
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'taiwan-trip.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch(e) {
    console.error('Screenshot failed:', e)
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
        <img v-if="st.isDone && st.alienImg"
             :key="'a' + i + hudFlashKeys[i]"
             :src="st.alienImg" class="hud-alien-img"
             :class="{ 'hud-flash': hudFlashKeys[i] > 0 }" />
        <div v-else :style="hudCircleStyle(st.isDone)">{{ st.isDone ? '✓' : String(i+1) }}</div>
      </div>
      <div v-if="i < steps.length - 1" class="hud-sep"></div>
    </template>
  </div>

  <!-- ── Girl (scenes 1–3) ─────────────────────────────────────── -->
  <Transition name="fade-girl">
    <div v-if="state.cur > 0 && state.cur < 4 && state.girlIn" class="char-wrap" aria-hidden="true">
      <div class="char-col">
        <div :key="girlBubbleKey" class="speech-bubble"
             :ref="el => el && initBubble(el, girlBubbleLines.value)"></div>
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
          <div :key="lang + '4g'" class="speech-bubble" :ref="el => el && initBubble(el, [tr.girl4Bubble])"></div>
          <div :key="state.jumpSeq" :style="scene4SpriteFrameStyle"></div>
        </div>
      </div>
    </Transition>
    <Transition name="boy4">
      <div v-if="state.scene4Entered" class="scene4-char-slot">
        <div class="char-col">
          <div :key="lang + '4b'" class="speech-bubble" :ref="el => el && initBubble(el, [tr.boy4Bubble])"></div>
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
           :style="{ transform:'translate(-50%,-54%)', opacity: state.started ? 0 : 1, transition:'opacity 0.5s ease' }">
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
      <div class="scene-0-char" :style="{ opacity: state.started ? 0 : 1, transition:'opacity 0.5s ease' }" aria-hidden="true">
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
              <div v-for="opt in makeSpots(1, S1)" :key="opt.key"
                   class="spot-row"
                   :class="{ 'spot-row-selected':opt.isSel, 'spot-row-active':opt.isActive && !opt.isSel, 'spot-row-disabled':opt.isDisabled }"
                   @click="openSpotDetail(1, opt)">
                <span class="spot-row-emoji">{{ opt.emoji }}</span>
                <div class="spot-row-info">
                  <div class="spot-row-name">{{ opt.name }}</div>
                  <div class="spot-row-sub">{{ opt.sub }}</div>
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
            <h2 class="pick-title">{{ tr.pick }}</h2>
            <div v-if="state.unlocked < 2" class="locked-msg">{{ tr.locked }}</div>
            <div v-else class="spots-list">
              <div v-for="opt in makeSpots(2, S2)" :key="opt.key"
                   class="spot-row"
                   :class="{ 'spot-row-selected':opt.isSel, 'spot-row-active':opt.isActive && !opt.isSel, 'spot-row-disabled':opt.isDisabled }"
                   @click="openSpotDetail(2, opt)">
                <span class="spot-row-emoji">{{ opt.emoji }}</span>
                <div class="spot-row-info">
                  <div class="spot-row-name">{{ opt.name }}</div>
                  <div class="spot-row-sub">{{ opt.sub }}</div>
                </div>
                <span v-if="opt.isSel" class="spot-row-check">✓</span>
                <span v-else-if="opt.isActive" class="spot-row-arr">›</span>
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
              <div v-for="opt in makeSpots(3, S3)" :key="opt.key"
                   class="spot-row"
                   :class="{ 'spot-row-selected':opt.isSel, 'spot-row-active':opt.isActive && !opt.isSel, 'spot-row-disabled':opt.isDisabled }"
                   @click="openSpotDetail(3, opt)">
                <span class="spot-row-emoji">{{ opt.emoji }}</span>
                <div class="spot-row-info">
                  <div class="spot-row-name">{{ opt.name }}</div>
                  <div class="spot-row-sub">{{ opt.sub }}</div>
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
      <div class="panel-wrap" style="transform:translate(-50%,-54%)">
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
              <button class="result-btn result-btn-dl" @click="downloadResult">{{ tr.download }}</button>
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
          <p  class="spot-popup-sub">{{ state.spotModal.opt.sub }}</p>
          <p  class="spot-popup-desc">{{ state.spotModal.opt.desc }}</p>
          <!-- Photo Carousel -->
          <div v-if="state.spotModal.opt.photos?.length" class="spot-carousel">
            <div class="carousel-track">
              <img :src="state.spotModal.opt.photos[state.spotModal.photoIdx]"
                   class="carousel-img" alt="" />
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
          <button class="spot-popup-confirm" @click="confirmSpot">{{ tr.confirmPick }}</button>
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

/* ── Language Toggle ─────────────────────────────────────────── */
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
  top: max(12px, env(safe-area-inset-top));
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
  gap: clamp(40px, 8vw, 80px);
  width: clamp(280px, 38vw, 420px);
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
  display: block; width: 100%; height: clamp(140px, 36vw, 220px);
  object-fit: cover; border-radius: 12px;
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
