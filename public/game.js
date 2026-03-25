// ── SYNTAXTERROR Client ──────────────────────────────────────────────────
const socket = io();

let myId = null, isHost = false, roomCode = null, selectedAvatar = null;
let gameMode = 'quiz', questionCount = 15, timePerQuestion = 15;
let typingRounds = 10, emojiRounds = 8;
let timerInterval = null, timeLeft = 0, hasAnswered = false;
let quizCategories = ['it', 'fisi'], availableCategories = {};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const screens = {
  menu: $('#screen-menu'), lobby: $('#screen-lobby'), countdown: $('#screen-countdown'),
  quiz: $('#screen-quiz'), 'quiz-result': $('#screen-quiz-result'),
  typing: $('#screen-typing'), 'typing-result': $('#screen-typing-result'),
  estimation: $('#screen-estimation'), 'estimation-result': $('#screen-estimation-result'),
  emoji: $('#screen-emoji'), 'emoji-result': $('#screen-emoji-result'),
  gameover: $('#screen-gameover'),
};

function showScreen(name) { Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); }); if (screens[name]) screens[name].classList.add('active'); }
function toast(msg, type = 'info') { const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = msg; $('#toast-container').appendChild(el); setTimeout(() => el.remove(), 3000); }
function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function getPlayerName() { return ($('#player-name').value || '').trim() || 'Anon_' + Math.floor(Math.random() * 999); }

const avatars = ['\u{1F9D1}\u200D\u{1F4BB}','\u{1F47E}','\u{1F916}','\u{1F480}','\u{1F98A}','\u{1F431}','\u{1F3AE}','\u{1F579}\uFE0F','\u{1F9E0}','\u{1F525}','\u26A1','\u{1F3AF}','\u{1F680}','\u{1F48E}','\u{1F984}','\u{1F47B}'];
function initAvatarPicker() {
  const picker = $('#avatar-picker'); picker.innerHTML = '';
  avatars.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'avatar-option' + (i === 0 ? ' selected' : ''); div.textContent = a;
    div.onclick = () => { $$('.avatar-option').forEach(el => el.classList.remove('selected')); div.classList.add('selected'); selectedAvatar = a; };
    picker.appendChild(div);
  });
  selectedAvatar = avatars[0];
}

function renderPlayers(players) {
  const grid = $('#players-grid'); grid.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card' + (p.isHost ? ' host' : '') + (p.ready ? ' ready' : '');
    card.innerHTML = `<div class="avatar">${p.avatar}</div><div class="name">${escapeHtml(p.name)}</div>${p.isHost ? '<span class="badge badge-host">\u{1F451} Host</span>' : ''}${p.ready ? '<span class="badge badge-ready">\u2713 Ready</span>' : ''}`;
    grid.appendChild(card);
  });
}

function renderLeaderboard(container, leaderboard) {
  container.innerHTML = '';
  leaderboard.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row' + (p.id === myId ? ' me' : '');
    row.innerHTML = `<span class="lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span><span class="lb-avatar">${p.avatar}</span><span class="lb-name">${escapeHtml(p.name)}</span><span class="lb-score">${p.score.toLocaleString()}</span>`;
    container.appendChild(row);
  });
}

function startTimer(barEl, textEl, seconds) {
  clearInterval(timerInterval); timeLeft = seconds;
  textEl.textContent = seconds; textEl.classList.remove('danger');
  barEl.style.transition = 'none'; barEl.style.width = '100%'; void barEl.offsetHeight;
  barEl.style.transition = `width ${seconds}s linear`; barEl.style.width = '0%'; barEl.classList.remove('danger');
  timerInterval = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1); textEl.textContent = Math.ceil(timeLeft);
    if (timeLeft <= 5) { textEl.classList.add('danger'); barEl.classList.add('danger'); }
    if (timeLeft <= 0) clearInterval(timerInterval);
  }, 1000);
}

const modeNames = { quiz: '🧠 IT Quiz', typing: '⌨️ Speed Typing', estimation: '🎯 Schätz-Arena', emoji: '👾 Emoji Roulette' };

