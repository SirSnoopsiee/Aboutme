const $ = s => document.querySelector(s);

const CONFIG = {
  // Using coordinates for your general area
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

  // --- Panic Key Redirect ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "`") {
      window.location.href = "https://classroom.google.com";
    }
  });

  // --- Social Icons Injection ---
  function socials() {
    if (!el.socialRow) return;
    
    // The "id" here matches your CSS classes (.youtube, .github, .contact) exactly
    const links = [
      { id: "youtube", icon: "fa-brands fa-youtube", url: "https://www.youtube.com/@SirSnoopsiee", label: "YouTube" },
      { id: "github", icon: "fa-brands fa-github", url: "https://github.com/code-andrewy", label: "GitHub" },
      { id: "contact", icon: "fa-solid fa-envelope", url: "https://sirsnoopy.pages.dev/contact", label: "Contact" }
    ];

    el.socialRow.innerHTML = links.map(l => `
      <a href="${l.url}" target="_blank" class="social-btn ${l.id}" data-tooltip="${l.label}">
        <i class="${l.icon}"></i>
      </a>
    `).join("");
  }

  // --- Weather API ---
  function weather() {
    fetch(CONFIG.weatherURL, { headers: { 'User-Agent': 'Sirsnoopy-Portfolio/1.0' } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const cur = data?.properties?.periods?.[0];
        if (el.temp) el.temp.textContent = cur ? `${cur.temperature}°F` : "55°F";
        if (el.cond) el.cond.textContent = cur ? cur.shortForecast : "Clear";
      })
      .catch(() => {
        if (el.temp) el.temp.textContent = "55°F";
        if (el.cond) el.cond.textContent = "Clear";
      });
  }

  // --- Typewriter Logic ---
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

  // --- Digital Clock ---
  function clock() {
    if (el.time) {
      el.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  // --- 3D Hover & Glow Effect ---
  el.container?.addEventListener("mousemove", e => {
    if (!el.card || window.innerWidth <= 768) return;

    const r = el.card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    
    el.glow?.style.setProperty("--mouse-x", `${(x / r.width) * 100}%`);
    el.glow?.style.setProperty("--mouse-y", `${(y / r.height) * 100}%`);

    const rx = (r.height / 2 - y) / 20;
    const ry = (x - r.width / 2) / 20;
    el.card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  el.container?.addEventListener("mouseleave", () => {
    if (el.card) el.card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
  });

  // Start everything up
  socials();
  weather();
  clock();
  setInterval(clock, 1000);
  type();
}

document.addEventListener("DOMContentLoaded", start);
