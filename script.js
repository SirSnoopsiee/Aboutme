const $ = s => document.querySelector(s);

const CONFIG = {
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

  // 1. Weather - Added a safety net so errors don't stop the whole script
  function weather() {
    fetch(CONFIG.weatherURL, { headers: { 'User-Agent': 'SirsnoopyProfile' } })
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

  // 2. Typewriter Effect
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

  // 3. Social Icons - This is where your bug was
  // I simplified this to ensure the class matches your CSS (.social-btn.youtube, etc)
  function socials() {
    if (!el.socialRow) return;

    const links = [
      { key: "youtube", icon: "fa-brands fa-youtube", url: "https://www.youtube.com/@SirSnoopsiee", tip: "YouTube" },
      { key: "github", icon: "fa-brands fa-github", url: "https://github.com/code-andrewy", tip: "GitHub" },
      { key: "contact", icon: "fa-solid fa-envelope", url: "https://sirsnoopy.pages.dev/contact", tip: "Contact" }
    ];

    el.socialRow.innerHTML = links.map(l =>
      `<a href="${l.url}" 
          target="_blank" 
          rel="noopener" 
          class="social-btn ${l.key}" 
          data-tooltip="${l.tip}" 
          aria-label="${l.tip}">
        <i class="${l.icon}"></i>
      </a>`
    ).join("");
  }

  // 4. Clock
  function clock() {
    if (el.time) {
      el.time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  // 5. 3D Tilt & Glow
  el.container?.addEventListener("pointermove", e => {
    if (!el.card || window.innerWidth <= 768) return;

    const r = el.card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    el.glow?.style.setProperty("--mouse-x", `${(x / r.width) * 100}%`);
    el.glow?.style.setProperty("--mouse-y", `${(y / r.height) * 100}%`);

    const centerX = r.width / 2;
    const centerY = r.height / 2;
    const rotateX = (centerY - y) / 20; 
    const rotateY = (x - centerX) / 20;

    // Added perspective directly to the style
    el.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  el.container?.addEventListener("pointerleave", () => {
    if (el.card) el.card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });

  // Start all processes
  clock();
  setInterval(clock, 1000);
  type();
  weather();
  socials();
}

document.addEventListener("DOMContentLoaded", start);
