---
layout: game
title: Secure Vault Breaker 3D
---
<canvas id="game-canvas"></canvas>

<div id="timer-display">Time: <span id="time-val">00:00</span></div>
<div id="hud">Terminals Remaining: <span id="hud-terminals">0</span></div>
<div id="crosshair"></div>
<canvas id="minimap" width="160" height="160"></canvas>
<div id="interaction-prompt">Press 'E' to Interact</div>

<div id="terminal-overlay">
    <div class="widget-container">
        <h2 id="term-title">&#128272; SECURE VAULT BREAKER</h2>
        <div class="dashboard" id="term-dashboard">
            <div><strong>Status:</strong> <span id="term-status">&#128994; Online - Awaiting Input</span></div>
            <div><strong>Target:</strong> 4-Digit Sequence</div>
            <div><strong>Valid Characters:</strong> Digits 0 through 9</div>
            <div><strong>Firewall Limit:</strong> <span id="term-attempts">10</span> Attempts Remaining</div>
        </div>
        <div class="input-area" id="term-input-area">
            <input type="text" id="guessInput" maxlength="4" placeholder="____" autocomplete="off">
            <button class="btn" id="submitBtn" onclick="submitCodebreaker()">HACK</button>
            <button class="btn btn-exit" onclick="closeTerminal()">QUIT [Q]</button>
        </div>
        <div class="log-area" id="logArea"></div>
    </div>
</div>

<div id="pause-overlay">
    <div id="pause-nav-wrapper">
        {% include header.html %}
    </div>
    <div id="pause-title">&#9646;&#9646; PAUSED</div>
    <button class="btn" onclick="resumeGame()">RESUME [ESC]</button>
</div>

<div id="victory-overlay">
    <div class="widget-container">
        <h2>ROOT ACCESS GRANTED</h2>
        <div class="log-area" style="height: auto; border: none; padding: 20px 0;">
            <p style="font-size: 1.2em; color: #33ff33; margin-bottom: 15px;">[ ALL NODES COMPROMISED ]</p>
            <p style="color: #ccc;">The ICE is shattered. The mainframe is yours.</p>
            <p style="color: #33ff33; font-weight: bold; font-size: 1.1em; margin: 15px 0;">Time to Crack: <span id="final-time">00:00</span></p>
            <p style="color: #ccc; margin-bottom: 25px;">Do you wish to wipe your tracks, re-initiate the simulation, and crack a new network?</p>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button class="btn" style="background-color: #ffd700; color: #000;" onclick="restartGame()">YES [REBOOT]</button>
                <button class="btn btn-exit" onclick="closeVictory()">NO [STAY]</button>
            </div>
        </div>
    </div>
</div>

