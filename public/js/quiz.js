let quizData = null;
let currentQuestionIndex = 0;
let answers = [];
let timeLeft = 0;
let sessionTimer = null;
let isDisqualified = false;
let assessmentStartTime = null;
let assessmentStartTimeISO = null;
let tabSwitches = 0;
let lastSwitchTime = 0;

// DOM Elements
const setupView = document.getElementById('setup-view');
const guidelinesView = document.getElementById('guidelines-view');
const activeQuiz = document.getElementById('active-quiz');
const resultView = document.getElementById('result-view');
const questionArea = document.getElementById('question-area');
const progressBar = document.getElementById('progress-bar');

const getSessTimer = () => document.getElementById('session-timer');

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

        // Shuffle questions for each different person
        quizData.questions = shuffleArray(quizData.questions);
        quizData.questions.forEach(q => {
            if (q.options) q.options = shuffleArray(q.options);
        });

        document.getElementById('quiz-title').textContent = quizData.title;
        const totalDurationMins = quizData.time_limit || 30;
        document.getElementById('quiz-meta').textContent = `${quizData.questions.length} Questions | ${totalDurationMins} Minutes`;
    } catch (err) {
        await AppUI.alert(err.message, 'Initialization Error');
        window.location.href = 'index.html';
    }
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

