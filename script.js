'use strict';
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navegacao');
  const menuWord = document.querySelector('.menu-word');
  function setMenu(open, restoreFocus = false) {
    menu.setAttribute('aria-expanded', String(open));
    menuWord.textContent = open ? 'Fechar' : 'Menu';
    nav.classList.toggle('open', open);
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
  document.addEventListener('click', event => { if (!event.target.closest('.header') && menu.getAttribute('aria-expanded') === 'true') setMenu(false); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  const hero = document.querySelector('#hero-video');
  const toggle = document.querySelector('#hero-toggle');
  const status = document.querySelector('#hero-status');
  let explicitlyPaused = reduced.matches;
  function updateVideoControl() {
    toggle.querySelector('.toggle-label').textContent = hero.paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
    toggle.firstElementChild.textContent = hero.paused ? '▷' : 'Ⅱ';
    toggle.setAttribute('aria-label', hero.paused ? 'Reproduzir vídeo de fundo' : 'Pausar vídeo de fundo');
  }
  async function playHero() {
    if (hero.error) { status.textContent = 'Não foi possível carregar o vídeo. Tente atualizar a página.'; return; }
    try { await hero.play(); status.textContent = ''; }
    catch { status.textContent = 'Use o botão Reproduzir vídeo para iniciar.'; }
    updateVideoControl();
  }
  toggle.addEventListener('click', () => {
    if (hero.paused) { explicitlyPaused = false; playHero(); }
    else { explicitlyPaused = true; hero.pause(); }
  });
  hero.addEventListener('play', updateVideoControl);
  hero.addEventListener('pause', updateVideoControl);
  hero.addEventListener('error', () => { status.textContent = 'Não foi possível carregar o vídeo. Tente atualizar a página.'; updateVideoControl(); });
  if (reduced.matches) { hero.removeAttribute('autoplay'); hero.pause(); }
  else playHero();
  updateVideoControl();
  reduced.addEventListener('change', event => { if (event.matches) { explicitlyPaused = true; hero.pause(); } });

  const action = document.querySelector('#action-video');
  action.addEventListener('error', () => { document.querySelector('#action-status').textContent = 'Não foi possível carregar o vídeo. Tente atualizar a página.'; });
  action.addEventListener('play', () => hero.pause());
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        document.body.classList.toggle('past-hero', !entry.isIntersecting);
        if (!entry.isIntersecting) hero.pause();
        else if (!explicitlyPaused && !reduced.matches && action.paused) playHero();
      });
    }, { threshold: .1 });
    videoObserver.observe(hero);
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('pending'); reveals.unobserve(entry.target); } });
    }, { threshold: .04 });
    if (!reduced.matches) document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); reveals.observe(el); });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hero.pause(); action.pause(); }
    else if (!explicitlyPaused && !reduced.matches && action.paused && hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight) playHero();
  });
})();
