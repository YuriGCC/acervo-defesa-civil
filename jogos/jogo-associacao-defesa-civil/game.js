const gameLevels = [
    {
        level: 1,
        title: 'Riscos e Atitudes Corretas',
        pairs: [
            { id: 1, risk: { icon: '🚱', text: 'Bueiro entupido de lixo causa alagamento' }, action: { icon: '🚮', text: 'Não jogar lixo na rua ou na calçada' } },
            { id: 2, risk: { icon: '⛈️', text: 'Chuva muito forte com raios e ventos' }, action: { icon: '🏠', text: 'Entre em um lugar seguro e fique longe de janelas' } },
            { id: 3, risk: { icon: '⛰️', text: 'Barranco sem plantas pode desmoronar' }, action: { icon: '🌱', text: 'Plante árvores para segurar a terra no barranco' } },
            { id: 4, risk: { icon: '⚡', text: 'Fio elétrico caído no chão ou na rua' }, action: { icon: '⚠️📢', text: 'Não toque! Avise um adulto ou ligue para a prefeitura' } },
            { id: 5, risk: { icon: '🌲', text: 'Árvore torta ou podre perto de casas' }, action: { icon: '📞', text: 'Avise a Defesa Civil — não tente cortar sozinho' } },
            { id: 6, risk: { icon: '🚯', text: 'Lixo em terrenos cria focos de doenças e obstrui o rio' }, action: { icon: '🧹🚮♻️', text: 'Descarte o lixo corretamente' } },
        ]
    },
    {
        level: 2,
        title: 'Sinais de Risco',
        pairs: [
            { id: 7, risk: { icon: '🗑️', text: 'Lixo no rio bloqueia a passagem da água' }, action: { icon: '🌊', text: 'A água transborda e provoca enchente na rua' } },
            { id: 8, risk: { icon: '🏚️', text: 'Casa construída no alto de um barranco' }, action: { icon: '⛰️', text: 'A terra pode escorregar e causar deslizamento' } },
            { id: 9, risk: { icon: '⚡', text: 'Fio elétrico sem proteção ou com a capa rasgada' }, action: { icon: '⚠️', text: 'Pode dar choque elétrico em quem tocar' } },
            { id: 10, risk: { icon: '🚰', text: 'Bueiro entupido não deixa a água escoar' }, action: { icon: '💧', text: 'Pode causar alagamento na rua' } },
            { id: 11, risk: { icon: '🌳', text: 'Árvore muito inclinada com raízes soltas' }, action: { icon: '💨', text: 'Pode tombar com vento forte e machucar alguém' } },
            { id: 12, risk: { icon: '🪨', text: 'Barranco com fendas e rachaduras no solo' }, action: { icon: '🏔️', text: 'A terra está se soltando — risco de desmoronamento' } },
        ]
    },
    {
        level: 3,
        title: 'Elementos da Defesa Civil',
        pairs: [
            { id: 13, risk: { icon: '🚨📲', text: 'Alerta da Defesa Civil no celular ou rádio' }, action: { icon: '⚠️', text: 'Indica que há perigo próximo — siga as instruções!' } },
            { id: 14, risk: { icon: '👮', text: 'Agente da Defesa Civil no campo' }, action: { icon: '🛡️📣', text: 'Orienta famílias a sair de áreas de risco com segurança' } },
            { id: 15, risk: { icon: '🏢', text: 'Escola ou ginásio usado como abrigo' }, action: { icon: '🏠', text: 'Local onde famílias ficam protegidas durante desastres' } },
            { id: 16, risk: { icon: '🗺️', text: 'Mapa de risco da cidade' }, action: { icon: '📍', text: 'Marca os locais onde há maior perigo de enchente ou deslizamento' } },
            { id: 17, risk: { icon: '💻', text: 'Site oficial da Defesa Civil' }, action: { icon: ' 🌐ℹ️', text: 'Onde buscar avisos, mapas e orientações em caso de emergência' } },
        ]
    }
];
let currentLevel = 0, score = 0, matchedPairs = 0, draggedCard = null, connections = [];
let currentTouchPos = null;
let selectedCard = null;
const anunciar = criarAnunciador();

