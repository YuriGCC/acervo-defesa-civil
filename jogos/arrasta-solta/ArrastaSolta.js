export default class ArrastaSolta extends Phaser.Scene {
    constructor() {
        super('ArrastaSolta');

        this.faseAtual = 0;
        this.textosArrastaveis = [];
        this.zonasDeSoltar = [];

        this.baseStyle = {
            fontSize: '34px',
            fill: '#000',
            backgroundColor: '#ffffff',
            padding: { x: 30, y: 25 },
            wordWrap: { width: 480 },
            align: 'center',
            fontFamily: 'Arial Black'
        };

        this.correctStyle = { ...this.baseStyle, backgroundColor: '#aaffaa', fill: '#003300' };
        this.wrongStyle = { ...this.baseStyle, backgroundColor: '#ffaaaa', fill: '#330000' };

        this.zonasPos = {};
        this.navegaveis = [];
        this.indiceFoco = 0;
        this.estadoTeclado = 'LIVRE'; // 'LIVRE', 'SEGURANDO'
        this.indiceZonaFoco = 0;
        this.itemSegurado = null;
        this.falar = () => {};

        this.dadosDasFases = [
            {
                id: 'gatilho_arrasta_solta_kit',
                pergunta: 'A Defesa Civil avisou: RISCO DE ENCHENTE! O que devemos separar?',
                zona1_label: 'Levar',
                zona2_label: 'Deixar',
                respostas: [
                    { texto: 'Lanterna e Pilhas', alvo: 'zona1' },
                    { texto: 'Garrafas de Água', alvo: 'zona1' },
                    { texto: 'Videogame', alvo: 'zona2' },
                    { texto: 'Brinquedos', alvo: 'zona2' }
                ]
            },
            {
                id: 'gatilho_pe_de_vento',
                pergunta: 'Um PÉ DE VENTO forte começou! O que fazer?',
                zona1_label: 'É seguro fazer',
                zona2_label: 'É perigoso fazer',
                respostas: [
                    { texto: 'Ficar longe de janelas', alvo: 'zona1' },
                    { texto: 'Desligar os aparelhos', alvo: 'zona1' },
                    { texto: 'Subir no telhado', alvo: 'zona2' },
                    { texto: 'Ficar debaixo de árvore', alvo: 'zona2' }
                ]
            },
            {
                id: 'gatilho_risco_deslizamento',
                pergunta: 'Choveu muito! Quais são os SINAIS DE PERIGO?',
                zona1_label: 'Sinal de perigo',
                zona2_label: 'Sinal de segurança',
                respostas: [
                    { texto: 'Rachaduras na parede', alvo: 'zona1' },
                    { texto: 'Água barrenta no morro', alvo: 'zona1' },
                    { texto: 'O sol aparecendo', alvo: 'zona2' },
                    { texto: 'Água limpa da torneira', alvo: 'zona2' }
                ]
            }
        ];
    }

    preload() {
        this.load.image('logo-uniasselvi', '../../assets/icone-uniasselvi.png');
        this.load.image('logo-defesa-civil', '../../assets/logo-defesa-civil.webp');
    }

    create() {
        const { height } = this.scale;
        this.falar = criarAnunciador();
        this.reduzMovimento = prefersReducedMotion();
        // O quadro de foco (teclado) só faz sentido em computadores; em telas de toque
        // (como a TV) ele nunca deve aparecer, já que não existe navegação por teclado ali.
        this.ehDesktop = this.sys.game.device.os.desktop;

        this.input.dragDistanceThreshold = 5;

        this.desenharEstrutura();

        // Logos de parceria: não-interativas, então nunca capturam toque/clique.
        this.add.image(30, height - 30, 'logo-uniasselvi').setOrigin(0, 1).setDisplaySize(70, 70).setAlpha(0.75);
        this.add.image(115, height - 30, 'logo-defesa-civil').setOrigin(0, 1).setDisplaySize(70, 70).setAlpha(0.75);

        this.cursorFoco = this.add.rectangle(0, 0, 200, 80, 0x000000, 0)
            .setStrokeStyle(6, 0xFFD700)
            .setDepth(500)
            .setVisible(this.ehDesktop);
        if (this.ehDesktop && !this.reduzMovimento) {
            this.tweens.add({ targets: this.cursorFoco, alpha: 0.5, duration: 400, yoyo: true, loop: -1 });
        }

        this.configurarTeclado();
        this.carregarFase(this.faseAtual);
    }

    configurarTeclado() {
        this.input.keyboard.on('keydown', (event) => {
            const teclas = [37, 38, 39, 40, 13, 32, 27];
            if (teclas.includes(event.keyCode)) event.preventDefault();

            if (this.estadoTeclado === 'LIVRE') {
                if (event.keyCode === 39 || event.keyCode === 40) this.moverFoco(1);
                if (event.keyCode === 37 || event.keyCode === 38) this.moverFoco(-1);
                if (event.keyCode === 13 || event.keyCode === 32) this.ativarFoco();
            } else if (this.estadoTeclado === 'SEGURANDO') {
                if (event.keyCode === 27) this.cancelarSelecao();
                else if ([37, 38, 39, 40].includes(event.keyCode)) this.alternarZonaFoco();
                else if (event.keyCode === 13 || event.keyCode === 32) this.confirmarZona();
            }
        });
    }

    moverFoco(delta) {
        if (this.navegaveis.length === 0) return;
        this.indiceFoco = ((this.indiceFoco + delta) % this.navegaveis.length + this.navegaveis.length) % this.navegaveis.length;
        this.atualizarFocoVisual();
    }

    atualizarFocoVisual() {
        const alvo = this.navegaveis[this.indiceFoco];
        if (!alvo) return;
        if (this.ehDesktop) {
            this.cursorFoco.setPosition(alvo.x, alvo.y);
            this.cursorFoco.setSize(alvo.width + 30, alvo.height + 30);
        }

        if (alvo === this.botaoContinuar) {
            this.falar(`Botão: ${alvo.text}. Pressione Enter para confirmar.`);
        } else {
            const jaColocado = alvo.getData('zonaAtual') ? ' já posicionado' : '';
            this.falar(`Item: ${alvo.getData('textoOriginal')}${jaColocado}. Pressione Enter para escolher onde colocar.`);
        }
    }

    ativarFoco() {
        const alvo = this.navegaveis[this.indiceFoco];
        if (!alvo) return;

        if (alvo === this.botaoContinuar) {
            this.tratarCliqueBotao();
            return;
        }

        if (alvo.input && alvo.input.enabled === false) return;

        this.itemSegurado = alvo;
        this.estadoTeclado = 'SEGURANDO';
        this.indiceZonaFoco = 0;
        this.falar(`${alvo.getData('textoOriginal')} selecionado. Use as setas para escolher entre ${this.zona1_label.text} e ${this.zona2_label.text}, e pressione Enter para confirmar. Esc cancela.`);
        this.atualizarFocoZona();
    }

    alternarZonaFoco() {
        this.indiceZonaFoco = this.indiceZonaFoco === 0 ? 1 : 0;
        this.atualizarFocoZona();
    }

    atualizarFocoZona() {
        const zonaId = this.indiceZonaFoco === 0 ? 'zona1' : 'zona2';
        const pos = this.zonasPos[zonaId];
        if (this.ehDesktop) {
            this.cursorFoco.setPosition(pos.x, pos.y);
            this.cursorFoco.setSize(pos.w + 20, pos.h + 20);
        }
        this.falar(`Zona: ${this[zonaId + '_label'].text}.`);
    }

    confirmarZona() {
        const zonaId = this.indiceZonaFoco === 0 ? 'zona1' : 'zona2';
        const item = this.itemSegurado;
        const pos = this.zonasPos[zonaId];

        item.setData('zonaAtual', zonaId);

        this.tweens.add({
            targets: item,
            x: pos.x,
            y: pos.y - 60 + (Math.random() * 120),
            duration: this.reduzMovimento ? 100 : 250,
            ease: this.reduzMovimento ? 'Linear' : 'Back.easeOut'
        });

        this.falar(`${item.getData('textoOriginal')} colocado em ${this[zonaId + '_label'].text}.`);

        this.estadoTeclado = 'LIVRE';
        this.itemSegurado = null;
        this.atualizarFocoVisual();
    }

    cancelarSelecao() {
        this.falar('Seleção cancelada.');
        this.estadoTeclado = 'LIVRE';
        this.itemSegurado = null;
        this.atualizarFocoVisual();
    }

    desenharEstrutura() {
        const { width, height } = this.scale;

        const leftColumnX = width * 0.28;
        const rightColumnX = width * 0.72;
        const zoneWidth = 600;
        const zoneHeight = 320;

        this.pergunta = this.add.text(width / 2, height * 0.1, 'Carregando...', {
            fontSize: '52px',
            fill: '#ffffff',
            align: 'center',
            fontFamily: 'Arial Black',
            wordWrap: { width: width - 200 }
        }).setOrigin(0.5);

        this.setupZona('zona1', rightColumnX, height * 0.38, zoneWidth, zoneHeight, 0x00ff00);
        this.setupZona('zona2', rightColumnX, height * 0.72, zoneWidth, zoneHeight, 0xff4444);

        this.input.on('dragstart', (pointer, obj) => {
            obj.setDepth(100);
            obj.setScale(1.1); 
            obj.setAlpha(0.9);
            obj.setStyle(this.baseStyle);
        });

        this.input.on('drag', (pointer, obj, dragX, dragY) => {
            obj.setPosition(dragX, dragY);
        });

        this.input.on('drop', (pointer, obj, dropZone) => {
            obj.setData('zonaAtual', dropZone.getData('zonaID'));

            this.tweens.add({
                targets: obj,
                x: dropZone.x,
                y: dropZone.y - 60 + (Math.random() * 120),
                duration: 250,
                ease: 'Back.easeOut'
            });
        });

        this.input.on('dragend', (pointer, obj, dropped) => {
            obj.setDepth(1);
            obj.setScale(1);
            obj.setAlpha(1);
            if (!dropped) {
                this.tweens.add({
                    targets: obj,
                    x: obj.getData('homeX'),
                    y: obj.getData('homeY'),
                    duration: 400,
                    ease: 'Cubic.easeOut'
                });
                obj.setData('zonaAtual', null);
            }
        });

        this.botaoContinuar = this.add.text(width / 2, height * 0.92, 'VERIFICAR', {
            fontSize: '46px',
            fontFamily: 'Arial Black',
            backgroundColor: '#009900',
            color: '#ffffff',
            padding: { x: 80, y: 30 }
        }).setOrigin(0.5).setInteractive();

        this.botaoContinuar.on('pointerdown', () => this.tratarCliqueBotao());
    }

    setupZona(id, x, y, w, h, cor) {
        this.zonasPos[id] = { x, y, w, h };

        const zona = this.add.zone(x, y, w, h)
            .setRectangleDropZone(w, h)
            .setData('zonaID', id);

        const graphics = this.add.graphics();
        graphics.lineStyle(8, cor, 0.6);
        graphics.strokeRect(x - w / 2, y - h / 2, w, h);

        this[id + '_label'] = this.add.text(x, y - h / 2 - 50, '', {
            fontSize: '42px', fill: '#ffffff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
    }

    carregarFase(faseIndex) {
        this.faseAtual = faseIndex;
        const dados = this.dadosDasFases[faseIndex];
        const { width, height } = this.scale;

        this.pergunta.setText(dados.pergunta);
        this.zona1_label.setText(dados.zona1_label.toUpperCase());
        this.zona2_label.setText(dados.zona2_label.toUpperCase());

        this.textosArrastaveis.forEach(t => t.destroy());
        this.textosArrastaveis = [];

        const itemsStartX = width * 0.28;
        const itemsStartY = height * 0.32;
        const spacingY = 175; 

        dados.respostas.forEach((res, i) => {
            const ty = itemsStartY + (spacingY * i);
            const txt = this.add.text(itemsStartX, ty, res.texto, this.baseStyle)
                .setOrigin(0.5)
                .setInteractive()
                .setData('homeX', itemsStartX)
                .setData('homeY', ty)
                .setData('alvo', res.alvo)
                .setData('textoOriginal', res.texto);

            this.input.setDraggable(txt);
            this.textosArrastaveis.push(txt);
        });

        this.botaoContinuar.setText('VERIFICAR').setData('status', 'verificar').setBackgroundColor('#009900');

        this.navegaveis = [...this.textosArrastaveis, this.botaoContinuar];
        this.indiceFoco = 0;
        this.estadoTeclado = 'LIVRE';
        this.itemSegurado = null;
        this.atualizarFocoVisual();
        this.falar(`${dados.pergunta} Use as setas para navegar entre os itens e o botão, e Enter para selecionar.`);
    }

    validarFase() {
        let erros = 0;
        this.textosArrastaveis.forEach(texto => {
            const correto = texto.getData('alvo') === texto.getData('zonaAtual');
            texto.setStyle(correto ? this.correctStyle : this.wrongStyle);
            // WCAG 1.4.1: reforço com símbolo, não depende só da cor
            texto.setText(`${correto ? '✓' : '✗'} ${texto.getData('textoOriginal')}`);
            if (!correto) erros++;
            texto.input.enabled = false;
        });

        if (erros === 0) {
            const eFinal = this.faseAtual === this.dadosDasFases.length - 1;

            if (eFinal) {
                this.mostrarParabensFinal();
                this.botaoContinuar.setText('FINALIZAR').setData('status', 'finalizar');
            } else {
                this.botaoContinuar.setText('PRÓXIMA FASE').setData('status', 'continuar');
            }
            this.botaoContinuar.setBackgroundColor('#009900');
            this.falar(eFinal ? 'Parabéns, você concluiu o treinamento!' : 'Tudo certo! Pressione o botão Próxima Fase para continuar.');
        } else {
            this.botaoContinuar.setText('TENTAR NOVAMENTE').setData('status', 'tentar_novamente').setBackgroundColor('#cc0000');
            this.falar(`${erros} ${erros === 1 ? 'item está' : 'itens estão'} no lugar errado. Pressione Tentar Novamente.`);
        }
    }

    mostrarParabensFinal() {
        const { width, height } = this.scale;

        if (window.parent && window.parent.ponte) {
            window.parent.ponte.emitir('JOGO_CONCLUIDO', { id: 'arrasta-solta' });
        }

        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.6).setDepth(150);
        
        const txtParabens = this.add.text(width / 2, height / 2 - 50, 'PARABÉNS!\nVOCÊ CONCLUIU O TREINAMENTO!', {
            fontSize: '85px',
            fill: '#00ff00',
            fontFamily: 'Arial Black',
            stroke: '#000',
            strokeThickness: 12,
            align: 'center'
        }).setOrigin(0.5).setDepth(200).setScale(0);

        const subTxt = this.add.text(width / 2, height / 2 + 150, 'Agora você é um ajudante da Defesa Civil!', {
            fontSize: '42px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(200).setAlpha(0);

        if (this.reduzMovimento) {
            txtParabens.setScale(1);
            subTxt.setAlpha(1).setY(height / 2 + 100);
        } else {
            this.tweens.add({
                targets: txtParabens,
                scale: 1,
                duration: 800,
                ease: 'Back.easeOut'
            });

            this.tweens.add({
                targets: subTxt,
                alpha: 1,
                y: height / 2 + 100,
                duration: 800,
                delay: 500
            });
        }

        this.botaoContinuar.setDepth(201);
    }

    tratarCliqueBotao() {
        const status = this.botaoContinuar.getData('status');
        this.botaoContinuar.setScale(0.95);
        this.time.delayedCall(100, () => this.botaoContinuar.setScale(1));

        if (status === 'verificar') this.validarFase();
        else if (status === 'continuar') this.carregarFase(this.faseAtual + 1);
        else if (status === 'finalizar') this.sairDaCena();
        else if (status === 'tentar_novamente') this.carregarFase(this.faseAtual);
    }

    sairDaCena() {
        this.game.destroy(true, false);

        if (window.parent && window.parent.ponte) {
            window.parent.ponte.emitir('VOLTAR_MENU');
        }
    }
}