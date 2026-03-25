const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { quizQuestions, categories } = require('./questions');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Serve categories for the client
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

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
  { code: 'FROM node:18-alpine AS builder', lang: 'Dockerfile', difficulty: 2 },
  { code: 'grep -rn "TODO" --include="*.js" .', lang: 'Bash', difficulty: 2 },
  { code: 'ip addr show eth0 | grep inet', lang: 'Linux', difficulty: 2 },
];

// ── Estimation Questions ────────────────────────────────────────────────
const estimationQuestions = [
  { q: "Wie viele npm-Packages gibt es? (in Millionen)", answer: 2.5, unit: "Mio", tolerance: 1.0, fun: "Und 90% davon sind left-pad Varianten." },
  { q: "Wie viele Zeilen Code hat der Linux Kernel?", answer: 30000000, unit: "Zeilen", tolerance: 10000000, fun: "Und Linus Torvalds hat jede einzelne persönlich beleidigt." },
  { q: "Wie viele Google-Suchen gibt es pro Tag? (in Milliarden)", answer: 8.5, unit: "Mrd", tolerance: 3, fun: "Und 50% davon sind 'how to center a div'." },
  { q: "Wie alt war Mark Zuckerberg als er Facebook gründete?", answer: 19, unit: "Jahre", tolerance: 2, fun: "Mit 19 hast du vermutlich noch Nudeln mit Ketchup gegessen." },
  { q: "Wie viele Zeichen hat ein Tweet maximal?", answer: 280, unit: "Zeichen", tolerance: 50, fun: "Elon hat's verdoppelt weil er sich nicht kurz fassen kann." },
  { q: "Wie viel Strom verbraucht Bitcoin-Mining pro Jahr? (in TWh)", answer: 150, unit: "TWh", tolerance: 50, fun: "Mehr als manche Länder. Für digitales Monopoly-Geld." },
  { q: "Wie viele Websites gibt es weltweit? (in Milliarden)", answer: 1.9, unit: "Mrd", tolerance: 0.7, fun: "99% davon wurden seit 2015 nicht aktualisiert." },
  { q: "Wie viele E-Mails werden täglich versendet? (in Milliarden)", answer: 350, unit: "Mrd", tolerance: 100, fun: "Davon sind 85% Spam. Wie dein Posteingang." },
  { q: "Wie viele Entwickler gibt es weltweit? (in Millionen)", answer: 28, unit: "Mio", tolerance: 8, fun: "Und alle kopieren von Stack Overflow." },
  { q: "Wie viele GitHub-Repos gibt es? (in Millionen)", answer: 400, unit: "Mio", tolerance: 150, fun: "90% sind 'my-first-react-app' die nie fertig wurden." },
  { q: "In welchem Jahr wurde das erste Emoji erstellt?", answer: 1999, unit: "", tolerance: 3, fun: "Japan war wie immer ahead of the game 🇯🇵" },
  { q: "Wie viele Transistoren hat ein Apple M3 Chip? (in Milliarden)", answer: 25, unit: "Mrd", tolerance: 10, fun: "25 Milliarden Transistoren und Safari frisst trotzdem den RAM." },
  { q: "Wie groß war die erste Festplatte von IBM? (in Tonnen)", answer: 1, unit: "t", tolerance: 0.5, fun: "1956: 5MB, 1 Tonne. Heute: 1TB auf dem Daumennagel." },
  { q: "Wie viele Zeilen Code hat Windows 11? (in Millionen)", answer: 50, unit: "Mio", tolerance: 20, fun: "Und trotzdem schafft es bei jedem Update was kaputt zu machen." },
  { q: "Wie viel kostet ein 30-Sek Super Bowl Werbespot? (in Mio $)", answer: 7, unit: "Mio $", tolerance: 3, fun: "233.000$ pro Sekunde. Pro. Sekunde." },
  { q: "Wie lang war das erste Computerprogramm? (in Zeilen)", answer: 25, unit: "Zeilen", tolerance: 15, fun: "Ada Lovelace, 1843. Weniger Code als dein Hello World." },
  { q: "Wie viel verdient ein Senior Dev in SF? (k$/Jahr)", answer: 200, unit: "k$", tolerance: 60, fun: "Klingt viel bis du die Miete siehst. 💸" },
  { q: "Wie viele Daten produziert die Menschheit täglich? (in Exabyte)", answer: 2.5, unit: "EB", tolerance: 2, fun: "90% davon sind Katzenvideos und TikToks." },
];

