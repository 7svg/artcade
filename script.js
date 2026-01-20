let score = 0;
let mistakeCount = 0;
let currentIdx = 0;

// Audio Elements
const sClick = document.getElementById("sound-click");
const sCorrect = document.getElementById("sound-correct");
const sWrong = document.getElementById("sound-wrong");
const sReboot = document.getElementById("sound-reboot");

document.addEventListener("click", e => {
  if (e.target.tagName.toLowerCase() === "audio") return;
  try {
    sClick.currentTime = 0;
    sClick.play();
  } catch (err) {
    console.warn("Click sound blocked until first interaction:", err);
  }
});

const gameData = [
  { 
    title: "Level 1 Quiz", 
    text: "Most AI systems use your conversations to learn. This means your information is:", 
    opts: ["Deleted immediately", "Potentially stored for training", "Hidden from the AI company"], 
    ans: 1, 
    tip: "Assume everything you type is permanent." 
  },
  { 
    title: "Level 2: Fact Checking", 
    text: "The AI gives you a confident answer about a historical date. You should:", 
    opts: ["Trust it because AI is a super-computer", "Verify it with a trusted search engine", "Assume it's a joke"], 
    ans: 1, 
    tip: "AI can 'hallucinate' or make up false facts!" 
  },
  { 
    title: "Level 2 Quiz", 
    text: "If an AI gives you a math calculation or a link to a website, you must:", 
    opts: ["Trust it without checking", "Check the math and test the link yourself", "Report the AI for being too helpful"], 
    ans: 1, 
    tip: "AI often struggles with precise logic and real-world links." 
  },
  { 
    title: "Level 3: Deepfakes", 
    text: "You see a video of a celebrity asking for money in a weird way. It is likely:", 
    opts: ["A Deepfake", "A real emergency", "A glitch in your screen"], 
    ans: 0, 
    tip: "AI can fake voices and faces to trick you." 
  },
  { 
    title: "Level 4 Quiz", 
    text: "To protect your family from voice-clone scams, you should use:", 
    opts: ["A secret safe-word or challenge question", "A better phone brand", "More social media"], 
    ans: 0, 
    tip: "Physical verification beats digital fakery!" 
  },
  { 
    title: "Level 5: Human Oversight", 
    text: "Who should have the final say on a medical or legal decision?", 
    opts: ["The AI model", "A human expert", "The most popular AI chat"], 
    ans: 1, 
    tip: "AI is an assistant, not a replacement for experts." 
  },
  { 
    title: "Level 6 Quiz", 
    text: "The 'Human-in-the-Loop' philosophy means:", 
    opts: ["Humans do all the work manually", "Humans must review AI output before it's used", "Humans live inside the computer"], 
    ans: 1, 
    tip: "Your judgment is the final firewall." 
  },
  { 
    title: "Level 7: Ethical Use", 
    text: "Your friend wants to use AI to generate mean comments about someone. You say:", 
    opts: ["'It's fine, it's just code'", "'No, AI should be used for good, not harm'"], 
    ans: 1, 
    tip: "#AI4Peace: Use technology to build, not destroy." 
  },
  { 
    title: "Level 8 Quiz", 
    text: "Safe AI usage starts with:", 
    opts: ["Having the fastest internet", "Buying the most expensive AI", "Your own awareness and caution"], 
    ans: 2, 
    tip: "You are the most important part of AI safety!" 
  },
  { 
    title: "Level 9: Data Safety", 
    text: "When asking AI to help with an email to a client, how should you refer to the client?", 
    opts: ["Use their full legal name and address", "Use a generic label like 'Client A'"], 
    ans: 1, 
    tip: "Keeping names private prevents data leaks!" 
  }
];

const status = document.getElementById("status-tag");
const robot = document.getElementById("robot-container");
const speech = document.getElementById("speech-bubble");
const overlay = document.getElementById("color-overlay");
const flash = document.getElementById("reboot-flash");

let redLevel = 0;
let greenLevel = 0;

