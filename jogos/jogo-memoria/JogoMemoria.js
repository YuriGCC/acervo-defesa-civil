const DESCRICOES_IMAGENS = {
    img1: 'Agente Mirim',
    img2: 'Blumenau',
    img3: 'Logo da Defesa Civil na escola',
    img4: 'Defesa Civil na escola',
    img5: 'Defesa Civil',
    img6: 'Logo da Defesa Civil'
};

export default class JogoMemoria extends Phaser.Scene {
    constructor() {
        super('JogoMemoria');
        this.cartas = [];
        this.escolhas = [];
        this.acertos = 0;
        this.podeJogar = true;
        this.indiceFoco = 0;
        this.estado = 'JOGANDO'; // 'JOGANDO', 'FIM'
        this.falar = () => {};
    }

    preload() {
        this.load.image('img1', 'assets/agente-mirim.jpeg');
        this.load.image('img2', 'assets/blumenau.jpeg');
        this.load.image('img3', 'assets/defesa-civil-escola-logo.jpeg');
        this.load.image('img4', 'assets/defesa-civil-escola.jpeg');
        this.load.image('img5', 'assets/defesa-civil.jpeg');
        this.load.image('img6', 'assets/logo-defesa-civil.jpeg');
        this.load.image('logo-uniasselvi', '../../assets/icone-uniasselvi.png');
        this.load.image('logo-parceria-defesa-civil', '../../assets/logo-defesa-civil.webp');
    }

