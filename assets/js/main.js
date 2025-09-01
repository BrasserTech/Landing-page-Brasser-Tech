// Utilitários
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

/* ========== Menu mobile (apenas 1 nav) ========== */
const burger = $('#hamburger');
const nav = $('.bt-menu');

function toggleMobileMenu() {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  if (!open) closeAllMega();
}
burger?.addEventListener('click', toggleMobileMenu);

/* ========== Mega-menus (desktop e mobile) ========== */
function closeAllMega() {
  $$('.bt-menu-item').forEach(item => {
    item.classList.remove('open');
    const btn = item.querySelector('.bt-menu-btn');
    btn?.setAttribute('aria-expanded', 'false');
  });
}

// Abrir/fechar ao clicar no botão (funciona em desktop e mobile)
$$('.bt-menu-item').forEach(item => {
  const btn = item.querySelector('.bt-menu-btn');
  const panel = item.querySelector('.bt-mega');

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = item.classList.contains('open');
    closeAllMega();
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  // Hover em desktop
  item.addEventListener('mouseenter', () => {
    if (window.matchMedia('(min-width: 861px)').matches) {
      closeAllMega();
      item.classList.add('open');
      btn?.setAttribute('aria-expanded', 'true');
    }
  });
  item.addEventListener('mouseleave', () => {
    if (window.matchMedia('(min-width: 861px)').matches) {
      item.classList.remove('open');
      btn?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Fechar clicando fora
document.addEventListener('click', (e) => {
  const inside = e.target.closest('.bt-menu,.bt-hamburger');
  if (!inside) {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    closeAllMega();
  }
});

// Fechar com Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    closeAllMega();
  }
});

/* ========== Âncoras com rolagem suave ========== */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = $(id);
    if (target){
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      closeAllMega();
    }
  });
});

/* ========== Ano dinâmico no rodapé ========== */
const yearEl = document.getElementById('btYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();
