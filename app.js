/* ============================================================
   BUSINESS SCHOOL AMANAT — APP LOGIC v3.2 (UPDATED)
   ============================================================ */

'use strict';

// ══════════════════════════════ CONSTANTS ══════════════════════════
const SHEET_ID_DEFAULT = '1_y_qWhuJPybW3hPo91t3bRNu-xd0LS3dojfZbI8fk1A';
const LOG_SCRIPT_URL   = 'https://script.google.com/macros/s/AKfycbywfO2d6H0vrXWZUIm3-Ykn5bwIfDC93tPhfNY-eoF4MfQY0Yu4CJiewTQrsVp_vgQk/exec';
const ADMIN_PASSWORD   = 'N20020216$$';
const DEFAULT_COLORS   = ['#e31e24','#9d4ed0','#0055ff','#22c48a','#f5c842','#ff5c35','#229ED9','#e1306c','#ff9800','#00bcd4'];

// ══════════════════════════════ STATE ══════════════════════════════
let lang               = 'ru';
let currentUser        = null;
let gsSheetId          = localStorage.getItem('gs_sheet_id') || SHEET_ID_DEFAULT;
let courses            = [];
let currentCourseIdx   = null;
let currentLessonIndex = 0;
let watchedLessons     = JSON.parse(localStorage.getItem('watched_lessons') || '{}');
let currentTheme       = localStorage.getItem('theme') || 'dark';
let lessonSearchQuery  = '';
let courseSearchQuery  = '';
let currentYtId        = null;
let ytStartTime        = 0;
let tapTimer           = null;
let logoClickCount     = 0;
let logoClickTimer     = null;

let filterCoursesTimer = null;
let filterLessonsTimer = null;
let isCustomFullscreen = false;

let catalogFulfillmentUrl = '';
let catalogGoldUrl        = '';
let waUrl                 = '';
let tgUrl                 = '';

// Переменная для хранения фонового интервала проверки блокировки
let securityCheckInterval = null;

// ══════════════════════════════ TRANSLATIONS ══════════════════════
const T = {
  ru: {
    eyebrow: 'Образовательная платформа',
    loginTitle: 'Добро\nпожаловать',
    loginSub: 'Введите данные для входа. Доступ предоставляется только зарегистрированным участникам.',
    loginHint: 'Введите имя, ИИН и номер телефона, которые вы указывали при заключении договора с Business School Amanat.',
    labelName: 'Ваше имя', labelIin: 'ИИН', labelPhone: 'Номер телефона',
    btnText: 'Войти в платформу', logout: 'Выйти',
    tgNote: 'Есть вопросы? <a href="__TG__" target="_blank" rel="noopener">Написать куратору</a>',
    heroBadge: 'Обучение',
    heroH: 'Начните продавать<br>на <em>маркетплейсах</em>',
    heroSub: 'Выберите платформу и начните обучение прямо сейчас',
    actFfTitle: 'Фулфилмент', actFfDesc: 'Каталог материалов',
    actGoldTitle: 'Алтын / Золото', actGoldDesc: 'Каталог материалов',
    actWaTitle: 'WhatsApp', actWaDesc: 'Написать куратору',
    actTgTitle: 'Telegram', actTgDesc: 'Написать куратору',
    platTitle: 'Платформы для обучения',
    fbTitle: 'Нужна помощь?', fbDesc: 'Задайте вопрос куратору — ответим в течение 24 часов',
    waBtnText: 'WhatsApp', tgBtnText: 'Telegram',
    steps: ['Подключение к серверу...','Поиск в базе данных...','Проверка ИИН...','Проверка оплаты...','Проверка доступа...','Выдача доступа...'],
    errEmpty: 'Заполните все поля', errIin: 'ИИН должен содержать 12 цифр',
    errPhone: 'Введите корректный номер телефона',
    errNotFound: '❌ ИИН не найден в базе. Обратитесь к куратору.',
    errNotPaid: '❌ Оплата не подтверждена. Обратитесь к куратору.',
    errNoAccess: '❌ Доступ не разрешён. Обратитесь к куратору.',
    errNetwork: '⚠ Ошибка соединения. Проверьте интернет и попробуйте снова.',
    errSheetUnavailable: '⚠ Сервер данных временно недоступен. Попробуйте позже или обратитесь к куратору.',
    ok: 'Доступ открыт! Добро пожаловать,', hello: 'Привет,',
    savedOk: '✅ Сохранено!', wrongPw: '❌ Неверный пароль',
    go: 'Открыть', lessons: 'уроков', lesson: 'урок', watched: 'просмотрено',
    prev: 'Пред.', next: 'След.', fileDownload: 'Скачать файл',
    noCourses: 'Курсы загружаются... Обновите страницу если долго.',
    progressCourse: 'Прогресс курса', of: 'из', lessonsWatched: 'уроков просмотрено',
    searchLessons: 'Поиск по урокам...', coursesSearch: 'Поиск курсов...',
    noResults: 'Ничего не найдено',
    mnavCourses: 'Курсы', mnavCat: 'Каталог', mnavHelp: 'Помощь',
    completionTitle: 'Курс завершён! 🎉', completionSub: 'Вы просмотрели все уроки. Отличная работа!',
    linkNotSet: 'Ссылка не настроена',
    imgDownload: 'Скачать', imgOpenOrig: 'Открыть оригинал',
    statusText: 'В сети', userOnline: 'Онлайн',
    courses: 'Курсов', progress: 'Прогресс', watchedStat: 'Уроков',
  },
  kz: {
    eyebrow: 'Білім беру платформасы',
    loginTitle: 'Қош\nкелдіңіз',
    loginSub: 'Кіру үшін деректерді енгізіңіз. Қол жеткізу тек тіркелген қатысушыларға беріледі.',
    loginHint: 'Business School Amanat-пен шарт жасасқанда көрсеткен аты-жөнінiзді, ЖСН-іңізді және телефон нөміріңізді енгізіңіз.',
    labelName: 'Аты-жөніңіз', labelIin: 'ЖСН', labelPhone: 'Телефон нөмірі',
    btnText: 'Платформаға кіру', logout: 'Шығу',
    tgNote: 'Сұрақ бар ма? <a href="__TG__" target="_blank" rel="noopener">Кураторға жазу</a>',
    heroBadge: 'Оқыту',
    heroH: 'Маркетплейстерде<br><em>сатуды бастаңыз</em>',
    heroSub: 'Платформаны таңдаңыз және қазір оқуды бастаңыз',
    actFfTitle: 'Фулфилмент', actFfDesc: 'Материалдар каталогы',
    actGoldTitle: 'Алтын', actGoldDesc: 'Материалдар каталогы',
    actWaTitle: 'WhatsApp', actWaDesc: 'Кураторға жазу',
    actTgTitle: 'Telegram', actTgDesc: 'Кураторға жазу',
    platTitle: 'Оқуға арналған платформалар',
    fbTitle: 'Көмек керек пе?', fbDesc: 'Кураторға сұрақ қойыңыз — 24 сағат ішінде жауап береміз',
    waBtnText: 'WhatsApp', tgBtnText: 'Telegram',
    steps: ['Серверге қосылуда...','Деректер қорынан іздеу...','ЖСН тексеру...','Төлем тексеру...','Рұқсат тексеру...','Рұқсат беру...'],
    errEmpty: 'Барлық өрістерді толтырыңыз', errIin: 'ЖСН 12 саннан тұруы керек',
    errPhone: 'Дұрыс телефон нөмірін енгізіңіз',
    errNotFound: '❌ ЖСН деректер қорында табылмады. Кураторға хабарласыңыз.',
    errNotPaid: '❌ Төлем расталмады. Кураторға хабарласыңыз.',
    errNoAccess: '❌ Рұқсат берілмеген. Кураторға хабарласыңыз.',
    errNetwork: '⚠ Байланыс қатесі. Интернетті тексеріп, қайта көріңіз.',
    errSheetUnavailable: '⚠ Деректер сервері уақытша қолжетімсіз. Кейінірек көріңіз немесе кураторға хабарласыңыз.',
    ok: 'Рұқсат берілді! Қош келдіңіз,', hello: 'Сәлем,',
    savedOk: '✅ Сақталды!', wrongPw: '❌ Қате пароль',
    go: 'Ашу', lessons: 'сабақ', lesson: 'сабақ', watched: 'көрілді',
    prev: 'Алдыңғы', next: 'Келесі', fileDownload: 'Файлды жүктеу',
    noCourses: 'Сабақтар жүктелуде... Беттi жаңартыңыз.',
    progressCourse: 'Курс барысы', of: '/', lessonsWatched: 'сабақ көрілді',
    searchLessons: 'Сабақтарды іздеу...', coursesSearch: 'Курстарды іздеу...',
    noResults: 'Ештеңе табылмады',
    mnavCourses: 'Курстар', mnavCat: 'Каталог', mnavHelp: 'Көмек',
    completionTitle: 'Курс аяқталды! 🎉', completionSub: 'Барлық сабақты көрдіңіз. Керемет жұмыс!',
    linkNotSet: 'Сілтеме орнатылмаған',
    imgDownload: 'Жүктеу', imgOpenOrig: 'Түпнұсқаны ашу',
    statusText: 'Желіде', userOnline: 'Онлайн',
    courses: 'Курс', progress: 'Барысы', watchedStat: 'Сабақ',
  }
};

const t       = k => (T[lang] && T[lang][k]) ? T[lang][k] : k;
const $       = id => document.getElementById(id);
const setText = (id, v) => { const e=$(id); if(e) e.textContent = v; };
const setHtml = (id, v) => { const e=$(id); if(e) e.innerHTML = v; };
const setHref = (id, url) => { const e=$(id); if(e && url) e.href = url; };
const sleep   = ms => new Promise(r => setTimeout(r, ms));

// ══════════════════════════════ CURSOR ════════════════════════════
// Кастомный курсор убран — используется стандартный курсор браузера
// с CSS-подсветкой на интерактивных элементах (см. style.css)

// ══════════════════════════════ THEME ════════════════════════════
function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
}
function toggleTheme() {
  document.documentElement.classList.add('theme-transitioning');
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  initTheme();
  setTimeout(function() { document.documentElement.classList.remove('theme-transitioning'); }, 400);
}
initTheme();

// ══════════════════════════════ LANGUAGE ══════════════════════════
function setLang(l) {
  lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
  applyTexts();
  if (currentCourseIdx !== null && $('lesson-modal').classList.contains('show')) {
    renderLessonList(currentCourseIdx);
    updateModalProgress(currentCourseIdx);
  }
  renderCoursesGrid();
  updateHeroStats();
}

