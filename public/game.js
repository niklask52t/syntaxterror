// ── BRAINWRECK Client ────────────────────────────────────────────────────
const socket = io();

// ── State ────────────────────────────────────────────────────────────────
let myId = null;
let isHost = false;
let roomCode = null;
let selectedAvatar = null;
let currentGameMode = 'quiz';
let questionCount = 15;
let timePerQuestion = 15;
let typingRounds = 10;
let emojiRounds = 8;
let timerInterval = null;
let timeLeft = 0;
let hasAnswered = false;
let quizCategories = ['it', 'fisi'];
let availableCategories = {};

// ── DOM refs ─────────────────────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const screens = {
  menu: $('#screen-menu'),
  lobby: $('#screen-lobby'),
  countdown: $('#screen-countdown'),
  quiz: $('#screen-quiz'),
  'quiz-result': $('#screen-quiz-result'),
  typing: $('#screen-typing'),
  'typing-result': $('#screen-typing-result'),
  estimation: $('#screen-estimation'),
  'estimation-result': $('#screen-estimation-result'),
  emoji: $('#screen-emoji'),
  'emoji-result': $('#screen-emoji-result'),
  gameover: $('#screen-gameover'),
};

// ── Avatars ──────────────────────────────────────────────────────────────
const avatars = ['🧑‍💻','👾','🤖','💀','🦊','🐱','🎮','🕹️','🧠','🔥','⚡','🎯','🚀','💎','🦄','👻'];

function initAvatarPicker() {
  const picker = $('#avatar-picker');
  picker.innerHTML = '';
  avatars.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'avatar-option' + (i === 0 ? ' selected' : '');
    div.textContent = a;
    div.onclick = () => {
      $$('.avatar-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedAvatar = a;
    };
    picker.appendChild(div);
  });
  selectedAvatar = avatars[0];
}

// ── Screen switching ─────────────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); });
  if (screens[name]) screens[name].classList.add('active');
}

// ── Toast ────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Helpers ──────────────────────────────────────────────────────────────
function getPlayerName() {
  return ($('#player-name').value || '').trim() || 'Anon_' + Math.floor(Math.random() * 999);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderPlayers(players) {
  const grid = $('#players-grid');
  grid.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    let classes = 'player-card';
    if (p.isHost) classes += ' host';
    if (p.ready) classes += ' ready';
    card.className = classes;
    card.innerHTML = `
      <div class="avatar">${p.avatar}</div>
      <div class="name">${escapeHtml(p.name)}</div>
      ${p.isHost ? '<span class="badge badge-host">👑 Host</span>' : ''}
      ${p.ready ? '<span class="badge badge-ready">✓ Ready</span>' : ''}
    `;
    grid.appendChild(card);
  });
}

function renderLeaderboard(container, leaderboard) {
  container.innerHTML = '';
  leaderboard.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (p.id === myId ? ' me' : '');
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    row.innerHTML = `
      <span class="lb-rank ${rankClass}">${i + 1}</span>
      <span class="lb-avatar">${p.avatar}</span>
      <span class="lb-name">${escapeHtml(p.name)}</span>
      <span class="lb-score">${p.score.toLocaleString()}</span>
    `;
    container.appendChild(row);
  });
}

function startTimer(barEl, textEl, seconds, onTick) {
  clearInterval(timerInterval);
  timeLeft = seconds;
  textEl.textContent = seconds;
  textEl.classList.remove('danger');
  barEl.style.transition = 'none';
  barEl.style.width = '100%';
  void barEl.offsetHeight;
  barEl.style.transition = `width ${seconds}s linear`;
  barEl.style.width = '0%';
  barEl.classList.remove('danger');

  timerInterval = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1);
    textEl.textContent = Math.ceil(timeLeft);
    if (timeLeft <= 5) {
      textEl.classList.add('danger');
      barEl.classList.add('danger');
    }
    if (onTick) onTick(timeLeft);
    if (timeLeft <= 0) clearInterval(timerInterval);
  }, 1000);
}

