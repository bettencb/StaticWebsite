---
layout: default
title: Raycaster Engine Visualizer
---

<style>
    body {
        background-color: #0f172a !important;
        color: #e2e8f0;
    }

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    main h1 {
        margin: 0 0 10px 0;
        font-size: 1.5rem;
        color: #38bdf8;
        text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }

    .container {
        display: flex;
        gap: 20px;
        background: #1e293b;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        flex-wrap: wrap;
        justify-content: center;
    }

    .view-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .view-label {
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-size: 0.85rem;
        color: #94a3b8;
    }

    canvas {
        background-color: #000;
        border: 2px solid #334155;
        border-radius: 8px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
    }

    #viewCanvas {
        image-rendering: pixelated;
    }

    .controls-panel {
        margin-top: 20px;
        background: #1e293b;
        padding: 15px 30px;
        border-radius: 8px;
        border: 1px solid #334155;
        text-align: center;
        line-height: 1.6;
    }

    kbd {
        background: #334155;
        padding: 3px 8px;
        border-radius: 4px;
        border-bottom: 2px solid #0f172a;
        font-family: monospace;
        color: #38bdf8;
        font-weight: bold;
    }
</style>

<h1>2D Vector to 3D Illusion Engine</h1>

<div class="container">
    <div class="view-panel">
        <div class="view-label">2D Mathematical Map (Vectors)</div>
        <canvas id="mapCanvas" width="400" height="400"></canvas>
    </div>
    
    <div class="view-panel">
        <div class="view-label">3D Player View (Raycasted)</div>
        <canvas id="viewCanvas" width="400" height="400"></canvas>
    </div>
</div>

<div class="controls-panel">
    <strong>Movement:</strong> <kbd>↑</kbd> Forward | <kbd>↓</kbd> Backward | <kbd>←</kbd> Turn Left | <kbd>→</kbd> Turn Right <br>
    <strong>Build:</strong> <kbd>Space</kbd> Place Block | <kbd>Shift</kbd> Destroy Block
</div>

