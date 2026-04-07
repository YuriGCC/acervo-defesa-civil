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
 * Listener: TROCAR_JOGO
 * @description Pausa o menu e injeta o iframe do jogo escolhido no DOM.
 * @param {Object} dados - { caminho: string, nome: string }
 */
window.ponte.quando('TROCAR_JOGO', (dados) => {
    if (!dados || !dados.caminho) return;

    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');
    const btnVoltar = document.getElementById('btn-voltar-menu');

    containerMenu.style.display = 'none';
    containerJogo.style.display = 'block';
    containerJogo.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = dados.caminho;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    iframe.title = `Jogo: ${dados.nome}`;
    iframe.setAttribute('aria-label', `Jogo em execução: ${dados.nome}`);

    iframe.setAttribute('allow', 'autoplay');

    containerJogo.appendChild(iframe);

    // Exibe botão de retorno acessível
    if (btnVoltar) {
        btnVoltar.style.display = 'block';
        btnVoltar.focus();
    }

    anunciar(`Jogo "${dados.nome}" iniciado. Use o botão Voltar ao Menu para retornar.`);
});

/**
 * Listener: VOLTAR_MENU
 * @description Disparado pelos jogos via 'window.parent.ponte'.
 * Destrói o iframe para liberar RAM e retoma a cena do Menu Principal.
 */
window.ponte.quando('VOLTAR_MENU', voltarAoMenu);
