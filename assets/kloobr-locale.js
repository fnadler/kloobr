/* KlooBR · idioma e localização (país) na nav, num único modal com toggle.
   Protótipo: as escolhas são lembradas em localStorage. O país padrão é o
   Brasil; a detecção por geolocation acontece só quando o usuário pede. */
(function () {
  'use strict';

  var LANGS = {
    'pt-BR': { short: 'PT-BR' }, 'pt-PT': { short: 'PT-PT' },
    'es': { short: 'ES' }, 'en': { short: 'EN' }, 'de': { short: 'DE' }
  };

  /* ISO-3166 alpha-2 → nome (pt-BR). Lista ampla e representativa. */
  var PAISES = [
    ['BR', 'Brasil'], ['PT', 'Portugal'], ['AO', 'Angola'], ['MZ', 'Moçambique'],
    ['CV', 'Cabo Verde'], ['GW', 'Guiné-Bissau'], ['ST', 'São Tomé e Príncipe'],
    ['TL', 'Timor-Leste'], ['GQ', 'Guiné Equatorial'],
    ['US', 'Estados Unidos'], ['CA', 'Canadá'], ['MX', 'México'],
    ['AR', 'Argentina'], ['UY', 'Uruguai'], ['PY', 'Paraguai'], ['CL', 'Chile'],
    ['BO', 'Bolívia'], ['PE', 'Peru'], ['EC', 'Equador'], ['CO', 'Colômbia'],
    ['VE', 'Venezuela'], ['GY', 'Guiana'], ['SR', 'Suriname'], ['PA', 'Panamá'],
    ['CR', 'Costa Rica'], ['NI', 'Nicarágua'], ['HN', 'Honduras'], ['SV', 'El Salvador'],
    ['GT', 'Guatemala'], ['BZ', 'Belize'], ['CU', 'Cuba'], ['DO', 'República Dominicana'],
    ['HT', 'Haiti'], ['JM', 'Jamaica'], ['PR', 'Porto Rico'],
    ['GB', 'Reino Unido'], ['IE', 'Irlanda'], ['FR', 'França'], ['ES', 'Espanha'],
    ['DE', 'Alemanha'], ['IT', 'Itália'], ['NL', 'Países Baixos'], ['BE', 'Bélgica'],
    ['LU', 'Luxemburgo'], ['CH', 'Suíça'], ['AT', 'Áustria'], ['SE', 'Suécia'],
    ['NO', 'Noruega'], ['DK', 'Dinamarca'], ['FI', 'Finlândia'], ['IS', 'Islândia'],
    ['PL', 'Polônia'], ['CZ', 'Tchéquia'], ['SK', 'Eslováquia'], ['HU', 'Hungria'],
    ['RO', 'Romênia'], ['BG', 'Bulgária'], ['GR', 'Grécia'], ['HR', 'Croácia'],
    ['SI', 'Eslovênia'], ['RS', 'Sérvia'], ['UA', 'Ucrânia'], ['RU', 'Rússia'],
    ['EE', 'Estônia'], ['LV', 'Letônia'], ['LT', 'Lituânia'], ['TR', 'Turquia'],
    ['IL', 'Israel'], ['AE', 'Emirados Árabes Unidos'], ['SA', 'Arábia Saudita'],
    ['QA', 'Catar'], ['KW', 'Kuwait'], ['LB', 'Líbano'],
    ['EG', 'Egito'], ['MA', 'Marrocos'], ['DZ', 'Argélia'], ['TN', 'Tunísia'],
    ['NG', 'Nigéria'], ['GH', 'Gana'], ['KE', 'Quênia'], ['ET', 'Etiópia'],
    ['ZA', 'África do Sul'], ['SN', 'Senegal'], ['CI', 'Costa do Marfim'],
    ['CM', 'Camarões'], ['CD', 'Congo (RDC)'], ['CG', 'Congo'], ['TZ', 'Tanzânia'],
    ['UG', 'Uganda'], ['ZW', 'Zimbábue'], ['ZM', 'Zâmbia'], ['NA', 'Namíbia'],
    ['BW', 'Botsuana'], ['MU', 'Maurício'],
    ['IN', 'Índia'], ['PK', 'Paquistão'], ['BD', 'Bangladesh'], ['LK', 'Sri Lanka'],
    ['NP', 'Nepal'], ['CN', 'China'], ['JP', 'Japão'], ['KR', 'Coreia do Sul'],
    ['TW', 'Taiwan'], ['HK', 'Hong Kong'], ['TH', 'Tailândia'], ['VN', 'Vietnã'],
    ['PH', 'Filipinas'], ['ID', 'Indonésia'], ['MY', 'Malásia'], ['SG', 'Singapura'],
    ['AU', 'Austrália'], ['NZ', 'Nova Zelândia']
  ];

  var BYCODE = {};
  PAISES.forEach(function (p) { BYCODE[p[0]] = p[1]; });

  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function flag(cc) {
    cc = String(cc).toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc)) return '🏳️';
    return String.fromCodePoint(0x1F1E6 + cc.charCodeAt(0) - 65,
                                0x1F1E6 + cc.charCodeAt(1) - 65);
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  document.addEventListener('DOMContentLoaded', function () {
    var dlg = document.querySelector('[data-prefs-dialog]');
    if (!dlg) return;

    /* ---------- idioma ---------- */
    var langLabel = document.querySelector('[data-lang-label]');
    var langBtns = qsa('[data-lang]');
    function setLang(code) {
      var L = LANGS[code]; if (!L) return;
      document.documentElement.lang = code;
      if (langLabel) langLabel.textContent = L.short;
      langBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === code)); });
      store('kloobr-lang', code);
    }
    langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
    setLang(read('kloobr-lang') || 'pt-BR');

    /* ---------- toggle idioma / localização ---------- */
    var tabs = qsa('[data-locale-tab]');
    var panes = qsa('[data-locale-pane]');
    function showPane(which) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.localeTab === which)); });
      panes.forEach(function (p) { p.hidden = p.dataset.localePane !== which; });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { showPane(t.dataset.localeTab); }); });

    /* ---------- localização (país) ---------- */
    var listEl = document.querySelector('[data-ctry-list]');
    var flagEls = qsa('[data-ctry-flag]');
    var nameEls = qsa('[data-ctry-name]');
    var openEls = qsa('[data-ctry-open]');
    var searchEl = document.querySelector('[data-ctry-search]');
    var emptyEl = document.querySelector('[data-ctry-empty]');
    var msgEl = document.querySelector('[data-ctry-msg]');
    var items = [];

    var CHECK = '<span class="ctry-item__check" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>';

    if (listEl) {
      PAISES.slice().sort(function (a, b) { return a[1].localeCompare(b[1], 'pt-BR'); })
        .forEach(function (p) {
          var li = document.createElement('li');
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'ctry-item';
          b.setAttribute('role', 'option');
          b.dataset.code = p[0];
          b.dataset.q = norm(p[1] + ' ' + p[0]);
          b.innerHTML = '<span class="ctry-item__flag" aria-hidden="true">' + flag(p[0]) +
            '</span><span class="ctry-item__name">' + p[1] + '</span>' + CHECK;
          b.addEventListener('click', function () { select(p[0]); closeDlg(); });
          li.appendChild(b);
          listEl.appendChild(li);
          items.push(b);
        });
    }

    function select(cc) {
      if (!BYCODE[cc]) return;
      flagEls.forEach(function (e) { e.textContent = flag(cc); });
      nameEls.forEach(function (e) { e.textContent = BYCODE[cc]; });
      openEls.forEach(function (e) { e.setAttribute('aria-label', 'Localização: ' + BYCODE[cc]); });
      items.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.code === cc)); });
      store('kloobr-country', cc);
    }

    function filter(q) {
      var n = norm(q), shown = 0;
      items.forEach(function (b) {
        var ok = !n || b.dataset.q.indexOf(n) !== -1;
        b.parentNode.hidden = !ok;
        if (ok) shown++;
      });
      if (emptyEl) emptyEl.hidden = shown !== 0;
    }
    if (searchEl) searchEl.addEventListener('input', function () { filter(searchEl.value); });

    function showMsg(t, info) {
      if (!msgEl) return;
      msgEl.textContent = t;
      msgEl.hidden = false;
      msgEl.classList.toggle('ctry__msg--info', !!info);
    }

    /* Detecção precisa: geolocation + reverse-geocode (sem chave, com CORS). */
    var detectBtn = document.querySelector('[data-ctry-detect]');
    if (detectBtn) detectBtn.addEventListener('click', function () {
      if (!navigator.geolocation) { showMsg('O seu navegador não permite detectar a localização. Escolha o país na lista.'); return; }
      detectBtn.disabled = true;
      detectBtn.classList.add('is-loading');
      showMsg('Detectando a sua localização…', true);
      navigator.geolocation.getCurrentPosition(function (pos) {
        var la = pos.coords.latitude, lo = pos.coords.longitude;
        fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + la + '&longitude=' + lo + '&localityLanguage=pt')
          .then(function (r) { return r.json(); })
          .then(function (d) {
            detectBtn.disabled = false; detectBtn.classList.remove('is-loading');
            var cc = String((d && d.countryCode) || '').toUpperCase();
            if (BYCODE[cc]) { select(cc); closeDlg(); }
            else showMsg('Não encontramos o seu país na lista. Selecione manualmente abaixo.');
          })
          .catch(function () {
            detectBtn.disabled = false; detectBtn.classList.remove('is-loading');
            showMsg('Não foi possível detectar agora. Escolha o país na lista.');
          });
      }, function () {
        detectBtn.disabled = false; detectBtn.classList.remove('is-loading');
        showMsg('Você não liberou a localização. Sem problema: escolha o país na lista abaixo.');
      }, { timeout: 10000, maximumAge: 600000 });
    });

    /* ---------- abrir / fechar o modal ---------- */
    function openDlg(tab) {
      if (msgEl) msgEl.hidden = true;
      if (searchEl) searchEl.value = '';
      filter('');
      showPane(tab || 'idioma');
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      if ((tab === 'local') && listEl) {
        var sel = listEl.querySelector('[aria-selected="true"]');
        if (sel) sel.scrollIntoView({ block: 'center' });
      }
    }
    function closeDlg() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }

    qsa('[data-prefs-open]').forEach(function (b) { b.addEventListener('click', function () { openDlg('idioma'); }); });
    openEls.forEach(function (b) { b.addEventListener('click', function () { openDlg('local'); }); });
    var cl = document.querySelector('[data-prefs-close]');
    if (cl) cl.addEventListener('click', closeDlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg.open) closeDlg(); });

    /* Estado inicial: país salvo, senão Brasil (padrão). */
    var saved = read('kloobr-country');
    select(saved && BYCODE[saved] ? saved : 'BR');
    showPane('idioma');
  });
})();
