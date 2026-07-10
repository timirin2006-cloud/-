/* =========================================================================
   БОЛЬШОЕ ПУТЕШЕСТВИЕ ВОКРУГ СВЕТА — игровая логика
   =========================================================================
   Структура файла:
   1. Данные об игроках и странах
   2. Банк вопросов (30 штук, по 5 на каждую из 6 стран)
   3. Формирование итогового порядка вопросов (перемешанного по странам)
   4. Логика экранов (старт -> игроки -> игра -> финал)
   5. Логика одного вопроса (показ, ответ, начисление очков, факт)
   6. Финальный экран (пьедестал, таблица, конфетти)
   ========================================================================= */

/* ---------------------------------------------------------------------
   1. ИГРОКИ И СТРАНЫ
   --------------------------------------------------------------------- */

// Игроки хранятся в объекте, чтобы легко обновлять очки по имени
const players = [
  { id: 'alisa', name: 'Алиса', avatar: '🦄', score: 0 },
  { id: 'alena', name: 'Алёна', avatar: '🌸', score: 0 },
  { id: 'marusya', name: 'Маруся', avatar: '🎨', score: 0 },
  { id: 'anya', name: 'Аня', avatar: '⭐', score: 0 },
];

// Данные о странах: эмодзи-флаг для бейджа, картинка флага для вопросов "угадай флаг"
const COUNTRIES = {
  france:    { name: 'Франция',    flagEmoji: '🇫🇷', flagImg: 'images/flag-france.svg' },
  brazil:    { name: 'Бразилия',   flagEmoji: '🇧🇷', flagImg: 'images/flag-brazil.svg' },
  china:     { name: 'Китай',      flagEmoji: '🇨🇳', flagImg: 'images/flag-china.svg' },
  japan:     { name: 'Япония',     flagEmoji: '🇯🇵', flagImg: 'images/flag-japan.svg' },
  india:     { name: 'Индия',      flagEmoji: '🇮🇳', flagImg: 'images/flag-india.svg' },
  australia: { name: 'Австралия',  flagEmoji: '🇦🇺', flagImg: 'images/flag-australia.svg' },
};

// Список всех названий стран — используется, чтобы собирать варианты ответа
// для вопросов "угадай страну" и "угадай флаг"
const ALL_COUNTRY_NAMES = Object.values(COUNTRIES).map(c => c.name);

/* ---------------------------------------------------------------------
   2. БАНК ВОПРОСОВ
   --------------------------------------------------------------------- */
// Каждый вопрос:
//   country  — ключ страны (для бейджа и фильтра)
//   topic    — подпись механики вопроса (эмодзи + текст)
//   visual   — { type:'emoji', value } | { type:'img', src } | null
//   text     — текст вопроса
//   options  — варианты ответа
//   correct  — индекс правильного варианта
//   fact     — интересный факт, который покажется после ответа

