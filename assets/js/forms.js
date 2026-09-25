/* FIZZ — interface: menu, separadores, filtros, detalhe de produto e formulários.
   Formulários: validação nativa + mensagens em português, honeypot, tempo mínimo de preenchimento
   e limite de reenvio. Sem destino configurado (FIZZ.endpoints) nada é enviado: o site confirma
   a recepção em modo de pré-visualização. */
(() => {
  'use strict';

  const D = window.FIZZ;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const byId = Object.fromEntries(D.products.map((p) => [p.id, p]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollToEl = (el) => el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });

  /* ---------- Menu móvel ---------- */
  const topbar = $('.topbar');
  const menuBtn = $('.topbar__menu');
  const closeMenu = () => { topbar.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn.addEventListener('click', () => {
    const open = !topbar.classList.contains('is-open');
    topbar.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Separadores ---------- */
  const tabs = $$('[role="tab"]');
  function selectTab(name, focus = false) {
    tabs.forEach((t) => {
      const on = t.id === `tab-${name}`;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.id.replace('tab-', '')));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectTab(tabs[(i + d + tabs.length) % tabs.length].id.replace('tab-', ''), true);
    });
  });
  const hashTab = { '#distribuicao': 'cotacao', '#fornecedores': 'fornecedores', '#contacto': 'geral' }[location.hash];
  if (hashTab) selectTab(hashTab);

  /* ---------- Âncoras (deslocação suave, separador certo) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (a.dataset.open || a.dataset.product) return;
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (a.dataset.tab) selectTab(a.dataset.tab);
      let top = el.getBoundingClientRect().top + window.scrollY;
      // na gama, parar com o arco já aberto
      if (id === '#gama' && !reduceMotion.matches) top += (el.offsetHeight - window.innerHeight) * 0.8;
      window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Filtros de produtos ---------- */
  const chips = $$('.chip');
  const cards = $$('[data-grid] > li');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => { const on = x === c; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
    const f = c.dataset.filter;
    cards.forEach((li) => { li.hidden = f !== 'all' && li.dataset.cat !== f; });
    window.FIZZ.remeasure?.();
  }));

  /* ---------- Diálogos ---------- */
  const productDlg = $('#produto');
  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('has-modal');
  }
  function closeDialog(dlg) {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('close', () => document.documentElement.classList.remove('has-modal'));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(dlg); });   // clique fora
    $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => closeDialog(dlg)));
  });
  $$('[data-open]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const dlg = $(`#${a.dataset.open}`);
    if (dlg) openDialog(dlg);
  }));

  let currentProduct = null;
  function showProduct(id) {
    const p = byId[id];
    if (!p) return;
    currentProduct = id;
    const im = $('[data-p-img]', productDlg);
    im.src = `assets/produtos/fizz_${id}.webp`;
    im.alt = `Garrafa FIZZ ${p.name}`;
    $('[data-p-cat]', productDlg).textContent = p.cat;
    $('[data-p-name]', productDlg).textContent = `FIZZ ${p.name}`;
    $('[data-p-desc]', productDlg).textContent = p.desc;
    $('[data-p-disp]', productDlg).textContent = D.availability;
    productDlg.style.setProperty('--c', p.color);
    openDialog(productDlg);
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-product]');
    if (!t || t.closest('dialog')) return;
    e.preventDefault();
    showProduct(t.dataset.product);
  });
  $('[data-p-quote]').addEventListener('click', (e) => {
    e.preventDefault();
    closeDialog(productDlg);
    selectTab('cotacao');
    const box = $(`[data-product-checks] input[value="${currentProduct}"]`);
    if (box) box.checked = true;
    scrollToEl($('#contactos'));
  });

  /* ---------- Campos dinâmicos ---------- */
  $('[data-product-checks]').innerHTML = D.products.map((p) =>
    `<label class="check" style="--c:${p.color}"><input type="checkbox" name="produtos" value="${p.id}"><span>${p.name}</span></label>`).join('');
  $$('[data-provincias]').forEach((sel) => {
    sel.insertAdjacentHTML('beforeend', D.provinces.map((n) => `<option>${n}</option>`).join(''));
  });

  /* ---------- Formulários ---------- */
  const MSG = {
    valueMissing: 'Campo obrigatório.',
    typeMismatch: 'Formato inválido.',
    email: 'Indica um email válido.',
    patternMismatch: 'Formato inválido.',
    consent: 'É preciso aceitar para continuar.',
    group: 'Escolhe pelo menos um produto.',
  };
  const opened = new WeakMap();

  function fieldError(input) {
    const v = input.validity;
    if (input.type === 'checkbox' && input.name === 'consentimento' && !input.checked) return MSG.consent;
    if (v.valueMissing) return MSG.valueMissing;
    if (v.typeMismatch) return input.type === 'email' ? MSG.email : MSG.typeMismatch;
    if (v.patternMismatch) return input.dataset.msg || MSG.patternMismatch;
    return '';
  }
  function setError(input, msg) {
    const holder = input.closest('.field, .consent, .news__row') || input.parentElement;
    let el = holder.querySelector('.err');
    if (!msg) { input.removeAttribute('aria-invalid'); el?.remove(); return; }
    input.setAttribute('aria-invalid', 'true');
    if (!el) {
      el = document.createElement('p');
      el.className = 'err';
      el.id = `${input.id || input.name}-err-${Math.random().toString(36).slice(2, 7)}`;
      holder.appendChild(el);
      input.setAttribute('aria-describedby', el.id);
    }
    el.textContent = msg;
  }
  function validate(form) {
    let first = null;
    $$('input, select, textarea', form).forEach((input) => {
      if (input.closest('.hp') || input.type === 'hidden') return;
      if (input.type === 'checkbox' && input.name === 'produtos') return;
      const msg = fieldError(input);
      setError(input, msg);
      if (msg && !first) first = input;
    });
    $$('[data-group-required]', form).forEach((fs) => {
      const any = $$('input[type="checkbox"]', fs).some((c) => c.checked);
      let el = fs.querySelector('.err');
      if (any) { el?.remove(); fs.removeAttribute('aria-invalid'); return; }
      fs.setAttribute('aria-invalid', 'true');
      if (!el) { el = document.createElement('p'); el.className = 'err'; fs.appendChild(el); }
      el.textContent = MSG.group;
      if (!first) first = $('input', fs);
    });
    return first;
  }

  $$('form[data-form]').forEach((form) => {
    opened.set(form, Date.now());
    const status = $('.form__status', form);
    const submit = $('[type="submit"]', form);

    form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid')) setError(e.target, fieldError(e.target)); });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'produtos') { const fs = e.target.closest('fieldset'); fs.querySelector('.err')?.remove(); fs.removeAttribute('aria-invalid'); }
      else if (e.target.getAttribute('aria-invalid')) setError(e.target, fieldError(e.target));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';
      status.textContent = '';
      const first = validate(form);
      if (first) { first.focus(); status.classList.add('is-error'); status.textContent = 'Revê os campos assinalados.'; return; }

      // antispam: honeypot preenchido ou envio demasiado rápido → ignora em silêncio
      const hp = $('.hp input', form);
      const tooFast = Date.now() - opened.get(form) < 2500;
      if ((hp && hp.value) || tooFast) { done(form, status, false, true); return; }

      // limite: um envio por formulário a cada 30 s
      const key = `fizz-sent-${form.dataset.form}`;
      let last = 0;
      try { last = Number(sessionStorage.getItem(key)) || 0; } catch (_) { /* sem armazenamento */ }
      if (Date.now() - last < 30000) { status.classList.add('is-error'); status.textContent = 'Acabaste de enviar. Aguarda alguns segundos antes de tentar de novo.'; return; }

      const endpoint = (D.endpoints || {})[form.dataset.form];
      const data = new FormData(form);
      data.delete('website');
      data.append('formulario', form.dataset.form);
      data.append('pagina', location.href);

      submit.disabled = true;
      submit.dataset.label = submit.dataset.label || submit.textContent;
      submit.textContent = 'A enviar…';
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(String(res.status));
        } else {
          await new Promise((r) => setTimeout(r, 500));
        }
        try { sessionStorage.setItem(key, String(Date.now())); } catch (_) { /* ignorar */ }
        done(form, status, !endpoint, false);
      } catch (err) {
        status.classList.add('is-error');
        status.textContent = 'Não foi possível enviar agora. Tenta de novo ou usa os contactos directos.';
      } finally {
        submit.disabled = false;
        submit.textContent = submit.dataset.label;
      }
    });
  });

  function done(form, status, preview, silent) {
    const kind = form.dataset.form;
    const text = {
      cotacao: 'Pedido de cotação recebido. A equipa comercial vai entrar em contacto contigo.',
      fornecedores: 'Proposta recebida. Obrigado pelo interesse em trabalhar com a Mopani.',
      geral: 'Mensagem recebida. Obrigado por escreveres à FIZZ.',
      newsletter: 'Subscrição registada. Bem-vindo à família FIZZ!',
    }[kind];
    form.reset();
    opened.set(form, Date.now());
    status.className = 'form__status is-ok';
    status.textContent = silent ? text : text + (preview ? ' (Pré-visualização: o envio ainda não está ligado.)' : '');
  }
})();