const modeNames = { quiz: '🧠 IT Quiz', typing: '⌨️ Speed Typing', estimation: '🎯 Schätz-Arena', emoji: '👾 Emoji Roulette' };

// ══════════════════════════════════════════════════════════════════════════
// MENU
// ══════════════════════════════════════════════════════════════════════════
$('#btn-create').onclick = () => {
  const name = getPlayerName();
  $('#player-name').value = name;
  socket.emit('create-room', { playerName: name, avatar: selectedAvatar });
};

$('#btn-join').onclick = () => {
  const name = getPlayerName();
  const code = ($('#room-code').value || '').trim().toUpperCase();
  if (code.length < 3) return toast('Bitte gültigen Code eingeben!', 'error');
  $('#player-name').value = name;
  socket.emit('join-room', { code, playerName: name, avatar: selectedAvatar });
};

$('#room-code').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
$('#room-code').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-join').click(); });
$('#player-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-create').click(); });

// ══════════════════════════════════════════════════════════════════════════
// LOBBY
// ══════════════════════════════════════════════════════════════════════════
$('#btn-copy-code').onclick = () => {
  navigator.clipboard.writeText(roomCode).then(() => toast('Code kopiert! 📋', 'success'));
};
$('#btn-ready').onclick = () => socket.emit('toggle-ready');
$('#btn-start').onclick = () => socket.emit('start-game');

// Mode selector
$$('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGameMode = btn.dataset.mode;
    // Show relevant settings
    $$('.mode-settings').forEach(s => s.style.display = 'none');
    const settingsEl = $(`#settings-${currentGameMode}`);
    if (settingsEl) settingsEl.style.display = 'block';
    socket.emit('update-settings', { gameMode: currentGameMode });
  };
});

// Category selector
function renderCategorySelector() {
  const container = $('#category-selector');
  if (!container) return;
  container.innerHTML = '';
  for (const [key, cat] of Object.entries(availableCategories)) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (quizCategories.includes(key) ? ' active' : '');
    btn.textContent = `${cat.icon} ${cat.name}`;
    btn.dataset.cat = key;
    btn.onclick = () => {
      if (quizCategories.includes(key)) {
        if (quizCategories.length <= 1) return toast('Mindestens 1 Kategorie!', 'error');
        quizCategories = quizCategories.filter(c => c !== key);
      } else {
        quizCategories.push(key);
      }
      btn.classList.toggle('active');
      socket.emit('update-settings', { quizCategories });
    };
    container.appendChild(btn);
  }
}

// Settings buttons
$$('.btn-sm[data-setting]').forEach(btn => {
  btn.onclick = () => {
    const setting = btn.dataset.setting;
    const delta = parseInt(btn.dataset.delta);
    if (setting === 'questionCount') {
      questionCount = Math.min(Math.max(questionCount + delta, 5), 40);
      $('#setting-questions').textContent = questionCount;
      if ($('#setting-est-questions')) $('#setting-est-questions').textContent = questionCount;
    } else if (setting === 'timePerQuestion') {
      timePerQuestion = Math.min(Math.max(timePerQuestion + delta, 5), 30);
      $('#setting-time').textContent = timePerQuestion;
    } else if (setting === 'typingRounds') {
      typingRounds = Math.min(Math.max(typingRounds + delta, 3), 20);
      $('#setting-typing-rounds').textContent = typingRounds;
    } else if (setting === 'emojiRounds') {
      emojiRounds = Math.min(Math.max(emojiRounds + delta, 3), 15);
      $('#setting-emoji-rounds').textContent = emojiRounds;
    }
    socket.emit('update-settings', { questionCount, timePerQuestion, typingRounds, emojiRounds });
  };
});

// Game over buttons
$('#btn-play-again').onclick = () => socket.emit('play-again');
$('#btn-back-menu').onclick = () => location.reload();