// ══════════════════════════════ APPLY TEXTS ═══════════════════════
function applyTexts() {
  setText('eyebrow-text',     t('eyebrow'));
  setHtml('login-title',      t('loginTitle').replace('\n','<br>'));
  setText('login-subtitle',   t('loginSub'));
  setText('login-hint-text',  t('loginHint'));
  setText('label-name',       t('labelName'));
  setText('label-iin',        t('labelIin'));
  setText('label-phone',      t('labelPhone'));
  setText('btn-text',         t('btnText'));
  setText('logout-label',     t('logout'));
  setHtml('tg-note',          t('tgNote').replace('__TG__', tgUrl || '#'));
  setHtml('hero-badge',       `<span class="badge-pulse"></span>${t('heroBadge')}`);
  setHtml('hero-h',           t('heroH'));
  setText('hero-sub',         t('heroSub'));
  setText('act-ff-title',     t('actFfTitle'));
  setText('act-ff-desc',      t('actFfDesc'));
  setText('act-gold-title',   t('actGoldTitle'));
  setText('act-gold-desc',    t('actGoldDesc'));
  setText('act-wa-title',     t('actWaTitle'));
  setText('act-wa-desc',      t('actWaDesc'));
  setText('act-tg-title',     t('actTgTitle'));
  setText('act-tg-desc',      t('actTgDesc'));
  setText('plat-title',       t('platTitle'));
  setText('fb-title',         t('fbTitle'));
  setText('fb-desc',          t('fbDesc'));
  setText('wa-btn-text',      t('waBtnText'));
  setText('tg-btn-text',      t('tgBtnText'));
  setText('prev-label',       t('prev'));
  setText('next-label',       t('next'));
  setText('mps-title',        t('progressCourse'));
  setText('completion-title', t('completionTitle'));
  setText('completion-sub',   t('completionSub'));
  setText('img-dl-text',      t('imgDownload'));
  setText('img-open-text',    t('imgOpenOrig'));
  setText('mnav-courses',     t('mnavCourses'));
  setText('mnav-cat',         t('mnavCat'));
  setText('mnav-help',        t('mnavHelp'));
  setText('user-status-text', t('statusText'));
  const ls = $('lesson-search'); if(ls) ls.placeholder = t('searchLessons');
  const cs = $('course-search'); if(cs) cs.placeholder = t('coursesSearch');
  if (currentUser) setText('user-name-badge', t('hello') + ' ' + currentUser);
  document.querySelectorAll('.deco-lbl').forEach(el => { const v = el.dataset[lang]; if (v) el.textContent = v; });
  document.querySelectorAll('.hstat-lbl').forEach(el => { const v = el.dataset[lang]; if (v) el.textContent = v; });
}

// ══════════════════════════════ CSV PARSING ═══════════════════════
function parseCSV(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const cells = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if      (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { cells.push(cur); cur = ''; }
      else    cur += ch;
    }
    cells.push(cur);
    rows.push(cells.map(c => c.trim()));
  }
  return rows;
}
const strip = s => (s || '').replace(/^"|"$/g, '').trim();

// ══════════════════════════════ SECURITY LIVE MONITOR ═════════════
function startSecurityMonitor() {
  if (securityCheckInterval) clearInterval(securityCheckInterval);
  
  securityCheckInterval = setInterval(async () => {
    let currentIin = null;
    try { currentIin = sessionStorage.getItem('bs_iin'); } catch(_) {}
    if (!currentUser || !currentIin) return;

    try {
      // Запрашиваем Лист1 (база пользователей с флагами доступа)
      const url = `https://docs.google.com/spreadsheets/d/${gsSheetId}/gviz/tq?tqx=out:csv`;
      const res = await fetch(url);
      if (!res.ok) return; // Если сбой сети — не прерываем сессию до следующей попытки
      
      const csv = await res.text();
      const rows = parseCSV(csv);
      
      let found = false;
      let isAllowed = false;
      let isPaid = false;

      for (const row of rows) {
        if (strip(row[0]) === currentIin) {
          found = true;
          const sA  = (strip(row[10]) || '').toUpperCase();
          const sP  = (strip(row[11]) || '').toUpperCase();
          isAllowed = sA.includes('✅') && (sA.includes('РАЗРЕШЕНО') || sA.includes('РҰҚСАТ'));
          isPaid    = sP.includes('✅') && (sP.includes('ОПЛАЧЕНО')  || sP.includes('ТӨЛЕНДІ'));
          break;
        }
      }

      // Если ИИН удален, закрыт доступ или снята оплата — мгновенно блокируем сессию
      if (!found || !isAllowed || !isPaid) {
        triggerInstantBlock();
      }
    } catch (e) {
      console.warn('Security monitor tick failed:', e);
    }
  }, 10000); // Интервал проверки — 10 секунд
}

function triggerInstantBlock() {
  if (securityCheckInterval) clearInterval(securityCheckInterval);
  
  // Принудительно чистим сессию
  currentUser = null;
  currentCourseIdx = null;
  try {
    sessionStorage.removeItem('bs_user');
    sessionStorage.removeItem('bs_iin');
  } catch (_) {}

  // Глушим видеоплеер
  const slot = $('video-slot');
  if (slot) slot.innerHTML = '';

  // Закрываем все всплывающие окна, если они были открыты
  $('lesson-modal').classList.remove('show', 'video-active');
  $('video-section').style.display = 'none';

  // Прячем основные рабочие экраны платформы
  $('lessons-page').style.display = 'none';
  $('logout-btn').style.display   = 'none';
  $('mobile-nav').style.display   = 'none';
  
  // Показываем оверлей принудительной блокировки
  const blockOverlay = $('block-overlay');
  if (blockOverlay) {
    blockOverlay.style.display = 'flex';
  } else {
    // Если оверлей не добавлен в HTML, откатываем на страницу логина с ошибкой
    $('login-page').style.display = 'flex';
    showMsg('error', t('errNoAccess'));
  }
}

// ══════════════════════════════ LOAD SHEET 2 ══════════════════════
async function loadSheet2() {
  if (!gsSheetId) return;
  try {
    const url = `https://docs.google.com/spreadsheets/d/${gsSheetId}/gviz/tq?tqx=out:csv&sheet=Лист2`;
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 12000);
    let res;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) { console.error('Sheet2 HTTP error', res.status); showSheetError(); return; }
    const csv  = await res.text();
    const rows = parseCSV(csv);

    catalogFulfillmentUrl = strip((rows[2] || [])[0]) || '';
    catalogGoldUrl        = strip((rows[3] || [])[0]) || '';
    waUrl                 = strip((rows[4] || [])[0]) || '';
    tgUrl                 = strip((rows[5] || [])[0]) || '';

    courses = [];
    let maxCol = 0;
    rows.forEach(r => { if (r.length > maxCol) maxCol = r.length; });

    for (let i = 0; ; i++) {
      const colKZ = 1 + 2 * i;
      const colRU = 2 + 2 * i;
      if (colKZ >= maxCol) break;
      const nameKZ = strip((rows[0] || [])[colKZ]);
      const nameRU = strip((rows[0] || [])[colRU]);
      if (!nameKZ && !nameRU) break;
      const iconUrl  = strip((rows[1] || [])[colKZ]);
      const hexColor = strip((rows[1] || [])[colRU]);
      const lessonsKZ = [], lessonsRU = [];
      for (let r = 2; r < rows.length; r++) {
        const row   = rows[r] || [];
        const rawKZ = strip(row[colKZ]);
        const rawRU = strip(row[colRU]);
        if (!rawKZ && !rawRU) continue;
        lessonsKZ.push(parseLesson(rawKZ));
        lessonsRU.push(parseLesson(rawRU));
      }
      courses.push({ nameKZ, nameRU, iconUrl, hexColor, lessonsKZ, lessonsRU });
    }

    applyLinks();
    applyTexts();
    renderCoursesGrid();
    updateHeroStats();
    renderDemoGrid(); // показать превью курсов на странице логина
  } catch (e) {
    console.error('Sheet2 load error', e);
    showSheetError();
  }
}

