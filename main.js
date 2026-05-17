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
    console.log('[voltarAoMenu] Iniciando retorno ao menu...');
    
    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');
    const btnVoltar = document.getElementById('btn-voltar-menu');

    // Devolve o display do menu para que ele tenha largura/altura reais
    if (containerMenu && containerJogo) {
        // Traz o menu de volta usando visibility
        containerMenu.style.visibility = 'visible'; 
        containerJogo.style.display = 'none';
    }

    // Oculta botão de volta
    if (btnVoltar) {
        btnVoltar.style.display = 'none';
    }

    // Aguarda um pequeno instante para o navegador reprocessar o tamanho da tela (Reflow)
    setTimeout(() => {
        if (game && game.scene) {
            try {
                console.log('[voltarAoMenu] Retomando MenuCena...');
                
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

                console.log('[voltarAoMenu] MenuCena retomada com sucesso');
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

        console.log('[voltarAoMenu] Retorno ao menu concluído');
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

    console.log('[TROCAR_JOGO] Iniciando jogo:', dados.nome);

    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');
    const btnVoltar = document.getElementById('btn-voltar-menu');

    btnVoltar.onclick = voltarAoMenu;

    // Mostra container do jogo
    containerMenu.style.visibility = 'hidden'; 
    containerJogo.style.display = 'block';
    containerJogo.innerHTML = '';

    // Força reflow para garantir que dimensões sejam calculadas
    void containerJogo.offsetHeight;
    void containerJogo.offsetWidth;

    const iframe = document.createElement('iframe');
    iframe.id = 'game-iframe-' + Date.now();
    iframe.src = dados.caminho;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';

    iframe.title = `Jogo: ${dados.nome}`;
    iframe.setAttribute('aria-label', `Jogo em execução: ${dados.nome}`);
    iframe.setAttribute('allow', 'autoplay');

    // Define atributos de sandbox
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation');

    containerJogo.appendChild(iframe);

    // Handler para quando o iframe carregar
    let iframeLoaded = false;
    const onIframeLoad = () => {
        if (iframeLoaded) return;
        iframeLoaded = true;
        
        console.log('[TROCAR_JOGO] Iframe carregado:', dados.nome);
        
        if (btnVoltar) {
            btnVoltar.style.display = 'block';
            btnVoltar.focus();
        }
        anunciar(`Jogo "${dados.nome}" iniciado. Use o botão Voltar ao Menu para retornar.`);
    };

    iframe.addEventListener('load', onIframeLoad);

    // Timeout de segurança (4 segundos) para lidar com casos onde o evento 'load' não dispare
    setTimeout(() => {
        if (!iframeLoaded) {
            console.warn('[TROCAR_JOGO] Timeout esperando iframe carregar');
            onIframeLoad();
        }
    }, 4000);

    // Força verificação após 500ms para lidar com casos onde o evento 'load' não dispare, mas o conteúdo já esteja acessível
    setTimeout(() => {
        if (!iframeLoaded && iframe.contentWindow) {
            console.log('[TROCAR_JOGO] Iframe parece estar carregado (conteúdo acessível)');
            onIframeLoad();
        }
    }, 500);
});

/**
 * Listener: VOLTAR_MENU
 * @description Disparado pelos jogos via 'window.parent.ponte'.
 * Destrói o iframe para liberar RAM e retoma a cena do Menu Principal.
 */
window.ponte.quando('VOLTAR_MENU', () => {voltarAoMenu();});
