/* ====== NAV MOBILE ====== */
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

/* ====== ANO RODAPÉ ====== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ====== VOLTAR AO TOPO ====== */
const toTop = document.querySelector('[data-to-top]');
window.addEventListener('scroll', () => {
  if (window.scrollY > 600) toTop.classList.add('show');
  else toTop.classList.remove('show');
});
toTop?.addEventListener('click', () =>
  window.scrollTo({ top:0, behavior:'smooth' })
);

/* ====== SMOOTH ANCHORS ====== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});

/* ====== REVEAL + STAGGER ====== */
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

/* ====== TYPE-IN (Hero) ====== */
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

/* ====== PARALLAX (glows e bg de produtos) ====== */
const parallaxEls = document.querySelectorAll('.parallax, .glow');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  parallaxEls.forEach(el => {
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
});

/* ====== TILT CARDS ====== */
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
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

/* ====== COUNTERS (Sobre) ====== */
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

/* ====== BOTÕES COM RIPPLE ====== */
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

/* ====== LOGOS LOOP CONTÍNUO (sem tranco) ====== */
document.querySelectorAll('.scroller[data-animated]').forEach(scroller => {
  const inner = scroller.querySelector('.scroller__inner');
  const items = Array.from(inner.children);
  items.forEach(item => inner.appendChild(item.cloneNode(true))); // duplica
});

/* ====== MODAL ====== */
const openButtons = document.querySelectorAll('[data-open-modal]');
const closeModalEls = document.querySelectorAll('[data-close-modal]');
openButtons.forEach(b => b.addEventListener('click', () => {
  const sel = b.getAttribute('data-open-modal');
  const modal = document.querySelector(sel);
  if (modal) modal.setAttribute('aria-hidden', 'false');
}));
closeModalEls.forEach(c => c.addEventListener('click', () => {
  const m = c.closest('.modal'); if (m) m.setAttribute('aria-hidden', 'true');
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => m.setAttribute('aria-hidden','true')); });

/* ====== TABS DE PRODUTOS ====== */
const tabs = document.querySelectorAll('.tabs .tab');
const cards = document.querySelectorAll('.products-grid .p-card');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    const f = tab.dataset.filter;
    cards.forEach(c => {
      c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none';
    });
  });
});
