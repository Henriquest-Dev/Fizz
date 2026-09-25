/* FIZZ — animação por scroll
   Um canvas sticky desenha as garrafas (recortes limpos em assets/produtos) segundo a coreografia
   dos frames do kit: hero (Limão + Cola), oito sabores em sequência e a gama em arco.
   O scroll é suavizado com interpolação + requestAnimationFrame; nunca é bloqueado. */
(() => {
  'use strict';

  const D = window.FIZZ;
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const IDS = D.products.map((p) => p.id);
  const byId = Object.fromEntries(D.products.map((p) => [p.id, p]));

  /* ---------- Revelações ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Pinceladas (decorativas) ---------- */
  const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const dabGroups = $$('[data-dabs]').map((box) => {
    const rand = rng(Number(box.dataset.seed) || 1);
    const items = [];
    for (let i = 0; i < (Number(box.dataset.dabs) || 12); i++) {
      const d = document.createElement('span');
      d.className = 'dab';
      d.style.cssText = `left:${(rand() * 100).toFixed(2)}%;top:${(rand() * 100).toFixed(2)}%;` +
        `--s:${(14 + rand() * 40).toFixed(1)}px;--r:${(-50 + rand() * 30).toFixed(1)}deg;opacity:${(0.55 + rand() * 0.45).toFixed(2)}`;
      box.appendChild(d);
      items.push({ el: d, speed: 0.15 + rand() * 0.55 });
    }
    return { box, items };
  });

  /* ---------- Listas estáticas (movimento reduzido) e pontos dos sabores ---------- */
  const img = (p, cls = '') => `<img class="${cls}" src="assets/produtos/fizz_${p.id}_card.webp" alt="FIZZ ${p.name}" loading="lazy">`;
  $('.flavors__static').innerHTML = D.products.map((p) => `<li style="--c:${p.color}">${img(p)}<span>${p.name}</span></li>`).join('');
  $('.gama__static').innerHTML = D.products.map((p) => `<li>${img(p)}</li>`).join('');
  const dotsEl = $('.flavors__dots');
  dotsEl.innerHTML = D.products.map((p) => `<li style="--c:${p.color}"></li>`).join('');
  const dots = $$('li', dotsEl);

  /* ---------- Palco ---------- */
  const sticky = $('.stage__sticky');
  const canvas = $('.stage__canvas');
  const ctx = canvas.getContext('2d');
  const podium = $('.podium');
  const heroEl = $('#inicio');
  const saborEl = $('#sabores');
  const flavorsEl = $('[data-flavors]');
  const flavorsPin = $('.flavors__pin');
  const gamaEl = $('#gama');
  const heroWord = $('.hero__word');
  const topbar = $('.topbar');
  const marquees = $$('[data-marquee]').map((el) => ({ el, track: $('.marquee__track', el) }));
  const driftRows = $$('[data-drift]').map((el) => ({ el, dir: Number(el.dataset.drift) }));
  const fUI = {
    index: $('[data-f-index]'), name: $('[data-f-name]'), cat: $('[data-f-cat]'), link: $('[data-f-link]'),
  };

  const images = {};
  const load = (id) => new Promise((resolve) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { const ok = () => { images[id] = im; resolve(); }; im.decode ? im.decode().then(ok, ok) : ok(); };
    im.onerror = () => resolve();
    im.src = `assets/produtos/fizz_${id}.webp`;
  });

  /* Poses em fracções do viewport: x, y (centro), h (altura), r (graus), a (opacidade).
     Medidas nos frames do kit: Limão −10°→−6°, Cola 14°→10°; sabor principal 77 % da altura
     a −12°, o seguinte a 59 % na margem direita com 38 % de opacidade. */
  const POSES = {
    wide: {
      hero: { limao: { x: [0.415, 0.39], y: 0.53, h: 0.72, r: [-10, -6] }, cola: { x: [0.595, 0.57], y: 0.57, h: 0.56, r: [14, 10] } },
      main: { x: 0.63, y: 0.53, h: 0.74, r: -12, a: 1 },
      exit: { x: 0.47, y: 0.5, h: 0.68, r: -3, a: 0 },
      next: { x: 0.92, y: 0.55, h: 0.54, r: 9, a: 0.42 },
      enter: { x: 1.12, y: 0.57, h: 0.5, r: 14, a: 0 },
      arc: { cx: 0.5, y: 0.62, spread: 0.29, lift: 0.07, h: 0.42 },
    },
    narrow: {
      hero: { limao: { x: [0.4, 0.38], y: 0.46, h: 0.42, r: [-10, -6] }, cola: { x: [0.66, 0.64], y: 0.49, h: 0.32, r: [14, 10] } },
      main: { x: 0.5, y: 0.6, h: 0.46, r: -10, a: 1 },
      exit: { x: 0.16, y: 0.57, h: 0.42, r: -3, a: 0 },
      next: { x: 0.95, y: 0.63, h: 0.3, r: 9, a: 0.45 },
      enter: { x: 1.2, y: 0.65, h: 0.28, r: 14, a: 0 },
      arc: { cx: 0.5, y: 0.56, spread: 0.39, lift: 0.045, h: 0.23 },
    },
  };
  const lerpPose = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), h: lerp(a.h, b.h, t), r: lerp(a.r, b.r, t), a: lerp(a.a, b.a, t) });

  let vw = 0, vh = 0, dpr = 1, narrow = false;
  let heroTop = 0, heroH = 0, saborTop = 0, flavorsTop = 0, flavorsH = 0, gamaTop = 0, gamaH = 0;
  let current = window.scrollY, target = window.scrollY;
  let introStart = 0, ready = false, activeFlavor = -1;

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
    saborTop = top(saborEl);
    flavorsTop = top(flavorsEl); flavorsH = flavorsEl.offsetHeight;
    gamaTop = top(gamaEl); gamaH = gamaEl.offsetHeight;
    requestTick();
  }

  // Desenha uma garrafa com o centro em (x, y) em px, altura h em px
  function bottle(id, x, y, h, rot, alpha) {
    const im = images[id];
    if (!im || alpha <= 0.01 || h <= 1) return;
    const w = (h * im.naturalWidth) / im.naturalHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.globalAlpha = clamp(alpha);
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
  }
  const put = (id, p, dx, dy, alphaMul, t, seed, amp = 1) => {
    const bob = Math.sin(t / 900 + seed) * vh * 0.008 * amp;
    const tilt = Math.sin(t / 1300 + seed * 1.7) * 1.1 * amp;
    bottle(id, p.x * vw + dx, p.y * vh + dy + bob, p.h * vh, p.r + tilt, p.a * alphaMul);
  };

  function draw(s, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const P = narrow ? POSES.narrow : POSES.wide;

    const pA = clamp((s - heroTop) / Math.max(1, heroH - vh));
    const tAB = clamp((s - (saborTop - vh * 0.8)) / (vh * 0.85));
    const tBC = clamp((s - (gamaTop - vh * 0.8)) / (vh * 0.85));
    const k = introStart ? easeOut(clamp((t - introStart) / 1500)) : 0;

    /* A · hero */
    const aAlpha = (1 - smooth(clamp((tAB - 0.35) / 0.5))) * clamp(k * 2.5);
    if (aAlpha > 0.01) {
      const dy = -easeInOut(tAB) * vh * 0.6 - pA * vh * 0.03 - (1 - k) * vh * 0.95;
      const rot = -tAB * 12 - (1 - k) * 16;
      for (const id of ['cola', 'limao']) {
        const c = P.hero[id];
        put(id, { x: lerp(c.x[0], c.x[1], pA), y: c.y, h: c.h * (1 + pA * 0.04 - tAB * 0.08), r: lerp(c.r[0], c.r[1], pA) + rot, a: 1 },
          0, dy, aAlpha, t, id === 'cola' ? 2 : 0);
      }
    }

    /* B · oito sabores — só entram quando o bloco dos sabores chega (a galeria fica limpa) */
    const tB = clamp((s - (flavorsTop - vh * 0.85)) / (vh * 0.85));
    const bAlpha = smooth(clamp((tB - 0.2) / 0.6)) * (1 - smooth(clamp((tBC - 0.35) / 0.5)));
    const stepF = clamp((s - flavorsTop) / Math.max(1, flavorsH - vh)) * (IDS.length - 1);
    let i = Math.floor(stepF), e = easeInOut(clamp((stepF - i - 0.35) / 0.65));
    if (i >= IDS.length - 1) { i = IDS.length - 1; e = 0; }
    if (bAlpha > 0.01) {
      const dy = (1 - easeOut(tB)) * vh * 0.7 - easeInOut(tBC) * vh * 0.6;
      const rot = (1 - tB) * 14 - tBC * 10;
      const at = (pose) => ({ ...pose, r: pose.r + rot });
      const n1 = IDS[i + 1], n2 = IDS[i + 2];
      if (n2) put(n2, at(lerpPose(P.enter, P.next, e)), 0, dy, bAlpha, t, i + 2);
      const cur = () => put(IDS[i], at(lerpPose(P.main, P.exit, e)), 0, dy, bAlpha, t, i);
      const nxt = () => n1 && put(n1, at(lerpPose(P.next, P.main, e)), 0, dy, bAlpha, t, i + 1);
      if (e < 0.5) { nxt(); cur(); } else { cur(); nxt(); }
    }
    setFlavor(Math.min(IDS.length - 1, i + (e > 0.5 ? 1 : 0)));

    /* C · gama em arco */
    const cAlpha = smooth(clamp((tBC - 0.28) / 0.55));
    const g = easeOut(clamp((s - gamaTop) / Math.max(1, (gamaH - vh) * 0.7)));
    if (cAlpha > 0.01) {
      const A = P.arc;
      const dy = (1 - easeOut(tBC)) * vh * 0.6;
      const order = IDS.map((id, n) => ({ id, u: (n - (IDS.length - 1) / 2) / ((IDS.length - 1) / 2) }))
        .sort((a, b) => Math.abs(a.u) - Math.abs(b.u));                // centro atrás, pontas à frente
      for (const { id, u } of order) {
        const spread = A.spread * (0.22 + 0.78 * g);
        put(id, {
          x: A.cx + u * spread,
          y: A.y - (1 - u * u) * A.lift * g,
          h: A.h * (1 + Math.abs(u) * 0.1 * g),
          r: u * 5 * g + (1 - tBC) * 10,
          a: 1,
        }, 0, dy, cAlpha, t, IDS.indexOf(id), 1 - g);
      }
      const w = (A.spread * 2 + 0.16) * vw;
      const top = (A.y + A.h * 0.55) * vh + dy - vh * 0.035;
      podium.style.transform = `translate3d(${(A.cx * vw - w / 2).toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
      podium.style.width = `${w.toFixed(1)}px`;
      podium.style.opacity = (cAlpha * smooth(clamp((g - 0.25) / 0.6))).toFixed(3);
    } else {
      podium.style.opacity = '0';
    }
    ctx.globalAlpha = 1;
  }

  const mix = (hex, amt, base = [252, 235, 210]) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return `rgb(${c.map((v, j) => Math.round(base[j] + (v - base[j]) * amt)).join(',')})`;
  };
  function setFlavor(n) {
    if (n === activeFlavor) return;
    activeFlavor = n;
    const p = byId[IDS[n]];
    fUI.index.textContent = String(n + 1).padStart(2, '0');
    fUI.name.textContent = p.name;
    fUI.cat.textContent = p.tagline;
    fUI.link.dataset.product = p.id;
    fUI.link.setAttribute('aria-label', `Ver produto FIZZ ${p.name}`);
    flavorsPin.style.setProperty('--tint', mix(p.color, 0.16));
    flavorsPin.style.setProperty('--accent', p.id === 'litchi' ? '#C2517A' : p.color);
    fUI.name.classList.remove('is-swap'); void fUI.name.offsetWidth; fUI.name.classList.add('is-swap');
    dots.forEach((d, j) => d.classList.toggle('is-active', j === n));
  }

  function updateDom(s) {
    if (heroWord) {
      const p = clamp((s - heroTop) / Math.max(1, heroH - vh * 0.3));
      heroWord.style.setProperty('--wx', `${(-p * vw * 0.14).toFixed(1)}px`);
    }
    for (const m of marquees) {
      const r = m.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = clamp((vh - r.top) / (vh + r.height));
      m.track.style.setProperty('--mx', `${lerp(vw * 0.25, -(m.track.scrollWidth * 0.5) + vw * 0.1, p).toFixed(1)}px`);
    }
    for (const d of driftRows) {
      const r = d.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const p = clamp((vh - r.top) / (vh + r.height));
      const span = Math.max(0, d.el.scrollWidth - vw) + vw * 0.12;
      const x = d.dir < 0 ? -p * span : -span + p * span;
      d.el.style.setProperty('--dx', `${x.toFixed(1)}px`);
    }
    for (const g of dabGroups) {
      const r = g.box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      for (const d of g.items) d.el.style.setProperty('--py', `${(-r.top * d.speed * -0.6).toFixed(1)}px`);
    }
  }

  let rafId = 0;
  function tick(now) {
    rafId = 0;
    target = window.scrollY;
    const diff = target - current;
    current = Math.abs(diff) < 0.3 ? target : current + diff * 0.14;
    topbar.classList.toggle('is-visible', target > saborTop - vh * 0.25);
    if (!reduceMotion.matches) {
      if (ready) draw(current, now);
      updateDom(current);
    }
    const onStage = ready && !reduceMotion.matches && current < gamaTop + gamaH;
    const intro = introStart && now - introStart < 1600;
    if (Math.abs(target - current) > 0.3 || (onStage && document.visibilityState === 'visible') || intro) requestTick();
  }
  function requestTick() { if (!rafId) rafId = requestAnimationFrame(tick); }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('orientationchange', () => setTimeout(measure, 250));
  document.addEventListener('visibilitychange', requestTick);
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body);
  reduceMotion.addEventListener?.('change', () => { measure(); requestTick(); });
  document.fonts?.ready.then(measure);
  window.FIZZ.remeasure = measure;

  measure();

  /* ---------- Carregamento: hero primeiro, restantes depois ---------- */
  Promise.all([load('limao'), load('cola')]).then(() => {
    ready = true;
    root.classList.add('is-ready');
    introStart = performance.now();
    requestTick();
    IDS.filter((id) => !images[id]).reduce((p, id) => p.then(() => load(id)).then(requestTick), Promise.resolve());
  });
  setTimeout(() => root.classList.add('is-ready'), 2500);
  if (reduceMotion.matches) root.classList.add('is-ready');
})();
