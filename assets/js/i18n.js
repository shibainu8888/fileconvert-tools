(function () {
  const STORE_KEY = 'lang';
  let dict = {};
  let cur = 'ko';
  let basePath = 'lang';
  let selectEl;

  // 내부 유틸
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isObj = v => v && typeof v === 'object';

  async function loadJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`i18n: ${url} ${res.status}`);
    return await res.json();
  }

  // DOM에 적용
  function applyDict() {
    // 텍스트 노드 치환
    $all('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    // 속성 치환: data-i18n-attr="placeholder:search_ph, title:help_title"
    $all('[data-i18n-attr]').forEach(el => {
      const map = el.getAttribute('data-i18n-attr')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      map.forEach(pair => {
        const [attr, k] = pair.split(':').map(s => s.trim());
        if (attr && k && dict[k] !== undefined) el.setAttribute(attr, dict[k]);
      });
    });
    document.documentElement.lang = cur;
  }

  async function setLang(next) {
    if (!next || next === cur) return cur;
    cur = next;
    localStorage.setItem(STORE_KEY, cur);
    dict = await loadJSON(`${basePath}/${cur}.json`).catch(e => {
      console.warn('[i18n] load failed', e);
      return {};
    });
    applyDict();
    if (selectEl && selectEl.value !== cur) selectEl.value = cur;
    return cur;
  }

  // 공개 API
  async function initI18n(opts = {}) {
    const {
      defaultLang = 'ko',
      filesPath = 'lang',
      selectEl: sel = '#langSelect'
    } = opts;

    basePath = filesPath;
    selectEl = typeof sel === 'string' ? document.querySelector(sel) : sel;

    const saved = localStorage.getItem(STORE_KEY);
    const browser = (navigator.language || defaultLang).slice(0, 2);
    const start = saved || (['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'].includes(browser) ? browser : defaultLang);

    // 셀렉트 박스 바인딩(중복 방지)
    if (selectEl && !selectEl.dataset.i18nBound) {
      selectEl.addEventListener('change', e => setLang(e.target.value));
      selectEl.dataset.i18nBound = '1';
    }
    if (selectEl) selectEl.value = start;

    await setLang(start);

    // 동적으로 추가되는 노드도 번역하고 싶다면 아래 주석 해제
    // new MutationObserver(applyDict).observe(document.body, { childList: true, subtree: true });

    // 전역 노출
    window.i18n = {
      setLang,
      getLang: () => cur,
      t: k => (dict[k] !== undefined ? dict[k] : k)
    };
  }

  // 전역에 등록
  window.initI18n = initI18n;
})();
