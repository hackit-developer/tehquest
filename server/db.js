const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Path logic: Store DB in the project root directory
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(path.join(dbDir, 'quiz.db'));

db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    password TEXT,
    time_limit INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    type TEXT DEFAULT 'mcq',
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    student_roll TEXT,
    student_phone TEXT,
    student_dept TEXT,
    student_year TEXT,
    student_section TEXT,
    student_email TEXT,
    score INTEGER DEFAULT 0,
    is_disqualified BOOLEAN DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  );

  -- Add column if it doesn't exist (for existing databases)
  -- SQLite does not support IF NOT EXISTS for ADD COLUMN directly in all versions, 
  -- but we can use a safe approach or just a try-catch in JS.
`);

const columns = [
  'student_phone',
  'student_dept',
  'student_year',
  'student_section',
  'student_email',
  'active_time',
  'started_at',
  'tab_switches'
];

columns.forEach(col => {
  try {
    db.exec(`ALTER TABLE submissions ADD COLUMN ${col} TEXT`);
  } catch (e) {
    // Column likely already exists
  }
});

module.exports = db;