function showSheetError() {
  const grid = $('platforms-grid');
  if (grid) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text3);font-size:14px;line-height:2">
      <div style="font-size:36px;margin-bottom:12px">⚠️</div>
      <div style="color:var(--text2);font-weight:600;margin-bottom:8px;font-size:15px">Не удалось загрузить курсы</div>
      <div style="font-size:13px;margin-bottom:20px">${t('errSheetUnavailable')}</div>
      <button onclick="loadSheet2()" style="background:linear-gradient(135deg,var(--gold),var(--gold2));border:none;border-radius:10px;padding:11px 24px;font-size:13px;font-weight:700;color:#000;cursor:pointer;font-family:'DM Sans',sans-serif">
        Попробовать снова
      </button>
    </div>`;
  }
}

function parseLesson(raw) {
  if (!raw) return { type: 'empty', url: '', name: '' };
  if (raw.startsWith('header:')) return { type: 'header', url: '', name: raw.slice(7).trim() };
  if (raw.startsWith('img:')) {
    const rest = raw.slice(4).trim(), p = rest.indexOf('|');
    return p > -1
      ? { type: 'image', url: rest.slice(0, p).trim(), name: rest.slice(p + 1).trim() }
      : { type: 'image', url: rest, name: '' };
  }
  if (raw.startsWith('file:')) {
    const rest = raw.slice(5).trim(), p = rest.indexOf('|'), c = rest.indexOf(',');
    const s = p > -1 ? p : (c > -1 ? c : -1);
    return s > -1
      ? { type: 'file', url: rest.slice(0, s).trim(), name: rest.slice(s + 1).trim() }
      : { type: 'file', url: rest, name: 'Файл' };
  }
  if (raw.startsWith('link:')) {
    const rest = raw.slice(5).trim(), p = rest.indexOf('|');
    return p > -1
      ? { type: 'link', url: rest.slice(0, p).trim(), name: rest.slice(p + 1).trim() }
      : { type: 'link', url: rest, name: rest };
  }
  if (raw.startsWith('text:')) return { type: 'text', url: '', name: raw.slice(5).trim() };
  const lower = raw.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/.test(lower)) return { type: 'image', url: raw, name: '' };
  if (raw.includes('drive.google.com') && raw.includes('thumbnail')) return { type: 'image', url: raw, name: '' };
  const p = raw.indexOf('|');
  if (p > -1) return { type: 'video', url: raw.slice(0, p).trim(), name: raw.slice(p + 1).trim() };
  return { type: 'video', url: raw, name: '' };
}

// ══════════════════════════════ APPLY LINKS ═══════════════════════
function applyLinks() {
  const setLink = (id, url, fallback) => {
    const el = $(id);
    if (!el) return;
    el.href = url || '#';
    if (!url && fallback) {
      el.onclick = e => { e.preventDefault(); showToast(t('linkNotSet'), 'error'); };
    } else {
      el.onclick = null;
    }
  };
  setLink('submenu-fulfillment', catalogFulfillmentUrl, true);
  setLink('submenu-gold',        catalogGoldUrl, true);
  setLink('wa-action-link',      waUrl, true);
  setLink('tg-action-link',      tgUrl, true);
  setLink('wa-btn',              waUrl);
  setLink('tg-btn',              tgUrl);
  setLink('cat-modal-ff',        catalogFulfillmentUrl);
  setLink('cat-modal-gold',      catalogGoldUrl);
  const tn = $('tg-note');
  if (tn) tn.innerHTML = t('tgNote').replace('__TG__', tgUrl || '#');
}

// ══════════════════════════════ PROGRESS ══════════════════════════
const getWatchKey = (ci, li) => `${ci}-${li}`;
const isWatched   = (ci, li) => !!watchedLessons[getWatchKey(ci, li)];

function markWatched(ci, li) {
  watchedLessons[getWatchKey(ci, li)] = true;
  localStorage.setItem('watched_lessons', JSON.stringify(watchedLessons));
  saveProgressToSheet(ci, li);
}

// ──── Сохранение прогресса в Google-таблицу ────
function saveProgressToSheet(ci, li) {
  try {
    const iin = sessionStorage.getItem('bs_iin');
    if (!iin || !LOG_SCRIPT_URL) return;
    const course = courses[ci];
    const courseName = course ? (course.nameRU || course.nameKZ || ('Курс ' + ci)) : ('Курс ' + ci);
    fetch(LOG_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _type: 'progress',
        iin, name: currentUser || '—',
        courseIdx: ci, lessonIdx: li,
        courseName,
        watchedJson: JSON.stringify(watchedLessons)
      })
    });
  } catch(e) { console.warn('progress save fail', e); }
}

// ──── Восстановление прогресса из таблицы (при входе) ────
async function loadProgressFromSheet(iin) {
  if (!iin || !LOG_SCRIPT_URL) return;
  try {
    const url = LOG_SCRIPT_URL + '?action=getProgress&iin=' + encodeURIComponent(iin);
    const r = await fetch(url);
    if (!r.ok) return;
    const j = await r.json();
    if (j && j.ok && j.watchedJson) {
      const remote = JSON.parse(j.watchedJson);
      watchedLessons = Object.assign({}, watchedLessons, remote);
      localStorage.setItem('watched_lessons', JSON.stringify(watchedLessons));
    }
  } catch(e) { console.warn('progress load fail', e); }
}
function getLessons(idx) {
  const c = courses[idx];
  if (!c) return [];
  return lang === 'kz' ? c.lessonsKZ : c.lessonsRU;
}
function getVideoLessons(idx) {
  return getLessons(idx).map((l, i) => ({ lesson: l, absIdx: i })).filter(x => x.lesson.type === 'video');
}
function getCourseProgress(idx) {
  const vl = getVideoLessons(idx);
  if (!vl.length) return { watched: 0, total: 0, pct: 0 };
  const w = vl.filter(x => isWatched(idx, x.absIdx)).length;
  return { watched: w, total: vl.length, pct: Math.round(w / vl.length * 100) };
}
function getTotalProgress() {
  let totalW = 0, totalT = 0;
  courses.forEach((_, i) => {
    const p = getCourseProgress(i);
    totalW += p.watched; totalT += p.total;
  });
  return { watched: totalW, total: totalT, pct: totalT ? Math.round(totalW / totalT * 100) : 0 };
}

// ══════════════════════════════ HERO STATS ════════════════════════
function updateHeroStats() {
  const prog = getTotalProgress();
  animNumber('hstat-courses', courses.length);
  animNumber('hstat-watched', prog.watched);
  const pctEl = $('hstat-progress');
  if (pctEl) {
    let from = 0, to = prog.pct;
    const dur = 800, start = Date.now();
    (function f() {
      const p = Math.min(1, (Date.now() - start) / dur);
      pctEl.textContent = Math.round(from + (to - from) * easeOut(p)) + '%';
      if (p < 1) requestAnimationFrame(f);
    })();
  }
  const cc = $('courses-count');
  if (cc) cc.textContent = courses.length;
}
function animNumber(id, to) {
  const el = $(id); if (!el) return;
  let from = 0;
  const dur = 900, start = Date.now();
  (function f() {
    const p = Math.min(1, (Date.now() - start) / dur);
    el.textContent = Math.round(from + (to - from) * easeOut(p));
    if (p < 1) requestAnimationFrame(f);
  })();
}
const easeOut = t => 1 - Math.pow(1 - t, 3);

// ══════════════════════════════ COURSES GRID ═════════════════════
function renderCoursesGrid() {
  const grid = $('platforms-grid');
  if (!grid) return;
  const query = courseSearchQuery.toLowerCase().trim();
  const filtered = query
    ? courses.filter(c => {
        const n = (lang === 'kz' ? (c.nameKZ || c.nameRU) : (c.nameRU || c.nameKZ)).toLowerCase();
        return n.includes(query);
      })
    : courses;

  if (courses.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text3);font-size:14px">${t('noCourses')}</div>`;
    return;
  }
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text3);font-size:14px">${t('noResults')}</div>`;
    return;
  }

  grid.innerHTML = filtered.map((course, fi) => {
    const idx        = courses.indexOf(course);
    const name       = lang === 'kz' ? (course.nameKZ || course.nameRU) : (course.nameRU || course.nameKZ);
    const lessons    = lang === 'kz' ? course.lessonsKZ : course.lessonsRU;
    const videoCount = lessons.filter(l => l.type === 'video').length;
    const color      = course.hexColor || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    const initials   = name.substring(0, 2).toUpperCase();
    const delay      = fi * 0.06;
    const prog       = getCourseProgress(idx);

    const iconHtml = course.iconUrl
      ? `<img src="${course.iconUrl}" alt="${name}" onerror="this.style.display='none';this.parentNode.textContent='${initials}'">`
      : initials;

    const progressBlock = videoCount > 0 ? `
      <div class="pc-progress-wrap">
        <div class="pc-progress-row">
          <span class="pc-progress-label">${prog.watched} ${t('of')} ${prog.total} ${t('lessons')}</span>
          <span class="pc-progress-pct" style="color:${color}">${prog.pct}%</span>
        </div>
        <div class="pc-progress-track">
          <div class="pc-progress-fill" style="width:${prog.pct}%;background:linear-gradient(90deg,${color},${lightenHex(color,20)})"></div>
        </div>
      </div>` : '';

    return `<div class="platform-card" style="--card-accent:${color};--card-glow:${hexToRgba(color,0.06)};animation-delay:${delay}s" onclick="openLesson(${idx})">
      <div class="pc-body">
        <div class="pc-logo">
          <div class="pc-icon" style="background:linear-gradient(140deg,${color},${darkenHex(color,20)})">${iconHtml}</div>
          <span class="pc-name">${escHtml(name)}</span>
        </div>
        <p class="pc-desc">${videoCount} ${t('lessons')}</p>
      </div>
      ${progressBlock}
      <div class="pc-footer">
        <span class="pc-count">
          <span class="dot" style="background:${color}"></span>
          ${videoCount} ${t('lessons')}
        </span>
        <span class="pc-cta" style="color:${color}">
          <span>${t('go')}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </div>
    </div>`;
  }).join('');

  updateHeroStats();
}

function filterCourses(q) {
  clearTimeout(filterCoursesTimer);
  filterCoursesTimer = setTimeout(() => { courseSearchQuery = q; renderCoursesGrid(); }, 220);
}
function filterLessons(q) {
  clearTimeout(filterLessonsTimer);
  filterLessonsTimer = setTimeout(() => {
    lessonSearchQuery = q;
    if (currentCourseIdx !== null) renderLessonList(currentCourseIdx);
  }, 220);
}

// ══════════════════════════════ DEMO GRID (превью без авторизации) ══
function renderDemoGrid() {
  const section = $('demo-section');
  const grid    = $('demo-grid');
  if (!section || !grid) return;
  if (currentUser) { section.style.display = 'none'; return; } // скрыть после входа
  if (courses.length === 0) { section.style.display = 'none'; return; }

  const msg = lang === 'kz'
    ? 'Сабақтарға қол жеткізу үшін кіріңіз'
    : 'Войдите чтобы получить доступ к урокам';

  grid.innerHTML = courses.map((course, idx) => {
    const name       = lang === 'kz' ? (course.nameKZ || course.nameRU) : (course.nameRU || course.nameKZ);
    const lessons    = lang === 'kz' ? course.lessonsKZ : course.lessonsRU;
    const videoCount = lessons.filter(l => l.type === 'video').length;
    const color      = course.hexColor || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    const initials   = name.substring(0, 2).toUpperCase();
    const iconHtml   = course.iconUrl
      ? `<img src="${course.iconUrl}" alt="${name}" onerror="this.style.display='none';this.parentNode.textContent='${initials}'">`
      : initials;

    return `<div class="platform-card demo-locked-card" style="--card-accent:${color};--card-glow:${hexToRgba(color,0.06)}"
        onclick="showToast('${msg}','error')">
      <div class="demo-lock-badge">🔒</div>
      <div class="pc-body">
        <div class="pc-logo">
          <div class="pc-icon" style="background:linear-gradient(140deg,${color},${darkenHex(color,20)})">${iconHtml}</div>
          <span class="pc-name">${escHtml(name)}</span>
        </div>
        <p class="pc-desc">${videoCount} ${t('lessons')}</p>
      </div>
      <div class="pc-footer">
        <span class="pc-count">
          <span class="dot" style="background:${color}"></span>
          ${videoCount} ${t('lessons')}
        </span>
        <span style="font-size:13px;font-weight:700;color:${color};opacity:.5">🔒</span>
      </div>
    </div>`;
  }).join('');

  section.style.display = 'block';
}

// ══════════════════════════════ КАСТОМНЫЙ FULLSCREEN ════════════
function toggleCustomFullscreen() {
  const container = $('video-container');
  const btn       = $('fs-btn');
  if (!container) return;
  isCustomFullscreen = !isCustomFullscreen;
  if (isCustomFullscreen) {
    container.classList.add('custom-fullscreen');
    if (btn) btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
        <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
      </svg>`;
    document.body.style.overflow = 'hidden';
  } else {
    container.classList.remove('custom-fullscreen');
    if (btn) btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
      </svg>`;
    document.body.style.overflow = '';
  }
  // Пересчитываем блокировщики YouTube под новый размер — ждём 2 фрейма чтобы CSS успел примениться
  var slot = $('video-slot');
  if (slot && $('video-container').querySelector('#yt-player-iframe')) {
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        installYtBlockers(slot);
        setTimeout(function() { installYtBlockers(slot); }, 120);
        setTimeout(function() { installYtBlockers(slot); }, 400);
      });
    });
  }
}

