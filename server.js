const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { quizQuestions, categories } = require('./questions');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/categories', (req, res) => res.json(categories));

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
  socket.on('create-room', ({ playerName, avatar }) => {
    const code = generateRoomCode();
    const room = {
      code, host: socket.id, players: new Map(), state: 'lobby',
      quizCategories: ['it', 'fisi'], currentQuestion: 0, questions: [],
      questionCount: 15, timePerQuestion: 15,
      answers: new Map(), questionTimer: null, questionHistory: [],
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
    if (s.questionCount) room.questionCount = Math.min(Math.max(s.questionCount, 5), 40);
    if (s.timePerQuestion) room.timePerQuestion = Math.min(Math.max(s.timePerQuestion, 5), 30);
    if (s.quizCategories && Array.isArray(s.quizCategories) && s.quizCategories.length > 0) {
      room.quizCategories = s.quizCategories.filter(c => quizQuestions[c]);
      if (room.quizCategories.length === 0) room.quizCategories = ['it'];
    }
    io.to(room.code).emit('settings-updated', {
      questionCount: room.questionCount, timePerQuestion: room.timePerQuestion,
      quizCategories: room.quizCategories,
    });
  });

  socket.on('start-game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.host !== socket.id) return;
    if (room.players.size < 2) return socket.emit('error-msg', 'Mindestens 2 Spieler! 👥');
    room.state = 'playing';
    for (const [, p] of room.players) { p.score = 0; p.streak = 0; }
    io.to(room.code).emit('game-started');
    startQuiz(room);
  });

  socket.on('submit-answer', ({ answerIndex, timeLeft }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'playing') return;
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
// QUIZ LOGIC
// ══════════════════════════════════════════════════════════════════════════
function startQuiz(room) {
  room.currentQuestion = 0;
  let pool = [];
  for (const cat of room.quizCategories) {
    if (quizQuestions[cat]) pool.push(...quizQuestions[cat]);
  }
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
  const historyEntry = { question: q.q, correctIndex: q.correct, correctAnswer: q.answers[q.correct], players: {} };
  for (const [id, p] of room.players) {
    const a = room.answers.get(id);
    historyEntry.players[id] = { name: p.name, correct: a ? a.correct : false, answered: !!a };
  }
  room.questionHistory.push(historyEntry);
  io.to(room.code).emit('quiz-result', { correctIndex: q.correct, roast: q.roast, playerResults: results, leaderboard: getLeaderboard(room) });
  room.currentQuestion++;
  setTimeout(() => sendQuiz(room), 5000);
}

function endGame(room) {
  room.state = 'results';
  io.to(room.code).emit('game-over', { leaderboard: getLeaderboard(room), questionHistory: room.questionHistory });
}

function getLeaderboard(room) {
  return [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, score: p.score })).sort((a, b) => b.score - a.score);
}

function serializePlayers(room) {
  return [...room.players.entries()].map(([id, p]) => ({ id, name: p.name, avatar: p.avatar, ready: p.ready, isHost: id === room.host }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🎮 SYNTAXTERROR running on http://localhost:${PORT}`));
