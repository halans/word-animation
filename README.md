# Text Animation Project

A dynamic text animation built with Vanilla HTML, CSS, and JavaScript. This project features a three-row character grid where the middle row reveals a configurable word, while surrounding characters scramble randomly.

## Features

- **Three-Row Layout**: Main focus on the middle row with decorative scrambling rows above and below.
- **Configurable Reveal**: Specifically reveals a word in the center row.
- **Dynamic Resizing**: The grid width automatically adjusts to the length of the revealed word + 2 padding characters.
- **Customizable Timing**: Adjust the hold duration of the revealed word.
- **Premium Aesthetics**: Clean design with 'Sixtyfour Convergence' monospace font and smooth animations.

## Usage

1. **Open the Project**: Simply open the `index.html` file in any modern web browser.
2. **Controls**:
    - **Reveal Word**: Type in the input field to change the word being animated. The grid will instantly resize and reset.
    - **Hold Time**: Adjust how long (in milliseconds) the word stays fully revealed before scrambling again.
    - **Speed (FPS)**: Control the speed of the random character changes (default 15 FPS).

## Configuration

The animation logic is contained in `textani.js`. You can tweak the internal configuration variables in the `config` object:

```javascript
let config = {
    word: "HALANS.DEV",       // Default word
    holdTime: 2000,          // Default hold time in ms
    scrambleDuration: 1000,  // Time to wait in scramble state before revealing starts
    revealSpeed: 100,        // Speed of character revealing (ms per char)
    unrevealSpeed: 50,       // Speed of character hiding (ms per char)
    fps: 15,                 // Animation frame rate (default 15 fps)
    letterCase: 'uppercase', // 'uppercase' or 'lowercase'
};
```

## Customization

### Styling
Modify `textani.css` to change the appearance.
- **Font**: To change the font (monospace!), update the `--font-family` variable in `:root`.
- **Colors**: Adjust `--bg-color`, `--text-grey`, and `--text-black` to change the theme.

### Logic
The animation uses a state machine with 4 states:
1. `SCRAMBLE_WAIT`: All rows are random.
2. `REVEALING`: Middle row characters progressively matching the target word.
3. `HOLD`: Target word is fully visible and static.
4. `UNREVEALING`: Target word dissolves back into random characters.

Modify the `updateState()` function in `textani.js` to change the flow or add new states.

Created with Antigravity.