const soundCorrect = new Audio('assets/acerto.mp3'), soundError = new Audio('assets/erro.mp3');
const introScreen = document.getElementById('introScreen'), gameScreen = document.getElementById('gameScreen'), completionScreen = document.getElementById('completionScreen');
const scoreElement = document.getElementById('score'), levelElement = document.getElementById('level'), feedback = document.getElementById('feedback');
const risksContainer = document.getElementById('risksContainer'), actionsContainer = document.getElementById('actionsContainer');
const canvas = document.getElementById('connectionsCanvas'), ctx = canvas.getContext('2d');

document.getElementById('btnStart').addEventListener('click', startGame);
document.getElementById('btnRestart').addEventListener('click', restartGame);
window.addEventListener('resize', resizeCanvas);
document.getElementById('btnBack').addEventListener('click', () => {
    if (window.parent && window.parent.ponte) {
        window.parent.ponte.emitir('VOLTAR_MENU');
    } else if (confirm('Sair do jogo?')) {
        window.location.href = '../../index.html';
    }
});

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

    selectedCard = null;

    level.pairs.forEach(pair => {
        const riskCard = createCard(pair.risk, 'risk', pair.id);
        setupInteraction(riskCard);
        risksContainer.appendChild(riskCard);
    });

    shuffleArray([...level.pairs]).forEach(pair => {
        const actionCard = createCard(pair.action, 'action', pair.id);
        setupInteraction(actionCard);
        actionsContainer.appendChild(actionCard);
    });
    resizeCanvas();

    anunciar(`Nível ${level.level}: ${level.title}. Use Tab para navegar entre os cards e Enter para selecionar uma situação e a prevenção correspondente.`);
}

