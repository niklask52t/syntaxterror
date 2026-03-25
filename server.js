const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const { quizQuestions, categories } = require('./questions');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/categories', (req, res) => res.json(categories));

// Convert flashcard decks into multiple-choice quiz questions
function convertFlashcardsToQuiz(cards) {
  const quizCards = [];
  // Use answers from other cards as wrong options (truncated to max 80 chars)
  const allAnswers = cards.map(c => {
    const a = c.a.split('\n')[0].split('.')[0].trim();
    return a.length > 80 ? a.substring(0, 77) + '...' : a;
  }).filter(a => a.length > 5);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const correctFull = card.a.split('\n')[0].split('.')[0].trim();
    const correct = correctFull.length > 80 ? correctFull.substring(0, 77) + '...' : correctFull;
    if (correct.length < 5) continue;

    // Pick 3 random wrong answers from other cards
    const wrongs = [];
    const indices = [];
    let attempts = 0;
    while (wrongs.length < 3 && attempts < 50) {
      const idx = Math.floor(Math.random() * allAnswers.length);
      if (idx !== i && !indices.includes(idx) && allAnswers[idx] !== correct) {
        wrongs.push(allAnswers[idx]);
        indices.push(idx);
      }
      attempts++;
    }
    if (wrongs.length < 3) continue;

    // Shuffle answers, track correct index
    const answers = [...wrongs, correct];
    // Fisher-Yates
    for (let j = answers.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [answers[j], answers[k]] = [answers[k], answers[j]];
    }

    quizCards.push({
      q: card.q,
      answers,
      correct: answers.indexOf(correct),
      roast: 'Das steht in den Lernkarten. Hast du die überhaupt gelesen? 📚',
    });
  }
  return quizCards;
}

// Load and convert flashcard decks
for (const [file, catKey, catName, catIcon] of [
  ['flashcards-fisi.json', 'fisi_lk', 'FISI Lernkarten', '📋'],
  ['flashcards-wiso.json', 'wiso_lk', 'WiSo Lernkarten', '💼'],
]) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', file), 'utf-8'));
    const converted = convertFlashcardsToQuiz(raw);
    quizQuestions[catKey] = converted;
    categories[catKey] = { name: catName, icon: catIcon };
    console.log(`Loaded ${converted.length} ${catName} questions`);
  } catch (e) { console.error(`Failed to load ${file}:`, e.message); }
}

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms.has(code) ? generateRoomCode() : code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Typing Snippets ─────────────────────────────────────────────────────
const typingSnippets = [
  { code: 'console.log("Hello World");', lang: 'JavaScript', difficulty: 1 },
  { code: 'for (let i = 0; i < 10; i++) {}', lang: 'JavaScript', difficulty: 1 },
  { code: 'const sum = (a, b) => a + b;', lang: 'JavaScript', difficulty: 1 },
  { code: 'if (err != nil) { return err }', lang: 'Go', difficulty: 1 },
  { code: 'SELECT * FROM users WHERE id = 1;', lang: 'SQL', difficulty: 1 },
  { code: 'git commit -m "fix: resolve bug"', lang: 'Git', difficulty: 1 },
  { code: 'docker run -d -p 8080:80 nginx', lang: 'Docker', difficulty: 2 },
  { code: 'npm install --save-dev typescript', lang: 'Terminal', difficulty: 1 },
  { code: 'const [state, setState] = useState(0);', lang: 'React', difficulty: 2 },
  { code: 'app.get("/api", (req, res) => {});', lang: 'Express', difficulty: 2 },
  { code: 'chmod 755 deploy.sh && ./deploy.sh', lang: 'Bash', difficulty: 2 },
  { code: 'CREATE TABLE users (id SERIAL PRIMARY KEY);', lang: 'SQL', difficulty: 2 },
  { code: 'ssh -i key.pem user@192.168.1.100', lang: 'SSH', difficulty: 2 },
  { code: 'const data = await fetch(url).then(r => r.json());', lang: 'JavaScript', difficulty: 3 },
  { code: 'export default function App() { return <div />; }', lang: 'React', difficulty: 3 },
  { code: 'kubectl get pods -n production --watch', lang: 'Kubernetes', difficulty: 2 },
  { code: 'interface User { id: number; name: string; }', lang: 'TypeScript', difficulty: 2 },
  { code: 'python -m venv .venv && source .venv/bin/activate', lang: 'Python', difficulty: 3 },
  { code: 'ALTER TABLE orders ADD COLUMN total DECIMAL(10,2);', lang: 'SQL', difficulty: 3 },
  { code: 'git rebase -i HEAD~3 && git push --force-with-lease', lang: 'Git', difficulty: 3 },
  { code: 'sudo systemctl restart nginx', lang: 'Linux', difficulty: 1 },
  { code: 'Object.keys(obj).forEach(k => console.log(k));', lang: 'JavaScript', difficulty: 3 },
  { code: 'FROM node:22-alpine AS builder', lang: 'Dockerfile', difficulty: 2 },
  { code: 'grep -rn "TODO" --include="*.js" .', lang: 'Bash', difficulty: 2 },
  { code: 'ip addr show eth0 | grep inet', lang: 'Linux', difficulty: 2 },
];

