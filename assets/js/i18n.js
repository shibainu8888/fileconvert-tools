async function initI18n({ defaultLang = 'ko', filesPath = 'lang', selectEl = '#langSelect' } = {}) {
  const langSelect = document.querySelector(selectEl);

  // 저장된 언어 또는 브라우저 언어 감지
  const savedLang = localStorage.getItem('lang');
  const browserLang = (navigator.language || defaultLang).slice(0, 2);
  const currentLang = savedLang || (['ko', 'en'].includes(browserLang) ? browserLang : defaultLang);

  // 언어 셀렉트 박스 값 세팅
  if (langSelect) {
    langSelect.value = currentLang;
  }

  // 언어 JSON 로드 & 적용 함수
  async function applyLanguage(langCode) {
    try {
      const response = await fetch(`${filesPath}/${langCode}.json`);
      const dictionary = await response.json();

      // data-i18n 속성을 가진 모든 요소의 텍스트 변경
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[key]) {
          el.textContent = dictionary[key];
        }
      });

      // HTML lang 속성 변경
      document.documentElement.lang = langCode;
      // 로컬 저장소에 언어 저장
      localStorage.setItem('lang', langCode);
    } catch (error) {
      console.warn('언어 파일 로드 실패:', error);
    }
  }

  // 초기 언어 적용
  await applyLanguage(currentLang);

  // 셀렉트 박스 변경 시 언어 변경
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }
}