const QUESTION_BANK = {

  france: [
    {
      country: 'france', topic: '🏛 Угадай столицу',
      visual: { type: 'emoji', value: '🏙️' },
      text: 'Как называется столица Франции?',
      options: ['Париж', 'Лондон', 'Мадрид', 'Рим'], correct: 0,
      fact: 'Париж называют «городом огней» — одним из первых в мире он начал освещать улицы газовыми фонарями.'
    },
    {
      country: 'france', topic: '🚩 Угадай флаг',
      visual: { type: 'img', src: 'images/flag-france.svg' },
      text: 'Флаг какой страны изображён на картинке?',
      options: ['Нидерланды', 'Франция', 'Италия', 'Россия'], correct: 1,
      fact: 'Три цвета французского флага — синий, белый и красный — появились ещё во времена Французской революции.'
    },
    {
      country: 'france', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🗼' },
      text: 'Что это за знаменитая достопримечательность?',
      options: ['Эйфелева башня', 'Биг-Бен', 'Статуя Свободы', 'Колизей'], correct: 0,
      fact: 'Эйфелева башня сначала должна была простоять всего 20 лет — но людям она так понравилась, что её оставили навсегда.'
    },
    {
      country: 'france', topic: '🍽 Угадай блюдо',
      visual: { type: 'emoji', value: '🥐' },
      text: 'Как называется эта хрустящая французская выпечка?',
      options: ['Круассан', 'Пицца', 'Тако', 'Суши'], correct: 0,
      fact: 'Круассан имеет форму полумесяца и обычно едят его на завтрак вместе с горячим шоколадом.'
    },
    {
      country: 'france', topic: '✅ Правда или ложь',
      visual: { type: 'emoji', value: '🌍' },
      text: 'Правда или ложь: Франция — самая посещаемая туристами страна в мире.',
      options: ['Правда', 'Ложь'], correct: 0,
      fact: 'Каждый год Францию посещают десятки миллионов туристов со всего света — больше, чем любую другую страну.'
    },
  ],

  brazil: [
    {
      country: 'brazil', topic: '🏛 Угадай столицу',
      visual: { type: 'emoji', value: '🏙️' },
      text: 'Как называется столица Бразилии?',
      options: ['Бразилиа', 'Рио-де-Жанейро', 'Сан-Паулу', 'Лима'], correct: 0,
      fact: 'Хотя многие думают на Рио-де-Жанейро, настоящая столица Бразилии — город Бразилиа, построенный специально для этой роли.'
    },
    {
      country: 'brazil', topic: '🌍 Угадай страну',
      visual: { type: 'emoji', value: '⛰️' },
      text: 'Гигантская статуя Христа-Искупителя стоит на горе в Рио-де-Жанейро. В какой это стране?',
      options: ['Аргентина', 'Бразилия', 'Мексика', 'Испания'], correct: 1,
      fact: 'Статуя Христа-Искупителя стоит на вершине горы Корковаду и видна почти из любой точки города.'
    },
    {
      country: 'brazil', topic: '🍽 Угадай блюдо',
      visual: { type: 'emoji', value: '🧀' },
      text: 'Как называется бразильский сырный хлебушек из тапиоковой муки?',
      options: ['Пао-де-кейжо', 'Багет', 'Наан', 'Рамен'], correct: 0,
      fact: 'Пао-де-кейжо готовят без пшеничной муки, а из-за сыра внутри он получается очень тягучим.'
    },
    {
      country: 'brazil', topic: '🐾 Угадай животное',
      visual: { type: 'emoji', value: '🐹' },
      text: 'Это животное — самый большой грызун на планете, очень любит купаться в воде. Кто это?',
      options: ['Капибара', 'Кролик', 'Бобёр', 'Хомяк'], correct: 0,
      fact: 'Капибара живёт большими дружными группами и прекрасно плавает — она может часами сидеть в воде.'
    },
    {
      country: 'brazil', topic: '✅ Правда или ложь',
      visual: { type: 'emoji', value: '🌳' },
      text: 'Правда или ложь: в Бразилии находится самый большой тропический лес в мире — Амазония.',
      options: ['Правда', 'Ложь'], correct: 0,
      fact: 'Амазонские джунгли настолько огромны, что их называют «лёгкими планеты» — там живёт больше всего видов животных и растений.'
    },
  ],

  china: [
    {
      country: 'china', topic: '🏛 Угадай столицу',
      visual: { type: 'emoji', value: '🏙️' },
      text: 'Как называется столица Китая?',
      options: ['Шанхай', 'Пекин', 'Гонконг', 'Токио'], correct: 1,
      fact: 'Пекин — один из древнейших городов мира, ему уже более трёх тысяч лет.'
    },
    {
      country: 'china', topic: '🚩 Угадай флаг',
      visual: { type: 'img', src: 'images/flag-china.svg' },
      text: 'Флаг какой страны изображён на картинке?',
      options: ['Вьетнам', 'Китай', 'Куба', 'Турция'], correct: 1,
      fact: 'Большая звезда на флаге Китая символизирует Коммунистическую партию, а четыре маленькие — единство народа.'
    },
    {
      country: 'china', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🐼' },
      text: 'Какое животное изображено на фото?',
      options: ['Большая панда', 'Бурый медведь', 'Коала', 'Лиса'], correct: 0,
      fact: 'Большая панда почти всё время ест бамбук — на это уходит до 12 часов в день!'
    },
    {
      country: 'china', topic: '🏛 Угадай достопримечательность',
      visual: { type: 'emoji', value: '🧱' },
      text: 'Какая стена растянулась на тысячи километров через весь Китай?',
      options: ['Берлинская стена', 'Великая Китайская стена', 'Крепостная стена Кремля', 'Стена Плача'], correct: 1,
      fact: 'Великую Китайскую стену начали строить более двух тысяч лет назад, чтобы защищать страну от врагов.'
    },
    {
      country: 'china', topic: '💡 Интересный факт',
      visual: { type: 'emoji', value: '📜' },
      text: 'Что из этого впервые изобрели в Китае?',
      options: ['Бумагу', 'Пиццу', 'Футбол', 'Самолёт'], correct: 0,
      fact: 'В Китае также изобрели компас и порох — эти изобретения изменили весь мир.'
    },
  ],

  japan: [
    {
      country: 'japan', topic: '🏛 Угадай столицу',
      visual: { type: 'emoji', value: '🏙️' },
      text: 'Как называется столица Японии?',
      options: ['Осака', 'Киото', 'Токио', 'Иокогама'], correct: 2,
      fact: 'Токио — один из самых больших городов мира по числу жителей.'
    },
    {
      country: 'japan', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🗻' },
      text: 'Какая знаменитая гора изображена на фото?',
      options: ['Гора Фудзи', 'Эверест', 'Килиманджаро', 'Анды'], correct: 0,
      fact: 'Гора Фудзи — это спящий вулкан, и она считается священной горой в Японии.'
    },
    {
      country: 'japan', topic: '🍽 Угадай блюдо',
      visual: { type: 'emoji', value: '🍣' },
      text: 'Как называется это японское блюдо из риса и рыбы?',
      options: ['Суши', 'Тако', 'Пельмени', 'Карри'], correct: 0,
      fact: 'Суши изначально придумали как способ хранить рыбу дольше — рис помогал её не портиться.'
    },
    {
      country: 'japan', topic: '✅ Правда или ложь',
      visual: { type: 'emoji', value: '🚄' },
      text: 'Правда или ложь: в Японии ходят одни из самых быстрых поездов в мире.',
      options: ['Правда', 'Ложь'], correct: 0,
      fact: 'Японские скоростные поезда «синкансэн» могут разгоняться быстрее 300 километров в час.'
    },
    {
      country: 'japan', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🌸' },
      text: 'Какое дерево весной покрывается такими нежными розовыми цветами по всей Японии?',
      options: ['Сакура', 'Дуб', 'Пальма', 'Ель'], correct: 0,
      fact: 'Цветение сакуры длится всего пару недель в году, и японцы устраивают в это время специальные праздники любования цветами.'
    },
  ],

  india: [
    {
      country: 'india', topic: '🏛 Угадай столицу',
      visual: { type: 'emoji', value: '🏙️' },
      text: 'Как называется столица Индии?',
      options: ['Мумбаи', 'Нью-Дели', 'Дубай', 'Бангкок'], correct: 1,
      fact: 'Нью-Дели — сравнительно молодая часть древнего города Дели, который существует уже много веков.'
    },
    {
      country: 'india', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🕌' },
      text: 'Какой знаменитый белоснежный дворец-мавзолей изображён здесь?',
      options: ['Тадж-Махал', 'Эйфелева башня', 'Биг-Бен', 'Пирамиды Гизы'], correct: 0,
      fact: 'Тадж-Махал построил правитель в память о своей любимой жене — на строительство ушло более 20 лет.'
    },
    {
      country: 'india', topic: '🐾 Угадай животное',
      visual: { type: 'emoji', value: '🐘' },
      text: 'Какое огромное животное с длинным хоботом часто встречается в Индии?',
      options: ['Слон', 'Жираф', 'Бегемот', 'Носорог'], correct: 0,
      fact: 'В Индии слонов издавна считают символом мудрости и удачи.'
    },
    {
      country: 'india', topic: '🍽 Угадай блюдо',
      visual: { type: 'emoji', value: '🍛' },
      text: 'Как называется это ароматное индийское блюдо со специями?',
      options: ['Карри', 'Суши', 'Тако', 'Пицца'], correct: 0,
      fact: 'В индийской кухне используют очень много разных специй — например, куркуму, которая даёт блюдам яркий жёлтый цвет.'
    },
    {
      country: 'india', topic: '💡 Интересный факт',
      visual: { type: 'emoji', value: '♟️' },
      text: 'Какая игра, по легенде, впервые появилась в Индии?',
      options: ['Шахматы', 'Футбол', 'Домино', 'Боулинг'], correct: 0,
      fact: 'В Индии живёт огромное количество народов, и там говорят на сотнях разных языков.'
    },
  ],

  australia: [
    {
      country: 'australia', topic: '🏛 Угадай столицу',
      visual: { type: 'emoji', value: '🏙️' },
      text: 'Как называется столица Австралии? (Это не Сидней!)',
      options: ['Сидней', 'Канберра', 'Мельбурн', 'Перт'], correct: 1,
      fact: 'Многие думают, что столица Австралии — Сидней, но на самом деле это город Канберра.'
    },
    {
      country: 'australia', topic: '🚩 Угадай флаг',
      visual: { type: 'img', src: 'images/flag-australia.svg' },
      text: 'Флаг какой страны изображён на картинке?',
      options: ['Новая Зеландия', 'Великобритания', 'Австралия', 'Канада'], correct: 2,
      fact: 'На флаге Австралии есть созвездие Южный Крест — его видно только в южном полушарии неба.'
    },
    {
      country: 'australia', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🦘' },
      text: 'Какое животное передвигается большими прыжками и носит малышей в сумке на животе?',
      options: ['Кенгуру', 'Олень', 'Лошадь', 'Коза'], correct: 0,
      fact: 'Кенгуру не умеют ходить назад — только вперёд и прыжками!'
    },
    {
      country: 'australia', topic: '📸 Что на фото?',
      visual: { type: 'emoji', value: '🐨' },
      text: 'Какое сонное животное почти всё время проводит на эвкалиптовых деревьях?',
      options: ['Коала', 'Панда', 'Медведь', 'Ленивец'], correct: 0,
      fact: 'Коала спит до 20 часов в сутки — эвкалиптовые листья, которыми она питается, дают очень мало энергии.'
    },
    {
      country: 'australia', topic: '✅ Правда или ложь',
      visual: { type: 'emoji', value: '🗺️' },
      text: 'Правда или ложь: Австралия — это самый маленький материк на Земле.',
      options: ['Правда', 'Ложь'], correct: 0,
      fact: 'При этом в Австралии живёт огромное количество животных, которых больше нигде не встретишь — например, утконос и вомбат.'
    },
  ],
};

