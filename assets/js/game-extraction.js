/**
 * Secure Vault Breaker 3D — Data Extraction Terminal Game
 * Copyright (c) 2026 bettencb (https://github.com/bettencb)
 *
 * Licensed under CC BY-NC 4.0.
 * Free to use and modify with attribution. Commercial use prohibited.
 * https://creativecommons.org/licenses/by-nc/4.0/
 */

(function() {
    let exState = null;
    let _onComplete = null;

    function setupExtraction(terminalObj, onComplete) {
        _onComplete = onComplete;
        const EXIT_X = 4, EXIT_Y = 4;

        let px, py;
        do {
            px = Math.floor(Math.random() * 5);
            py = Math.floor(Math.random() * 5);
        } while (px === EXIT_X && py === EXIT_Y);

        let cx, cy;
        do {
            cx = Math.floor(Math.random() * 5);
            cy = Math.floor(Math.random() * 5);
        } while ((cx === px && cy === py) || (cx === EXIT_X && cy === EXIT_Y));

        let dx, dy;
        do {
            dx = Math.floor(Math.random() * 5);
            dy = Math.floor(Math.random() * 5);
        } while ((dx === px && dy === py) || (dx === cx && dy === cy) || (dx === EXIT_X && dy === EXIT_Y));

        const daxis = Math.random() < 0.5 ? 'h' : 'v';
        let ddir;
        if (daxis === 'h') {
            if (dx === 0) ddir = 1;
            else if (dx === 4) ddir = -1;
            else ddir = Math.random() < 0.5 ? 1 : -1;
        } else {
            if (dy === 0) ddir = 1;
            else if (dy === 4) ddir = -1;
            else ddir = Math.random() < 0.5 ? 1 : -1;
        }

        exState = { px, py, cx, cy, dx, dy, daxis, ddir, hasCore: false, turnsLeft: 10, gameOver: false };

        const droneLabel = daxis === 'h'
            ? 'Row ' + (dy + 1) + ', bounces left \u2194 right each turn'
            : 'Col ' + (dx + 1) + ', bounces up \u2195 down each turn';
        const droneLog = daxis === 'h'
            ? 'it bounces on row ' + (dy + 1) + ' each turn'
            : 'it bounces on col ' + (dx + 1) + ' each turn';

        document.getElementById('term-title').innerText = '\u{1F4E1} DATA EXTRACTION';
        document.getElementById('term-dashboard').innerHTML =
            '<div><strong>Status:</strong> <span id="term-status">\u{1F7E2} Grid Active - Plan Your Route</span></div>' +
            '<div><strong>Turns Remaining:</strong> <span id="term-attempts">10</span></div>' +
            '<div><strong>Objective:</strong> Reach <span style="color:#ffcc00">[C]</span> then <span style="color:#00ff88">[X]</span></div>' +
            '<div><strong>Drone [D]:</strong> ' + droneLabel + '</div>';
        document.getElementById('term-input-area').innerHTML =
            '<div id="ext-board-wrap" style="width:100%">' +
                '<div class="ext-grid" id="ext-grid"></div>' +
                '<div class="ext-controls">' +
                    '<div></div>' +
                    '<button class="btn" onclick="handleExtractionMove(0,-1)">\u25B2</button>' +
                    '<div></div>' +
                    '<button class="btn" onclick="handleExtractionMove(-1,0)">\u25C4</button>' +
                    '<button class="btn" onclick="handleExtractionMove(0,1)">\u25BC</button>' +
                    '<button class="btn" onclick="handleExtractionMove(1,0)">\u25BA</button>' +
                '</div>' +
            '</div>';
        document.getElementById('logArea').innerHTML =
            '<div class="log-entry">[SYS] Data extraction protocol initiated.</div>' +
            '<div class="log-entry">[SYS] Navigate [P] to [C] core, then reach [X] exit.</div>' +
            '<div class="log-entry">[SYS] Avoid [D] drone \u2014 ' + droneLog + '.</div>' +
            '<div class="log-entry">[SYS] Use arrow keys or buttons. Q to abort.</div>';
        renderExtractionBoard();
    }

    function renderExtractionBoard() {
        if (!exState) return;
        const grid = document.getElementById('ext-grid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'ext-cell';
                const isPlayer = (col === exState.px && row === exState.py);
                const isDrone  = (col === exState.dx && row === exState.dy);
                const isCore   = (!exState.hasCore && col === exState.cx && row === exState.cy);
                const isExit   = (col === 4 && row === 4);
                if (isPlayer && isDrone) {
                    cell.classList.add('ec-overlap');
                    cell.innerText = '!!';
                } else if (isPlayer) {
                    cell.classList.add(exState.hasCore ? 'ec-core' : 'ec-player');
                    cell.innerText = exState.hasCore ? 'P+C' : 'P';
                } else if (isDrone) {
                    cell.classList.add('ec-drone');
                    cell.innerText = 'D';
                } else if (isCore) {
                    cell.classList.add('ec-core');
                    cell.innerText = 'C';
                } else if (isExit) {
                    cell.classList.add('ec-exit');
                    cell.innerText = 'X';
                } else {
                    cell.classList.add('ec-empty');
                    cell.innerText = '';
                }
                grid.appendChild(cell);
            }
        }
        document.getElementById('term-attempts').innerText = exState.turnsLeft;
    }

    window.handleExtractionMove = function(dx, dy) {
        if (!exState || exState.gameOver) return;
        const logArea = document.getElementById('logArea');
        const newX = exState.px + dx;
        const newY = exState.py + dy;

        if (newX < 0 || newX > 4 || newY < 0 || newY > 4) {
            logArea.innerHTML += '<div class="log-entry" style="color:#ff3333;">[ERR] Out of bounds. Choose another direction.</div>';
            logArea.scrollTop = logArea.scrollHeight;
            return;
        }

        exState.px = newX;
        exState.py = newY;

        if (!exState.hasCore && exState.px === exState.cx && exState.py === exState.cy) {
            exState.hasCore = true;
            logArea.innerHTML += '<div class="log-entry" style="color:#ffcc00;">[DATA] Core package acquired. Reach the exit!</div>';
            document.getElementById('term-status').innerText = '\u{1F7E1} Core Acquired \u2014 Reach Exit';
            document.getElementById('term-status').style.color = '#ffcc00';
        }

        if (exState.daxis === 'h') {
            exState.dx += exState.ddir;
            if (exState.dx === 0 || exState.dx === 4) exState.ddir *= -1;
        } else {
            exState.dy += exState.ddir;
            if (exState.dy === 0 || exState.dy === 4) exState.ddir *= -1;
        }

        if (exState.px === exState.dx && exState.py === exState.dy) {
            exState.gameOver = true;
            renderExtractionBoard();
            document.getElementById('term-status').innerText = '\u{1F534} INTERCEPTED';
            document.getElementById('term-status').style.color = '#ff3333';
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#ff3333; font-weight:bold; margin-top:10px;">[CRITICAL] Drone interception. Route compromised.</div>' +
                '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Exit and re-engage to restart extraction.</div>';
            document.querySelectorAll('.ext-controls .btn').forEach(function(b) { b.disabled = true; });
            logArea.scrollTop = logArea.scrollHeight;
            return;
        }

        if (exState.px === 4 && exState.py === 4) {
            if (exState.hasCore) {
                exState.gameOver = true;
                renderExtractionBoard();
                document.getElementById('term-status').innerText = '\u{1F7E2} EXTRACTION COMPLETE';
                document.getElementById('term-status').style.color = '#33ff33';
                logArea.innerHTML +=
                    '<div class="log-entry" style="color:#33ff33; font-weight:bold; margin-top:10px;">[SUCCESS] Data core extracted. Terminal access granted.</div>';
                document.querySelectorAll('.ext-controls .btn').forEach(function(b) { b.disabled = true; });
                _onComplete(logArea);
                logArea.scrollTop = logArea.scrollHeight;
                return;
            } else {
                exState.gameOver = true;
                renderExtractionBoard();
                document.getElementById('term-status').innerText = '\u{1F534} EXTRACTION FAILED';
                document.getElementById('term-status').style.color = '#ff3333';
                logArea.innerHTML +=
                    '<div class="log-entry" style="color:#ff3333; font-weight:bold; margin-top:10px;">[CRITICAL] Exit reached without core. Mission failed.</div>' +
                    '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Exit and re-engage to restart extraction.</div>';
                document.querySelectorAll('.ext-controls .btn').forEach(function(b) { b.disabled = true; });
                logArea.scrollTop = logArea.scrollHeight;
                return;
            }
        }

        exState.turnsLeft--;
        if (exState.turnsLeft <= 0) {
            exState.gameOver = true;
            renderExtractionBoard();
            document.getElementById('term-status').innerText = '\u{1F534} TIME OUT';
            document.getElementById('term-status').style.color = '#ff3333';
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#ff3333; font-weight:bold; margin-top:10px;">[CRITICAL] Turn limit exceeded. Extraction failed.</div>' +
                '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Exit and re-engage to restart extraction.</div>';
            document.querySelectorAll('.ext-controls .btn').forEach(function(b) { b.disabled = true; });
            logArea.scrollTop = logArea.scrollHeight;
            return;
        }

        renderExtractionBoard();
        logArea.scrollTop = logArea.scrollHeight;
    };

    TerminalGames.register('extraction', {
        setup: setupExtraction,
        handleKey: function(code, event) {
            if (code === 'ArrowUp')    { event.preventDefault(); handleExtractionMove(0, -1); }
            if (code === 'ArrowDown')  { event.preventDefault(); handleExtractionMove(0, 1); }
            if (code === 'ArrowLeft')  { event.preventDefault(); handleExtractionMove(-1, 0); }
            if (code === 'ArrowRight') { event.preventDefault(); handleExtractionMove(1, 0); }
        }
    });
})();
