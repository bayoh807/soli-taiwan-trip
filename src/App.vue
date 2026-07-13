<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import shipBg    from '../assets/ship-bg.jpeg'
import mapBg     from '../assets/map-bg.png'
import jumpSprite from '../assets/jump-sprite.png'
import arrowLeft  from '../assets/arrow-left.png'
import arrowRight from '../assets/arrow-right.png'
import soliChar   from '../assets/soli-char.png'
import alien1     from '../assets/alien-1.png'
import alien2     from '../assets/alien-2.png'
import alien3     from '../assets/alien-3.png'

// ─── i18n ─────────────────────────────────────────────────────────────────────
function detectLang() {
  const bl = (navigator.language || 'zh').toLowerCase()
  if (bl.startsWith('ko')) return 'kr'
  if (bl.startsWith('en')) return 'en'
  return 'zh'
}
const lang  = ref(detectLang())
const LANGS = ['zh', 'en', 'kr']
const I18N  = {
  zh: {
    depart:'出發', am:'早', noon:'中', pm:'晚',
    stop1:'第一站 · 早上', stop2:'第二站 · 中午', stop3:'第三站 · 晚上',
    questTitle:'準備好開始\n你的台灣之旅了嗎？',
    questSub:'READY FOR YOUR TAIWAN ADVENTURE?',
    yesBtn:'YES 出發！', noBtn:'NO 再想想',
    pick:'選一個地點展開探索', pickLast:'選一個地點完成旅程',
    locked1:'🔒 先回到起點回答問題，即可解鎖',
    locked:'🔒 完成上一站，解鎖此地點',
    complete:'🏝️ 你的台灣旅程 · COMPLETE',
    confirmPick:'確認選擇', download:'📥 下載截圖',
    downloadHint:'下載圖片分享給 Justin 吧 📮',
    hint:'偷偷說…「NO」好像有點滑溜 😏', selected:'✓ 已選擇',
    // modals
    mYesEmoji:'🎁', mYesTitle:'神秘禮盒 GET!',
    mYesBody:'恭喜獲得「旅程通行證」\n以及 100 楓幣！\n\n你的台灣冒險正式展開～',
    mYesBtn:'開啟旅程',
    mNoonEmoji:'🌞', mNoonTitle:'中午行程決定了！',
    mNoonBtn:'繼續選晚上',
    mDoneEmoji:'🏆', mDoneTitle:'旅程完成！',
    mDoneBody:'你已選好台灣一日行程，\n準備出發了嗎？',
    mDoneBtn:'查看行程',
  },
  en: {
    depart:'Start', am:'AM', noon:'Noon', pm:'PM',
    stop1:'Stop 1 · Morning', stop2:'Stop 2 · Noon', stop3:'Stop 3 · Evening',
    questTitle:'Ready for your\nTaiwan adventure?',
    questSub:'READY FOR YOUR TAIWAN ADVENTURE?',
    yesBtn:"YES, Let's Go!", noBtn:'NO, hmm...',
    pick:'Choose a destination', pickLast:'Choose your final stop',
    locked1:'🔒 Go back to start to unlock',
    locked:'🔒 Complete the previous stop first',
    complete:'🏝️ Your Taiwan Journey · COMPLETE',
    confirmPick:'Confirm', download:'📥 Save Screenshot',
    downloadHint:'Download & share with Justin 📮',
    hint:"Psst… the NO button is a bit slippery 😏", selected:'✓ Selected',
    mYesEmoji:'🎁', mYesTitle:'Mystery Box GET!',
    mYesBody:'You received a "Journey Pass"\n+100 Maple Coins!\n\nYour Taiwan adventure begins～',
    mYesBtn:'Start Journey',
    mNoonEmoji:'🌞', mNoonTitle:'Noon stop locked in!',
    mNoonBtn:'Pick evening',
    mDoneEmoji:'🏆', mDoneTitle:'Journey Complete!',
    mDoneBody:'Your Taiwan day trip is planned!\nReady to go?',
    mDoneBtn:'View itinerary',
  },
  kr: {
    depart:'출발', am:'아침', noon:'점심', pm:'저녁',
    stop1:'1번째 · 아침', stop2:'2번째 · 점심', stop3:'3번째 · 저녁',
    questTitle:'대만 여행을\n시작할 준비가 됐나요?',
    questSub:'대만 어드벤처 준비 완료?',
    yesBtn:'YES, 출발!', noBtn:'NO, 글쎄...',
    pick:'목적지를 선택하세요', pickLast:'마지막 목적지를 선택하세요',
    locked1:'🔒 시작 지점으로 돌아가서 잠금 해제',
    locked:'🔒 이전 단계를 완료해야 합니다',
    complete:'🏝️ 대만 여행 · 완료',
    confirmPick:'확인', download:'📥 스크린샷 저장',
    downloadHint:'Justin에게 사진 공유하기 📮',
    hint:'잠깐... NO 버튼이 좀 미끄럽네요 😏', selected:'✓ 선택됨',
    mYesEmoji:'🎁', mYesTitle:'신비 상자 GET!',
    mYesBody:'「여행 통행증」획득!\n+100 메이플 코인!\n\n대만 어드벤처 시작～',
    mYesBtn:'여행 시작',
    mNoonEmoji:'🌞', mNoonTitle:'점심 장소 확정!',
    mNoonBtn:'저녁 선택하기',
    mDoneEmoji:'🏆', mDoneTitle:'여행 완료!',
    mDoneBody:'대만 하루 여행 계획 완성!\n출발할 준비 됐나요?',
    mDoneBtn:'일정 보기',
  }
}
const tr = computed(() => I18N[lang.value])
function cycleLang() {
  const idx = LANGS.indexOf(lang.value)
  lang.value = LANGS[(idx + 1) % LANGS.length]
}
const langFlag = computed(() => ({ zh:'🇹🇼', en:'🇺🇸', kr:'🇰🇷' }[lang.value]))

