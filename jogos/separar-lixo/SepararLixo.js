export default class SepararLixo extends Phaser.Scene {
    constructor() {
        super('SepararLixo');
        
        // Configuração lógica: associamos um "apelido" (chave) ao tipo de lixo
        this.configLixo = {
            'papel': { binImg: 'lixeira_azul', itemImg: 'item_papel' },
            'plastico': { binImg: 'lixeira_vermelha', itemImg: 'item_plastico' },
            'vidro': { binImg: 'lixeira_verde', itemImg: 'item_vidro' },
            'organico': { binImg: 'lixeira_amarela', itemImg: 'item_organico' }
        };
        
        this.score = 0;
        this.scoreToWin = 10;
        this.maxItensNaTela = 4; 
        this.itensAtuais = 0;
    }

    preload() {
        // Carregamento das Lixeiras
        this.load.image('lixeira_azul', 'assets/lixeira_azul.png');
        this.load.image('lixeira_vermelha', 'assets/lixeira_vermelha.png');
        this.load.image('lixeira_verde', 'assets/lixeira_verde.png');
        this.load.image('lixeira_amarela', 'assets/lixeira_amarela.png');

        // Carregamento dos Itens de Lixo
        this.load.image('item_papel', 'assets/papel.png');
        this.load.image('item_plastico', 'assets/plastico.png');
        this.load.image('item_vidro', 'assets/vidro.png');
        this.load.image('item_organico', 'assets/organico.png');
    }

    create() {
        const { width, height } = this.scale;
        
        // --- 1. TÍTULOS E TEXTOS EDUCATIVOS ---
        this.add.text(width / 2, 80, 'COLETA SELETIVA', { 
            fontSize: '84px', fill: '#fff', fontFamily: 'Arial Black' 
        }).setOrigin(0.5);

        this.scoreText = this.add.text(width / 2, 170, `Acertos: 0 / ${this.scoreToWin}`, { 
            fontSize: '48px', fill: '#ffff00', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const textoChamada = this.add.text(width / 2, 260, 'AJUDE A DEFESA CIVIL: SEPARE O LIXO CORRETAMENTE!', { 
            fontSize: '34px', fill: '#00ff00', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        // Animação de pulsação para atrair crianças
        this.tweens.add({
            targets: textoChamada,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            loop: -1
        });

        // --- 2. CRIAÇÃO DAS LIXEIRAS E ZONAS DE DROP ---
        const yPosLixeira = height * 0.78; 
        const chaves = Object.keys(this.configLixo);
        
        chaves.forEach((tipo, index) => {
            const config = this.configLixo[tipo];
            const xPos = (width / 5) * (index + 1);
            
            // Imagem visual da lixeira
            const lixeiraImg = this.add.image(xPos, yPosLixeira, config.binImg).setScale(0.85);
            
            // Hitbox invisível ampliada (Drop Zone) para facilitar o toque
            const zonaDrop = this.add.zone(xPos, yPosLixeira, 300, 400)
                .setRectangleDropZone(300, 400)
                .setData('tipo_lixo_correto', tipo)
                .setData('objeto_visual', lixeiraImg);

            this.add.text(xPos, yPosLixeira + 180, tipo.toUpperCase(), { 
                fontSize: '40px', fill: '#ffffff', fontWeight: '900', stroke: '#000', strokeThickness: 5
            }).setOrigin(0.5);
        });

        // --- 3. EVENTOS DE INTERAÇÃO (DRAG AND DROP) ---
        this.input.on('dragstart', (pointer, lixo) => {
            lixo.setDepth(100);
            this.tweens.add({ targets: lixo, scale: 0.6, duration: 150, ease: 'Back.easeOut' });
            lixo.setTint(0xeeeeee);
        });

        this.input.on('drag', (pointer, lixo, dragX, dragY) => {
            lixo.setPosition(dragX, dragY);
        });

        this.input.on('drop', (pointer, lixo, zonaDrop) => {
            const lixeiraImg = zonaDrop.getData('objeto_visual');

            if (lixo.getData('tipo_lixo') === zonaDrop.getData('tipo_lixo_correto')) {
                this.processarAcerto(lixo, zonaDrop, lixeiraImg);
            } else {
                this.processarErro(lixo, lixeiraImg);
            }
        });

        this.input.on('dragend', (pointer, lixo, dropped) => {
            if (!dropped) this.processarErro(lixo, null);
            lixo.clearTint();
            lixo.setDepth(1);
        });

        this.iniciarGeradorEstatico();
    }

    processarAcerto(lixo, zonaDrop, lixeiraImg) {
        // Explosão de partículas com a própria textura do lixo
        const particles = this.add.particles(zonaDrop.x, zonaDrop.y, lixo.texture.key, {
            speed: { min: -250, max: 250 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            lifespan: 600,
            gravityY: 400,
            quantity: 20
        });
        this.time.delayedCall(150, () => particles.stop());

        this.score++;
        this.itensAtuais--;
        this.scoreText.setText(`Acertos: ${this.score} / ${this.scoreToWin}`);
        
        // Efeito da lixeira "comendo" o lixo
        this.tweens.add({
            targets: lixeiraImg,
            scale: 1,
            duration: 100,
            yoyo: true
        });

        lixo.destroy();
        if (this.score >= this.scoreToWin) this.ganharJogo();
    }

    processarErro(lixo, lixeiraImg) {
        // Feedback visual de erro na lixeira (tremer e cor vermelha)
        if (lixeiraImg) {
            lixeiraImg.setTint(0xff0000);
            this.tweens.add({
                targets: lixeiraImg,
                x: lixeiraImg.x + 12,
                duration: 60,
                repeat: 3,
                yoyo: true,
                onComplete: () => lixeiraImg.clearTint()
            });
        }

        // Lixo volta para a origem com efeito elástico
        this.tweens.add({
            targets: lixo,
            x: lixo.getData('origemX'),
            y: lixo.getData('origemY'),
            scale: 0.3,
            duration: 600,
            ease: 'Elastic.easeOut'
        });
    }

    iniciarGeradorEstatico() {
        this.spawnTimer = this.time.addEvent({
            delay: 1500, 
            callback: this.spawnLixo,
            callbackScope: this,
            loop: true
        });
    }

    spawnLixo() {
        if (this.itensAtuais >= this.maxItensNaTela) return;
        const { width, height } = this.scale;
        const tipos = Object.keys(this.configLixo);
        const tipoAleatorio = Phaser.Utils.Array.GetRandom(tipos);
        
        const xPos = Phaser.Math.Between(width * 0.2, width * 0.8);
        const yPos = Phaser.Math.Between(height * 0.35, height * 0.55);

        const lixo = this.add.sprite(xPos, yPos, this.configLixo[tipoAleatorio].itemImg)
            .setData('tipo_lixo', tipoAleatorio)
            .setData('origemX', xPos)
            .setData('origemY', yPos)
            .setInteractive()
            .setScale(0);

        this.input.setDraggable(lixo);
        this.tweens.add({ targets: lixo, scale: 0.3, duration: 450, ease: 'Back.easeOut' });
        this.itensAtuais++;
    }

    ganharJogo() {
        if (this.spawnTimer) this.spawnTimer.remove();
        const { width, height } = this.scale;
        
        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.85).setDepth(1000);
        this.add.text(width / 2, height / 2 - 50, 'MUITO BEM!', { 
            fontSize: '110px', fill: '#00ff00', fontFamily: 'Arial Black' 
        }).setOrigin(0.5).setDepth(1001);

        const btn = this.add.text(width/2, height/2 + 130, ' VOLTAR AO MENU ', { 
            fontSize: '48px', backgroundColor: '#27ae60', padding: { x: 40, y: 20 }, fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            if (window.parent && window.parent.ponte) {
                window.parent.ponte.emitir('VOLTAR_MENU');
            }
        });
    }
}