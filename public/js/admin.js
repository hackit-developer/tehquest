const adminToken = localStorage.getItem('adminToken');
if (!adminToken) {
    window.location.href = 'login.html';
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': adminToken
    };
}

// State
let quizzes = [];
let questions = [];
let currentEditingQuizId = null;
let currentSubmissions = []; // To store fetched results for local filtering
let activeQuizTitle = '';
let activeQuizCode = '';

// DOM Elements
const quizListContainer = document.getElementById('quiz-list-container');
const welcomeView = document.getElementById('welcome-view');
const createView = document.getElementById('create-view');
const submissionsView = document.getElementById('submissions-view');
const questionsBuilder = document.getElementById('questions-builder');

// Init
async function init() {
    await fetchQuizzes();
}

async function fetchQuizzes() {
    try {
        const response = await fetch('/api/admin/quizzes', { headers: getHeaders() });
        if (!response.ok) throw new Error('Unauthorized');
        quizzes = await response.json();
        renderQuizList();
    } catch (err) {
        logout();
    }
}

function renderQuizList() {
    quizListContainer.innerHTML = quizzes.map(q => `
        <div class="quiz-item" data-id="${q.id}" data-title="${q.title.replace(/"/g, '&quot;')}" data-code="${q.code}">
            <div style="font-size: 0.9rem; font-weight: 600;">${q.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Code: ${q.code}</div>
        </div>
    `).join('');

    // Attach listeners
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const title = item.dataset.title.replace(/&quot;/g, '"');
            const code = item.dataset.code;
            viewSubmissions(id, title, code);
        });
    });
}

window.viewSubmissions = async (id, title, code) => {
    setActiveItem(id);
    showView('submissions');
    activeQuizTitle = title;
    activeQuizCode = code;
    document.getElementById('view-quiz-title').textContent = title;
    document.getElementById('view-quiz-meta').textContent = `Join Code: ${code}`;

    // Reset filters
    document.getElementById('sub-search').value = '';
    document.getElementById('sub-sort').value = 'score-desc';

    try {
        const response = await fetch(`/api/admin/quizzes/${id}/submissions`, { headers: getHeaders() });
        currentSubmissions = await response.json();
        renderSubmissionsTable();
    } catch (err) {
        console.error('Failed to load submissions', err);
        AppUI.notify('Error loading results', 'error');
    }

    // Set up Edit button
    document.getElementById('edit-btn').onclick = () => editQuiz(id);

    // Set up Clear History button
    const clearBtn = document.getElementById('clear-history-btn');
    clearBtn.onclick = async () => {
        const confirmed = await AppUI.confirm(
            'Are you sure you want to permanently delete ALL submission history for this quiz? This action cannot be undone.',
            'Confirm Deletion'
        );

        if (confirmed) {
            try {
                const res = await fetch(`/api/admin/quizzes/${id}/submissions`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });
                if (res.ok) {
                    AppUI.notify('Submission history cleared');
                    currentSubmissions = [];
                    renderSubmissionsTable();
                } else {
                    const err = await res.json();
                    throw new Error(err.error || 'Delete failed');
                }
            } catch (err) {
                AppUI.notify(err.message, 'error');
            }
        }
    };
};

const formatActiveTime = (sec) => {
    if (sec === undefined || sec === null) return '--:--';
    const totalSec = parseInt(sec) || 0;
    const m = Math.floor(totalSec / 60);
    const sRem = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${sRem.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
};

function renderSubmissionsTable() {
    const searchTerm = document.getElementById('sub-search').value.toLowerCase();
    const sortBy = document.getElementById('sub-sort').value;

    let filtered = currentSubmissions.filter(s =>
        s.student_name.toLowerCase().includes(searchTerm) ||
        (s.student_roll && s.student_roll.toLowerCase().includes(searchTerm)) ||
        (s.student_phone && s.student_phone.toLowerCase().includes(searchTerm)) ||
        (s.student_dept && s.student_dept.toLowerCase().includes(searchTerm)) ||
        (s.student_email && s.student_email.toLowerCase().includes(searchTerm))
    );

    filtered.sort((a, b) => {
        if (sortBy === 'score-desc') return b.score - a.score;
        if (sortBy === 'score-asc') return a.score - b.score;
        if (sortBy === 'time-desc') return new Date(b.submitted_at) - new Date(a.submitted_at);
        if (sortBy === 'time-asc') return new Date(a.submitted_at) - new Date(b.submitted_at);
        return 0;
    });

    const body = document.getElementById('submissions-body');
    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 3rem; color: var(--text-muted);">No matching submissions found.</td></tr>';
    } else {
        body.innerHTML = filtered.map(s => `
            <tr>
                <td><strong>${s.student_name}</strong></td>
                <td>${s.student_roll || 'N/A'}</td>
                <td>${s.student_dept || ''} / ${s.student_year || ''} / ${s.student_section || ''}</td>
                <td><small>${s.student_email || 'N/A'}</small></td>
                <td>${s.student_phone || 'N/A'}</td>
                <td><span style="font-size: 1.1rem; font-weight: 700;">${s.score}</span></td>
                <td><span style="font-family: monospace; font-weight: 600;">${formatActiveTime(s.active_time)}</span></td>
                <td>
                    <span class="badge ${s.is_disqualified ? 'badge-error' : 'badge-success'}">
                        ${s.is_disqualified ? 'Disqualified' : 'Submitted'}
                    </span>
                </td>
                <td style="text-align: center; font-weight: bold; color: ${s.tab_switches > 0 ? 'var(--error)' : 'inherit'}">
                    ${s.tab_switches || 0}
                </td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(s.submitted_at)}</td>
            </tr>
        `).join('');
    }
}