<script src="{{ '/assets/js/game-help.js' | relative_url }}"></script>
<script>
    /**
     * Secure Vault Breaker 3D
     * Copyright (c) 2026 bettencb (https://github.com/bettencb)
     *
     * Licensed under CC BY-NC 4.0.
     * Free to use and modify with attribution. Commercial use prohibited.
     * https://creativecommons.org/licenses/by-nc/4.0/
     */

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    const minimapCanvas = document.getElementById('minimap');
    const mCtx = minimapCanvas.getContext('2d');
    const minimapZoom = 12;

    const screenWidth = 640;
    const screenHeight = 480;
    canvas.width = screenWidth;
    canvas.height = screenHeight;

    const TEX_WIDTH = 64;
    const TEX_HEIGHT = 64;

    let gameState = 'EXPLORING';

    let timerStarted = false;
    let gameFinished = false;
    let startTime = 0;
    let pausedAt = 0;
    let totalPausedMs = 0;

    const mapWidth = 20;
    const mapHeight = 20;
    let worldMap = [];
    let terminals = {};
    let totalTerminals = 0;
    let hackedTerminals = 0;

    const player = {
        x: 2.5, y: 2.5,
        dirX: -1.0, dirY: 0.0,
        planeX: 0.0, planeY: 0.66,
        moveSpeed: 4.0, rotSpeed: 3.0
    };

    const keys = {
        ArrowUp: false, ArrowDown: false,
        ArrowLeft: false, ArrowRight: false,
        Space: false, Shift: false
    };

    const textures = {
        wall: document.createElement('canvas'),
        terminalActive: document.createElement('canvas'),
        terminalHacked: document.createElement('canvas')
    };

    /**
     * Procedurally generates the three canvas-based textures used by the renderer:
     * a brick-pattern wall, a green "TERMINAL" tile for unhacked terminals, and a
     * red "HACKED" tile for already-compromised terminals.
     */
    function generateTextures() {
        textures.wall.width = TEX_WIDTH; textures.wall.height = TEX_HEIGHT;
        let wCtx = textures.wall.getContext('2d');
        wCtx.fillStyle = '#555'; wCtx.fillRect(0,0,TEX_WIDTH,TEX_HEIGHT);
        wCtx.strokeStyle = '#333'; wCtx.lineWidth = 2;
        for(let i=0; i<TEX_WIDTH; i+=16) {
            wCtx.strokeRect(0, i, TEX_WIDTH, 16);
            wCtx.strokeRect(i + (i%32===0?0:8), i, 16, 16);
        }

        textures.terminalActive.width = TEX_WIDTH; textures.terminalActive.height = TEX_HEIGHT;
        let taCtx = textures.terminalActive.getContext('2d');
        taCtx.fillStyle = '#113311'; taCtx.fillRect(0,0,TEX_WIDTH,TEX_HEIGHT);
        taCtx.fillStyle = '#33ff33';
        taCtx.font = "12px monospace";
        taCtx.textAlign = "center";
        taCtx.fillText("TERMINAL", TEX_WIDTH/2, TEX_HEIGHT/2);
        taCtx.strokeStyle = '#33ff33'; taCtx.strokeRect(2,2,TEX_WIDTH-4, TEX_HEIGHT-4);

        textures.terminalHacked.width = TEX_WIDTH; textures.terminalHacked.height = TEX_HEIGHT;
        let thCtx = textures.terminalHacked.getContext('2d');
        thCtx.fillStyle = '#331111'; thCtx.fillRect(0,0,TEX_WIDTH,TEX_HEIGHT);
        thCtx.fillStyle = '#ff3333';
        thCtx.font = "14px monospace";
        thCtx.textAlign = "center";
        thCtx.fillText("HACKED", TEX_WIDTH/2, TEX_HEIGHT/2);
        thCtx.strokeStyle = '#ff3333'; thCtx.strokeRect(2,2,TEX_WIDTH-4, TEX_HEIGHT-4);
    }

    /**
     * Builds the 20x20 world map from scratch. The outer ring is always solid
     * wall; interior cells are randomly walled at ~15% density. Then randomly
     * places 1-4 terminals (map value 2) away from the player spawn, each
     * assigned a freshly generated 4-digit secret code. Calls updateHUD() when done.
     */
    function initMap() {
        for (let y = 0; y < mapHeight; y++) {
            let row = [];
            for (let x = 0; x < mapWidth; x++) {
                if (x == 0 || x == mapWidth - 1 || y == 0 || y == mapHeight - 1) {
                    row.push(1);
                } else {
                    row.push(Math.random() > 0.85 ? 1 : 0);
                }
            }
            worldMap.push(row);
        }

        worldMap[2][2] = 0; worldMap[2][3] = 0; worldMap[3][2] = 0;

        totalTerminals = Math.floor(Math.random() * 4) + 1;
        let placed = 0;
        while(placed < totalTerminals) {
            let tx = Math.floor(Math.random() * (mapWidth - 2)) + 1;
            let ty = Math.floor(Math.random() * (mapHeight - 2)) + 1;
            if (worldMap[ty][tx] === 1 && (tx > 4 || ty > 4)) {
                worldMap[ty][tx] = 2;
                let code = [];
                for (let i = 0; i < 4; i++) code.push(Math.floor(Math.random() * 10));
                terminals[tx + ',' + ty] = { x: tx, y: ty, hacked: false, code: code };
                placed++;
            }
        }
        updateHUD();
    }

    /**
     * Refreshes the on-screen HUD counter to show how many terminals are still
     * unhacked out of the total (e.g. "2 / 3").
     */
    function updateHUD() {
        document.getElementById('hud-terminals').innerText = (totalTerminals - hackedTerminals) + ' / ' + totalTerminals;
    }

    document.addEventListener('keydown', function(e) {
        if (!timerStarted && !gameFinished && gameState === 'EXPLORING') {
            timerStarted = true;
            startTime = performance.now();
        }
        if (e.code === 'Escape') {
            e.preventDefault();
            if (gameState === 'EXPLORING') { pauseGame(); return; }
            if (gameState === 'PAUSED')    { resumeGame(); return; }
        }
        if (gameState === 'EXPLORING') {
            if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                e.preventDefault();
                editWorld(e.code === 'Space');
            }
            if (e.code === 'KeyE') interact();
        } else if (gameState === 'TERMINAL') {
            if (e.code === 'KeyQ') { closeTerminal(); return; }
            if (currentMode === 'codebreaker') {
                if (e.code === 'Enter') submitCodebreaker();
            } else if (currentMode === 'extraction') {
                if (e.code === 'ArrowUp')    { e.preventDefault(); handleExtractionMove(0, -1); }
                if (e.code === 'ArrowDown')  { e.preventDefault(); handleExtractionMove(0, 1); }
                if (e.code === 'ArrowLeft')  { e.preventDefault(); handleExtractionMove(-1, 0); }
                if (e.code === 'ArrowRight') { e.preventDefault(); handleExtractionMove(1, 0); }
            }
        }
    });

    document.addEventListener('keyup', function(e) {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    });

    /**
     * Returns the map tile coordinates of the cell directly in front of the player,
     * calculated by stepping one unit along the player's direction vector.
     * @returns {{x: number, y: number}} Map grid coordinates of the faced tile.
     */
    function getFacedBlock() {
        let checkX = Math.floor(player.x + player.dirX * 1.0);
        let checkY = Math.floor(player.y + player.dirY * 1.0);
        return {x: checkX, y: checkY};
    }

    /**
     * Places or removes a wall at the tile the player is currently facing.
     * Ignores border tiles and terminal tiles (value 2) to prevent map corruption.
     * Also prevents the player from walling themselves into their own tile.
     * @param {boolean} build - true to place a wall, false to remove one.
     */
    function editWorld(build) {
        let target = getFacedBlock();
        if (target.x <= 0 || target.x >= mapWidth - 1 || target.y <= 0 || target.y >= mapHeight - 1) return;
        if (worldMap[target.y][target.x] === 2) return;
        if (build) {
            if (worldMap[target.y][target.x] === 0) {
                if (Math.floor(player.x) !== target.x || Math.floor(player.y) !== target.y) {
                    worldMap[target.y][target.x] = 1;
                }
            }
        } else {
            if (worldMap[target.y][target.x] === 1) {
                worldMap[target.y][target.x] = 0;
            }
        }
    }

    /**
     * Triggered when the player presses E. Checks the tile directly in front of
     * the player; if it is an unhacked terminal, opens the hacking overlay for it.
     */
    function interact() {
        let target = getFacedBlock();
        if (worldMap[target.y][target.x] === 2) {
            let term = terminals[target.x + ',' + target.y];
            if (term && !term.hacked) openTerminal(term);
        }
    }

    let currentTerminal = null;
    let attemptsLeft = 10;
    let isGameOver = false;
    let currentMode = 'codebreaker';
    let exState = null;

    function openTerminal(terminalObj) {
        currentTerminal = terminalObj;
        gameState = 'TERMINAL';
        isGameOver = false;
        keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
        currentMode = Math.random() < 0.5 ? 'codebreaker' : 'extraction';
        document.getElementById('terminal-overlay').style.display = 'flex';
        if (currentMode === 'codebreaker') {
            setupCodebreaker();
        } else {
            setupExtraction();
        }
    }

    function setupCodebreaker() {
        attemptsLeft = 10;
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

    function setupExtraction() {
        exState = { px: 0, py: 0, dx: 0, dy: 2, ddir: 1, hasCore: false, turnsLeft: 10, gameOver: false };
        document.getElementById('term-title').innerText = '\u{1F4E1} DATA EXTRACTION';
        document.getElementById('term-dashboard').innerHTML =
            '<div><strong>Status:</strong> <span id="term-status">\u{1F7E2} Grid Active - Plan Your Route</span></div>' +
            '<div><strong>Turns Remaining:</strong> <span id="term-attempts">10</span></div>' +
            '<div><strong>Objective:</strong> Reach <span style="color:#ffcc00">[C]</span> then <span style="color:#00ff88">[X]</span></div>' +
            '<div><strong>Drone [D]:</strong> Row 3, bounces left \u2194 right each turn</div>';
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
            '<div class="log-entry">[SYS] Avoid [D] drone \u2014 it bounces on row 3 each turn.</div>' +
            '<div class="log-entry">[SYS] Use arrow keys or buttons. Q to abort.</div>';
        renderExtractionBoard();
    }

    /**
     * Hides the terminal overlay, clears the active terminal reference, and returns
     * game state to EXPLORING. Refocuses the game canvas for keyboard input.
     */
    function closeTerminal() {
        document.getElementById('terminal-overlay').style.display = 'none';
        gameState = 'EXPLORING';
        currentTerminal = null;
        exState = null;
        canvas.focus();
    }

    function submitCodebreaker() {
        if (isGameOver || !currentTerminal) return;

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

        let targetCopy = currentTerminal.code.slice();
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
            document.getElementById('term-status').innerText = "\u{1F7E2} SYSTEM BYPASSED";
            document.getElementById('guessInput').disabled = true;
            document.getElementById('submitBtn').disabled = true;
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#33ff33; font-weight:bold; margin-top:15px;">[SUCCESS] Perfect match detected.</div>' +
                '<div class="log-entry">[SUCCESS] Decryption successful. Terminal unlocked.</div>';
            completeTerminalHack(logArea);
        } else if (attemptsLeft === 0) {
            isGameOver = true;
            document.getElementById('term-status').innerText = "\u{1F534} ACCESS DENIED";
            document.getElementById('term-status').style.color = "#ff3333";
            document.getElementById('guessInput').disabled = true;
            document.getElementById('submitBtn').disabled = true;
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#ff3333; margin-top:15px; font-weight:bold;">[CRITICAL] Maximum firewall attempts reached.</div>' +
                '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Correct sequence was: <strong>' + currentTerminal.code.join('') + '</strong></div>' +
                '<div class="log-entry" style="color:#ff3333;">[CRITICAL] Terminal locked. Exit and re-engage to try again.</div>';
        }

        logArea.scrollTop = logArea.scrollHeight;
        if (!isGameOver) document.getElementById('guessInput').focus();
    }

    function completeTerminalHack(logArea) {
        currentTerminal.hacked = true;
        hackedTerminals++;
        updateHUD();
        if (hackedTerminals >= totalTerminals) {
            gameFinished = true;
            document.getElementById('final-time').innerText = formatTime(performance.now() - startTime - totalPausedMs);
            logArea.innerHTML += '<div class="log-entry" style="color:#ffd700; font-size:1.2em; margin-top:15px; font-weight:bold;">[!] ALL TERMINALS HACKED. MISSION ACCOMPLISHED.</div>';
            setTimeout(showVictoryScreen, 1500);
        }
    }

    function handleExtractionMove(dx, dy) {
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

        if (!exState.hasCore && exState.px === 2 && exState.py === 2) {
            exState.hasCore = true;
            logArea.innerHTML += '<div class="log-entry" style="color:#ffcc00;">[DATA] Core package acquired. Reach the exit!</div>';
            document.getElementById('term-status').innerText = '\u{1F7E1} Core Acquired \u2014 Reach Exit';
            document.getElementById('term-status').style.color = '#ffcc00';
        }

        exState.dx += exState.ddir;
        if (exState.dx === 0 || exState.dx === 4) exState.ddir *= -1;

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
                completeTerminalHack(logArea);
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
                const isCore   = (!exState.hasCore && col === 2 && row === 2);
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

    /**
     * Hides the terminal overlay and displays the victory overlay. Sets game state
     * to VICTORY. Called automatically 1.5 s after the last terminal is hacked.
     */
    function showVictoryScreen() {
        document.getElementById('terminal-overlay').style.display = 'none';
        document.getElementById('victory-overlay').style.display = 'flex';
        gameState = 'VICTORY';
    }

    /**
     * Pauses the game. Records the current timestamp so paused time can later be
     * subtracted from the run timer. Clears held movement keys and shows the
     * pause overlay (which includes the site navigation).
     */
    function pauseGame() {
        gameState = 'PAUSED';
        pausedAt = performance.now();
        keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
        document.getElementById('pause-overlay').style.display = 'flex';
    }

    /**
     * Resumes a paused game. Adds the duration of the pause to totalPausedMs so
     * the run timer stays accurate, then hides the pause overlay and returns to
     * EXPLORING state.
     */
    function resumeGame() {
        if (timerStarted && !gameFinished) {
            totalPausedMs += performance.now() - pausedAt;
        }
        document.getElementById('pause-overlay').style.display = 'none';
        gameState = 'EXPLORING';
        canvas.focus();
    }

    /**
     * Dismisses the victory overlay without resetting the game, letting the player
     * continue exploring the already-cleared map. Returns state to EXPLORING.
     */
    function closeVictory() {
        document.getElementById('victory-overlay').style.display = 'none';
        gameState = 'EXPLORING';
        canvas.focus();
    }

    /**
     * Fully resets all game state and starts a new run. Repositions the player at
     * spawn, wipes the world map, clears all terminal data, resets the timer, and
     * calls initMap() to generate a fresh map with new terminals and codes.
     */
    function restartGame() {
        document.getElementById('victory-overlay').style.display = 'none';
        gameState = 'EXPLORING';
        player.x = 2.5; player.y = 2.5;
        player.dirX = -1.0; player.dirY = 0.0;
        player.planeX = 0.0; player.planeY = 0.66;
        worldMap = [];
        terminals = {};
        hackedTerminals = 0;
        timerStarted = false;
        gameFinished = false;
        totalPausedMs = 0;
        document.getElementById('time-val').innerText = "00:00";
        initMap();
        canvas.focus();
    }

    /**
     * Converts a millisecond duration into a zero-padded MM:SS string.
     * @param {number} ms - Duration in milliseconds.
     * @returns {string} Formatted time string, e.g. "02:05".
     */
    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    let lastTime = 0;

    /**
     * Main requestAnimationFrame loop. Computes the time delta since the last
     * frame, updates the on-screen timer, calls updatePlayer() when exploring,
     * then calls renderFrame() every frame regardless of state.
     * @param {DOMHighResTimeStamp} timestamp - Time provided by rAF.
     */
    function gameLoop(timestamp) {
        let frameTime = (timestamp - lastTime) / 1000.0;
        if (isNaN(frameTime)) frameTime = 0.016;
        lastTime = timestamp;

        if (timerStarted && !gameFinished && gameState !== 'PAUSED') {
            document.getElementById('time-val').innerText = formatTime(performance.now() - startTime - totalPausedMs);
        }

        if (gameState === 'EXPLORING') updatePlayer(frameTime);
        renderFrame();
        requestAnimationFrame(gameLoop);
    }

    /**
     * Updates the player's position and facing direction based on currently held
     * arrow keys. Movement is frame-rate independent via frameTime. Collision
     * detection is done per axis so the player can slide along walls.
     * Rotation is applied via 2D rotation matrix to both the direction vector
     * and the camera plane vector.
     * @param {number} frameTime - Seconds elapsed since the last frame.
     */
    function updatePlayer(frameTime) {
        let moveStep = player.moveSpeed * frameTime;
        let rotStep = player.rotSpeed * frameTime;

        if (keys.ArrowUp) {
            if(worldMap[Math.floor(player.y)][Math.floor(player.x + player.dirX * moveStep)] === 0) player.x += player.dirX * moveStep;
            if(worldMap[Math.floor(player.y + player.dirY * moveStep)][Math.floor(player.x)] === 0) player.y += player.dirY * moveStep;
        }
        if (keys.ArrowDown) {
            if(worldMap[Math.floor(player.y)][Math.floor(player.x - player.dirX * moveStep)] === 0) player.x -= player.dirX * moveStep;
            if(worldMap[Math.floor(player.y - player.dirY * moveStep)][Math.floor(player.x)] === 0) player.y -= player.dirY * moveStep;
        }
        if (keys.ArrowRight) {
            let oldDirX = player.dirX;
            player.dirX = player.dirX * Math.cos(-rotStep) - player.dirY * Math.sin(-rotStep);
            player.dirY = oldDirX * Math.sin(-rotStep) + player.dirY * Math.cos(-rotStep);
            let oldPlaneX = player.planeX;
            player.planeX = player.planeX * Math.cos(-rotStep) - player.planeY * Math.sin(-rotStep);
            player.planeY = oldPlaneX * Math.sin(-rotStep) + player.planeY * Math.cos(-rotStep);
        }
        if (keys.ArrowLeft) {
            let oldDirX = player.dirX;
            player.dirX = player.dirX * Math.cos(rotStep) - player.dirY * Math.sin(rotStep);
            player.dirY = oldDirX * Math.sin(rotStep) + player.dirY * Math.cos(rotStep);
            let oldPlaneX = player.planeX;
            player.planeX = player.planeX * Math.cos(rotStep) - player.planeY * Math.sin(rotStep);
            player.planeY = oldPlaneX * Math.sin(rotStep) + player.planeY * Math.cos(rotStep);
        }
    }

    /**
     * Renders one complete frame to the game canvas using the DDA raycasting algorithm.
     * For each vertical screen column a ray is cast from the player's position;
     * the first wall hit determines the wall slice height and which texture column
     * to sample. Side walls (Y-axis hits) receive an extra darkness overlay for
     * depth cues. Also shows/hides the interaction prompt when a terminal is faced,
     * then calls drawMinimap().
     */
    function renderFrame() {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, screenWidth, screenHeight / 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, screenHeight / 2, screenWidth, screenHeight / 2);

        for(let x = 0; x < screenWidth; x++) {
            let cameraX = 2 * x / screenWidth - 1;
            let rayDirX = player.dirX + player.planeX * cameraX;
            let rayDirY = player.dirY + player.planeY * cameraX;

            let mapX = Math.floor(player.x);
            let mapY = Math.floor(player.y);

            let sideDistX, sideDistY;
            let deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
            let deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);
            let perpWallDist;
            let stepX, stepY;
            let hit = 0;
            let side;

            if (rayDirX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; }
            else              { stepX = 1;  sideDistX = (mapX + 1.0 - player.x) * deltaDistX; }
            if (rayDirY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; }
            else              { stepY = 1;  sideDistY = (mapY + 1.0 - player.y) * deltaDistY; }

            while (hit === 0) {
                if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
                else                       { sideDistY += deltaDistY; mapY += stepY; side = 1; }
                if (worldMap[mapY][mapX] > 0) hit = worldMap[mapY][mapX];
            }

            if (side === 0) perpWallDist = (sideDistX - deltaDistX);
            else            perpWallDist = (sideDistY - deltaDistY);

            let lineHeight = Math.floor(screenHeight / perpWallDist);
            let drawStart = -lineHeight / 2 + screenHeight / 2;
            if(drawStart < 0) drawStart = 0;
            let drawEnd = lineHeight / 2 + screenHeight / 2;
            if(drawEnd >= screenHeight) drawEnd = screenHeight - 1;

            let texCanvas;
            if (hit === 1) {
                texCanvas = textures.wall;
            } else if (hit === 2) {
                let term = terminals[mapX + ',' + mapY];
                texCanvas = (term && term.hacked) ? textures.terminalHacked : textures.terminalActive;
            }

            let wallX;
            if (side === 0) wallX = player.y + perpWallDist * rayDirY;
            else            wallX = player.x + perpWallDist * rayDirX;
            wallX -= Math.floor(wallX);

            let texX = Math.floor(wallX * TEX_WIDTH);
            if(side === 0 && rayDirX > 0) texX = TEX_WIDTH - texX - 1;
            if(side === 1 && rayDirY < 0) texX = TEX_WIDTH - texX - 1;

            ctx.drawImage(texCanvas, texX, 0, 1, TEX_HEIGHT, x, drawStart, 1, lineHeight);

            let shadow = (side === 1) ? 0.3 : 0.0;
            shadow += Math.min(perpWallDist * 0.1, 0.8);
            if (shadow > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, ' + shadow + ')';
                ctx.fillRect(x, drawStart, 1, lineHeight);
            }
        }

        if (gameState === 'EXPLORING') {
            let target = getFacedBlock();
            let prompt = document.getElementById('interaction-prompt');
            if (target.x >= 0 && target.x < mapWidth && target.y >= 0 && target.y < mapHeight && worldMap[target.y][target.x] === 2) {
                let term = terminals[target.x + ',' + target.y];
                if (term.hacked) {
                    prompt.innerText = "TERMINAL HACKED";
                    prompt.style.color = "#ff3333";
                } else {
                    prompt.innerText = "Press 'E' to Hack";
                    prompt.style.color = "#33ff33";
                }
                prompt.style.display = 'block';
            } else {
                prompt.style.display = 'none';
            }
        }

        drawMinimap();
    }

    /**
     * Draws the player-centred minimap onto the minimap canvas. The map scrolls
     * with the player; only tiles within a computed range are drawn. A green dot
     * marks the player's position and a short line indicates their facing direction.
     * The canvas is rotated so that "up" on the minimap matches the world's Y axis.
     */
    function drawMinimap() {
        mCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        mCtx.save();
        mCtx.translate(minimapCanvas.width / 2, minimapCanvas.height / 2);
        mCtx.fillStyle = '#777';

        let range = Math.ceil((minimapCanvas.width / 2) / minimapZoom) + 1;
        let startX = Math.floor(player.x) - range;
        let endX = Math.floor(player.x) + range;
        let startY = Math.floor(player.y) - range;
        let endY = Math.floor(player.y) + range;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) {
                    if (worldMap[y][x] > 0) {
                        let drawX = (x - player.x) * minimapZoom;
                        let drawY = -(y - player.y) * minimapZoom;
                        mCtx.fillRect(drawX, drawY - minimapZoom, minimapZoom + 0.5, minimapZoom + 0.5);
                    }
                }
            }
        }

        mCtx.fillStyle = '#33ff33';
        mCtx.beginPath();
        mCtx.arc(0, 0, 4, 0, Math.PI * 2);
        mCtx.fill();

        mCtx.strokeStyle = '#33ff33';
        mCtx.lineWidth = 2;
        mCtx.beginPath();
        mCtx.moveTo(0, 0);
        mCtx.lineTo(player.dirX * 10, -player.dirY * 10);
        mCtx.stroke();

        mCtx.restore();
    }

    generateTextures();
    initMap();
    requestAnimationFrame(gameLoop);
</script>