// ══════════════════════════════ СКРОЛЛ К "НАЧНИ ЗДЕСЬ" ═══════════
function scrollToStartLesson() {
  setTimeout(() => {
    const ul = $('lp-list');
    if (!ul) return;
    let target = ul.querySelector('.is-current-lesson');
    if (!target) {
      const items = ul.querySelectorAll('li');
      for (const li of items) {
        if (li.querySelector && li.querySelector('.cursor-tag.start')) { target = li; break; }
      }
    }
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.style.transition = 'background .4s';
      target.style.background = 'rgba(245,200,66,0.1)';
      setTimeout(() => { target.style.background = ''; }, 1600);
    }
  }, 250);
}

// ══════════════════════════════ OPEN LESSON MODAL ════════════════
function openLesson(idx) {
  currentCourseIdx = idx;
  $('video-section').style.display = 'none';
  $('video-slot').innerHTML = '';
  var _vc = $('video-container'); if (_vc) _vc.style.display = 'none';
  var _lp = $('lp-title'); if (_lp) _lp.style.display = '';
  $('lesson-modal').classList.remove('video-active');

  const course = courses[idx];
  const name   = lang === 'kz' ? (course.nameKZ || course.nameRU) : (course.nameRU || course.nameKZ);
  const color  = course.hexColor || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

  const modal = $('lesson-modal').querySelector('.modal');
  if (modal) modal.style.setProperty('--card-accent-modal', color);

  const badge = $('lp-badge');
  badge.textContent = name;
  badge.style.cssText = `background:${hexToRgba(color, 0.14)};color:${color};display:inline-flex;align-items:center;border-radius:9px;padding:5px 14px;font-size:11px;font-weight:800;letter-spacing:0.6px;margin-bottom:16px;text-transform:uppercase`;

  $('lp-title').textContent = name;
  $('lp-sub').textContent   = '';
  const ls = $('lesson-search'); if(ls) { ls.value = ''; }
  lessonSearchQuery = '';

  renderLessonList(idx);
  updateModalProgress(idx);
  $('lesson-modal').classList.add('show');
  scrollToStartLesson();
}

function updateModalProgress(idx) {
  const prog = getCourseProgress(idx);
  const fill = $('mps-fill'), pct = $('mps-pct'), sub = $('mps-sub');
  if (fill) fill.style.width = prog.pct + '%';
  if (pct)  pct.textContent  = prog.pct + '%';
  if (sub)  sub.textContent  = `${prog.watched} ${t('of')} ${prog.total} ${t('lessonsWatched')}`;
  const sec = $('modal-progress-section');
  if (sec) sec.style.display = prog.total > 0 ? 'block' : 'none';
  const banner = $('completion-banner');
  if (banner) banner.classList.toggle('show', prog.total > 0 && prog.watched === prog.total);
}

// ══════════════════════════════ LESSON LIST ═══════════════════════
let _suggestStartLessonIdx = -1;
function renderLessonList(idx) {
  const lessons  = getLessons(idx);
  const color    = courses[idx]?.hexColor || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
  const query    = lessonSearchQuery.toLowerCase().trim();
  let videoSeq   = 0, hasResults = false;
  _suggestStartLessonIdx = -1;

  const html = lessons.map((lesson, i) => {
    if (lesson.type === 'empty') return '';

    if (lesson.type === 'header') {
      if (query) return '';
      return `<li class="is-section-header"><span class="section-header-text">${escHtml(lesson.name)}</span></li>`;
    }

    if (lesson.type === 'image') {
      const imgName = lesson.name || (lang === 'kz' ? 'Сурет' : 'Изображение');
      if (query && !imgName.toLowerCase().includes(query)) return '';
      hasResults = true;
      return `<li class="clickable" onclick="openImageViewer('${safeAttr(lesson.url)}','${safeAttr(imgName)}')">
        <span class="lnum" style="border-color:${color};color:${color};font-size:14px">🖼</span>
        <span class="l-title" style="color:var(--text)">${escHtml(imgName)}</span>
        <span class="l-play" style="color:${color}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </span></li>`;
    }

    if (lesson.type === 'text') {
      if (query) return '';
      return `<li class="is-text-block"><div class="lesson-text-block">${escHtml(lesson.name)}</div></li>`;
    }

    if (lesson.type === 'link') {
      const match = !query || (lesson.name || '').toLowerCase().includes(query) || (lesson.url || '').toLowerCase().includes(query);
      if (!match) return '';
      hasResults = true;
      return `<li class="clickable is-link-item" onclick="window.open('${safeAttr(lesson.url)}','_blank')">
        <div class="lesson-link-icon" style="background:${hexToRgba(color,0.12)};color:${color}">🔗</div>
        <span class="l-title" style="color:${color};font-weight:600">${escHtml(lesson.name || lesson.url)}</span>
        <span style="font-size:11px;opacity:.5;color:${color};flex-shrink:0">↗</span></li>`;
    }

    if (lesson.type === 'file') {
      if (query && !(lesson.name || '').toLowerCase().includes(query)) return '';
      hasResults = true;
      return `<li class="clickable" onclick="window.open('${safeAttr(lesson.url)}','_blank')">
        <span class="lnum" style="border-color:${color};color:${color}">📎</span>
        <span class="l-title">${escHtml(lesson.name || t('fileDownload'))}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></li>`;
    }

    // Video
    const vIdx       = videoSeq++;
    const lessonName = lesson.name || (lang === 'kz' ? `Сабақ ${vIdx + 1}` : `Урок ${vIdx + 1}`);
    const hasLink    = lesson.url && lesson.url.length > 4;
    const watched    = isWatched(idx, i);
    const isCurrent  = (idx === currentCourseIdx && i === currentLessonIndex && $('video-section') && $('video-section').style.display !== 'none');

    if (query && !lessonName.toLowerCase().includes(query)) return '';
    hasResults = true;

    // "Начни здесь" = первый невидимый видео-урок (если ничего ещё не смотрелось текущим)
    if (!isCurrent && !watched && _suggestStartLessonIdx === -1) _suggestStartLessonIdx = i;
    const isStartHere = (!isCurrent && !watched && i === _suggestStartLessonIdx);

    const cursorTag = isCurrent
      ? `<span class="cursor-tag here" style="background:${color};color:#fff">▶ ${lang==='kz'?'СІЗ ОСЫНДА':'ВЫ ТУТ'}</span>`
      : (isStartHere ? `<span class="cursor-tag start" style="background:${hexToRgba(color,0.18)};color:${color};border:1px dashed ${color}">🎯 ${lang==='kz'?'ОСЫДАН БАСТА':'НАЧНИ ЗДЕСЬ'}</span>` : '');

    return `<li class="clickable${watched ? ' watched' : ''}${isCurrent?' is-current-lesson':''}" onclick="playLesson(${idx},${i})">
      <span class="lnum" style="${watched
        ? 'border-color:var(--green);color:var(--green);background:rgba(34,196,138,0.1)'
        : `border-color:${color};color:${color}`}">${watched ? '✓' : vIdx + 1}</span>
      <span class="l-title">${escHtml(lessonName)}</span>
      ${cursorTag}
      ${watched
        ? `<span class="l-check">✓</span>`
        : (hasLink
          ? `<span class="l-play" style="color:${color}"><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>`
          : '<span style="font-size:11px;color:var(--text3)">—</span>')
      }</li>`;
  }).join('');

  const ul = $('lp-list');
  if (query && !hasResults) {
    ul.innerHTML = `<li style="border:none;padding:24px 0;justify-content:center"><span style="color:var(--text3);font-size:13px">${t('noResults')}</span></li>`;
  } else {
    ul.innerHTML = html;
  }
}

// ══════════════════════════════ CLOSE LESSON ══════════════════════
function closeLesson() {
  if (isCustomFullscreen) toggleCustomFullscreen();
  $('lesson-modal').classList.remove('show', 'video-active');
  $('video-section').style.display = 'none';
  var _vc3 = $('video-container'); if (_vc3) _vc3.style.display = 'none';
  var _lp3 = $('lp-title'); if (_lp3) _lp3.style.display = '';
  // Уничтожаем YT.Player если был активен
  if (_ytPlayer && typeof _ytPlayer.destroy === 'function') {
    try { _ytPlayer.destroy(); } catch(e) {}
    _ytPlayer = null;
  }
  $('video-slot').innerHTML = '';
  currentLessonIndex = 0; lessonSearchQuery = '';
  $('completion-banner').classList.remove('show');
  renderCoursesGrid();
  updateHeroStats();
}

// ══════════════════════════════ IMAGE VIEWER ══════════════════════
function openImageViewer(url, name) {
  $('img-viewer-src').src           = url;
  $('img-viewer-src').alt           = name;
  $('img-viewer-title').textContent = name;
  $('img-viewer-dl').href           = url;
  $('img-viewer-dl').download       = name;
  $('img-viewer-open').href         = url;
  $('img-viewer-modal').classList.add('show');
}
function closeImageViewer() {
  $('img-viewer-modal').classList.remove('show');
  setTimeout(() => { $('img-viewer-src').src = ''; }, 300);
}

