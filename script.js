const questions = [
  {
    question: "Which language runs in a web browser?",
    answers: ["Java", "C", "Python", "JavaScript"],
    correct: 3
  },
  {
    question: "What does CSS stand for?",
    answers: [
      "Central Style Sheets",
      "Cascading Style Sheets",
      "Cascading Simple Sheets",
      "Cars SUVs Sailboats"
    ],
    correct: 1
  }
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const scoreContainer = document.getElementById("score-container");

function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.innerText = q.question;
  answerButtons.innerHTML = "";
  
  q.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.classList.add("btn");
    button.onclick = () => selectAnswer(index);
    answerButtons.appendChild(button);
  });
}

function selectAnswer(index) {
  if (index === questions[currentQuestion].correct) {
    score++;
  }
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    questionEl.classList.add("hide");
    answerButtons.classList.add("hide");
    scoreContainer.classList.remove("hide");
    document.getElementById("score").innerText = score;
    document.getElementById("total").innerText = questions.length;
  }
}

showQuestion();
