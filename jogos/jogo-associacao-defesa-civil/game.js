// Dados do jogo - Situações de risco e atitudes corretas
const gameLevels = [
    // Nível 1: Riscos e atitudes corretas
    {
        level: 1,
        title: 'Riscos e Atitudes Corretas',
        pairs: [
            {
                id: 1,
                risk: { icon: '🚰', text: 'Bueiro cheio de lixo' },
                action: { icon: '🚫', text: 'Não jogar lixo na rua' }
            },
            {
                id: 2,
                risk: { icon: '🌧️', text: 'Chuva muito forte' },
                action: { icon: '🏠', text: 'Procurar abrigo seguro' }
            },
            {
                id: 3,
                risk: { icon: '⛰️', text: 'Barranco sem vegetação' },
                action: { icon: '🌳', text: 'Plantar árvores e proteger o solo' }
            },
            {
                id: 4,
                risk: { icon: '⚡', text: 'Fio elétrico caído' },
                action: { icon: '👨', text: 'Avisar um adulto ou autoridades responsáveis' }
            },
            {
                id: 5,
                risk: { icon: '🌊', text: 'Rua alagada' },
                action: { icon: '🚷', text: 'Evitar passar pelo local alagado' }
            },
            {
                id: 6,
                risk: { icon: '🌲', text: 'Árvore com risco de queda' },
                action: { icon: '📞', text: 'Comunicar a Defesa Civil ou a prefeitura' }
            },
            {
                id: 7,
                risk: { icon: '🗑️', text: 'Terreno com descarte irregular de lixo' },
                action: { icon: '🧹', text: 'Manter o terreno limpo' }
            }
        ]
    },
    // Nível 2: Desastres naturais e prevenção
    {
        level: 2,
        title: 'Desastres Naturais e Prevenção',
        pairs: [
            {
                id: 8,
                risk: { icon: '🌊', text: 'Alagamento' },
                action: { icon: '🚰', text: 'Manter bueiros limpos' }
            },
            {
                id: 11,
                risk: { icon: '🏔️', text: 'Deslizamento de terra' },
                action: { icon: '🌿', text: 'Preservar vegetação em morros e encostas' }
            },
            {
                id: 12,
                risk: { icon: '⛈️', text: 'Tempestade forte' },
                action: { icon: '🏠', text: 'Procurar abrigo seguro longe de árvores' }
            },
            {
                id: 13,
                risk: { icon: '💨', text: 'Vendaval' },
                action: { icon: '🚫', text: 'Ficar longe de árvores e postes' }
            },
            {
                id: 14,
                risk: { icon: '🧊', text: 'Granizo' },
                action: { icon: '🏘️', text: 'Proteger-se em local coberto' }
            },
            {
                id: 15,
                risk: { icon: '💧', text: 'Alagamento urbano' },
                action: { icon: '🚷', text: 'Não atravessar áreas inundadas' }
            }
        ]
    },
    // Nível 3: Sinais de risco
    {
        level: 3,
        title: 'Sinais de Risco',
        pairs: [
            {
                id: 16,
                risk: { icon: '🗑️', text: 'Lixo no rio' },
                action: { icon: '🌊', text: 'Pode causar enchentes' }
            },
            {
                id: 17,
                risk: { icon: '🏚️', text: 'Casa construída em encosta íngreme' },
                action: { icon: '⛰️', text: 'Pode provocar deslizamentos' }
            },
            {
                id: 18,
                risk: { icon: '⚡', text: 'Fiação elétrica exposta' },
                action: { icon: '⚠️', text: 'Risco de choque elétrico' }
            },
            {
                id: 19,
                risk: { icon: '🚰', text: 'Bueiro entupido' },
                action: { icon: '💧', text: 'Pode causar alagamentos' }
            },
            {
                id: 20,
                risk: { icon: '🌳', text: 'Árvore muito inclinada' },
                action: { icon: '💨', text: 'Pode cair com vento ou chuva' }
            },
            {
                id: 21,
                risk: { icon: '🪨', text: 'Barranco com rachaduras' },
                action: { icon: '🏔️', text: 'Sinal de possível deslizamento de terra' }
            }
        ]
    },
    // Nível 4: Elementos da Defesa Civil
    {
        level: 4,
        title: 'Elementos da Defesa Civil',
        pairs: [
            {
                id: 22,
                risk: { icon: '🚨', text: 'Mensagem de alerta' },
                action: { icon: '⚠️', text: 'Avisar sobre perigo ou emergência' }
            },
            {
                id: 23,
                risk: { icon: '👮', text: 'Agente da Defesa Civil' },
                action: { icon: '🛡️', text: 'Ajudar e proteger a população' }
            },
            {
                id: 24,
                risk: { icon: '🏢', text: 'Abrigo seguro' },
                action: { icon: '🏠', text: 'Local seguro para se proteger' }
            },
            {
                id: 25,
                risk: { icon: '🗺️', text: 'Mapa de risco' },
                action: { icon: '📍', text: 'Mostrar áreas com risco de desastre' }
            },
            {
                id: 26,
                risk: { icon: '💻', text: 'Site da proteção e defesa civil' },
                action: { icon: 'ℹ️', text: 'Fornecer informação confiável à população' }
            }
        ]
    }
];

