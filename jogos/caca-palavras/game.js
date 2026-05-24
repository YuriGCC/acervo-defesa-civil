// ============================================================
// CAÇA-PALAVRAS - DEFESA CIVIL
// ============================================================

const PALAVRAS = [
    { palavra: 'ENCHENTE',   dica: '💧 Transbordamento de rios e córregos que inunda áreas urbanas.' },
    { palavra: 'DESLIZAMENTO', dica: '⛰️ Movimento de terra e rochas morro abaixo após chuvas fortes.' },
    { palavra: 'EVACUACAO',  dica: '🚶 Saída organizada de pessoas de uma área de risco.' },
    { palavra: 'ABRIGO',     dica: '🏠 Local seguro para pessoas em situação de emergência.' },
    { palavra: 'SIRENE',     dica: '🔔 Sinal sonoro de alerta para a população.' },
    { palavra: 'PREVENCAO',  dica: '🛡️ Conjunto de ações para evitar desastres.' },
    { palavra: 'RISCO',      dica: '⚠️ Probabilidade de ocorrer um evento perigoso.' },
    { palavra: 'ALERTA',     dica: '🚨 Aviso antecipado de perigo iminente.' },
    { palavra: 'SECA',       dica: '☀️ Longo período sem chuvas que afeta a vida.' },
    { palavra: 'INCENDIO',   dica: '🔥 Fogo descontrolado que destrói florestas e casas.' },
    { palavra: 'TORNADO',    dica: '🌪️ Coluna de ar giratória e destrutiva.' },
    { palavra: 'MAPA',       dica: '🗺️ Representação de uma área usada no planejamento de rotas de fuga.' },
    { palavra: 'SOCORRO',    dica: '🆘 Pedido de ajuda em situação de emergência.' },
    { palavra: 'ALAGAMENTO', dica: '🌊 Acúmulo de água nas ruas por chuva intensa ou transbordamento.' },
    { palavra: 'ENXURRADA',  dica: '💦 Corrente de água violenta que arrasta tudo em seu caminho.' },
    { palavra: 'GRANIZO',    dica: '🧊 Precipitação de pedras de gelo que pode causar danos a telhados e plantações.' },
    { palavra: 'PERIGO',     dica: '⚠️ Situação que representa ameaça à segurança das pessoas.' },
    { palavra: 'VENDAVAL',   dica: '💨 Vento forte e repentino capaz de derrubar árvores e estruturas.' },
];
const GRID_SIZE = 14;
const NUM_PALAVRAS = 8;

let grid = [];
let palavrasSelecionadas = [];
let palavrasEncontradas = new Set();
let celulasSelecionadas = [];
let celulasEncontradas = new Set();

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.getElementById('btnStart').addEventListener('click', iniciarJogo);
document.getElementById('btnRestart').addEventListener('click', () => {
    document.getElementById('completionScreen').classList.add('hidden');
    iniciarJogo();
});
document.getElementById('btnClear').addEventListener('click', limparSelecao);

document.querySelector('.btn-back').addEventListener('click', () => {
    if (window.parent && window.parent.ponte) {
        window.parent.ponte.emitir('VOLTAR_MENU');
    } else {
        window.location.href = '../../index.html';
    }
});

function iniciarJogo() {
    palavrasEncontradas.clear();
    celulasSelecionadas = [];
    celulasEncontradas.clear();

    // Escolhe palavras aleatórias
    const embaralhadas = [...PALAVRAS].sort(() => Math.random() - 0.5);
    palavrasSelecionadas = embaralhadas.slice(0, NUM_PALAVRAS);

    // Esconde todas as telas e reseta o gameScreen
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('completionScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');

    // Limpa explicitamente os containers antes de re-renderizar
    document.getElementById('wordGrid').innerHTML = '';
    document.getElementById('wordList').innerHTML = '';
    document.getElementById('foundCount').textContent = 0;
    document.getElementById('totalCount').textContent = NUM_PALAVRAS;

    gerarGrade();
    renderizarListaPalavras();
    atualizarDica('🛡️ Encontre as palavras relacionadas à Defesa Civil e prevenção de desastres!');
    atualizarBarraSelecionada('');

    document.getElementById('gameScreen').classList.remove('hidden');

    // Aguarda dois frames para o layout ser pintado antes de calcular as células
    requestAnimationFrame(() => requestAnimationFrame(() => renderizarGrade()));
}

// ============================================================
// GERAÇÃO DA GRADE
// ============================================================

