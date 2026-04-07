/**
 * @class Menu
 * @extends Phaser.Scene
 * @description
 * Cena do menu principal. Renderiza cards de jogos dinamicamente a partir
 * de LISTA_JOGOS (config-jogos.js) e gerencia paginação.
 *
 */
class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuCena' });
        this.paginaAtual = 0;
        this.jogosPorPagina = 6;
        this.botoesGrupo = null;
        this.indiceFoco = 0;
        this._cardRefs = [];
        this._keyListener = null;
    }

    preload() {
        this.load.image('fundo-menu', 'assets/imagem-fundo.png');
        this.load.image('intro-parceria', 'assets/intro.jpeg');
        this.load.image('amora', 'assets/amora.png');
        this.load.image('logo-uniasselvi', 'assets/icone-uniasselvi.png');

        LISTA_JOGOS.forEach(jogo => {
            if (jogo.icone) {
                this.load.image(jogo.id, jogo.icone);
            }
        });
    }

    create() {
        const { width, height } = this.scale;

        let splash = this.add.image(width / 2, height / 2, 'intro-parceria')
            .setDisplaySize(width, height)
            .setDepth(100);

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.criarBotaoProsseguir(splash);
    }

    /**
     * Anuncia uma mensagem para leitores de tela via aria-live region.
     * @param {string} mensagem
     */
    _anunciar(mensagem) {
        const el = document.getElementById('aria-announcer');
        if (el) {
            el.textContent = '';
            requestAnimationFrame(() => { el.textContent = mensagem; });
        }
    }

    criarBotaoProsseguir(splash) {
        const { width, height } = this.scale;
        const btnX = width / 2;
        const btnY = height * 0.88;

        const btnContainer = this.add.container(btnX, btnY).setDepth(101);

        const btnW = width * 0.22;
        const btnH = height * 0.09;

        const bg = this.add.rectangle(0, 0, btnW, btnH, 0x000000, 0.7)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff, 1);

        const fontSize = Math.round(height * 0.042);

        const txt = this.add.text(0, 0, 'PROSSEGUIR', {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        btnContainer.add([bg, txt]);

        this.tweens.add({
            targets: btnContainer,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        let jaProsseguiu = false;

        const prosseguir = () => {
            if (jaProsseguiu) return;
            jaProsseguiu = true;

            bg.disableInteractive();
            this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            this._anunciar('Carregando menu de jogos');
            this.tweens.add({
                targets: [splash, btnContainer],
                alpha: 0,
                duration: 800,
                onComplete: () => {
                    splash.destroy();
                    btnContainer.destroy();
                    this.renderizarInterfaceMenu();
                }
            });
        };

        bg.on('pointerdown', prosseguir);
        bg.on('pointerover', () => bg.setFillStyle(0x333333, 0.9));
        bg.on('pointerout', () => bg.setFillStyle(0x000000, 0.7));

        /*
            ACESSIBILIDADE (WCAG 2.1.1 - Keyboard):
            Permite acionar o botão "Prosseguir" com Enter ou Espaço.
            Sem isso, usuários que não usam mouse ficam presos na tela de intro.
        */
        const teclaIntro = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );
        const teclaEspaco = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        teclaIntro.once('down', prosseguir);
        teclaEspaco.once('down', prosseguir);

        this._anunciar('Tela de apresentação. Pressione Enter ou Espaço para prosseguir ao menu de jogos.');
    }

    renderizarInterfaceMenu() {
        const { width, height } = this.scale;

        if (!this.background) {
            this.background = this.add.image(width / 2, height / 2, 'fundo-menu')
                .setAlpha(0.6).setTint(0x222222);
        }
        this.background.setPosition(width / 2, height / 2).setDisplaySize(width, height);

        if (this.botoesGrupo) {
            this.botoesGrupo.clear(true, true);
        }
        this.botoesGrupo = this.add.group();

        this._cardRefs = [];
        this.indiceFoco = 0;

        const inicio = this.paginaAtual * this.jogosPorPagina;
        const fim = inicio + this.jogosPorPagina;
        const jogosDaPagina = LISTA_JOGOS.slice(inicio, fim);

        jogosDaPagina.forEach((jogo, index) => {
            this.criarBotaoJogo(jogo, index);
        });

        this.criarNavegacao();
        this._registrarNavegacaoTeclado();

        const logoSize = height * 0.1;
        const margem = height * 0.02;

        this.add.image(margem + logoSize / 2, height - margem - logoSize / 2, 'logo-uniasselvi')
            .setDisplaySize(logoSize, logoSize)
            .setAlpha(0.9);

        this.add.image(width - margem - logoSize / 2, height - margem - logoSize / 2, 'fundo-menu')
            .setDisplaySize(logoSize, logoSize)
            .setAlpha(0.9);

        const totalPaginas = Math.ceil(LISTA_JOGOS.length / this.jogosPorPagina);
        this._anunciar(
            `Menu de jogos. Página ${this.paginaAtual + 1} de ${totalPaginas}. ` +
            `${jogosDaPagina.length} jogos disponíveis. ` +
            `Use as setas do teclado para navegar e Enter para selecionar.`
        );
    }

    criarBotaoJogo(jogo, index) {
        const { width, height } = this.scale;
        const colunas = 3;

        const margemLateral = width * 0.06;
        const areaUtil = width - margemLateral * 2;
        const gapX = areaUtil * 0.04;
        const larguraBotao = (areaUtil - gapX * (colunas - 1)) / colunas;
        const alturaBotao = height * 0.28;
        const espacamentoX = larguraBotao + gapX;
        const espacamentoY = alturaBotao * 1.22;

        const offsetX = margemLateral + larguraBotao / 2;
        const x = offsetX + (index % colunas) * espacamentoX;
        const y = height * 0.35 + Math.floor(index / colunas) * espacamentoY;

        const container = this.add.container(x, y);

        /*
            ACESSIBILIDADE (WCAG 1.4.3 - Contrast):
            Stroke branco sobre cor de fundo garante separação visual.
            A borda de foco (0xFFD700 amarelo) tem contraste alto sobre qualquer cor.
        */
        const fundo = this.add.rectangle(0, 0, larguraBotao, alturaBotao, jogo.cor)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff, 0.8);

        const fontSize = Math.round(alturaBotao * 0.13);

        const texto = this.add.text(0, alturaBotao * 0.3, jogo.nome.toUpperCase(), {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.round(fontSize * 0.22),
            align: 'center',
            wordWrap: { width: larguraBotao - larguraBotao * 0.1 }
        }).setOrigin(0.5);

        container.add(fundo);
        container.add(texto);

        if (this.textures.exists(jogo.id)) {
            const iconeSize = alturaBotao * 0.48;
            const icone = this.add.image(0, -alturaBotao * 0.18, jogo.id)
                .setDisplaySize(iconeSize, iconeSize);
            container.add(icone);
        }

        // Ações de ponteiro (mouse e touch via pointerdown — WCAG 2.5.1)
        let acionado = false;

        const selecionarJogo = () => {
            if (acionado) return;
            acionado = true;
            container.setScale(0.93);
            this.time.delayedCall(100, () => this.iniciarTrocaDeJogo(jogo));
        };

        fundo.on('pointerdown', selecionarJogo);
        fundo.on('pointerup', () => container.setScale(1));

        /*
            ACESSIBILIDADE (WCAG 2.4.7 - Focus Visible):
            Destaca visualmente o card quando recebe foco via teclado.
        */
        fundo.on('pointerover', () => {
            fundo.setStrokeStyle(6, 0xFFD700, 1);
        });
        fundo.on('pointerout', () => {
            /*
                ACESSIBILIDADE (WCAG 2.4.7 - Focus Visible):
                Só remove o hover se este card NÃO for o que está com foco de teclado.
                Sem esta guarda, mover o mouse para fora apagava o indicador de foco,
                deixando o usuário de teclado sem referência visual de onde está.
            */
            const esteCardFocado = this._cardRefs[this.indiceFoco]?.fundo === fundo;
            if (!esteCardFocado) {
                fundo.setStrokeStyle(4, 0xffffff, 0.8);
            }
        });

        // Salva referência para navegação por teclado
        this._cardRefs.push({ container, fundo, jogo });
        this.botoesGrupo.add(container);
    }

    /**
     * Aplica o indicador de foco visual ao card pelo índice.
     * WCAG 2.4.7 - Focus Visible.
     */
    _aplicarFoco(novoIndice) {
        // Remove foco do card anterior
        if (this._cardRefs[this.indiceFoco]) {
            this._cardRefs[this.indiceFoco].fundo.setStrokeStyle(4, 0xffffff, 0.8);
            this._cardRefs[this.indiceFoco].container.setScale(1);
        }

        this.indiceFoco = novoIndice;

        // Aplica foco no novo card
        if (this._cardRefs[this.indiceFoco]) {
            const { fundo, container, jogo } = this._cardRefs[this.indiceFoco];
            // Borda amarela de alto contraste como indicador de foco
            fundo.setStrokeStyle(8, 0xFFD700, 1);
            container.setScale(1.04);
            this._anunciar(`${jogo.nome}. Pressione Enter para jogar.`);
        }
    }

    /**
     * Registra navegação por teclado nos cards do menu.
     * WCAG 2.1.1 - Keyboard: toda funcionalidade deve ser operável por teclado.
     */
    _registrarNavegacaoTeclado() {
        // Remove listener anterior para evitar duplicação entre páginas
        if (this._keyListener) {
            this.input.keyboard.off('keydown', this._keyListener);
        }

        const totalCards = this._cardRefs.length;
        const colunas = 3;
        const totalPaginas = Math.ceil(LISTA_JOGOS.length / this.jogosPorPagina);

        this._keyListener = (event) => {

            const teclasConsumidas = [
                Phaser.Input.Keyboard.KeyCodes.RIGHT,
                Phaser.Input.Keyboard.KeyCodes.LEFT,
                Phaser.Input.Keyboard.KeyCodes.DOWN,
                Phaser.Input.Keyboard.KeyCodes.UP,
                Phaser.Input.Keyboard.KeyCodes.ENTER,
                Phaser.Input.Keyboard.KeyCodes.SPACE,
                Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN,
                Phaser.Input.Keyboard.KeyCodes.PAGE_UP,
                65, 68, 83, 87 // A, D, S, W
            ];
            if (teclasConsumidas.includes(event.keyCode)) {
                event.preventDefault();
            }

            switch (event.keyCode) {
                // Seta direita / D: próximo card
                case Phaser.Input.Keyboard.KeyCodes.RIGHT:
                case 68: // D
                    if (this.indiceFoco < totalCards - 1) {
                        this._aplicarFoco(this.indiceFoco + 1);
                    }
                    break;

                // Seta esquerda / A: card anterior
                case Phaser.Input.Keyboard.KeyCodes.LEFT:
                case 65: // A
                    if (this.indiceFoco > 0) {
                        this._aplicarFoco(this.indiceFoco - 1);
                    }
                    break;

                // Seta baixo / S: linha abaixo
                case Phaser.Input.Keyboard.KeyCodes.DOWN:
                case 83: // S
                    if (this.indiceFoco + colunas < totalCards) {
                        this._aplicarFoco(this.indiceFoco + colunas);
                    } else if (this.paginaAtual < totalPaginas - 1) {
                        // Avança página ao chegar no último card
                        this.paginaAtual++;
                        this.renderizarInterfaceMenu();
                    }
                    break;

                // Seta cima / W: linha acima
                case Phaser.Input.Keyboard.KeyCodes.UP:
                case 87: // W
                    if (this.indiceFoco - colunas >= 0) {
                        this._aplicarFoco(this.indiceFoco - colunas);
                    } else if (this.paginaAtual > 0) {
                        // Volta página ao chegar no primeiro card
                        this.paginaAtual--;
                        this.renderizarInterfaceMenu();
                    }
                    break;

                // Enter / Espaço: seleciona o card focado
                case Phaser.Input.Keyboard.KeyCodes.ENTER:
                case Phaser.Input.Keyboard.KeyCodes.SPACE:
                    if (this._cardRefs[this.indiceFoco]) {
                        
                        const { container, jogo } = this._cardRefs[this.indiceFoco];
                        container.setScale(0.93);
                        this.time.delayedCall(100, () => this.iniciarTrocaDeJogo(jogo));
                    }
                    break;

                // Page Down / L: próxima página
                case Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN:
                    if (this.paginaAtual < totalPaginas - 1) {
                        this.paginaAtual++;
                        this.renderizarInterfaceMenu();
                    }
                    break;

                // Page Up / J: página anterior
                case Phaser.Input.Keyboard.KeyCodes.PAGE_UP:
                    if (this.paginaAtual > 0) {
                        this.paginaAtual--;
                        this.renderizarInterfaceMenu();
                    }
                    break;
            }
        };

        this.input.keyboard.on('keydown', this._keyListener);

        // Aplica foco inicial no primeiro card
        if (this._cardRefs.length > 0) {
            this._aplicarFoco(0);
        }
    }

    criarNavegacao() {
        const { width, height } = this.scale;
        const totalPaginas = Math.ceil(LISTA_JOGOS.length / this.jogosPorPagina);

        if (this.paginaAtual > 0) {
            this.criarSetaNavegacao(width * 0.05, height / 2, 'Anterior', -1);
        }

        if (this.paginaAtual < totalPaginas - 1) {
            this.criarSetaNavegacao(width * 0.95, height / 2, 'Próximo', 1);
        }
    }

    criarSetaNavegacao(x, y, label, direcao) {
        const { height } = this.scale;
        /*
            RESPONSIVIDADE: raio do círculo proporcional à altura do canvas.
            Antes era fixo em 60px — em telas pequenas ficava enorme.
        */
        const raio = height * 0.065;
        const setaContainer = this.add.container(x, y);

        const circulo = this.add.circle(0, 0, raio, 0xffffff, 0.2)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff);

        const fonteSeta = Math.round(raio * 0.9);
        const fonteLabel = Math.round(raio * 0.38);

        const textoSeta = this.add.text(0, raio * 1.3, label, {
            fontSize: `${fonteLabel}px`,
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const iconeSeta = this.add.text(0, 0, direcao > 0 ? '›' : '‹', {
            fontSize: `${fonteSeta}px`,
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        setaContainer.add([circulo, textoSeta, iconeSeta]);

        circulo.on('pointerover', () => circulo.setStrokeStyle(6, 0xFFD700, 1));
        circulo.on('pointerout', () => circulo.setStrokeStyle(4, 0xffffff, 1));

        circulo.on('pointerdown', () => {
            this.paginaAtual += direcao;
            this.renderizarInterfaceMenu();
        });

        this.botoesGrupo.add(setaContainer);
    }

    iniciarTrocaDeJogo(jogo) {
        // Remove listener de teclado antes de pausar a cena
        if (this._keyListener) {
            this.input.keyboard.off('keydown', this._keyListener);
            this._keyListener = null;
        }

        this._anunciar(`Iniciando jogo: ${jogo.nome}`);
        window.ponte.emitir('TROCAR_JOGO', { caminho: jogo.caminho, nome: jogo.nome });
        this.scene.pause();
        this.cameras.main.fadeOut(500, 0, 0, 0);
    }
}