// ── Estimation Questions ────────────────────────────────────────────────
const estimationQuestions = [
  { q: "Wie viele npm-Packages gibt es? (in Millionen)", answer: 2.5, unit: "Mio", tolerance: 1.0, fun: "Und 90% davon sind left-pad Varianten." },
  { q: "Wie viele Zeilen Code hat der Linux Kernel?", answer: 30000000, unit: "Zeilen", tolerance: 10000000, fun: "Und Linus Torvalds hat jede einzelne pers\u00F6nlich beleidigt." },
  { q: "Wie viele Google-Suchen gibt es pro Tag? (in Milliarden)", answer: 8.5, unit: "Mrd", tolerance: 3, fun: "Und 50% davon sind 'how to center a div'." },
  { q: "Wie alt war Mark Zuckerberg als er Facebook gr\u00FCndete?", answer: 19, unit: "Jahre", tolerance: 2, fun: "Mit 19 hast du vermutlich noch Nudeln mit Ketchup gegessen." },
  { q: "Wie viele Zeichen hat ein Tweet maximal?", answer: 280, unit: "Zeichen", tolerance: 50, fun: "Elon hat's verdoppelt weil er sich nicht kurz fassen kann." },
  { q: "Wie viel Strom verbraucht Bitcoin-Mining pro Jahr? (in TWh)", answer: 150, unit: "TWh", tolerance: 50, fun: "Mehr als manche L\u00E4nder. F\u00FCr digitales Monopoly-Geld." },
  { q: "Wie viele Websites gibt es weltweit? (in Milliarden)", answer: 1.9, unit: "Mrd", tolerance: 0.7, fun: "99% davon wurden seit 2015 nicht aktualisiert." },
  { q: "Wie viele E-Mails werden t\u00E4glich versendet? (in Milliarden)", answer: 350, unit: "Mrd", tolerance: 100, fun: "Davon sind 85% Spam. Wie dein Posteingang." },
  { q: "Wie viele Entwickler gibt es weltweit? (in Millionen)", answer: 28, unit: "Mio", tolerance: 8, fun: "Und alle kopieren von Stack Overflow." },
  { q: "Wie viele GitHub-Repos gibt es? (in Millionen)", answer: 400, unit: "Mio", tolerance: 150, fun: "90% sind 'my-first-react-app' die nie fertig wurden." },
  { q: "In welchem Jahr wurde das erste Emoji erstellt?", answer: 1999, unit: "", tolerance: 3, fun: "Japan war wie immer ahead of the game \u{1F1EF}\u{1F1F5}" },
  { q: "Wie viele Transistoren hat ein Apple M3 Chip? (in Milliarden)", answer: 25, unit: "Mrd", tolerance: 10, fun: "25 Milliarden Transistoren und Safari frisst trotzdem den RAM." },
  { q: "Wie gro\u00DF war die erste Festplatte von IBM? (in Tonnen)", answer: 1, unit: "t", tolerance: 0.5, fun: "1956: 5MB, 1 Tonne. Heute: 1TB auf dem Daumennagel." },
  { q: "Wie viele Zeilen Code hat Windows 11? (in Millionen)", answer: 50, unit: "Mio", tolerance: 20, fun: "Und trotzdem schafft es bei jedem Update was kaputt zu machen." },
  { q: "Wie viel kostet ein 30-Sek Super Bowl Werbespot? (in Mio $)", answer: 7, unit: "Mio $", tolerance: 3, fun: "233.000$ pro Sekunde. Pro. Sekunde." },
  { q: "Wie lang war das erste Computerprogramm? (in Zeilen)", answer: 25, unit: "Zeilen", tolerance: 15, fun: "Ada Lovelace, 1843. Weniger Code als dein Hello World." },
  { q: "Wie viel verdient ein Senior Dev in SF? (k$/Jahr)", answer: 200, unit: "k$", tolerance: 60, fun: "Klingt viel bis du die Miete siehst. \u{1F4B8}" },
  { q: "Wie viele Daten produziert die Menschheit t\u00E4glich? (in Exabyte)", answer: 2.5, unit: "EB", tolerance: 2, fun: "90% davon sind Katzenvideos und TikToks." },
];

