---
layout: game
title: Secure Vault Breaker 3D
---
<style>
    body, html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        overflow: hidden;
        font-family: 'Courier New', Courier, monospace;
    }
    #game-canvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
    }
    #hud {
        position: absolute;
        top: 10px;
        right: 20px;
        color: #33ff33;
        font-size: 1.2rem;
        font-weight: bold;
        text-shadow: 2px 2px 0 #000;
        pointer-events: none;
        z-index: 5;
    }
    #timer-display {
        position: absolute;
        top: 10px;
        left: 20px;
        color: #33ff33;
        font-size: 1.2rem;
        font-weight: bold;
        text-shadow: 2px 2px 0 #000;
        pointer-events: none;
        z-index: 5;
    }
    #crosshair {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 5;
    }
    #minimap {
        position: absolute;
        bottom: 20px;
        left: 20px;
        border-radius: 50%;
        border: 2px solid #33ff33;
        background-color: rgba(0, 0, 0, 0.6);
        pointer-events: none;
        z-index: 5;
        box-shadow: 0 0 10px rgba(51, 255, 51, 0.3);
    }
    #interaction-prompt {
        position: absolute;
        bottom: 20%;
        width: 100%;
        text-align: center;
        color: #fff;
        font-size: 1.5rem;
        text-shadow: 2px 2px 0 #000;
        display: none;
        pointer-events: none;
        z-index: 5;
    }
    #terminal-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }
    .widget-container {
        border: 2px solid #33ff33;
        padding: 20px;
        width: 500px;
        background-color: #000;
        box-shadow: 0 0 20px rgba(51, 255, 51, 0.4);
    }
    .widget-container h2 {
        margin-top: 0;
        border-bottom: 1px dashed #33ff33;
        padding-bottom: 10px;
        text-align: center;
        letter-spacing: 2px;
        color: #33ff33;
    }
    .dashboard {
        margin-bottom: 20px;
        font-size: 0.95em;
        background-color: #111;
        padding: 10px;
        border: 1px solid #222;
        color: #33ff33;
    }
    .dashboard div { margin: 5px 0; }
    .input-area {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    #guessInput {
        background-color: #050505;
        color: #33ff33;
        border: 1px solid #33ff33;
        padding: 10px;
        font-family: inherit;
        font-size: 1.5em;
        flex-grow: 1;
        letter-spacing: 10px;
        text-align: center;
    }
    #guessInput:focus {
        outline: none;
        background-color: #1a1a1a;
        box-shadow: 0 0 5px #33ff33;
    }
    .btn {
        background-color: #33ff33;
        color: #000;
        border: none;
        padding: 10px 20px;
        font-family: inherit;
        font-weight: bold;
        font-size: 1em;
        cursor: pointer;
        transition: background 0.2s;
    }
    .btn:hover { background-color: #66ff66; }
    .btn:disabled { background-color: #225522; color: #111; cursor: not-allowed; }
    .btn-exit { background-color: #ff3333; }
    .btn-exit:hover { background-color: #ff6666; }
    .log-area {
        height: 250px;
        overflow-y: auto;
        border-top: 1px dashed #33ff33;
        padding-top: 10px;
        font-size: 0.9em;
        line-height: 1.4;
        color: #33ff33;
    }
    .log-entry { margin: 6px 0; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #33ff33; }
    ::-webkit-scrollbar-thumb:hover { background: #66ff66; }
    #victory-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 20;
    }
    #victory-overlay .widget-container {
        border-color: #ffd700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        text-align: center;
    }
    #victory-overlay h2 {
        color: #ffd700;
        border-bottom-color: #ffd700;
    }
</style>

<canvas id="game-canvas"></canvas>

<div id="timer-display">Time: <span id="time-val">00:00</span></div>
<div id="hud">Terminals Remaining: <span id="hud-terminals">0</span></div>
<div id="crosshair"></div>
<canvas id="minimap" width="160" height="160"></canvas>
<div id="interaction-prompt">Press 'E' to Interact</div>

<div id="terminal-overlay">
    <div class="widget-container">
        <h2>&#128272; SECURE VAULT BREAKER</h2>
        <div class="dashboard">
            <div><strong>Status:</strong> <span id="term-status">&#128994; Online - Awaiting Input</span></div>
            <div><strong>Target:</strong> 4-Digit Sequence</div>
            <div><strong>Valid Characters:</strong> Digits 0 through 9</div>
            <div><strong>Firewall Limit:</strong> <span id="term-attempts">10</span> Attempts Remaining</div>
        </div>
        <div class="input-area">
            <input type="text" id="guessInput" maxlength="4" placeholder="____" autocomplete="off">
            <button class="btn" id="submitBtn" onclick="submitGuess()">HACK</button>
            <button class="btn btn-exit" onclick="closeTerminal()">QUIT [Q]</button>
        </div>
        <div class="log-area" id="logArea"></div>
    </div>
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

<script>
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

    function updateHUD() {
        document.getElementById('hud-terminals').innerText = (totalTerminals - hackedTerminals) + ' / ' + totalTerminals;
    }

    document.addEventListener('keydown', function(e) {
        if (!timerStarted && !gameFinished && gameState === 'EXPLORING') {
            timerStarted = true;
            startTime = performance.now();
        }
        if (gameState === 'EXPLORING') {
            if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                e.preventDefault();
                editWorld(e.code === 'Space');
            }
            if (e.code === 'KeyE') interact();
        } else if (gameState === 'TERMINAL') {
            if (e.code === 'KeyQ') closeTerminal();
            if (e.code === 'Enter') submitGuess();
        }
    });

    document.addEventListener('keyup', function(e) {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    });

    function getFacedBlock() {
        let checkX = Math.floor(player.x + player.dirX * 1.5);
        let checkY = Math.floor(player.y + player.dirY * 1.5);
        return {x: checkX, y: checkY};
    }

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

    function openTerminal(terminalObj) {
        currentTerminal = terminalObj;
        gameState = 'TERMINAL';
        attemptsLeft = 10;
        isGameOver = false;

        document.getElementById('terminal-overlay').style.display = 'flex';
        document.getElementById('term-attempts').innerText = attemptsLeft;
        document.getElementById('term-status').innerText = "\u{1F7E2} Online - Awaiting Input";
        document.getElementById('term-status').style.color = "#33ff33";
        document.getElementById('guessInput').value = '';
        document.getElementById('guessInput').disabled = false;
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('logArea').innerHTML =
            '<div class="log-entry">[SYS] Terminal connection established.</div>' +
            '<div class="log-entry">[SYS] Target encrypted. Digits 0-9 required.</div>' +
            '<div class="log-entry">[SYS] Awaiting input...</div>';

        setTimeout(function() { document.getElementById('guessInput').focus(); }, 50);
        keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
    }

    function closeTerminal() {
        document.getElementById('terminal-overlay').style.display = 'none';
        gameState = 'EXPLORING';
        currentTerminal = null;
        canvas.focus();
    }

    function submitGuess() {
        if (isGameOver || !currentTerminal) return;

        const guessStr = document.getElementById('guessInput').value;
        const logArea = document.getElementById('logArea');

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
            currentTerminal.hacked = true;
            hackedTerminals++;
            updateHUD();
            document.getElementById('term-status').innerText = "\u{1F7E2} SYSTEM BYPASSED";
            document.getElementById('guessInput').disabled = true;
            document.getElementById('submitBtn').disabled = true;
            logArea.innerHTML +=
                '<div class="log-entry" style="color:#33ff33; font-weight:bold; margin-top:15px;">[SUCCESS] Perfect match detected.</div>' +
                '<div class="log-entry">[SUCCESS] Decryption successful. Terminal unlocked.</div>';

            if (hackedTerminals >= totalTerminals) {
                gameFinished = true;
                document.getElementById('final-time').innerText = formatTime(performance.now() - startTime);
                logArea.innerHTML += '<div class="log-entry" style="color:#ffd700; font-size:1.2em; margin-top:15px; font-weight:bold;">[!] ALL TERMINALS HACKED. MISSION ACCOMPLISHED.</div>';
                setTimeout(showVictoryScreen, 1500);
            }
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

    function showVictoryScreen() {
        document.getElementById('terminal-overlay').style.display = 'none';
        document.getElementById('victory-overlay').style.display = 'flex';
        gameState = 'VICTORY';
    }

    function closeVictory() {
        document.getElementById('victory-overlay').style.display = 'none';
        gameState = 'EXPLORING';
        canvas.focus();
    }

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
        document.getElementById('time-val').innerText = "00:00";
        initMap();
        canvas.focus();
    }

    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    let lastTime = 0;

    function gameLoop(timestamp) {
        let frameTime = (timestamp - lastTime) / 1000.0;
        if (isNaN(frameTime)) frameTime = 0.016;
        lastTime = timestamp;

        if (timerStarted && !gameFinished) {
            document.getElementById('time-val').innerText = formatTime(performance.now() - startTime);
        }

        if (gameState === 'EXPLORING') updatePlayer(frameTime);
        renderFrame();
        requestAnimationFrame(gameLoop);
    }

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
            if (worldMap[target.y][target.x] === 2) {
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
                        let drawY = (y - player.y) * minimapZoom;
                        mCtx.fillRect(drawX, drawY, minimapZoom + 0.5, minimapZoom + 0.5);
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
        mCtx.lineTo(player.dirX * 10, player.dirY * 10);
        mCtx.stroke();

        mCtx.restore();
    }

    generateTextures();
    initMap();
    requestAnimationFrame(gameLoop);
</script>
