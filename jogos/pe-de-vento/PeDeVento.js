export default class PeDeVento extends Phaser.Scene {
    constructor() {
        super('PeDeVento');
        this.janelas = [];
        this.maxErros = 3;
        this.errosAtuais = 0;
        this.gameTimer = null;
        this.eventTimer = null;
        this.windParticles = null; 
    }

    create() {
        const { width, height } = this.scale;

        this.createWindTexture();

        const bg = this.add.graphics();
        bg.fillStyle(0x2980b9, 1); 
        bg.fillRect(0, 0, width, height);
        bg.fillStyle(0x7f8c8d, 1); 
        bg.fillRect(0, height * 0.75, width, height * 0.25);

        this.add.text(width / 2, 80, 'PROTEJA A CASA DO VENTO E DA CHUVA!', {
            fontSize: '90px', fill: '#ffffff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5);

        const msgSeguranca = this.add.text(width / 2, 210, 'MANTENHA AS JANELAS FECHADAS PARA EVITAR ACIDENTES!', {
            fontSize: '40px', fill: '#ffcc00', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 6,
            align: 'center', wordWrap: { width: 1200 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msgSeguranca,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            loop: -1
        });

        this.timerText = this.add.text(width / 2, height - 80, 'Tempo: 30s', {
            fontSize: '64px', fill: '#ffff00', fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        this.errorText = this.add.text(width / 2, height - 190, 'JANELAS ABERTAS: 0 / 3', {
            fontSize: '48px', fill: '#ffffff', fontFamily: 'Arial Black', backgroundColor: '#c0392b', padding: { x: 25, y: 15 }
        }).setOrigin(0.5);

        this.windParticles = this.add.particles(0, 0, 'particulaVento', {
            speedX: { min: -150, max: 150 },
            speedY: { min: 100, max: 500 }, 
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.6, end: 0 },
            rotate: { min: 0, max: 360 },
            lifespan: 800,
            quantity: 3,
            frequency: 50,
            emitting: false
        });

        const posicoes = [
            { x: width * 0.22, y: height * 0.48 },
            { x: width * 0.50, y: height * 0.48 },
            { x: width * 0.78, y: height * 0.48 }
        ];

        this.janelas = [];
        this.errosAtuais = 0;

        posicoes.forEach((pos) => {
            const janelaContainer = this.add.container(pos.x, pos.y);

            const vidro = this.add.graphics();
            this.desenharJanelaVisual(vidro, false);

            const moldura = this.add.graphics();
            moldura.lineStyle(15, 0xffffff, 1);
            moldura.strokeRect(-200, -150, 400, 300);

            const hitArea = this.add.rectangle(0, 0, 480, 380, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });

            janelaContainer.add([vidro, moldura, hitArea]);
            janelaContainer.setData('isOpen', false);
            janelaContainer.setData('graficoVidro', vidro);
            janelaContainer.setData('graficoMoldura', moldura);

            hitArea.on('pointerdown', () => this.clicarJanela(janelaContainer));
            this.janelas.push(janelaContainer);
        });

        this.configurarTimers();
    }

    createWindTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillCircle(10, 10, 10);

        graphics.generateTexture('particulaVento', 20, 20);
    }

    configurarTimers() {
        this.gameTimer = this.time.addEvent({
            delay: 30000,
            callback: this.ganharJogo,
            callbackScope: this
        });

        this.eventTimer = this.time.addEvent({
            delay: 2500,
            callback: this.abrirJanelaAleatoria,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.gameTimer) {
            const tempoRestante = Math.ceil(this.gameTimer.getRemainingSeconds());
            this.timerText.setText(`Tempo: ${tempoRestante}s`);
        }
    }

    desenharJanelaVisual(graphics, aberta) {
        graphics.clear();
        if (aberta) {
            graphics.fillStyle(0x000000, 0.95);
            graphics.fillRect(-200, -150, 400, 300);

            graphics.fillStyle(0xbdc3c7, 1);
            graphics.fillRect(-240, -150, 40, 300);
            graphics.fillRect(200, -150, 40, 300);
        } else {
            graphics.fillStyle(0x3498db, 0.8);
            graphics.fillRect(-200, -150, 400, 300);
            graphics.lineStyle(8, 0xffffff, 1);
            graphics.lineBetween(0, -150, 0, 150);
            graphics.lineBetween(-200, 0, 200, 0);
        }
    }

    clicarJanela(container) {
        if (container.getData('isOpen')) {

            this.tweens.add({
                targets: container,
                scale: 0.92,
                duration: 50,
                yoyo: true,
                ease: 'Power1'
            });

            container.setData('isOpen', false);
            this.desenharJanelaVisual(container.getData('graficoVidro'), false);

            const moldura = container.getData('graficoMoldura');
            moldura.clear();
            moldura.lineStyle(15, 0xffffff, 1);
            moldura.strokeRect(-200, -150, 400, 300);

            this.windParticles.stopFollow();
            this.windParticles.emitting = false;

            this.errosAtuais--;
            this.atualizarTextoErro();
        }
    }

    abrirJanelaAleatoria() {
        const fechadas = this.janelas.filter(j => !j.getData('isOpen'));
        if (fechadas.length > 0) {
            const janela = Phaser.Utils.Array.GetRandom(fechadas);
            janela.setData('isOpen', true);
            this.desenharJanelaVisual(janela.getData('graficoVidro'), true);

            const moldura = janela.getData('graficoMoldura');
            moldura.clear();
            moldura.lineStyle(15, 0xff0000, 1);
            moldura.strokeRect(-200, -150, 400, 300);

            this.tweens.add({
                targets: janela,
                x: janela.x + 15,
                duration: 60,
                repeat: 4,
                yoyo: true,
                ease: 'Bounce.easeInOut'
            });

            this.windParticles.startFollow(janela);
            this.windParticles.emitting = true;

            this.errosAtuais++;
            this.atualizarTextoErro();
            if (this.errosAtuais >= this.maxErros) this.perderJogo();
        }
    }

    atualizarTextoErro() {
        this.errorText.setText(`JANELAS ABERTAS: ${this.errosAtuais} / ${this.maxErros}`);
    }

    ganharJogo() {
        this.finalizarPartida('MUITO BEM!', '#00ff00', 'VOCÊ PROTEGEU A CASA!');
    }

    perderJogo() {
        this.finalizarPartida('OPS! CASA INUNDADA!', '#ff0000', 'LEMBRE-SE DE FECHAR AS JANELAS DURANTE VENTANIAS.');
    }

    finalizarPartida(titulo, corTitulo, subTitulo) {
        if (this.gameTimer) this.gameTimer.destroy();
        if (this.eventTimer) this.eventTimer.destroy();
        this.windParticles.destroy(); 

        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setDepth(100);

        this.add.text(width / 2, height / 2 - 120, titulo, {
            fontSize: '130px', fill: corTitulo, fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 12
        }).setOrigin(0.5).setDepth(101);

        this.add.text(width / 2, height / 2 + 10, subTitulo, {
            fontSize: '48px', fill: '#ffffff', fontFamily: 'Arial Black', align: 'center', wordWrap: { width: 1400 }
        }).setOrigin(0.5).setDepth(101);

        const btnSair = this.add.text(width / 2, height / 2 + 180, ' VOLTAR AO MENU ', {
            fontSize: '54px', fill: '#ffffff', backgroundColor: '#27ae60', padding: { x: 50, y: 25 }, fontFamily: 'Arial Black'
        })
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.voltarAoAcervo());
    }

    voltarAoAcervo() {
        this.game.destroy(true, false);
        if (window.parent && window.parent.ponte) {
            window.parent.ponte.emitir('VOLTAR_MENU');
        }
    }
}