// ── Emoji Sets ──────────────────────────────────────────────────────────
const emojiSets = [
  { target: '\u{1F480}', distractors: ['\u{1F47B}', '\u{1F383}', '\u{1F608}', '\u{1F9B4}', '\u2620\uFE0F', '\u{1F47D}', '\u{1F9DF}', '\u{1F631}'] },
  { target: '\u{1F41B}', distractors: ['\u{1F98B}', '\u{1F41D}', '\u{1F41E}', '\u{1FAB2}', '\u{1F997}', '\u{1F41C}', '\u{1FAB3}', '\u{1F99F}'] },
  { target: '\u{1F525}', distractors: ['\u{1F4A5}', '\u26A1', '\u2728', '\u{1F31F}', '\u{1F4AB}', '\u2600\uFE0F', '\u{1F308}', '\u{1F386}'] },
  { target: '\u{1F680}', distractors: ['\u2708\uFE0F', '\u{1F6F8}', '\u{1F6E9}\uFE0F', '\u{1F681}', '\u{1FA82}', '\u{1F6F0}\uFE0F', '\u{1F30D}', '\u{1F319}'] },
  { target: '\u{1F4BE}', distractors: ['\u{1F4C0}', '\u{1F4BF}', '\u{1F4FC}', '\u{1F5A5}\uFE0F', '\u2328\uFE0F', '\u{1F5B1}\uFE0F', '\u{1F5A8}\uFE0F', '\u{1F4F1}'] },
  { target: '\u{1F511}', distractors: ['\u{1F512}', '\u{1F513}', '\u{1F5DD}\uFE0F', '\u{1F510}', '\u{1F6E1}\uFE0F', '\u2694\uFE0F', '\u{1F5E1}\uFE0F', '\u{1F3F9}'] },
];

// ── Roasts ──────────────────────────────────────────────────────────────
const wrongRoasts = [
  "Oof. Hast du \u00FCberhaupt Internet? \u{1F480}", "Das war so falsch, mein Compiler weint.",
  "Selbst ein Praktikant h\u00E4tte das gewusst.", "F im Chat f\u00FCr diesen Spieler.",
  "Bist du sicher, dass du in der IT arbeitest? \u{1F914}", "ChatGPT h\u00E4tte das besser gekonnt.",
  "Error 404: Wissen not found.", "Du bist der Grund warum wir Tests schreiben.",
  "Stack Overflow kann dir auch nicht mehr helfen.",
  "Dein Wissen hat weniger Uptime als ein Windows-Server.",
  "Hat da jemand die Ausbildung geschw\u00E4nzt? \u{1F4DD}", "Bruder, das steht W\u00D6RTLICH im Lehrbuch.",
];