function gerarGrade() {
    // Inicializa grade vazia
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));

    const direcoes = [
        [0, 1],  // horizontal →
        [1, 0],  // vertical ↓
        [1, 1],  // diagonal ↘
    ];

    for (const { palavra } of palavrasSelecionadas) {
        let colocada = false;
        let tentativas = 0;

        while (!colocada && tentativas < 200) {
            tentativas++;
            const dir = direcoes[Math.floor(Math.random() * direcoes.length)];
            const [dr, dc] = dir;
            const len = palavra.length;

            // Calcula limites de início
            const minR = dr < 0 ? len - 1 : 0;
            const maxR = dr > 0 ? GRID_SIZE - len : GRID_SIZE - 1;
            const minC = dc < 0 ? len - 1 : 0;
            const maxC = dc > 0 ? GRID_SIZE - len : GRID_SIZE - 1;

            if (minR > maxR || minC > maxC) continue;

            const startR = minR + Math.floor(Math.random() * (maxR - minR + 1));
            const startC = minC + Math.floor(Math.random() * (maxC - minC + 1));

            // Verifica se cabe sem conflito
            let cabe = true;
            for (let i = 0; i < len; i++) {
                const r = startR + dr * i;
                const c = startC + dc * i;
                if (grid[r][c] !== '' && grid[r][c] !== palavra[i]) {
                    cabe = false;
                    break;
                }
            }

            if (cabe) {
                for (let i = 0; i < len; i++) {
                    grid[startR + dr * i][startC + dc * i] = palavra[i];
                }
                colocada = true;
            }
        }
    }

    // Preenche espaços vazios com letras aleatórias
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = letras[Math.floor(Math.random() * letras.length)];
            }
        }
    }
}

// ============================================================
// RENDERIZAÇÃO
// ============================================================
function calcularTamanhoCell() {
    const container   = document.querySelector('.game-container');
    const header      = document.querySelector('.game-header');
    const gameScreen  = document.getElementById('gameScreen');
    const barra       = document.querySelector('.selected-word-bar');
    const gridArea    = document.querySelector('.grid-area');
    const wordsPanel  = document.querySelector('.words-panel');

    if (!container || !header || !gameScreen || !gridArea) return { cellSize: 30, gap: 3 };

    const isPortrait = window.innerHeight > window.innerWidth;

    const containerH = container.clientHeight;
    const containerW = container.clientWidth;
    const headerH    = header.offsetHeight;
    const barraH     = barra ? barra.offsetHeight + 8 : 44; // +gap
    const screenPad  = 10 * 2; // padding do game-screen (top+bottom)

    // Espaço vertical disponível para o grid
    const dispH = containerH - headerH - barraH - screenPad;

    let dispW;
    if (isPortrait) {
        // Em portrait o painel fica embaixo — grid usa toda a largura
        // Se o painel ainda não foi pintado, estima 25% da altura disponível
        const panelH = (wordsPanel && wordsPanel.offsetHeight > 0)
            ? wordsPanel.offsetHeight
            : Math.min(220, Math.max(130, dispH * 0.28));
        const gridH  = dispH - panelH - 12; // 12 = gap entre grid-area e painel
        const areaW  = containerW - screenPad;

        const gap = Math.max(2, Math.floor(Math.min(areaW, gridH) / GRID_SIZE / 14));
        const byW = Math.floor((areaW  - gap * (GRID_SIZE - 1)) / GRID_SIZE);
        const byH = Math.floor((gridH  - gap * (GRID_SIZE - 1)) / GRID_SIZE);
        const cellSize = Math.max(16, Math.min(byW, byH, 52));
        const fontSize = Math.max(0.5, Math.min(cellSize / 34, 1.4));

        document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
        document.documentElement.style.setProperty('--cell-gap',  `${gap}px`);
        document.documentElement.style.setProperty('--cell-font', `${fontSize}em`);
        return { cellSize, gap };
    }

    // Landscape: painel lateral ocupa clamp(160px, 22vw, 280px)
    const panelW  = Math.min(280, Math.max(160, containerW * 0.22));
    const layoutGap = Math.min(12, containerW * 0.012);
    dispW = containerW - panelW - layoutGap - screenPad;

    const gap = Math.max(2, Math.floor(Math.min(dispW, dispH) / GRID_SIZE / 14));
    const byW = Math.floor((dispW - gap * (GRID_SIZE - 1)) / GRID_SIZE);
    const byH = Math.floor((dispH - gap * (GRID_SIZE - 1)) / GRID_SIZE);
    const cellSize = Math.max(16, Math.min(byW, byH, 52));
    const fontSize = Math.max(0.5, Math.min(cellSize / 34, 1.4));

    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
    document.documentElement.style.setProperty('--cell-gap',  `${gap}px`);
    document.documentElement.style.setProperty('--cell-font', `${fontSize}em`);
    return { cellSize, gap };
}

