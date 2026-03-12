const db = require('./server/db');

const contests = [
    {
        title: "Web Development & Programming Quiz (Premium)",
        description: "A comprehensive quiz covering HTML, CSS, JavaScript, Python, and C (50 Questions).",
        code: "WEB50",
        password: null,
        time_limit: 30,
        questions: [
            { text: "In HTML5, which attribute is used on a <video> element to specify an image to be shown while the video is downloading?", options: [{ text: "poster", isCorrect: true }, { text: "thumbnail", isCorrect: false }, { text: "preview", isCorrect: false }, { text: "image", isCorrect: false }] },
            { text: "What is the CSS output for div { display: flex; justify-content: center; } on three child elements with equal width?", options: [{ text: "Elements stack vertically", isCorrect: false }, { text: "Elements align horizontally in the center", isCorrect: true }, { text: "Elements overlap in the top-left", isCorrect: false }, { text: "No change from default", isCorrect: false }] },
            { text: "In JavaScript, what does console.log(typeof null); output?", options: [{ text: "null", isCorrect: false }, { text: "object", isCorrect: true }, { text: "undefined", isCorrect: false }, { text: "string", isCorrect: false }] },
            { text: "Python: What is the output of print([1, 2, 3][::-1])?", options: [{ text: "[1, 2, 3]", isCorrect: false }, { text: "[3, 2, 1]", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "[]", isCorrect: false }] },
            { text: "In C, what is the output of printf(\"%d\", sizeof(int*)); on a 64-bit system?", options: [{ text: "2", isCorrect: false }, { text: "4", isCorrect: false }, { text: "8", isCorrect: true }, { text: "Depends on compiler", isCorrect: false }] },
            { text: "HTML: Which selector targets all <p> elements inside a class .container using CSS?", options: [{ text: ".container p", isCorrect: true }, { text: "p.container", isCorrect: false }, { text: ".container > p", isCorrect: false }, { text: "p > .container", isCorrect: false }] },
            { text: "JavaScript: What does let x = 5; { let x = 10; } console.log(x); output?", options: [{ text: "10", isCorrect: false }, { text: "5", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "undefined", isCorrect: false }] },
            { text: "Python: Output of def func(a=1): print(a); func(2)?", options: [{ text: "1", isCorrect: false }, { text: "2", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "None", isCorrect: false }] },
            { text: "C: What does int arr[] = {1,2}; printf(\"%d\", arr[2]); output?", options: [{ text: "2", isCorrect: false }, { text: "Garbage value", isCorrect: true }, { text: "0", isCorrect: false }, { text: "Compile error", isCorrect: false }] },
            { text: "CSS: p { margin: 10px 20px; } sets margins as?", options: [{ text: "top/bottom 10px, left/right 20px", isCorrect: true }, { text: "top 10px, right 20px, bottom 10px, left 20px", isCorrect: false }, { text: "All sides 10px except right 20px", isCorrect: false }, { text: "Padding instead", isCorrect: false }] },
            { text: "HTML: What does <meta charset=\"UTF-8\"> do?", options: [{ text: "Sets font encoding", isCorrect: false }, { text: "Defines page title", isCorrect: false }, { text: "Specifies character encoding", isCorrect: true }, { text: "Adds favicon", isCorrect: false }] },
            { text: "JavaScript: What is the output of '2' + 2 * '3'?", options: [{ text: "8", isCorrect: false }, { text: "\"26\"", isCorrect: true }, { text: "\"23\"", isCorrect: false }, { text: "NaN", isCorrect: false }] },
            { text: "Python: x = [1,2]; x.append(x); print(x) outputs?", options: [{ text: "[1, 2, [...]]", isCorrect: true }, { text: "[1, 2]", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "[1, 2, [1, 2]]", isCorrect: false }] },
            { text: "C: char *s = \"hello\"; s[0] = 'H'; results in?", options: [{ text: "\"Hello\"", isCorrect: false }, { text: "Undefined behavior", isCorrect: true }, { text: "Compile error", isCorrect: false }, { text: "Runtime error", isCorrect: false }] },
            { text: "CSS: Which property creates a flexbox gap?", options: [{ text: "space-between", isCorrect: false }, { text: "gap", isCorrect: true }, { text: "margin-gap", isCorrect: false }, { text: "padding-gap", isCorrect: false }] },
            { text: "JavaScript: function foo(){ return arguments[0]; } foo(1,2) returns?", options: [{ text: "1", isCorrect: true }, { text: "2", isCorrect: false }, { text: "undefined", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Python: Output of print({1: 'a', 1: 'b'}[1])?", options: [{ text: "'a'", isCorrect: false }, { text: "'b'", isCorrect: true }, { text: "KeyError", isCorrect: false }, { text: "TypeError", isCorrect: false }] },
            { text: "C: int x=5; printf(\"%d\", x++ + ++x); (undefined order, but common output)?", options: [{ text: "11", isCorrect: false }, { text: "12", isCorrect: false }, { text: "10", isCorrect: false }, { text: "Undefined", isCorrect: true }] },
            { text: "HTML/CSS: position: fixed; removes element from?", options: [{ text: "Document flow", isCorrect: true }, { text: "Visibility", isCorrect: false }, { text: "Animation queue", isCorrect: false }, { text: "Event listeners", isCorrect: false }] },
            { text: "JavaScript: Promise.resolve(1).then(x => x*2) result?", options: [{ text: "1 (immediate)", isCorrect: false }, { text: "Promise<2>", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "undefined", isCorrect: false }] },
            { text: "In CSS, how are comments added?", options: [{ text: "// This is a comment", isCorrect: false }, { text: "<!-- This is a comment -->", isCorrect: false }, { text: "/* This is a comment */", isCorrect: true }, { text: "# This is a comment", isCorrect: false }] },
            { text: "What is the default value of the CSS position property?", options: [{ text: "relative", isCorrect: false }, { text: "absolute", isCorrect: false }, { text: "fixed", isCorrect: false }, { text: "static", isCorrect: true }] },
            { text: "Which HTML attribute is used to specify advisory information about an element, often shown as a tooltip?", options: [{ text: "alt", isCorrect: false }, { text: "title", isCorrect: true }, { text: "tooltip", isCorrect: false }, { text: "info", isCorrect: false }] },
            { text: "JavaScript: Output of (function(a){return (function(){console.log(a); a = 6;})();})(21);", options: [{ text: "21", isCorrect: true }, { text: "6", isCorrect: false }, { text: "undefined", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Python: Output of x = \"Python\"; print(x[1])?", options: [{ text: "P", isCorrect: false }, { text: "y", isCorrect: true }, { text: "t", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Python: Output of the loop x = 2; while x < 5: print(x); x += 1?", options: [{ text: "2 3 4 5", isCorrect: false }, { text: "2 3 4", isCorrect: true }, { text: "1 2 3 4", isCorrect: false }, { text: "Infinite", isCorrect: false }] },
            { text: "C: For int num1=15, num2=10; if(num1 > num2) printf(\"Num1 is big..\"); if(num1 = num2) printf(\"Num1 and Num2 are equal.\"); output?", options: [{ text: "Num1 is big.", isCorrect: false }, { text: "Num1 and Num2 are equal.", isCorrect: false }, { text: "Num1 is big..Num1 and Num2 are equal.", isCorrect: true }, { text: "Syntax error", isCorrect: false }] },
            { text: "CSS: Specificity value of an ID selector?", options: [{ text: "1", isCorrect: false }, { text: "10", isCorrect: false }, { text: "100", isCorrect: true }, { text: "1000", isCorrect: false }] },
            { text: "JavaScript: Output of const obj = { a: 'one', b: 'two', a: 'three' }; console.log(obj);?", options: [{ text: "{ a: \"one\", b: \"two\" }", isCorrect: false }, { text: "{ b: \"two\", a: \"three\" }", isCorrect: false }, { text: "{ a: \"three\", b: \"two\" }", isCorrect: true }, { text: "SyntaxError", isCorrect: false }] },
            { text: "Python: def add(a, b=3): return a + b; print(add(5)) outputs?", options: [{ text: "5", isCorrect: false }, { text: "8", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "None", isCorrect: false }] },
            { text: "JavaScript: let a = 2; if(a > 3) { console.log('Yes'); } else { console.log('No'); }?", options: [{ text: "Yes", isCorrect: false }, { text: "No", isCorrect: true }, { text: "Undefined", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "JavaScript: What does Math.max() < Math.min() evaluate to initially?", options: [{ text: "true", isCorrect: true }, { text: "false", isCorrect: false }, { text: "NaN", isCorrect: false }, { text: "0", isCorrect: false }] },
            { text: "C: Output possibility for code with undefined behavior like post/pre-increment mixing?", options: [{ text: "Always 11", isCorrect: false }, { text: "Always 12", isCorrect: false }, { text: "Cannot be predicted", isCorrect: true }, { text: "Compile error", isCorrect: false }] },
            { text: "Python: Which keyword defines functions?", options: [{ text: "function", isCorrect: false }, { text: "def", isCorrect: true }, { text: "fun", isCorrect: false }, { text: "define", isCorrect: false }] },
            { text: "In CSS, how do you select an element with the id 'container'?", options: [{ text: ".container", isCorrect: false }, { text: "#container", isCorrect: true }, { text: "container", isCorrect: false }, { text: "*container", isCorrect: false }] },
            { text: "Which JavaScript keyword is used to declare a constant variable?", options: [{ text: "var", isCorrect: false }, { text: "let", isCorrect: false }, { text: "const", isCorrect: true }, { text: "constant", isCorrect: false }] },
            { text: "C: In int i=1; while(i<=10); { printf(\"%d\",i); i++; } what happens?", options: [{ text: "Prints 1 to 10", isCorrect: false }, { text: "Infinite loop", isCorrect: true }, { text: "Prints nothing", isCorrect: false }, { text: "Syntax error", isCorrect: false }] },
            { text: "Python comments use?", options: [{ text: "//", isCorrect: false }, { text: "/* */", isCorrect: false }, { text: "#", isCorrect: true }, { text: "<!-- -->", isCorrect: false }] },
            { text: "CSS: Specificity of a tag selector?", options: [{ text: "0", isCorrect: false }, { text: "1", isCorrect: true }, { text: "10", isCorrect: false }, { text: "100", isCorrect: false }] },
            { text: "JavaScript: var x=12; var y=8; var res=eval(\"x+y\"); outputs?", options: [{ text: "20", isCorrect: true }, { text: "\"12+8\"", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "undefined", isCorrect: false }] },
            { text: "Python: greet(\"Alice\") where def greet(name): print(\"Hello,\", name) returns?", options: [{ text: "Hello Alice (no newline)", isCorrect: false }, { text: "Hello, Alice", isCorrect: true }, { text: "None", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "JavaScript for loop parts order?", options: [{ text: "Initializer, Condition, Incrementer", isCorrect: true }, { text: "Condition, Incrementer, Initializer", isCorrect: false }, { text: "Incrementer, Initializer, Condition", isCorrect: false }, { text: "Condition, Initializer, Incrementer", isCorrect: false }] },
            { text: "CSS property for space between text lines?", options: [{ text: "margin", isCorrect: false }, { text: "padding", isCorrect: false }, { text: "line-height", isCorrect: true }, { text: "letter-spacing", isCorrect: false }] },
            { text: "Python: Which of these is the correct way to create a list?", options: [{ text: "x = (1, 2, 3)", isCorrect: false }, { text: "x = {1, 2, 3}", isCorrect: false }, { text: "x = [1, 2, 3]", isCorrect: true }, { text: "x = list{1, 2, 3}", isCorrect: false }] },
            { text: "JavaScript: Highest priority in conflicting styles (class, ID, inline)?", options: [{ text: "Class", isCorrect: false }, { text: "ID", isCorrect: false }, { text: "Inline", isCorrect: true }, { text: "Class highest", isCorrect: false }] },
            { text: "Python: print(add(5,3)) where def add(a,b): return a+b?", options: [{ text: "5 3", isCorrect: false }, { text: "8", isCorrect: true }, { text: "None", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "C: Nested if without braces leads to?", options: [{ text: "Always first if", isCorrect: false }, { text: "Associativity issues", isCorrect: true }, { text: "Syntax error", isCorrect: false }, { text: "No issue", isCorrect: false }] },
            { text: "In C, which format specifier is used to print an integer?", options: [{ text: "%f", isCorrect: false }, { text: "%s", isCorrect: false }, { text: "%c", isCorrect: false }, { text: "%d", isCorrect: true }] },
            { text: "JavaScript: Binary search-like code output for n=24?", options: [{ text: "4", isCorrect: true }, { text: "5", isCorrect: false }, { text: "6", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Default display value of HTML <div>?", options: [{ text: "inline", isCorrect: false }, { text: "inline-block", isCorrect: false }, { text: "block", isCorrect: true }, { text: "flex", isCorrect: false }] }
        ]
    },
    {
        title: "catch",
        description: "IT Special Contest - catchbyit (50 Questions)",
        code: "IT2327",
        password: null,
        time_limit: 30,
        questions: [
            { text: "Output of printf(\"%d\", sizeof(\"hello\"));?", options: [{ text: "5", isCorrect: false }, { text: "6 (null term)", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "10", isCorrect: false }] },
            { text: "int a=5, b=3; printf(\"%d\", a+++b);?", options: [{ text: "8", isCorrect: true }, { text: "9", isCorrect: false }, { text: "7", isCorrect: false }, { text: "Undefined", isCorrect: false }] },
            { text: "Java: String s=\"abc\"; s.concat(\"d\"); System.out.println(s);?", options: [{ text: "abcd", isCorrect: false }, { text: "abc (immut)", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "null", isCorrect: false }] },
            { text: "C: int x=5; printf(\"%d\", ++x * x++);?", options: [{ text: "30", isCorrect: false }, { text: "36", isCorrect: false }, { text: "UB", isCorrect: true }, { text: "25", isCorrect: false }] },
            { text: "Python: def f(x): return x**2; print(f(3))?", options: [{ text: "6", isCorrect: false }, { text: "9", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "3**2", isCorrect: false }] },
            { text: "Java: List<Integer> list = Arrays.asList(1,2); list.add(3);?", options: [{ text: "OK", isCorrect: false }, { text: "UnsupportedOperation", isCorrect: true }, { text: "Null", isCorrect: false }, { text: "Compile error", isCorrect: false }] },
            { text: "C: char *str=\"hi\"; str++; printf(\"%s\",str);?", options: [{ text: "hi", isCorrect: false }, { text: "i", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Garbage", isCorrect: false }] },
            { text: "Python: {i:i**2 for i in range(3)}?", options: [{ text: "{0:0,1:1,2:4}", isCorrect: true }, { text: "{}", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "{0,1,4}", isCorrect: false }] },
            { text: "Java: int x[] = {1,2,3}; System.out.println(x[1]);?", options: [{ text: "1", isCorrect: false }, { text: "2", isCorrect: true }, { text: "3", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "C: switch(2){case 2: printf(\"2\"); case 1: printf(\"1\");} outputs?", options: [{ text: "2", isCorrect: false }, { text: "21", isCorrect: true }, { text: "1", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Python: try: int(\"abc\") except ValueError: print(\"VE\")?", options: [{ text: "abc", isCorrect: false }, { text: "VE", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "0", isCorrect: false }] },
            { text: "Java: class A{}; class B extends A{} valid?", options: [{ text: "No multiple inherit", isCorrect: false }, { text: "Yes single", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Interface needed", isCorrect: false }] },
            { text: "C: int a[2][3] = {{1,2,3},{4,5}}; printf(\"%d\",a[1][2]);?", options: [{ text: "5", isCorrect: false }, { text: "0", isCorrect: true }, { text: "Garbage", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Python: exec(\"print('hi')\")?", options: [{ text: "hi", isCorrect: true }, { text: "exec", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "String", isCorrect: false }] },
            { text: "Java: Map<String,Integer> m = new HashMap<>(); m.put(\"a\",1); m.get(\"a\");?", options: [{ text: "1", isCorrect: true }, { text: "null", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "\"a\"", isCorrect: false }] },
            { text: "C: void main(){} modern compiler?", options: [{ text: "OK", isCorrect: false }, { text: "int main warning", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Void return", isCorrect: false }] },
            { text: "Python: itertools.product([1],[2]) first?", options: [{ text: "(1,2)", isCorrect: true }, { text: "[]", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "product", isCorrect: false }] },
            { text: "Java: for(String s: args) {} iterates?", options: [{ text: "args array", isCorrect: true }, { text: "Single arg", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "int", isCorrect: false }] },
            { text: "Output of int x=4; printf(\"%d\", x<<1);?", options: [{ text: "4", isCorrect: false }, { text: "8", isCorrect: true }, { text: "2", isCorrect: false }, { text: "Error", isCorrect: false }] },
            { text: "Python: d.get('key', 'default') if no key?", options: [{ text: "KeyError", isCorrect: false }, { text: "None", isCorrect: false }, { text: "'default'", isCorrect: true }, { text: "Error", isCorrect: false }] },
            { text: "Java: Thread t = new Thread(); t.start();?", options: [{ text: "Runs run()", isCorrect: true }, { text: "Error no run", isCorrect: false }, { text: "Infinite", isCorrect: false }, { text: "Compile error", isCorrect: false }] },
            { text: "Java: int[][] arr = new int[2][]; arr[0] = new int[3]; arr[0][1]++; System.out.print(arr[0][1]);?", options: [{ text: "0", isCorrect: false }, { text: "1", isCorrect: true }, { text: "NullPointer", isCorrect: false }, { text: "Compile error", isCorrect: false }] },
            { text: "Python: * unpacking print(*(1,2))`?", options: [{ text: "(1,2)", isCorrect: false }, { text: "1 2", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "*1 2", isCorrect: false }] },
            { text: "Java: Integer i=10; int j=i;?", options: [{ text: "Autounbox", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Null", isCorrect: false }, { text: "Object", isCorrect: false }] },
            { text: "C: int (*p)[5]; pointer to?", options: [{ text: "int array", isCorrect: true }, { text: "Array of pointers", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "5 ints", isCorrect: false }] },
            { text: "Python: from math import *; sqrt(16)?", options: [{ text: "4.0", isCorrect: true }, { text: "Error import", isCorrect: false }, { text: "16", isCorrect: false }, { text: "math.sqrt", isCorrect: false }] },
            { text: "Java: @Override public void equals(Object o){}?", options: [{ text: "Annotation check", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Ignore", isCorrect: false }, { text: "Static", isCorrect: false }] },
            { text: "C: memset(arr, 0, sizeof(arr)); for int arr?", options: [{ text: "All zero", isCorrect: true }, { text: "First zero", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Garbage", isCorrect: false }] },
            { text: "Python: property decorator for?", options: [{ text: "Getter/setter", isCorrect: true }, { text: "Static", isCorrect: false }, { text: "Abstract", isCorrect: false }, { text: "Final", isCorrect: false }] },
            { text: "Java: Collections.sort(list); needs?", options: [{ text: "Comparable", isCorrect: true }, { text: "CompareTo", isCorrect: false }, { text: "Both", isCorrect: false }, { text: "No", isCorrect: false }] },
            { text: "C: volatile int x;?", options: [{ text: "No optimize", isCorrect: true }, { text: "Const", isCorrect: false }, { text: "Static", isCorrect: false }, { text: "Thread", isCorrect: false }] },
            { text: "Python: dataclasses.dataclass?", options: [{ text: "Auto init/eq", isCorrect: true }, { text: "List", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Dict", isCorrect: false }] },
            { text: "Java: enum Day {MONDAY}; Day d=Day.MONDAY;?", options: [{ text: "OK", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "String", isCorrect: false }, { text: "int", isCorrect: false }] },
            { text: "C: fopen(\"file\",\"r\") mode?", options: [{ text: "Read", isCorrect: true }, { text: "Write", isCorrect: false }, { text: "Append", isCorrect: false }, { text: "Binary", isCorrect: false }] },
            { text: "Python: collections.defaultdict(list)?", options: [{ text: "Default []", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Empty", isCorrect: false }, { text: "Dict", isCorrect: false }] },
            { text: "Java: BigInteger for?", options: [{ text: "Large ints", isCorrect: true }, { text: "Float", isCorrect: false }, { text: "String", isCorrect: false }, { text: "Array", isCorrect: false }] },
            { text: "C: qsort(arr, n, sizeof(int), cmp);?", options: [{ text: "Sort array", isCorrect: true }, { text: "Error no include", isCorrect: false }, { text: "Quick sort", isCorrect: false }, { text: "Merge", isCorrect: false }] },
            { text: "Python: async def f(): await g()?", options: [{ text: "Coroutine", isCorrect: true }, { text: "Thread", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Sync", isCorrect: false }] },
            { text: "Java: FunctionalInterface?", options: [{ text: "Single abstract", isCorrect: true }, { text: "Multiple", isCorrect: false }, { text: "Class", isCorrect: false }, { text: "Enum", isCorrect: false }] },
            { text: "C: inline int f(){return 1;}?", options: [{ text: "Hint no call", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Static", isCorrect: false }, { text: "Volatile", isCorrect: false }] },
            { text: "Python: typing.List[int]?", options: [{ text: "Type hint", isCorrect: true }, { text: "Generic", isCorrect: false }, { text: "Error runtime", isCorrect: false }, { text: "Cast", isCorrect: false }] },
            { text: "Java: Path p = Paths.get(\"file.txt\"); Files.exists(p);?", options: [{ text: "Check file", isCorrect: true }, { text: "Create", isCorrect: false }, { text: "Delete", isCorrect: false }, { text: "Read", isCorrect: false }] },
            { text: "C: #pragma once?", options: [{ text: "Include guard", isCorrect: true }, { text: "Compile", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Link", isCorrect: false }] },
            { text: "Python: contextlib.contextmanager?", options: [{ text: "Yield with", isCorrect: true }, { text: "Class", isCorrect: false }, { text: "Decorator", isCorrect: false }, { text: "Thread", isCorrect: false }] },
            { text: "Java: CompletableFuture.supplyAsync(() -> 1);?", options: [{ text: "Async value", isCorrect: true }, { text: "Sync", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Block", isCorrect: false }] },
            { text: "C: restrict pointer?", options: [{ text: "No alias hint", isCorrect: true }, { text: "Const", isCorrect: false }, { text: "Volatile", isCorrect: false }, { text: "Static", isCorrect: false }] },
            { text: "Python: abc.ABC?", options: [{ text: "Abstract base", isCorrect: true }, { text: "List", isCorrect: false }, { text: "Dict", isCorrect: false }, { text: "Set", isCorrect: false }] },
            { text: "Java: record Point(int x, int y){}?", options: [{ text: "Immutable data (16+)", isCorrect: true }, { text: "Class", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Enum", isCorrect: false }] },
            { text: "C: fflush(stdin); portable?", options: [{ text: "No UB", isCorrect: true }, { text: "Yes clear input", isCorrect: false }, { text: "Error", isCorrect: false }, { text: "Output", isCorrect: false }] },
            { text: "Python: multiprocessing.Pool()?", options: [{ text: "Parallel map", isCorrect: true }, { text: "Thread", isCorrect: false }, { text: "Sync", isCorrect: false }, { text: "List", isCorrect: false }] }
        ]
    }
];

try {
    for (const quizData of contests) {
        const existingQuiz = db.prepare('SELECT id FROM quizzes WHERE code = ?').get(quizData.code);

        if (existingQuiz) {
            console.log(`Quiz with code ${quizData.code} already exists. Skipping seed to preserve manual edits.`);
            continue;
        } else {
            const insertQuiz = db.prepare('INSERT INTO quizzes (title, description, code, password, time_limit) VALUES (?, ?, ?, ?, ?)');
            const quizResult = insertQuiz.run(quizData.title, quizData.description, quizData.code, quizData.password, quizData.time_limit);
            const quizId = quizResult.lastInsertRowid;

            const insertQuestion = db.prepare('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)');
            const insertOption = db.prepare('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)');

            db.transaction(() => {
                for (const q of quizData.questions) {
                    const qResult = insertQuestion.run(quizId, q.text);
                    const questionId = qResult.lastInsertRowid;

                    for (const opt of q.options) {
                        insertOption.run(questionId, opt.text, opt.isCorrect ? 1 : 0);
                    }
                }
            })();
            console.log(`Successfully seeded new quiz: ${quizData.title} (Code: ${quizData.code})`);
        }
    }
} catch (err) {
    console.error('Error seeding data:', err.message);
}
