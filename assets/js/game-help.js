window.help = function() {
    console.log('%c╔══════════════════════════════════════════╗', 'color:#ffd700;');
    console.log('%c  SECURE VAULT BREAKER 3D  —  HELP         ', 'color:#ffd700; font-weight:bold; font-size:14px;');
    console.log('%c╚══════════════════════════════════════════╝', 'color:#ffd700;');
    console.log('%cOBJECTIVE  %cHack all terminals to win.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cMOVEMENT   %cArrow keys — Up/Down to walk, Left/Right to turn.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cINTERACT   %cFace a terminal and press E to open it.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cBUILD      %cSpace = place wall  |  Shift = remove wall.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cPAUSE      %cEscape to pause / resume the game.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cHACKING    %cEnter a 4-digit code (0–9) and press HACK.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cFEEDBACK   %c\uD83D\uDFE2 right digit & position  \uD83D\uDFE1 right digit wrong place  \uD83D\uDD34 wrong digit', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cATTEMPTS   %c10 per terminal. Type Q to quit a terminal.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
    console.log('%cIN-GAME    %cType "help" in the guess box for in-terminal tips.', 'color:#33ff33; font-weight:bold;', 'color:#ccc;');
};

function showInGameHelp(logArea) {
    logArea.innerHTML +=
        '<div class="log-entry" style="color:#ffd700; margin-top:10px;">[HELP] ---- GAME INSTRUCTIONS ----</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] OBJECTIVE: Hack all terminals before time runs out.</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] MOVE: Arrow keys (Up/Down = walk, Left/Right = turn).</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] INTERACT: Face a terminal and press E to open it.</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] BUILD: Space = place wall | Shift = remove wall.</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] PAUSE: Escape to pause / resume the game.</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] HACKING: Enter a 4-digit code (0-9) and press HACK.</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] FEEDBACK: \uD83D\uDFE2 = right digit, right place | \uD83D\uDFE1 = right digit, wrong place | \uD83D\uDD34 = wrong digit.</div>' +
        '<div class="log-entry" style="color:#ffd700;">[HELP] You have 10 attempts per terminal. Type Q to exit a terminal.</div>';
    logArea.scrollTop = logArea.scrollHeight;
    document.getElementById('guessInput').focus();
}

console.log('%c[VAULT BREAKER] Type %chelp()%c in the console for game instructions.', 'color:#ffd700;', 'color:#33ff33; font-weight:bold;', 'color:#ffd700;');