// ── Emoji Sets ──────────────────────────────────────────────────────────
const emojiSets = [
  { target: '💀', distractors: ['👻', '🎃', '😈', '🦴', '☠️', '👽', '🧟', '😱'] },
  { target: '🐛', distractors: ['🦋', '🐝', '🐞', '🪲', '🦗', '🐜', '🪳', '🦟'] },
  { target: '🔥', distractors: ['💥', '⚡', '✨', '🌟', '💫', '☀️', '🌈', '🎆'] },
  { target: '🚀', distractors: ['✈️', '🛸', '🛩️', '🚁', '🪂', '🛰️', '🌍', '🌙'] },
  { target: '💾', distractors: ['📀', '💿', '📼', '🖥️', '⌨️', '🖱️', '🖨️', '📱'] },
  { target: '🔑', distractors: ['🔒', '🔓', '🗝️', '🔐', '🛡️', '⚔️', '🗡️', '🏹'] },
];

// ── Roasts ───────────────────────────────────────────────────────────────
const wrongRoasts = [
  "Oof. Hast du überhaupt Internet? 💀",
  "Das war so falsch, mein Compiler weint.",
  "Selbst ein Praktikant hätte das gewusst.",
  "F im Chat für diesen Spieler.",
  "Bist du sicher, dass du in der IT arbeitest? 🤔",
  "ChatGPT hätte das besser gekonnt. Autsch.",
  "Deine Eltern sind enttäuscht. Dein Code auch.",
  "Error 404: Wissen not found.",
  "Du bist der Grund warum wir Tests schreiben.",
  "Stack Overflow kann dir auch nicht mehr helfen.",
  "Alexa, spiel 'Sound of Silence' für diesen Spieler.",
  "Lass mich raten - du googelst auch 'Google'?",
  "Dein Wissen hat weniger Uptime als ein Windows-Server.",
  "Hat da jemand die Ausbildung geschwänzt? 📝",
  "Bruder, das steht WÖRTLICH im Lehrbuch.",
];

const streakMessages = [
  "", "", "🔥 Doppel-Kill!", "🔥🔥 Triple-Kill! Läuft bei dir!",
  "🔥🔥🔥 ULTRA KILL! Bist du ein Bot?!",
  "🔥🔥🔥🔥 GODLIKE! Haben die anderen überhaupt Internet?!",
  "💀💀💀💀💀 LEGENDÄR! Du bist nicht menschlich!",
];