// ── Menu ─────────────────────────────────────────────────────────────────
$('#btn-create').onclick = () => { const n = getPlayerName(); $('#player-name').value = n; socket.emit('create-room', { playerName: n, avatar: selectedAvatar }); };
$('#btn-join').onclick = () => {
  const n = getPlayerName(), code = ($('#room-code').value || '').trim().toUpperCase();
  if (code.length < 3) return toast('Bitte g\u00FCltigen Code eingeben!', 'error');
  $('#player-name').value = n; socket.emit('join-room', { code, playerName: n, avatar: selectedAvatar });
};
$('#room-code').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
$('#room-code').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-join').click(); });
$('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-create').click(); });

// ── Lobby ────────────────────────────────────────────────────────────────
$('#btn-copy-code').onclick = () => navigator.clipboard.writeText(roomCode).then(() => toast('Code kopiert! \u{1F4CB}', 'success'));
$('#btn-ready').onclick = () => socket.emit('toggle-ready');
$('#btn-start').onclick = () => socket.emit('start-game');

// Mode selector
$$('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.mode-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
    gameMode = btn.dataset.mode;
    $$('.mode-settings').forEach(s => s.style.display = 'none');
    const el = $(`#settings-${gameMode}`); if (el) el.style.display = 'block';
    socket.emit('update-settings', { gameMode });
  };
});

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
    if (s === 'questionCount') {
      questionCount = Math.min(Math.max(questionCount + d, 5), 40);
      $('#setting-questions').textContent = questionCount;
      if ($('#setting-est-questions')) $('#setting-est-questions').textContent = questionCount;
    }
    else if (s === 'timePerQuestion') { timePerQuestion = Math.min(Math.max(timePerQuestion + d, 5), 30); $('#setting-time').textContent = timePerQuestion; }
    else if (s === 'typingRounds') { typingRounds = Math.min(Math.max(typingRounds + d, 3), 20); $('#setting-typing-rounds').textContent = typingRounds; }
    else if (s === 'emojiRounds') { emojiRounds = Math.min(Math.max(emojiRounds + d, 3), 15); $('#setting-emoji-rounds').textContent = emojiRounds; }
    socket.emit('update-settings', { questionCount, timePerQuestion, typingRounds, emojiRounds });
  };
});

$('#btn-play-again').onclick = () => socket.emit('play-again');
$('#btn-back-menu').onclick = () => location.reload();

// ── Socket Events ────────────────────────────────────────────────────────
socket.on('connect', () => { myId = socket.id; });
socket.on('error-msg', msg => toast(msg, 'error'));

socket.on('room-created', ({ code, players, categories: cats }) => {
  roomCode = code; isHost = true; availableCategories = cats || {};
  $('#lobby-code').textContent = code; $('#host-settings').style.display = 'block'; $('#guest-waiting').style.display = 'none';
  renderPlayers(players); renderCategorySelector(); showScreen('lobby');
  toast('Raum erstellt! Teile den Code.', 'success');
});

socket.on('room-joined', ({ code, players, categories: cats }) => {
  roomCode = code; isHost = false; availableCategories = cats || {};
  $('#lobby-code').textContent = code; $('#host-settings').style.display = 'none'; $('#guest-waiting').style.display = 'block';
  renderPlayers(players); showScreen('lobby');
});

