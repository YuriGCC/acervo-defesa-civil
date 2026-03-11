const gameLevels = [
    {
        level: 1,
        title: 'Riscos e Atitudes Corretas',
        pairs: [
            { id: 1, risk: { icon: '🚰', text: 'Bueiro cheio de lixo' }, action: { icon: '🚫', text: 'Não jogar lixo na rua' } },
            { id: 2, risk: { icon: '🌧️', text: 'Chuva muito forte' }, action: { icon: '🏠', text: 'Procurar abrigo seguro' } },
            { id: 3, risk: { icon: '⛰️', text: 'Barranco sem vegetação' }, action: { icon: '🌳', text: 'Plantar árvores e proteger o solo' } },
            { id: 4, risk: { icon: '⚡', text: 'Fio elétrico caído' }, action: { icon: '👨', text: 'Avisar um adulto ou autoridades responsáveis' } },
            { id: 5, risk: { icon: '🌊', text: 'Rua alagada' }, action: { icon: '🚷', text: 'Evitar passar pelo local alagado' } },
            { id: 6, risk: { icon: '🌲', text: 'Árvore com risco de queda' }, action: { icon: '📞', text: 'Comunicar a Defesa Civil ou a prefeitura' } },
            { id: 7, risk: { icon: '🗑️', text: 'Terreno com descarte irregular de lixo' }, action: { icon: '🧹', text: 'Manter o terreno limpo' } }
        ]
    },
    {
        level: 2,
        title: 'Desastres Naturais e Prevenção',
        pairs: [
            { id: 8, risk: { icon: '🌊', text: 'Alagamento' }, action: { icon: '🚰', text: 'Manter bueiros limpos' } },
            { id: 11, risk: { icon: '🏔️', text: 'Deslizamento de terra' }, action: { icon: '🌿', text: 'Preservar vegetação em morros e encostas' } },
            { id: 12, risk: { icon: '⛈️', text: 'Tempestade forte' }, action: { icon: '🏠', text: 'Procurar abrigo seguro longe de árvores' } },
            { id: 13, risk: { icon: '💨', text: 'Vendaval' }, action: { icon: '🚫', text: 'Ficar longe de árvores e postes' } },
            { id: 14, risk: { icon: '🧊', text: 'Granizo' }, action: { icon: '🏘️', text: 'Proteger-se em local coberto' } },
            { id: 15, risk: { icon: '💧', text: 'Alagamento urbano' }, action: { icon: '🚷', text: 'Não atravessar áreas inundadas' } }
        ]
    },
    {
        level: 3,
        title: 'Sinais de Risco',
        pairs: [
            { id: 16, risk: { icon: '🗑️', text: 'Lixo no rio' }, action: { icon: '🌊', text: 'Pode causar enchentes' } },
            { id: 17, risk: { icon: '🏚️', text: 'Casa construída em encosta íngreme' }, action: { icon: '⛰️', text: 'Pode provocar deslizamentos' } },
            { id: 18, risk: { icon: '⚡', text: 'Fiação elétrica exposta' }, action: { icon: '⚠️', text: 'Risco de choque elétrico' } },
            { id: 19, risk: { icon: '🚰', text: 'Bueiro entupido' }, action: { icon: '💧', text: 'Pode causar alagamentos' } },
            { id: 20, risk: { icon: '🌳', text: 'Árvore muito inclinada' }, action: { icon: '💨', text: 'Pode cair com vento ou chuva' } },
            { id: 21, risk: { icon: '🪨', text: 'Barranco com rachaduras' }, action: { icon: '🏔️', text: 'Sinal de possível deslizamento de terra' } }
        ]
    },
    {
        level: 4,
        title: 'Elementos da Defesa Civil',
        pairs: [
            { id: 22, risk: { icon: '🚨', text: 'Mensagem de alerta' }, action: { icon: '⚠️', text: 'Avisar sobre perigo ou emergência' } },
            { id: 23, risk: { icon: '👮', text: 'Agente da Defesa Civil' }, action: { icon: '🛡️', text: 'Ajudar e proteger a população' } },
            { id: 24, risk: { icon: '🏢', text: 'Abrigo seguro' }, action: { icon: '🏠', text: 'Local seguro para se proteger' } },
            { id: 25, risk: { icon: '🗺️', text: 'Mapa de risco' }, action: { icon: '📍', text: 'Mostrar áreas com risco de desastre' } },
            { id: 26, risk: { icon: '💻', text: 'Site da proteção e defesa civil' }, action: { icon: 'ℹ️', text: 'Fornecer informação confiável à população' } }
        ]
    }
];

