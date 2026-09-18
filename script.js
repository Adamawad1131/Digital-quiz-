const questionsData = {
  tech: [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlinks Text Mark Language", "Home Tool Markup Language"], correct: 0 },
    { question: "Which language is primarily used for web styling?", options: ["Python", "CSS", "C++", "Java"], correct: 1 },
    { question: "What year was JavaScript created?", options: ["1991", "1995", "2001", "2008"], correct: 1 }
  ],
  science: [
    { question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { question: "What is the chemical symbol for Water?", options: ["HO2", "H2O", "O2H", "WA"], correct: 1 }
  ],
  history: [
    { question: "In which year did WWII end?", options: ["1943", "1945", "1950", "1939"], correct: 1 },
    { question: "Who built the Ancient Pyramids of Giza?", options: ["Romans", "Greeks", "Egyptians", "Persians"], correct: 2 },
    { question: "Who was the first person to step on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"], correct: 2 }
  ]
};

// State Variables
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let timer = 15;
let timerInterval = null;
let soundEnabled = true;

// Audio Synthesizer (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!soundEnabled) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'click') {
    osc.frequency.value = 400;
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } else if (type === 'correct') {
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } else if (type === 'wrong') {
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  }
}

// DOM Elements
const startView = document.getElementById('start-view');
const quizView = document.getElementById('quiz-view');
const resultView = document.getElementById('result-view');

const categorySelect = document.getElementById('category-select');
const categoryBadge = document.getElementById('category-badge');
const startBtn = document.getElementById('start-btn');
const soundBtn = document.getElementById('sound-btn');
const restartBtn = document.getElementById('restart-btn');

const timerEl = document.getElementById('timer');
const currentScoreEl = document.getElementById('current-score');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsGrid = document.getElementById('options-grid');
const questionCount = document.getElementById('question-count');

// Sound Toggle
soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
});

// Event Listeners
startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', resetQuiz);

function startQuiz() {
  playSound('click');
  const cat = categorySelect.value;
  currentQuestions = questionsData[cat];
  categoryBadge.textContent = categorySelect.options[categorySelect.selectedIndex].text;
  
  currentIndex = 0;
  score = 0;
  currentScoreEl.textContent = score;

  startView.classList.add('hide');
  quizView.classList.remove('hide');
  
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timerInterval);
  timer = 15;
  timerEl.textContent = timer;
  
  const q = currentQuestions[currentIndex];
  questionText.textContent = q.question;
  questionCount.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  progressBar.style.width = `${((currentIndex) / currentQuestions.length) * 100}%`;

  optionsGrid.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(idx);
    optionsGrid.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 0) {
      clearInterval(timerInterval);
      selectAnswer(-1); // Timeout
    }
  }, 1000);
}

function selectAnswer(selectedIdx) {
  clearInterval(timerInterval);
  const q = currentQuestions[currentIndex];
  const buttons = optionsGrid.children;

  Array.from(buttons).forEach(btn => btn.style.pointerEvents = 'none');

  if (selectedIdx === q.correct) {
    playSound('correct');
    score += 10;
    currentScoreEl.textContent = score;
    if (selectedIdx >= 0) buttons[selectedIdx].classList.add('correct');
  } else {
    playSound('wrong');
    if (selectedIdx >= 0) buttons[selectedIdx].classList.add('wrong');
    buttons[q.correct].classList.add('correct');
  }

  setTimeout(() => {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }, 1200);
}

function showResults() {
  quizView.classList.add('hide');
  resultView.classList.remove('hide');
  
  document.getElementById('final-score').textContent = score;
  document.getElementById('total-questions').textContent = currentQuestions.length * 10;

  const feedback = document.getElementById('feedback-text');
  if (score === currentQuestions.length * 10) {
    feedback.textContent = '🌟 Perfect Score! You are a genius!';
    triggerConfetti();
  } else if (score >= (currentQuestions.length * 10) / 2) {
    feedback.textContent = '👍 Good job! Keep practicing!';
  } else {
    feedback.textContent = '📚 Nice try! Give it another go!';
  }
}

function resetQuiz() {
  playSound('click');
  resultView.classList.add('hide');
  startView.classList.remove('hide');
}

// Simple Confetti Animation
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 80 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 8 + 4,
    color: ['#6366f1', '#06b6d4', '#22c55e', '#f59e0b'][Math.floor(Math.random() * 4)],
    vy: Math.random() * 3 + 2
  }));

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.vy;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    if (particles.some(p => p.y < canvas.height)) {
      requestAnimationFrame(render);
    }
  }
  render();
}