socket.on('player-update', ({ players }) => renderPlayers(players));
socket.on('settings-updated', s => {
  if (s.gameMode) {
    gameMode = s.gameMode;
    $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === s.gameMode));
    $$('.mode-settings').forEach(el => el.style.display = 'none');
    const el = $(`#settings-${s.gameMode}`); if (el) el.style.display = 'block';
    if ($('#guest-mode-display')) $('#guest-mode-display').textContent = modeNames[s.gameMode] || '';
  }
  if (s.questionCount) { questionCount = s.questionCount; $('#setting-questions').textContent = s.questionCount; if ($('#setting-est-questions')) $('#setting-est-questions').textContent = s.questionCount; }
  if (s.timePerQuestion) { timePerQuestion = s.timePerQuestion; $('#setting-time').textContent = s.timePerQuestion; }
  if (s.quizCategories) { quizCategories = s.quizCategories; $$('#category-selector .cat-btn').forEach(b => b.classList.toggle('active', quizCategories.includes(b.dataset.cat))); }
  if (s.typingRounds) { typingRounds = s.typingRounds; $('#setting-typing-rounds').textContent = s.typingRounds; }
  if (s.emojiRounds) { emojiRounds = s.emojiRounds; $('#setting-emoji-rounds').textContent = s.emojiRounds; }
});
socket.on('host-changed', ({ hostName }) => toast(`${hostName} ist jetzt Host! \u{1F451}`, 'info'));
socket.on('player-left', ({ playerCount }) => toast(`Spieler hat verlassen (${playerCount} \u00FCbrig)`, 'info'));

// Countdown
socket.on('game-started', ({ gameMode: gm }) => {
  gameMode = gm; showScreen('countdown');
  if ($('#countdown-mode')) $('#countdown-mode').textContent = modeNames[gm] || gm;
  let count = 3; $('#countdown-num').textContent = count;
  const ci = setInterval(() => {
    count--;
    if (count <= 0) { clearInterval(ci); $('#countdown-num').textContent = '\u{1F680}'; }
    else { $('#countdown-num').textContent = count; $('#countdown-num').style.animation = 'none'; void $('#countdown-num').offsetHeight; $('#countdown-num').style.animation = 'count-pop .5s ease'; }
  }, 800);
});