const streakMessages = [
  "", "", "\u{1F525} Doppel-Kill!", "\u{1F525}\u{1F525} Triple-Kill! L\u00E4uft bei dir!",
  "\u{1F525}\u{1F525}\u{1F525} ULTRA KILL! Bist du ein Bot?!",
  "\u{1F525}\u{1F525}\u{1F525}\u{1F525} GODLIKE!",
  "\u{1F480}\u{1F480}\u{1F480}\u{1F480}\u{1F480} LEGEND\u00C4R!",
];

io.on('connection', (socket) => {
  socket.on('create-room', ({ playerName, avatar }) => {
    const code = generateRoomCode();
    const room = {
      code, host: socket.id, players: new Map(), state: 'lobby',
      gameMode: 'quiz',
      // Quiz settings
      quizCategories: ['it', 'fisi'], currentQuestion: 0, questions: [],
      questionCount: 15, timePerQuestion: 15,
      answers: new Map(), questionTimer: null, questionHistory: [],
      // Typing settings
      typingRound: 0, typingRounds: 10, typingResults: new Map(),
      // Estimation settings
      estimates: new Map(),
      // Emoji settings
      emojiRound: 0, emojiRounds: 8, emojiTaps: new Map(),
    };
    room.players.set(socket.id, { name: playerName, avatar, score: 0, streak: 0, ready: false });
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-created', { code, players: serializePlayers(room), categories });
  });

  socket.on('join-room', ({ code, playerName, avatar }) => {
    const room = rooms.get(code);
    if (!room) return socket.emit('error-msg', 'Raum existiert nicht! \u{1F6AB}');
    if (room.state !== 'lobby') return socket.emit('error-msg', 'Spiel l\u00E4uft bereits! \u23F3');
    if (room.players.size >= 20) return socket.emit('error-msg', 'Raum ist voll! \u{1F6AA}');
    for (const [, p] of room.players) {
      if (p.name.toLowerCase() === playerName.toLowerCase()) return socket.emit('error-msg', 'Name vergeben! \u{1F645}');
    }
    room.players.set(socket.id, { name: playerName, avatar, score: 0, streak: 0, ready: false });
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-joined', { code, players: serializePlayers(room), categories });
    io.to(code).emit('player-update', { players: serializePlayers(room) });
  });

  socket.on('toggle-ready', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    const p = room.players.get(socket.id);
    if (p) { p.ready = !p.ready; io.to(room.code).emit('player-update', { players: serializePlayers(room) }); }
  });

  socket.on('update-settings', (s) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.host !== socket.id) return;
    if (s.gameMode) room.gameMode = s.gameMode;
    if (s.questionCount) room.questionCount = Math.min(Math.max(s.questionCount, 5), 40);
    if (s.timePerQuestion) room.timePerQuestion = Math.min(Math.max(s.timePerQuestion, 5), 30);
    if (s.quizCategories && Array.isArray(s.quizCategories) && s.quizCategories.length > 0) {
      room.quizCategories = s.quizCategories.filter(c => quizQuestions[c]);
      if (room.quizCategories.length === 0) room.quizCategories = ['it'];
    }
    if (s.typingRounds) room.typingRounds = Math.min(Math.max(s.typingRounds, 3), 20);
    if (s.emojiRounds) room.emojiRounds = Math.min(Math.max(s.emojiRounds, 3), 15);
    io.to(room.code).emit('settings-updated', {
      gameMode: room.gameMode,
      questionCount: room.questionCount, timePerQuestion: room.timePerQuestion,
      quizCategories: room.quizCategories,
      typingRounds: room.typingRounds, emojiRounds: room.emojiRounds,
    });
  });

  socket.on('start-game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.host !== socket.id) return;
    if (room.players.size < 2) return socket.emit('error-msg', 'Mindestens 2 Spieler! \u{1F465}');
    room.state = 'playing';
    for (const [, p] of room.players) { p.score = 0; p.streak = 0; }
    io.to(room.code).emit('game-started', { gameMode: room.gameMode });
    switch (room.gameMode) {
      case 'quiz': startQuiz(room); break;
      case 'typing': startTyping(room); break;
      case 'estimation': startEstimation(room); break;
      case 'emoji': startEmoji(room); break;
    }
  });

  // Quiz answer
  socket.on('submit-answer', ({ answerIndex, timeLeft }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'playing' || room.gameMode !== 'quiz') return;
    if (room.answers.has(socket.id)) return;
    const q = room.questions[room.currentQuestion];
    const correct = answerIndex === q.correct;
    const p = room.players.get(socket.id);
    if (!p) return;
    if (correct) {
      p.score += 500 + Math.round(timeLeft * 50) + Math.min(p.streak, 5) * 100;
      p.streak++;
    } else { p.streak = 0; }
    room.answers.set(socket.id, { answerIndex, correct, timeLeft });
    socket.emit('answer-received');
    if (room.answers.size === room.players.size) {
      clearTimeout(room.questionTimer);
      setTimeout(() => revealQuiz(room), 500);
    }
  });

  // Typing complete
  socket.on('typing-complete', ({ time, errors }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'typing' || room.typingResults.has(socket.id)) return;
    const p = room.players.get(socket.id);
    if (!p) return;
    const points = Math.max(0, Math.round(1000 - time * 50) - errors * 100);
    p.score += points;
    room.typingResults.set(socket.id, { time, errors, points });
    socket.emit('typing-received');
    if (room.typingResults.size === room.players.size) {
      clearTimeout(room.questionTimer);
      setTimeout(() => revealTyping(room), 500);
    }
  });

  // Estimation submit
  socket.on('submit-estimate', ({ value }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'estimation' || room.estimates.has(socket.id)) return;
    room.estimates.set(socket.id, value);
    socket.emit('estimate-received');
    if (room.estimates.size === room.players.size) {
      clearTimeout(room.questionTimer);
      setTimeout(() => revealEstimation(room), 500);
    }
  });

  // Emoji tap
  socket.on('emoji-tap', ({ time }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'emoji' || room.emojiTaps.has(socket.id)) return;
    room.emojiTaps.set(socket.id, time);
    socket.emit('emoji-tap-received');
  });
  socket.on('emoji-wrong-tap', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'emoji') return;
    if (!room.emojiTaps.has(socket.id)) room.emojiTaps.set(socket.id, 99999);
  });

  socket.on('play-again', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.host !== socket.id) return;
    room.state = 'lobby';
    for (const [, p] of room.players) { p.ready = false; p.score = 0; p.streak = 0; }
    io.to(room.code).emit('back-to-lobby', { players: serializePlayers(room) });
  });

  socket.on('disconnect', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    room.players.delete(socket.id);
    room.answers.delete(socket.id);
    room.typingResults.delete(socket.id);
    room.estimates.delete(socket.id);
    room.emojiTaps.delete(socket.id);
    if (room.players.size === 0) { clearTimeout(room.questionTimer); rooms.delete(room.code); return; }
    if (room.host === socket.id) {
      room.host = room.players.keys().next().value;
      io.to(room.code).emit('host-changed', { hostName: room.players.get(room.host).name });
    }
    io.to(room.code).emit('player-update', { players: serializePlayers(room) });
    io.to(room.code).emit('player-left', { playerCount: room.players.size });
  });
});