// ─── Spot Data ────────────────────────────────────────────────────────────────
const S1 = [
  { key:'101',    emoji:'🏙️', name:'台北 101',  sub:'SKYLINE TOWER',
    desc:'508 公尺的世界地標，頂樓觀景台 360° 俯瞰台北全景，日夜各有絕美風貌。' },
  { key:'jiufen', emoji:'🏮', name:'九份老街',   sub:'LANTERN TOWN',
    desc:'山城老街掛滿紅燈籠，傳說是宮崎駿《神隱少女》的靈感來源，霧雨中格外有詩意。' },
  { key:'yehliu', emoji:'🪨', name:'野柳女王頭', sub:'SEA ROCKS',
    desc:'大海與風雨共同雕刻的地質奇觀，女王頭造型獨特，每年吸引百萬旅人朝聖。' },
]
const S2 = [
  { key:'sunmoon',  emoji:'🚣', name:'日月潭',   sub:'SUN MOON LAKE',
    desc:'台灣最大高山湖泊，清晨薄霧如仙境，可搭船遊湖或騎自行車欣賞環湖美景。' },
  { key:'qingjing', emoji:'🐑', name:'清境農場', sub:'GREEN MEADOWS',
    desc:'海拔 1748 公尺的高山草原，近距離接觸綿羊，遠眺合歡山群峰，雲霧繚繞令人心醉。' },
  { key:'gaomei',   emoji:'🌅', name:'高美濕地', sub:'SUNSET WETLAND',
    desc:'台中最美夕陽觀賞地，退潮時水面如鏡，倒映天空與風車，是攝影師的天堂。' },
]
const S3 = [
  { key:'kenting', emoji:'🏖️', name:'墾丁海灘', sub:'SOUTH BEACH',
    desc:'台灣最南端熱帶天堂，澄澈海水白沙灘，夏日衝浪浮潛，夜晚逛夜市，每天都精彩。' },
  { key:'tainan',  emoji:'🏯', name:'台南古都', sub:'OLD CAPITAL',
    desc:'台灣最古老城市，赤崁樓、安平古堡等百年古蹟，加上牛肉湯與蝦仁飯的小吃天堂。' },
  { key:'love',    emoji:'🚤', name:'高雄愛河', sub:'LOVE RIVER',
    desc:'高雄市中心的浪漫愛河，夜晚燈光倒映水面，搭船夜遊是最浪漫的約會方式。' },
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
})

const worldEl  = ref(null)
const noBtnEl  = ref(null)
const sceneEls = reactive({})
let jumpTimer        = null
let scene4Interval   = null
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
const picks = computed(() =>
  [S1.find(o => o.key === state.sel[1]),
   S2.find(o => o.key === state.sel[2]),
   S3.find(o => o.key === state.sel[3])].filter(Boolean)
)

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

// Sprite styles — girl
const spriteStyle = computed(() => ({
  width:'clamp(72px,10vw,118px)', aspectRatio:'356 / 611',
  backgroundImage:`url('${jumpSprite}')`,
  backgroundPosition:'0% 0', backgroundSize:'200% 100%', backgroundRepeat:'no-repeat',
  filter:'drop-shadow(0 8px 6px rgba(10,30,60,.35))',
  animation: state.jumping ? 'jumpY .62s ease-in-out, frameSwap .62s step-end' : 'none',
}))

// Scene 4 girl uses same spriteStyle as scenes 1-3 (driven by state.jumping)

