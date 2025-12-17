const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const row1 = document.getElementById('row-1');
const row2 = document.getElementById('row-2');
const row3 = document.getElementById('row-3');
const wordInput = document.getElementById('word-input');
const holdTimeInput = document.getElementById('hold-time');

let config = {
    words: ["HALANS.DEV", "ANTIGRAVITY", "GOOGLE"], // Array of words
    holdTime: 2000,
    scrambleDuration: 1000, // Time to stay in scramble before revealing
    revealSpeed: 100, // ms per character reveal
    unrevealSpeed: 50, // ms per character unreveal
    fps: 15, // Default FPS
    letterCase: 'uppercase', // 'uppercase' or 'lowercase'
    currentWordIndex: 0,
};

const State = {
    SCRAMBLE_WAIT: 'SCRAMBLE_WAIT',
    REVEALING: 'REVEALING',
    HOLD: 'HOLD',
    UNREVEALING: 'UNREVEALING'
};

let currentState = State.REVEALING; // Start revealing immediately or wait? Let's wait a bit.
let stateStartTime = Date.now();
let revealIndex = 0; // How many characters are revealed

// DOM Cache
let row2Spans = [];

function getRandomChar() {
    const char = chars[Math.floor(Math.random() * chars.length)];
    return config.letterCase === 'lowercase' ? char.toLowerCase() : char;
}

function createSpans(row, count) {
    row.innerHTML = '';
    const spans = [];
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = getRandomChar();
        row.appendChild(span);
        spans.push(span);
    }
    return spans;
}

function getMaxWordLength() {
    return config.words.reduce((max, word) => Math.max(max, word.length), 0);
}

function initGrid() {
    const totalLen = getMaxWordLength() + 2;
    createSpans(row1, totalLen);
    row2Spans = createSpans(row2, totalLen); // Cache row2 spans for styling
    createSpans(row3, totalLen);
}

function updateState() {
    const now = Date.now();
    const elapsed = now - stateStartTime;

    switch (currentState) {
        case State.SCRAMBLE_WAIT:
            if (elapsed > config.scrambleDuration) {
                currentState = State.REVEALING;
                stateStartTime = now;
                revealIndex = 0;
            }
            break;
        case State.REVEALING:
            // Calculate how many should be revealed based on time
            // Reveal 1 char every config.revealSpeed ms
            const targetIndex = Math.floor(elapsed / config.revealSpeed);
            if (targetIndex > revealIndex) {
                revealIndex = targetIndex;
            }
            if (revealIndex > config.words[config.currentWordIndex].length) {
                revealIndex = config.words[config.currentWordIndex].length;
                currentState = State.HOLD;
                stateStartTime = now;
            }
            break;
        case State.HOLD:
            if (elapsed > config.holdTime) {
                currentState = State.UNREVEALING;
                stateStartTime = now;
                revealIndex = config.words[config.currentWordIndex].length;
            }
            break;
        case State.UNREVEALING:
            const unrevealSteps = Math.floor(elapsed / config.unrevealSpeed);
            revealIndex = config.words[config.currentWordIndex].length - unrevealSteps;

            if (revealIndex < 0) {
                revealIndex = 0;
                currentState = State.SCRAMBLE_WAIT;
                stateStartTime = now;
                // Move to next word
                config.currentWordIndex = (config.currentWordIndex + 1) % config.words.length;
            }
            break;
    }
}

function updateGrid() {
    const totalLen = getMaxWordLength() + 2;

    // Update Row 1 and 3 entirely (always random)
    if (row1.children.length !== totalLen) initGrid();

    // Simple update for 1 and 3 (might be expensive to re-write textContent every frame? 
    // minimal DOM overhead for ~20 chars is fine)
    for (let i = 0; i < totalLen; i++) {
        row1.children[i].textContent = getRandomChar();
        row3.children[i].textContent = getRandomChar();
    }

    // Update Row 2
    // Indices 0 and totalLen-1 are always random
    // Indices 1 to totalLen-2 are the word

    // Safety check for length match
    if (row2Spans.length !== totalLen) {
        initGrid();
        return;
    }

    // First char
    row2Spans[0].textContent = getRandomChar();
    row2Spans[0].classList.remove('revealed');

    // Last char
    row2Spans[totalLen - 1].textContent = getRandomChar();
    row2Spans[totalLen - 1].classList.remove('revealed');

    // Middle word part
    const currentWord = config.words[config.currentWordIndex];
    // Center the word: calculate start offset (excluding padding chars at 0 and totalLen-1)
    // Available space for word is indices 1 to totalLen-2. Length is totalLen - 2.
    // Start index within that space = (availableSpace - wordLength) / 2
    // Absolute start index = 1 + start index
    const availableSpace = totalLen - 2;
    const paddingLeft = Math.floor((availableSpace - currentWord.length) / 2);
    const wordStartIndex = 1 + paddingLeft;

    for (let i = 1; i < totalLen - 1; i++) {
        const span = row2Spans[i];

        // Check if this span is part of the word
        if (i >= wordStartIndex && i < wordStartIndex + currentWord.length) {
            const charIndex = i - wordStartIndex;
            const targetChar = currentWord[charIndex];

            if (charIndex < revealIndex) {
                // Revealed
                span.textContent = targetChar;
                span.classList.add('revealed');
            } else {
                // Scrambling
                span.textContent = getRandomChar();
                span.classList.remove('revealed');
            }
        } else {
            // Outside the word (padding), simply scramble
            span.textContent = getRandomChar();
            span.classList.remove('revealed');
        }
    }
}

const speedInput = document.getElementById('speed-input');

// ... (existing code) ...

let lastFrameTime = 0;
let frameInterval = 1000 / config.fps;

function tick(currentTime) {
    requestAnimationFrame(tick);

    updateState();

    if (currentTime - lastFrameTime > frameInterval) {
        lastFrameTime = currentTime;
        updateGrid();
    }
}

// Event Listeners
if (wordInput) {
    wordInput.addEventListener('input', (e) => {
        // Allow comma separated values
        let val = e.target.value;
        val = config.letterCase === 'lowercase' ? val.toLowerCase() : val.toUpperCase();

        const newWords = val.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // Simple check to see if words changed (ignoring order/deep check for performance, just join)
        if (newWords.join(',') !== config.words.join(',')) {
            config.words = newWords.length > 0 ? newWords : [""]; // Fallback to empty string if empty
            // Reset animation
            config.currentWordIndex = 0;
            currentState = State.SCRAMBLE_WAIT;
            stateStartTime = Date.now();
            initGrid();
        }
    });
}

if (holdTimeInput) {
    holdTimeInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (val < 500) val = 500;
        config.holdTime = val;
    });
}

if (speedInput) {
    speedInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (val < 1) val = 1;
        if (val > 60) val = 60;
        config.fps = val;
        frameInterval = 1000 / val;
    });
}

// Init
if (wordInput) {
    let val = config.letterCase === 'lowercase' ? wordInput.value.toLowerCase() : wordInput.value.toUpperCase();
    const newWords = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (newWords.length > 0) config.words = newWords;
}
if (holdTimeInput) {
    config.holdTime = parseInt(holdTimeInput.value, 10);
}
if (speedInput) {
    config.fps = parseInt(speedInput.value, 10);
}
frameInterval = 1000 / config.fps;
initGrid();
requestAnimationFrame(tick);