let currentLevel = 0, score = 0, matchedPairs = 0, draggedCard = null, connections = [];
let currentTouchPos = null;

const soundCorrect = new Audio('assets/acerto.mp3'), soundError = new Audio('assets/erro.mp3');
const introScreen = document.getElementById('introScreen'), gameScreen = document.getElementById('gameScreen'), completionScreen = document.getElementById('completionScreen');
const scoreElement = document.getElementById('score'), levelElement = document.getElementById('level'), feedback = document.getElementById('feedback');
const risksContainer = document.getElementById('risksContainer'), actionsContainer = document.getElementById('actionsContainer');
const canvas = document.getElementById('connectionsCanvas'), ctx = canvas.getContext('2d');

document.getElementById('btnStart').addEventListener('click', startGame);
document.getElementById('btnRestart').addEventListener('click', restartGame);
window.addEventListener('resize', resizeCanvas);
document.getElementById('btnBack').addEventListener('click', () => { if (confirm('Sair do jogo?')) window.location.href = '../../index.html'; });

function startGame() { introScreen.classList.add('hidden'); gameScreen.classList.remove('hidden'); resizeCanvas(); loadLevel(); }
function restartGame() { currentLevel = 0; score = 0; matchedPairs = 0; connections = []; completionScreen.classList.add('hidden'); gameScreen.classList.remove('hidden'); updateScore(); loadLevel(); }

function resizeCanvas() {
    const board = document.querySelector('.game-board');
    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;
    drawConnections();
}

function loadLevel() {
    if (currentLevel >= gameLevels.length) return showCompletion();
    matchedPairs = 0; connections = [];
    const level = gameLevels[currentLevel];
    levelElement.textContent = level.level;
    document.getElementById('instruction').textContent = `Nível ${level.level}: ${level.title}`;
    risksContainer.innerHTML = ''; actionsContainer.innerHTML = '';

    level.pairs.forEach(pair => {
        const riskCard = createCard(pair.risk, 'risk', pair.id);
        setupInteraction(riskCard);
        risksContainer.appendChild(riskCard);
    });

    shuffleArray([...level.pairs]).forEach(pair => {
        const actionCard = createCard(pair.action, 'action', pair.id);
        actionsContainer.appendChild(actionCard);
    });
    resizeCanvas();
}

function createCard(data, type, pairId) {
    const card = document.createElement('div');
    card.className = `card ${type}`;
    card.dataset.pairId = pairId;
    card.innerHTML = `<div class="card-icon">${data.icon}</div><div class="card-text">${data.text}</div>`;
    return card;
}

function setupInteraction(card) {
    card.draggable = true;

    // MOUSE EVENTS
    card.addEventListener('dragstart', (e) => {
        if (card.classList.contains('matched')) return;
        draggedCard = card;
        card.classList.add('dragging');
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    });

    document.addEventListener('dragover', (e) => {
        if (!draggedCard) return;
        e.preventDefault();
        const boardRect = canvas.getBoundingClientRect();
        currentTouchPos = { x: e.clientX - boardRect.left, y: e.clientY - boardRect.top };

        // Highlight Drop Zone
        const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card.action');
        document.querySelectorAll('.card.action').forEach(c => c.classList.remove('drop-zone'));
        if (target && !target.classList.contains('matched')) target.classList.add('drop-zone');

        drawConnections();
    });

    card.addEventListener('dragend', () => {
        draggedCard?.classList.remove('dragging');
        currentTouchPos = null;
        document.querySelectorAll('.card.action').forEach(c => c.classList.remove('drop-zone'));
        drawConnections();
    });

    // TOUCH EVENTS (TV)
    card.addEventListener('touchstart', (e) => {
        if (card.classList.contains('matched')) return;
        draggedCard = card;
        card.classList.add('dragging');
    });

    document.addEventListener('touchmove', (e) => {
        if (!draggedCard) return;
        const touch = e.touches[0];
        const boardRect = canvas.getBoundingClientRect();
        currentTouchPos = { x: touch.clientX - boardRect.left, y: touch.clientY - boardRect.top };

        const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.card.action');
        document.querySelectorAll('.card.action').forEach(c => c.classList.remove('drop-zone'));
        if (target && !target.classList.contains('matched')) target.classList.add('drop-zone');

        drawConnections();
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (!draggedCard) return;
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.card.action');

        if (target && !target.classList.contains('matched')) {
            checkMatch(draggedCard, target);
        }
        draggedCard.classList.remove('dragging');
        draggedCard = null;
        currentTouchPos = null;
        document.querySelectorAll('.card.action').forEach(c => c.classList.remove('drop-zone'));
        drawConnections();
    });
}

