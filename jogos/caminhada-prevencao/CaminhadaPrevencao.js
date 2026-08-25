// Coordenadas medidas diretamente na imagem do tabuleiro (tabuleiro.png, 2481x1754px),
// como fração da própria imagem (0 a 1) — não da tela. Isso é necessário porque a imagem
// tem proporção diferente da tela do jogo (1920x1080) e fica com faixas vazias nas laterais
// quando redimensionada para caber (ver posicaoNaCasa()). Cada valor foi conferido visualmente
// contra o número impresso na casa correspondente.
const COORDENADAS_NORM = {
    0: { x: 315 / 2481, y: 660 / 1754 }, 1: { x: 315 / 2481, y: 660 / 1754 }, 2: { x: 580 / 2481, y: 645 / 1754 }, 3: { x: 770 / 2481, y: 555 / 1754 }, 4: { x: 923 / 2481, y: 403 / 1754 }, 5: { x: 1065 / 2481, y: 385 / 1754 },
    6: { x: 1215 / 2481, y: 320 / 1754 }, 7: { x: 1339 / 2481, y: 291 / 1754 }, 8: { x: 1530 / 2481, y: 505 / 1754 }, 9: { x: 1600 / 2481, y: 680 / 1754 }, 10: { x: 1330 / 2481, y: 795 / 1754 }, 11: { x: 1105 / 2481, y: 770 / 1754 },
    12: { x: 940 / 2481, y: 800 / 1754 }, 13: { x: 765 / 2481, y: 790 / 1754 }, 14: { x: 565 / 2481, y: 850 / 1754 }, 15: { x: 420 / 2481, y: 835 / 1754 }, 16: { x: 220 / 2481, y: 955 / 1754 }, 17: { x: 200 / 2481, y: 1075 / 1754 },
    18: { x: 190 / 2481, y: 1190 / 1754 }, 19: { x: 270 / 2481, y: 1265 / 1754 }, 20: { x: 490 / 2481, y: 1340 / 1754 }, 21: { x: 645 / 2481, y: 1260 / 1754 }, 22: { x: 775 / 2481, y: 1090 / 1754 }, 23: { x: 925 / 2481, y: 1005 / 1754 },
    24: { x: 1075 / 2481, y: 995 / 1754 }, 25: { x: 1245 / 2481, y: 1000 / 1754 }, 26: { x: 1400 / 2481, y: 1090 / 1754 }, 27: { x: 1560 / 2481, y: 1180 / 1754 }, 28: { x: 1400 / 2481, y: 1455 / 1754 }, 29: { x: 1240 / 2481, y: 1545 / 1754 },
    30: { x: 1150 / 2481, y: 1585 / 1754 }, 31: { x: 950 / 2481, y: 1590 / 1754 }, 32: { x: 825 / 2481, y: 1600 / 1754 }, 33: { x: 690 / 2481, y: 1595 / 1754 }, 34: { x: 520 / 2481, y: 1570 / 1754 }, 35: { x: 375 / 2481, y: 1585 / 1754 }
};

const MAPA_CASAS = {
    1: { texto: "Aconteceu um deslizamento e você ligou 199. Pule três casas.", efeito: 3 },
    3: { texto: "Encostas cheias de lixo e entulho! Todos os jogadores voltam uma casa.", efeito: -1, todosJogadores: true },
    4: { texto: "Plano de contingência atualizado, família preparada! Pule uma casa.", efeito: 1 },
    7: { texto: "Chove muito! Você acompanha o nível do Rio no ALERTABLU. Avance uma casa.", efeito: 1 },
    10: { texto: "Aprendeu o lema: 'Defesa Civil, Somos Todos Nós!' Pule duas casas.", efeito: 2 },
    11: { texto: "Descumpriu as normas e voltou para a casa interditada. Volte três casas.", efeito: -3 },
    14: { texto: "O lixo jogado no chão entupiu o bueiro e causou alagamento. Volte ao início.", irPara: 0 },
    16: { texto: "Plantou bananeiras na encosta. Fique uma rodada sem jogar.", pularRodada: true },
    19: { texto: "Calhas limpas! Avance uma casa.", efeito: 1 },
    22: { texto: "Rachaduras no muro! Volte quatro casas.", efeito: -4 },
    23: { texto: "Consultou a Defesa Civil! Avance uma casa.", efeito: 1 },
    27: { texto: "Plantou raízes profundas! Pule uma casa.", efeito: 1 },
    29: { texto: "Pesquisou cota de cheia! Avance uma casa!", efeito: 1 },
    31: { texto: "Identificou sinais de deslizamento. Jogue mais uma vez.", jogueNovamente: true },
    34: { texto: "Construiu em área de risco! Volte para a casa 25.", irPara: 25 }
};

