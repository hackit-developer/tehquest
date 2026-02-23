let quizData = null;
let currentQuestionIndex = 0;
let answers = [];
let timeLeft = 0;
let questionTimeLeft = 30;
let sessionTimer = null;
let questionTimer = null;
let isDisqualified = false;

// DOM Elements
const setupView = document.getElementById('setup-view');
const activeQuiz = document.getElementById('active-quiz');
const resultView = document.getElementById('result-view');
const questionArea = document.getElementById('question-area');
const progressBar = document.getElementById('progress-bar');
const sessTimerDisplay = document.getElementById('session-timer');
const qTimerDisplay = document.getElementById('question-timer');

// Get Params
const urlParams = new URLSearchParams(window.location.search);
const quizCode = urlParams.get('code');
const quizPass = urlParams.get('pass');

// Initialization
async function init() {
    if (!quizCode) {
        await AppUI.alert('Invalid access. Missing quiz code.', 'Access Denied');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`/api/quizzes/${encodeURIComponent(quizCode)}${quizPass ? `?password=${encodeURIComponent(quizPass)}` : ''}`);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to load quiz');
        }

        quizData = await response.json();
        document.getElementById('quiz-title').textContent = quizData.title;
        document.getElementById('quiz-meta').textContent = `${quizData.questions.length} Questions | ${quizData.time_limit} Minutes`;
    } catch (err) {
        await AppUI.alert(err.message, 'Initialization Error');
        window.location.href = 'index.html';
    }
}

document.getElementById('start-btn').addEventListener('click', () => {
    const name = document.getElementById('student-name').value.trim();
    const roll = document.getElementById('student-roll').value.trim();

    if (!name || !roll) {
        AppUI.notify('Please provide your name and roll number', 'error');
        return;
    }

    startExam();
});

// Malpractice Handlers
const onVisibilityChange = () => {
    if (document.hidden) triggerDisqualification();
};
const onBlur = () => triggerDisqualification();

function startExam() {
    setupView.classList.add('hidden');
    activeQuiz.classList.remove('hidden');
    document.getElementById('current-quiz-title').textContent = quizData.title;

    timeLeft = quizData.time_limit * 60;
    startSessionTimer();
    renderQuestion();

    // Malpractice Detection
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
}

function triggerDisqualification() {
    if (isDisqualified) return;
    isDisqualified = true;
    AppUI.alert('System detected you left the assessment window. You have been disqualified.', 'Security Breach')
        .then(() => submitExam(true));
}

function startSessionTimer() {
    sessionTimer = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        sessTimerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(sessionTimer);
            submitExam();
        }
    }, 1000);
}