// ── Quiz Logic ──────────────────────────────────────────────────────────
function startQuiz(room) {
  room.currentQuestion = 0;
  let pool = [];
  for (const cat of room.quizCategories) { if (quizQuestions[cat]) pool.push(...quizQuestions[cat]); }
  if (pool.length === 0) pool = quizQuestions.it;
  room.questions = shuffle(pool).slice(0, room.questionCount);
  room.questionHistory = [];
  setTimeout(() => sendQuiz(room), 2500);
}

function sendQuiz(room) {
  if (room.currentQuestion >= room.questions.length) return endGame(room);
  const q = room.questions[room.currentQuestion];
  room.answers = new Map();
  io.to(room.code).emit('quiz-question', {
    index: room.currentQuestion, total: room.questions.length,
    question: q.q, answers: q.answers, time: room.timePerQuestion,
  });
  room.questionTimer = setTimeout(() => revealQuiz(room), (room.timePerQuestion + 1) * 1000);
}

function revealQuiz(room) {
  const q = room.questions[room.currentQuestion];
  const results = [];
  for (const [id, p] of room.players) {
    const a = room.answers.get(id);
    const correct = a ? a.correct : false;
    results.push({
      id, name: p.name, avatar: p.avatar, correct, score: p.score, streak: p.streak,
      streakMsg: correct && p.streak >= 2 ? (streakMessages[Math.min(p.streak, 6)] || streakMessages[6]) : '',
      roastMsg: !correct ? wrongRoasts[Math.floor(Math.random() * wrongRoasts.length)] : '',
      answered: !!a,
    });
  }
  const entry = { question: q.q, correctIndex: q.correct, correctAnswer: q.answers[q.correct], players: {} };
  for (const [id, p] of room.players) {
    const a = room.answers.get(id);
    entry.players[id] = { name: p.name, correct: a ? a.correct : false, answered: !!a };
  }
  room.questionHistory.push(entry);
  io.to(room.code).emit('quiz-result', { correctIndex: q.correct, roast: q.roast, playerResults: results, leaderboard: getLeaderboard(room) });
  room.currentQuestion++;
  setTimeout(() => sendQuiz(room), 5000);
}