// ===== CUSTOM YOUTUBE PLAYER (bizon365-style: no YT controls) =====
let _ytApiReady = false;
let _ytApiCallbacks = [];
function loadYtApi(cb) {
  if (_ytApiReady) { cb(); return; }
  _ytApiCallbacks.push(cb);
  if (document.getElementById('yt-api-script')) return;
  window.onYouTubeIframeAPIReady = function () {
    _ytApiReady = true;
    _ytApiCallbacks.forEach(fn => fn());
    _ytApiCallbacks = [];
  };
  const s = document.createElement('script');
  s.id = 'yt-api-script';
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

let _ytPlayer = null; // активный YT.Player

function buildCustomYtPlayer(slot, ytId) {
  slot.innerHTML = '';
  hideTapZones();

  // Контейнер плеера
  const wrap = document.createElement('div');
  wrap.id = 'cyt-wrap';
  wrap.style.cssText = 'position:absolute;inset:0;background:#000;overflow:hidden;';

  // Div для YT.Player (iframe вставится сюда)
  const playerDiv = document.createElement('div');
  playerDiv.id = 'cyt-player-div';
  playerDiv.style.cssText = 'position:absolute;top:-60px;left:0;width:100%;height:calc(100% + 120px);';
  wrap.appendChild(playerDiv);

  // Оверлей управления поверх видео
  const ctrl = document.createElement('div');
  ctrl.id = 'cyt-ctrl';
  ctrl.style.cssText = `
    position:absolute;inset:0;z-index:20;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    cursor:pointer;-webkit-tap-highlight-color:transparent;
  `;

  // Большая кнопка play по центру (скрывается при воспроизведении)
  const playBtn = document.createElement('div');
  playBtn.id = 'cyt-play-btn';
  playBtn.style.cssText = `
    width:80px;height:80px;background:rgba(0,0,0,0.65);border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 24px rgba(0,0,0,0.6);
    transition:opacity 0.3s,transform 0.15s;
    pointer-events:none;
  `;
  playBtn.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" style="margin-left:4px"><polygon points="5 3 19 12 5 21"/></svg>`;
  ctrl.appendChild(playBtn);

  // Нижняя панель кастомных контролов
  const bar = document.createElement('div');
  bar.id = 'cyt-bar';
  bar.style.cssText = `
    position:absolute;bottom:0;left:0;right:0;
    background:linear-gradient(transparent,rgba(0,0,0,0.85));
    padding:32px 14px 10px;
    opacity:0;transition:opacity 0.3s;
    display:flex;flex-direction:column;gap:6px;
    pointer-events:none;
  `;

  // Прогресс-бар
  const progWrap = document.createElement('div');
  progWrap.style.cssText = 'position:relative;height:4px;background:rgba(255,255,255,0.3);border-radius:2px;cursor:pointer;pointer-events:auto;';
  const progFill = document.createElement('div');
  progFill.id = 'cyt-progress';
  progFill.style.cssText = 'height:100%;width:0%;background:var(--gold,#f5c842);border-radius:2px;transition:width 0.5s linear;';
  progWrap.appendChild(progFill);
  bar.appendChild(progWrap);

  // Кнопки нижней строки
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;align-items:center;gap:10px;pointer-events:auto;';

  const btnStyle = `background:none;border:none;color:#fff;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;opacity:0.9;-webkit-tap-highlight-color:transparent;`;

  // Play/Pause кнопка
  const ppBtn = document.createElement('button');
  ppBtn.id = 'cyt-pp';
  ppBtn.style.cssText = btnStyle;
  ppBtn.innerHTML = `<svg id="cyt-pp-icon" width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>`;

  // Кнопка -10 сек
  const rew10Btn = document.createElement('button');
  rew10Btn.id = 'cyt-rew10';
  rew10Btn.style.cssText = btnStyle + 'min-width:40px;';
  rew10Btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="15" text-anchor="middle" font-size="5.5" font-family="sans-serif" font-weight="bold" fill="white">10</text></svg>`;

  // Кнопка +10 сек
  const fwd10Btn = document.createElement('button');
  fwd10Btn.id = 'cyt-fwd10';
  fwd10Btn.style.cssText = btnStyle + 'min-width:40px;';
  fwd10Btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="15" text-anchor="middle" font-size="5.5" font-family="sans-serif" font-weight="bold" fill="white">10</text></svg>`;

  // Время
  const timeEl = document.createElement('span');
  timeEl.id = 'cyt-time';
  timeEl.style.cssText = 'color:#fff;font-size:12px;font-family:sans-serif;flex:1;text-align:center;';
  timeEl.textContent = '0:00 / 0:00';

  btnRow.appendChild(ppBtn);
  btnRow.appendChild(rew10Btn);
  btnRow.appendChild(fwd10Btn);
  btnRow.appendChild(timeEl);
  bar.appendChild(btnRow);
  ctrl.appendChild(bar);
  wrap.appendChild(ctrl);
  slot.appendChild(wrap);

  // Показ/скрытие панели при hover/tap
  let hideBarTimer = null;
  function showBar() {
    bar.style.opacity = '1';
    bar.style.pointerEvents = 'auto';
    clearTimeout(hideBarTimer);
    hideBarTimer = setTimeout(hideBar, 3000);
  }
  function hideBar() {
    bar.style.opacity = '0';
    bar.style.pointerEvents = 'none';
  }
  ctrl.addEventListener('mouseenter', showBar);
  ctrl.addEventListener('mouseleave', hideBar);
  ctrl.addEventListener('touchstart', (e) => {
    if (bar.style.opacity === '0') { showBar(); }
  }, { passive: true });

  // Форматирование времени
  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2,'0')}`;
  }

  let isPlaying = false;
  let progTimer = null;

  function updateProgress() {
    if (!_ytPlayer || typeof _ytPlayer.getCurrentTime !== 'function') return;
    try {
      const cur = _ytPlayer.getCurrentTime() || 0;
      const dur = _ytPlayer.getDuration() || 0;
      if (dur > 0) {
        progFill.style.width = (cur / dur * 100) + '%';
        timeEl.textContent = fmt(cur) + ' / ' + fmt(dur);
      }
    } catch(e) {}
  }

  function startProgressTimer() {
    clearInterval(progTimer);
    progTimer = setInterval(updateProgress, 500);
  }
  function stopProgressTimer() { clearInterval(progTimer); }

  function setPlayState(playing) {
    isPlaying = playing;
    playBtn.style.opacity = playing ? '0' : '1';
    const icon = document.getElementById('cyt-pp-icon');
    if (icon) {
      icon.innerHTML = playing
        ? `<rect x="6" y="4" width="4" height="16" fill="white"/><rect x="14" y="4" width="4" height="16" fill="white"/>`
        : `<polygon points="5 3 19 12 5 21" fill="white"/>`;
    }
    if (playing) startProgressTimer();
    else stopProgressTimer();
  }

  // Клик по центру = play/pause
  ctrl.addEventListener('click', function(e) {
    if (e.target === ppBtn || ppBtn.contains(e.target)) return;
    if (e.target === rew10Btn || rew10Btn.contains(e.target)) return;
    if (e.target === fwd10Btn || fwd10Btn.contains(e.target)) return;
    if (e.target === progWrap || progWrap.contains(e.target)) return;
    if (!_ytPlayer || typeof _ytPlayer.getPlayerState !== 'function') return;
    const st = _ytPlayer.getPlayerState();
    if (st === 1) { _ytPlayer.pauseVideo(); showBar(); }
    else { _ytPlayer.playVideo(); showBar(); }
  });

  ppBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!_ytPlayer) return;
    const st = _ytPlayer.getPlayerState();
    if (st === 1) _ytPlayer.pauseVideo();
    else _ytPlayer.playVideo();
  });

  // ±10 секунд
  function seek(delta) {
    if (!_ytPlayer || typeof _ytPlayer.getCurrentTime !== 'function') return;
    var cur = _ytPlayer.getCurrentTime() || 0;
    var dur = _ytPlayer.getDuration() || 0;
    _ytPlayer.seekTo(Math.max(0, Math.min(dur, cur + delta)), true);
    showBar();
  }
  rew10Btn.addEventListener('click', function(e) { e.stopPropagation(); seek(-10); });
  rew10Btn.addEventListener('touchend', function(e) { e.preventDefault(); e.stopPropagation(); seek(-10); });
  fwd10Btn.addEventListener('click', function(e) { e.stopPropagation(); seek(10); });
  fwd10Btn.addEventListener('touchend', function(e) { e.preventDefault(); e.stopPropagation(); seek(10); });

  // Клик по прогрессу — перемотка
  progWrap.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!_ytPlayer || typeof _ytPlayer.getDuration !== 'function') return;
    const rect = progWrap.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    _ytPlayer.seekTo(_ytPlayer.getDuration() * ratio, true);
    showBar();
  });

  // Инициализируем YT.Player
  loadYtApi(() => {
    if (_ytPlayer && typeof _ytPlayer.destroy === 'function') {
      try { _ytPlayer.destroy(); } catch(e) {}
    }
    _ytPlayer = new YT.Player('cyt-player-div', {
      videoId: ytId,
      playerVars: {
        autoplay: 1,
        controls: 0,          // ← скрываем все контролы YouTube
        disablekb: 1,          // ← отключаем клавиатуру YouTube
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        playsinline: 1,
        fs: 0,                 // ← скрываем кнопку fullscreen YouTube
        showinfo: 0,
        cc_load_policy: 0,
        origin: location.origin,
      },
      events: {
        onReady: function(e) {
          e.target.playVideo();
          setPlayState(true);
          showBar();
        },
        onStateChange: function(e) {
          // 1=playing, 2=paused, 0=ended
          if (e.data === 1) setPlayState(true);
          if (e.data === 2) { setPlayState(false); showBar(); }
          if (e.data === 0) {
            setPlayState(false);
            stopProgressTimer();
            showNextSuggestion();
          }
        },
        onError: function() {}
      }
    });
  });
}

// ===== UNIVERSAL OVERLAY ДЛЯ ЗАПУСКА ВИДЕО ======
function showUniversalPlayOverlay(onPlayCallback) {
  const slot = $('video-slot');
  slot.innerHTML = `
    <div id="universal-play-overlay" style="position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(0,0,0,0.77)">
      <div id="upo-btn" style="width:88px;height:88px;background:rgba(255,40,40,0.94);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,0.7);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
      </div>
      <span style="color:#fff;font-size:15px;font-family:sans-serif;font-weight:500;pointer-events:none">Нажмите для запуска видео</span>
    </div>
  `;
  const btn = document.getElementById('upo-btn');
  btn.addEventListener('click', function () { onPlayCallback(); });
  btn.addEventListener('touchend', function (e) { e.preventDefault(); onPlayCallback(); });
}
// ========= УНИВЕРСАЛЬНЫЕ БЛОКИРАТОРЫ ЗОН YOUTUBE =========
function installYtBlockers(slot) {
  var container = $('video-container');
  if (!container) return;

  container.querySelectorAll('.yt-blocker').forEach(function(el) { el.remove(); });

  var sw = container.offsetWidth;
  var sh = container.offsetHeight;
  var aspect = 16 / 9;
  var vw, vh, ox, oy;
  if (sw / sh > aspect) {
    vh = sh; vw = Math.round(sh * aspect);
    ox = Math.round((sw - vw) / 2); oy = 0;
  } else {
    vw = sw; vh = Math.round(sw / aspect);
    ox = 0; oy = Math.round((sh - vh) / 2);
  }

  // Фабрика div-блокировщика: x,y,w,h — в пикселях от левого верхнего угла контейнера
  function mkB(x, y, w, h, cur, zi) {
    var d = document.createElement('div');
    d.className = 'yt-blocker';
    d.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;' +
      'width:' + w + 'px;height:' + h + 'px;' +
      'z-index:' + (zi || 9600) + ';background:transparent;pointer-events:auto;cursor:' + (cur || 'default');
    return d;
  }

  if (isCustomFullscreen) {
    // ═══ FULLSCREEN-РЕЖИМ: блокируем всё кроме центра (пауза/плей) ═══
    var centerW = Math.round(vw * 0.44);
    var centerH = Math.round(vh * 0.44);
    var centerX = ox + Math.round((vw - centerW) / 2);
    var centerY = oy + Math.round((vh - centerH) / 2);

    // Верх, Лево, Право, Низ — вокруг центральной зоны
    container.appendChild(mkB(ox, oy, vw, centerY - oy));
    container.appendChild(mkB(ox, centerY, centerX - ox, centerH));
    container.appendChild(mkB(centerX + centerW, centerY, ox + vw - (centerX + centerW), centerH));
    container.appendChild(mkB(ox, centerY + centerH, vw, oy + vh - (centerY + centerH)));

    // Верх-лево: кнопка выхода из fullscreen (большая зона)
    var backZone = mkB(ox, oy, Math.round(vw * 0.18), Math.round(vh * 0.18), 'pointer', 9700);
    backZone.title = 'Выйти из полного экрана';
    backZone.addEventListener('click',    function(e) { e.stopPropagation(); toggleCustomFullscreen(); });
    backZone.addEventListener('touchend', function(e) { e.preventDefault(); e.stopPropagation(); toggleCustomFullscreen(); });
    container.appendChild(backZone);

  } else {
    // ═══ ОБЫЧНЫЙ РЕЖИМ: блокируем только панели YouTube ═══
    var topH  = Math.round(vh * 0.22);  // верхняя панель
    var botH  = Math.round(vh * 0.32);  // нижняя панель (32% — с запасом)
    var sideW = Math.round(vw * 0.12);  // боковые полосы
    var sideH = vh - topH - botH;

    // ТОП: название + канал + CC + звук + шестерня
    container.appendChild(mkB(ox, oy, vw, topH));

    // ЛЕВО и ПРАВО: боковые полосы (рекомендации)
    container.appendChild(mkB(ox, oy + topH, sideW, sideH));
    container.appendChild(mkB(ox + vw - sideW, oy + topH, sideW, sideH));

    // НИЗ: прогресс-бар + share + часы + YouTube лого (100% ширины)
    container.appendChild(mkB(ox, oy + vh - botH, vw, botH));


  }

  // ResizeObserver: пересчёт при fullscreen toggle / resize окна
  if (container._ytBlockerRO) container._ytBlockerRO.disconnect();
  var ro = new ResizeObserver(function() {
    if (!container.isConnected) { ro.disconnect(); return; }
    installYtBlockers(slot);
  });
  ro.observe(container);
  container._ytBlockerRO = ro;
}

// ========= YOUTUBE END-OF-VIDEO DETECTION =========
function attachYtEndListener(iframe) {
  // Включаем listening
  const send = (func, args=[]) => {
    try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*'); } catch(_) {}
  };
  const listen = () => {
    try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: iframe.id, channel: 'widget' }), '*'); } catch(_) {}
  };
  iframe.addEventListener('load', () => { setTimeout(listen, 400); setTimeout(listen, 1500); });
  if (window._ytEndHandler) window.removeEventListener('message', window._ytEndHandler);
  window._ytEndHandler = (e) => {
    if (!e.data || typeof e.data !== 'string') return;
    try {
      const d = JSON.parse(e.data);
      // info.playerState === 0 => ENDED
      const st = d && d.info && (d.info.playerState !== undefined ? d.info.playerState : d.info);
      if (d.event === 'onStateChange' && d.info === 0) showNextSuggestion();
      if (d.event === 'infoDelivery' && d.info && d.info.playerState === 0) showNextSuggestion();
    } catch(_) {}
  };
  window.addEventListener('message', window._ytEndHandler);
}

// ========= ПРЕДЛОЖЕНИЕ "СЛЕДУЮЩИЙ УРОК" =========
function showNextSuggestion() {
  if (currentCourseIdx === null) return;
  const lessons = getLessons(currentCourseIdx);
  const nextIdx = findAdjacentVideo(lessons, currentLessonIndex, +1);
  const slot = $('video-slot');
  if (!slot || document.getElementById('next-suggest-overlay')) return;
  if (nextIdx === -1) {
    // Курс завершён
    const ov = document.createElement('div');
    ov.id = 'next-suggest-overlay';
    ov.style.cssText = 'position:absolute;inset:0;z-index:80;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fff;text-align:center;padding:24px;font-family:sans-serif';
    ov.innerHTML = `<div style="font-size:48px">🎉</div>
      <div style="font-size:20px;font-weight:800">${lang==='kz'?'Курс аяқталды!':'Курс завершён!'}</div>
      <button style="margin-top:8px;background:var(--gold);border:none;border-radius:12px;padding:12px 22px;font-weight:800;cursor:pointer" onclick="document.getElementById('next-suggest-overlay').remove()">${lang==='kz'?'Жабу':'Закрыть'}</button>`;
    slot.appendChild(ov);
    return;
  }
  const nextLesson = lessons[nextIdx];
  const nextName = nextLesson.name || (lang==='kz'?`Сабақ`:`Урок`);
  const ov = document.createElement('div');
  ov.id = 'next-suggest-overlay';
  ov.style.cssText = 'position:absolute;inset:0;z-index:80;background:rgba(0,0,0,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fff;text-align:center;padding:24px;font-family:sans-serif;backdrop-filter:blur(4px)';
  ov.innerHTML = `
    <div style="font-size:13px;letter-spacing:2px;opacity:0.7;text-transform:uppercase">${lang==='kz'?'Келесі сабақ':'Следующий урок'}</div>
    <div style="font-size:22px;font-weight:800;max-width:560px">${escHtml(nextName)}</div>
    <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;justify-content:center">
      <button id="next-suggest-go" style="background:var(--gold);border:none;border-radius:12px;padding:13px 24px;font-weight:800;font-size:14px;cursor:pointer;display:flex;gap:8px;align-items:center">▶ ${lang==='kz'?'Бастау':'Смотреть'}</button>
      <button id="next-suggest-close" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;border-radius:12px;padding:13px 22px;font-weight:600;font-size:14px;cursor:pointer">${lang==='kz'?'Жабу':'Закрыть'}</button>
    </div>`;
  slot.appendChild(ov);
  document.getElementById('next-suggest-go').onclick = () => { ov.remove(); playLesson(currentCourseIdx, nextIdx); };
  document.getElementById('next-suggest-close').onclick = () => ov.remove();
}

// ========= ВСТАВЬТЕ ЭТУ playLesson =========
function playLesson(courseIdx, lessonAbsIdx) {
  const lessons = getLessons(courseIdx);
  const lesson  = lessons[lessonAbsIdx];
  if (!lesson || lesson.type !== 'video') return;

  currentCourseIdx = courseIdx;
  currentLessonIndex = lessonAbsIdx;
  markWatched(courseIdx, lessonAbsIdx);

  let vNum = 0;
  for (let i = 0; i < lessonAbsIdx; i++) if (lessons[i].type === 'video') vNum++;
  vNum++;

  const lessonName = lesson.name || (lang === 'kz' ? `Сабақ ${vNum}` : `Урок ${vNum}`);
  $('current-lesson-title').textContent = lessonName;

  const prevIdx = findAdjacentVideo(lessons, lessonAbsIdx, -1);
  const nextIdx = findAdjacentVideo(lessons, lessonAbsIdx, +1);
  $('prev-btn').disabled = prevIdx === -1;
  $('next-btn').disabled = nextIdx === -1;
  // Скрываем стрелки поверх видео — оставляем только внешние «Пред./След.»
  const vp = $('vid-prev-btn'); if (vp) { vp.style.display = 'none'; }
  const vn = $('vid-next-btn'); if (vn) { vn.style.display = 'none'; }

  const slot = $('video-slot');
  slot.innerHTML = '';
  const link = lesson.url || '';
  currentYtId = null; ytStartTime = Date.now();

  if (link) {
    const ytId = extractYouTubeId(link);
    if (ytId) {
      // Кастомный плеер — без интерфейса YouTube (bizon365-style)
      showUniversalPlayOverlay(() => {
        buildCustomYtPlayer($('video-slot'), ytId);
        attachYtEndListener({ contentWindow: null }); // endListener теперь внутри buildCustomYtPlayer
      });
    } else if (link.includes('vk.com') || link.includes('vkvideo.ru')) {
      let embedUrl = link;
      const mClip  = link.match(/clip(-?\d+)_(\d+)/);
      const mVideo = link.match(/video(-?\d+)_(\d+)/);
      if (mClip) {
        const oid = mClip[1];
        const id  = mClip[2];
        embedUrl = `https://vkvideo.ru/clip_ext.php?oid=${oid}&id=${id}&autoplay=1&no_recs=1`;
      } else if (mVideo) {
        const oid = mVideo[1];
        const id  = mVideo[2];
        embedUrl = `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2&autoplay=1&js_api=1&no_recs=1`;
      }
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock; web-share';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('webkitallowfullscreen', 'true');
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
        slot.appendChild(iframe);
      });
    } else if (link.includes('drive.google.com')) {
      let fileId = null;
      const m1 = link.match(/\/file\/d\/([^\/\?&]+)/);
      const m2 = link.match(/[?&]id=([^&]+)/);
      if (m1) fileId = m1[1]; else if (m2) fileId = m2[1];
      const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : link.replace('/view', '/preview');
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
        slot.appendChild(iframe);
      });
    } else if (link.includes('cloudflarestream.com') || link.includes('iframe.cloudflarestream.com')) {
      let src = link;
      const m = link.match(/cloudflarestream\.com\/([a-f0-9]+)/i);
      if (m) src = `https://iframe.cloudflarestream.com/${m[1]}?autoplay=true&preload=true`;
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
        slot.appendChild(iframe);
      });
    } else if (link.includes('vimeo.com')) {
      const m = link.match(/vimeo\.com\/(\d+)/);
      const videoId = m ? m[1] : '';
      const src = videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&playsinline=1&muted=0` : link;
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('webkitallowfullscreen', 'true');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
        slot.appendChild(iframe);
      });
    } else if (link.includes('bunny.net') || link.includes('b-cdn.net') || link.includes('iframe.mediadelivery.net')) {
      let src = link;
      if (!link.includes('iframe.mediadelivery.net') && !link.includes('embed')) {
        const m = link.match(/([a-f0-9\-]{36})/i);
        if (m) src = `https://iframe.mediadelivery.net/embed/${m[1]}?autoplay=true`;
      }
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
        slot.appendChild(iframe);
      });
    } else if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(link)) {
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const video = document.createElement('video');
        video.src = link;
        video.controls = true;
        video.playsinline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'metadata';
        video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;border-radius:inherit';
        slot.appendChild(video);
      });
    } else {
      showUniversalPlayOverlay(() => {
        slot.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = link;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
        slot.appendChild(iframe);
      });
    }
  } else {
    slot.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text3);font-size:13px;flex-direction:column;gap:10px"><span style="font-size:36px">🎬</span><span>Ссылка не добавлена</span></div>`;
  }

  setupTapZones();
  $('video-section').style.display = 'block';
  var _vc2 = $('video-container'); if (_vc2) _vc2.style.display = '';
  var _lp2 = $('lp-title'); if (_lp2) _lp2.style.display = 'none';
  if (window.innerWidth <= 640) $('lesson-modal').classList.add('video-active');
  updateModalProgress(courseIdx);
  renderLessonList(courseIdx);
}

