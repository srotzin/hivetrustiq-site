/* ============================================================
   HiveTrustIQ — App Logic
   ============================================================ */

// ===== Theme Toggle =====
(function () {
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  // Force dark as default per design spec
  d = 'dark';
  r.setAttribute('data-theme', d);
  updateToggleIcon();

  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
    updateToggleIcon();
  });

  function updateToggleIcon() {
    if (!t) return;
    t.innerHTML = d === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

// ===== Mobile Navigation =====
(function () {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  });

  // Close mobile nav on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  });
})();

// ===== Scroll-aware header shadow =====
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ===== Hexagonal Canvas Background =====
(function () {
  const canvas = document.getElementById('hex-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let hexagons = [];
  let animFrame;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    generateHexagons();
  }

  function generateHexagons() {
    hexagons = [];
    const size = 50;
    const hGap = size * 1.75;
    const vGap = size * 1.5;
    const cols = Math.ceil(w / hGap) + 2;
    const rows = Math.ceil(h / vGap) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const x = col * hGap + (row % 2 ? hGap / 2 : 0);
        const y = row * vGap;
        const dist = Math.sqrt((x - w * 0.4) ** 2 + (y - h * 0.35) ** 2);
        const maxDist = Math.max(w, h) * 0.7;
        const alpha = Math.max(0, 0.12 * (1 - dist / maxDist));
        if (alpha > 0.005) {
          hexagons.push({ x, y, size, alpha, phase: Math.random() * Math.PI * 2 });
        }
      }
    }
  }

  function drawHex(x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  let time = 0;
  function draw() {
    time += 0.003;
    ctx.clearRect(0, 0, w, h);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const color = isDark ? '212, 160, 48' : '176, 132, 32';

    for (const hex of hexagons) {
      const pulse = 0.6 + 0.4 * Math.sin(time + hex.phase);
      const a = hex.alpha * pulse;
      ctx.strokeStyle = `rgba(${color}, ${a})`;
      ctx.lineWidth = 0.5;
      drawHex(hex.x, hex.y, hex.size);
      ctx.stroke();
    }

    animFrame = requestAnimationFrame(draw);
  }

  resize();
  draw();

  window.addEventListener('resize', () => {
    resize();
  });

  // Clean up when navigating away
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      draw();
    }
  });
})();

// ===== Trust Score Animation =====
(function () {
  const scoreDisplay = document.getElementById('score-display');
  const scoreArc = document.getElementById('score-arc');
  if (!scoreDisplay || !scoreArc) return;

  const targetScore = 877;
  const circumference = 553; // 2 * PI * 88

  let animated = false;

  function animateScore() {
    if (animated) return;
    animated = true;

    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentScore = Math.round(targetScore * eased);
      scoreDisplay.textContent = currentScore;

      const offset = circumference - (circumference * (targetScore / 1000) * eased);
      scoreArc.setAttribute('stroke-dashoffset', offset);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // Observe when score section enters viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateScore();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const section = document.getElementById('trust-score');
  if (section) observer.observe(section);
})();

// ===== Number Count-Up Animation =====
(function () {
  const numbers = document.querySelectorAll('.number-value[data-count]');
  if (!numbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  numbers.forEach(n => observer.observe(n));
})();

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