/* ---------------------------------------------------------------------
   3. ФОРМИРОВАНИЕ ИТОГОВОГО ПОРЯДКА ВОПРОСОВ (30 штук)
   --------------------------------------------------------------------- */
// Вопросы идут не по странам подряд, а перемешаны. Чтобы порядок был
// разнообразным, но при этом каждая страна встречалась ровно 5 раз,
// используем 5 "раундов", в каждом из которых страны идут в своём порядке.

const ROUND_ORDER = [
  ['france', 'japan', 'australia', 'china', 'india', 'brazil'],
  ['brazil', 'china', 'france', 'australia', 'japan', 'india'],
  ['india', 'australia', 'brazil', 'japan', 'china', 'france'],
  ['china', 'france', 'india', 'brazil', 'australia', 'japan'],
  ['japan', 'india', 'china', 'france', 'brazil', 'australia'],
];

function buildQuestionSequence(){
  const sequence = [];
  ROUND_ORDER.forEach((round, roundIndex) => {
    round.forEach(countryKey => {
      const q = QUESTION_BANK[countryKey][roundIndex];
      sequence.push(q);
    });
  });
  return sequence;
}

/* ---------------------------------------------------------------------
   4. СОСТОЯНИЕ ИГРЫ
   --------------------------------------------------------------------- */