function getCelulaEmPonto(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (el.classList.contains('cell')) return el;
    // Verifica pai imediato (caso o texto interno seja o alvo)
    if (el.parentElement && el.parentElement.classList.contains('cell')) return el.parentElement;
    return null;
}

function iniciarTouchDrag(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const cel = getCelulaEmPonto(touch.clientX, touch.clientY);
    if (!cel) return;
    const r = parseInt(cel.dataset.r);
    const c = parseInt(cel.dataset.c);
    clicarCelula(r, c, cel);
}

function moverTouchDrag(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const cel = getCelulaEmPonto(touch.clientX, touch.clientY);

    if (!cel) {
        // Saiu dos limites da grade — encerra graciosamente
        finalizarTouchDrag(event);
        return;
    }

    const r = parseInt(cel.dataset.r);
    const c = parseInt(cel.dataset.c);
    const chave = `${r},${c}`;

    // Evita reprocessar a mesma célula
    if (celulasSelecionadas.length > 0 &&
        celulasSelecionadas[celulasSelecionadas.length - 1].chave === chave) return;

    clicarCelula(r, c, cel);
}

function finalizarTouchDrag(event) {
    // verificarPalavra() já foi chamado incrementalmente via clicarCelula
    // Nenhuma ação adicional necessária no momento
}

function renderizarGrade() {
    const container = document.getElementById('wordGrid');
    container.innerHTML = '';

    container.addEventListener('touchstart', iniciarTouchDrag, { passive: false });
    container.addEventListener('touchmove',  moverTouchDrag,   { passive: false });
    container.addEventListener('touchend',   finalizarTouchDrag);

    const { cellSize, gap } = calcularTamanhoCell();

    container.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${cellSize}px)`;
    container.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${cellSize}px)`;
    container.style.gap = `${gap}px`;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = grid[r][c];
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => clicarCelula(r, c, cell));
            cell.setAttribute('tabindex', '0');
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clicarCelula(r, c, cell);
                }
            });
            container.appendChild(cell);
        }
    }
}

// Recalcula o grid ao redimensionar a janela
let _resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen && !gameScreen.classList.contains('hidden')) {
            renderizarGrade();
        }
    }, 120);
});

function renderizarListaPalavras() {
    const container = document.getElementById('wordList');
    container.innerHTML = '';
    for (const { palavra, dica } of palavrasSelecionadas) {
        const item = document.createElement('div');
        item.className = 'word-item';
        item.id = `word-${palavra}`;
        item.innerHTML = `<span class="word-name">${palavra}</span><span class="word-tip">${dica}</span>`;
        container.appendChild(item);
    }
}

