const qs = s => document.querySelector(s)
const qsa = s => Array.from(document.querySelectorAll(s))
const card = qs('#tilt-card')
const container = qs('#tilt-container')
const menu = qs('#context-menu')
const ctxRefresh = qs('#ctx-refresh')
const ctxClose = qs('#ctx-close')
const glow = qs('#glow')
const bgVideo = qs('#bg-video')
const videoModal = qs('#video-modal')
const playerContainer = qs('#intro-player')
const videoClose = qs('#video-close')
function showContext(x,y){
  if(!menu) return
  const w = menu.offsetWidth || 180
  const h = menu.offsetHeight || 120
  const left = Math.min(Math.max(8, x), window.innerWidth - w - 8)
  const top = Math.min(Math.max(8, y), window.innerHeight - h - 8)
  menu.style.left = left + 'px'
  menu.style.top = top + 'px'
  menu.style.display = 'block'
  menu.setAttribute('aria-hidden','false')
  const first = menu.querySelector('.menu-item')
  if(first) first.focus()
}
function hideContext(){ if(!menu) return; menu.style.display = 'none'; menu.setAttribute('aria-hidden','true') }
window.addEventListener('contextmenu', e => { e.preventDefault(); showContext(e.clientX,e.clientY) })
window.addEventListener('click', e => {
  hideContext()
  const r = document.createElement('div')
  r.className = 'ripple'
  r.style.left = e.clientX + 'px'
  r.style.top = e.clientY + 'px'
  r.style.width = '12px'
  r.style.height = '12px'
  document.body.appendChild(r)
  setTimeout(()=>{ try{ r.remove() }catch(e){} }, 600)
})
window.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    hideContext()
    if(videoModal && videoModal.style.display === 'flex'){ closeVideo(true) }
  }
  if((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('menu-item')){
    document.activeElement.click()
    e.preventDefault()
  }
})
if(ctxRefresh) ctxRefresh.addEventListener('click', ()=> location.reload())
if(ctxClose) ctxClose.addEventListener('click', ()=> hideContext())
let raf = null
let rotateX = 0, rotateY = 0
function applyTransform(){ if(card) card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`; raf = null }
function onPointerMove(e){
  if(!card) return
  const rect = card.getBoundingClientRect()
  const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0
  const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY) || 0
  const x = clientX - rect.left
  const y = clientY - rect.top
  const px = (x / Math.max(1, rect.width)) * 100
  const py = (y / Math.max(1, rect.height)) * 100
  if(glow){ glow.style.setProperty('--mouse-x', px + '%'); glow.style.setProperty('--mouse-y', py + '%') }
  if(window.innerWidth <= 768) return
  rotateX = (y - rect.height/2) / 25
  rotateY = ((rect.width/2) - x) / 25
  if(!raf) raf = requestAnimationFrame(applyTransform)
}
function onPointerLeave(){
  rotateX = 0; rotateY = 0
  if(card) card.style.transition = "transform 0.8s cubic-bezier(0.23,1,0.32,1)"
  if(!raf) raf = requestAnimationFrame(()=>{ applyTransform(); setTimeout(()=>{ if(card) card.style.transition = ""; }, 820) })
}
if(container && card){
  container.addEventListener('pointermove', onPointerMove, {passive:true})
  container.addEventListener('pointerleave', onPointerLeave)
  container.addEventListener('touchend', onPointerLeave, {passive:true})
}
const phrases = ["Modern UI","Web Apps","Cybersecurity","Scratch","JavaScript"]
let pi = 0, pj = 0, deleting = false
function typeLoop(){
  const t = qs('#typewriter'); if(!t) return
  const word = phrases[pi]
  t.textContent = word.substring(0, Math.max(0,pj))
  if(deleting) pj--; else pj++
  if(!deleting && pj > word.length){ deleting = true; setTimeout(typeLoop,2000) }
  else if(deleting && pj < 0){ deleting = false; pi = (pi+1)%phrases.length; pj = 0; setTimeout(typeLoop,500) }
  else setTimeout(typeLoop, deleting ? 40 : 90)
}
typeLoop()
function updateTime(){
  const el = qs('#time'); if(!el) return
  const now = new Date(); el.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
}
updateTime(); setInterval(updateTime,1000)
async function fetchWeather(){
  const tEl = qs('#temp'); const cEl = qs('#cond')
  try{
    const res = await fetch('https://api.weather.gov/points/43.1939,-71.5724')
    if(!res.ok) throw new Error('points fetch failed')
    const json = await res.json()
    const url = json && json.properties && json.properties.forecastHourly
    if(!url) throw new Error('no forecast url')
    const fr = await fetch(url)
    if(!fr.ok) throw new Error('forecast fetch failed')
    const fj = await fr.json()
    const cur = (fj && fj.properties && fj.properties.periods && fj.properties.periods[0]) || (fj && fj.features && fj.features[0] && fj.features[0].properties)
    if(cur){
      if(cur.temperature !== undefined) { if(tEl) tEl.textContent = `${cur.temperature}°F` }
      if(cur.shortForecast) { if(cEl) cEl.textContent = cur.shortForecast }
      return
    }
    throw new Error('no current forecast')
  }catch(e){
    if(tEl) tEl.textContent = '72°F'
    if(cEl) cEl.textContent = 'Clear Skies'
  }
}
fetchWeather()
let _allowedUrl = null
document.addEventListener('copy', ev => {
  if(_allowedUrl){ try{ ev.preventDefault(); ev.clipboardData.setData('text/plain', _allowedUrl) }catch(e){} setTimeout(()=> _allowedUrl = null, 60); return }
  try{ ev.preventDefault() }catch(e){} showToast('Copy blocked — use the "Copy URL" button.')
})
document.addEventListener('keydown', e => {
  const isCopyHotkey = (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')
  if(isCopyHotkey){ try{ e.preventDefault() }catch(e){} showToast('Copy blocked — use the "Copy URL" button.') }
})
qsa('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async ev => {
    ev.preventDefault()
    let url = btn.getAttribute('data-copy-url') || btn.dataset.copyUrl
    if(!url){ const a = btn.querySelector('a'); url = a ? a.href : null }
    if(!url){ showToast('No URL found on this button.'); return }
    if(navigator.clipboard && navigator.clipboard.writeText){ try{ await navigator.clipboard.writeText(url); showToast('URL copied to clipboard'); return }catch(e){} }
    _allowedUrl = url
    try{
      const ok = document.execCommand && document.execCommand('copy')
      if(!ok){ _allowedUrl = null; try{ window.prompt('Copy the URL below (Ctrl+C / Cmd+C):', url) }catch(e){ showToast('Unable to copy automatically. Use the prompt.') } }
      else showToast('URL copied to clipboard (fallback)')
    }catch(e){ _allowedUrl = null; try{ window.prompt('Copy the URL below (Ctrl+C / Cmd+C):', url) }catch(e){ showToast('Unable to copy automatically. Use the prompt.') } }
    setTimeout(()=> _allowedUrl = null, 300)
  })
})
function showToast(msg, ms=1600){
  const t = document.createElement('div'); t.className = 'copy-toast'; t.textContent = msg
  t.style.position = 'fixed'; t.style.left = '50%'; t.style.transform = 'translateX(-50%)'
  t.style.bottom = '12%'; t.style.padding = '8px 12px'; t.style.borderRadius = '8px'
  t.style.background = 'rgba(20,20,20,0.9)'; t.style.color = '#fff'; t.style.zIndex = 99999; t.style.fontFamily = 'system-ui, sans-serif'
  document.body.appendChild(t); setTimeout(()=>{ try{ t.remove() }catch(e){} }, ms)
}
function shouldDisableBgVideo(){
  try{
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
    if(navigator.connection){
      if(navigator.connection.saveData) return true
      const t = navigator.connection.effectiveType || ''
      if(/2g|slow-2g/.test(t)) return true
    }
  }catch(e){}
  return false
}
if(shouldDisableBgVideo()) document.documentElement.classList.add('hide-video')
const VIDEO_KEY = 'sirsnoopy_first_load_video_shown_v4'
const VIDEO_ID = 'Rz5RM_D_XeI'
const START_SEC = 0
let ytApiReady = false
let ytPlayer = null
let pendingOpen = false
;(function loadYouTubeAPI(){
  if(window.YT && window.YT.Player){ ytApiReady = true; return }
  if(document.querySelector('script[data-yt-api]')) return
  const tag = document.createElement('script')
  tag.src = "https://www.youtube.com/iframe_api"
  tag.setAttribute('data-yt-api', '1')
  document.head.appendChild(tag)
})()
window.onYouTubeIframeAPIReady = function(){
  ytApiReady = true
  if(pendingOpen){ createOrLoadPlayer(true); pendingOpen = false }
}
function createOrLoadPlayer(playImmediately = false){
  if(ytPlayer && typeof ytPlayer.loadVideoById === 'function'){
    try{
      ytPlayer.loadVideoById({videoId: VIDEO_ID, startSeconds: START_SEC})
      if(playImmediately && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo()
      return
    }catch(e){
      try{ ytPlayer.destroy() }catch(e){}
      ytPlayer = null
    }
  }
  if(!playerContainer) return
  playerContainer.innerHTML = ''
  if(window.YT && YT.Player){
    ytPlayer = new YT.Player('intro-player', {
      height: '100%',
      width: '100%',
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        mute: 1,
        start: START_SEC,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        controls: 1,
        enablejsapi: 1
      },
      events: {
        onReady: function(event){
          try{ event.target.mute() }catch(e){}
          if(playImmediately && typeof event.target.playVideo === 'function'){ try{ event.target.playVideo() }catch(e){} }
        },
        onStateChange: function(e){
          if(typeof YT !== 'undefined' && e.data === YT.PlayerState.ENDED){
            try{ localStorage.setItem(VIDEO_KEY,'1') }catch(err){}
            closeVideo(true)
          }
        },
        onError: function(err){
          setTimeout(()=> closeVideo(true), 1200)
        }
      }
    })
  }
}
function openVideo(){
  if(!videoModal || !playerContainer) return
  videoModal.style.display = 'flex'
  videoModal.setAttribute('aria-hidden','false')
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  if(videoClose) videoClose.focus()
  if(!ytApiReady){
    pendingOpen = true
    playerContainer.innerHTML = '<div style="display:grid;place-items:center;height:100%;width:100%"><svg width="48" height="48" viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.18)" stroke-width="4" fill="none"/><path d="M25 5 a20 20 0 0 1 0 40" stroke="white" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.95"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></path></svg></div>'
    return
  }
  createOrLoadPlayer(true)
}
function closeVideo(fromAuto=false){
  if(!videoModal) return
  if(ytPlayer && typeof ytPlayer.destroy === 'function'){
    try{ ytPlayer.destroy() }catch(e){}
    ytPlayer = null
  }
  try{ playerContainer.innerHTML = '' }catch(e){}
  videoModal.style.display = 'none'
  videoModal.setAttribute('aria-hidden','true')
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  try{ localStorage.setItem(VIDEO_KEY,'1') }catch(e){}
}
if(videoClose) videoClose.addEventListener('click', ()=>{ closeVideo(false) })
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const shown = localStorage.getItem(VIDEO_KEY)
    if(!shown) openVideo()
  }catch(e){
    openVideo()
  }
})
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && videoModal && videoModal.style.display === 'flex'){ closeVideo(true) }
})
videoModal && videoModal.addEventListener('click', (ev) => {
  if(ev.target === videoModal) closeVideo(false)
})