// Estado do jogo
let currentLevel = 0;
let score = 0;
let matchedPairs = 0;
let draggedCard = null;
let connections = []; // Armazena as conexões feitas

// Efeitos sonoros
const soundCorrect = new Audio('assets/acerto.mp3');
const soundError = new Audio('assets/erro.mp3');

// Elementos DOM
const introScreen = document.getElementById('introScreen');
const gameScreen = document.getElementById('gameScreen');
const completionScreen = document.getElementById('completionScreen');
const btnStart = document.getElementById('btnStart');
const btnRestart = document.getElementById('btnRestart');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const risksContainer = document.getElementById('risksContainer');
const actionsContainer = document.getElementById('actionsContainer');
const feedback = document.getElementById('feedback');
const finalScore = document.getElementById('finalScore');
const completionMessage = document.getElementById('completionMessage');
const canvas = document.getElementById('connectionsCanvas');
const ctx = canvas.getContext('2d');

// Inicializar jogo
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', restartGame);
window.addEventListener('resize', drawConnections);

// Botão de voltar ao menu
const btnBack = document.getElementById('btnBack');
btnBack.addEventListener('click', () => {
    if (confirm('Deseja realmente voltar ao menu? O progresso será perdido.')) {
        window.location.href = '../../index.html';
    }
});

function startGame() {
    introScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resizeCanvas();
    loadLevel();
}

function restartGame() {
    currentLevel = 0;
    score = 0;
    matchedPairs = 0;
    connections = [];
    completionScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateScore();
    resizeCanvas();
    loadLevel();
}

function resizeCanvas() {
    const gameBoard = document.querySelector('.game-board');
    canvas.width = gameBoard.offsetWidth + 20;
    canvas.height = gameBoard.offsetHeight + 20;
    drawConnections();
}

function loadLevel() {
    if (currentLevel >= gameLevels.length) {
        showCompletion();
        return;
    }

    matchedPairs = 0;
    connections = [];
    const level = gameLevels[currentLevel];
    levelElement.textContent = level.level;

    // Atualizar instrução com título do nível
    const instruction = document.getElementById('instruction');
    instruction.textContent = `Nível ${level.level}: ${level.title} - Arraste os riscos para as ações corretas!`;

    // Limpar containers
    risksContainer.innerHTML = '';
    actionsContainer.innerHTML = '';

    // Criar cards de risco (arrastáveis)
    level.pairs.forEach(pair => {
        const riskCard = createCard(pair.risk, 'risk', pair.id);
        riskCard.draggable = true;
        riskCard.addEventListener('dragstart', handleDragStart);
        riskCard.addEventListener('dragend', handleDragEnd);
        risksContainer.appendChild(riskCard);
    });

    // Criar e embaralhar cards de ação (zona de drop)
    const shuffledActions = shuffleArray([...level.pairs]);
    shuffledActions.forEach(pair => {
        const actionCard = createCard(pair.action, 'action', pair.id);
        actionsContainer.appendChild(actionCard);
    });

    // Adicionar eventos de drop nos cards de ação
    document.querySelectorAll('.card.action').forEach(card => {
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragleave', handleDragLeave);
    });

    // Redimensionar canvas e limpar conexões
    setTimeout(() => {
        resizeCanvas();
    }, 100);
}

function createCard(data, type, pairId) {
    const card = document.createElement('div');
    card.className = `card ${type}`;
    card.dataset.pairId = pairId;
    
    card.innerHTML = `
        <div class="card-icon">${data.icon}</div>
        <div class="card-text">${data.text}</div>
    `;
    
    return card;
}

function handleDragStart(e) {
    draggedCard = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    if (!e.target.closest('.card').classList.contains('matched')) {
        e.target.closest('.card').classList.add('drop-zone');
    }
    
    return false;
}