    create() {
        const { width, height } = this.scale;

        this.falar = criarAnunciador();
        this.reduzMovimento = prefersReducedMotion();
        // O quadro de foco (teclado) só faz sentido em computadores; em telas de toque
        // (como a TV) ele nunca deve aparecer, já que não existe navegação por teclado ali.
        this.ehDesktop = this.sys.game.device.os.desktop;

        this.add.graphics().fillStyle(0x1a252f, 1).fillRect(0, 0, width, height);

        this.add.text(width / 2, 70, 'Jogo da Memória', {
            fontSize: '64px', fill: '#ffffff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        // Logos de parceria: não-interativas, então nunca capturam toque/clique.
        this.add.image(30, height - 30, 'logo-uniasselvi').setOrigin(0, 1).setDisplaySize(70, 70).setAlpha(0.75);
        this.add.image(115, height - 30, 'logo-parceria-defesa-civil').setOrigin(0, 1).setDisplaySize(70, 70).setAlpha(0.75);

        let deck = ['img1', 'img1', 'img2', 'img2', 'img3', 'img3', 'img4', 'img4', 'img5', 'img5', 'img6', 'img6'];
        Phaser.Utils.Array.Shuffle(deck);

        const colunas = 4;
        const espacamentoX = 320;
        const espacamentoY = 240;
        const inicioX = (width - (espacamentoX * (colunas - 1))) / 2;
        const inicioY = height * 0.38;

        this.cartas = [];
        this.acertos = 0;
        this.escolhas = [];
        this.podeJogar = true;
        this.indiceFoco = 0;
        this.estado = 'JOGANDO';

        deck.forEach((imgKey, index) => {
            const col = index % colunas;
            const lin = Math.floor(index / colunas);
            const x = inicioX + (col * espacamentoX);
            const y = inicioY + (lin * espacamentoY);

            const container = this.add.container(x, y);

            const molduraFrente = this.add.rectangle(0, 0, 260, 200, 0xffffff).setVisible(false);
            const frenteImg = this.add.image(0, 0, imgKey).setDisplaySize(240, 180).setVisible(false);

            const versoGfx = this.add.rectangle(0, 0, 260, 200, 0xe67e22);
            versoGfx.setStrokeStyle(6, 0xffffff);

            const txtDuvida = this.add.text(0, 0, '?', { fontSize: '100px', fill: '#ffffff', fontFamily: 'Arial Black' }).setOrigin(0.5);

            const iconeAcerto = this.add.text(95, -75, '✓', { fontSize: '48px', fill: '#ffffff', fontFamily: 'Arial Black' }).setOrigin(0.5).setVisible(false);

            container.add([molduraFrente, frenteImg, versoGfx, txtDuvida, iconeAcerto]);
            container.setData('key', imgKey);
            container.setData('nome_acessivel', DESCRICOES_IMAGENS[imgKey]);

            const hitArea = this.add.rectangle(0, 0, 260, 200, 0x000, 0).setInteractive({ useHandCursor: true });
            container.add(hitArea);

            hitArea.on('pointerdown', () => {
                this.indiceFoco = index;
                this.virarCarta(container);
            });
            this.cartas.push(container);
        });

        this.cursorFoco = this.add.rectangle(0, 0, 284, 224, 0xFFD700, 0)
            .setStrokeStyle(6, 0xFFD700)
            .setDepth(50)
            .setVisible(this.ehDesktop);

        if (this.ehDesktop && !this.reduzMovimento) {
            this.tweens.add({ targets: this.cursorFoco, alpha: 0.5, duration: 500, yoyo: true, loop: -1 });
        }

        this.configurarTeclado();
        this.atualizarFoco(true);
        this.falar('Jogo da Memória iniciado. Doze cartas viradas para baixo, seis pares para encontrar. Use as setas para navegar entre as cartas e Enter ou Espaço para virar.');
    }

    configurarTeclado() {
        this.input.keyboard.on('keydown', (event) => {
            const teclas = [37, 38, 39, 40, 13, 32];
            if (teclas.includes(event.keyCode)) event.preventDefault();

            if (this.estado === 'FIM') {
                if (event.keyCode === 13 || event.keyCode === 32) this.voltarAoMenu();
                return;
            }

            if (!this.podeJogar) return;

            switch (event.keyCode) {
                case 39: this.moverFoco(1); break;
                case 37: this.moverFoco(-1); break;
                case 40: this.moverFoco(4); break;
                case 38: this.moverFoco(-4); break;
                case 13:
                case 32:
                    this.virarCarta(this.cartas[this.indiceFoco]);
                    break;
            }
        });
    }

    moverFoco(delta) {
        const total = this.cartas.length;
        this.indiceFoco = ((this.indiceFoco + delta) % total + total) % total;
        this.atualizarFoco();
    }

    atualizarFoco(inicial = false) {
        const container = this.cartas[this.indiceFoco];
        this.cursorFoco.setPosition(container.x, container.y);
        if (!inicial) {
            const status = container.getData('revelada') ? 'par já encontrado' : 'virada para baixo';
            this.falar(`Carta ${this.indiceFoco + 1} de ${this.cartas.length}, ${status}.`);
        }
    }

    virarCarta(container) {
        if (!this.podeJogar || container.getData('revelada') || this.escolhas.includes(container)) return;

        const revelar = () => {
            container.list[0].setVisible(true);
            container.list[1].setVisible(true);
            container.list[2].setVisible(false);
            container.list[3].setVisible(false);
        };

        if (this.reduzMovimento) {
            revelar();
        } else {
            this.tweens.add({
                targets: container,
                scale: 1.05,
                duration: 80,
                yoyo: true,
                onComplete: revelar
            });
        }

        this.falar(`Carta virada: ${container.getData('nome_acessivel')}.`);

        this.escolhas.push(container);

        if (this.escolhas.length === 2) {
            this.podeJogar = false;
            this.time.delayedCall(this.reduzMovimento ? 50 : 500, () => this.verificarPar());
        }
    }

    verificarPar() {
        const [c1, c2] = this.escolhas;

        if (c1.getData('key') === c2.getData('key')) {
            c1.setData('revelada', true);
            c2.setData('revelada', true);

            c1.list[0].fillColor = 0x2ecc71;
            c2.list[0].fillColor = 0x2ecc71;
            c1.list[4].setVisible(true);
            c2.list[4].setVisible(true);

            this.acertos++;
            this.falar(`Par encontrado: ${c1.getData('nome_acessivel')}. ${this.acertos} de 6 pares.`);
            if (this.acertos === 6) {
                this.escolhas = [];
                this.podeJogar = true;
                this.finalizar();
                return;
            }
        } else {
            const virarDeVolta = () => {
                c1.list[0].setVisible(false); c1.list[1].setVisible(false);
                c1.list[2].setVisible(true); c1.list[3].setVisible(true);
                c2.list[0].setVisible(false); c2.list[1].setVisible(false);
                c2.list[2].setVisible(true); c2.list[3].setVisible(true);
            };

            if (this.reduzMovimento) {
                virarDeVolta();
            } else {
                this.tweens.add({
                    targets: [c1, c2],
                    x: '+=10',
                    duration: 50,
                    yoyo: true,
                    repeat: 1,
                    onComplete: virarDeVolta
                });
            }
            this.falar('Não formam par. As cartas viram de novo.');
        }
        this.escolhas = [];
        this.podeJogar = true;
    }

    voltarAoMenu() {
        this.game.destroy(true, false);
        if (window.parent && window.parent.ponte) {
            window.parent.ponte.emitir('VOLTAR_MENU');
        }
    }

    finalizar() {
        const { width, height } = this.scale;
        this.estado = 'FIM';

        if (window.parent && window.parent.ponte) {
            window.parent.ponte.emitir('JOGO_CONCLUIDO', { id: 'jogo-memoria' });
        }

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(100);

        this.add.text(width / 2, height / 2 - 50, 'MUITO BEM!', {
            fontSize: '90px', fill: '#2ecc71', fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(101);

        const btn = this.add.text(width / 2, height / 2 + 130, ' VOLTAR AO MENU ', {
            fontSize: '42px', backgroundColor: '#e67e22', padding: 25, fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => this.voltarAoMenu());

        this.cursorFoco.setDepth(102);
        this.cursorFoco.setSize(btn.width + 20, btn.height + 20);
        this.cursorFoco.setPosition(btn.x, btn.y);

        this.falar('Parabéns! Você encontrou todos os pares. Botão Voltar ao Menu selecionado. Pressione Enter.');
    }
}