const $ = s => document.querySelector(s);

const CONFIG = {
  // Weather.gov requires a User-Agent header or it will block the request
  weatherURL: "https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly",
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"]
};

function start() {
  const el = {
    card: $("#tilt-card"),
    container: $("#tilt-container"),
    typewriter: $("#typewriter"),
    socialRow: $(".social-row"),
    time: $("#time"),
    temp: $("#temp"),
    cond: $("#cond"),
    glow: $("#glow")
  };

  // --- 1. Weather Logic ---
  // Added User-Agent header to prevent 403 Forbidden errors
  function weather() {
    fetch(CONFIG.weatherURL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (ProfilePage)' }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const cur = data?.properties?.periods?.[0];
        if (el.temp) el.temp.textContent = cur ? `${cur.temperature}°F` : "72°F";
        if (el.cond) el.cond.textContent = cur ? cur.shortForecast : "Clear";
      })
      .catch(() => {
        if (el.temp) el.temp.textContent = "72°F";
        if (el.cond) el.cond.textContent = "Clear";
      });
  }

  // --- 2. Typewriter Logic ---
  let p = 0, c = 0, isDeleting = false;

  function type() {
    if (!el.typewriter) return;
    const phrase = CONFIG.phrases[p] || "";

    if (!isDeleting) {
      c++;
      el.typewriter.textContent = phrase.slice(0, c);
      if (c === phrase.length) {
        isDeleting = true;
        setTimeout(type, 2000); 
        return;
      }
      setTimeout(type, 90);
    } else {
      c--;
      el.typewriter.textContent = phrase.slice(0, c);
      if (c === 0) {
        isDeleting = false;
        p = (p + 1) % CONFIG.phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 45);
    }
  }

  // --- 3. Socials Logic ---
  // Updated to modern FontAwesome 6 classes (fa-brands)
  function socials() {
    if (!el.socialRow) return;

    const links = [
      { icon: "fa-brands fa-github", url: "https://github.com/code-andrewy", tip: "GitHub" },
      { icon: "fa-brands fa-youtube", url: "https://www.youtube.com/@SirSnoopsiee", tip: "YouTube" },
      { icon: "fa-brands fa-discord", url: "https://discord.com/users/1478125540828385350", tip: "Discord" }
    ];

    el.socialRow.innerHTML = links.map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="social-btn" aria-label="${l.tip}">
        <i class="${l.icon}"></i>
      </a>`
    ).join("");
  }

  // --- 4. Clock Logic ---
  function clock() {
    if (el.time) {
      el.time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  // --- 5. Tilt & Glow Logic ---
  
  el.container?.addEventListener("pointermove", e => {
    if (!el.card || window.innerWidth <= 768) return;

    const r = el.card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    // Set mouse position for the CSS radial-gradient glow
    el.glow?.style.setProperty("--mouse-x", `${(x / r.width) * 100}%`);
    el.glow?.style.setProperty("--mouse-y", `${(y / r.height) * 100}%`);

    // Natural tilt: centers at 0, rotates ~15deg at edges
    const centerX = r.width / 2;
    const centerY = r.height / 2;
    const rotateX = (centerY - y) / 15; 
    const rotateY = (x - centerX) / 15;

    el.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  el.container?.addEventListener("pointerleave", () => {
    if (el.card) el.card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });

  // Initialization
  clock();
  setInterval(clock, 1000);
  type();
  weather();
  socials();
}

document.addEventListener("DOMContentLoaded", start);