document.getElementById('start-btn').addEventListener('click', async () => {
    const name = document.getElementById('student-name').value.trim();
    const roll = document.getElementById('student-roll').value.trim();
    const phone = document.getElementById('student-phone').value.trim();
    const dept = document.getElementById('student-dept').value.trim();
    const year = document.getElementById('student-year').value;
    const section = document.getElementById('student-section').value.trim();
    const email = document.getElementById('student-email').value.trim();

    if (!name || !roll || !phone || !dept || !year || !section || !email) {
        AppUI.notify('Please fill in all the required fields', 'error');
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        AppUI.notify('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        AppUI.notify('Please enter a valid email address', 'error');
        return;
    }

    // Security Check: Previous disqualification
    try {
        const response = await fetch(`/api/quizzes/${quizData.id}/check-student?roll=${encodeURIComponent(roll)}`);
        const status = await response.json();

        if (status.existing && status.isDisqualified) {
            await AppUI.alert(
                'Access Denied: Our records show you have been disqualified from this assessment for violating security protocols. Re-attempting is strictly prohibited.',
                'SECURITY_BLACKLISTED'
            );
            return;
        }

        if (status.existing && !status.isDisqualified) {
            const proceed = await AppUI.confirm('You have already submitted this assessment. Do you want to submit another attempt? (Previous scores will be preserved separately)', 'Already Attempted');
            if (!proceed) return;
        }
    } catch (err) {
        console.error('Status check failed', err);
    }

    assessmentStartTime = Date.now();
    assessmentStartTimeISO = new Date().toISOString();
    showGuidelines();
});

document.getElementById('accept-guidelines-btn').addEventListener('click', () => {
    startExam();
});

// Malpractice Handlers
const handleTabSwitch = () => {
    // Debounce: ignore multiple triggers within 2 seconds
    if (Date.now() - lastSwitchTime < 2000) return;
    
    lastSwitchTime = Date.now();
    tabSwitches++;
    
    if (tabSwitches <= 3) {
        AppUI.alert(`Warning (${tabSwitches}/3): You have switched tabs or minimized the window. Continuing this behavior will lead to automatic disqualification.`, 'Malpractice Warning');
    } else {
        triggerDisqualification();
    }
};

const onVisibilityChange = () => {
    if (document.hidden) handleTabSwitch();
};
const onBlur = () => handleTabSwitch();

function showGuidelines() {
    setupView.classList.add('hidden');
    guidelinesView.classList.remove('hidden');

    const terminal = document.getElementById('guidelines-terminal');
    const actions = document.getElementById('guidelines-actions');
    terminal.innerHTML = '';
    actions.classList.add('hidden');

    const lines = [
        `> INITIALIZING SECURITY_PROTOCOL_v2.4`,
        `> FETCHING ASSESSMENT RULES FOR: ${quizData.title.toUpperCase()}`,
        `> -----------------------------------------`,
        `> RULE_01: TOTAL_DURATION = ${quizData.time_limit || 30} MINUTES`,
        `> RULE_02: TAB_SWITCHING = 3 MAX EXCEPTIONS`,
        `> RULE_03: WINDOW_BLUR = 3 MAX EXCEPTIONS`,
        `> RULE_04: QUESTION_SHUFFLE = ACTIVE -> RANDOMIZED_SEQUENCE`,
        `> -----------------------------------------`,
        `> STATUS: ALL SYSTEMS SECURED. READY FOR UPLOAD.`
    ];

    let lineIdx = 0;
    function typeLine() {
        if (lineIdx < lines.length) {
            const p = document.createElement('p');
            p.style.margin = '0';
            p.style.opacity = '0';
            p.textContent = lines[lineIdx];
            terminal.appendChild(p);

            // Simple animation
            let charIdx = 0;
            p.textContent = '';
            p.style.opacity = '1';

            const typing = setInterval(() => {
                p.textContent += lines[lineIdx][charIdx];
                charIdx++;
                if (charIdx === lines[lineIdx].length) {
                    clearInterval(typing);
                    lineIdx++;
                    setTimeout(typeLine, 200);
                }
            }, 20);
        } else {
            actions.classList.remove('hidden');
        }
    }

    setTimeout(typeLine, 500);
}

function startExam() {
    if (!quizData || !quizData.questions) {
        console.error('Quiz data missing during start!');
        AppUI.alert('Session data missing. Reload the page.', 'Data Integrity Error');
        return;
    }
    console.log('Starting exam with questions count:', quizData.questions.length);
    guidelinesView.classList.add('hidden');
    activeQuiz.classList.remove('hidden');
    document.getElementById('current-quiz-title').textContent = quizData.title;

    if (!assessmentStartTime) assessmentStartTime = Date.now();
    timeLeft = (quizData.time_limit || 30) * 60;
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

function formatTime(n) {
    return n.toString().length < 2 ? '0' + n : n.toString();
}


function startSessionTimer() {
    const display = getSessTimer();
    console.log('Session timer started with:', timeLeft, 'seconds');
    sessionTimer = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        if (display) {
            display.textContent = `${formatTime(mins)}:${formatTime(secs)}`;
            if (timeLeft <= 300) {
                display.style.color = '#ef4444';
            }
            if (timeLeft <= 60) {
                display.style.animation = 'pulse 1s infinite';
            }
        }

        if (timeLeft <= 0) {
            console.log('Session timer ended.');
            clearInterval(sessionTimer);
            if (display) display.style.animation = 'none';
            AppUI.notify('Time up! Auto-submitting assessment.', 'error');
            submitExam(false);
        }
    }, 1000);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderQuestion() {
    console.log('Rendering question ID:', currentQuestionIndex);
    const q = quizData.questions[currentQuestionIndex];
    document.getElementById('q-count').textContent = `Question ${currentQuestionIndex + 1} of ${quizData.questions.length}`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`;

    questionArea.innerHTML = `
        <div class="card shadow-lg">
            <div class="mb-4" style="font-size: 1.25rem; font-weight: 700; white-space: pre-wrap; word-break: break-word;">${escapeHTML(q.question_text)}</div>
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

    nextBtn.textContent = (currentQuestionIndex === quizData.questions.length - 1) ? 'Finalize Submission' : 'Next Stage';


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
    const phone = document.getElementById('student-phone').value;
    const dept = document.getElementById('student-dept').value;
    const year = document.getElementById('student-year').value;
    const section = document.getElementById('student-section').value;
    const email = document.getElementById('student-email').value;
    const activeTime = assessmentStartTime ? Math.floor((Date.now() - assessmentStartTime) / 1000) : 0;
    console.log('[TIMER] Submitting with activeTime:', activeTime, 'based on start:', assessmentStartTime);

    if (disqualified) {
        document.getElementById('status-icon').textContent = '🚫';
        document.getElementById('result-title').textContent = 'SESSION TERMINATED';
        document.getElementById('result-title').style.color = '#ef4444';
        document.getElementById('result-text').textContent = 'Your assessment was flagged for a security violation. This attempt has been logged as DISQUALIFIED.';
        document.getElementById('result-text').style.color = '#f87171';
        document.getElementById('final-score').textContent = 'VOID';
        document.getElementById('final-score').style.color = '#ef4444';

        const card = resultView.querySelector('.card.glass');
        if (card) {
            card.style.borderColor = '#ef4444';
            card.style.background = 'rgba(220, 38, 38, 0.05)';
        }
    }

    try {
        const response = await fetch(`/api/quizzes/${quizData.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentName: name,
                studentRoll: roll,
                studentPhone: phone,
                studentDept: dept,
                studentYear: year,
                studentSection: section,
                studentEmail: email,
                answers,
                isDisqualified: disqualified,
                activeTime: Math.round(activeTime),
                startedAt: assessmentStartTimeISO,
                tabSwitches: tabSwitches
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
