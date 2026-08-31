const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export class DepthCarousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.items = options.items || [];
        this.count = this.items.length;
        
        this.cfg = {
            cardWidth: options.cardWidth || 300,
            cardHeight: options.cardHeight || 380,
            radius: options.radius || 18,
            tint: options.tint || '#05060a',
            depth: options.depth || 220,
            spread: options.spread || 90,
            tilt: options.tilt || 22,
            tiltDirection: options.tiltDirection || 'right',
            perspective: options.perspective || 1400,
            visibleCards: options.visibleCards || 4,
            falloff: options.falloff || 0.2,
            blur: options.blur || 6,
            duration: options.duration || 700,
            ease: options.ease || 'power3.out',
            autoplay: options.autoplay || false,
            autoplayDelay: options.autoplayDelay || 3200,
            loop: options.loop !== undefined ? options.loop : true,
            showControls: options.showControls !== undefined ? options.showControls : true,
            showIndicators: options.showIndicators !== undefined ? options.showIndicators : true,
            onChange: options.onChange || null
        };
        
        this.pos = 0;
        this.focus = 0;
        this.tween = null;
        this.scale = 1;
        this.active = 0;
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.drag = null;
        this.wheelTimer = null;
        this.autoTimer = null;
        
        this.cardRefs = [];
        this.overlayRefs = [];
        this.indicatorRefs = [];
        
        this.buildDOM();
        this.setupListeners();
        this.layout(this.pos);
        
        if (this.cfg.autoplay && !this.reduced && this.count > 1) {
            this.startAutoplay();
        }
    }

    buildDOM() {
        this.container.innerHTML = '';
        this.container.classList.add('depth-carousel-container');
        this.container.style.perspective = `${this.cfg.perspective}px`;
        
        this.stage = document.createElement('div');
        this.stage.className = 'depth-carousel-stage';
        this.container.appendChild(this.stage);
        
        this.items.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'depth-carousel-card';
            card.style.width = `${this.cfg.cardWidth}px`;
            card.style.height = `${this.cfg.cardHeight}px`;
            card.style.borderRadius = `${this.cfg.radius}px`;
            card.setAttribute('aria-roledescription', 'slide');
            card.setAttribute('aria-label', `${i + 1} of ${this.count}`);
            card.setAttribute('aria-hidden', this.active !== i);
            
            card.addEventListener('click', () => this.onCardClick(i));
            
            const img = document.createElement('img');
            img.src = item.image || item;
            img.alt = item.alt || '';
            img.draggable = false;
            
            const overlay = document.createElement('span');
            overlay.className = 'depth-carousel-overlay';
            overlay.style.background = this.cfg.tint;
            
            card.appendChild(img);
            card.appendChild(overlay);
            this.stage.appendChild(card);
            
            this.cardRefs[i] = card;
            this.overlayRefs[i] = overlay;
        });
        
        if (this.cfg.showControls && this.count > 1) {
            this.prevBtn = document.createElement('button');
            this.prevBtn.className = 'depth-carousel-btn depth-carousel-prev';
            this.prevBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            this.prevBtn.addEventListener('click', () => this.navigateBy(-1));
            this.container.appendChild(this.prevBtn);
            
            this.nextBtn = document.createElement('button');
            this.nextBtn.className = 'depth-carousel-btn depth-carousel-next';
            this.nextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            this.nextBtn.addEventListener('click', () => this.navigateBy(1));
            this.container.appendChild(this.nextBtn);
        }
        
        if (this.cfg.showIndicators && this.count > 1) {
            this.indicators = document.createElement('div');
            this.indicators.className = 'depth-carousel-indicators';
            this.items.forEach((_, i) => {
                const ind = document.createElement('button');
                ind.className = 'depth-carousel-indicator';
                if (i === this.active) ind.classList.add('active');
                ind.addEventListener('click', () => this.setFocus(i, true));
                this.indicators.appendChild(ind);
                this.indicatorRefs[i] = ind;
            });
            this.container.appendChild(this.indicators);
        }
    }
    
    layout(pos) {
        const n = this.count;
        if (!n) return;
        const dir = this.cfg.tiltDirection === 'left' ? -1 : 1;
        const sc = this.scale;
        
        for (let i = 0; i < n; i++) {
            const el = this.cardRefs[i];
            if (!el) continue;
            
            let d = i - pos;
            if (this.cfg.loop && n > 1) {
                d = ((d % n) + n) % n;
                if (d > n / 2) d -= n;
            }
            
            const back = Math.max(0, d);
            const az = Math.abs(d);
            const shown = az <= this.cfg.visibleCards + 0.5;
            
            const tz = -this.cfg.depth * d;
            const tx = dir * this.cfg.spread * d;
            const ry = dir * this.cfg.tilt * clamp(d, 0, 1);
            
            let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
            if (!shown) opacity = 0;
            
            const brightness = Math.max(0.15, 1 - back * this.cfg.falloff);
            const blurPx = this.cfg.blur > 0 ? Math.min(this.cfg.blur, (back / Math.max(1, this.cfg.visibleCards)) * this.cfg.blur) : 0;
            const zi = Math.round(2000 - d * 20);
            
            el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
            el.style.opacity = opacity.toFixed(3);
            el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
            el.style.zIndex = String(zi);
            el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
            
            const ov = this.overlayRefs[i];
            if (ov) ov.style.opacity = clamp(back * this.cfg.falloff * 1.25, 0, 0.86).toFixed(3);
        }
    }
    
    notify(idx) {
        this.active = idx;
        this.cardRefs.forEach((c, i) => c.setAttribute('aria-hidden', i !== idx));
        if (this.cfg.showIndicators) {
            this.indicatorRefs.forEach((ind, i) => {
                if (i === idx) ind.classList.add('active');
                else ind.classList.remove('active');
            });
        }
        if (this.cfg.onChange) this.cfg.onChange(idx, this.items[idx]);
    }
    
    tweenTo(target, animate) {
        if (this.tween) this.tween.kill();
        const proxy = { p: this.pos };
        const dur = animate && !this.reduced ? this.cfg.duration / 1000 : 0;
        
        if (typeof gsap !== 'undefined') {
            this.tween = gsap.to(proxy, {
                p: target,
                duration: dur,
                ease: this.cfg.ease,
                onUpdate: () => {
                    this.pos = proxy.p;
                    this.layout(this.pos);
                },
                onComplete: () => {
                    if (this.count > 0) this.pos = ((this.pos % this.count) + this.count) % this.count;
                    this.layout(this.pos);
                }
            });
        } else {
            this.pos = target;
            if (this.count > 0) this.pos = ((this.pos % this.count) + this.count) % this.count;
            this.layout(this.pos);
        }
    }
    
    setFocus(rawIndex, animate = true) {
        const n = this.count;
        if (!n) return;
        const idx = this.cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
        let delta = idx - this.pos;
        if (this.cfg.loop && n > 1) {
            delta = ((delta % n) + n) % n;
            if (delta > n / 2) delta -= n;
        }
        this.tweenTo(this.pos + delta, animate);
        if (idx !== this.focus) {
            this.focus = idx;
            this.notify(idx);
        }
    }
    
    navigateBy(step) {
        this.setFocus(this.focus + step, true);
    }
    
    setupListeners() {
        this.ro = new ResizeObserver(entries => {
            const w = entries[0].contentRect.width;
            const needed = this.cfg.cardWidth + Math.abs(this.cfg.spread) * 2 + 120;
            this.scale = clamp(w / needed, 0.4, 1);
            this.layout(this.pos);
        });
        this.ro.observe(this.container);
        
        this.container.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        this.container.addEventListener('pointerdown', this.onPointerDown.bind(this));
        window.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('pointerup', this.onPointerEnd.bind(this));
        window.addEventListener('pointercancel', this.onPointerEnd.bind(this));
        this.container.addEventListener('keydown', this.onKeyDown.bind(this));
        
        this.container.tabIndex = 0;
        
        if (this.cfg.autoplay) {
            this.container.addEventListener('mouseenter', () => this.hovered = true);
            this.container.addEventListener('mouseleave', () => this.hovered = false);
            this.container.addEventListener('focusin', () => this.focused = true);
            this.container.addEventListener('focusout', () => this.focused = false);
        }
    }
    
    onWheel(e) {
        if (this.count < 2) return;
        e.preventDefault();
        if (this.tween) this.tween.kill();
        const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const delta = e.deltaMode === 1 ? raw * 24 : raw;
        const step = clamp(delta / (this.cfg.cardWidth * 0.9), -0.6, 0.6);
        this.pos += step;
        this.layout(this.pos);
        if (this.wheelTimer) clearTimeout(this.wheelTimer);
        this.wheelTimer = setTimeout(() => this.setFocus(Math.round(this.pos), true), 130);
    }
    
    onPointerDown(e) {
        if (this.count < 2) return;
        if (this.tween) this.tween.kill();
        this.drag = {
            x: e.clientX,
            startPos: this.pos,
            lastX: e.clientX,
            lastT: performance.now(),
            v: 0,
            moved: false,
            id: e.pointerId
        };
    }
    
    onPointerMove(e) {
        if (!this.drag) return;
        const stepPx = Math.max(this.cfg.cardWidth * 0.55 * this.scale, 40);
        const dx = e.clientX - this.drag.x;
        if (!this.drag.moved && Math.abs(dx) > 4) {
            this.drag.moved = true;
            try { this.container.setPointerCapture(this.drag.id); } catch (err) {}
        }
        if (!this.drag.moved) return;
        
        const now = performance.now();
        const dt = Math.max(now - this.drag.lastT, 1);
        this.drag.v = (e.clientX - this.drag.lastX) / dt;
        this.drag.lastX = e.clientX;
        this.drag.lastT = now;
        this.pos = this.drag.startPos - dx / stepPx;
        this.layout(this.pos);
    }
    
    onPointerEnd() {
        if (!this.drag) return;
        const drag = this.drag;
        this.drag = null;
        if (!drag.moved) return;
        const stepPx = Math.max(this.cfg.cardWidth * 0.55 * this.scale, 40);
        const projected = this.pos - (drag.v * 180) / stepPx;
        this.setFocus(Math.round(projected), true);
    }
    
    onKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.navigateBy(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.navigateBy(1);
        }
    }
    
    onCardClick(index) {
        if (this.drag && this.drag.moved) return;
        this.setFocus(index, true);
    }
    
    startAutoplay() {
        if (this.autoTimer) clearInterval(this.autoTimer);
        this.autoTimer = setInterval(() => {
            if (!this.hovered && !this.focused) this.navigateBy(1);
        }, Math.max(this.cfg.autoplayDelay, 600));
    }
}