const state = {
  sequence: [],
  currentIndex: 0,
  pickedPlayers: new Set(), // кто получил очко за текущий вопрос
  answered: false,
};

/* ---------------------------------------------------------------------
   ССЫЛКИ НА DOM-ЭЛЕМЕНТЫ
   --------------------------------------------------------------------- */
const el = {
  screens: {
    start: document.getElementById('screen-start'),
    players: document.getElementById('screen-players'),
    game: document.getElementById('screen-game'),
    final: document.getElementById('screen-final'),
  },
  btnStart: document.getElementById('btnStart'),
  playersGrid: document.getElementById('playersGrid'),
  btnToGame: document.getElementById('btnToGame'),

  countryBadgeFlag: document.getElementById('countryBadgeFlag'),
  countryBadgeName: document.getElementById('countryBadgeName'),
  progressLabel: document.getElementById('progressLabel'),
  progressFill: document.getElementById('progressFill'),
  miniScoreboard: document.getElementById('miniScoreboard'),

  questionTopic: document.getElementById('questionTopic'),
  questionVisual: document.getElementById('questionVisual'),
  questionText: document.getElementById('questionText'),
  optionsGrid: document.getElementById('optionsGrid'),

  scoringPanel: document.getElementById('scoringPanel'),
  scoringButtons: document.getElementById('scoringButtons'),
  btnNobody: document.getElementById('btnNobody'),
  btnShowFact: document.getElementById('btnShowFact'),

  factCard: document.getElementById('factCard'),
  factText: document.getElementById('factText'),
  btnNextQuestion: document.getElementById('btnNextQuestion'),

  podium: document.getElementById('podium'),
  finalTableBody: document.getElementById('finalTableBody'),
  btnRestart: document.getElementById('btnRestart'),

  flyingPlane: document.getElementById('flyingPlane'),
  confettiCanvas: document.getElementById('confettiCanvas'),
};

