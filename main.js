/**
 * @file main.js
 * @description Ponto de entrada do integrador. Gerencia a instância global do Phaser
 * e o ciclo de vida dos Iframes (Criação, Exibição e Destruição).
 */

const config = {
    type: Phaser.AUTO,
    parent: 'container-menu',

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
    },
    input: {
        activePointers: 3,
        touch: {
            capture: true
        }
    },
    backgroundColor: '#000000',
    scene: [Menu]
};

const game = new Phaser.Game(config);

/**
 * Utilitário: anuncia mensagem para leitores de tela.
 * Centralizado aqui para uso nos listeners de ponte.
 * @param {string} msg
 */
function anunciar(msg) {
    const el = document.getElementById('aria-announcer');
    if (!el) return;
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = msg; });
}

/**
 * Volta ao menu: Destrói o iframe, retoma a cena do Menu e limpa recursos.
 * @description Disparado pelos jogos via 'window.parent.ponte'.
 */
function voltarAoMenu() {
    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');
    const btnVoltar = document.getElementById('btn-voltar-menu');

    // Devolve o display do menu para que ele tenha largura/altura reais
    if (containerMenu && containerJogo) {
        // Traz o menu de volta usando visibility
        containerMenu.style.visibility = 'visible';
        containerJogo.style.display = 'none';
        containerJogo.style.pointerEvents = 'none';
    }

    // Oculta botão de volta
    if (btnVoltar) {
        btnVoltar.style.display = 'none';
    }

    // Aguarda um pequeno instante para o navegador reprocessar o tamanho da tela (Reflow)
    setTimeout(() => {
        if (game && game.scene) {
            try {
                // Força o gerenciador de escala do Phaser a reconhecer o novo tamanho
                if (game.scale) {
                    game.scale.refresh();
                }

                game.scene.resume('MenuCena');
                game.scene.bringToTop('MenuCena');
                
                // CORREÇÃO: Buscamos a cena exata para acessar a câmera DELA
                const cenaMenu = game.scene.getScene('MenuCena');
                if (cenaMenu && cenaMenu.cameras && cenaMenu.cameras.main) {
                    // Remove o escuro da tela gradualmente
                    cenaMenu.cameras.main.fadeIn(500, 0, 0, 0);

                    // Reativa o controle por teclado que havia sido desligado
                    if (typeof cenaMenu._registrarNavegacaoTeclado === 'function') {
                        cenaMenu._registrarNavegacaoTeclado();
                    }
                }

                // Devolve o foco ao canvas do menu: sem isso o toque também fica quebrado no menu,
                // porque o foco continua no botão "Voltar ao Menu" que acabou de ser escondido.
                const canvasMenu = containerMenu ? containerMenu.querySelector('canvas') : null;
                if (canvasMenu) canvasMenu.focus();
            } catch (e) {
                console.error('[voltarAoMenu] Erro ao retomar MenuCena:', e);
            }
        } else {
            console.error('[voltarAoMenu] Game não encontrado!');
        }

        // Destruição do iframe para liberar recursos
        if (containerJogo) {
            const iframe = containerJogo.querySelector('iframe');
            if (iframe) {
                // Evita vazamento de memória
                iframe.src = 'about:blank'; 
                setTimeout(() => {
                    try {
                        if (containerJogo && iframe && iframe.parentNode === containerJogo) {
                            containerJogo.removeChild(iframe);
                        }
                        containerJogo.innerHTML = '';
                    } catch (e) {
                        console.error('[voltarAoMenu] Erro ao remover iframe:', e);
                    }
                }, 100);
            }
        }
    }, 50);

    anunciar('Retornado ao menu principal.');
}

/**
 * Listener: TROCAR_JOGO
 * @description Pausa o menu e injeta o iframe do jogo escolhido no DOM.
 * @param {Object} dados - { caminho: string, nome: string }
 */
window.ponte.quando('TROCAR_JOGO', (dados) => {
    if (!dados || !dados.caminho) return;

    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');
    const btnVoltar = document.getElementById('btn-voltar-menu');

    btnVoltar.onclick = voltarAoMenu;

    btnVoltar.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            voltarAoMenu();
        }
    };

    // Esconde o menu
    containerMenu.style.visibility = 'hidden'; 
    
    // Garante que o container-jogo ocupe a tela toda via JS (caso o CSS falhe)
    containerJogo.style.position = 'absolute';
    containerJogo.style.top = '0';
    containerJogo.style.left = '0';
    containerJogo.style.width = '100vw'; // Força largura total da janela
    containerJogo.style.height = '100vh'; // Força altura total da janela
    containerJogo.style.display = 'block';
    containerJogo.style.visibility = 'visible';
    containerJogo.style.zIndex = '999'; // Garante que fique acima de tudo
    // O CSS define pointer-events: none em #container-jogo por padrão (para não capturar
    // toques enquanto o jogo está escondido atrás do menu). Sem isso, nada dentro do jogo
    // responde a toque/clique mesmo com o container visível.
    containerJogo.style.pointerEvents = 'auto';
    containerJogo.innerHTML = '';

    // Força o navegador a calcular os estilos recém-aplicados
    window.getComputedStyle(containerJogo).getPropertyValue('height');

    const iframe = document.createElement('iframe');
    iframe.id = 'game-iframe-' + Date.now();
    iframe.src = dados.caminho;
    
    // Força dimensões absolutas no iframe também
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';


    const onIframeLoad = () => {
        if (btnVoltar) {
            btnVoltar.style.display = 'block';
        }
        // Foca o iframe (não o botão) para que toque e teclado funcionem dentro do jogo.
        // Focar um elemento fora do iframe impede o navegador de repassar toques ao conteúdo do jogo.
        // Em alguns navegadores mobile, focar só o elemento <iframe> não é suficiente: é preciso
        // também focar a window de dentro do iframe para que ela vire o contexto realmente ativo.
        iframe.focus();
        try {
            if (iframe.contentWindow) iframe.contentWindow.focus();
        } catch (e) {
            console.warn('[TROCAR_JOGO] Não foi possível focar a window do iframe:', e);
        }
        anunciar(`Jogo "${dados.nome}" iniciado. Use o botão Voltar ao Menu para retornar.`);
    };

    iframe.addEventListener('load', onIframeLoad);

    containerJogo.appendChild(iframe);

});

/**
 * Listener: VOLTAR_MENU
 * @description Disparado pelos jogos via 'window.parent.ponte'.
 * Destrói o iframe para liberar RAM e retoma a cena do Menu Principal.
 */
window.ponte.quando('VOLTAR_MENU', () => {voltarAoMenu();});
