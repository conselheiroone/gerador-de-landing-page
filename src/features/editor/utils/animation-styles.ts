/**
 * Sistema de animacoes para preview e export.
 *
 * REGRA: A <section> NUNCA perde opacity.
 * Backgrounds, overlays e imagens de fundo ficam sempre visiveis.
 * Apenas os filhos de conteudo (nao overlays) sao animados via
 * .lp-child-ready (opacity:0) -> .lp-child-visible (opacity:1).
 * Sem JavaScript, tudo fica visivel — sem quebra de layout.
 */

// ─── CSS keyframes + classes ─────────────────────────────────────

export const ANIMATION_CSS = `
/* ── Keyframes ─────────────────────────────────────────── */
@keyframes lp-fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lp-fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes lp-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
@keyframes lp-countPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* ── Hero entry: fadeInUp staggered nos filhos do hero ────────── */
.lp-hero-child {
  opacity: 0;
  animation: lp-fadeInUp 0.6s ease forwards;
}
.lp-hero-child-right {
  opacity: 0;
  animation: lp-fadeInRight 0.8s ease 0.3s forwards;
}
.lp-hero-float {
  animation: lp-float 3s ease-in-out infinite;
}

/* ── Scroll-triggered: anima FILHOS de conteudo, nao a section ── */
/* A section nunca perde opacity — background/overlay ficam intactos */
.lp-child-ready {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.lp-child-ready.lp-child-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Counter done pulse ────────────────────────────────── */
.lp-counter-done {
  animation: lp-countPulse 0.4s ease;
}

/* ── Hover effects para cards (export) ─────────────────── */
/* REGRA: primeira section (hero) NAO recebe hover effects */
section:not(:first-of-type) > div > div[style*="border-radius"][style*="box-shadow"],
section:not(:first-of-type) > div > div > div[style*="border-radius"][style*="box-shadow"],
section:not(:first-of-type) div[style*="border-top:"][style*="border-radius"] {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
section:not(:first-of-type) > div > div[style*="border-radius"][style*="box-shadow"]:hover,
section:not(:first-of-type) > div > div > div[style*="border-radius"][style*="box-shadow"]:hover,
section:not(:first-of-type) div[style*="border-top:"][style*="border-radius"]:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
}

/* ── Button hover (exceto hero) ──────────────────────────── */
section:not(:first-of-type) a[style*="border-radius"]:hover,
section:not(:first-of-type) button[style*="border-radius"]:hover {
  filter: brightness(1.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

/* ── Reduced motion ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .lp-child-ready { opacity: 1; transform: none; transition: none; }
  .lp-hero-child, .lp-hero-child-right { opacity: 1; animation: none; }
  .lp-hero-float { animation: none; }
  .lp-counter-done { animation: none; }
}

/* ── Features grid — primeiro filho (cabeçalho) sempre full-width ── */
.lp-features-inner > :first-child { grid-column: 1 / -1; }

/* ── Footer grid — últimos 2 filhos (Divider + Rodapé Inferior) sempre full-width ── */
.lp-footer-grid > :nth-last-child(-n+2) { grid-column: 1 / -1; }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE — Media Queries para export HTML
   Classes aplicadas pelos render functions do export-html.ts
   Usa !important para sobrescrever inline styles
   ══════════════════════════════════════════════════════════ */

/* ── Tablet (≤ 768px) ─────────────────────────────────── */
@media (max-width: 768px) {
  /* Containers row → empilham vertical (EXCETO hero) */
  .lp-row {
    flex-direction: column !important;
  }
  .lp-row > * {
    width: 100% !important;
    max-width: 100% !important;
    flex: 1 1 auto !important;
  }

  /* HERO: mantém lado a lado no tablet */
  /* ③ Rows DENTRO do hero: mantêm row (features, contato, etc.) */
  .lp-hero .lp-row {
    flex-direction: row !important;
    flex-wrap: wrap !important;
  }
  /* ④ Reset filhos de rows do hero para comportamento natural */
  .lp-hero .lp-row > * {
    width: auto !important;
    max-width: none !important;
    flex: 0 1 auto !important;
    height: auto !important;
  }
  /* ⑤ Colunas do HERO GRID: flex-basis para layout 2 colunas */
  .lp-hero > div > .lp-row {
    gap: 20px !important;
  }
  .lp-hero > div > .lp-row > * {
    flex: 1 1 240px !important;
    min-width: 0 !important;
  }

  /* Hero → min-height flexível */
  .lp-hero {
    height: auto !important;
    min-height: 60vh !important;
  }

  /* Hero: títulos grandes reduzem no tablet */
  .lp-hero h1 {
    font-size: clamp(28px, 5vw, 42px) !important;
  }
  .lp-hero h2 {
    font-size: clamp(24px, 4vw, 36px) !important;
  }

  /* Columns component → empilha */
  .lp-cols {
    flex-direction: column !important;
  }
  .lp-cols > * {
    flex: 1 1 auto !important;
    width: 100% !important;
  }

  /* Features grid → 2 colunas em tablet */
  .lp-features-inner {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Footer grid → single column em mobile */
  .lp-footer-grid {
    grid-template-columns: 1fr !important;
  }

  /* Stats band grid → 2 colunas */
  .lp-stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Segments grid → 2 colunas */
  .lp-segments-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Image gallery → 2 colunas */
  .lp-gallery-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Logo grid → 3 colunas */
  .lp-logo-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  /* Frame decorativo absoluto — esconde em tablet */
  .lp-row [style*="position: absolute"][style*="border:3px"],
  .lp-row [style*="position:absolute"][style*="border:3px"],
  .lp-row [style*="position: absolute"][style*="border: 3px"],
  .lp-row [style*="position:absolute"][style*="border: 3px"] {
    display: none !important;
  }

  /* Imagens grandes no export → limita altura */
  .lp-row img[style*="height:690"],
  .lp-row img[style*="height: 690"],
  .lp-row img[style*="height:600"],
  .lp-row img[style*="height: 600"] {
    max-height: 55vh !important;
    height: auto !important;
    object-fit: contain !important;
  }
  .lp-row div[style*="height:690"],
  .lp-row div[style*="height: 690"],
  .lp-row div[style*="height:600"],
  .lp-row div[style*="height: 600"] {
    height: auto !important;
  }

  /* Navbar: melhor espaçamento */
  nav .lp-nav-inner {
    flex-direction: column !important;
    gap: 12px !important;
  }
  nav .lp-nav-links {
    justify-content: center !important;
    gap: 12px !important;
  }
}

/* ── Mobile (≤ 480px) ─────────────────────────────────── */
@media (max-width: 480px) {
  /* Mobile: hero também empilha */
  .lp-hero .lp-row {
    flex-direction: column !important;
  }
  .lp-hero .lp-row > * {
    width: 100% !important;
    max-width: 100% !important;
    flex: 1 1 auto !important;
  }
  .lp-hero > div > .lp-row > * {
    flex: 1 1 auto !important;
  }

  /* Imagens grandes → limita mais no mobile */
  .lp-row img[style*="height:690"],
  .lp-row img[style*="height: 690"],
  .lp-row img[style*="height:600"],
  .lp-row img[style*="height: 600"] {
    max-height: 40vh !important;
  }

  /* Cards flutuantes → relativos (só no mobile) */
  [style*="position: absolute"][style*="backdrop-filter"],
  [style*="position:absolute"][style*="backdrop-filter"] {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    transform: none !important;
    margin: 8px auto !important;
  }

  /* Features grid → 1 coluna */
  .lp-features-inner {
    grid-template-columns: 1fr !important;
  }

  /* Stats band → 1 coluna */
  .lp-stats-grid {
    grid-template-columns: 1fr !important;
  }

  /* Segments grid → 1 coluna */
  .lp-segments-grid {
    grid-template-columns: 1fr !important;
  }

  /* Image gallery → 1 coluna */
  .lp-gallery-grid {
    grid-template-columns: 1fr !important;
  }

  /* Logo grid → 2 colunas */
  .lp-logo-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Navbar: empilha completamente */
  nav {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}
`