/* ---------------------------------------------------------------------
   ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
   --------------------------------------------------------------------- */
function showScreen(name){
  Object.values(el.screens).forEach(s => s.classList.remove('screen--active'));
  el.screens[name].classList.add('screen--active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------------------------------------------------------
   ЭКРАН УЧАСТНИКОВ
   --------------------------------------------------------------------- */
function renderPlayersScreen(){
  el.playersGrid.innerHTML = '';
  getRanked().forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.style.animationDelay = (i * 0.08) + 's';
    card.innerHTML = `
      <span class="player-card__avatar">${p.avatar}</span>
      <div class="player-card__name">${p.name}</div>
      <span class="player-card__score">${p.score} ${scoreWord(p.score)}</span>
      <div class="player-card__place">Место: ${i + 1}</div>
    `;
    el.playersGrid.appendChild(card);
  });
}

function scoreWord(n){
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'очко';
  if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'очка';
  return 'очков';
}

function getRanked(){
  return [...players].sort((a, b) => b.score - a.score);
}

/* ---------------------------------------------------------------------
   МИНИ-ТАБЛО ОЧКОВ (виднo во время игры)
   --------------------------------------------------------------------- */
function renderMiniScoreboard(){
  el.miniScoreboard.innerHTML = players.map(p =>
    `<div class="mini-score-chip">${p.avatar} ${p.name}: ${p.score}</div>`
  ).join('');
}

/* ---------------------------------------------------------------------
   5. ЛОГИКА ОДНОГО ВОПРОСА
   --------------------------------------------------------------------- */
