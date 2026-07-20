/* ==========================================================================
   KlooBR · Animações de carregamento e de rolagem (reveal on load/scroll)
   --------------------------------------------------------------------------
   - Suave e elegante: fade + leve deslocamento vertical, com stagger por grupo.
   - Não intrusivo: o estado inicial escondido só existe quando <html> tem a
     classe `has-anim`, adicionada por um gate inline no <head> APENAS quando há
     IntersectionObserver e o usuário NÃO pede movimento reduzido. Assim, sem JS,
     sem suporte ou com "prefers-reduced-motion", todo o conteúdo aparece normal.
   - Seguro para layout: anima só opacity/transform de blocos internos; nunca de
     ancestrais de elementos fixed/sticky (nav, cta-dock, svc-bar, phase__pin).
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  // O gate no <head> decide se animamos. Sem ele, não fazemos nada.
  if (!root.classList.contains('has-anim')) return;
  if (!('IntersectionObserver' in window)) { root.classList.remove('has-anim'); return; }

  // Mesma lista de alvos usada no CSS (mantê-las em sincronia).
  var SELECTOR = [
    '.hero-copy > *',
    '.trust-bar__item',
    '.section__head',
    '.stats-grid > li',
    '.steps-grid > li',
    '.howai > li',
    '.delivery-grid > *',
    '.pricing-table',
    '.testimonial-carousel',
    '.faq > details',
    '.cross-sell > *',
    '.cta-final > *'
  ].join(',');

  function init() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    if (!nodes.length) { root.classList.remove('has-anim'); return; }

    // Stagger automático: elementos que compartilham o mesmo pai entram em
    // sequência (grades, listas, o hero). Blocos avulsos entram sem atraso.
    var groups = new Map();
    nodes.forEach(function (n) {
      var p = n.parentNode;
      var arr = groups.get(p);
      if (!arr) { arr = []; groups.set(p, arr); }
      arr.push(n);
    });
    groups.forEach(function (arr) {
      arr.forEach(function (n, i) {
        if (arr.length > 1) n.style.setProperty('--rd', Math.min(i * 80, 400) + 'ms');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    nodes.forEach(function (n) { io.observe(n); });

    // Rede de segurança: se algo escapar do observer (bug/edge), revela tudo.
    window.addEventListener('load', function () {
      setTimeout(function () {
        nodes.forEach(function (n) {
          var r = n.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) n.classList.add('is-in');
        });
      }, 1200);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

/* ==========================================================================
   Dock de CTA (mobile) · revelar ao sair do hero
   --------------------------------------------------------------------------
   Na 1ª dobra o dock repete o preço e o CTA do hero. Para não ser redundante,
   ele fica escondido enquanto o hero está visível e só aparece quando a
   rolagem deixa o hero. Independe do gate de animação; sem IntersectionObserver
   o dock recebe --show e fica sempre visível (comportamento antigo).
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var dock = document.querySelector('[data-cta-dock]');
    if (!dock) return;
    var hero = document.getElementById('hero');
    if (!hero || !('IntersectionObserver' in window)) {
      dock.classList.add('cta-dock--show');   // fallback: sempre visível
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // hero fora da viewport (rolou além dele) → mostra o dock
        dock.classList.toggle('cta-dock--show', !e.isIntersecting);
      });
    }, { root: null, threshold: 0 });
    io.observe(hero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