function startQuestionTimer() {
    if (questionTimer) clearInterval(questionTimer);
    questionTimeLeft = 30;
    qTimerDisplay.textContent = `${questionTimeLeft}s remaining`;

    questionTimer = setInterval(() => {
        questionTimeLeft--;
        qTimerDisplay.textContent = `${questionTimeLeft}s remaining`;

        if (questionTimeLeft <= 0) {
            clearInterval(questionTimer);
            nextQuestion(true);
        }
    }, 1000);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderQuestion() {
    const q = quizData.questions[currentQuestionIndex];
    document.getElementById('q-count').textContent = `Question ${currentQuestionIndex + 1} of ${quizData.questions.length}`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`;

    questionArea.innerHTML = `
        <div class="card shadow-lg">
            <h2 class="mb-4">${escapeHTML(q.question_text)}</h2>
            <div id="options-grid">
                ${q.options.map(opt => `
                    <button class="option-btn ${getSelectedOption(q.id) === opt.id ? 'selected' : ''}" 
                            onclick="handleSelect(${q.id}, ${opt.id}, this)">
                        ${escapeHTML(opt.option_text)}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    nextBtn.textContent = (currentQuestionIndex === quizData.questions.length - 1) ? 'Finalize Submission' : 'Next Stage';

    if (currentQuestionIndex > 0) {
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
    }

    startQuestionTimer();
}

window.handleSelect = (qId, optId, btn) => {
    // UI Update
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Data Update
    const existing = answers.find(a => a.questionId === qId);
    if (existing) existing.optionId = optId;
    else answers.push({ questionId: qId, optionId: optId });
};

function getSelectedOption(qId) {
    const ans = answers.find(a => a.questionId === qId);
    return ans ? ans.optionId : null;
}

document.getElementById('next-btn').addEventListener('click', () => nextQuestion(false));
document.getElementById('prev-btn').addEventListener('click', prevQuestion);

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function nextQuestion(auto = false) {
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        if (auto) submitExam();
        else {
            AppUI.confirm('Are you sure you want to finish the assessment?', 'Final Submission')
                .then(res => { if (res) submitExam(); });
        }
    }
}

async function submitExam(disqualified = false) {
    clearInterval(sessionTimer);
    clearInterval(questionTimer);

    // Cleanup listeners
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onBlur);

    activeQuiz.classList.add('hidden');

    // Hacker Level Loading (2 Seconds)
    await runHackerLoader();

    resultView.classList.remove('hidden');
    startHackerAnimation();

    const name = document.getElementById('student-name').value;
    const roll = document.getElementById('student-roll').value;

    if (disqualified) {
        document.getElementById('status-icon').textContent = '⚠️';
        document.getElementById('result-title').textContent = 'DISQUALIFIED';
        document.getElementById('result-text').textContent = 'Your session was terminated due to policy violation.';
        document.getElementById('final-score').textContent = '0/0';
    }

    try {
        const response = await fetch(`/api/quizzes/${quizData.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentName: name,
                studentRoll: roll,
                answers,
                isDisqualified: disqualified
            })
        });

        const result = await response.json();
        if (!disqualified) {
            document.getElementById('final-score').textContent = `${result.score}/${result.total}`;
            triggerConfetti();
        }
    } catch (err) {
        console.error('Submission failed', err);
    }
}

function triggerConfetti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 10000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Initial big blast
    confetti({
        ...defaults,
        particleCount: 150,
        origin: { y: 0.6 }
    });

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}

async function runHackerLoader() {
    return new Promise(resolve => {
        const loader = document.getElementById('hacker-loader');
        const bar = document.getElementById('loader-bar');
        const pct = document.getElementById('loader-pct');
        const status = document.getElementById('loader-status');
        const canvas = document.getElementById('loader-canvas');

        loader.classList.remove('hidden');

        // Loader Animation Matrix
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const columns = canvas.width / 16;
        const drops = Array(Math.floor(columns)).fill(1);

        const matrixInt = setInterval(() => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#0F0";
            ctx.font = "16px monospace";
            drops.forEach((y, i) => {
                const text = String.fromCharCode(Math.random() * 128);
                ctx.fillText(text, i * 16, y * 16);
                if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        }, 33);

        const statusTexts = [
            "BYPASSING FIREWALLS...",
            "ENCRYPTING PAYLOAD...",
            "RELAYING THROUGH PROXIES...",
            "DB TUNNEL ESTABLISHED...",
            "UPLOAD SUCCESSFUL."
        ];

        let progress = 0;
        const startTime = Date.now();
        const duration = 2000;

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);

            bar.style.width = progress + "%";
            pct.textContent = Math.floor(progress) + "%";

            const statusIdx = Math.floor((progress / 100) * (statusTexts.length - 1));
            status.textContent = statusTexts[statusIdx];

            if (progress >= 100) {
                clearInterval(timer);
                clearInterval(matrixInt);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    resolve();
                }, 200);
            }
        }, 30);
    });
}

function startHackerAnimation() {
    const canvas = document.getElementById('hacker-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*()";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0F0"; // Green color for hacker effect
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    const animationInterval = setInterval(draw, 33);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

init();