function findAdjacentVideo(lessons, from, dir) {
  let i = from + dir;
  while (i >= 0 && i < lessons.length) {
    if (lessons[i].type === 'video') return i;
    i += dir;
  }
  return -1;
}
function extractYouTubeId(url) {
  // Clean up tracking params like ?si= before matching
  const clean = url.split('?')[0].split('&')[0];
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_\-]{11})/
  ];
  // Try on original URL first (for ?v= params), then on cleaned
  for (const src of [url, clean]) {
    for (const p of patterns) { const m = src.match(p); if (m) return m[1]; }
  }
  return null;
}
function loadYtIframe(ytId, startSec) {
  const slot = $('video-slot'); slot.innerHTML = '';
  ytStartTime = Date.now() - startSec * 1000;
  currentYtId = ytId;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    // На iOS используем youtube-nocookie embed с playsinline — работает в Safari
    hideTapZones();
    const iframe = document.createElement('iframe');
    iframe.id = 'yt-player-iframe';
    iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&start=${Math.max(0, Math.round(startSec))}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&fs=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('webkitallowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
    slot.appendChild(iframe);
    attachYtEndListener(iframe);
  } else {
    showTapZones();
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&start=${Math.max(0, Math.round(startSec))}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&fs=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('webkitallowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
    slot.appendChild(iframe);
  }
}

function loadDriveIframe(link) {
  const slot = $('video-slot'); slot.innerHTML = '';
  hideTapZones();
  let fileId = null;
  const m1 = link.match(/\/file\/d\/([^\/\?&]+)/);
  const m2 = link.match(/[?&]id=([^&]+)/);
  if (m1) fileId = m1[1];
  else if (m2) fileId = m2[1];

  const embedUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : link.replace('/view', '/preview');

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
  slot.appendChild(iframe);
}

function loadCloudflareIframe(link) {
  const slot = $('video-slot'); slot.innerHTML = '';
  hideTapZones();
  // Извлекаем video ID из ссылки вида:
  // https://iframe.cloudflarestream.com/VIDEO_ID
  // https://cloudflarestream.com/VIDEO_ID/iframe
  let src = link;
  const m = link.match(/cloudflarestream\.com\/([a-f0-9]+)/i);
  if (m) src = `https://iframe.cloudflarestream.com/${m[1]}?autoplay=true&preload=true`;

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
  slot.appendChild(iframe);
}

function loadVimeoIframe(link) {
  const slot = $('video-slot'); slot.innerHTML = '';
  hideTapZones();
  const m = link.match(/vimeo\.com\/(\d+)/);
  const videoId = m ? m[1] : '';
  // autoplay=0 — ждём нажатия пользователя, тогда звук работает сразу
  const src = videoId
    ? `https://player.vimeo.com/video/${videoId}?autoplay=0&playsinline=1&muted=0`
    : link;

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('webkitallowfullscreen', 'true');
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
  slot.appendChild(iframe);
}

function hideTapZones() {
  ['tap-left','tap-right','tap-center'].forEach(id => {
    const el = $(id); if (el) el.style.pointerEvents = 'none';
  });
}
function showTapZones() {
  ['tap-left','tap-right','tap-center'].forEach(id => {
    const el = $(id); if (el) el.style.pointerEvents = '';
  });
}

function loadVkIframe(link) {
  const slot = $('video-slot'); 
  slot.innerHTML = '';
  hideTapZones();

  let embedUrl = '';

  // 1. Извлекаем ID из разных типов ссылок VK (клипы и обычные видео)
  const mClip  = link.match(/clip(-?\d+)_(\d+)/);
  const mVideo = link.match(/video(-?\d+)_(\d+)/);

  if (mClip) {
    const oid = mClip[1];
    const id  = mClip[2];
    embedUrl = `https://vkvideo.ru/clip_ext.php?oid=${oid}&id=${id}&autoplay=1&no_recs=1`;
  } else if (mVideo) {
    const oid = mVideo[1];
    const id  = mVideo[2];
    embedUrl = `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2&autoplay=1&js_api=1&no_recs=1`;
  } else {
    // Если в таблицу вставили уже готовую embed-ссылку из iframe
    embedUrl = link;
    if (!embedUrl.includes('autoplay=')) {
      embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
    } else {
      embedUrl = embedUrl.replace('autoplay=0', 'autoplay=1');
    }
    if (!embedUrl.includes('no_recs=')) {
      embedUrl += '&no_recs=1';
    }
  }

  // Показываем чистую ручную кнопку запуска видео для предотвращения сбоев и скрытия рекламы/рекомендаций
  slot.innerHTML = `
    <div id="vk-play-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#060608;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;cursor:pointer;border-radius:inherit;z-index:10"
         onclick="loadVkIframeNow('${embedUrl.replace(/'/g, "\\'")}', this)">
      <div style="width:76px;height:76px;background:rgba(74,118,198,0.95);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);transition:transform .2s ease">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style="margin-left:4px"><polygon points="5 3 19 12 5 21"/></svg>
      </div>
      <span style="color:rgba(255,255,255,0.85);font-size:14px;font-family:sans-serif;font-weight:500;letter-spacing:0.5px">Включить видео урок</span>
    </div>`;
}

function loadVkIframeNow(embedUrl, overlay) {
  const slot = $('video-slot');
  slot.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock; web-share';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('webkitallowfullscreen', 'true');
  iframe.setAttribute('mozallowfullscreen', 'true');
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;background:#000;';
  
  slot.appendChild(iframe);
}

function loadDirectVideo(link) {
  const slot = $('video-slot'); slot.innerHTML = '';
  hideTapZones();
  const video = document.createElement('video');
  video.src = link;
  video.controls = true;
  video.playsinline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'metadata';
  video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;border-radius:inherit';
  slot.appendChild(video);
}
const getElapsedSec = () => Math.round((Date.now() - ytStartTime) / 1000);

function setupTapZones() {
  const left = $('tap-left'), right = $('tap-right'), center = $('tap-center');
  const container = $('video-container');
  if (!left || !right || !center) return;
  function handle(zone) {
    if (tapTimer) {
      clearTimeout(tapTimer); tapTimer = null;
      if (zone === 'left'  && currentYtId) loadYtIframe(currentYtId, Math.max(0, getElapsedSec() - 10));
      if (zone === 'right' && currentYtId) loadYtIframe(currentYtId, getElapsedSec() + 10);
    } else {
      tapTimer = setTimeout(() => {
        tapTimer = null;
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      }, 280);
    }
  }
  left.onclick = () => handle('left');
  right.onclick = () => handle('right');
  center.onclick = () => handle('center');
}
function prevLesson() {
  const lessons = getLessons(currentCourseIdx);
  const prev = findAdjacentVideo(lessons, currentLessonIndex, -1);
  if (prev !== -1) playLesson(currentCourseIdx, prev);
}
function nextLesson() {
  const lessons = getLessons(currentCourseIdx);
  const next = findAdjacentVideo(lessons, currentLessonIndex, +1);
  if (next !== -1) playLesson(currentCourseIdx, next);
}

// ══════════════════════════════ MOBILE NAV ════════════════════════
function mobileNavTo(section, btn) {
  document.querySelectorAll('.mnav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (section === 'catalog') {
    $('catalog-page-modal').classList.add('show');
  } else if (section === 'help') {
    if (tgUrl) window.open(tgUrl, '_blank');
    else if (waUrl) window.open(waUrl, '_blank');
    else showToast(t('linkNotSet'), 'error');
  } else {
    document.querySelector('.platforms-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ══════════════════════════════ DEVICE INFO ═══════════════════════
function getDeviceInfo() {
  const ua = navigator.userAgent;

  let device = 'Десктоп';
  if      (/iPhone/.test(ua))             device = 'iPhone';
  else if (/iPad/.test(ua))               device = 'iPad';
  else if (/Android.*Mobile/.test(ua))    device = 'Android телефон';
  else if (/Android/.test(ua))            device = 'Android планшет';

  let os = 'Неизвестно';
  if      (/Windows NT 10/.test(ua))      os = 'Windows 10/11';
  else if (/Windows NT 6/.test(ua))       os = 'Windows 7/8';
  else if (/Mac OS X/.test(ua))            os = 'macOS';
  else if (/iPhone OS ([\d_]+)/.test(ua))  os = 'iOS '     + ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g, '.');
  else if (/Android ([\d.]+)/.test(ua))    os = 'Android ' + ua.match(/Android ([\d.]+)/)[1];
  else if (/Linux/.test(ua))               os = 'Linux';

  let browser = 'Неизвестно';
  if      (/YaBrowser/.test(ua))          browser = 'Яндекс';
  else if (/OPR|Opera/.test(ua))          browser = 'Opera';
  else if (/Edg/.test(ua))                browser = 'Edge';
  else if (/Chrome/.test(ua))             browser = 'Chrome';
  else if (/Firefox/.test(ua))            browser = 'Firefox';
  else if (/Safari/.test(ua))             browser = 'Safari';

  return { device, os, browser };
}

// ══════════════════════════════ LOGIN LOG ════════════════════════
async function logLogin(iin, name) {
  if (!LOG_SCRIPT_URL || LOG_SCRIPT_URL.includes('ВАШИ_ID')) return;
  try {
    const now = new Date();
    const { device, os, browser } = getDeviceInfo();

    let ip = '—';
    try {
      const r = await fetch('https://api.ipify.org?format=json',
        { signal: AbortSignal.timeout(3000) });
      ip = (await r.json()).ip || '—';
    } catch (_) {}

    fetch(LOG_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _type:    'login_log',
        date:     now.toLocaleDateString('ru-RU'),
        time:     now.toLocaleTimeString('ru-RU'),
        iin,
        name,
        device,
        os,
        browser,
        screen:   `${screen.width}×${screen.height}`,
        language: navigator.language || '—',
        ip
      })
    });
  } catch (e) {
    console.warn('Log error:', e);
  }
}

