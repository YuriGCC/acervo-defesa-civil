
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
        this.paginaAtual = 0;
        this.jogosPorPagina = 6;
        this.botoesGrupo = null; // Grupo para facilitar a limpeza da página
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
        let splash = this.add.image(width / 2, height / 2, 'intro-parceria').setDisplaySize(width, height).setDepth(100);

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: splash,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    splash.destroy();
                    this.renderizarInterfaceMenu();
                }
            });
        });
    }

    renderizarInterfaceMenu() {
        const { width, height } = this.scale;
        
        if (!this.background) {
            this.background = this.add.image(width / 2, height / 2, 'fundo-menu')
                .setDisplaySize(width, height)
                .setAlpha(0.6).setTint(0x222222);
        }

        if (this.botoesGrupo) {
            this.botoesGrupo.clear(true, true);
        }
        this.botoesGrupo = this.add.group();

        const inicio = this.paginaAtual * this.jogosPorPagina;
        const fim = inicio + this.jogosPorPagina;
        const jogosDaPagina = LISTA_JOGOS.slice(inicio, fim);

        jogosDaPagina.forEach((jogo, index) => {
            this.criarBotaoJogo(jogo, index);
        });

        this.criarNavegacao();
    }

    criarBotaoJogo(jogo, index) {
        const { width } = this.scale;
        const colunas = 3;
        const larguraBotao = 400;
        const alturaBotao = 260;
        const espacamentoX = 520;
        const espacamentoY = 340;

        const offsetX = (width - (espacamentoX * (colunas - 1))) / 2;
        const x = offsetX + (index % colunas) * espacamentoX;
        const y = 350 + Math.floor(index / colunas) * espacamentoY;

        const container = this.add.container(x, y);

        const fundo = this.add.rectangle(0, 0, larguraBotao, alturaBotao, jogo.cor)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(6, 0xffffff, 0.8);

        const texto = this.add.text(0, 85, jogo.nome.toUpperCase(), {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 8,
            align: 'center',
            wordWrap: { width: larguraBotao - 40 }
        }).setOrigin(0.5);

        container.add(fundo);
        container.add(texto);

        if (this.textures.exists(jogo.id)) {
            const icone = this.add.image(0, -40, jogo.id).setDisplaySize(140, 140);
            container.add(icone);
        }

        fundo.on('pointerdown', () => {
            container.setScale(0.9);
            this.time.delayedCall(100, () => this.iniciarTrocaDeJogo(jogo));
        });

        fundo.on('pointerup', () => container.setScale(1));
        
        this.botoesGrupo.add(container);
    }

    criarNavegacao() {
        const { width, height } = this.scale;
        const totalPaginas = Math.ceil(LISTA_JOGOS.length / this.jogosPorPagina);

        if (this.paginaAtual > 0) {
            this.criarSetaNavegacao(100, height / 2, 'Anterior', -1);
        }

        if (this.paginaAtual < totalPaginas - 1) {
            this.criarSetaNavegacao(width - 100, height / 2, 'Próximo', 1);
        }
    }

    criarSetaNavegacao(x, y, label, direcao) {
        const setaContainer = this.add.container(x, y);
        
        const circulo = this.add.circle(0, 0, 60, 0xffffff, 0.2)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff);
            
        const textoSeta = this.add.text(0, 80, label, { fontSize: '24px', fontWeight: 'bold' }).setOrigin(0.5);
        
        const iconeSeta = this.add.text(0, 0, direcao > 0 ? '>' : '<', { fontSize: '60px', fontWeight: 'bold' }).setOrigin(0.5);

        setaContainer.add([circulo, textoSeta, iconeSeta]);

        circulo.on('pointerdown', () => {
            this.paginaAtual += direcao;
            this.renderizarInterfaceMenu();
        });

        this.botoesGrupo.add(setaContainer);
    }

    iniciarTrocaDeJogo(jogo) {
        window.ponte.emitir('TROCAR_JOGO', { caminho: jogo.caminho, nome: jogo.nome });
        this.scene.pause();
        this.cameras.main.fadeOut(500, 0, 0, 0);
    }
}