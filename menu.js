
/**
 * @class MenuCena
 * @extends Phaser.Scene
 * * @description
 * Esta cena gerencia a integração dos jogos do acervo. 
 * Ela é responsável por:
 * 1. Renderizar dinamicamente os cards de seleção baseados na `LISTA_JOGOS`.
 * 2. Gerenciar o carregamento de assets (ícones e fundo) via `preload`.
 * 3. Intermediar a comunicação com o integrador (main.js) através da `window.ponte`.
 * * @example
 * Para adicionar novos jogos, não edite esta classe; 
 * altere apenas o arquivo 'config-jogos.js'.
 */
class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuCena' });
    }

    preload() {
        this.load.image('fundo-menu', 'assets/imagem-fundo.png');

        this.load.image('intro-parceria', 'assets/intro.jpeg');

        LISTA_JOGOS.forEach(jogo => {
            if (jogo.icone) {
                this.load.image(jogo.id, jogo.icone);
            }
        });
    }

    create() {
        const { width, height } = this.scale;

        let splash = this.add.image(width / 2, height / 2, 'intro-parceria');
        splash.setDisplaySize(width, height);
        splash.setDepth(100); // Garante que fique por cima de tudo

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: splash,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    splash.destroy(); // Remove a imagem da memória
                    this.renderizarInterfaceMenu(width, height);
                }
            });
        });
    }

    renderizarInterfaceMenu(width, height) {
        let background = this.add.image(width / 2, height / 2, 'fundo-menu');
        background.setDisplaySize(width, height);
        background.setAlpha(0.8);
        background.setTint(0x444444);

        this.add.text(width / 2, 80, 'ACERVO DE JOGOS - DEFESA CIVIL', {
            fontSize: '48px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        LISTA_JOGOS.forEach((jogo, index) => {
            this.criarBotaoJogo(jogo, index, width, height);
        });
    }

    criarBotaoJogo(jogo, index, width, height) {
        const colunas = 2;
        const espacamentoX = 400;
        const espacamentoY = 250;
        const x = (width / 2 - espacamentoX / 2) + (index % colunas) * espacamentoX;
        const y = 300 + Math.floor(index / colunas) * espacamentoY;

        const botaoFundo = this.add.rectangle(x, y, 350, 200, jogo.cor)
            .setInteractive({ useHandCursor: true });

        if (this.textures.exists(jogo.id)) {
            const icone = this.add.image(x, y - 30, jogo.id);
            icone.setDisplaySize(100, 100);
        }

        const textoBotao = this.add.text(x, y + 50, jogo.nome, {
            fontSize: '24px',
            fill: '#fff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        botaoFundo.on('pointerdown', () => {
            botaoFundo.setScale(0.95);
            this.iniciarTrocaDeJogo(jogo);
        });

        botaoFundo.on('pointerup', () => botaoFundo.setScale(1));
    }

    iniciarTrocaDeJogo(jogo) {
        console.log(`Lançando: ${jogo.nome}`);

        window.ponte.emitir('TROCAR_JOGO', {
            caminho: jogo.caminho,
            nome: jogo.nome
        });

        this.scene.pause();
        this.cameras.main.fadeOut(500, 0, 0, 0);
    }
}