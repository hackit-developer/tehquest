const db = require('./server/db');

const quizData = {
    title: "Web Development & Programming Quiz (Premium)",
    description: "A comprehensive quiz covering HTML, CSS, JavaScript, Python, and C (50 Questions).",
    code: "WEB50",
    password: null,
    time_limit: 60,
    questions: [
        {
            text: "In HTML5, which attribute is used on a <video> element to specify an image to be shown while the video is downloading?",
            options: [
                { text: "poster", isCorrect: true },
                { text: "thumbnail", isCorrect: false },
                { text: "preview", isCorrect: false },
                { text: "image", isCorrect: false }
            ]
        },
        {
            text: "What is the CSS output for div { display: flex; justify-content: center; } on three child elements with equal width?",
            options: [
                { text: "Elements stack vertically", isCorrect: false },
                { text: "Elements align horizontally in the center", isCorrect: true },
                { text: "Elements overlap in the top-left", isCorrect: false },
                { text: "No change from default", isCorrect: false }
            ]
        },
        {
            text: "In JavaScript, what does console.log(typeof null); output?",
            options: [
                { text: "null", isCorrect: false },
                { text: "object", isCorrect: true },
                { text: "undefined", isCorrect: false },
                { text: "string", isCorrect: false }
            ]
        },
        {
            text: "Python: What is the output of print([1, 2, 3][::-1])?",
            options: [
                { text: "[1, 2, 3]", isCorrect: false },
                { text: "[3, 2, 1]", isCorrect: true },
                { text: "Error", isCorrect: false },
                { text: "[]", isCorrect: false }
            ]
        },
        {
            text: "In C, what is the output of printf(\"%d\", sizeof(int*)); on a 64-bit system?",
            options: [
                { text: "2", isCorrect: false },
                { text: "4", isCorrect: false },
                { text: "8", isCorrect: true },
                { text: "Depends on compiler", isCorrect: false }
            ]
        },
        {
            text: "HTML: Which selector targets all <p> elements inside a class .container using CSS?",
            options: [
                { text: ".container p", isCorrect: true },
                { text: "p.container", isCorrect: false },
                { text: ".container > p", isCorrect: false },
                { text: "p > .container", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: What does let x = 5; { let x = 10; } console.log(x); output?",
            options: [
                { text: "10", isCorrect: false },
                { text: "5", isCorrect: true },
                { text: "Error", isCorrect: false },
                { text: "undefined", isCorrect: false }
            ]
        },
        {
            text: "Python: Output of def func(a=1): print(a); func(2)?",
            options: [
                { text: "1", isCorrect: false },
                { text: "2", isCorrect: true },
                { text: "Error", isCorrect: false },
                { text: "None", isCorrect: false }
            ]
        },
        {
            text: "C: What does int arr[] = {1,2}; printf(\"%d\", arr[2]); output?",
            options: [
                { text: "2", isCorrect: false },
                { text: "Garbage value", isCorrect: true },
                { text: "0", isCorrect: false },
                { text: "Compile error", isCorrect: false }
            ]
        },
        {
            text: "CSS: p { margin: 10px 20px; } sets margins as?",
            options: [
                { text: "top/bottom 10px, left/right 20px", isCorrect: true },
                { text: "top 10px, right 20px, bottom 10px, left 20px", isCorrect: false },
                { text: "All sides 10px except right 20px", isCorrect: false },
                { text: "Padding instead", isCorrect: false }
            ]
        },
        {
            text: "HTML: What does <meta charset=\"UTF-8\"> do?",
            options: [
                { text: "Sets font encoding", isCorrect: false },
                { text: "Defines page title", isCorrect: false },
                { text: "Specifies character encoding", isCorrect: true },
                { text: "Adds favicon", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: What is the output of '2' + 2 * '3'?",
            options: [
                { text: "8", isCorrect: false },
                { text: "\"26\"", isCorrect: true },
                { text: "\"23\"", isCorrect: false },
                { text: "NaN", isCorrect: false }
            ]
        },
        {
            text: "Python: x = [1,2]; x.append(x); print(x) outputs?",
            options: [
                { text: "[1, 2, [...]]", isCorrect: true },
                { text: "[1, 2]", isCorrect: false },
                { text: "Error", isCorrect: false },
                { text: "[1, 2, [1, 2]]", isCorrect: false }
            ]
        },
        {
            text: "C: char *s = \"hello\"; s[0] = 'H'; results in?",
            options: [
                { text: "\"Hello\"", isCorrect: false },
                { text: "Undefined behavior", isCorrect: true },
                { text: "Compile error", isCorrect: false },
                { text: "Runtime error", isCorrect: false }
            ]
        },
        {
            text: "CSS: Which property creates a flexbox gap?",
            options: [
                { text: "space-between", isCorrect: false },
                { text: "gap", isCorrect: true },
                { text: "margin-gap", isCorrect: false },
                { text: "padding-gap", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: function foo(){ return arguments[0]; } foo(1,2) returns?",
            options: [
                { text: "1", isCorrect: true },
                { text: "2", isCorrect: false },
                { text: "undefined", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "Python: Output of print({1: 'a', 1: 'b'}[1])?",
            options: [
                { text: "'a'", isCorrect: false },
                { text: "'b'", isCorrect: true },
                { text: "KeyError", isCorrect: false },
                { text: "TypeError", isCorrect: false }
            ]
        },
        {
            text: "C: int x=5; printf(\"%d\", x++ + ++x); (undefined order, but common output)?",
            options: [
                { text: "11", isCorrect: false },
                { text: "12", isCorrect: false },
                { text: "10", isCorrect: false },
                { text: "Undefined", isCorrect: true }
            ]
        },
        {
            text: "HTML/CSS: position: fixed; removes element from?",
            options: [
                { text: "Document flow", isCorrect: true },
                { text: "Visibility", isCorrect: false },
                { text: "Animation queue", isCorrect: false },
                { text: "Event listeners", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: Promise.resolve(1).then(x => x*2) result?",
            options: [
                { text: "1 (immediate)", isCorrect: false },
                { text: "Promise<2>", isCorrect: true },
                { text: "Error", isCorrect: false },
                { text: "undefined", isCorrect: false }
            ]
        },
        {
            text: "In CSS, how are comments added?",
            options: [
                { text: "// This is a comment", isCorrect: false },
                { text: "<!-- This is a comment -->", isCorrect: false },
                { text: "/* This is a comment */", isCorrect: true },
                { text: "# This is a comment", isCorrect: false }
            ]
        },
        {
            text: "What is the default value of the CSS position property?",
            options: [
                { text: "relative", isCorrect: false },
                { text: "absolute", isCorrect: false },
                { text: "fixed", isCorrect: false },
                { text: "static", isCorrect: true }
            ]
        },
        {
            text: "Which HTML attribute is used to specify advisory information about an element, often shown as a tooltip?",
            options: [
                { text: "alt", isCorrect: false },
                { text: "title", isCorrect: true },
                { text: "tooltip", isCorrect: false },
                { text: "info", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: Output of (function(a){return (function(){console.log(a); a = 6;})();})(21);",
            options: [
                { text: "21", isCorrect: true },
                { text: "6", isCorrect: false },
                { text: "undefined", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "Python: Output of x = \"Python\"; print(x[1])?",
            options: [
                { text: "P", isCorrect: false },
                { text: "y", isCorrect: true },
                { text: "t", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "Python: Output of the loop x = 2; while x < 5: print(x); x += 1?",
            options: [
                { text: "2 3 4 5", isCorrect: false },
                { text: "2 3 4", isCorrect: true },
                { text: "1 2 3 4", isCorrect: false },
                { text: "Infinite", isCorrect: false }
            ]
        },
        {
            text: "C: For int num1=15, num2=10; if(num1 > num2) printf(\"Num1 is big..\"); if(num1 = num2) printf(\"Num1 and Num2 are equal.\"); output?",
            options: [
                { text: "Num1 is big.", isCorrect: false },
                { text: "Num1 and Num2 are equal.", isCorrect: false },
                { text: "Num1 is big..Num1 and Num2 are equal.", isCorrect: true },
                { text: "Syntax error", isCorrect: false }
            ]
        },
        {
            text: "CSS: Specificity value of an ID selector?",
            options: [
                { text: "1", isCorrect: false },
                { text: "10", isCorrect: false },
                { text: "100", isCorrect: true },
                { text: "1000", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: Output of const obj = { a: 'one', b: 'two', a: 'three' }; console.log(obj);?",
            options: [
                { text: "{ a: \"one\", b: \"two\" }", isCorrect: false },
                { text: "{ b: \"two\", a: \"three\" }", isCorrect: false },
                { text: "{ a: \"three\", b: \"two\" }", isCorrect: true },
                { text: "SyntaxError", isCorrect: false }
            ]
        },
        {
            text: "Python: def add(a, b=3): return a + b; print(add(5)) outputs?",
            options: [
                { text: "5", isCorrect: false },
                { text: "8", isCorrect: true },
                { text: "Error", isCorrect: false },
                { text: "None", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: Output of let a = 2; if(a > 3) { console.log('Yes'); } else { console.log('No'); }?",
            options: [
                { text: "Yes", isCorrect: false },
                { text: "No", isCorrect: true },
                { text: "Undefined", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: What does Math.max() < Math.min() evaluate to initially?",
            options: [
                { text: "true", isCorrect: true },
                { text: "false", isCorrect: false },
                { text: "NaN", isCorrect: false },
                { text: "0", isCorrect: false }
            ]
        },
        {
            text: "C: Output possibility for code with undefined behavior like post/pre-increment mixing?",
            options: [
                { text: "Always 11", isCorrect: false },
                { text: "Always 12", isCorrect: false },
                { text: "Cannot be predicted", isCorrect: true },
                { text: "Compile error", isCorrect: false }
            ]
        },
        {
            text: "Python: Which keyword defines functions?",
            options: [
                { text: "function", isCorrect: false },
                { text: "def", isCorrect: true },
                { text: "fun", isCorrect: false },
                { text: "define", isCorrect: false }
            ]
        },
        {
            text: "In CSS, how do you select an element with the id 'container'?",
            options: [
                { text: ".container", isCorrect: false },
                { text: "#container", isCorrect: true },
                { text: "container", isCorrect: false },
                { text: "*container", isCorrect: false }
            ]
        },
        {
            text: "Which JavaScript keyword is used to declare a constant variable?",
            options: [
                { text: "var", isCorrect: false },
                { text: "let", isCorrect: false },
                { text: "const", isCorrect: true },
                { text: "constant", isCorrect: false }
            ]
        },
        {
            text: "C: In int i=1; while(i<=10); { printf(\"%d\",i); i++; } what happens?",
            options: [
                { text: "Prints 1 to 10", isCorrect: false },
                { text: "Infinite loop", isCorrect: true },
                { text: "Prints nothing", isCorrect: false },
                { text: "Syntax error", isCorrect: false }
            ]
        },
        {
            text: "Python comments use?",
            options: [
                { text: "//", isCorrect: false },
                { text: "/* */", isCorrect: false },
                { text: "#", isCorrect: true },
                { text: "<!-- -->", isCorrect: false }
            ]
        },
        {
            text: "CSS: Specificity of a tag selector?",
            options: [
                { text: "0", isCorrect: false },
                { text: "1", isCorrect: true },
                { text: "10", isCorrect: false },
                { text: "100", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: var x=12; var y=8; var res=eval(\"x+y\"); outputs?",
            options: [
                { text: "20", isCorrect: true },
                { text: "\"12+8\"", isCorrect: false },
                { text: "Error", isCorrect: false },
                { text: "undefined", isCorrect: false }
            ]
        },
        {
            text: "Python: greet(\"Alice\") where def greet(name): print(\"Hello,\", name) returns?",
            options: [
                { text: "Hello Alice (no newline)", isCorrect: false },
                { text: "Hello, Alice", isCorrect: true },
                { text: "None", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "JavaScript for loop parts order?",
            options: [
                { text: "Initializer, Condition, Incrementer", isCorrect: true },
                { text: "Condition, Incrementer, Initializer", isCorrect: false },
                { text: "Incrementer, Initializer, Condition", isCorrect: false },
                { text: "Condition, Initializer, Incrementer", isCorrect: false }
            ]
        },
        {
            text: "CSS property for space between text lines?",
            options: [
                { text: "margin", isCorrect: false },
                { text: "padding", isCorrect: false },
                { text: "line-height", isCorrect: true },
                { text: "letter-spacing", isCorrect: false }
            ]
        },
        {
            text: "Python: Which of these is the correct way to create a list?",
            options: [
                { text: "x = (1, 2, 3)", isCorrect: false },
                { text: "x = {1, 2, 3}", isCorrect: false },
                { text: "x = [1, 2, 3]", isCorrect: true },
                { text: "x = list{1, 2, 3}", isCorrect: false }
            ]
        },
        {
            text: "JavaScript: Highest priority in conflicting styles (class, ID, inline)?",
            options: [
                { text: "Class", isCorrect: false },
                { text: "ID", isCorrect: false },
                { text: "Inline", isCorrect: true },
                { text: "Class highest", isCorrect: false }
            ]
        },
        {
            text: "Python: print(add(5,3)) where def add(a,b): return a+b?",
            options: [
                { text: "5 3", isCorrect: false },
                { text: "8", isCorrect: true },
                { text: "None", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "C: Nested if without braces leads to?",
            options: [
                { text: "Always first if", isCorrect: false },
                { text: "Associativity issues", isCorrect: true },
                { text: "Syntax error", isCorrect: false },
                { text: "No issue", isCorrect: false }
            ]
        },
        {
            text: "In C, which format specifier is used to print an integer?",
            options: [
                { text: "%f", isCorrect: false },
                { text: "%s", isCorrect: false },
                { text: "%c", isCorrect: false },
                { text: "%d", isCorrect: true }
            ]
        },
        {
            text: "JavaScript: Binary search-like code output for n=24?",
            options: [
                { text: "4", isCorrect: true },
                { text: "5", isCorrect: false },
                { text: "6", isCorrect: false },
                { text: "Error", isCorrect: false }
            ]
        },
        {
            text: "Default display value of HTML <div>?",
            options: [
                { text: "inline", isCorrect: false },
                { text: "inline-block", isCorrect: false },
                { text: "block", isCorrect: true },
                { text: "flex", isCorrect: false }
            ]
        }
    ]
};

try {
    // Clean up existing quiz with the same code to allow re-seeding
    db.prepare('DELETE FROM quizzes WHERE code = ?').run(quizData.code);

    const insertQuiz = db.prepare('INSERT INTO quizzes (title, description, code, password, time_limit) VALUES (?, ?, ?, ?, ?)');

    const quizResult = insertQuiz.run(quizData.title, quizData.description, quizData.code, quizData.password, quizData.time_limit);
    const quizId = quizResult.lastInsertRowid;

    const insertQuestion = db.prepare('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)');
    const insertOption = db.prepare('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        for (const q of quizData.questions) {
            const qResult = insertQuestion.run(quizId, q.text);
            const questionId = qResult.lastInsertRowid;

            for (const opt of q.options) {
                insertOption.run(questionId, opt.text, opt.isCorrect ? 1 : 0);
            }
        }
    });

    transaction();
    console.log(`Successfully seeded quiz: ${quizData.title} (Code: ${quizData.code})`);
} catch (err) {
    console.error('Error seeding data:', err.message);
}
