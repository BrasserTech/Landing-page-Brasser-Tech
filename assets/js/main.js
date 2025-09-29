/* ========= util: aguardar o 'ready' do dotlottie ========= */
function onLottieReady(el, cb) {
  if (!el) return;
  // 'ready' é o evento oficial do webcomponent
  const isReady = el.readyState === 2 || el.readyState === 'complete' || el.isReady === true;
  if (isReady) { try { cb(); } catch {} return; }
  const handler = () => { try { cb(); } catch {} el.removeEventListener('ready', handler); };
  el.addEventListener('ready', handler, { once: true });
}

/* ========= iniciar/pausar por visibilidade e honrar autoplay ========= */
function wireAutoplayLotties() {
  const lotties = document.querySelectorAll('dotlottie-wc');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      onLottieReady(target, () => {
        try {
          if (isIntersecting) target.play?.();
          else target.pause?.();
        } catch {}
      });
    });
  }, { threshold: 0.1 });

  lotties.forEach(el => {
    // se tem atributo autoplay, garante o play após ready
    if (el.hasAttribute('autoplay')) {
      onLottieReady(el, () => { try { el.play?.(); } catch {} });
    }
    io.observe(el);
  });
}

/* ========= THEME: inicia, alterna, persiste (com animação confiável) ========= */
(function initTheme(){
  const root = document.documentElement;
  const STORAGE_KEY = 'bt-theme';
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  const themeBtn = document.getElementById('themeBtn');
  const lottie = document.getElementById('themeLottie');

  let isSwitching = false;
  const ANIM_TIME = 500;   // tempo para a animação aparecer antes de aplicar o tema
  const COOLDOWN  = 900;   // evita múltiplos cliques corridos

  function driveTimeline(direction = 1) {
    onLottieReady(lottie, () => {
      try { lottie.setDirection?.(direction); } catch {}
      try { lottie.seek?.(direction === 1 ? 0 : 1); } catch {}
      try { lottie.play?.(); } catch {}
    });
  }

  // fallback para state machine: tenta inputs comuns
  function driveStateMachine() {
    onLottieReady(lottie, () => {
      const sm = lottie.stateMachineId || 'StateMachine1';
      const candidates = ['toggle','Toggle','switch','Switch','checked','isOn','pressed'];
      for (const name of candidates) {
        try {
          // alguns players esperam boolean, outros pulsos (true → false)
          lottie.setInputValue?.(sm, name, true);
          setTimeout(() => { try { lottie.setInputValue?.(sm, name, false); } catch {} }, 50);
          return; // se um deu certo, não precisamos tentar os demais
        } catch {}
      }
      // se nada acima existir, pelo menos tenta tocar a timeline
      try { lottie.play?.(); } catch {}
    });
  }

  function animateToggle(currentTheme, nextTheme) {
    // 1) tenta timeline (direção), 2) tenta state machine
    if (currentTheme === 'dark' && nextTheme === 'light') driveTimeline(1);
    else if (currentTheme === 'light' && nextTheme === 'dark') driveTimeline(-1);
    // fallback SM (se o arquivo for controlado por state machine)
    driveStateMachine();
  }

  function toggleTheme(){
    if (isSwitching) return;
    isSwitching = true;

    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    // inicia a animação do Lottie
    animateToggle(current, next);

    // aplica mudança de tema após tempo de animação
    setTimeout(()=>{
      root.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      setTimeout(()=>{ isSwitching = false; }, COOLDOWN);
    }, ANIM_TIME);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
    themeBtn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
    });
  }

  // garante que lotties com autoplay funcionem
  wireAutoplayLotties();
})();

/* ========= NAV MOBILE ========= */
const btnMenu = document.querySelector('#btnMenu');
const menu = document.querySelector('#menu');
if (btnMenu && menu) {
  btnMenu.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btnMenu.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => menu.classList.remove('open'))
  );
}

/* ========= ANO RODAPÉ ========= */
document.getElementById('year').textContent = new Date().getFullYear();

/* ========= VOLTAR AO TOPO ========= */
const toTop = document.querySelector('[data-to-top]');
window.addEventListener('scroll', () => {
  if (window.scrollY > 600) toTop.classList.add('show');
  else toTop.classList.remove('show');
});
toTop?.addEventListener('click', () =>
  window.scrollTo({ top:0, behavior:'smooth' })
);

/* ========= SMOOTH ANCHORS ========= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});

/* ========= REVEAL + STAGGER ========= */
const revealEls = [...document.querySelectorAll('[data-reveal]')];
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = Number(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('is-visible'), delay);
      io.unobserve(e.target);
    }
  });
},{ threshold: 0.12 });
revealEls.forEach((el,i) => { el.dataset.delay = i % 3 * 80; io.observe(el); });

/* ========= TYPE-IN (Hero) ========= */
const typeEl = document.querySelector('.type-in');
if (typeEl) {
  const text = typeEl.textContent.trim();
  typeEl.textContent = '';
  let i = 0;
  const typer = () => {
    typeEl.textContent += text.charAt(i);
    i++;
    if (i < text.length) requestAnimationFrame(typer);
  };
  setTimeout(typer, 200);
}

/* ========= PARALLAX ========= */
const parallaxEls = document.querySelectorAll('.parallax, .glow');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  parallaxEls.forEach(el => { el.style.transform = `translate(${x}px, ${y}px)`; });
});

/* ========= TILT CARDS ========= */
const tiltEls = document.querySelectorAll('.tilt');
tiltEls.forEach(card => {
  const damp = 20;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const rx = ((cy / r.height) - 0.5) * -damp;
    const ry = ((cx / r.width) - 0.5) *  damp;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

/* ========= COUNTERS ========= */
const counters = document.querySelectorAll('[data-count]');
const ioCount = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = Number(el.dataset.count);
    const isFloat = !Number.isInteger(target);
    const dur = 1400, start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const val = target * p;
      el.textContent = isFloat ? val.toFixed(1) : Math.floor(val);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    ioCount.unobserve(el);
  });
},{ threshold:0.6 });
counters.forEach(el => ioCount.observe(el));

/* ========= RIPPLE ========= */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function(e){
    const circle = document.createElement('span');
    const size = Math.max(this.clientWidth, this.clientHeight);
    circle.style.width = circle.style.height = `${size}px`;
    const rect = this.getBoundingClientRect();
    circle.style.left = `${e.clientX - rect.left - size/2}px`;
    circle.style.top  = `${e.clientY - rect.top  - size/2}px`;
    circle.className = 'ripple-anim';
    this.appendChild(circle);
    setTimeout(()=> circle.remove(), 600);
  });
});

/* ========= TABS PROJETOS ========= */
const tabs = document.querySelectorAll('.tabs .tab');
const cards = document.querySelectorAll('.products-grid .p-card');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    const f = tab.dataset.filter;
    cards.forEach(c => { c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none'; });
  });
});