// ── Quiz ─────────────────────────────────────────────────────────────────
socket.on('quiz-question', ({ index, total, question, answers, time }) => {
  hasAnswered = false; showScreen('quiz');
  $('#q-index').textContent = index + 1; $('#q-total').textContent = total;
  $('#question-text').textContent = question; $('#waiting-answer').style.display = 'none';
  startTimer($('#timer-bar'), $('#timer-text'), time);
  const startTime = Date.now(), grid = $('#answers-grid'); grid.innerHTML = '';
  ['A','B','C','D'].forEach((letter, i) => {
    const btn = document.createElement('button'); btn.className = 'answer-btn';
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
  $('#result-correct').textContent = `\u2713 Richtig: ${'ABCD'[correctIndex]}`;
  $('#result-roast').textContent = roast;
  const me = playerResults.find(p => p.id === myId);
  if (me) {
    const div = $('#result-personal');
    if (me.correct) { div.className = 'result-personal correct'; div.innerHTML = `\u2713 Richtig! ${me.score.toLocaleString()} Punkte ${me.streakMsg ? '<br>' + me.streakMsg : ''}`; }
    else if (!me.answered) { div.className = 'result-personal wrong'; div.innerHTML = `\u23F0 Zeit abgelaufen!<br><small>${me.roastMsg}</small>`; }
    else { div.className = 'result-personal wrong'; div.innerHTML = `\u2717 Falsch!<br><small>${me.roastMsg}</small>`; }
  }
  renderLeaderboard($('#mini-leaderboard'), leaderboard);
});

// ── Speed Typing ─────────────────────────────────────────────────────────
let typingStartTime = null, typingErrors = 0, typingTarget = '', typingDone = false;

socket.on('typing-round', ({ index, total, code, lang }) => {
  typingDone = false; typingErrors = 0; typingTarget = code; typingStartTime = null;
  showScreen('typing');
  $('#t-index').textContent = index + 1; $('#t-total').textContent = total;
  $('#typing-lang').textContent = lang;
  $('#typing-errors').textContent = 'Fehler: 0'; $('#typing-time').textContent = '0.0s';
  $('#typing-waiting').style.display = 'none';

  const targetEl = $('#typing-target'); targetEl.innerHTML = '';
  for (let i = 0; i < code.length; i++) {
    const span = document.createElement('span');
    span.className = 'char' + (i === 0 ? ' current' : '');
    span.textContent = code[i];
    targetEl.appendChild(span);
  }

  const input = $('#typing-input'); input.value = ''; input.disabled = false; input.focus();
  startTimer($('#typing-timer-bar'), $('#typing-timer-text'), 30);

  let typingTimerUpdate = null;
  input.oninput = () => {
    if (typingDone) return;
    if (!typingStartTime) {
      typingStartTime = Date.now();
      typingTimerUpdate = setInterval(() => {
        if (typingStartTime) $('#typing-time').textContent = ((Date.now() - typingStartTime) / 1000).toFixed(1) + 's';
      }, 100);
    }
    const val = input.value;
    const chars = targetEl.querySelectorAll('.char');
    let errors = 0;
    for (let i = 0; i < val.length && i < typingTarget.length; i++) {
      chars[i].classList.remove('current', 'correct', 'wrong');
      if (val[i] === typingTarget[i]) chars[i].classList.add('correct');
      else { chars[i].classList.add('wrong'); errors++; }
    }
    for (let i = val.length; i < typingTarget.length; i++) {
      chars[i].classList.remove('current', 'correct', 'wrong');
      if (i === val.length) chars[i].classList.add('current');
    }
    typingErrors = errors;
    $('#typing-errors').textContent = `Fehler: ${errors}`;

    if (val.length >= typingTarget.length) {
      typingDone = true; clearInterval(typingTimerUpdate); clearInterval(timerInterval);
      input.disabled = true;
      const time = (Date.now() - typingStartTime) / 1000;
      $('#typing-time').textContent = time.toFixed(1) + 's';
      socket.emit('typing-complete', { time: parseFloat(time.toFixed(2)), errors: typingErrors });
      $('#typing-waiting').style.display = 'flex';
    }
  };
});

socket.on('typing-result', ({ results, leaderboard }) => {
  showScreen('typing-result');
  const list = $('#typing-results-list'); list.innerHTML = '';
  results.forEach(r => {
    const row = document.createElement('div');
    row.className = 'typing-result-row' + (r.id === myId ? ' me' : '');
    row.innerHTML = `<span class="tr-avatar">${r.avatar}</span><span class="tr-name">${escapeHtml(r.name)}</span>${r.finished ? `<span class="tr-time">${r.time.toFixed(1)}s</span><span class="tr-errors">${r.errors > 0 ? r.errors + ' err' : '\u2713'}</span><span class="tr-points">+${r.points}</span>` : '<span class="tr-dnf">DNF</span>'}`;
    list.appendChild(row);
  });
  renderLeaderboard($('#typing-leaderboard'), leaderboard);
});

// ── Estimation ───────────────────────────────────────────────────────────
let estSubmitted = false;

socket.on('estimation-question', ({ index, total, question, unit, time }) => {
  estSubmitted = false; showScreen('estimation');
  $('#e-index').textContent = index + 1; $('#e-total').textContent = total;
  $('#est-question').textContent = question; $('#est-unit').textContent = unit;
  $('#est-input').value = ''; $('#est-input').disabled = false;
  $('#est-submit').disabled = false; $('#est-waiting').style.display = 'none';
  $('#est-input').focus();
  startTimer($('#est-timer-bar'), $('#est-timer-text'), time);
});

function submitEstimate() {
  if (estSubmitted) return;
  const val = parseFloat($('#est-input').value);
  if (isNaN(val)) return toast('Bitte eine Zahl eingeben!', 'error');
  estSubmitted = true; clearInterval(timerInterval);
  $('#est-input').disabled = true; $('#est-submit').disabled = true;
  socket.emit('submit-estimate', { value: val });
  $('#est-waiting').style.display = 'flex';
}
$('#est-submit').onclick = submitEstimate;
$('#est-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitEstimate(); });

socket.on('estimation-result', ({ answer, unit, fun, results, leaderboard }) => {
  showScreen('estimation-result');
  $('#est-answer-display').textContent = `Antwort: ${answer} ${unit}`;
  $('#est-fun').textContent = fun;
  const list = $('#est-results-list'); list.innerHTML = '';
  const sorted = [...results].filter(r => r.answered).sort((a, b) => a.diff - b.diff);
  const noAnswer = results.filter(r => !r.answered);
  [...sorted, ...noAnswer].forEach(r => {
    const row = document.createElement('div');
    row.className = 'est-result-row' + (r.id === myId ? ' me' : '');
    const pctOff = r.answered ? (r.diff / Math.max(Math.abs(answer), 0.001) * 100) : null;
    row.innerHTML = `<span class="er-avatar">${r.avatar}</span><span class="er-name">${escapeHtml(r.name)}</span>${r.answered ? `<span class="er-estimate">${r.estimate}</span><span class="er-diff ${pctOff < 25 ? 'close' : 'far'}">${pctOff < 1 ? 'SPOT ON!' : 'Diff: ' + (pctOff < 100 ? pctOff.toFixed(0) + '%' : r.diff.toFixed(1))}</span><span class="er-points">+${r.points}</span>` : '<span class="er-diff far">Keine Antwort</span>'}`;
    list.appendChild(row);
  });
  renderLeaderboard($('#est-leaderboard'), leaderboard);
});

// ── Emoji Roulette ───────────────────────────────────────────────────────
let emojiTapped = false, emojiTargetVal = '', emojiSequenceActive = false, emojiCurrentIsTarget = false, emojiShowTime = 0;

socket.on('emoji-round', ({ index, total, target, sequence, interval }) => {
  emojiTapped = false; emojiTargetVal = target; emojiSequenceActive = true; emojiCurrentIsTarget = false;
  showScreen('emoji');
  $('#em-index').textContent = index + 1; $('#em-total').textContent = total;
  $('#emoji-target').textContent = target;
  $('#emoji-waiting').style.display = 'none'; $('#emoji-tap-btn').disabled = false;

  const display = $('#emoji-current');
  let i = 0;
  const showNext = () => {
    if (i >= sequence.length) {
      emojiSequenceActive = false;
      if (!emojiTapped) { display.textContent = '\u274C'; $('#emoji-waiting').style.display = 'flex'; }
      return;
    }
    display.textContent = sequence[i];
    display.classList.remove('pop'); void display.offsetHeight; display.classList.add('pop');
    emojiCurrentIsTarget = sequence[i] === target;
    if (emojiCurrentIsTarget) emojiShowTime = Date.now();
    i++;
    setTimeout(showNext, interval);
  };
  showNext();
});

$('#emoji-tap-btn').onclick = () => {
  if (emojiTapped || !emojiSequenceActive) return;
  emojiTapped = true; $('#emoji-tap-btn').disabled = true;
  const area = $('.emoji-display-area');
  if (emojiCurrentIsTarget) {
    const reactionTime = Date.now() - emojiShowTime;
    area.classList.add('flash-correct'); setTimeout(() => area.classList.remove('flash-correct'), 500);
    socket.emit('emoji-tap', { time: reactionTime });
    toast(`${reactionTime}ms Reaktionszeit!`, 'success');
  } else {
    area.classList.add('flash-wrong'); setTimeout(() => area.classList.remove('flash-wrong'), 500);
    socket.emit('emoji-wrong-tap');
    toast('Falsches Emoji! -200 Punkte', 'error');
  }
  $('#emoji-waiting').style.display = 'flex';
};

socket.on('emoji-result', ({ results, leaderboard }) => {
  showScreen('emoji-result');
  const list = $('#emoji-results-list'); list.innerHTML = '';
  results.forEach(r => {
    const row = document.createElement('div');
    row.className = 'emoji-result-row' + (r.id === myId ? ' me' : '');
    row.innerHTML = `<span class="emr-avatar">${r.avatar}</span><span class="emr-name">${escapeHtml(r.name)}</span>${r.tapTime !== null ? `<span class="emr-time">${r.tapTime}ms</span>` : r.wrong ? '<span class="emr-wrong">FALSCH!</span>' : '<span class="emr-missed">Verpasst</span>'}<span class="emr-points ${r.points < 0 ? 'emr-wrong' : ''}">${r.points > 0 ? '+' : ''}${r.points}</span>`;
    list.appendChild(row);
  });
  renderLeaderboard($('#emoji-leaderboard'), leaderboard);
});

// ── Game Over ────────────────────────────────────────────────────────────
socket.on('game-over', ({ leaderboard, questionHistory, gameMode: gm }) => {
  showScreen('gameover');
  const podium = $('#podium'); podium.innerHTML = '';
  const order = [];
  if (leaderboard[1]) order.push({ ...leaderboard[1], place: 2 });
  if (leaderboard[0]) order.push({ ...leaderboard[0], place: 1 });
  if (leaderboard[2]) order.push({ ...leaderboard[2], place: 3 });
  const cls = { 1: 'first', 2: 'second', 3: 'third' }, emj = { 1: '\u{1F947}', 2: '\u{1F948}', 3: '\u{1F949}' };
  order.forEach(p => {
    const div = document.createElement('div'); div.className = 'podium-place';
    div.innerHTML = `<div class="podium-avatar">${p.avatar}</div><div class="podium-name">${escapeHtml(p.name)}</div><div class="podium-score">${p.score.toLocaleString()}</div><div class="podium-bar ${cls[p.place]}">${emj[p.place]}</div>`;
    podium.appendChild(div);
  });
  renderLeaderboard($('#final-leaderboard'), leaderboard);
  $('#btn-play-again').style.display = isHost ? 'block' : 'none';

  // Stats
  const statsSection = $('#stats-section'), statsContainer = $('#stats-container');
  if (questionHistory && questionHistory.length > 0 && gm === 'quiz') {
    statsSection.style.display = 'block'; statsContainer.style.display = 'none'; statsContainer.innerHTML = '';
    // Sort leaderboard for top 5 display
    const top5ids = leaderboard.slice(0, 5).map(p => p.id);
    questionHistory.forEach((entry, i) => {
      const total = Object.keys(entry.players).length;
      const correct = Object.values(entry.players).filter(p => p.correct).length;
      // Only show top 5 players in the detail view
      const top5players = Object.entries(entry.players)
        .filter(([id]) => top5ids.includes(id))
        .map(([, p]) => p);
      const block = document.createElement('div'); block.className = 'stats-question';
      block.innerHTML = `<div class="stats-q-header" data-idx="${i}"><span class="stats-q-num">#${i+1}</span><span class="stats-q-text">${escapeHtml(entry.question)}</span><span class="stats-q-correct">${correct}/${total}</span></div>
        <div class="stats-q-body" id="stats-body-${i}"><div class="stats-q-answer">✓ ${escapeHtml(entry.correctAnswer)}</div>
        ${top5players.map(p => `<div class="stats-player-row"><span class="sp-name">${escapeHtml(p.name)}</span><span class="sp-result ${p.correct?'correct':p.answered?'wrong':'missed'}">${p.correct?'✓':p.answered?'✗':'—'}</span></div>`).join('')}</div>`;
      statsContainer.appendChild(block);
    });
    statsContainer.addEventListener('click', e => { const h = e.target.closest('.stats-q-header'); if (h) { const b = $(`#stats-body-${h.dataset.idx}`); if (b) b.classList.toggle('open'); } });
    $('#btn-toggle-stats').onclick = () => { const v = statsContainer.style.display !== 'none'; statsContainer.style.display = v ? 'none' : 'block'; $('#btn-toggle-stats').textContent = v ? '\u{1F4CA} Statistik anzeigen' : '\u{1F4CA} Statistik ausblenden'; };
  } else { statsSection.style.display = 'none'; }
});

socket.on('back-to-lobby', ({ players }) => { renderPlayers(players); showScreen('lobby'); toast('Zur\u00FCck in der Lobby!', 'info'); });

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (screens.quiz && screens.quiz.classList.contains('active') && !hasAnswered) {
    const m = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const idx = m[e.key.toLowerCase()]; if (idx !== undefined) { const btns = $$('.answer-btn'); if (btns[idx]) btns[idx].click(); }
  }
  if (screens.emoji && screens.emoji.classList.contains('active') && e.key === ' ') {
    e.preventDefault(); $('#emoji-tap-btn').click();
  }
});

initAvatarPicker();
$('#player-name').focus();