// ══════════════════════════════ LOGIN ════════════════════════════
async function doLogin() {
  const name  = $('inp-name').value.trim();
  const iin   = $('inp-iin').value.trim();
  const phone = $('inp-phone').value.trim().replace(/\s/g, '');
  $('login-error').style.display   = 'none';
  $('login-success').style.display = 'none';

  if (!name || !iin || !phone) { showMsg('error', t('errEmpty')); return; }
  if (!/^\d{12}$/.test(iin))   { showMsg('error', t('errIin'));   return; }
  if (phone.replace(/[+\-()]/g, '').length < 10) { showMsg('error', t('errPhone')); return; }

  const btn = $('login-btn');
  btn.disabled = true;
  btn.classList.add('loading');

  const pgw = $('progress-wrap'); pgw.style.display = 'block';
  const pg  = $('progress-glow'); if (pg) pg.classList.add('active');
  const steps = T[lang].steps;
  $('prog-steps').innerHTML = steps.map((s, i) =>
    `<span class="p-step" id="ps${i}"><span class="dot"></span>${s}</span>`).join('');

  await animProg(0, 15, 300, ''); markStep(0);
  await animProg(15, 40, 400, steps[1]); markStep(1);

  let found = false, foundName = '', isPaid = false, isAllowed = false;
  try {
    const url = `https://docs.google.com/spreadsheets/d/${gsSheetId}/gviz/tq?tqx=out:csv`;
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) throw new Error('http_' + res.status);
    const csv  = await res.text();
    const rows = parseCSV(csv);
    for (const row of rows) {
      if (strip(row[0]) === iin) {
        found     = true;
        foundName = strip(row[1]) || name;
        const sA  = (strip(row[10]) || '').toUpperCase();
        const sP  = (strip(row[11]) || '').toUpperCase();
        isAllowed = sA.includes('✅') && (sA.includes('РАЗРЕШЕНО') || sA.includes('РҰҚСАТ'));
        isPaid    = sP.includes('✅') && (sP.includes('ОПЛАЧЕНО')  || sP.includes('ТӨЛЕНДІ'));
        break;
      }
    }
  } catch (e) {
    await animProg(40, 40, 50, '');
    btn.disabled = false;
    btn.classList.remove('loading');
    pgw.style.display = 'none';
    if (pg) pg.classList.remove('active');
    const msg = (e.name === 'AbortError') ? t('errSheetUnavailable') : t('errNetwork');
    showMsg('error', msg);
    return;
  }

  await animProg(40, 60, 300, steps[2]); markStep(2);
  await sleep(180);
  await animProg(60, 75, 300, steps[3]); markStep(3);
  await sleep(180);

  if (!found)  { finishLogin(btn); showMsg('error', t('errNotFound')); return; }
  if (!isPaid) { finishLogin(btn); showMsg('error', t('errNotPaid'));  return; }

  await animProg(75, 90, 300, steps[4]); markStep(4);
  await sleep(180);

  if (!isAllowed) { finishLogin(btn); showMsg('error', t('errNoAccess')); return; }

  await animProg(90, 100, 350, steps[5]); markStep(5);
  if (pg) pg.classList.remove('active');

  currentUser = foundName || name;
  logLogin(iin, currentUser);

  try {
    sessionStorage.setItem('bs_user', currentUser);
    sessionStorage.setItem('bs_iin',  iin);
  } catch (_) {}

  $('login-success').textContent   = t('ok') + ' ' + currentUser + '!';
  $('login-success').style.display = 'block';
  await loadProgressFromSheet(iin);
  await loadSheet2();
  await sleep(700);
  showLessons();
}

