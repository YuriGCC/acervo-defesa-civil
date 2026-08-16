export default class SepararLixo extends Phaser.Scene {
    constructor() {
        super('SepararLixo');
        
        // Adicionamos os nomes em português para o leitor de tela pronunciar
        this.configLixo = {
            'papel': { binImg: 'lixeira_azul', itemImg: 'item_papel', nome: 'Papel', corLixeira: 'Azul' },
            'plastico': { binImg: 'lixeira_vermelha', itemImg: 'item_plastico', nome: 'Plástico', corLixeira: 'Vermelha' },
            'vidro': { binImg: 'lixeira_verde', itemImg: 'item_vidro', nome: 'Vidro', corLixeira: 'Verde' },
            'organico': { binImg: 'lixeira_amarela', itemImg: 'item_organico', nome: 'Orgânico', corLixeira: 'Amarela' }
        };
        
        this.score = 0;
        this.scoreToWin = 10;
        this.maxItensNaTela = 4; 
        
        // Variáveis de Estado de Acessibilidade
        this.lixosEmCena = [];
        this.lixeirasEmCena = [];
        this.estadoTeclado = 'LIVRE'; // 'LIVRE', 'SEGURANDO', 'FIM'
        this.indiceFoco = -1;
        this.lixoSegurado = null;
        this.btnVoltar = null;
    }

    preload() {
        this.load.image('lixeira_azul', 'assets/lixeira_azul.png');
        this.load.image('lixeira_vermelha', 'assets/lixeira_vermelha.png');
        this.load.image('lixeira_verde', 'assets/lixeira_verde.png');
        this.load.image('lixeira_amarela', 'assets/lixeira_amarela.png');
        this.load.image('item_papel', 'assets/papel.png');
        this.load.image('item_plastico', 'assets/plastico.png');
        this.load.image('item_vidro', 'assets/vidro.png');
        this.load.image('item_organico', 'assets/organico.png');
    }

    create() {
        // Reset de variáveis
        this.falar = criarAnunciador();
        this.reduzMovimento = prefersReducedMotion();
        this.lixosEmCena = [];
        this.lixeirasEmCena = [];
        this.score = 0;
        this.estadoTeclado = 'LIVRE';

        const { width, height } = this.scale;

        this.add.text(width / 2, 80, 'COLETA SELETIVA', {
            fontSize: '84px', fill: '#fff', fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(width / 2, 170, `Acertos: 0 / ${this.scoreToWin}`, {
            fontSize: '48px', fill: '#ffff00', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const textoChamada = this.add.text(width / 2, 260, 'AJUDE A DEFESA CIVIL: SEPARE O LIXO CORRETAMENTE!', {
            fontSize: '34px', fill: '#00ff00', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        if (!this.reduzMovimento) {
            this.tweens.add({ targets: textoChamada, scale: 1.05, duration: 1000, yoyo: true, loop: -1 });
        }

        // Legenda de acessibilidade de teclado (apenas computadores), criada uma única vez
        if (this.sys.game.device.os.desktop) {
            this.add.text(width / 2, height - 35, '⌨️ TECLADO: Use Setas para navegar | ENTER para selecionar | ESC para soltar', {
                fontSize: '22px',
                fill: '#aaaaaa',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);
        }

        // CRIAÇÃO DAS LIXEIRAS
        const yPosLixeira = height * 0.78; 
        const chaves = Object.keys(this.configLixo);
        
        chaves.forEach((tipo, index) => {
            const config = this.configLixo[tipo];
            const xPos = (width / 5) * (index + 1);
            
            const lixeiraImg = this.add.image(xPos, yPosLixeira, config.binImg).setScale(0.85);
            
            const zonaDrop = this.add.zone(xPos, yPosLixeira, 300, 400)
                .setRectangleDropZone(300, 400)
                .setData('tipo_lixo_correto', tipo)
                .setData('objeto_visual', lixeiraImg)
                .setData('nome_acessivel', `Lixeira ${config.corLixeira} para ${config.nome}`);

            this.add.text(xPos, yPosLixeira + 180, tipo.toUpperCase(), { 
                fontSize: '40px', fill: '#ffffff', fontWeight: '900', stroke: '#000', strokeThickness: 5
            }).setOrigin(0.5);

            // Guarda para navegação por teclado
            this.lixeirasEmCena.push(zonaDrop);
        });

        // CURSOR DE FOCO VISUAL (Acessibilidade Visual)
        this.cursorFoco = this.add.rectangle(0, 0, 200, 200, 0x000000, 0)
            .setStrokeStyle(10, 0xFFD700) // Amarelo de alto contraste
            .setDepth(999)
            .setVisible(false);

        // Faz o cursor pulsar para chamar atenção
        if (!this.reduzMovimento) {
            this.tweens.add({ targets: this.cursorFoco, alpha: 0.5, duration: 400, yoyo: true, loop: -1 });
        }

        // EVENTOS DE MOUSE/TOUCH (Mouse "limpa" o foco do teclado)
        this.input.on('pointerdown', () => this.limparFocoTeclado());

        this.input.on('dragstart', (pointer, lixo) => {
            lixo.setDepth(100);
            this.tweens.add({ targets: lixo, scale: 0.6, duration: 150, ease: 'Back.easeOut' });
            lixo.setTint(0xeeeeee);
        });

        this.input.on('drag', (pointer, lixo, dragX, dragY) => {
            lixo.setPosition(dragX, dragY);
        });

        this.input.on('drop', (pointer, lixo, zonaDrop) => {
            this.avaliarJogada(lixo, zonaDrop);
        });

        this.input.on('dragend', (pointer, lixo, dropped) => {
            if (!dropped) this.processarErro(lixo, null);
            lixo.clearTint();
            lixo.setDepth(1);
        });

        // Inicializa mecânicas
        this.configurarTeclado();
        this.iniciarGeradorEstatico();

        // Anúncio de boas vindas
        this.time.delayedCall(500, () => {
            this.falar("Jogo Coleta Seletiva iniciado. Use as setas para focar nos lixos e Enter para selecionar. Ou use o mouse para arrastar.");
        });
    }

    // --- LÓGICA CENTRAL DE ACERTO/ERRO (Compartilhada por Mouse e Teclado) ---
    avaliarJogada(lixo, zonaDrop) {
        const lixeiraImg = zonaDrop.getData('objeto_visual');
        const tipoLixo = lixo.getData('tipo_lixo');
        const tipoCorreto = zonaDrop.getData('tipo_lixo_correto');

        const configLixo = this.configLixo[tipoLixo];
        const configLixeiraCorreta = this.configLixo[tipoCorreto];

        if (tipoLixo === tipoCorreto) {
            this.falar(`Correto! ${configLixo.nome} colocado na lixeira ${configLixo.corLixeira}.`);
            this.processarAcerto(lixo, zonaDrop, lixeiraImg);
        } else {
            this.falar(`Ops, errado. ${configLixo.nome} não vai na lixeira ${configLixeiraCorreta.corLixeira}. O lixo voltou pro chão.`);
            this.processarErro(lixo, lixeiraImg);
        }
    }

    processarAcerto(lixo, zonaDrop, lixeiraImg) {
        if (!this.reduzMovimento) {
            const particles = this.add.particles(zonaDrop.x, zonaDrop.y, lixo.texture.key, {
                speed: { min: -250, max: 250 }, angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0 }, lifespan: 600, gravityY: 400, quantity: 20
            });
            this.time.delayedCall(150, () => particles.stop());
        }

        this.score++;
        this.scoreText.setText(`Acertos: ${this.score} / ${this.scoreToWin}`);

        if (!this.reduzMovimento) {
            this.tweens.add({ targets: lixeiraImg, scale: 1, duration: 100, yoyo: true });
        }

        // Remove do array de controle antes de destruir
        this.lixosEmCena = this.lixosEmCena.filter(item => item !== lixo);
        lixo.destroy();

        if (this.estadoTeclado === 'SEGURANDO') {
            this.estadoTeclado = 'LIVRE';
            this.limparFocoTeclado();
        }

        if (this.score >= this.scoreToWin) {
            this.ganharJogo();
        }
    }

    processarErro(lixo, lixeiraImg) {
        if (lixeiraImg) {
            lixeiraImg.setTint(0xff0000);
            if (this.reduzMovimento) {
                this.time.delayedCall(300, () => lixeiraImg.clearTint());
            } else {
                this.tweens.add({
                    targets: lixeiraImg, x: lixeiraImg.x + 12, duration: 60,
                    repeat: 3, yoyo: true, onComplete: () => lixeiraImg.clearTint()
                });
            }
        }

        const escalaBase = Math.min(this.scale.width / 1920, this.scale.height / 1080) * 0.55;
        this.tweens.add({
            targets: lixo, x: lixo.getData('origemX'), y: lixo.getData('origemY'),
            scale: escalaBase, duration: this.reduzMovimento ? 150 : 600, ease: this.reduzMovimento ? 'Linear' : 'Elastic.easeOut'
        });

        // Se errou pelo teclado, solta o lixo e mantém o foco nele pra tentar de novo
        if (this.estadoTeclado === 'SEGURANDO') {
            this.estadoTeclado = 'LIVRE';
            lixo.clearTint();
            this.aplicarFoco(this.lixosEmCena.indexOf(lixo));
        }
    }

    iniciarGeradorEstatico() {
        this.spawnTimer = this.time.addEvent({
            delay: 1800, callback: this.spawnLixo, callbackScope: this, loop: true
        });
    }

    spawnLixo() {
        if (this.lixosEmCena.length >= this.maxItensNaTela) return;
        const { width, height } = this.scale;
        const tipos = Object.keys(this.configLixo);
        const tipoAleatorio = Phaser.Utils.Array.GetRandom(tipos);
        const dados = this.configLixo[tipoAleatorio];
        
        const xPos = Phaser.Math.Between(width * 0.2, width * 0.8);
        const yPos = Phaser.Math.Between(height * 0.35, height * 0.55);
        const escalaBase = Math.min(width / 1920, height / 1080) * 0.55;

        const lixo = this.add.sprite(xPos, yPos, dados.itemImg)
            .setData('tipo_lixo', tipoAleatorio)
            .setData('nome_acessivel', dados.nome)
            .setData('origemX', xPos)
            .setData('origemY', yPos)
            .setInteractive()
            .setScale(0);

        this.input.setDraggable(lixo);
        this.tweens.add({ targets: lixo, scale: escalaBase, duration: 450, ease: 'Back.easeOut' });
        
        this.lixosEmCena.push(lixo);

        // Se está navegando pelo teclado e estava sem opções, avisa do novo item
        if (this.estadoTeclado === 'LIVRE' && this.lixosEmCena.length === 1 && this.indiceFoco !== -1) {
            this.falar("Novos lixos apareceram na tela. Use as setas para focar.");
        }
    }

    // --- CONTROLES DE ACESSIBILIDADE POR TECLADO ---
    configurarTeclado() {
        this.input.keyboard.on('keydown', (event) => {
            const keys = [37, 39, 38, 40, 13, 32, 27]; // Arrows, Enter, Space, Esc
            if (keys.includes(event.keyCode)) event.preventDefault();

            if (this.estadoTeclado === 'FIM') {
                if (event.keyCode === 13 || event.keyCode === 32) this.encerrarVoltarMenu();
                return;
            }

            // ESC cancela o agarre do lixo
            if (event.keyCode === 27 && this.estadoTeclado === 'SEGURANDO') {
                this.falar("Seleção cancelada.");
                this.estadoTeclado = 'LIVRE';
                this.lixoSegurado.clearTint();
                this.aplicarFoco(this.lixosEmCena.indexOf(this.lixoSegurado));
                return;
            }

            // Seta Direita
            if (event.keyCode === 39 || event.keyCode === 40) {
                this.navegarTeclado(1);
            }
            // Seta Esquerda
            if (event.keyCode === 37 || event.keyCode === 38) {
                this.navegarTeclado(-1);
            }
            // Enter / Espaço
            if (event.keyCode === 13 || event.keyCode === 32) {
                this.interagirTeclado();
            }
        });
    }

    navegarTeclado(direcao) {
        if (this.estadoTeclado === 'LIVRE') {
            if (this.lixosEmCena.length === 0) return;
            this.indiceFoco += direcao;
            if (this.indiceFoco >= this.lixosEmCena.length) this.indiceFoco = 0;
            if (this.indiceFoco < 0) this.indiceFoco = this.lixosEmCena.length - 1;
            
            this.aplicarFoco(this.indiceFoco);
        } 
        else if (this.estadoTeclado === 'SEGURANDO') {
            this.indiceFoco += direcao;
            if (this.indiceFoco >= this.lixeirasEmCena.length) this.indiceFoco = 0;
            if (this.indiceFoco < 0) this.indiceFoco = this.lixeirasEmCena.length - 1;
            
            this.aplicarFocoLixeira(this.indiceFoco);
        }
    }

    interagirTeclado() {
        if (this.estadoTeclado === 'LIVRE') {
            if (this.indiceFoco === -1 || !this.lixosEmCena[this.indiceFoco]) return;
            
            // "Agarra" o lixo
            this.lixoSegurado = this.lixosEmCena[this.indiceFoco];
            this.lixoSegurado.setTint(0xeeeeee);
            this.estadoTeclado = 'SEGURANDO';
            this.falar(`${this.lixoSegurado.getData('nome_acessivel')} selecionado. Use as setas para escolher a lixeira e pressione Enter.`);
            
            // Força o foco para a primeira lixeira imediatamente
            this.indiceFoco = 0;
            this.aplicarFocoLixeira(0);
        } 
        else if (this.estadoTeclado === 'SEGURANDO') {
            if (this.indiceFoco === -1 || !this.lixeirasEmCena[this.indiceFoco]) return;
            
            // "Solta" o lixo na lixeira
            const lixeiraAlvo = this.lixeirasEmCena[this.indiceFoco];
            this.avaliarJogada(this.lixoSegurado, lixeiraAlvo);
        }
    }

    aplicarFoco(indice) {
        const item = this.lixosEmCena[indice];
        if (!item) return;

        this.cursorFoco.setVisible(true);
        this.cursorFoco.width = item.displayWidth + 30;
        this.cursorFoco.height = item.displayHeight + 30;
        this.cursorFoco.setPosition(item.x, item.y);
        
        this.falar(`Lixo: ${item.getData('nome_acessivel')}. ${indice + 1} de ${this.lixosEmCena.length}. Pressione Enter para selecionar.`);
    }

    aplicarFocoLixeira(indice) {
        const lixeira = this.lixeirasEmCena[indice];
        if (!lixeira) return;

        this.cursorFoco.setVisible(true);
        this.cursorFoco.width = 300;
        this.cursorFoco.height = 420;
        this.cursorFoco.setPosition(lixeira.x, lixeira.y);
        
        this.falar(`${lixeira.getData('nome_acessivel')}.`);
    }

    limparFocoTeclado() {
        this.indiceFoco = -1;
        this.cursorFoco.setVisible(false);
    }

    ganharJogo() {
        if (this.spawnTimer) this.spawnTimer.remove();
        const { width, height } = this.scale;
        
        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.85).setDepth(1000);
        this.add.text(width / 2, height / 2 - 50, 'MUITO BEM!', { 
            fontSize: '110px', fill: '#00ff00', fontFamily: 'Arial Black' 
        }).setOrigin(0.5).setDepth(1001);

        this.btnVoltar = this.add.text(width/2, height/2 + 130, ' VOLTAR AO MENU \n [PRESSIONE ENTER]', { 
            fontSize: '48px', backgroundColor: '#27ae60', padding: { x: 40, y: 20 }, fontFamily: 'Arial', align: 'center'
        }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

        // Foco Visual no Fim
        this.cursorFoco.setVisible(true).setDepth(1002);
        this.cursorFoco.width = this.btnVoltar.width + 20;
        this.cursorFoco.height = this.btnVoltar.height + 20;
        this.cursorFoco.setPosition(this.btnVoltar.x, this.btnVoltar.y);

        this.estadoTeclado = 'FIM';
        this.falar("Você ganhou! Muito bem. Botão Voltar ao Menu selecionado. Pressione Enter.");

        this.btnVoltar.on('pointerdown', () => this.encerrarVoltarMenu());
    }

    encerrarVoltarMenu() {
        this.game.destroy(true, false);
        if (window.parent && window.parent.ponte) {
            window.parent.ponte.emitir('VOLTAR_MENU');
        }
    }
}