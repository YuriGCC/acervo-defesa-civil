export default class JogoMemoria extends Phaser.Scene {
    constructor() {
        super('JogoMemoria');
        this.cartas = [];
        this.escolhas = [];
        this.acertos = 0;
        this.podeJogar = true;
    }

    preload() {
        this.load.image('img1', 'assets/agente-mirim.jpeg');
        this.load.image('img2', 'assets/blumenau.jpeg');
        this.load.image('img3', 'assets/defesa-civil-escola-logo.jpeg');
        this.load.image('img4', 'assets/defesa-civil-escola.jpeg');
        this.load.image('img5', 'assets/defesa-civil.jpeg');
        this.load.image('img6', 'assets/logo-defesa-civil.jpeg');
    }

    create() {
        const { width, height } = this.scale;

        this.add.graphics().fillStyle(0x1a252f, 1).fillRect(0, 0, width, height);

        this.add.text(width / 2, 70, 'Jogo da Memória', {
            fontSize: '64px', fill: '#ffffff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

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

            container.add([molduraFrente, frenteImg, versoGfx, txtDuvida]);
            container.setData('key', imgKey);

            const hitArea = this.add.rectangle(0, 0, 260, 200, 0x000, 0).setInteractive({ useHandCursor: true });
            container.add(hitArea);

            hitArea.on('pointerdown', () => this.virarCarta(container));
            this.cartas.push(container);
        });
    }
    virarCarta(container) {
        if (!this.podeJogar || container.getData('revelada') || this.escolhas.includes(container)) return;

        this.tweens.add({
            targets: container,
            scale: 1.05,
            duration: 80,
            yoyo: true,
            onComplete: () => {
                container.list[0].setVisible(true);
                container.list[1].setVisible(true);
                container.list[2].setVisible(false);
                container.list[3].setVisible(false); 
            }
        });

        this.escolhas.push(container);

        if (this.escolhas.length === 2) {
            this.podeJogar = false;

            this.time.delayedCall(500, () => this.verificarPar());
        }
    }

    verificarPar() {
        const [c1, c2] = this.escolhas;

        if (c1.getData('key') === c2.getData('key')) {
            c1.setData('revelada', true);
            c2.setData('revelada', true);

            c1.list[0].fillColor = 0x2ecc71;
            c2.list[0].fillColor = 0x2ecc71;

            this.acertos++;
            if (this.acertos === 6) this.finalizar();
        } else {
            this.tweens.add({
                targets: [c1, c2],
                x: '+=10',
                duration: 50,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    c1.list[0].setVisible(false); c1.list[1].setVisible(false);
                    c1.list[2].setVisible(true); c1.list[3].setVisible(true);
                    c2.list[0].setVisible(false); c2.list[1].setVisible(false);
                    c2.list[2].setVisible(true); c2.list[3].setVisible(true);
                }
            });
        }
        this.escolhas = [];
        this.podeJogar = true;
    }

    finalizar() {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(100);

        this.add.text(width / 2, height / 2 - 50, 'MUITO BEM!', {
            fontSize: '90px', fill: '#2ecc71', fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(101);

        const btn = this.add.text(width / 2, height / 2 + 130, ' VOLTAR AO MENU ', {
            fontSize: '42px', backgroundColor: '#e67e22', padding: 25, fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            if (window.parent && window.parent.ponte) {
                window.parent.ponte.emitir('VOLTAR_MENU');
            }
        });
    }
}