// ── Typing Logic ────────────────────────────────────────────────────────
function startTyping(room) {
  room.typingRound = 0;
  room.questions = shuffle(typingSnippets).slice(0, room.typingRounds);
  room.questionHistory = [];
  setTimeout(() => sendTyping(room), 2500);
}

function sendTyping(room) {
  if (room.typingRound >= room.questions.length) return endGame(room);
  const s = room.questions[room.typingRound];
  room.typingResults = new Map();
  io.to(room.code).emit('typing-round', { index: room.typingRound, total: room.questions.length, code: s.code, lang: s.lang, difficulty: s.difficulty });
  room.questionTimer = setTimeout(() => revealTyping(room), 31000);
}

function revealTyping(room) {
  const results = [];
  for (const [id, p] of room.players) {
    const r = room.typingResults.get(id);
    results.push({ id, name: p.name, avatar: p.avatar, score: p.score, time: r?.time, errors: r?.errors, points: r?.points || 0, finished: !!r });
  }
  results.sort((a, b) => { if (a.finished !== b.finished) return a.finished ? -1 : 1; return (a.time || 999) - (b.time || 999); });
  io.to(room.code).emit('typing-result', { results, leaderboard: getLeaderboard(room) });
  room.typingRound++;
  setTimeout(() => sendTyping(room), 4000);
}

// ── Estimation Logic ────────────────────────────────────────────────────
function startEstimation(room) {
  room.currentQuestion = 0;
  room.questions = shuffle(estimationQuestions).slice(0, room.questionCount);
  room.questionHistory = [];
  setTimeout(() => sendEstimation(room), 2500);
}