// ══════════════════════════════════════════════════════════════════════════
// SOCKET EVENTS - CONNECTION & ROOM
// ══════════════════════════════════════════════════════════════════════════
socket.on('connect', () => { myId = socket.id; });
socket.on('error-msg', (msg) => toast(msg, 'error'));

socket.on('room-created', ({ code, players, categories }) => {
  roomCode = code; isHost = true;
  availableCategories = categories || {};
  $('#lobby-code').textContent = code;
  $('#host-settings').style.display = 'block';
  $('#guest-waiting').style.display = 'none';
  renderPlayers(players);
  renderCategorySelector();
  showScreen('lobby');
  toast('Raum erstellt! Teile den Code.', 'success');
});

socket.on('room-joined', ({ code, players, categories }) => {
  roomCode = code; isHost = false;
  availableCategories = categories || {};
  $('#lobby-code').textContent = code;
  $('#host-settings').style.display = 'none';
  $('#guest-waiting').style.display = 'block';
  renderPlayers(players);
  showScreen('lobby');
});

socket.on('player-update', ({ players }) => renderPlayers(players));

socket.on('settings-updated', (s) => {
  if (s.gameMode) {
    currentGameMode = s.gameMode;
    $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === s.gameMode));
    $$('.mode-settings').forEach(el => el.style.display = 'none');
    const settingsEl = $(`#settings-${s.gameMode}`);
    if (settingsEl) settingsEl.style.display = 'block';
    if ($('#guest-mode-display')) $('#guest-mode-display').textContent = `Mode: ${modeNames[s.gameMode] || s.gameMode}`;
  }
  if (s.questionCount) { questionCount = s.questionCount; $('#setting-questions').textContent = s.questionCount; if ($('#setting-est-questions')) $('#setting-est-questions').textContent = s.questionCount; }
  if (s.timePerQuestion) { timePerQuestion = s.timePerQuestion; $('#setting-time').textContent = s.timePerQuestion; }
  if (s.typingRounds) { typingRounds = s.typingRounds; $('#setting-typing-rounds').textContent = s.typingRounds; }
  if (s.emojiRounds) { emojiRounds = s.emojiRounds; $('#setting-emoji-rounds').textContent = s.emojiRounds; }
  if (s.quizCategories) { quizCategories = s.quizCategories; $$('.cat-btn').forEach(b => b.classList.toggle('active', quizCategories.includes(b.dataset.cat))); }
});

socket.on('host-changed', ({ hostName }) => toast(`${hostName} ist jetzt Host! 👑`, 'info'));
socket.on('player-left', ({ playerCount }) => toast(`Spieler hat verlassen (${playerCount} übrig)`, 'info'));

// ══════════════════════════════════════════════════════════════════════════
// GAME START & COUNTDOWN
// ══════════════════════════════════════════════════════════════════════════
socket.on('game-started', ({ gameMode }) => {
  currentGameMode = gameMode;
  showScreen('countdown');
  $('#countdown-mode').textContent = modeNames[gameMode] || gameMode;
  let count = 3;
  $('#countdown-num').textContent = count;

  const ci = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(ci);
      $('#countdown-num').textContent = '🚀';
    } else {
      $('#countdown-num').textContent = count;
      $('#countdown-num').style.animation = 'none';
      void $('#countdown-num').offsetHeight;
      $('#countdown-num').style.animation = 'count-pop .5s ease';
    }
  }, 800);
});