// Boy sprite
const soliSpriteStyle = {
  width:'clamp(72px,10vw,118px)', aspectRatio:'367 / 626',
  backgroundImage:`url('${soliChar}')`,
  backgroundPosition:'0% 0%', backgroundSize:'300% 100%', backgroundRepeat:'no-repeat',
  imageRendering:'pixelated',
  filter:'drop-shadow(0 8px 8px rgba(10,30,60,.3))',
  animation:'wave3 1s step-end infinite',
}
const soliScene0Style = {
  ...soliSpriteStyle,
  width:'clamp(110px,24vw,160px)',
}

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
    triggerJump()
    if (cur === 4) {
      // slide-in entrance then continuous jump
      setTimeout(() => { state.scene4Entered = true }, 100)
      if (!scene4Interval) {
        scene4Interval = setInterval(() => triggerJump(), 1400)
      }
      if (done.value && !shownResultModal) {
        shownResultModal = true
        setTimeout(() => {
          state.modal = {
            emoji: tr.value.mDoneEmoji, title: tr.value.mDoneTitle,
            body: tr.value.mDoneBody,   btn:   tr.value.mDoneBtn,
          }
        }, 900)
      }
    } else {
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
  const el   = noBtnEl.value
  const size = state.noSize || (el ? { w:el.offsetWidth, h:el.offsetHeight } : { w:150, h:50 })
  if (!state.noSize) state.noSize = { ...size }
  const m = 14
  state.noPos = {
    left: m + Math.random() * Math.max(40, window.innerWidth  - size.w - m*2),
    top:  m + Math.random() * Math.max(40, window.innerHeight - size.h - m*2),
  }
}

function select(stage, key) {
  if (state.unlocked !== stage) return
  state.sel = { ...state.sel, [stage]: key }
  if (stage === 1) state.unlocked = 2
  else if (stage === 2) state.unlocked = 3
  else if (stage === 3) state.unlocked = 4
}
function openSpotDetail(stage, opt) {
  if (!opt.isActive) return
  state.spotModal = { stage, opt }
}
function closeSpotModal() { state.spotModal = null }
function confirmSpot() {
  if (!state.spotModal) return
  const { stage, opt } = state.spotModal
  closeSpotModal()
  select(stage, opt.key)
  if (stage === 2) {
    setTimeout(() => {
      state.modal = {
        emoji: tr.value.mNoonEmoji,
        title: tr.value.mNoonTitle,
        body:  opt.name,
        btn:   tr.value.mNoonBtn,
      }
    }, 200)
  }
}

function makeSpots(stage, arr) {
  const sel      = state.sel[stage]
  const isActive = state.unlocked === stage
  return arr.map(o => ({ ...o, isSel: sel===o.key, isActive, isDisabled: !isActive && sel!==o.key }))
}

