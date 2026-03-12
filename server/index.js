const cluster = require('node:cluster');
const os = require('node:os');
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false, 
}));
app.use(cors());

// 3. Compression (Gzip/Brotli)
app.use(compression({
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// 4. Rate Limiting (Prevent flood)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 100, // Limit each IP to 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// 5. Optimized JSON/Static
app.use(express.json({ limit: '1mb' })); // Increased limit for large quizzes

const staticOptions = {
    dotfiles: 'ignore',
    etag: true,
    maxAge: '1d', // Cache static files for 1 day
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        }
    }
};
app.use(express.static(path.join(__dirname, '../public'), staticOptions));

// Security Constants
const ADMIN_CONFIG = {
    username: 'loginbysp',
    password: 'sureshit2005',
    token: 'super-secret-admin-token'
};

// Middleware: Admin Auth
const authenticateAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === ADMIN_CONFIG.token) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Admin access required' });
    }
};

// --- AUTH ROUTES ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
        res.json({ success: true, token: ADMIN_CONFIG.token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// --- STUDENT ROUTES ---
app.get('/api/quizzes/:code', (req, res) => {
    try {
        const { password } = req.query;
        const quiz = db.prepare('SELECT * FROM quizzes WHERE code = ?').get(req.params.code);

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        if (quiz.password && quiz.password !== password) {
            return res.status(401).json({ error: 'Incorrect quiz password' });
        }

        let questions = db.prepare('SELECT id, question_text FROM questions WHERE quiz_id = ?').all(quiz.id);

        // Shuffle questions on server side as well
        questions = shuffleArray(questions);

        for (const q of questions) {
            let options = db.prepare('SELECT id, option_text FROM options WHERE question_id = ?').all(q.id);
            q.options = shuffleArray(options);
        }

        res.json({
            id: quiz.id,
            title: quiz.title,
            time_limit: quiz.time_limit,
            questions: questions
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/quizzes/:id/check-student', (req, res) => {
    try {
        const { roll } = req.query;
        const quizId = req.params.id;

        if (!roll) return res.status(400).json({ error: 'Roll number required' });

        const existing = db.prepare(`
                SELECT is_disqualified FROM submissions 
                WHERE quiz_id = ? AND student_roll = ?
                ORDER BY submitted_at DESC LIMIT 1
            `).get(quizId, roll);

        res.json({ existing: !!existing, isDisqualified: existing ? !!existing.is_disqualified : false });
    } catch (err) {
        res.status(500).json({ error: 'Check failed' });
    }
});

app.post('/api/quizzes/:id/submit', (req, res) => {
    try {
        const {
            studentName, studentRoll, studentPhone,
            studentDept, studentYear, studentSection, studentEmail,
            answers, isDisqualified, activeTime, startedAt, tabSwitches
        } = req.body;
        const quizId = req.params.id;

        if (!studentName || !studentRoll || !studentPhone || !studentDept || !studentYear || !studentSection || !studentEmail) {
            return res.status(400).json({ error: 'Missing student details' });
        }

        console.log(`[SUBMISSION] Quiz: ${quizId}, Student: ${studentRoll}, ActiveTime: ${activeTime}, StartedAt: ${startedAt}`);

        let score = 0;
        const questions = db.prepare('SELECT id FROM questions WHERE quiz_id = ?').all(quizId);

        if (!isDisqualified) {
            for (const q of questions) {
                const correctOption = db.prepare('SELECT id FROM options WHERE question_id = ? AND is_correct = 1').get(q.id);
                const studentAnswer = answers.find(a => a.questionId == q.id);

                if (correctOption && studentAnswer && studentAnswer.optionId == correctOption.id) {
                    score++;
                }
            }
        }

        db.prepare(`
                INSERT INTO submissions (
                    quiz_id, student_name, student_roll, student_phone, 
                    student_dept, student_year, student_section, student_email,
                    score, is_disqualified, submitted_at, active_time, started_at, tab_switches
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
            quizId, studentName, studentRoll, studentPhone,
            studentDept, studentYear, studentSection, studentEmail,
            score, isDisqualified ? 1 : 0, new Date().toISOString(), parseInt(activeTime) || 0, startedAt, tabSwitches || 0
        );

        res.json({ success: true, score, total: questions.length });
    } catch (err) {
        res.status(500).json({ error: 'Submission failed' });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/quizzes', authenticateAdmin, (req, res) => {
    const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY created_at DESC').all();
    res.json(quizzes);
});

app.get('/api/admin/quizzes/:id/submissions', authenticateAdmin, (req, res) => {
    const submissions = db.prepare(`
            SELECT * FROM submissions 
            WHERE quiz_id = ? 
            ORDER BY score DESC, submitted_at ASC
        `).all(req.params.id);
    res.json(submissions);
});

app.get('/api/admin/quizzes/:id', authenticateAdmin, (req, res) => {
    try {
        const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz.id);
        for (const q of questions) {
            q.options = db.prepare('SELECT * FROM options WHERE question_id = ?').all(q.id);
        }

        res.json({ ...quiz, questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/quizzes', authenticateAdmin, (req, res) => {
    const { title, description, code, password, time_limit, questions } = req.body;

    try {
        const transaction = db.transaction(() => {
            const quiz = db.prepare(`
                    INSERT INTO quizzes (title, description, code, password, time_limit)
                    VALUES (?, ?, ?, ?, ?)
                `).run(title, description, code, password, time_limit);

            const quizId = quiz.lastInsertRowid;

            const qStmt = db.prepare('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)');
            const oStmt = db.prepare('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)');

            for (const q of questions) {
                const qResult = qStmt.run(quizId, q.text);
                const qId = qResult.lastInsertRowid;

                for (const opt of q.options) {
                    oStmt.run(qId, opt.text, opt.isCorrect ? 1 : 0);
                }
            }
            return quizId;
        });

        const quizId = transaction();
        res.json({ success: true, quizId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/quizzes/:id', authenticateAdmin, (req, res) => {
    const { title, description, code, password, time_limit, questions } = req.body;

    try {
        const transaction = db.transaction(() => {
            // Update quiz meta
            db.prepare(`
                    UPDATE quizzes 
                    SET title = ?, description = ?, code = ?, password = ?, time_limit = ?
                    WHERE id = ?
                `).run(title, description, code, password, time_limit, req.params.id);

            // Clear old questions (CASCADE will clear options)
            db.prepare('DELETE FROM questions WHERE quiz_id = ?').run(req.params.id);

            // Re-insert questions/options
            const qStmt = db.prepare('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)');
            const oStmt = db.prepare('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)');

            for (const q of questions) {
                const qResult = qStmt.run(req.params.id, q.text);
                const qId = qResult.lastInsertRowid;

                for (const opt of q.options) {
                    oStmt.run(qId, opt.text, opt.isCorrect ? 1 : 0);
                }
            }
        });

        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/quizzes/:id/submissions', authenticateAdmin, (req, res) => {
    try {
        db.prepare('DELETE FROM submissions WHERE quiz_id = ?').run(req.params.id);
        res.json({ success: true, message: 'History cleared successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Tuning for High Concurrency
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