// Search and Sort Listeners
document.getElementById('sub-search')?.addEventListener('input', renderSubmissionsTable);
document.getElementById('sub-sort')?.addEventListener('change', renderSubmissionsTable);

// Export Functions
window.downloadCSV = () => {
    if (currentSubmissions.length === 0) return AppUI.notify('No data to export', 'error');

    const headers = ['Candidate', 'Roll Number', 'Department', 'Year', 'Section', 'Email', 'Phone Number', 'Score', 'Active Time', 'Status', 'Tab Switches', 'Submission Time'];
    const rows = currentSubmissions.map(s => [
        `"${s.student_name}"`,
        `"${s.student_roll || 'N/A'}"`,
        `"${s.student_dept || 'N/A'}"`,
        `"${s.student_year || 'N/A'}"`,
        `"${s.student_section || 'N/A'}"`,
        `"${s.student_email || 'N/A'}"`,
        `"${s.student_phone || 'N/A'}"`,
        s.score,
        `"${formatActiveTime(s.active_time)}"`,
        s.is_disqualified ? 'Disqualified' : 'Submitted',
        s.tab_switches || 0,
        `"${formatDate(s.submitted_at)}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Report_${activeQuizCode}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    AppUI.notify('CSV Report generated!');
};

window.downloadPDF = () => {
    if (currentSubmissions.length === 0) return AppUI.notify('No data to export', 'error');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Assessment Report: ${activeQuizTitle}`, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Quiz Code: ${activeQuizCode} | Total Submissions: ${currentSubmissions.length}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

    const body = currentSubmissions.map(s => [
        s.student_name,
        s.student_roll || 'N/A',
        `${s.student_dept || ''} ${s.student_year || ''} ${s.student_section || ''}`,
        s.student_email || 'N/A',
        s.student_phone || 'N/A',
        s.score,
        formatActiveTime(s.active_time),
        s.is_disqualified ? 'Disqualified' : 'Submitted',
        s.tab_switches || 0,
        formatDate(s.submitted_at)
    ]);

    doc.autoTable({
        startY: 40,
        head: [['Candidate', 'Roll', 'Dept/Yr/Sec', 'Email', 'Phone', 'Score', 'Active Time', 'Status', 'Switches', 'Submission Time']],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] } // var(--primary) equivalent
    });

    doc.save(`Report_${activeQuizCode}.pdf`);
    AppUI.notify('PDF Report generated!');
};

async function editQuiz(id) {
    try {
        const response = await fetch(`/api/admin/quizzes/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch');
        const quiz = await response.json();

        currentEditingQuizId = id;
        showView('create');

        // Populate fields
        document.getElementById('q-title').value = quiz.title;
        document.getElementById('q-code').value = quiz.code;
        document.getElementById('q-password').value = quiz.password || '';
        document.getElementById('q-time').value = quiz.time_limit || 30;


        // Populate questions
        questionsBuilder.innerHTML = '';
        quiz.questions.forEach(q => {
            const qId = Date.now() + Math.random();
            const div = document.createElement('div');
            div.className = 'card mb-4 animate-fade';

            const correctIdx = q.options.findIndex(o => o.is_correct == 1);

            div.innerHTML = `
                <div class="input-group">
                    <label>Question Text (Supports Code)</label>
                    <textarea class="q-text" placeholder="Enter your question or code snippet here" rows="4">${q.question_text}</textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    ${q.options.map((opt, i) => `
                        <div style="background: var(--bg); padding: 0.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem;">
                            <div class="flex-between">
                                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Option ${i + 1}</span>
                                <input type="radio" name="correct-${qId}" value="${i}" ${i === correctIdx ? 'checked' : ''} style="width: auto;">
                            </div>
                            <input type="text" class="opt-text" placeholder="Enter option text" value="${opt.option_text}" style="background: transparent; border: 1px solid var(--border); width: 100%; border-radius: 4px; padding: 0.4rem;">
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.remove();" class="btn btn-secondary btn-sm mt-4" style="color: var(--error);">Remove Question</button>
            `;
            questionsBuilder.appendChild(div);
        });


        document.getElementById('publish-btn').textContent = 'Update Assessment';
        window.scrollTo(0, 0);
    } catch (err) {
        AppUI.notify('Failed to load quiz details', 'error');
    }
}

function setActiveItem(id) {
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id == id);
    });
}