<script>
    const mapCanvas = document.getElementById('mapCanvas');
    const mapCtx = mapCanvas.getContext('2d');
    const viewCanvas = document.getElementById('viewCanvas');
    const viewCtx = viewCanvas.getContext('2d');

    const VIEW_WIDTH = viewCanvas.width;
    const VIEW_HEIGHT = viewCanvas.height;
    const MAP_SIZE = mapCanvas.width;

    const mapCols = 16;
    const mapRows = 16;
    const cellSize = MAP_SIZE / mapCols;

    let map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let player = {
        x: 8.5,
        y: 8.5,
        angle: -Math.PI / 2,
        fov: Math.PI / 3,
        speed: 3.5,
        turnSpeed: 2.5
    };

    const MAX_DEPTH = 16.0;

    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    window.addEventListener('keydown', (e) => {
        if (Object.prototype.hasOwnProperty.call(keys, e.code)) {
            keys[e.code] = true;
            e.preventDefault();
        }

        let targetX = Math.floor(player.x + Math.cos(player.angle) * 1.5);
        let targetY = Math.floor(player.y + Math.sin(player.angle) * 1.5);

        if (targetX > 0 && targetX < mapCols - 1 && targetY > 0 && targetY < mapRows - 1) {
            if (e.code === 'Space') {
                map[targetY][targetX] = 1;
                e.preventDefault();
            }
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                map[targetY][targetX] = 0;
                e.preventDefault();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (Object.prototype.hasOwnProperty.call(keys, e.code)) {
            keys[e.code] = false;
            e.preventDefault();
        }
    });

    let lastTime = performance.now();

    function update(deltaTime) {
        if (keys.ArrowLeft) player.angle -= player.turnSpeed * deltaTime;
        if (keys.ArrowRight) player.angle += player.turnSpeed * deltaTime;

        player.angle = player.angle % (2 * Math.PI);
        if (player.angle < 0) player.angle += (2 * Math.PI);

        let moveStep = 0;
        if (keys.ArrowUp) moveStep = player.speed * deltaTime;
        if (keys.ArrowDown) moveStep = -player.speed * deltaTime;

        if (moveStep !== 0) {
            let newX = player.x + Math.cos(player.angle) * moveStep;
            let newY = player.y + Math.sin(player.angle) * moveStep;

            if (map[Math.floor(player.y)][Math.floor(newX)] === 0) {
                player.x = newX;
            }
            if (map[Math.floor(newY)][Math.floor(player.x)] === 0) {
                player.y = newY;
            }
        }
    }

    function render() {
        mapCtx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

        viewCtx.fillStyle = '#0f172a';
        viewCtx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT / 2);
        viewCtx.fillStyle = '#1e293b';
        viewCtx.fillRect(0, VIEW_HEIGHT / 2, VIEW_WIDTH, VIEW_HEIGHT / 2);

        for (let y = 0; y < mapRows; y++) {
            for (let x = 0; x < mapCols; x++) {
                if (map[y][x] === 1) {
                    mapCtx.fillStyle = '#475569';
                    mapCtx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                } else {
                    mapCtx.fillStyle = '#1e293b';
                    mapCtx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                }
            }
        }

        for (let x = 0; x < VIEW_WIDTH; x++) {
            let rayAngle = (player.angle - player.fov / 2.0) + (x / VIEW_WIDTH) * player.fov;

            let eyeX = Math.cos(rayAngle);
            let eyeY = Math.sin(rayAngle);

            let distanceToWall = 0;
            let hitWall = false;
            let isBoundary = false;

            while (!hitWall && distanceToWall < MAX_DEPTH) {
                distanceToWall += 0.05;

                let testX = Math.floor(player.x + eyeX * distanceToWall);
                let testY = Math.floor(player.y + eyeY * distanceToWall);

                if (testX < 0 || testX >= mapCols || testY < 0 || testY >= mapRows) {
                    hitWall = true;
                    distanceToWall = MAX_DEPTH;
                } else if (map[testY][testX] === 1) {
                    hitWall = true;

                    let p = [];
                    for (let tx = 0; tx < 2; tx++) {
                        for (let ty = 0; ty < 2; ty++) {
                            let vy = testY + ty - player.y;
                            let vx = testX + tx - player.x;
                            let d = Math.sqrt(vx * vx + vy * vy);
                            let dot = (eyeX * vx / d) + (eyeY * vy / d);
                            p.push([d, dot]);
                        }
                    }
                    p.sort((a, b) => a[0] - b[0]);
                    if (Math.acos(Math.min(1, Math.max(-1, p[0][1]))) < 0.005 ||
                        Math.acos(Math.min(1, Math.max(-1, p[1][1]))) < 0.005) {
                        isBoundary = true;
                    }
                }
            }

            if (x % 8 === 0) {
                mapCtx.beginPath();
                mapCtx.moveTo(player.x * cellSize, player.y * cellSize);
                mapCtx.lineTo((player.x + eyeX * distanceToWall) * cellSize, (player.y + eyeY * distanceToWall) * cellSize);
                mapCtx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
                mapCtx.stroke();
            }

            let correctedDistance = distanceToWall * Math.cos(rayAngle - player.angle);

            let ceiling = (VIEW_HEIGHT / 2.0) - VIEW_HEIGHT / correctedDistance;
            let floor = VIEW_HEIGHT - ceiling;
            let wallHeight = floor - ceiling;

            if (distanceToWall < MAX_DEPTH) {
                let shade = 255 - Math.floor((distanceToWall / MAX_DEPTH) * 255);
                shade = Math.max(0, Math.min(255, shade));

                if (isBoundary) {
                    viewCtx.fillStyle = `rgb(${Math.floor(shade / 3)}, ${Math.floor(shade / 3)}, ${Math.floor(shade / 3)})`;
                } else {
                    viewCtx.fillStyle = `rgb(${Math.floor(shade / 1.5)}, ${Math.floor(shade / 1.3)}, ${shade})`;
                }

                viewCtx.fillRect(x, ceiling, 1, wallHeight);
            }
        }

        mapCtx.beginPath();
        mapCtx.arc(player.x * cellSize, player.y * cellSize, 4, 0, Math.PI * 2);
        mapCtx.fillStyle = '#38bdf8';
        mapCtx.fill();

        mapCtx.beginPath();
        mapCtx.moveTo(player.x * cellSize, player.y * cellSize);
        mapCtx.lineTo((player.x + Math.cos(player.angle) * 2) * cellSize, (player.y + Math.sin(player.angle) * 2) * cellSize);
        mapCtx.strokeStyle = '#fff';
        mapCtx.lineWidth = 2;
        mapCtx.stroke();
        mapCtx.lineWidth = 1;

        viewCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        viewCtx.fillRect(VIEW_WIDTH / 2 - 2, VIEW_HEIGHT / 2 - 2, 4, 4);
    }

    function gameLoop() {
        let now = performance.now();
        let deltaTime = (now - lastTime) / 1000.0;
        lastTime = now;

        update(deltaTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    viewCanvas.addEventListener('click', () => {
        viewCanvas.focus();
    });
</script>