function loadQuestion(index){
  state.answered = false;
  state.pickedPlayers.clear();

  const q = state.sequence[index];
  const country = COUNTRIES[q.country];

  // Верхняя панель
  el.countryBadgeFlag.textContent = country.flagEmoji;
  el.countryBadgeName.textContent = country.name;
  el.progressLabel.textContent = `Вопрос ${index + 1} из ${state.sequence.length}`;
  el.progressFill.style.width = `${((index + 1) / state.sequence.length) * 100}%`;
  renderMiniScoreboard();

  // Карточка вопроса
  el.questionTopic.textContent = q.topic;
  el.questionText.textContent = q.text;

  if (q.visual && q.visual.type === 'emoji'){
    el.questionVisual.classList.remove('is-empty');
    el.questionVisual.innerHTML = q.visual.value;
  } else if (q.visual && q.visual.type === 'img'){
    el.questionVisual.classList.remove('is-empty');
    el.questionVisual.innerHTML = `<img src="${q.visual.src}" alt="Изображение к вопросу">`;
  } else {
    el.questionVisual.classList.add('is-empty');
    el.questionVisual.innerHTML = '';
  }

  el.optionsGrid.innerHTML = '';
  q.options.forEach((optionText, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optionText;
    btn.addEventListener('click', () => handleAnswer(i, q, btn));
    el.optionsGrid.appendChild(btn);
  });

  // Сброс панелей ответа/факта
  el.scoringPanel.classList.remove('is-visible');
  el.factCard.classList.remove('is-visible');
  el.factText.textContent = q.fact;

  // Сброс кнопок начисления очков
  el.scoringButtons.innerHTML = '';
  players.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'score-btn';
    btn.textContent = `+1 ${p.name}`;
    btn.dataset.playerId = p.id;
    btn.addEventListener('click', () => togglePlayerPick(p.id, btn));
    el.scoringButtons.appendChild(btn);
  });
}