function checkMatch(risk, action) {
    if (risk.dataset.pairId === action.dataset.pairId) {
        handleCorrectMatch(risk, action);
    } else {
        handleIncorrectMatch(risk);
    }
}

function handleCorrectMatch(risk, action) {
    risk.classList.add('matched'); action.classList.add('matched');
    connections.push({ riskId: risk.dataset.pairId, actionId: action.dataset.pairId });
    score += 10; matchedPairs++;
    updateScore();
    soundCorrect.play().catch(() => { });
    showFeedback('✅ Correto!', 'correct');
    drawConnections();

    if (matchedPairs === gameLevels[currentLevel].pairs.length) {
        setTimeout(() => {
            currentLevel++;
            if (currentLevel < gameLevels.length) loadLevel();
            else showCompletion();
        }, 1500);
    }
}

function handleIncorrectMatch(risk) {
    soundError.play().catch(() => { });
    risk.classList.add('shake');
    setTimeout(() => risk.classList.remove('shake'), 500);
    showFeedback('❌ Tente novamente', 'incorrect');
}

function drawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const boardRect = canvas.getBoundingClientRect();

    // Linhas fixas (Acertos)
    connections.forEach(conn => {
        const r = document.querySelector(`.card.risk[data-pair-id="${conn.riskId}"]`);
        const a = document.querySelector(`.card.action[data-pair-id="${conn.actionId}"]`);
        if (r && a) drawBezier(r, a, boardRect, '#28a745', 6);
    });

    // Linha temporária (Durante o Drag)
    if (draggedCard && currentTouchPos) {
        const rRect = draggedCard.getBoundingClientRect();
        const startX = rRect.right - boardRect.left;
        const startY = rRect.top + (rRect.height / 2) - boardRect.top;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(startX + 50, startY, currentTouchPos.x - 50, currentTouchPos.y, currentTouchPos.x, currentTouchPos.y);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Círculo no dedo
        ctx.beginPath();
        ctx.arc(currentTouchPos.x, currentTouchPos.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
    }
}

function drawBezier(r, a, boardRect, color, width) {
    const rRect = r.getBoundingClientRect(), aRect = a.getBoundingClientRect();
    const sX = rRect.right - boardRect.left, sY = rRect.top + (rRect.height / 2) - boardRect.top;
    const eX = aRect.left - boardRect.left, eY = aRect.top + (aRect.height / 2) - boardRect.top;
    ctx.beginPath();
    ctx.moveTo(sX, sY);
    ctx.bezierCurveTo(sX + 80, sY, eX - 80, eY, eX, eY);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath(); ctx.arc(sX, sY, 8, 0, 7); ctx.arc(eX, eY, 8, 0, 7); ctx.fillStyle = color; ctx.fill();
}

function showFeedback(msg, type) {
    feedback.textContent = msg; feedback.className = `feedback ${type}`;
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('hidden'), 1500);
}

function updateScore() { scoreElement.textContent = score; }
function showCompletion() { gameScreen.classList.add('hidden'); completionScreen.classList.remove('hidden'); document.getElementById('finalScore').textContent = score; }
function shuffleArray(arr) { return arr.sort(() => Math.random() - 0.5); }