function handleDragLeave(e) {
    e.target.closest('.card').classList.remove('drop-zone');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const dropTarget = e.target.closest('.card.action');
    dropTarget.classList.remove('drop-zone');

    if (dropTarget.classList.contains('matched')) {
        return false;
    }

    const draggedPairId = draggedCard.dataset.pairId;
    const dropPairId = dropTarget.dataset.pairId;

    if (draggedPairId === dropPairId) {
        handleCorrectMatch(draggedCard, dropTarget);
    } else {
        handleIncorrectMatch();
    }

    return false;
}

function handleCorrectMatch(riskCard, actionCard) {
    riskCard.classList.add('matched');
    actionCard.classList.add('matched');
    actionCard.draggable = false;

    // Adicionar conexão
    connections.push({
        riskId: riskCard.dataset.pairId,
        actionId: actionCard.dataset.pairId
    });

    score += 10;
    matchedPairs++;
    updateScore();
    drawConnections();

    // Tocar som de acerto
    soundCorrect.currentTime = 0;
    soundCorrect.play().catch(e => console.log('Erro ao tocar som:', e));

    showFeedback('✅ Muito bem! Associação correta!', 'correct');

    if (matchedPairs === gameLevels[currentLevel].pairs.length) {
        setTimeout(() => {
            currentLevel++;
            if (currentLevel < gameLevels.length) {
                showFeedback('🎉 Nível completo! Próximo desafio...', 'correct');
                setTimeout(loadLevel, 2000);
            } else {
                showCompletion();
            }
        }, 1500);
    }
}

function handleIncorrectMatch() {
    // Tocar som de erro
    soundError.currentTime = 0;
    soundError.play().catch(e => console.log('Erro ao tocar som:', e));
    
    showFeedback('❌ Ops! Tente outra associação', 'incorrect');
}

function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove('hidden');

    setTimeout(() => {
        feedback.classList.add('hidden');
    }, 1500);
}

function updateScore() {
    scoreElement.textContent = score;
}

function showCompletion() {
    gameScreen.classList.add('hidden');
    completionScreen.classList.remove('hidden');
    finalScore.textContent = score;

    let message = '';
    const maxScore = 250; // 25 pares x 10 pontos
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) {
        message = '🌟 Excelente! Você é um verdadeiro Protetor da Comunidade! Você dominou todos os conceitos de prevenção e segurança. Continue sempre atento aos riscos e ajudando as pessoas ao seu redor!';
    } else if (percentage >= 70) {
        message = '👏 Muito bom! Você aprendeu bastante sobre prevenção e Defesa Civil. Continue praticando para se tornar um expert em segurança comunitária!';
    } else if (percentage >= 50) {
        message = '💪 Bom trabalho! Você está no caminho certo. Que tal jogar novamente para aprender ainda mais sobre como proteger nossa comunidade?';
    } else {
        message = '📚 Continue aprendendo! A prática leva à perfeição. Jogue novamente e descubra mais sobre prevenção de desastres e segurança!';
    }

    completionMessage.textContent = message;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function drawConnections() {
    if (!ctx) return;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar cada conexão
    connections.forEach(connection => {
        const riskCard = document.querySelector(`.card.risk[data-pair-id="${connection.riskId}"]`);
        const actionCard = document.querySelector(`.card.action[data-pair-id="${connection.actionId}"]`);

        if (riskCard && actionCard) {
            const gameBoard = document.querySelector('.game-board');
            const boardRect = gameBoard.getBoundingClientRect();
            const riskRect = riskCard.getBoundingClientRect();
            const actionRect = actionCard.getBoundingClientRect();

            // Calcular posições relativas ao game-board (com offset de 10px)
            const startX = riskRect.right - boardRect.left + 10;
            const startY = riskRect.top + riskRect.height / 2 - boardRect.top + 10;
            const endX = actionRect.left - boardRect.left + 10;
            const endY = actionRect.top + actionRect.height / 2 - boardRect.top + 10;

            // Calcular pontos de controle para curva Bézier
            const distance = endX - startX;
            const controlPoint1X = startX + distance * 0.5;
            const controlPoint1Y = startY;
            const controlPoint2X = startX + distance * 0.5;
            const controlPoint2Y = endY;

            // Desenhar curva Bézier
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.bezierCurveTo(
                controlPoint1X, controlPoint1Y,
                controlPoint2X, controlPoint2Y,
                endX, endY
            );
            ctx.strokeStyle = '#28a745';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Desenhar círculos nas extremidades
            ctx.beginPath();
            ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#28a745';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#28a745';
            ctx.fill();
        }
    });
}