function updateVisuals() {
  const container = document.getElementById("game-container");
  container.classList.remove("shake-light", "shake-heavy", "shake-fatal", "heal-pulse");

  let blend = `radial-gradient(circle, rgba(${redLevel}, ${greenLevel}, 0, 0.4) 0%, rgba(0,0,0,0.9) 100%)`;
  overlay.style.background = blend;

  if (mistakeCount === 0) {
    robot.innerText = "🤖";
    status.innerText = "SYSTEM: STABLE";
    status.style.color = "var(--green)";
  } else if (mistakeCount === 1) {
    container.classList.add("shake-light");
    robot.innerText = "🤨";
    status.innerText = "SYSTEM: GLITCHING";
    status.style.color = "orange";
  } else if (mistakeCount === 2) {
    container.classList.add("shake-heavy");
    robot.innerText = "😠";
    status.innerText = "SYSTEM: CRITICAL";
    status.style.color = "red";
  } else if (mistakeCount >= 3) {
    container.classList.add("shake-fatal");
    robot.innerText = "😡";
    status.innerText = "SYSTEM: COMPROMISED";
    status.style.color = "red";
  }
}

function renderStep() {
  if (currentIdx >= gameData.length) return showEnd();
  const step = gameData[currentIdx];
  document.getElementById("question-title").innerText = step.title;
  document.getElementById("question-text").innerText = step.text;
  document.getElementById("progress-fill").style.width = ((currentIdx / gameData.length) * 100) + "%";

  const box = document.getElementById("options-box");
  box.innerHTML = "";
  step.opts.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(i, step, btn);
    box.appendChild(btn);
  });
}

function handleAnswer(i, step, btn) {
  const allBtns = document.querySelectorAll(".opt-btn");
  allBtns.forEach(b => b.disabled = true);

  if (i === step.ans) {
    btn.classList.add("correct");
    score += 10;
    document.getElementById("score-val").innerText = score;
    
    // Fixed: Added \n\n and space for clear gap
    typeSpeech("✅ CORRECT!\n\n" + step.tip);
    
    sCorrect.play();
    if (mistakeCount > 0) mistakeCount--;
    greenLevel = Math.min(255, greenLevel + 60);
    redLevel = Math.max(0, redLevel - 30);
    document.getElementById("game-container").classList.add("heal-pulse");
  } else {
    btn.classList.add("wrong");
    mistakeCount++;
    
    // Fixed: Added \n\n and space for clear gap
    typeSpeech("❌ WRONG!\n\n" + step.tip);
    
    sWrong.play();
    redLevel = Math.min(255, redLevel + 70);
    greenLevel = Math.max(0, greenLevel - 40);
  }

  updateVisuals();
  setTimeout(() => { currentIdx++; renderStep(); }, 2500);
}

function typeSpeech(text) {
  speech.innerText = "";
  let idx = 0;
  const interval = setInterval(() => {
    speech.innerText += text[idx];
    idx++;
    if (idx >= text.length) clearInterval(interval);
  }, 30);
}

document.getElementById("start-btn").onclick = () => {
  sClick.play();
  document.getElementById("start-screen").classList.remove("active");
  document.getElementById("game-screen").classList.add("active");
  renderStep();
};

document.getElementById("reboot-btn").onclick = () => {
  rebootSequence();
};

function showEnd() {
  document.getElementById("game-screen").classList.remove("active");
  document.getElementById("end-screen").classList.add("active");
  document.getElementById("final-score").innerText = "Final Score: " + score + "/100";

  if (mistakeCount >= 3) {
    document.getElementById("end-title").innerText = "⚠️ AI CORRUPTED";
    document.getElementById("end-desc").innerText = "The AI turned dangerous due to unsafe prompts.";
  } else {
    document.getElementById("end-title").innerText = "✅ MISSION SUCCESS";
    document.getElementById("end-desc").innerText = "You protected the AI and upheld #AI4Peace!";
  }
}

function rebootSequence() {
  sClick.play();
  flash.classList.add("active");
  sReboot.currentTime = 0;
  sReboot.play();
  setTimeout(() => {
    flash.classList.remove("active");
    location.reload();
  }, 2200);
}

// Particle Background
const canvas = document.getElementById("particle-bg");
const ctx = canvas.getContext("2d");
let particles = [];

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.onresize = resize;
resize();

function createParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: "rgba(0,255,255,0.3)"
    });
  }
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
    }
  });
  requestAnimationFrame(drawParticles);
}
createParticles();
drawParticles();

window.addEventListener('click', () => {
  const sounds = [sClick, sCorrect, sWrong, sReboot];
  sounds.forEach(s => {
    try {
      s.play().then(() => s.pause());
    } catch (e) {}
  });
}, { once: true });