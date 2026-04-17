/* ═══════════════════════════════════════════════════════════
   MEEZAN — script.js  |  All landing page interactivity
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. CUSTOM CURSOR ──────────────────────────────────── */
(function () {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mx = -100, my = -100, tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animTrail() {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();
})();

/* ── 2. NAV — SCROLL EFFECT + ACTIVE LINKS ────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active nav links on scroll
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ── 3. HAMBURGER MENU ─────────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });
})();

/* ── 4. PARTICLE CANVAS ────────────────────────────────── */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.4 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.45 + 0.1);
      this.life    = 0;
      this.maxLife = Math.random() * 220 + 80;
      this.gold    = Math.random() > 0.45;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.y < -5) this.reset(false);
    }
    draw() {
      const t = this.life / this.maxLife;
      const opacity = Math.sin(t * Math.PI) * 0.55;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.gold
        ? `rgba(212,160,23,${opacity})`
        : `rgba(26,188,156,${opacity})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = Math.min(90, Math.floor(W * H / 11000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); resize(); tick(); });
  ro.observe(canvas.parentElement || document.body);
  resize(); tick();
})();

/* ── 5. SCROLL REVEAL (IntersectionObserver) ───────────── */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('revealed'), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.1 });

  els.forEach(el => io.observe(el));
})();

/* ── 6. HERO STATS COUNTER ─────────────────────────────── */
(function () {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const step   = 16;
      const inc    = target / (dur / step);
      let   cur    = 0;

      const id = setInterval(() => {
        cur += inc;
        if (cur >= target) { cur = target; clearInterval(id); }
        el.textContent = (target % 1 !== 0 ? cur.toFixed(1) : Math.floor(cur)) + suffix;
      }, step);

      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
})();

/* ── 7. DASHBOARD SCALE ANIMATION ─────────────────────── */
(function () {
  const panL = document.getElementById('pan-l');
  const panR = document.getElementById('pan-r');
  if (!panL || !panR) return;

  let side = 0;
  setInterval(() => {
    side = 1 - side;
    panL.style.transform = side ? 'translateY(16px)' : 'translateY(0)';
    panR.style.transform = side ? 'translateY(-12px)' : 'translateY(-8px)';
    panL.style.transition = 'transform .85s cubic-bezier(.4,0,.2,1)';
    panR.style.transition = 'transform .85s cubic-bezier(.4,0,.2,1)';
  }, 2800);
})();

/* ── 8. SIDEBAR ITEM CLICK IN MOCKUP ───────────────────── */
(function () {
  document.querySelectorAll('.msb-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.msb-item').forEach(i => i.classList.remove('msb-active'));
      item.classList.add('msb-active');
    });
  });
})();

/* ── 9. THEME CARDS ────────────────────────────────────── */
(function () {
  const cards = document.querySelectorAll('.theme-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('tc-active'));
      card.classList.add('tc-active');
    });
  });
})();

/* ── 10. FAQ ACCORDION ─────────────────────────────────── */
(function () {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  faqList.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;

    const item     = btn.closest('.faq-item');
    const answer   = item.querySelector('.faq-a');
    const isOpen   = btn.classList.contains('open');

    // Close all
    faqList.querySelectorAll('.faq-q.open').forEach(q => {
      q.classList.remove('open');
      q.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
    });

    // Open clicked unless already open
    if (!isOpen) {
      btn.classList.add('open');
      answer.classList.add('open');
    }
  });
})();

/* ── 11. VIDEO DEMO MODAL ──────────────────────────────── */
(function () {
  const overlay  = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  if (!overlay || !closeBtn) return;

  // Open on "Watch Demo" ghost button
  document.querySelectorAll('.btn-ghost').forEach(btn => {
    if (btn.textContent.trim().includes('Watch Demo')) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
  });

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

/* ── 12. SMOOTH SCROLL (anchor links) ─────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href');
      if (id === '#') return;
      const el  = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY
                  - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10)
                  - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── 13. GEOMETRIC PATTERN CANVAS ─────────────────────── */
(function () {
  const wrap = document.getElementById('geo-pattern');
  if (!wrap) return;
  // Subtle SVG-based animated Islamic star pattern via CSS already applied
  // Add a subtle slow-rotation CSS animation
  wrap.style.animation = 'geoSpin 80s linear infinite';
  const style = document.createElement('style');
  style.textContent = `@keyframes geoSpin { from{background-position:0 0} to{background-position:80px 80px} }`;
  document.head.appendChild(style);
})();

/* ── 14. SCREENS — pages pill hover state ──────────────── */
(function () {
  const pills = document.querySelectorAll('.sp-pills span');
  pills.forEach((pill, i) => {
    pill.style.animationDelay = `${i * 40}ms`;
  });
})();

/* ── 15. FOOTER YEAR ───────────────────────────────────── */
(function () {
  const fb = document.querySelector('.footer-bottom div');
  if (fb) {
    const y = new Date().getFullYear();
    fb.textContent = fb.textContent.replace('2026', y);
  }
})();

console.log('%c⚖️ MEEZAN — ميزان', 'font-family:serif;font-size:22px;color:#d4a017;');
console.log('%cBuilt by Akif Nehal · https://akif-nehal-portfolio.vercel.app/', 'color:#9aa4af;font-size:12px');