function closeModal() {
  const a = state.modal?.after
  state.modal = null
  if (a) setTimeout(a, 380)
}

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
    alert('截圖失敗，請用手機截圖功能')
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

  <!-- ── Petals ───────────────────────────────────────────────── -->
  <div class="petals-overlay" aria-hidden="true">
    <div class="petal" style="left:16%;width:10px;height:9px;animation-duration:10s;background:linear-gradient(135deg,#ffb7d2,#ff8fb8)"></div>
    <div class="petal" style="left:42%;width:8px;height:7px;animation-duration:13s;animation-delay:-5s;background:linear-gradient(135deg,#ffcde0,#ffa7c6)"></div>
    <div class="petal" style="left:66%;width:11px;height:10px;animation-duration:11s;animation-delay:-8s;background:linear-gradient(135deg,#ffb7d2,#ff8fb8)"></div>
    <div class="petal" style="left:87%;width:8px;height:7px;animation-duration:14s;animation-delay:-2s;background:linear-gradient(135deg,#ffd9e8,#ffb0cc)"></div>
  </div>

  <!-- ── Language Toggle ──────────────────────────────────────── -->
  <button class="lang-toggle" @click="cycleLang">{{ langFlag }}</button>

  <!-- ── Progress HUD ─────────────────────────────────────────── -->
  <div class="hud">
    <template v-for="(st, i) in steps" :key="i">
      <div class="hud-node">
        <img v-if="st.isDone && st.alienImg" :src="st.alienImg" class="hud-alien-img" />
        <div v-else :style="hudCircleStyle(st.isDone)">{{ st.isDone ? '✓' : String(i+1) }}</div>
        <div class="hud-label">{{ st.label }}</div>
      </div>
      <div v-if="i < steps.length - 1" class="hud-sep"></div>
    </template>
  </div>

  <!-- ── Girl (scenes 1–3) ─────────────────────────────────────── -->
  <Transition name="fade-girl">
    <div v-if="state.cur > 0 && state.cur < 4 && state.girlIn" class="char-wrap" aria-hidden="true">
      <div :key="state.jumpSeq" :style="spriteStyle"></div>
    </div>
  </Transition>

  <!-- ── Scene 4 dual characters ──────────────────────────────── -->
  <div v-if="state.cur === 4 && state.girlIn" class="scene4-chars" aria-hidden="true">
    <Transition name="girl4">
      <div v-if="state.scene4Entered" class="scene4-char-slot">
        <div :key="state.jumpSeq" :style="spriteStyle"></div>
      </div>
    </Transition>
    <Transition name="boy4">
      <div v-if="state.scene4Entered" class="scene4-char-slot">
        <div :style="soliSpriteStyle"></div>
      </div>
    </Transition>
  </div>

  <!-- ── Nav Arrows ───────────────────────────────────────────── -->
  <div class="nav-arrows">
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
            <span class="panel-header-text">冒險任務 · QUEST</span>
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
        <div :style="soliScene0Style"></div>
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
              <div v-for="p in picks" :key="p.key" class="pick-item">
                <span class="pick-emoji">{{ p.emoji }}</span>
                <span class="pick-name">{{ p.name }}</span>
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
        </div>
        <div class="spot-popup-footer">
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
.lang-toggle {
  position: fixed;
  top: max(10px, env(safe-area-inset-top));
  right: max(14px, env(safe-area-inset-right));
  z-index: 70;
  background: rgba(255,255,255,.88);
  border: 1.5px solid #c9a96e;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: clamp(11px, 2.8vw, 13px);
  color: #6b4e2a;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-family: 'ZCOOL KuaiLe', 'Baloo 2', sans-serif;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(60,40,10,.18);
  transition: background .15s ease;
}
.lang-toggle:hover { background: rgba(255,255,255,1); }

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
.char-wrap {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(max(12px, env(safe-area-inset-bottom)) + 4px);
  z-index: 15; pointer-events: none;
}
.scene4-chars {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(max(12px, env(safe-area-inset-bottom)) + 4px);
  z-index: 15; pointer-events: none;
  display: flex; align-items: flex-end;
  gap: clamp(72px, 10vw, 118px);
}
.scene-0-char {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(max(12px, env(safe-area-inset-bottom)) + 4px);
  z-index: 15; pointer-events: none;
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
  filter: drop-shadow(0 5px 6px rgba(10,30,60,.35));
  transition: transform .14s ease;
  animation: arrowpulse 1.4s ease-in-out infinite;
}
.arrow-btn:hover { transform: translateY(-3px) scale(1.05); animation: none; }
.arrow-btn:active { transform: translateY(1px) scale(.96); }
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
  position: absolute; top: 50%; left: 50%;
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
  display: flex; gap: clamp(12px,4vw,22px);
  justify-content: center; align-items: center; flex-wrap: wrap;
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
.pick-emoji { font-size: 24px; }
.pick-name { font-size: clamp(15px,3.6vw,18px); color: #3e2c10; }
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
.result-btn-sh {
  border: 2px solid #4272b4;
  background: linear-gradient(#7aabf0,#2c5288);
  color: #fff; text-shadow: 0 1px 2px rgba(0,20,60,.4);
  box-shadow: 0 3px 0 #1e3d7a, 0 6px 14px rgba(10,30,80,.25), inset 0 1px 0 rgba(255,255,255,.4);
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
  transition: background .14s ease;
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
.spot-popup-desc { margin: 0; font-size: clamp(14px,3.4vw,16px); color: #5a3e18; line-height: 1.75; }
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

/* girl: slides in from right, drifts left to position */
.girl4-enter-active {
  transition: transform 0.9s cubic-bezier(.15,1.1,.4,1), opacity 0.5s ease;
}
.girl4-enter-from { transform: translateX(60vw); opacity: 0; }

/* boy: slides in from right, slightly delayed */
.boy4-enter-active {
  transition: transform 0.9s cubic-bezier(.15,1.1,.4,1) 0.28s, opacity 0.5s ease 0.28s;
}
.boy4-enter-from { transform: translateX(120vw); opacity: 0; }

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .panel-body { padding: 14px 12px 16px; }
  .btn-yes { padding: 11px 18px; font-size: 17px; }
  .hud { padding: 6px 10px; gap: 5px; max-width: 80vw; }
  .btn-row { gap: 10px; }
  .spot-row { padding: 10px 12px; gap: 10px; }
  .spot-row-emoji { font-size: 26px; }
  .lang-toggle { padding: 4px 10px; }
}
</style>