const OFFSETS = [{ dx: -15, dy: -15 }, { dx: 15, dy: -15 }, { dx: -15, dy: 15 }, { dx: 15, dy: 15 }];
const CORES = [0xff3e3e, 0x00ff7f, 0x00d2ff, 0xffd700];

class Menu extends Phaser.Scene {
    constructor() { super('Menu'); }
    create() {
        const { width, height } = this.scale;
        this.falar = criarAnunciador();
        this.reduzMovimento = prefersReducedMotion();
        this.ehDesktop = this.sys.game.device.os.desktop;

        this.add.graphics().fillGradientStyle(0x1a2a6c, 0x1a2a6c, 0xb21f1f, 0xfdbb2d, 1).fillRect(0, 0, width, height);
        this.add.text(width / 2, height * 0.2, 'CAMINHADA DA PREVENÇÃO', { fontSize: '65px', fill: '#fff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5);
        this.add.text(width / 2, height * 0.4, 'Quantos Jogadores Participarão?', { fontSize: '38px', fill: '#ffcc00', fontFamily: 'Arial Black' }).setOrigin(0.5);

        this.opcoesNumeros = [2, 3, 4];
        this.opcoesContainers = [];

        this.opcoesNumeros.forEach((num, i) => {
            let x = width / 2 - 250 + (i * 250);
            let containerBtn = this.add.container(x, height * 0.65);
            let circ = this.add.circle(0, 0, 100, 0x005599).setInteractive({ useHandCursor: true }).setStrokeStyle(6, 0xffffff);
            let txt = this.add.text(0, 0, num, { fontSize: '60px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
            containerBtn.add([circ, txt]);
            if (!this.reduzMovimento) {
                this.tweens.add({ targets: containerBtn, y: (height * 0.65) - 30, duration: 1500, ease: 'Sine.easeInOut', yoyo: true, loop: -1, delay: i * 200 });
            }
            circ.on('pointerdown', () => this.iniciarJogo(num));
            this.opcoesContainers.push(containerBtn);
        });

        this.indiceFoco = 0;
        this.cursorFoco = this.add.rectangle(0, 0, 220, 220, 0x000000, 0).setStrokeStyle(8, 0xFFD700).setDepth(50).setVisible(this.ehDesktop);
        if (this.ehDesktop && !this.reduzMovimento) {
            this.tweens.add({ targets: this.cursorFoco, alpha: 0.5, duration: 400, yoyo: true, loop: -1 });
        }

        this.configurarTeclado();
        this.anunciarFoco();
        this.falar('Caminhada da Prevenção. Escolha quantos jogadores vão participar: 2, 3 ou 4. Use as setas para navegar e Enter para confirmar.');
    }

    update() {
        if (!this.opcoesContainers.length) return;
        const alvo = this.opcoesContainers[this.indiceFoco];
        this.cursorFoco.setPosition(alvo.x, alvo.y);
    }

    configurarTeclado() {
        this.input.keyboard.on('keydown', (event) => {
            const teclas = [37, 38, 39, 40, 13, 32];
            if (!teclas.includes(event.keyCode)) return;
            event.preventDefault();

            if (event.keyCode === 39 || event.keyCode === 40) this.moverFoco(1);
            else if (event.keyCode === 37 || event.keyCode === 38) this.moverFoco(-1);
            else if (event.keyCode === 13 || event.keyCode === 32) this.iniciarJogo(this.opcoesNumeros[this.indiceFoco]);
        });
    }

    moverFoco(delta) {
        const total = this.opcoesNumeros.length;
        this.indiceFoco = ((this.indiceFoco + delta) % total + total) % total;
        this.anunciarFoco();
    }

    anunciarFoco() {
        this.falar(`${this.opcoesNumeros[this.indiceFoco]} jogadores. Pressione Enter para confirmar.`);
    }

    iniciarJogo(num) {
        this.scene.start('Tabuleiro', { numJogadores: num });
    }
}

class Tabuleiro extends Phaser.Scene {
    constructor() { super('Tabuleiro'); }
    init(data) {
        this.numJogadores = data.numJogadores;
        this.turno = 0;
        this.jogadores = [];
        this.estaMovendo = false;
        this.popupAberto = false;
    }
    preload() {
        this.load.image('tabuleiroImg', 'tabuleiro.png');
        this.load.image('logo-uniasselvi', '../../assets/icone-uniasselvi.png');
        this.load.image('logo-defesa-civil', '../../assets/logo-defesa-civil.webp');
    }
    create() {
        const { width, height } = this.scale;
        this.falar = criarAnunciador();
        this.reduzMovimento = prefersReducedMotion();
        // O quadro de foco (teclado) só faz sentido em computadores; em telas de toque
        // (como a TV) ele nunca deve aparecer, já que não existe navegação por teclado ali.
        this.ehDesktop = this.sys.game.device.os.desktop;

        this.board = this.add.image(width / 2, height / 2, 'tabuleiroImg');
        const boardScale = Math.min(width / 2481, height / 1754);
        this.board.setScale(boardScale);

        // Logos de parceria: não-interativas, então nunca capturam toque/clique.
        this.add.image(30, height - 30, 'logo-uniasselvi').setOrigin(0, 1).setDisplaySize(70, 70).setAlpha(0.75);
        this.add.image(115, height - 30, 'logo-defesa-civil').setOrigin(0, 1).setDisplaySize(70, 70).setAlpha(0.75);

        for (let i = 0; i < this.numJogadores; i++) {
            let shape;
            const { x: xBase0, y: yBase0 } = this.posicaoNaCasa(0);
            const xBase = xBase0 + OFFSETS[i].dx;
            const yBase = yBase0 + OFFSETS[i].dy;
            const tam = 20;
            if (i === 0) shape = this.add.circle(xBase, yBase, tam, CORES[i]);
            else if (i === 1) shape = this.add.rectangle(xBase, yBase, tam * 1.8, tam * 1.8, CORES[i]);
            else if (i === 2) shape = this.add.triangle(xBase, yBase, 0, tam * 2, tam, 0, tam * 2, tam * 2, CORES[i]);
            else shape = this.add.star(xBase, yBase, 5, tam, tam * 1.8, CORES[i]);
            shape.setStrokeStyle(4, 0xffffff).setDepth(10);
            this.jogadores.push({ sprite: shape, posicao: 0, bloqueado: false });
        }
        this.stars = this.add.particles(0, 0, null, { speed: { min: 100, max: 300 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 800, emitting: false });
        this.painelTurno = this.add.container(width - 220, 90).setAlpha(0);
        this.bgTurno = this.add.rectangle(0, 0, 350, 85, CORES[0], 1).setStrokeStyle(4, 0xffffff);
        this.txtTurno = this.add.text(0, 0, `VEZ: JOGADOR 1`, { fontSize: '30px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.painelTurno.add([this.bgTurno, this.txtTurno]);
        this.btnDado = this.add.container(width - 160, height - 160).setAlpha(0);
        let fundoB = this.add.circle(0, 0, 110, 0xffffff).setStrokeStyle(10, 0x333333).setInteractive({ useHandCursor: true });
        this.txtDado = this.add.text(0, 0, '🎲', { fontSize: '100px', fill: '#000', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.btnDado.add([fundoB, this.txtDado]);
        fundoB.on('pointerdown', () => { if (!this.estaMovendo && !this.popupAberto) this.lancarDado(); });
        this.modal = this.add.container(width / 2, height / 2).setDepth(200).setAlpha(0).setScale(0.5);
        let fundoM = this.add.rectangle(0, 0, 1200, 650, 0x2c3e50, 0.95).setStrokeStyle(10, 0xffffff);
        this.txtModal = this.add.text(0, -80, '', { fontSize: '55px', fill: '#fff', align: 'center', fontFamily: 'Arial Black', wordWrap: { width: 1100 } }).setOrigin(0.5);
        this.btnOkRect = this.add.rectangle(0, 180, 350, 130, 0x27ae60).setStrokeStyle(6, 0xffffff).setInteractive({ useHandCursor: true });
        this.txtOk = this.add.text(0, 180, 'OK!', { fontSize: '65px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.modal.add([fundoM, this.txtModal, this.btnOkRect, this.txtOk]);
        this.btnOkRect.on('pointerdown', () => this.fecharModal());

        this.cursorFoco = this.add.rectangle(0, 0, 380, 380, 0x000000, 0).setStrokeStyle(8, 0xFFD700).setDepth(250).setVisible(false);
        if (this.ehDesktop && !this.reduzMovimento) {
            this.tweens.add({ targets: this.cursorFoco, alpha: 0.5, duration: 400, yoyo: true, loop: -1 });
        }

        this.configurarTeclado();
        this.mostrarInterface(true);
        this.atualizarFocoDado();
        this.scale.on('resize', () => this.redimensionar());

        this.falar(`Caminhada da Prevenção iniciada, ${this.numJogadores} jogadores. Vez do Jogador 1. Pressione Enter para lançar o dado.`);
    }

    configurarTeclado() {
        this.input.keyboard.on('keydown', (event) => {
            if (event.keyCode !== 13 && event.keyCode !== 32) return;
            event.preventDefault();

            if (this.popupAberto) {
                this.fecharModal();
            } else if (!this.estaMovendo) {
                this.lancarDado();
            }
        });
    }

    atualizarFocoDado() {
        if (!this.ehDesktop) return;
        this.cursorFoco.setVisible(true);
        this.cursorFoco.setSize(250, 250);
        this.cursorFoco.setPosition(this.btnDado.x, this.btnDado.y);
    }

    atualizarFocoModal() {
        if (!this.ehDesktop) return;
        this.cursorFoco.setVisible(true);
        this.cursorFoco.setSize(this.btnOkRect.width + 30, this.btnOkRect.height + 30);
        this.cursorFoco.setPosition(this.modal.x + this.btnOkRect.x, this.modal.y + this.btnOkRect.y);
    }

    // Converte a coordenada normalizada de uma casa (0 a 1, relativa à própria imagem do
    // tabuleiro) em posição real de tela — considerando que a imagem é centralizada e pode
    // sobrar espaço nas laterais ou em cima/embaixo (a proporção da imagem não é a mesma da tela).
    posicaoNaCasa(indice) {
        const posNorm = COORDENADAS_NORM[indice];
        const boardLeft = this.board.x - this.board.displayWidth / 2;
        const boardTop = this.board.y - this.board.displayHeight / 2;
        return {
            x: boardLeft + (posNorm.x * this.board.displayWidth),
            y: boardTop + (posNorm.y * this.board.displayHeight)
        };
    }

    redimensionar() {
        const { width, height } = this.scale;
        const boardScale = Math.min(width / 2481, height / 1754);
        this.board.setScale(boardScale).setPosition(width / 2, height / 2);
        this.jogadores.forEach((j, i) => {
            const { x, y } = this.posicaoNaCasa(j.posicao);
            j.sprite.setPosition(x + OFFSETS[i].dx, y + OFFSETS[i].dy);
        });
        this.btnDado.setPosition(width - 140, height - 140);
        this.painelTurno.setPosition(width - 190, 70);
        this.modal.setPosition(width / 2, height / 2);
        if (this.popupAberto) this.atualizarFocoModal();
        else this.atualizarFocoDado();
    }

    mostrarInterface(exibir) { this.tweens.add({ targets: [this.btnDado, this.painelTurno], alpha: exibir ? 1 : 0, duration: 400 }); }

    lancarDado() {
        this.estaMovendo = true;
        this.btnDado.setAlpha(1);
        this.painelTurno.setAlpha(0.5);
        let giros = 0;
        this.time.addEvent({
            delay: 70, repeat: 20,
            callback: () => {
                this.txtDado.setText(Phaser.Math.Between(1, 6)).setFontSize(90);
                if (++giros > 20) {
                    const final = Phaser.Math.Between(1, 6);
                    this.txtDado.setText(final).setFontSize(110).setFill('#e67e22');
                    this.cursorFoco.setVisible(false);
                    if (!this.reduzMovimento) {
                        this.tweens.add({ targets: this.btnDado, scale: 1.25, duration: 250, yoyo: true });
                    }
                    this.falar(`Deu ${final} no dado.`);
                    this.time.delayedCall(this.reduzMovimento ? 200 : 1500, () => { this.mostrarInterface(false); this.moverJogador(this.turno, final); });
                }
            }
        });
    }

    moverJogador(id, casas, forcar = false) {
        let j = this.jogadores[id];
        const destinoFinal = Math.max(0, Math.min(j.posicao + casas, 35));
        const passo = () => {
            if (j.posicao !== destinoFinal) {
                j.posicao += (j.posicao < destinoFinal ? 1 : -1);
                const { x: finalXBase, y: finalYBase } = this.posicaoNaCasa(j.posicao);
                const finalX = finalXBase + OFFSETS[id].dx;
                const finalY = finalYBase + OFFSETS[id].dy;
                this.tweens.add({ targets: j.sprite, x: finalX, y: finalY, duration: this.reduzMovimento ? 80 : 400, onComplete: passo });
            } else {
                if (!forcar) this.verificarRegra(id);
                else this.proximoOuGanhar(id);
            }
        };
        passo();
    }
    verificarRegra(id) {
        let regra = MAPA_CASAS[this.jogadores[id].posicao];
        if (regra) this.abrirModal(regra);
        else {
            this.falar(`Jogador ${id + 1} chegou na casa ${this.jogadores[id].posicao}.`);
            this.proximoOuGanhar(id);
        }
    }
    abrirModal(regra) {
        this.popupAberto = true;
        this.txtModal.setText(regra.texto);
        this.currentRegra = regra;
        if (this.reduzMovimento) {
            this.modal.setAlpha(1).setScale(1);
        } else {
            this.tweens.add({ targets: this.modal, alpha: 1, scale: 1, duration: 500, ease: 'Back.easeOut' });
        }
        this.atualizarFocoModal();
        this.falar(regra.texto);
    }
    fecharModal() {
        const aoFechar = () => { this.popupAberto = false; this.processarEfeitoRegra(this.currentRegra); };
        if (this.reduzMovimento) {
            this.modal.setAlpha(0).setScale(0.5);
            aoFechar();
        } else {
            this.tweens.add({ targets: this.modal, alpha: 0, scale: 0.5, duration: 250, onComplete: aoFechar });
        }
    }
    processarEfeitoRegra(regra) {
        let j = this.jogadores[this.turno];
        if (regra.ganhar) {
            this.game.destroy(true, false);
            if (window.parent && window.parent.ponte) {
                window.parent.ponte.emitir('JOGO_CONCLUIDO', { id: 'caminhada-prevencao' });
                window.parent.ponte.emitir('VOLTAR_MENU');
            }
            return;
        }

        // Regras como a da casa 3 ("Todos os jogadores voltam uma casa") afetam todo mundo,
        // não só quem caiu nela. Move os outros jogadores aqui; o jogador da vez segue pelo
        // fluxo normal abaixo (que já anima e conta como o efeito dele).
        if (regra.todosJogadores && regra.efeito) {
            this.jogadores.forEach((jog, idx) => {
                if (idx === this.turno) return;
                const destino = Math.max(0, Math.min(jog.posicao + regra.efeito, 35));
                jog.posicao = destino;
                const { x, y } = this.posicaoNaCasa(destino);
                this.tweens.add({
                    targets: jog.sprite,
                    x: x + OFFSETS[idx].dx, y: y + OFFSETS[idx].dy,
                    duration: this.reduzMovimento ? 80 : 400
                });
            });
        }

        if (regra.irPara !== undefined) this.moverJogador(this.turno, regra.irPara - j.posicao, true);
        else if (regra.efeito) this.moverJogador(this.turno, regra.efeito, true);
        else if (regra.pularRodada) { j.bloqueado = true; this.proximoOuGanhar(this.turno); }
        else if (regra.jogueNovamente) {
            this.estaMovendo = false;
            this.mostrarInterface(true);
            this.atualizarFocoDado();
            this.falar(`Jogador ${this.turno + 1} joga novamente. Pressione Enter para lançar o dado.`);
        }
        else this.proximoOuGanhar(this.turno);
    }
    proximoOuGanhar(id) {
        if (this.jogadores[id].posicao >= 35) {
            this.abrirModal({ texto: `VITÓRIA!\nParabéns Agente Mirim!`, ganhar: true });
        } else this.proximoTurno();
    }
    proximoTurno() {
        this.turno = (this.turno + 1) % this.numJogadores;
        if (this.jogadores[this.turno].bloqueado) {
            this.jogadores[this.turno].bloqueado = false;
            this.falar(`Jogador ${this.turno + 1} fica uma rodada sem jogar.`);
            this.proximoTurno();
        } else {
            this.bgTurno.setFillStyle(CORES[this.turno]);
            this.txtTurno.setText(`VEZ: JOGADOR ${this.turno + 1}`);
            this.txtDado.setText('🎲').setFontSize(85).setFill('#000');
            this.estaMovendo = false;
            this.mostrarInterface(true);
            this.atualizarFocoDado();
            this.falar(`Vez do Jogador ${this.turno + 1}. Pressione Enter para lançar o dado.`);
        }
    }
}

const config = { type: Phaser.AUTO, width: 1920, height: 1080, input: { activePointers: 4, touch: { capture: true } }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [Menu, Tabuleiro] };

// Expõe ao window para que o index.html possa aplicar a guarda de resize
window._phaserGame = new Phaser.Game(config);

// Previne "Framebuffer status: Incomplete Attachment" inline também
window._phaserGame.events.once('ready', () => {
    const orig = window._phaserGame.scale.resize.bind(window._phaserGame.scale);
    window._phaserGame.scale.resize = (w, h) => { if (w > 0 && h > 0) orig(w, h); };
});

// Limpeza de recursos quando iframe é destruído
window.addEventListener('beforeunload', () => {
    if (window._phaserGame) {
        window._phaserGame.destroy(true);
        window._phaserGame = null;
    }
});