function handleAnswer(selectedIndex, q, clickedBtn){
  if (state.answered) return;
  state.answered = true;

  const buttons = Array.from(el.optionsGrid.children);
  buttons.forEach((b, i) => {
    b.classList.add('is-disabled');
    if (i === q.correct){
      b.classList.add('is-correct');
    } else if (i === selectedIndex){
      b.classList.add('is-wrong');
    } else {
      b.classList.add('is-dimmed');
    }
  });

  el.scoringPanel.classList.add('is-visible');
  el.scoringPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function togglePlayerPick(playerId, btn){
  if (state.pickedPlayers.has(playerId)){
    state.pickedPlayers.delete(playerId);
    btn.classList.remove('is-picked');
  } else {
    state.pickedPlayers.add(playerId);
    btn.classList.add('is-picked');
  }
}

el.btnNobody.addEventListener('click', () => {
  // Явно фиксируем, что очки в этом раунде никому не начисляются
  state.pickedPlayers.clear();
  Array.from(el.scoringButtons.children).forEach(b => b.classList.remove('is-picked'));
  proceedToFact();
});

el.btnShowFact.addEventListener('click', () => {
  // Начисляем очки выбранным игрокам
  state.pickedPlayers.forEach(id => {
    const p = players.find(pl => pl.id === id);
    if (p) p.score += 1;
  });
  proceedToFact();
});

function proceedToFact(){
  renderMiniScoreboard();
  el.factCard.classList.add('is-visible');
  el.factCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

el.btnNextQuestion.addEventListener('click', () => {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.sequence.length){
    goToFinal();
    return;
  }
  const currentCountry = state.sequence[state.currentIndex].country;
  const nextCountry = state.sequence[nextIndex].country;
  state.currentIndex = nextIndex;

  if (currentCountry !== nextCountry){
    flyPlaneThenLoad(nextIndex);
  } else {
    loadQuestion(nextIndex);
  }
});

/* ---------------------------------------------------------------------
   АНИМАЦИЯ ПЕРЕЛЁТА САМОЛЁТА МЕЖДУ СТРАНАМИ
   --------------------------------------------------------------------- */
function flyPlaneThenLoad(nextIndex){
  const plane = el.flyingPlane;
  const startX = -10, startY = 15 + Math.random() * 20;
  const endX = 105, endY = 10 + Math.random() * 30;

  plane.style.transition = 'none';
  plane.style.left = startX + 'vw';
  plane.style.top = startY + 'vh';
  plane.classList.add('flying-plane--visible');

  // Форсируем перерисовку перед стартом перехода
  // eslint-disable-next-line no-unused-expressions
  plane.offsetHeight;

  plane.style.transition = '';
  requestAnimationFrame(() => {
    plane.style.left = endX + 'vw';
    plane.style.top = endY + 'vh';
  });

  setTimeout(() => {
    loadQuestion(nextIndex);
  }, 550);

  setTimeout(() => {
    plane.classList.remove('flying-plane--visible');
  }, 1200);
}

/* ---------------------------------------------------------------------
   6. ФИНАЛЬНЫЙ ЭКРАН
   --------------------------------------------------------------------- */
const MEDALS = ['🥇', '🥈', '🥉', '🏅'];

function goToFinal(){
  showScreen('final');
  renderPodium();
  renderFinalTable();
  launchConfetti();
}

function renderPodium(){
  const ranked = getRanked();
  el.podium.innerHTML = '';
  ranked.forEach((p, i) => {
    const place = document.createElement('div');
    place.className = `podium-place podium-place--${i + 1}`;
    place.style.animationDelay = (i * 0.15) + 's';
    place.innerHTML = `
      <div class="podium-place__medal">${MEDALS[i] || '🏅'}</div>
      <div class="podium-place__name">${p.avatar} ${p.name}</div>
      <div class="podium-place__score">${p.score} ${scoreWord(p.score)}</div>
      <div class="podium-place__block">${i + 1}</div>
    `;
    el.podium.appendChild(place);
  });
}

function renderFinalTable(){
  const ranked = getRanked();
  el.finalTableBody.innerHTML = ranked.map((p, i) => `
    <tr>
      <td>${MEDALS[i] || (i + 1)}</td>
      <td>${p.avatar} ${p.name}</td>
      <td>${p.score}</td>
    </tr>
  `).join('');
}

/* ---------------------------------------------------------------------
   КОНФЕТТИ + "САЛЮТ"
   --------------------------------------------------------------------- */
function launchConfetti(){
  const canvas = el.confettiCanvas;
  canvas.classList.add('is-active');
  const ctx = canvas.getContext('2d');

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#FFD23F', '#FF5D5D', '#17C3B2', '#FF9A76', '#4C3BCF', '#FFFFFF'];
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height,
    size: 6 + Math.random() * 6,
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  let frame = 0;
  const totalFrames = 60 * 6; // ~6 секунд

  function tick(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      if (p.y > canvas.height + 20){
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect'){
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (frame < totalFrames){
      requestAnimationFrame(tick);
    } else {
      canvas.classList.remove('is-active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.removeEventListener('resize', resize);
    }
  }
  requestAnimationFrame(tick);
}

/* ---------------------------------------------------------------------
   НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ + СТАРТ ИГРЫ / ПЕРЕЗАПУСК
   --------------------------------------------------------------------- */
el.btnStart.addEventListener('click', () => {
  renderPlayersScreen();
  showScreen('players');
});

el.btnToGame.addEventListener('click', () => {
  state.sequence = buildQuestionSequence();
  state.currentIndex = 0;
  showScreen('game');
  loadQuestion(0);
});

el.btnRestart.addEventListener('click', () => {
  players.forEach(p => (p.score = 0));
  state.currentIndex = 0;
  state.sequence = [];
  showScreen('start');
});

/* Инициализация: показываем стартовый экран (он уже активен по умолчанию в HTML) */
showScreen('start');
