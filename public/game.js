// ── SYNTAXTERROR Client ──────────────────────────────────────────────────
const socket = io();

let myId = null, isHost = false, roomCode = null, selectedAvatar = null;
let questionCount = 15, timePerQuestion = 15;
let timerInterval = null, timeLeft = 0, hasAnswered = false;
let quizCategories = ['it', 'fisi'], availableCategories = {};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const screens = {
  menu: $('#screen-menu'), lobby: $('#screen-lobby'), countdown: $('#screen-countdown'),
  quiz: $('#screen-quiz'), 'quiz-result': $('#screen-quiz-result'),
  gameover: $('#screen-gameover'), flashcards: $('#screen-flashcards'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); });
  if (screens[name]) screens[name].classList.add('active');
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function getPlayerName() { return ($('#player-name').value || '').trim() || 'Anon_' + Math.floor(Math.random() * 999); }

// ── Avatars ──────────────────────────────────────────────────────────────
const avatars = ['🧑‍💻','👾','🤖','💀','🦊','🐱','🎮','🕹️','🧠','🔥','⚡','🎯','🚀','💎','🦄','👻'];
function initAvatarPicker() {
  const picker = $('#avatar-picker');
  picker.innerHTML = '';
  avatars.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'avatar-option' + (i === 0 ? ' selected' : '');
    div.textContent = a;
    div.onclick = () => { $$('.avatar-option').forEach(el => el.classList.remove('selected')); div.classList.add('selected'); selectedAvatar = a; };
    picker.appendChild(div);
  });
  selectedAvatar = avatars[0];
}

function renderPlayers(players) {
  const grid = $('#players-grid');
  grid.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card' + (p.isHost ? ' host' : '') + (p.ready ? ' ready' : '');
    card.innerHTML = `<div class="avatar">${p.avatar}</div><div class="name">${escapeHtml(p.name)}</div>
      ${p.isHost ? '<span class="badge badge-host">👑 Host</span>' : ''}${p.ready ? '<span class="badge badge-ready">✓ Ready</span>' : ''}`;
    grid.appendChild(card);
  });
}

function renderLeaderboard(container, leaderboard) {
  container.innerHTML = '';
  leaderboard.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (p.id === myId ? ' me' : '');
    row.innerHTML = `<span class="lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span>
      <span class="lb-avatar">${p.avatar}</span><span class="lb-name">${escapeHtml(p.name)}</span>
      <span class="lb-score">${p.score.toLocaleString()}</span>`;
    container.appendChild(row);
  });
}

function startTimer(barEl, textEl, seconds) {
  clearInterval(timerInterval);
  timeLeft = seconds;
  textEl.textContent = seconds;
  textEl.classList.remove('danger');
  barEl.style.transition = 'none'; barEl.style.width = '100%';
  void barEl.offsetHeight;
  barEl.style.transition = `width ${seconds}s linear`; barEl.style.width = '0%';
  barEl.classList.remove('danger');
  timerInterval = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1);
    textEl.textContent = Math.ceil(timeLeft);
    if (timeLeft <= 5) { textEl.classList.add('danger'); barEl.classList.add('danger'); }
    if (timeLeft <= 0) clearInterval(timerInterval);
  }, 1000);
}

// ══════════════════════════════════════════════════════════════════════════
// MENU
// ══════════════════════════════════════════════════════════════════════════
$('#btn-create').onclick = () => { const n = getPlayerName(); $('#player-name').value = n; socket.emit('create-room', { playerName: n, avatar: selectedAvatar }); };
$('#btn-join').onclick = () => {
  const n = getPlayerName(), code = ($('#room-code').value || '').trim().toUpperCase();
  if (code.length < 3) return toast('Bitte gültigen Code eingeben!', 'error');
  $('#player-name').value = n; socket.emit('join-room', { code, playerName: n, avatar: selectedAvatar });
};
$('#room-code').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
$('#room-code').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-join').click(); });
$('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-create').click(); });
$('#btn-flashcards').onclick = () => { initFlashcards('fisi'); showScreen('flashcards'); };

// ══════════════════════════════════════════════════════════════════════════
// LOBBY
// ══════════════════════════════════════════════════════════════════════════
$('#btn-copy-code').onclick = () => navigator.clipboard.writeText(roomCode).then(() => toast('Code kopiert! 📋', 'success'));
$('#btn-ready').onclick = () => socket.emit('toggle-ready');
$('#btn-start').onclick = () => socket.emit('start-game');

