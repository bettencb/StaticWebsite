/**
 * Secure Vault Breaker 3D — Codebreaker Terminal Game
 * Copyright (c) 2026 bettencb (https://github.com/bettencb)
 *
 * Licensed under CC BY-NC 4.0.
 * Free to use and modify with attribution. Commercial use prohibited.
 * https://creativecommons.org/licenses/by-nc/4.0/
 */

(function() {
    let attemptsLeft = 10;
    let isGameOver = false;
    let _currentTerminal = null;
    let _onComplete = null;

    function setupCodebreaker(terminalObj, onComplete) {
        _currentTerminal = terminalObj;
        _onComplete = onComplete;
        attemptsLeft = 10;
        isGameOver = false;

        document.getElementById('term-title').innerText = '\u{1F512} SECURE VAULT BREAKER';
        document.getElementById('term-dashboard').innerHTML =
            '<div><strong>Status:</strong> <span id="term-status">\u{1F7E2} Online - Awaiting Input</span></div>' +
            '<div><strong>Target:</strong> 4-Digit Sequence</div>' +
            '<div><strong>Valid Characters:</strong> Digits 0 through 9</div>' +
            '<div><strong>Firewall Limit:</strong> <span id="term-attempts">10</span> Attempts Remaining</div>';
        document.getElementById('term-input-area').innerHTML =
            '<input type="text" id="guessInput" maxlength="4" placeholder="____" autocomplete="off">' +
            '<button class="btn" id="submitBtn" onclick="submitCodebreaker()">HACK</button>' +
            '<button class="btn btn-exit" onclick="closeTerminal()">QUIT [Q]</button>';
        document.getElementById('logArea').innerHTML =
            '<div class="log-entry">[SYS] Terminal connection established.</div>' +
            '<div class="log-entry">[SYS] Target encrypted. Digits 0-9 required.</div>' +
            '<div class="log-entry">[SYS] Awaiting input...</div>';
        setTimeout(function() { document.getElementById('guessInput').focus(); }, 50);
    }

    window.submitCodebreaker = function() {
        if (isGameOver || !_currentTerminal) return;

        const guessStr = document.getElementById('guessInput').value;
        const logArea = document.getElementById('logArea');

        if (guessStr.trim().toLowerCase() === 'help') {
            document.getElementById('guessInput').value = '';
            showInGameHelp(logArea);
            return;
        }

        if (guessStr.length !== 4) {
            logArea.innerHTML += '<div class="log-entry" style="color:#ff3333;">[ERR] SEQUENCE MUST BE EXACTLY 4 DIGITS LONG.</div>';
            logArea.scrollTop = logArea.scrollHeight;
            return;
        }
        if (!/^[0-9]{4}$/.test(guessStr)) {
            logArea.innerHTML += '<div class="log-entry" style="color:#ff3333;">[ERR] INVALID CHARACTERS DETECTED. USE 0-9 ONLY.</div>';
            logArea.scrollTop = logArea.scrollHeight;
            return;
        }

        const guessArr = guessStr.split('').map(Number);
        attemptsLeft--;
        document.getElementById('term-attempts').innerText = attemptsLeft;

        let targetCopy = _currentTerminal.code.slice();
        let guessCopy = guessArr.slice();
        let feedback = ['\u{1F534}', '\u{1F534}', '\u{1F534}', '\u{1F534}'];

        for (let i = 0; i < 4; i++) {
            if (guessCopy[i] === targetCopy[i]) {
                feedback[i] = '\u{1F7E2}';
                targetCopy[i] = null;
                guessCopy[i] = null;
            }
        }
        for (let i = 0; i < 4; i++) {
            if (guessCopy[i] !== null) {
                let matchIndex = targetCopy.indexOf(guessCopy[i]);
                if (matchIndex > -1) {
                    feedback[i] = '\u{1F7E1}';
                    targetCopy[matchIndex] = null;
                }
            }
        }

        const attemptNum = 10 - attemptsLeft;
        const attemptFormat = attemptNum.toString().padStart(2, '0');
        logArea.innerHTML += '<div class="log-entry">* <strong>Attempt ' + attemptFormat + ':</strong> <code>' + guessArr.join(' ') + '</code> &rarr; ' + feedback.join(' ') + '</div>';
        document.getElementById('guessInput').value = '';

        if (feedback.every(function(f) { return f === '\u{1F7E2}'; })) {
            isGameOver = true;
            document.getElementById('term-status').innerText = '\u{1F7E2} SYSTEM BYPASSED';
            document.getElementById('guessInput').disabled = true;
            document.getElementById('submitBtn').disabled = true;
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#33ff33; font-weight:bold; margin-top:15px;">[SUCCESS] Perfect match detected.</div>' +
                '<div class="log-entry">[SUCCESS] Decryption successful. Terminal unlocked.</div>';
            _onComplete(logArea);
        } else if (attemptsLeft === 0) {
            isGameOver = true;
            document.getElementById('term-status').innerText = '\u{1F534} ACCESS DENIED';
            document.getElementById('term-status').style.color = '#ff3333';
            document.getElementById('guessInput').disabled = true;
            document.getElementById('submitBtn').disabled = true;
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#ff3333; margin-top:15px; font-weight:bold;">[CRITICAL] Maximum firewall attempts reached.</div>' +
                '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Correct sequence was: <strong>' + _currentTerminal.code.join('') + '</strong></div>' +
                '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Terminal locked. Exit and re-engage to try again.</div>';
        }

        logArea.scrollTop = logArea.scrollHeight;
        if (!isGameOver) document.getElementById('guessInput').focus();
    };

    TerminalGames.register('codebreaker', {
        setup: setupCodebreaker,
        handleKey: function(code, event) {
            if (code === 'Enter') submitCodebreaker();
        }
    });
})();