// ─── JS para export HTML (vanilla) ──────────────────────────────

export const ANIMATION_JS = `
(function(){
  /* ── Hero entry animation ─────── */
  /* Referencia: textos = fadeInUp, imagem = fadeInRight, cards = float (ja inline) */
  var allSections = document.querySelectorAll('section.lp-animate');
  if (allSections.length > 0) {
    var hero = allSections[0];
    var contentWrapper = null;
    Array.from(hero.children).forEach(function(child) {
      var s = child.style;
      if (s && s.zIndex === '1' && s.pointerEvents !== 'none' && !(s.position === 'absolute' && s.inset === '0')) {
        contentWrapper = child;
      }
    });
    if (contentWrapper) {
      /* Detecta hero grid (flex-direction: row) = hero split */
      var heroGrid = null;
      Array.from(contentWrapper.children).forEach(function(child) {
        if (child.style && child.style.flexDirection === 'row') heroGrid = child;
      });
      if (heroGrid && heroGrid.children.length >= 2) {
        var cols = Array.from(heroGrid.children);
        cols.forEach(function(col, i) {
          if (i === cols.length - 1) {
            col.classList.add('lp-hero-child-right');
          } else {
            col.classList.add('lp-hero-child');
            col.style.animationDelay = (i * 0.1) + 's';
          }
        });
      } else {
        var delay = 0;
        Array.from(contentWrapper.children).forEach(function(child) {
          child.classList.add('lp-hero-child');
          child.style.animationDelay = delay + 's';
          delay += 0.1;
        });
      }
    }
  }

  /* ── Scroll fade-in (anima filhos, nao a section) ──── */
  /* REGRA: primeira section (hero) nao recebe animacao de scroll */
  var sections = Array.prototype.slice.call(allSections, 1);
  if (sections.length && 'IntersectionObserver' in window) {
    /* Marca filhos de conteudo (nao overlays) como hidden */
    sections.forEach(function(sec) {
      Array.from(sec.children).forEach(function(child) {
        var s = child.style;
        if (s.pointerEvents === 'none' || (s.position === 'absolute' && s.inset === '0')) return;
        child.classList.add('lp-child-ready');
      });
    });

    /* Observa sections para revelar filhos ao scroll */
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        var delay = 0;
        Array.from(e.target.children).forEach(function(child) {
          if (!child.classList.contains('lp-child-ready')) return;
          setTimeout(function() { child.classList.add('lp-child-visible'); }, delay);
          delay += 100;
        });
      });
    }, { threshold: 0.08 });
    sections.forEach(function(s) { obs.observe(s); });
  }

  /* ── Counter animation ──────────────────────────────── */
  var counters = document.querySelectorAll('[data-lp-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cobs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        cobs.unobserve(e.target);
        var raw = e.target.getAttribute('data-lp-counter') || '';
        var match = raw.match(/^([\\d.]+)(.*)$/);
        if (!match) return;
        var target = parseFloat(match[1]);
        var suffix = match[2];
        var isFloat = raw.includes('.');
        var duration = 2000;
        var start = performance.now();
        function step(now) {
          var t = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          var current = eased * target;
          e.target.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
          if (t < 1) requestAnimationFrame(step);
          else e.target.classList.add('lp-counter-done');
        }
        e.target.textContent = '0' + suffix;
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });
    counters.forEach(function(c) { cobs.observe(c); });
  }
})();
`