function renderCategorySelector() {
  const c = $('#category-selector'); if (!c) return; c.innerHTML = '';
  for (const [key, cat] of Object.entries(availableCategories)) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (quizCategories.includes(key) ? ' active' : '');
    btn.textContent = `${cat.icon} ${cat.name}`; btn.dataset.cat = key;
    btn.onclick = () => {
      if (quizCategories.includes(key)) { if (quizCategories.length <= 1) return toast('Mindestens 1 Kategorie!', 'error'); quizCategories = quizCategories.filter(c => c !== key); }
      else quizCategories.push(key);
      btn.classList.toggle('active'); socket.emit('update-settings', { quizCategories });
    };
    c.appendChild(btn);
  }
}

$$('.btn-sm[data-setting]').forEach(btn => {
  btn.onclick = () => {
    const s = btn.dataset.setting, d = parseInt(btn.dataset.delta);
    if (s === 'questionCount') { questionCount = Math.min(Math.max(questionCount + d, 5), 40); $('#setting-questions').textContent = questionCount; }
    else if (s === 'timePerQuestion') { timePerQuestion = Math.min(Math.max(timePerQuestion + d, 5), 30); $('#setting-time').textContent = timePerQuestion; }
    socket.emit('update-settings', { questionCount, timePerQuestion });
  };
});

$('#btn-play-again').onclick = () => socket.emit('play-again');
$('#btn-back-menu').onclick = () => location.reload();

// ══════════════════════════════════════════════════════════════════════════
// SOCKET EVENTS
// ══════════════════════════════════════════════════════════════════════════
socket.on('connect', () => { myId = socket.id; });
socket.on('error-msg', msg => toast(msg, 'error'));

socket.on('room-created', ({ code, players, categories }) => {
  roomCode = code; isHost = true; availableCategories = categories || {};
  $('#lobby-code').textContent = code; $('#host-settings').style.display = 'block'; $('#guest-waiting').style.display = 'none';
  renderPlayers(players); renderCategorySelector(); showScreen('lobby'); toast('Raum erstellt! Teile den Code.', 'success');
});

socket.on('room-joined', ({ code, players, categories }) => {
  roomCode = code; isHost = false; availableCategories = categories || {};
  $('#lobby-code').textContent = code; $('#host-settings').style.display = 'none'; $('#guest-waiting').style.display = 'block';
  renderPlayers(players); showScreen('lobby');
});

socket.on('player-update', ({ players }) => renderPlayers(players));
socket.on('settings-updated', s => {
  if (s.questionCount) { questionCount = s.questionCount; $('#setting-questions').textContent = s.questionCount; }
  if (s.timePerQuestion) { timePerQuestion = s.timePerQuestion; $('#setting-time').textContent = s.timePerQuestion; }
  if (s.quizCategories) { quizCategories = s.quizCategories; $$('.cat-btn').forEach(b => b.classList.toggle('active', quizCategories.includes(b.dataset.cat))); }
});
socket.on('host-changed', ({ hostName }) => toast(`${hostName} ist jetzt Host! 👑`, 'info'));
socket.on('player-left', ({ playerCount }) => toast(`Spieler hat verlassen (${playerCount} übrig)`, 'info'));

// Countdown
socket.on('game-started', () => {
  showScreen('countdown');
  let count = 3; $('#countdown-num').textContent = count;
  const ci = setInterval(() => {
    count--;
    if (count <= 0) { clearInterval(ci); $('#countdown-num').textContent = '🚀'; }
    else { $('#countdown-num').textContent = count; $('#countdown-num').style.animation = 'none'; void $('#countdown-num').offsetHeight; $('#countdown-num').style.animation = 'count-pop .5s ease'; }
  }, 800);
});

