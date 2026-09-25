/* FIZZ — animação por scroll
   Canvas sticky desenha 36 frames transparentes (3 conjuntos de 12) sobre fundos CSS.
   O scroll é suavizado com interpolação e requestAnimationFrame; nunca é bloqueado. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Revelações ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Pinceladas (decorativas) ---------- */
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const dabGroups = $$('[data-dabs]').map((box) => {
    const rand = rng(Number(box.dataset.seed) || 1);
    const n = Number(box.dataset.dabs) || 12;
    const items = [];
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = 'dab';
      const size = 14 + rand() * 40;
      d.style.cssText = `left:${(rand() * 100).toFixed(2)}%;top:${(rand() * 100).toFixed(2)}%;` +
        `--s:${size.toFixed(1)}px;--r:${(-50 + rand() * 30).toFixed(1)}deg;opacity:${(0.55 + rand() * 0.45).toFixed(2)}`;
      box.appendChild(d);
      items.push({ el: d, speed: 0.15 + rand() * 0.55 });
    }
    return { box, items };
  });

  /* ---------- Topbar ---------- */
  const topbar = $('.topbar');

  /* ---------- Palco ---------- */
  const stage = $('.stage');
  const sticky = $('.stage__sticky');
  const canvas = $('.stage__canvas');
  const ctx = canvas.getContext('2d');
  const plinths = $('.plinths');
  const heroEl = $('#inicio');
  const saborEl = $('#sabor');
  const gamaEl = $('#gama');
  const heroWord = $('.hero__word');
  const marquees = $$('[data-marquee]').map((el) => ({ el, track: $('.marquee__track', el) }));

  const FRAME_W = 1600, FRAME_H = 900, TOTAL = 36, PER_SET = 12;
  const frameSrc = (i) => `assets/frames/fizz_${String(i + 1).padStart(3, '0')}.webp`;
  const frames = new Array(TOTAL);

  // Caixa (em px do frame) que envolve os produtos de cada conjunto
  const SETS = [
    { bb: [726, 113, 1275, 806] },   // 1–12  Limão + Cola
    { bb: [674, 81, 1486, 831] },    // 13–24 Laranja
    { bb: [340, 124, 1306, 787] },   // 25–36 Gama
  ];
  // Onde colocar cada conjunto no ecrã (fracções do viewport)
  const PLACE = {
    wide: [
      { cx: 0.5,  cy: 0.53, h: 0.76, w: 0.62 },
      { cx: 0.6,  cy: 0.54, h: 0.8,  w: 0.66 },
      { cx: 0.5,  cy: 0.6,  h: 0.52, w: 0.78 },
    ],
    narrow: [
      { cx: 0.5,  cy: 0.44, h: 0.44, w: 0.9 },
      { cx: 0.52, cy: 0.54, h: 0.46, w: 1.0 },
      { cx: 0.5,  cy: 0.53, h: 0.32, w: 0.9 },
    ],
  };

  let vw = 0, vh = 0, dpr = 1, narrow = false;
  let heroTop = 0, heroH = 0, saborTop = 0, saborH = 0, gamaTop = 0, gamaH = 0;
  let current = window.scrollY, target = window.scrollY;
  let introStart = 0, ready = false, running = false;

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const done = () => { frames[i] = img; resolve(); };
        img.decode ? img.decode().then(done, done) : done();
      };
      img.onerror = () => resolve();
      img.src = frameSrc(i);
    });
  }
  function nearestFrame(i) {
    for (let d = 0; d < TOTAL; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function measure() {
    vw = sticky.clientWidth || window.innerWidth;
    vh = sticky.clientHeight || window.innerHeight;
    narrow = vw / vh < 0.9 || vw < 760;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    const y = window.scrollY;
    const top = (el) => el.getBoundingClientRect().top + y;
    heroTop = top(heroEl); heroH = heroEl.offsetHeight;
    saborTop = top(saborEl); saborH = saborEl.offsetHeight;
    gamaTop = top(gamaEl); gamaH = gamaEl.offsetHeight;
    requestTick();
  }

  // Calcula as camadas a desenhar para uma posição de scroll
  function layers(s, t) {
    const out = [];
    const pinA = Math.max(1, heroH - vh);
    const fA = clamp((s - heroTop) / pinA) * (PER_SET - 1);
    const fB = clamp((s - saborTop + vh * 0.1) / Math.max(1, saborH - vh * 0.9)) * (PER_SET - 1);
    const fC = clamp((s - gamaTop) / Math.max(1, (gamaH - vh) * 0.82)) * (PER_SET - 1);

    // transições entre secções (a onda sobe, as garrafas atravessam-na)
    const tAB = clamp((s - (saborTop - vh * 0.8)) / (vh * 0.85));
    const tBC = clamp((s - (gamaTop - vh * 0.8)) / (vh * 0.85));

    // intro: garrafas caem do topo
    const k = introStart ? easeOut(clamp((t - introStart) / 1500)) : 0;
    const bob = Math.sin(t / 900);
    const bob2 = Math.sin(t / 1300 + 1.3);

    // A — hero
    const aAlpha = (1 - smooth(clamp((tAB - 0.35) / 0.5))) * clamp(k * 2.5);
    if (aAlpha > 0.01) {
      const p = fA / (PER_SET - 1);
      out.push({
        set: 0, f: fA, alpha: aAlpha,
        dx: 0,
        dy: -easeInOut(tAB) * vh * 0.6 - p * vh * 0.03 + bob * vh * 0.01 * (1 - tAB) - (1 - k) * vh * 0.95,
        rot: -tAB * 12 + bob2 * 1.4 * (1 - tAB) - (1 - k) * 16,
        scale: 1 + p * 0.05 - tAB * 0.08,
      });
    }

    // B — editorial (Laranja)
    const bIn = smooth(clamp((tAB - 0.28) / 0.55));
    const bOut = 1 - smooth(clamp((tBC - 0.35) / 0.5));
    const bAlpha = bIn * bOut;
    if (bAlpha > 0.01) {
      out.push({
        set: 1, f: fB, alpha: bAlpha,
        dx: 0,
        dy: (1 - easeOut(tAB)) * vh * 0.65 - easeInOut(tBC) * vh * 0.6 + bob * vh * 0.008,
        rot: (1 - tAB) * 14 - tBC * 10 + bob2 * 1.1,
        scale: 1 - tBC * 0.06,
      });
    }

    // C — gama
    const cAlpha = smooth(clamp((tBC - 0.28) / 0.55));
    if (cAlpha > 0.01) {
      const settle = clamp(fC / (PER_SET - 1));
      out.push({
        set: 2, f: fC, alpha: cAlpha,
        dx: 0,
        dy: (1 - easeOut(tBC)) * vh * 0.6 + bob * vh * 0.008 * (1 - settle),
        rot: (1 - tBC) * 10,
        scale: 1,
        plinth: smooth(clamp((fC - 5.5) / 4.5)),
      });
    }
    return out;
  }

  function placement(layer) {
    const set = SETS[layer.set];
    const pl = (narrow ? PLACE.narrow : PLACE.wide)[layer.set];
    const [x0, y0, x1, y1] = set.bb;
    const bw = x1 - x0, bh = y1 - y0;
    const sc = Math.min((pl.h * vh) / bh, (pl.w * vw) / bw) * layer.scale;
    return {
      sc,
      cx: pl.cx * vw + layer.dx,
      cy: pl.cy * vh + layer.dy,
      bcx: (x0 + x1) / 2,
      bcy: (y0 + y1) / 2,
    };
  }

  function draw(s, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let plinthState = null;

    for (const layer of layers(s, t)) {
      const base = layer.set * PER_SET;
      const i = Math.floor(layer.f);
      const frac = layer.f - i;
      const a = nearestFrame(base + i);
      const b = frac > 0.01 && i + 1 < PER_SET ? nearestFrame(base + i + 1) : null;
      const p = placement(layer);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(p.cx, p.cy);
      ctx.rotate((layer.rot * Math.PI) / 180);
      ctx.scale(p.sc, p.sc);
      ctx.translate(-p.bcx, -p.bcy);
      // mistura curta entre frames vizinhos: evita "fantasmas" quando o produto se desloca
      const m = b && b !== a ? smooth(clamp((frac - 0.3) / 0.4)) : 0;
      const [under, over, overA] = m < 0.5 ? [a, b, m * 2] : [b, a, (1 - m) * 2];
      if (under) { ctx.globalAlpha = layer.alpha; ctx.drawImage(under, 0, 0, FRAME_W, FRAME_H); }
      if (over && overA > 0.01) { ctx.globalAlpha = layer.alpha * overA; ctx.drawImage(over, 0, 0, FRAME_W, FRAME_H); }
      ctx.globalAlpha = 1;

      if (layer.set === 2) plinthState = { p, layer };
    }

    // Pedestais: mesma transformação do conjunto C (sem rotação)
    if (plinthState && plinthState.layer.plinth > 0.001) {
      const { p, layer } = plinthState;
      const x = p.cx - p.bcx * p.sc;
      const y = p.cy - p.bcy * p.sc;
      plinths.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${p.sc.toFixed(4)})`;
      plinths.style.opacity = (layer.alpha * layer.plinth).toFixed(3);
      plinths.style.setProperty('--rise', (1 - easeOut(layer.plinth)).toFixed(3));
    } else {
      plinths.style.opacity = '0';
    }
  }

  function updateDom(s) {
    // palavra do hero desliza ligeiramente
    if (heroWord) {
      const p = clamp((s - heroTop) / Math.max(1, heroH - vh * 0.3));
      heroWord.style.setProperty('--wx', `${(-p * vw * 0.14).toFixed(1)}px`);
    }
    // marquee horizontal ligado ao scroll
    for (const m of marquees) {
      const r = m.el.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height));
      const w = m.track.scrollWidth;
      const x = lerp(vw * 0.25, -(w * 0.5) + vw * 0.1, p);
      m.track.style.setProperty('--mx', `${x.toFixed(1)}px`);
    }
    // pinceladas em parallax
    for (const g of dabGroups) {
      const r = g.box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const rel = -r.top;
      for (const d of g.items) d.el.style.setProperty('--py', `${(rel * d.speed * -0.6).toFixed(1)}px`);
    }
    // topbar
    topbar.classList.toggle('is-visible', s > saborTop - vh * 0.25);
  }

  let rafId = 0;
  function tick(now) {
    rafId = 0;
    target = window.scrollY;
    const diff = target - current;
    current = Math.abs(diff) < 0.3 ? target : current + diff * 0.14;

    if (!reduceMotion.matches) {
      if (ready) draw(current, now);
      updateDom(current);
    } else {
      topbar.classList.toggle('is-visible', target > saborTop - vh * 0.25);
    }

    // continua enquanto há movimento: scroll a assentar, intro ou flutuação do hero/editorial
    const floating = ready && !reduceMotion.matches && current < gamaTop + vh * 0.5;
    const intro = introStart && now - introStart < 1600;
    if (Math.abs(target - current) > 0.3 || floating || intro) requestTick();
    else running = false;
  }
  function requestTick() {
    if (!rafId) { running = true; rafId = requestAnimationFrame(tick); }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('orientationchange', () => setTimeout(measure, 250));
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body);
  reduceMotion.addEventListener?.('change', () => { measure(); requestTick(); });
  document.fonts?.ready.then(measure);

  // Âncoras: deslocação suave nativa (sem prender o scroll)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      // na gama, parar quando os pedestais já estão montados
      const extra = id === '#gama' && !reduceMotion.matches ? el.offsetHeight - window.innerHeight : 0;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + extra * 0.9,
        behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  measure();

  /* ---------- Carregamento: 12 primeiros, depois o resto progressivamente ---------- */
  const first = [];
  for (let i = 0; i < PER_SET; i++) first.push(loadFrame(i));
  Promise.all(first).then(() => {
    ready = true;
    root.classList.add('is-ready');
    introStart = performance.now();
    requestTick();
    // restantes em pequenos lotes
    let next = PER_SET;
    const batch = () => {
      if (next >= TOTAL) return;
      const jobs = [];
      for (let j = 0; j < 4 && next < TOTAL; j++, next++) jobs.push(loadFrame(next));
      Promise.all(jobs).then(() => { requestTick(); batch(); });
    };
    batch();
  });

  // Se as imagens demorarem, mostrar o texto na mesma
  setTimeout(() => root.classList.add('is-ready'), 2500);
  if (stage && reduceMotion.matches) root.classList.add('is-ready');
})();