function finishLogin(btn) {
  btn.disabled = false;
  btn.classList.remove('loading');
  setTimeout(() => { $('progress-wrap').style.display = 'none'; $('prog-fill').style.width = '0%'; }, 1000);
}
function showMsg(type, msg) {
  const el = $(type === 'error' ? 'login-error' : 'login-success');
  el.textContent = msg; el.style.display = 'block';
}
function markStep(i) {
  const el = $(`ps${i}`); if (el) el.classList.add('done');
}
function animProg(from, to, dur, label) {
  return new Promise(res => {
    const fill = $('prog-fill'), pct = $('prog-pct'), lbl = $('progress-label-text');
    if (label && lbl) lbl.textContent = label;
    const start = Date.now();
    (function f() {
      const p = Math.min(1, (Date.now() - start) / dur);
      const v = Math.round(from + (to - from) * easeOut(p));
      fill.style.width = v + '%';
      pct.textContent  = v + '%';
      p < 1 ? requestAnimationFrame(f) : res();
    })();
  });
}

function showLessons() {
  $('login-page').style.display    = 'none';
  $('lessons-page').style.display  = 'block';
  $('logout-btn').style.display    = 'flex';
  $('header-center').style.display = 'flex';
  if (window.innerWidth <= 640) $('mobile-nav').style.display = 'flex';
  
  // Закрываем окно принудительной блокировки, если оно висело
  const blockOverlay = $('block-overlay');
  if (blockOverlay) blockOverlay.style.display = 'none';

  applyTexts(); applyLinks();
  updateHeroStats();

  // Запуск фоновой ежесекундной/10-секундной проверки прав доступа пользователя в Лист1
  startSecurityMonitor();

  setTimeout(() => { document.querySelectorAll('.platform-card').forEach(el => el.style.animation = ''); }, 1000);
}

function logout() {
  // Сбрасываем фоновый интервал проверки при ручном выходе
  if (securityCheckInterval) {
    clearInterval(securityCheckInterval);
    securityCheckInterval = null;
  }

  currentUser = null; currentCourseIdx = null;
  try { sessionStorage.removeItem('bs_user'); sessionStorage.removeItem('bs_iin'); } catch(_) {}
  $('logout-btn').style.display    = 'none';
  $('mobile-nav').style.display    = 'none';
  $('header-center').style.display = 'none';
  $('lessons-page').style.display  = 'none';
  $('login-page').style.display    = 'flex';
  ['inp-name','inp-iin','inp-phone'].forEach(id => { const e=$(id); if(e) e.value=''; });
  ['login-error','login-success'].forEach(id => { const e=$(id); if(e) e.style.display='none'; });
  $('progress-wrap').style.display = 'none';
  $('prog-fill').style.width = '0%';
  const btn = $('login-btn');
  btn.disabled = false;
  btn.classList.remove('loading');
  renderDemoGrid(); // снова показать превью курсов
}

// ══════════════════════════════ ADMIN ════════════════════════════
$('logo-wrap').addEventListener('click', () => {
  logoClickCount++;
  if (logoClickCount === 1) {
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 600);
  } else {
    clearTimeout(logoClickTimer); logoClickCount = 0; openAdminPw();
  }
});
function openAdminPw() {
  $('admin-pw-input').value   = '';
  $('pw-error').style.display = 'none';
  $('admin-pw-modal').classList.add('show');
  setTimeout(() => $('admin-pw-input').focus(), 200);
}
function checkAdminPw() {
  if ($('admin-pw-input').value === ADMIN_PASSWORD) {
    closeModal('admin-pw-modal');
    openAdmin();
  } else {
    $('pw-error').textContent   = t('wrongPw');
    $('pw-error').style.display = 'block';
    $('admin-pw-input').value   = '';
    $('admin-pw-input').focus();
  }
}
$('admin-pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') checkAdminPw(); });

function openAdmin() {
  $('admin-gs-input').value = gsSheetId;
  $('admin-modal').classList.add('show');
}
function saveAdmin() {
  const val = $('admin-gs-input').value.trim();
  if (val) { gsSheetId = val; localStorage.setItem('gs_sheet_id', val); }
  closeModal('admin-modal');
  showToast(t('savedOk'), 'success');
  loadSheet2();
}

// ══════════════════════════════ MODALS HELPERS ════════════════════
function closeModal(id) { $(id)?.classList.remove('show'); }

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target !== o) return;
    if (o.id === 'lesson-modal')          closeLesson();
    else if (o.id === 'img-viewer-modal') closeImageViewer();
    else o.classList.remove('show');
  });
});

// ══════════════════════════════ TOAST ════════════════════════════
function showToast(msg, type = 'success') {
  const el = $('toast');
  el.textContent = msg;
  el.className   = 'toast ' + type;
  requestAnimationFrame(() => setTimeout(() => el.classList.add('show'), 10));
  setTimeout(() => el.classList.remove('show'), 3200);
}

// ══════════════════════════════ COLOR UTILS ═══════════════════════
function hexToRgba(hex, a) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${a})`;
}
function darkenHex(hex, pct) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = Math.max(0, parseInt(hex.slice(0,2),16) - pct);
  const g = Math.max(0, parseInt(hex.slice(2,4),16) - pct);
  const b = Math.max(0, parseInt(hex.slice(4,6),16) - pct);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
function lightenHex(hex, pct) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = Math.min(255, parseInt(hex.slice(0,2),16) + pct);
  const g = Math.min(255, parseInt(hex.slice(2,4),16) + pct);
  const b = Math.min(255, parseInt(hex.slice(4,6),16) + pct);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ══════════════════════════════ HTML UTILS ════════════════════════
function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function safeAttr(s) {
  return (s || '').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
}

// ══════════════════════════════ KEYBOARD NAV ══════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (isCustomFullscreen) { toggleCustomFullscreen(); return; }
    if ($('lesson-modal').classList.contains('show'))          closeLesson();
    else if ($('img-viewer-modal').classList.contains('show')) closeImageViewer();
    else document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'));
  }
  if ($('lesson-modal').classList.contains('show') && $('video-section').style.display !== 'none') {
    if (e.key === 'ArrowLeft')  prevLesson();
    if (e.key === 'ArrowRight') nextLesson();
  }
});

// ══════════════════════════════ INPUT HELPERS ═════════════════════
$('inp-iin').addEventListener('input',   function () { this.value = this.value.replace(/\D/g, ''); });
$('inp-iin').addEventListener('keydown', e => { if (e.key === 'Enter') $('inp-phone').focus(); });
$('inp-name').addEventListener('keydown',  e => { if (e.key === 'Enter') $('inp-iin').focus(); });
$('inp-phone').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

// ══════════════════════════════ HEADER SCROLL EFFECT ═════════════
window.addEventListener('scroll', () => {
  const h = document.querySelector('.header-inner');
  if (h) h.style.background = window.scrollY > 20
    ? (currentTheme === 'dark' ? 'rgba(6,6,8,0.95)'  : 'rgba(245,245,250,0.97)')
    : (currentTheme === 'dark' ? 'rgba(6,6,8,0.82)'  : 'rgba(245,245,250,0.9)');
}, { passive: true });

// ══════════════════════════════ SESSION RESTORE ═══════════════════
async function tryRestoreSession() {
  let savedUser = null;
  let savedIin = null;
  try { 
    savedUser = sessionStorage.getItem('bs_user'); 
    savedIin  = sessionStorage.getItem('bs_iin');
  } catch(_) {}
  
  if (!savedUser || !savedIin) return false;
  
  currentUser = savedUser;
  await loadProgressFromSheet(savedIin);
  await loadSheet2();
  showLessons();
  return true;
}

// ══════════════════════════════ INIT ════════════════════════════
(async function init() {
  applyTexts();
  const restored = await tryRestoreSession();
  if (!restored) {
    if (gsSheetId) loadSheet2();
    $('login-page').style.display   = 'flex';
    $('lessons-page').style.display = 'none';
  }

  // Демо-режим: если курсы уже загружены до входа — показать превью
  if (courses.length > 0 && !currentUser) renderDemoGrid();

})();