function sendEstimation(room) {
  if (room.currentQuestion >= room.questions.length) return endGame(room);
  const q = room.questions[room.currentQuestion];
  room.estimates = new Map();
  io.to(room.code).emit('estimation-question', { index: room.currentQuestion, total: room.questions.length, question: q.q, unit: q.unit, time: 20 });
  room.questionTimer = setTimeout(() => revealEstimation(room), 21000);
}

function revealEstimation(room) {
  const q = room.questions[room.currentQuestion];
  const results = [];
  for (const [id, p] of room.players) {
    const est = room.estimates.get(id);
    let points = 0, diff = null;
    if (est !== undefined) {
      diff = Math.abs(est - q.answer);
      const pct = diff / Math.max(Math.abs(q.answer), 0.001);
      if (pct <= 0.05) points = 1000;
      else if (pct <= 0.1) points = 800;
      else if (pct <= 0.25) points = 600;
      else if (pct <= 0.5) points = 400;
      else if (diff <= q.tolerance) points = 200;
      p.score += points;
    }
    results.push({ id, name: p.name, avatar: p.avatar, score: p.score, estimate: est, diff, points, answered: est !== undefined });
  }
  io.to(room.code).emit('estimation-result', { answer: q.answer, unit: q.unit, fun: q.fun, results, leaderboard: getLeaderboard(room) });
  room.currentQuestion++;
  setTimeout(() => sendEstimation(room), 5000);
}

// ── Emoji Logic ─────────────────────────────────────────────────────────
function startEmoji(room) {
  room.emojiRound = 0;
  const sets = shuffle(emojiSets);
  room.questions = [];
  for (let i = 0; i < room.emojiRounds; i++) room.questions.push(sets[i % sets.length]);
  room.questionHistory = [];
  setTimeout(() => sendEmoji(room), 2500);
}

function sendEmoji(room) {
  if (room.emojiRound >= room.questions.length) return endGame(room);
  const es = room.questions[room.emojiRound];
  room.emojiTaps = new Map();
  const seqLen = 15 + Math.floor(Math.random() * 11);
  const targets = new Set();
  const tc = 1 + Math.floor(Math.random() * 2);
  while (targets.size < tc) targets.add(3 + Math.floor(Math.random() * (seqLen - 3)));
  const seq = [];
  for (let i = 0; i < seqLen; i++) {
    seq.push(targets.has(i) ? es.target : es.distractors[Math.floor(Math.random() * es.distractors.length)]);
  }
  io.to(room.code).emit('emoji-round', { index: room.emojiRound, total: room.questions.length, target: es.target, sequence: seq, interval: 600 });
  room.questionTimer = setTimeout(() => revealEmoji(room), seqLen * 600 + 2000);
}

function revealEmoji(room) {
  const results = [];
  for (const [id, p] of room.players) {
    const t = room.emojiTaps.get(id);
    let points = 0;
    if (t !== undefined && t < 99999) { points = Math.max(0, Math.round(500 - t * 2)); p.score += points; }
    else if (t === 99999) { p.score = Math.max(0, p.score - 200); points = -200; }
    results.push({ id, name: p.name, avatar: p.avatar, score: p.score, tapTime: t !== undefined && t < 99999 ? t : null, wrong: t === 99999, points });
  }
  results.sort((a, b) => (b.points || 0) - (a.points || 0));
  io.to(room.code).emit('emoji-result', { results, leaderboard: getLeaderboard(room) });
  room.emojiRound++;
  setTimeout(() => sendEmoji(room), 3500);
}

// ── Common ──────────────────────────────────────────────────────────────
function endGame(room) {
  room.state = 'results';
  io.to(room.code).emit('game-over', {
    leaderboard: getLeaderboard(room),
    questionHistory: room.questionHistory,
    gameMode: room.gameMode,
  });
}

function getLeaderboard(room) {
  return [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, score: p.score })).sort((a, b) => b.score - a.score);
}

function serializePlayers(room) {
  return [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, ready: p.ready, isHost: id === room.host }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`\u{1F3AE} SYNTAXTERROR running on http://localhost:${PORT}`));