function createCard(data, type, pairId) {
    const card = document.createElement('div');
    card.className = `card ${type}`;
    card.dataset.pairId = pairId;
    // role="button" + aria-label tornam o card acessível por teclado e leitores de tela
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${type === 'risk' ? 'Situação' : 'Prevenção'}: ${data.text}`);
    card.innerHTML = `<div class="card-icon" aria-hidden="true">${data.icon}</div><div class="card-text">${data.text}</div>`;
    return card;
}

// Seleciona/combina cards via teclado: primeiro Enter escolhe o card,
// o segundo Enter em um card do tipo oposto tenta formar o par (mesma lógica do drag-and-drop).
function toggleSelectCard(card) {
    if (card.classList.contains('matched')) return;

    if (selectedCard === card) {
        card.classList.remove('selected');
        card.setAttribute('aria-pressed', 'false');
        selectedCard = null;
        anunciar('Seleção cancelada.');
        return;
    }

    if (!selectedCard) {
        selectedCard = card;
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        anunciar(`${card.getAttribute('aria-label')} selecionado. Escolha o par correspondente e pressione Enter.`);
        return;
    }

    const mesmoTipo = selectedCard.classList.contains('risk') === card.classList.contains('risk');
    if (mesmoTipo) {
        selectedCard.classList.remove('selected');
        selectedCard.setAttribute('aria-pressed', 'false');
        selectedCard = card;
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        anunciar(`${card.getAttribute('aria-label')} selecionado. Escolha o par correspondente e pressione Enter.`);
        return;
    }

    const risk = selectedCard.classList.contains('risk') ? selectedCard : card;
    const action = selectedCard.classList.contains('risk') ? card : selectedCard;

    selectedCard.classList.remove('selected');
    selectedCard.setAttribute('aria-pressed', 'false');
    selectedCard = null;

    checkMatch(risk, action);
}

// Marca se o arraste realmente moveu (evita dar feedback de "errado" num simples toque/clique
// sem arrastar, e é usado para decidir se um solto fora de um alvo válido conta como erro).
let dragMoved = false;

function setupInteraction(card) {
    card.draggable = true;

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            toggleSelectCard(card);
        }
    });

    // MOUSE EVENTS
    card.addEventListener('dragstart', (e) => {
        if (card.classList.contains('matched')) return;
        draggedCard = card;
        dragMoved = false;
        card.classList.add('dragging');
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
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
        dragMoved = false;
        card.classList.add('dragging');
    });
}

// Registrados uma única vez (não por card) para não empilhar listeners duplicados a
// cada nível carregado — antes isso acontecia dentro de setupInteraction().
document.addEventListener('dragover', (e) => {
    if (!draggedCard) return;
    e.preventDefault();
    dragMoved = true;
    const boardRect = canvas.getBoundingClientRect();
    currentTouchPos = { x: e.clientX - boardRect.left, y: e.clientY - boardRect.top };

    // Highlight Drop Zone
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card.action');
    document.querySelectorAll('.card.action').forEach(c => c.classList.remove('drop-zone'));
    if (target && !target.classList.contains('matched')) target.classList.add('drop-zone');

    drawConnections();
});

// Sem isso, soltar o mouse nunca verificava acerto/erro (faltava o listener de 'drop').
document.addEventListener('drop', (e) => {
    if (!draggedCard) return;
    e.preventDefault();
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card.action');

    if (target && !target.classList.contains('matched')) {
        checkMatch(draggedCard, target);
    } else if (dragMoved) {
        // Soltou fora de qualquer card de ação válido: conta como tentativa errada,
        // em vez de não dar nenhum feedback pra criança.
        handleIncorrectMatch(draggedCard);
    }
});

document.addEventListener('touchmove', (e) => {
    if (!draggedCard) return;
    dragMoved = true;
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
    } else if (dragMoved) {
        // Soltou o dedo fora de qualquer card de ação válido: conta como tentativa errada,
        // em vez de não dar nenhum feedback pra criança (o bug relatado no nível 1).
        handleIncorrectMatch(draggedCard);
    }
    draggedCard.classList.remove('dragging');
    draggedCard = null;
    currentTouchPos = null;
    document.querySelectorAll('.card.action').forEach(c => c.classList.remove('drop-zone'));
    drawConnections();
});

function checkMatch(risk, action) {
    if (risk.dataset.pairId === action.dataset.pairId) {
        handleCorrectMatch(risk, action);
    } else {
        handleIncorrectMatch(risk);
    }
}

function handleCorrectMatch(risk, action) {
    risk.classList.add('matched'); action.classList.add('matched');
    risk.setAttribute('tabindex', '-1'); action.setAttribute('tabindex', '-1');
    risk.setAttribute('aria-disabled', 'true'); action.setAttribute('aria-disabled', 'true');
    risk.setAttribute('aria-pressed', 'true');
    action.setAttribute('aria-pressed', 'true');
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
    setTimeout(() => {
        risk.classList.remove('shake');
        risk.setAttribute('aria-pressed', 'false');
    }, 500);
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
    // WCAG 4.1.3: aria-live="assertive" anuncia o feedback imediatamente
    feedback.setAttribute('aria-live', 'assertive');
    setTimeout(() => feedback.classList.add('hidden'), 1500);
}

function updateScore() { scoreElement.textContent = score; }
function showCompletion() {
    gameScreen.classList.add('hidden');
    completionScreen.classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    if (window.parent && window.parent.ponte) {
        window.parent.ponte.emitir('JOGO_CONCLUIDO', { id: 'jogo-associacao-defesa-civil' });
    }
}
function shuffleArray(arr) { return arr.sort(() => Math.random() - 0.5); }
/**
 * Limpa recursos quando o jogo é encerrado.
 * Isso evita vazamento de memória e conflitos de WebGL.
 */
function cleanupGame() {
    // Pausa áudio
    soundCorrect.pause();
    soundError.pause();

    // Limpa canvas
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Reseta estado do jogo
    draggedCard = null;
    currentTouchPos = null;
    connections = [];
    matchedPairs = 0;

    // Remove interação de cards
    document.querySelectorAll('.card').forEach(card => {
        card.draggable = false;
    });
}

// Limpa quando a página/iframe é descarregada
window.addEventListener('beforeunload', cleanupGame);
window.addEventListener('unload', cleanupGame);
