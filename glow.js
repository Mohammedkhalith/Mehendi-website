// Border Glow — Vanilla JS translation of React BorderGlow component
// Gold color palette matching Pwrettiehenna brand

(function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────────────────────
  function parseHSL(hslStr) {
    const m = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!m) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
  }

  function buildBoxShadow(glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const layers = [
      [0,0,0,1,100,true],[0,0,1,0,60,true],[0,0,3,0,50,true],
      [0,0,6,0,40,true],[0,0,15,0,30,true],[0,0,25,2,20,true],[0,0,50,2,10,true],
      [0,0,1,0,60,false],[0,0,3,0,50,false],[0,0,6,0,40,false],
      [0,0,15,0,30,false],[0,0,25,2,20,false],[0,0,50,2,10,false],
    ];
    return layers.map(([x,y,blur,spread,alpha,inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
    }).join(', ');
  }

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x)  { return x * x * x; }

  function animateValue({ start=0, end=100, duration=1000, delay=0, ease=easeOutCubic, onUpdate, onEnd }) {
    const t0 = performance.now() + delay;
    function tick() {
      const elapsed = performance.now() - t0;
      const t = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    }
    setTimeout(() => requestAnimationFrame(tick), delay);
  }

  const GRADIENT_POSITIONS = ['80% 55%','69% 34%','8% 6%','41% 38%','86% 85%','82% 18%','51% 4%'];
  const COLOR_MAP = [0,1,2,0,1,2,1];

  function buildMeshGradients(colors) {
    const g = [];
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      g.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
    }
    g.push(`linear-gradient(${colors[0]} 0 100%)`);
    return g;
  }

  // ── Per-card init ─────────────────────────────────────────────────────────
  function initCard(card) {
    // Skip if already initialised
    if (card.__glowInit) return;
    card.__glowInit = true;

    // Config — golden brand palette
    const edgeSensitivity = 30;
    const glowColor       = '40 70 55';   // HSL for gold glow
    const glowRadius      = 40;
    const glowIntensity   = 1.0;
    const coneSpread      = 25;
    const fillOpacity     = 0.5;
    const colors          = ['#D4A853', '#F3D084', '#A37930'];

    // Detect background colour for the border layer trick
    let bg = window.getComputedStyle(card).backgroundColor;
    if (!bg || bg === 'rgba(0, 0, 0, 0)') bg = '#1a1a1a';

    card.classList.add('glow-host');

    // Wrap existing children so they stay above glow layers
    Array.from(card.children).forEach(ch => {
      if (!ch.style.position || ch.style.position === 'static') {
        ch.style.position = 'relative';
      }
      ch.style.zIndex = '2';
    });

    const meshGrads  = buildMeshGradients(colors);
    const borderBg   = meshGrads.map(g => `${g} border-box`).join(', ');
    const fillBg     = meshGrads.map(g => `${g} padding-box`).join(', ');
    const boxShadow  = buildBoxShadow(glowColor, glowIntensity);

    // Layer 1 — mesh gradient border
    const borderDiv = document.createElement('div');
    borderDiv.className = 'glow-layer';
    borderDiv.style.cssText = `
      z-index: 0;
      border: 1px solid transparent;
      background: linear-gradient(${bg} 0 100%) padding-box,
                  linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box,
                  ${borderBg};
      opacity: 0;
    `;

    // Layer 2 — mesh gradient fill (soft-light near edges)
    const fillDiv = document.createElement('div');
    fillDiv.className = 'glow-layer';
    fillDiv.style.cssText = `
      z-index: 0;
      border: 1px solid transparent;
      background: ${fillBg};
      mix-blend-mode: soft-light;
      opacity: 0;
    `;

    // Layer 3 — outer glow span (negative inset)
    const outerSpan = document.createElement('span');
    outerSpan.className = 'glow-outer-span';
    outerSpan.style.cssText = `
      inset: ${-glowRadius}px;
      z-index: 0;
      mix-blend-mode: plus-lighter;
      opacity: 0;
    `;
    const innerSpan = document.createElement('span');
    innerSpan.className = 'glow-inner-span';
    innerSpan.style.inset = `${glowRadius}px`; // Match the negative inset of outerSpan so it aligns with the card edge
    innerSpan.style.boxShadow = boxShadow;
    outerSpan.appendChild(innerSpan);

    // Prepend layers so content sits on top
    card.insertBefore(outerSpan, card.firstChild);
    card.insertBefore(fillDiv,   card.firstChild);
    card.insertBefore(borderDiv, card.firstChild);

    // ── State ───────────────────────────────────────────────────────────────
    let isHovered    = false;
    let sweepActive  = false;
    let cursorAngle  = 45;
    let edgeProx     = 0;

    function getCW() { return card.getBoundingClientRect().width  / 2; }
    function getCH() { return card.getBoundingClientRect().height / 2; }

    function getEdgeProximity(x, y) {
      const cx = getCW(), cy = getCH();
      const dx = x - cx, dy = y - cy;
      let kx = Infinity, ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }

    function getCursorAngle(x, y) {
      const dx = x - getCW(), dy = y - getCH();
      if (dx === 0 && dy === 0) return 0;
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;
      return deg;
    }

    function updateVisuals() {
      const cs = edgeSensitivity + 20;
      const visible = isHovered || sweepActive;
      const borderOp = visible ? Math.max(0, (edgeProx * 100 - cs) / (100 - cs)) : 0;
      const glowOp   = visible ? Math.max(0, (edgeProx * 100 - edgeSensitivity) / (100 - edgeSensitivity)) : 0;
      const ang = `${cursorAngle.toFixed(3)}deg`;

      const visClass = visible ? 'glow-visible' : '';

      // Border layer
      borderDiv.style.opacity = borderOp;
      borderDiv.style.maskImage = `conic-gradient(from ${ang} at center, black ${coneSpread}%, transparent ${coneSpread+15}%, transparent ${100-coneSpread-15}%, black ${100-coneSpread}%)`;
      borderDiv.style.webkitMaskImage = borderDiv.style.maskImage;
      borderDiv.className = 'glow-layer ' + visClass;

      // Fill layer
      fillDiv.style.opacity = borderOp * fillOpacity;
      fillDiv.style.maskImage = [
        'linear-gradient(to bottom, black, black)',
        'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
        'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
        `conic-gradient(from ${ang} at center, transparent 5%, black 15%, black 85%, transparent 95%)`
      ].join(', ');
      fillDiv.style.webkitMaskImage = fillDiv.style.maskImage;
      fillDiv.style.maskComposite = 'subtract, add, add, add, add, add';
      fillDiv.style.webkitMaskComposite = 'source-out, source-over, source-over, source-over, source-over, source-over';
      fillDiv.className = 'glow-layer ' + visClass;

      // Outer glow
      outerSpan.style.opacity = glowOp;
      outerSpan.style.maskImage = `conic-gradient(from ${ang} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`;
      outerSpan.style.webkitMaskImage = outerSpan.style.maskImage;
      outerSpan.className = 'glow-outer-span ' + visClass;
    }

    // ── Events ──────────────────────────────────────────────────────────────
    card.addEventListener('pointerenter', () => { isHovered = true;  updateVisuals(); });
    card.addEventListener('pointerleave', () => { isHovered = false; updateVisuals(); });
    card.addEventListener('pointermove',  (e) => {
      const r = card.getBoundingClientRect();
      edgeProx    = getEdgeProximity(e.clientX - r.left, e.clientY - r.top);
      cursorAngle = getCursorAngle   (e.clientX - r.left, e.clientY - r.top);
      updateVisuals();
    });

    // ── Intro sweep animation ────────────────────────────────────────────────
    const aStart = 110, aEnd = 465;
    sweepActive  = true;
    cursorAngle  = aStart;

    animateValue({ duration: 500, onUpdate: v => { edgeProx = v / 100; updateVisuals(); } });
    animateValue({ ease: easeInCubic,  duration: 1500,           end: 50,  onUpdate: v => { cursorAngle = (aEnd-aStart)*(v/100)+aStart; updateVisuals(); } });
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => { cursorAngle = (aEnd-aStart)*(v/100)+aStart; updateVisuals(); } });
    animateValue({ ease: easeInCubic,  delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => { edgeProx = v / 100; updateVisuals(); },
      onEnd:    () => { sweepActive = false; updateVisuals(); }
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.initBorderGlow = function (selector) {
    document.querySelectorAll(selector).forEach(initCard);
  };

  // Auto-init service cards (static HTML) on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    window.initBorderGlow('.service-card, .contact-form-wrapper, .about-img-wrapper, .feature');
  });

})();
