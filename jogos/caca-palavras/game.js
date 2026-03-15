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
    renderizarGrade();
    renderizarListaPalavras();
    atualizarDica('🛡️ Encontre as palavras relacionadas à Defesa Civil e prevenção de desastres!');
    atualizarBarraSelecionada('');

    document.getElementById('gameScreen').classList.remove('hidden');
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

function renderizarGrade() {
    const container = document.getElementById('wordGrid');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 44px)`;
    container.style.gridTemplateRows = `repeat(${GRID_SIZE}, 44px)`;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = grid[r][c];
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => clicarCelula(r, c, cell));
            container.appendChild(cell);
        }
    }
}

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
