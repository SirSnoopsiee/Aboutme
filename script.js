const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

// Element Cache
const elements = {
  card: qs('#tilt-card'),
  container: qs('#tilt-container'),
  menu: qs('#context-menu'),
  glow: qs('#glow'),
  videoModal: qs('#video-modal'),
  playerContainer: qs('#intro-player'),
  typewriter: qs('#typewriter'),
  time: qs('#time'),
  temp: qs('#temp'),
  cond: qs('#cond'),
  // Target for the new contact icon
  socialContainer: qs('.social-links') || qs('#tilt-card') 
};

/* --- 1. MODERN CONTEXT MENU --- */
const toggleContext = (show, x = 0, y = 0) => {
  if (!elements.menu) return;
  
  if (show) {
    const { offsetWidth: w, offsetHeight: h } = elements.menu;
    const left = Math.min(Math.max(8, x), window.innerWidth - (w || 180) - 8);
    const top = Math.min(Math.max(8, y), window.innerHeight - (h || 120) - 8);
    
    Object.assign(elements.menu.style, {
      left: `${left}px`,
      top: `${top}px`,
      display: 'block'
    });
    elements.menu.setAttribute('aria-hidden', 'false');
    elements.menu.querySelector('.menu-item')?.focus();
  } else {
    elements.menu.style.display = 'none';
    elements.menu.setAttribute('aria-hidden', 'true');
  }
};

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  toggleContext(true, e.clientX, e.clientY);
});

/* --- 2. RIPPLE & GLOBAL CLICK --- */
window.addEventListener('click', e => {
  toggleContext(false);
  
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  Object.assign(ripple.style, {
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
    width: '12px',
    height: '12px'
  });
  
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* --- 3. HIGH-PERFORMANCE TILT --- */
let state = { rotateX: 0, rotateY: 0, raf: null };

const updateTilt = () => {
  if (elements.card) {
    elements.card.style.transform = `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`;
  }
  state.raf = null;
};

const handlePointer = (e) => {
  if (!elements.card || window.innerWidth <= 768) return;
  
  const rect = elements.card.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
  const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
  
  const px = (x / rect.width) * 100;
  const py = (y / rect.height) * 100;
  elements.glow?.style.setProperty('--mouse-x', `${px}%`);
  elements.glow?.style.setProperty('--mouse-y', `${py}%`);

  state.rotateX = (y - rect.height / 2) / 20;
  state.rotateY = (rect.width / 2 - x) / 20;

  if (!state.raf) state.raf = requestAnimationFrame(updateTilt);
};

const resetTilt = () => {
  state.rotateX = 0;
  state.rotateY = 0;
  if (elements.card) elements.card.style.transition = "transform 0.6s var(--smooth-fluid)";
  if (!state.raf) state.raf = requestAnimationFrame(() => {
    updateTilt();
    setTimeout(() => { if (elements.card) elements.card.style.transition = ""; }, 600);
  });
};

if (elements.container) {
  elements.container.addEventListener('pointermove', handlePointer, { passive: true });
  elements.container.addEventListener('pointerleave', resetTilt);
}

/* --- 4. SECURE CLIPBOARD SYSTEM --- */
const showToast = (msg) => {
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
};

qsa('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = btn.dataset.copyUrl || btn.querySelector('a')?.href;
    if (!url) return showToast("No URL found");

    try {
      await navigator.clipboard.writeText(url);
      showToast("Link Copied!");
    } catch (err) {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast("Link Copied (Fallback)");
    }
  });
});

/* --- 5. TYPEWRITER & WEATHER --- */
const phrases = ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"];
let pIdx = 0, charIdx = 0, isDeleting = false;

const type = () => {
  const target = elements.typewriter;
  if (!target) return;

  const currentPhrase = phrases[pIdx];
  target.textContent = currentPhrase.substring(0, charIdx);

  let speed = isDeleting ? 50 : 100;

  if (!isDeleting && charIdx === currentPhrase.length) {
    isDeleting = true;
    speed = 2000;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    pIdx = (pIdx + 1) % phrases.length;
    speed = 500;
  }

  charIdx += isDeleting ? -1 : 1;
  setTimeout(type, speed);
};

const fetchWeather = async () => {
  try {
    const res = await fetch('https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly');
    const data = await res.json();
    const current = data.properties.periods[0];
    if (elements.temp) elements.temp.textContent = `${current.temperature}°${current.temperatureUnit}`;
    if (elements.cond) elements.cond.textContent = current.shortForecast;
  } catch (e) {
    if (elements.temp) elements.temp.textContent = '72°F';
  }
};

/* --- 6. YOUTUBE MODAL ENGINE --- */
let player;
const VIDEO_ID = 'Rz5RM_D_XeI';

window.onYouTubeIframeAPIReady = () => {
  const shown = localStorage.getItem('video_shown_v5');
  if (!shown) openVideo();
};

function openVideo() {
  if (!elements.videoModal) return;
  elements.videoModal.style.display = 'flex';
  player = new YT.Player('intro-player', {
    videoId: VIDEO_ID,
    playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
    events: { onStateChange: (e) => { if (e.data === 0) closeVideo(); } }
  });
}

function closeVideo() {
  player?.destroy();
  if (elements.videoModal) elements.videoModal.style.display = 'none';
  localStorage.setItem('video_shown_v5', '1');
}

qs('#video-close')?.addEventListener('click', closeVideo);

/* --- 7. FULL JS CONTACT ICON --- */
const injectContactIcon = () => {
  // Create Style
  const style = document.createElement('style');
  style.textContent = `
    .contact-btn-js {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      color: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin: 8px;
      cursor: pointer;
    }
    .contact-btn-js:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 15px rgba(0,0,0,0.3);
    }
  `;
  document.head.appendChild(style);

  // Create Element
  const contactBtn = document.createElement('a');
  contactBtn.href = 'https://sirsnoopy.pages.dev/contact';
  contactBtn.className = 'contact-btn-js';
  contactBtn.target = '_blank';
  contactBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `;

  elements.socialContainer?.appendChild(contactBtn);
};

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
  type();
  fetchWeather();
  injectContactIcon(); // Injecting the new contact button
  
  setInterval(() => {
    if(elements.time) {
      elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }, 1000);
});

// ESC Key management
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    toggleContext(false);
    closeVideo();
  }
});