function showView(view) {
    welcomeView.classList.add('hidden');
    createView.classList.add('hidden');
    submissionsView.classList.add('hidden');

    if (view === 'create') createView.classList.remove('hidden');
    else if (view === 'submissions') submissionsView.classList.remove('hidden');
}

window.showCreate = () => {
    currentEditingQuizId = null;
    document.getElementById('publish-btn').textContent = 'Publish Assessment';
    showView('create');
    document.getElementById('q-title').value = '';
    document.getElementById('q-code').value = '';
    document.getElementById('q-password').value = '';
    document.getElementById('q-time').value = 30;
    questionsBuilder.innerHTML = '';
    addQuestion();

};

document.getElementById('create-btn').addEventListener('click', window.showCreate);

function addQuestion() {
    const qId = Date.now();
    const div = document.createElement('div');
    div.className = 'card mb-4 animate-fade';
    div.innerHTML = `
        <div class="input-group">
            <label>Question Text (Supports Code)</label>
            <textarea class="q-text" placeholder="Enter your question or code snippet here" rows="4"></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            ${[0, 1, 2, 3].map(i => `
                <div style="background: var(--bg); padding: 0.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem;">
                    <div class="flex-between">
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Option ${i + 1}</span>
                        <input type="radio" name="correct-${qId}" value="${i}" ${i === 0 ? 'checked' : ''} style="width: auto;">
                    </div>
                    <input type="text" class="opt-text" placeholder="Enter option text" style="background: transparent; border: 1px solid var(--border); width: 100%; border-radius: 4px; padding: 0.4rem;">
                </div>
            `).join('')}
        </div>
        <button onclick="this.parentElement.remove();" class="btn btn-secondary btn-sm mt-4" style="color: var(--error);">Remove Question</button>
    `;
    questionsBuilder.appendChild(div);

}


document.getElementById('add-question-btn').addEventListener('click', addQuestion);

document.getElementById('publish-btn').addEventListener('click', async () => {
    const title = document.getElementById('q-title').value.trim();
    const code = document.getElementById('q-code').value.trim();
    const password = document.getElementById('q-password').value.trim();
    const timeLimit = document.getElementById('q-time').value;

    if (!title || !code) {
        AppUI.notify('Title and Code are required', 'error');
        return;
    }

    const qCards = document.querySelectorAll('#questions-builder > div');
    const quizQuestions = [];

    qCards.forEach(card => {
        const text = card.querySelector('.q-text').value.trim();
        const optInputs = card.querySelectorAll('.opt-text');
        const correctIdx = card.querySelector('input[type="radio"]:checked').value;
        const options = [];

        optInputs.forEach((opt, idx) => {
            options.push({ text: opt.value.trim(), isCorrect: idx == correctIdx });
        });

        if (text) quizQuestions.push({ text, options });
    });

    if (quizQuestions.length === 0) {
        AppUI.notify('Add at least one question', 'error');
        return;
    }

    try {
        const url = currentEditingQuizId ? `/api/admin/quizzes/${currentEditingQuizId}` : '/api/admin/quizzes';
        const method = currentEditingQuizId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify({
                title, code, password, time_limit: timeLimit, questions: quizQuestions
            })
        });

        if (response.ok) {
            AppUI.notify(currentEditingQuizId ? 'Quiz updated successfully!' : 'Quiz published successfully!');
            setTimeout(() => location.reload(), 1500);
        } else {
            const err = await response.json();
            AppUI.notify(err.error || 'Failed to save quiz', 'error');
        }
    } catch (e) {
        AppUI.notify('Server error', 'error');
    }
});

window.logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
};

init();