// Quiz
socket.on('quiz-question', ({ index, total, question, answers, time }) => {
  hasAnswered = false; showScreen('quiz');
  $('#q-index').textContent = index + 1; $('#q-total').textContent = total;
  $('#question-text').textContent = question; $('#waiting-answer').style.display = 'none';
  startTimer($('#timer-bar'), $('#timer-text'), time);
  const startTime = Date.now(), grid = $('#answers-grid');
  grid.innerHTML = '';
  ['A','B','C','D'].forEach((letter, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${letter}</span><span>${escapeHtml(answers[i])}</span>`;
    btn.onclick = () => {
      if (hasAnswered) return; hasAnswered = true; clearInterval(timerInterval);
      $$('.answer-btn').forEach(b => b.classList.add('disabled')); btn.classList.add('selected');
      socket.emit('submit-answer', { answerIndex: i, timeLeft: Math.max(0, time - (Date.now() - startTime) / 1000) });
      $('#waiting-answer').style.display = 'flex';
    };
    grid.appendChild(btn);
  });
});

socket.on('quiz-result', ({ correctIndex, roast, playerResults, leaderboard }) => {
  showScreen('quiz-result');
  $('#result-correct').textContent = `✓ Richtig: ${'ABCD'[correctIndex]}`;
  $('#result-roast').textContent = roast;
  const me = playerResults.find(p => p.id === myId);
  if (me) {
    const div = $('#result-personal');
    if (me.correct) { div.className = 'result-personal correct'; div.innerHTML = `✓ Richtig! ${me.score.toLocaleString()} Punkte ${me.streakMsg ? '<br>' + me.streakMsg : ''}`; }
    else if (!me.answered) { div.className = 'result-personal wrong'; div.innerHTML = `⏰ Zeit abgelaufen!<br><small>${me.roastMsg}</small>`; }
    else { div.className = 'result-personal wrong'; div.innerHTML = `✗ Falsch!<br><small>${me.roastMsg}</small>`; }
  }
  renderLeaderboard($('#mini-leaderboard'), leaderboard);
});

// Game Over
socket.on('game-over', ({ leaderboard, questionHistory }) => {
  showScreen('gameover');
  const podium = $('#podium'); podium.innerHTML = '';
  const order = [];
  if (leaderboard[1]) order.push({ ...leaderboard[1], place: 2 });
  if (leaderboard[0]) order.push({ ...leaderboard[0], place: 1 });
  if (leaderboard[2]) order.push({ ...leaderboard[2], place: 3 });
  const cls = { 1: 'first', 2: 'second', 3: 'third' }, emj = { 1: '🥇', 2: '🥈', 3: '🥉' };
  order.forEach(p => {
    const div = document.createElement('div'); div.className = 'podium-place';
    div.innerHTML = `<div class="podium-avatar">${p.avatar}</div><div class="podium-name">${escapeHtml(p.name)}</div><div class="podium-score">${p.score.toLocaleString()}</div><div class="podium-bar ${cls[p.place]}">${emj[p.place]}</div>`;
    podium.appendChild(div);
  });
  renderLeaderboard($('#final-leaderboard'), leaderboard);
  $('#btn-play-again').style.display = isHost ? 'block' : 'none';

  const statsSection = $('#stats-section'), statsContainer = $('#stats-container');
  if (questionHistory && questionHistory.length > 0) {
    statsSection.style.display = 'block'; statsContainer.style.display = 'none'; statsContainer.innerHTML = '';
    questionHistory.forEach((entry, i) => {
      const total = Object.keys(entry.players).length;
      const correct = Object.values(entry.players).filter(p => p.correct).length;
      const block = document.createElement('div'); block.className = 'stats-question';
      block.innerHTML = `<div class="stats-q-header" data-idx="${i}"><span class="stats-q-num">#${i+1}</span><span class="stats-q-text">${escapeHtml(entry.question)}</span><span class="stats-q-correct">${correct}/${total}</span></div>
        <div class="stats-q-body" id="stats-body-${i}"><div class="stats-q-answer">✓ ${escapeHtml(entry.correctAnswer)}</div>
        ${Object.entries(entry.players).map(([, p]) => `<div class="stats-player-row"><span class="sp-name">${escapeHtml(p.name)}</span><span class="sp-result ${p.correct?'correct':p.answered?'wrong':'missed'}">${p.correct?'✓':p.answered?'✗':'—'}</span></div>`).join('')}</div>`;
      statsContainer.appendChild(block);
    });
    statsContainer.addEventListener('click', e => { const h = e.target.closest('.stats-q-header'); if (h) { const b = $(`#stats-body-${h.dataset.idx}`); if (b) b.classList.toggle('open'); } });
    $('#btn-toggle-stats').onclick = () => { const v = statsContainer.style.display !== 'none'; statsContainer.style.display = v ? 'none' : 'block'; $('#btn-toggle-stats').textContent = v ? '📊 Statistik anzeigen' : '📊 Statistik ausblenden'; };
  } else { statsSection.style.display = 'none'; }
});

socket.on('back-to-lobby', ({ players }) => { renderPlayers(players); showScreen('lobby'); toast('Zurück in der Lobby!', 'info'); });

// Keyboard
document.addEventListener('keydown', e => {
  if (screens.quiz.classList.contains('active') && !hasAnswered) {
    const m = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const idx = m[e.key.toLowerCase()]; if (idx !== undefined) { const btns = $$('.answer-btn'); if (btns[idx]) btns[idx].click(); }
  }
  if (screens.flashcards.classList.contains('active')) {
    if (e.key === ' ') { e.preventDefault(); $('#fc-card').classList.toggle('flipped'); }
    if (e.key === 'ArrowRight') $('#fc-next').click();
    if (e.key === 'ArrowLeft') $('#fc-prev').click();
  }
});

// ══════════════════════════════════════════════════════════════════════════
// FLASHCARDS (Singleplayer)
// ══════════════════════════════════════════════════════════════════════════
let fcCards = [], fcIndex = 0, fcRight = 0, fcWrong = 0, fcDeck = 'fisi';
const fcCache = {};

async function loadDeck(deck) {
  if (fcCache[deck]) return fcCache[deck];
  const res = await fetch(`/flashcards-${deck}.json`);
  const data = await res.json();
  fcCache[deck] = data;
  return data;
}

async function initFlashcards(deck) {
  fcDeck = deck;
  $$('.fc-deck-btn').forEach(b => b.classList.toggle('active', b.dataset.deck === deck));
  const data = await loadDeck(deck);
  fcCards = [...data]; fcIndex = 0; fcRight = 0; fcWrong = 0;
  renderFlashcard();
}

function renderFlashcard() {
  if (fcCards.length === 0) {
    $('#fc-question').textContent = 'Keine Karten mehr! 🎉';
    $('#fc-answer').textContent = 'Du hast alle durchgearbeitet.';
    $('#fc-current').textContent = '0'; $('#fc-total').textContent = '0';
    return;
  }
  const card = fcCards[fcIndex];
  $('#fc-question').textContent = card.q;
  $('#fc-answer').textContent = card.a;
  $('#fc-current').textContent = fcIndex + 1;
  $('#fc-total').textContent = fcCards.length;
  $('#fc-card').classList.remove('flipped');
  $('#fc-progress').style.width = ((fcIndex + 1) / fcCards.length * 100) + '%';
  $('#fc-stat-right').textContent = `✓ ${fcRight}`;
  $('#fc-stat-wrong').textContent = `✗ ${fcWrong}`;
  $('#fc-stat-remaining').textContent = `📚 ${fcCards.length} übrig`;
}

function shuffleCards() {
  for (let i = fcCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fcCards[i], fcCards[j]] = [fcCards[j], fcCards[i]];
  }
  fcIndex = 0;
  renderFlashcard();
  toast('Karten gemischt! 🔀', 'info');
}

$('#fc-card').onclick = () => $('#fc-card').classList.toggle('flipped');
$('#fc-next').onclick = () => { if (fcCards.length > 0) { fcIndex = (fcIndex + 1) % fcCards.length; renderFlashcard(); } };
$('#fc-prev').onclick = () => { if (fcCards.length > 0) { fcIndex = (fcIndex - 1 + fcCards.length) % fcCards.length; renderFlashcard(); } };
$('#fc-shuffle').onclick = shuffleCards;
$('#fc-back').onclick = () => showScreen('menu');

$('#fc-right').onclick = () => {
  fcRight++; fcCards.splice(fcIndex, 1);
  if (fcIndex >= fcCards.length) fcIndex = 0;
  renderFlashcard();
};
$('#fc-wrong').onclick = () => {
  fcWrong++; fcIndex = (fcIndex + 1) % fcCards.length;
  renderFlashcard();
};

$$('.fc-deck-btn').forEach(btn => {
  btn.onclick = () => initFlashcards(btn.dataset.deck);
});

// ── Init ─────────────────────────────────────────────────────────────────
initAvatarPicker();
$('#player-name').focus();