// ══════════════════════════════════════════════════════════════════════════
// QUIZ MODE
// ══════════════════════════════════════════════════════════════════════════
socket.on('quiz-question', ({ index, total, question, answers, time }) => {
  hasAnswered = false;
  showScreen('quiz');
  $('#q-index').textContent = index + 1;
  $('#q-total').textContent = total;
  $('#question-text').textContent = question;
  $('#waiting-answer').style.display = 'none';

  startTimer($('#timer-bar'), $('#timer-text'), time);

  const startTime = Date.now();
  const grid = $('#answers-grid');
  grid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  answers.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${letters[i]}</span><span>${escapeHtml(text)}</span>`;
    btn.onclick = () => {
      if (hasAnswered) return;
      hasAnswered = true;
      clearInterval(timerInterval);
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, time - elapsed);
      $$('.answer-btn').forEach(b => b.classList.add('disabled'));
      btn.classList.add('selected');
      socket.emit('submit-answer', { answerIndex: i, timeLeft: remaining });
      $('#waiting-answer').style.display = 'flex';
    };
    grid.appendChild(btn);
  });
});

socket.on('answer-received', () => {});

socket.on('quiz-result', ({ correctIndex, roast, playerResults, leaderboard }) => {
  showScreen('quiz-result');
  const letters = ['A', 'B', 'C', 'D'];
  $('#result-correct').textContent = `✓ Richtig: ${letters[correctIndex]}`;
  $('#result-roast').textContent = roast;

  const me = playerResults.find(p => p.id === myId);
  if (me) {
    const div = $('#result-personal');
    if (me.correct) {
      div.className = 'result-personal correct';
      div.innerHTML = `✓ Richtig! ${me.score.toLocaleString()} Punkte ${me.streakMsg ? `<br>${me.streakMsg}` : ''}`;
    } else if (!me.answered) {
      div.className = 'result-personal wrong';
      div.innerHTML = `⏰ Zeit abgelaufen!<br><small>${me.roastMsg}</small>`;
    } else {
      div.className = 'result-personal wrong';
      div.innerHTML = `✗ Falsch!<br><small>${me.roastMsg}</small>`;
    }
  }
  renderLeaderboard($('#mini-leaderboard'), leaderboard);
});

// ══════════════════════════════════════════════════════════════════════════
// TYPING MODE
// ══════════════════════════════════════════════════════════════════════════
let typingStartTime = null;
let typingErrors = 0;
let typingTarget = '';
let typingDone = false;

socket.on('typing-round', ({ index, total, code, lang }) => {
  typingDone = false;
  typingErrors = 0;
  typingTarget = code;
  typingStartTime = null;
  showScreen('typing');

  $('#t-index').textContent = index + 1;
  $('#t-total').textContent = total;
  $('#typing-lang').textContent = lang;
  $('#typing-errors').textContent = 'Fehler: 0';
  $('#typing-time').textContent = '0.0s';
  $('#typing-waiting').style.display = 'none';

  // Render target with character spans
  const targetEl = $('#typing-target');
  targetEl.innerHTML = '';
  for (let i = 0; i < code.length; i++) {
    const span = document.createElement('span');
    span.className = 'char' + (i === 0 ? ' current' : '');
    span.textContent = code[i];
    targetEl.appendChild(span);
  }

  const input = $('#typing-input');
  input.value = '';
  input.disabled = false;
  input.focus();

  startTimer($('#typing-timer-bar'), $('#typing-timer-text'), 30);

  // Track typing time
  let typingTimerUpdate = null;
  input.oninput = () => {
    if (typingDone) return;
    if (!typingStartTime) {
      typingStartTime = Date.now();
      typingTimerUpdate = setInterval(() => {
        if (typingStartTime) {
          $('#typing-time').textContent = ((Date.now() - typingStartTime) / 1000).toFixed(1) + 's';
        }
      }, 100);
    }

    const val = input.value;
    const chars = targetEl.querySelectorAll('.char');

    // Count errors
    let errors = 0;
    for (let i = 0; i < val.length && i < typingTarget.length; i++) {
      chars[i].classList.remove('current', 'correct', 'wrong');
      if (val[i] === typingTarget[i]) {
        chars[i].classList.add('correct');
      } else {
        chars[i].classList.add('wrong');
        errors++;
      }
    }
    // Reset remaining chars
    for (let i = val.length; i < typingTarget.length; i++) {
      chars[i].classList.remove('current', 'correct', 'wrong');
      if (i === val.length) chars[i].classList.add('current');
    }

    typingErrors = errors;
    $('#typing-errors').textContent = `Fehler: ${errors}`;

    // Check if complete
    if (val.length >= typingTarget.length) {
      typingDone = true;
      clearInterval(typingTimerUpdate);
      clearInterval(timerInterval);
      input.disabled = true;
      const time = (Date.now() - typingStartTime) / 1000;
      $('#typing-time').textContent = time.toFixed(1) + 's';
      socket.emit('typing-complete', { time: parseFloat(time.toFixed(2)), errors: typingErrors });
      $('#typing-waiting').style.display = 'flex';
    }
  };
});

socket.on('typing-received', () => {});

socket.on('typing-result', ({ results, leaderboard }) => {
  showScreen('typing-result');
  const list = $('#typing-results-list');
  list.innerHTML = '';
  results.forEach(r => {
    const row = document.createElement('div');
    row.className = 'typing-result-row' + (r.id === myId ? ' me' : '');
    row.innerHTML = `
      <span class="tr-avatar">${r.avatar}</span>
      <span class="tr-name">${escapeHtml(r.name)}</span>
      ${r.finished
        ? `<span class="tr-time">${r.time.toFixed(1)}s</span>
           <span class="tr-errors">${r.errors > 0 ? r.errors + ' err' : '✓'}</span>
           <span class="tr-points">+${r.points}</span>`
        : '<span class="tr-dnf">DNF</span>'}
    `;
    list.appendChild(row);
  });
  renderLeaderboard($('#typing-leaderboard'), leaderboard);
});

// ══════════════════════════════════════════════════════════════════════════
// ESTIMATION MODE
// ══════════════════════════════════════════════════════════════════════════
let estSubmitted = false;

socket.on('estimation-question', ({ index, total, question, unit, time }) => {
  estSubmitted = false;
  showScreen('estimation');
  $('#e-index').textContent = index + 1;
  $('#e-total').textContent = total;
  $('#est-question').textContent = question;
  $('#est-unit').textContent = unit;
  $('#est-input').value = '';
  $('#est-input').disabled = false;
  $('#est-submit').disabled = false;
  $('#est-waiting').style.display = 'none';
  $('#est-input').focus();

  startTimer($('#est-timer-bar'), $('#est-timer-text'), time);
});

$('#est-submit').onclick = submitEstimate;
$('#est-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitEstimate(); });

function submitEstimate() {
  if (estSubmitted) return;
  const val = parseFloat($('#est-input').value);
  if (isNaN(val)) return toast('Bitte eine Zahl eingeben!', 'error');
  estSubmitted = true;
  clearInterval(timerInterval);
  $('#est-input').disabled = true;
  $('#est-submit').disabled = true;
  socket.emit('submit-estimate', { value: val });
  $('#est-waiting').style.display = 'flex';
}

socket.on('estimate-received', () => {});

socket.on('estimation-result', ({ answer, unit, fun, results, leaderboard }) => {
  showScreen('estimation-result');
  $('#est-answer-display').textContent = `Antwort: ${answer} ${unit}`;
  $('#est-fun').textContent = fun;

  const list = $('#est-results-list');
  list.innerHTML = '';
  // Sort by closeness
  const sorted = [...results].filter(r => r.answered).sort((a, b) => a.diff - b.diff);
  const noAnswer = results.filter(r => !r.answered);

  [...sorted, ...noAnswer].forEach(r => {
    const row = document.createElement('div');
    row.className = 'est-result-row' + (r.id === myId ? ' me' : '');
    const pctOff = r.answered ? (r.diff / Math.max(Math.abs(answer), 0.001) * 100) : null;
    row.innerHTML = `
      <span class="er-avatar">${r.avatar}</span>
      <span class="er-name">${escapeHtml(r.name)}</span>
      ${r.answered
        ? `<span class="er-estimate">${r.estimate}</span>
           <span class="er-diff ${pctOff < 25 ? 'close' : 'far'}">${pctOff < 1 ? 'SPOT ON!' : 'Diff: ' + (pctOff < 100 ? pctOff.toFixed(0) + '%' : r.diff.toFixed(1))}</span>
           <span class="er-points">+${r.points}</span>`
        : '<span class="er-diff far">Keine Antwort</span>'}
    `;
    list.appendChild(row);
  });
  renderLeaderboard($('#est-leaderboard'), leaderboard);
});

// ══════════════════════════════════════════════════════════════════════════
// EMOJI ROULETTE MODE
// ══════════════════════════════════════════════════════════════════════════
let emojiTapped = false;
let emojiTarget = '';
let emojiSequenceActive = false;
let emojiCurrentIsTarget = false;
let emojiShowTime = 0;

socket.on('emoji-round', ({ index, total, target, sequence, interval }) => {
  emojiTapped = false;
  emojiTarget = target;
  emojiSequenceActive = true;
  emojiCurrentIsTarget = false;
  showScreen('emoji');

  $('#em-index').textContent = index + 1;
  $('#em-total').textContent = total;
  $('#emoji-target').textContent = target;
  $('#emoji-waiting').style.display = 'none';
  $('#emoji-tap-btn').disabled = false;

  const display = $('#emoji-current');
  const area = $('.emoji-display-area');

  let i = 0;
  const showNext = () => {
    if (i >= sequence.length) {
      emojiSequenceActive = false;
      if (!emojiTapped) {
        // Missed - no tap registered
        display.textContent = '❌';
        $('#emoji-waiting').style.display = 'flex';
      }
      return;
    }
    display.textContent = sequence[i];
    display.classList.remove('pop');
    void display.offsetHeight;
    display.classList.add('pop');
    emojiCurrentIsTarget = sequence[i] === target;
    if (emojiCurrentIsTarget) emojiShowTime = Date.now();
    i++;
    setTimeout(showNext, interval);
  };
  showNext();
});

$('#emoji-tap-btn').onclick = () => {
  if (emojiTapped || !emojiSequenceActive) return;
  emojiTapped = true;
  $('#emoji-tap-btn').disabled = true;
  const area = $('.emoji-display-area');

  if (emojiCurrentIsTarget) {
    const reactionTime = Date.now() - emojiShowTime;
    area.classList.add('flash-correct');
    setTimeout(() => area.classList.remove('flash-correct'), 500);
    socket.emit('emoji-tap', { time: reactionTime });
    toast(`${reactionTime}ms Reaktionszeit!`, 'success');
  } else {
    area.classList.add('flash-wrong');
    setTimeout(() => area.classList.remove('flash-wrong'), 500);
    socket.emit('emoji-wrong-tap');
    toast('Falsches Emoji! -200 Punkte', 'error');
  }
  $('#emoji-waiting').style.display = 'flex';
};

socket.on('emoji-tap-received', () => {});

socket.on('emoji-result', ({ results, leaderboard }) => {
  showScreen('emoji-result');
  const list = $('#emoji-results-list');
  list.innerHTML = '';
  results.forEach(r => {
    const row = document.createElement('div');
    row.className = 'emoji-result-row' + (r.id === myId ? ' me' : '');
    row.innerHTML = `
      <span class="emr-avatar">${r.avatar}</span>
      <span class="emr-name">${escapeHtml(r.name)}</span>
      ${r.tapTime !== null
        ? `<span class="emr-time">${r.tapTime}ms</span>`
        : r.wrong
          ? '<span class="emr-wrong">FALSCH!</span>'
          : '<span class="emr-missed">Verpasst</span>'}
      <span class="emr-points ${r.points < 0 ? 'emr-wrong' : ''}">${r.points > 0 ? '+' : ''}${r.points}</span>
    `;
    list.appendChild(row);
  });
  renderLeaderboard($('#emoji-leaderboard'), leaderboard);
});

// ══════════════════════════════════════════════════════════════════════════
// GAME OVER
// ══════════════════════════════════════════════════════════════════════════
socket.on('game-over', ({ leaderboard, questionHistory }) => {
  showScreen('gameover');
  const podium = $('#podium');
  podium.innerHTML = '';

  const podiumOrder = [];
  if (leaderboard[1]) podiumOrder.push({ ...leaderboard[1], place: 2 });
  if (leaderboard[0]) podiumOrder.push({ ...leaderboard[0], place: 1 });
  if (leaderboard[2]) podiumOrder.push({ ...leaderboard[2], place: 3 });

  const placeClasses = { 1: 'first', 2: 'second', 3: 'third' };
  const placeEmojis = { 1: '🥇', 2: '🥈', 3: '🥉' };

  podiumOrder.forEach(p => {
    const div = document.createElement('div');
    div.className = 'podium-place';
    div.innerHTML = `
      <div class="podium-avatar">${p.avatar}</div>
      <div class="podium-name">${escapeHtml(p.name)}</div>
      <div class="podium-score">${p.score.toLocaleString()}</div>
      <div class="podium-bar ${placeClasses[p.place]}">${placeEmojis[p.place]}</div>
    `;
    podium.appendChild(div);
  });

  renderLeaderboard($('#final-leaderboard'), leaderboard);
  $('#btn-play-again').style.display = isHost ? 'block' : 'none';

  // Stats section
  const statsSection = $('#stats-section');
  const statsContainer = $('#stats-container');
  if (questionHistory && questionHistory.length > 0) {
    statsSection.style.display = 'block';
    statsContainer.style.display = 'none';
    statsContainer.innerHTML = '';

    questionHistory.forEach((entry, i) => {
      const totalPlayers = Object.keys(entry.players).length;
      const correctCount = Object.values(entry.players).filter(p => p.correct).length;

      const block = document.createElement('div');
      block.className = 'stats-question';
      block.innerHTML = `
        <div class="stats-q-header" data-idx="${i}">
          <span class="stats-q-num">#${i + 1}</span>
          <span class="stats-q-text">${escapeHtml(entry.question)}</span>
          <span class="stats-q-correct">${correctCount}/${totalPlayers}</span>
        </div>
        <div class="stats-q-body" id="stats-body-${i}">
          <div class="stats-q-answer">✓ ${escapeHtml(entry.correctAnswer)}</div>
          ${Object.entries(entry.players).map(([pid, p]) => `
            <div class="stats-player-row">
              <span class="sp-name">${escapeHtml(p.name)}</span>
              <span class="sp-result ${p.correct ? 'correct' : p.answered ? 'wrong' : 'missed'}">
                ${p.correct ? '✓' : p.answered ? '✗' : '—'}
              </span>
            </div>
          `).join('')}
        </div>
      `;
      statsContainer.appendChild(block);
    });

    // Toggle per question
    statsContainer.addEventListener('click', (e) => {
      const header = e.target.closest('.stats-q-header');
      if (!header) return;
      const body = $(`#stats-body-${header.dataset.idx}`);
      if (body) body.classList.toggle('open');
    });

    // Toggle button
    $('#btn-toggle-stats').onclick = () => {
      const visible = statsContainer.style.display !== 'none';
      statsContainer.style.display = visible ? 'none' : 'block';
      $('#btn-toggle-stats').textContent = visible ? '📊 Statistik anzeigen' : '📊 Statistik ausblenden';
    };
  } else {
    statsSection.style.display = 'none';
  }
});

socket.on('back-to-lobby', ({ players }) => {
  renderPlayers(players);
  showScreen('lobby');
  toast('Zurück in der Lobby!', 'info');
});

// ── Keyboard shortcuts ───────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  // Quiz: 1-4 or a-d
  if (screens.quiz.classList.contains('active') && !hasAnswered) {
    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const index = keyMap[e.key.toLowerCase()];
    if (index !== undefined) {
      const btns = $$('.answer-btn');
      if (btns[index]) btns[index].click();
    }
  }
  // Emoji: space = tap
  if (screens.emoji.classList.contains('active') && e.key === ' ') {
    e.preventDefault();
    $('#emoji-tap-btn').click();
  }
});

// ── Init ─────────────────────────────────────────────────────────────────
initAvatarPicker();
$('#player-name').focus();