function getCelula(r, c) {
    return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

// ============================================================
// INTERAÇÃO
// ============================================================

function clicarCelula(r, c, el) {
    const chave = `${r},${c}`;

    // Ignora células já encontradas APENAS se já estão na seleção atual
    // (permite reusar células de palavras já encontradas em sobreposições)

    // Deseleciona se clicou na última célula selecionada (desfaz)
    if (celulasSelecionadas.length > 0) {
        const ultima = celulasSelecionadas[celulasSelecionadas.length - 1];
        if (ultima.chave === chave) {
            celulasSelecionadas.pop();
            el.classList.remove('selected');
            atualizarBarraSelecionada(celulasSelecionadas.map(s => s.letra).join(''));
            return;
        }
    }

    // Valida se a nova célula continua a linha reta; se não, reseta com animação de erro
    if (celulasSelecionadas.length >= 1) {
        if (!ehContinuacaoValida(r, c)) {
            // Pisca vermelho nas células selecionadas
            for (const s of celulasSelecionadas) {
                const cel = getCelula(s.r, s.c);
                cel.classList.add('wrong-flash');
                setTimeout(() => cel.classList.remove('wrong-flash', 'selected'), 400);
            }
            celulasSelecionadas = [];
            // Começa nova seleção com a célula clicada após a animação
            setTimeout(() => {
                celulasSelecionadas.push({ r, c, chave, letra: grid[r][c] });
                el.classList.add('selected');
                atualizarBarraSelecionada(grid[r][c]);
            }, 420);
            atualizarBarraSelecionada('');
            return;
        }
    }

    // Evita repetir célula já selecionada
    if (celulasSelecionadas.some(s => s.chave === chave)) return;

    // Adiciona à seleção
    celulasSelecionadas.push({ r, c, chave, letra: grid[r][c] });
    el.classList.add('selected');

    const palavraAtual = celulasSelecionadas.map(s => s.letra).join('');
    atualizarBarraSelecionada(palavraAtual);

    verificarPalavra(palavraAtual);
}

/**
 * Verifica se (r, c) é uma continuação válida da linha já selecionada.
 * A direção é definida pelas duas primeiras células; a partir daí, cada
 * nova célula deve seguir exatamente o mesmo passo (dr, dc).
 */
function ehContinuacaoValida(r, c) {
    const n = celulasSelecionadas.length;
    const primeira = celulasSelecionadas[0];

    if (n === 1) {
        // Qualquer vizinho adjacente (incluindo diagonal ↘) é válido,
        // desde que seja numa das 3 direções permitidas
        const dr = r - primeira.r;
        const dc = c - primeira.c;
        return ehDirecaoPermitida(dr, dc);
    }

    // Direção já definida pelas duas primeiras células
    const segunda = celulasSelecionadas[1];
    const dr = segunda.r - primeira.r;
    const dc = segunda.c - primeira.c;

    // A próxima célula deve ser exatamente um passo à frente
    const ultima = celulasSelecionadas[n - 1];
    return (r === ultima.r + dr) && (c === ultima.c + dc);
}

function ehDirecaoPermitida(dr, dc) {
    // Apenas →, ↓, ↘ (sem reverso, sem L)
    if (dr === 0 && dc === 1) return true;  // →
    if (dr === 1 && dc === 0) return true;  // ↓
    if (dr === 1 && dc === 1) return true;  // ↘
    return false;
}

function anunciarAria(texto) {
    const el = document.getElementById('ariaAnnouncer');
    if (!el) return;
    el.textContent = '';
    // Força re-anúncio mesmo se o texto for igual ao anterior
    requestAnimationFrame(() => { el.textContent = texto; });
}

function verificarPalavra(palavraAtual) {
    const match = palavrasSelecionadas.find(
        p => p.palavra === palavraAtual && !palavrasEncontradas.has(p.palavra)
    );

    if (match) {
        // Acerto!
        palavrasEncontradas.add(match.palavra);

        // Marca células como encontradas
        for (const s of celulasSelecionadas) {
            celulasEncontradas.add(s.chave);
            const el = getCelula(s.r, s.c);
            el.classList.remove('selected');
            el.classList.add('found', 'correct-flash');
        }

        // Marca palavra na lista
        const item = document.getElementById(`word-${match.palavra}`);
        if (item) item.classList.add('found-word');

        document.getElementById('foundCount').textContent = palavrasEncontradas.size;
        atualizarDica(`✅ "${match.palavra}" encontrada! ${match.dica}`);
        anunciarAria(`Palavra "${match.palavra}" encontrada! ${palavrasEncontradas.size} de ${palavrasSelecionadas.length}.`);
        celulasSelecionadas = [];
        atualizarBarraSelecionada('');

        if (palavrasEncontradas.size === palavrasSelecionadas.length) {
            setTimeout(mostrarConclusao, 800);
        }
    } else {
        // Verifica se nenhuma palavra começa com o que foi digitado
        const algumaComeça = palavrasSelecionadas.some(
            p => p.palavra.startsWith(palavraAtual) && !palavrasEncontradas.has(p.palavra)
        );

        if (!algumaComeça && celulasSelecionadas.length > 1) {
            // Pisca vermelho e limpa
            for (const s of celulasSelecionadas) {
                const el = getCelula(s.r, s.c);
                el.classList.add('wrong-flash');
                // só remove 'selected' — mantém 'found' se a célula já foi encontrada
                setTimeout(() => {
                    el.classList.remove('wrong-flash', 'selected');
                }, 400);
            }
            celulasSelecionadas = [];
            setTimeout(() => atualizarBarraSelecionada(''), 420);
        }
    }
}

function limparSelecao() {
    for (const s of celulasSelecionadas) {
        const el = getCelula(s.r, s.c);
        el.classList.remove('selected');
    }
    celulasSelecionadas = [];
    atualizarBarraSelecionada('');
}

function atualizarBarraSelecionada(texto) {
    document.getElementById('selectedWord').textContent = texto || '—';
}

function atualizarDica(texto) {
    document.getElementById('tipBox').textContent = texto;
}

function mostrarConclusao() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('completionScreen').classList.remove('hidden');
}
