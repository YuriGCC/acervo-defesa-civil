/**
 * @file main.js
 * @description Ponto de entrada do integrador. Gerencia a instância global do Phaser
 * e o ciclo de vida dos Iframes (Criação, Exibição e Destruição).
 */

const config = {
    type: Phaser.AUTO,
    parent: 'container-menu',
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Menu]
};


const game = new Phaser.Game(config);

/**
 * Listener: TROCAR_JOGO
 * @description Responsável por pausar o menu e injetar o Iframe do jogo escolhido no DOM.
 * @param {Object} dados - Contém o 'caminho' (URL) e 'nome' do jogo.
 */

window.ponte.quando('TROCAR_JOGO', (dados) => {
    if (!dados || !dados.caminho) {
        return;
    }

    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');

    containerMenu.style.display = 'none';
    containerJogo.style.display = 'block';
    containerJogo.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = dados.caminho;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    containerJogo.appendChild(iframe);
});



/**
 * Listener: VOLTAR_MENU
 * @description Disparado pelos jogos via 'window.parent.ponte'.
 * Destrói o Iframe para liberar RAM e retoma a cena do Menu Principal.
 */
window.ponte.quando('VOLTAR_MENU', () => {
    const containerJogo = document.getElementById('container-jogo');
    const containerMenu = document.getElementById('container-menu');

    containerJogo.innerHTML = '';
    containerJogo.style.display = 'none';

    containerMenu.style.display = 'block';

    const cenaMenu = game.scene.getScene('MenuCena');
    if (cenaMenu) {
        cenaMenu.scene.resume();
        cenaMenu.cameras.main.fadeIn(500); // Efeito visual de volta
    }
});