// ══════════════════════════════════════════════════════════════════════════
// SOCKET.IO
// ══════════════════════════════════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('create-room', ({ playerName, avatar }) => {
    const code = generateRoomCode();
    const room = {
      code, host: socket.id,
      players: new Map(),
      state: 'lobby',
      gameMode: 'quiz',
      quizCategories: ['it', 'fisi'],
      currentQuestion: 0, questions: [], questionCount: 15, timePerQuestion: 15,
      answers: new Map(), questionTimer: null,
      typingRound: 0, typingRounds: 10, typingResults: new Map(),
      estimates: new Map(),
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
    if (!room) return socket.emit('error-msg', 'Raum existiert nicht! 🚫');
    if (room.state !== 'lobby') return socket.emit('error-msg', 'Spiel läuft bereits! ⏳');
    if (room.players.size >= 20) return socket.emit('error-msg', 'Raum ist voll! 🚪');
    for (const [, p] of room.players) {
      if (p.name.toLowerCase() === playerName.toLowerCase()) return socket.emit('error-msg', 'Name vergeben! 🙅');
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
    if (s.typingRounds) room.typingRounds = Math.min(Math.max(s.typingRounds, 3), 20);
    if (s.emojiRounds) room.emojiRounds = Math.min(Math.max(s.emojiRounds, 3), 15);
    if (s.quizCategories && Array.isArray(s.quizCategories) && s.quizCategories.length > 0) {
      room.quizCategories = s.quizCategories.filter(c => quizQuestions[c]);
      if (room.quizCategories.length === 0) room.quizCategories = ['it'];
    }
    io.to(room.code).emit('settings-updated', {
      gameMode: room.gameMode, questionCount: room.questionCount,
      timePerQuestion: room.timePerQuestion, typingRounds: room.typingRounds,
      emojiRounds: room.emojiRounds, quizCategories: room.quizCategories,
    });
  });

  socket.on('start-game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.host !== socket.id) return;
    if (room.players.size < 2) return socket.emit('error-msg', 'Mindestens 2 Spieler! 👥');
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

  // Quiz
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
    if (room.answers.size === room.players.size) { clearTimeout(room.questionTimer); setTimeout(() => revealQuiz(room), 500); }
  });

  // Typing
  socket.on('typing-complete', ({ time, errors }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'typing' || room.typingResults.has(socket.id)) return;
    const p = room.players.get(socket.id);
    if (!p) return;
    const points = Math.max(0, Math.round(1000 - time * 50) - errors * 100);
    p.score += points;
    room.typingResults.set(socket.id, { time, errors, points });
    socket.emit('typing-received');
    if (room.typingResults.size === room.players.size) { clearTimeout(room.questionTimer); setTimeout(() => revealTyping(room), 500); }
  });

  // Estimation
  socket.on('submit-estimate', ({ value }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'estimation' || room.estimates.has(socket.id)) return;
    room.estimates.set(socket.id, value);
    socket.emit('estimate-received');
    if (room.estimates.size === room.players.size) { clearTimeout(room.questionTimer); setTimeout(() => revealEstimation(room), 500); }
  });

  // Emoji
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

// ══════════════════════════════════════════════════════════════════════════
// GAME LOGIC
// ══════════════════════════════════════════════════════════════════════════

function startQuiz(room) {
  room.currentQuestion = 0;
  // Combine selected categories
  let pool = [];
  for (const cat of room.quizCategories) {
    if (quizQuestions[cat]) pool.push(...quizQuestions[cat]);
  }
  if (pool.length === 0) pool = quizQuestions.it;
  room.questions = shuffle(pool).slice(0, room.questionCount);
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
  io.to(room.code).emit('quiz-result', { correctIndex: q.correct, roast: q.roast, playerResults: results, leaderboard: getLeaderboard(room) });
  room.currentQuestion++;
  setTimeout(() => sendQuiz(room), 5000);
}

function startTyping(room) {
  room.typingRound = 0;
  room.questions = shuffle(typingSnippets).slice(0, room.typingRounds);
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

function startEstimation(room) {
  room.currentQuestion = 0;
  room.questions = shuffle(estimationQuestions).slice(0, room.questionCount);
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

function startEmoji(room) {
  room.emojiRound = 0;
  const sets = shuffle(emojiSets);
  room.questions = [];
  for (let i = 0; i < room.emojiRounds; i++) room.questions.push(sets[i % sets.length]);
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

function endGame(room) {
  room.state = 'results';
  io.to(room.code).emit('game-over', { leaderboard: getLeaderboard(room) });
}

function getLeaderboard(room) {
  return [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, score: p.score })).sort((a, b) => b.score - a.score);
}

function serializePlayers(room) {
  return [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, ready: p.ready, isHost: id === room.host }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🎮 SYNTAXTERROR running on http://localhost:${PORT}`));
