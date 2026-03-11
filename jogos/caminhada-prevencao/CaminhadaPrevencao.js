const COORDENADAS = {
    0: { x: 320, y: 280 },  1: { x: 470, y: 340 },  2: { x: 650, y: 350 },
    3: { x: 820, y: 330 },  4: { x: 1000, y: 270 }, 5: { x: 1170, y: 210 },
    6: { x: 1350, y: 180 }, 7: { x: 1570, y: 200 }, 8: { x: 1680, y: 280 },
    9: { x: 1610, y: 380 }, 10: { x: 1480, y: 440 }, 11: { x: 1300, y: 460 },
    12: { x: 1040, y: 475 }, 13: { x: 820, y: 475 }, 14: { x: 650, y: 465 },
    15: { x: 500, y: 500 }, 16: { x: 310, y: 545 }, 17: { x: 260, y: 600 },
    18: { x: 220, y: 700 }, 19: { x: 280, y: 770 }, 20: { x: 540, y: 785 },
    21: { x: 720, y: 720 }, 22: { x: 870, y: 655 }, 23: { x: 980, y: 630 },
    24: { x: 1200, y: 585 }, 25: { x: 1400, y: 560 }, 26: { x: 1570, y: 630 },
    27: { x: 1640, y: 725 }, 28: { x: 1550, y: 825 }, 29: { x: 1440, y: 870 },
    30: { x: 1240, y: 925 }, 31: { x: 1090, y: 940 }, 32: { x: 940, y: 930 },
    33: { x: 760, y: 930 }, 34: { x: 650, y: 930 }, 35: { x: 450, y: 930 }
};


const MAPA_CASAS = {

    1: { texto: "Aconteceu um deslizamento e você ligou 199. Pule três casas.", efeito: 3 },

    3: { texto: "Encostas cheias de lixo e entulho! Todos os jogadores voltam uma casa.", efeito: -1 },

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

const OFFSETS = [{ dx: -20, dy: -20 }, { dx: 20, dy: -20 }, { dx: -20, dy: 20 }, { dx: 20, dy: 20 }];
const CORES = [0xff3e3e, 0x00ff7f, 0x00d2ff, 0xffd700];

class Menu extends Phaser.Scene {
    constructor() { super('Menu'); }
    create() {
        const { width, height } = this.scale;
        this.add.graphics().fillGradientStyle(0x1a2a6c, 0x1a2a6c, 0xb21f1f, 0xfdbb2d, 1).fillRect(0, 0, width, height);

        this.add.text(width / 2, height * 0.2, 'CAMINHADA DA PREVENÇÃO', {
            fontSize: '65px', fill: '#fff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.4, 'Quantos Jogadores Participarão?', {
            fontSize: '38px', fill: '#ffcc00', fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        [2, 3, 4].forEach((num, i) => {
            let x = width / 2 - 250 + (i * 250);
            let containerBtn = this.add.container(x, height * 0.65);

            let circ = this.add.circle(0, 0, 100, 0x005599).setInteractive({ useHandCursor: true }).setStrokeStyle(6, 0xffffff);
            let txt = this.add.text(0, 0, num, { fontSize: '60px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);

            containerBtn.add([circ, txt]);

            // Animação de subir e descer (Floating)
            this.tweens.add({
                targets: containerBtn,
                y: (height * 0.65) - 30,
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                loop: -1,
                delay: i * 200 // Offset para não subirem todos juntos
            });

            circ.on('pointerdown', () => this.scene.start('Tabuleiro', { numJogadores: num }));
        });
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
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'tabuleiroImg').setDisplaySize(width, height);

        // Criar Jogadores com FORMAS DIFERENTES
        for (let i = 0; i < this.numJogadores; i++) {
            let shape;
            const xBase = COORDENADAS[0].x + OFFSETS[i].dx;
            const yBase = COORDENADAS[0].y + OFFSETS[i].dy;
            const tamanho = 30; // Aumentado levemente para visibilidade

            switch (i) {
                case 0: // Jogador 1: Círculo
                    shape = this.add.circle(xBase, yBase, tamanho, CORES[i]);
                    break;
                case 1: // Jogador 2: Quadrado (Rectangle)
                    shape = this.add.rectangle(xBase, yBase, tamanho * 1.8, tamanho * 1.8, CORES[i]);
                    break;
                case 2: // Jogador 3: Triângulo (Isosceles)
                    shape = this.add.triangle(xBase, yBase, 0, tamanho * 2, tamanho, 0, tamanho * 2, tamanho * 2, CORES[i]);
                    break;
                case 3: // Jogador 4: Estrela ou Pentágono (Polygon)
                    shape = this.add.star(xBase, yBase, 5, tamanho, tamanho * 1.8, CORES[i]);
                    break;
            }

            shape.setStrokeStyle(5, 0xffffff).setDepth(10);
            this.jogadores.push({ sprite: shape, posicao: 0, bloqueado: false });
        }

        // Partículas
        this.stars = this.add.particles(0, 0, null, {
            speed: { min: 100, max: 300 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 800, emitting: false
        });

        // Painel de Turno
        this.painelTurno = this.add.container(width - 250, 100).setAlpha(0);
        this.bgTurno = this.add.rectangle(0, 0, 400, 100, CORES[0], 1).setStrokeStyle(4, 0xffffff);
        this.txtTurno = this.add.text(0, 0, `VEZ: JOGADOR 1`, { fontSize: '38px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.painelTurno.add([this.bgTurno, this.txtTurno]);

        // Dado
        this.btnDado = this.add.container(width - 200, height - 200).setAlpha(0);
        let fundoB = this.add.circle(0, 0, 150, 0xffffff).setStrokeStyle(12, 0x333333).setInteractive({ useHandCursor: true });
        this.txtDado = this.add.text(0, 0, '🎲', { fontSize: '130px', fill: '#000', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.btnDado.add([fundoB, this.txtDado]);

        fundoB.on('pointerdown', () => { if (!this.estaMovendo && !this.popupAberto) this.lancarDado(); });

        // Modal
        this.modal = this.add.container(width / 2, height / 2).setDepth(200).setAlpha(0).setScale(0.5);
        let fundoM = this.add.rectangle(0, 0, 950, 500, 0x2c3e50, 0.95).setStrokeStyle(8, 0xffffff);
        this.txtModal = this.add.text(0, -60, '', { fontSize: '42px', fill: '#fff', align: 'center', fontFamily: 'Arial Black', wordWrap: { width: 850 } }).setOrigin(0.5);
        this.btnOkRect = this.add.rectangle(0, 150, 280, 100, 0x27ae60).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
        this.txtOk = this.add.text(0, 150, 'OK!', { fontSize: '50px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.modal.add([fundoM, this.txtModal, this.btnOkRect, this.txtOk]);
        this.btnOkRect.on('pointerdown', () => this.fecharModal());

        this.mostrarInterface(true);
    }

    mostrarInterface(exibir) {
        this.tweens.add({ targets: [this.btnDado, this.painelTurno], alpha: exibir ? 1 : 0, duration: 400 });
    }

    lancarDado() {
        this.estaMovendo = true;
        this.btnDado.setAlpha(1);
        this.painelTurno.setAlpha(0.5);
        let giros = 0;
        this.time.addEvent({
            delay: 70, repeat: 20,
            callback: () => {
                const tempVal = Phaser.Math.Between(1, 6);
                this.txtDado.setText(tempVal).setFontSize(140);
                giros++;
                if (giros > 20) {
                    const final = Phaser.Math.Between(1, 6);
                    this.txtDado.setText(final).setFontSize(180).setFill('#e67e22');
                    this.tweens.add({ targets: this.btnDado, scale: 1.25, duration: 250, yoyo: true, ease: 'Back.easeOut' });
                    this.time.delayedCall(2500, () => {
                        this.mostrarInterface(false);
                        this.moverJogador(this.turno, final);
                    });
                }
            }
        });
    }

    moverJogador(id, casas, forcar = false) {
        let j = this.jogadores[id];
        const destinoFinal = Math.max(0, Math.min(j.posicao + casas, 35)); 

        const passoUnico = () => {
            if (j.posicao !== destinoFinal) {
                if (j.posicao < destinoFinal) j.posicao++;
                else j.posicao--;

                this.tweens.add({
                    targets: j.sprite,
                    x: COORDENADAS[j.posicao].x + OFFSETS[id].dx,
                    y: COORDENADAS[j.posicao].y + OFFSETS[id].dy,
                    duration: 400,
                    ease: 'Sine.easeInOut',
                    onComplete: passoUnico
                });
            } else {
                if (!forcar) this.verificarRegra(id);
                else this.proximoOuGanhar(id);
            }
        };
        passoUnico();
    }

    verificarRegra(id) {
        let regra = MAPA_CASAS[this.jogadores[id].posicao];
        if (regra) this.abrirModal(regra);
        else this.proximoOuGanhar(id);
    }

    abrirModal(regra) {
        this.popupAberto = true;
        this.txtModal.setText(regra.texto).setFill(regra.sorte ? '#00ff7f' : '#fff');
        if (regra.sorte || regra.ganhar) {
            this.stars.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.stars.explode(50);
        }
        this.currentRegra = regra;
        this.tweens.add({ targets: this.modal, alpha: 1, scale: 1, duration: 500, ease: 'Back.easeOut' });
    }

    fecharModal() {
        this.tweens.add({
            targets: this.modal, alpha: 0, scale: 0.5, duration: 250,
            onComplete: () => {
                this.popupAberto = false;
                this.processarEfeitoRegra(this.currentRegra);
            }
        });
    }

    processarEfeitoRegra(regra) {
        let j = this.jogadores[this.turno];
        
        if (regra.ganhar) {
            // Identifica a forma geométrica vencedora
            const formas = ["Círculo", "Quadrado", "Triângulo", "Estrela"];
            const vencedor = formas[this.turno];
            
            this.abrirModal({ 
                texto: `🏆 VITÓRIA DO ${vencedor}!\nMissão cumprida, Agente Mirim!`, 
                sorte: true, 
                fimDeJogo: true 
            });
            return;
        }

        if (regra.fimDeJogo) {
            this.scene.start('Menu');
            return;
        }

        if (regra.irPara !== undefined) {
            let distancia = regra.irPara - j.posicao;
            this.moverJogador(this.turno, distancia, true);
        } 
        else if (regra.efeito) {
            this.moverJogador(this.turno, regra.efeito, true);
        } 
        else if (regra.pularRodada) { 
            j.bloqueado = true; 
            this.proximoOuGanhar(this.turno); 
        } 
        else if (regra.jogueNovamente) { 
            this.estaMovendo = false; 
            this.mostrarInterface(true); 
        } 
        else {
            this.proximoOuGanhar(this.turno);
        }
    }

    proximoOuGanhar(id) {
        if (this.jogadores[id].posicao >= 35) {
            const formas = ["Círculo", "Quadrado", "Triângulo", "Estrela"];
            this.abrirModal({ 
                texto: `🎉 O ${formas[id]} CHEGOU AO FIM!\nParabéns pela Vitória!`, 
                sorte: true, 
                ganhar: true 
            });
        } else {
            this.proximoTurno();
        }
    }

    proximoTurno() {
        this.turno = (this.turno + 1) % this.numJogadores;
        if (this.jogadores[this.turno].bloqueado) {
            this.jogadores[this.turno].bloqueado = false;
            this.proximoTurno();
        } else {
            this.bgTurno.setFillStyle(CORES[this.turno]);
            this.txtTurno.setText(`VEZ: JOGADOR ${this.turno + 1}`);
            this.txtDado.setText('🎲').setFontSize(130).setFill('#000');
            this.estaMovendo = false;
            this.mostrarInterface(true);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1920, height: 1080,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [Menu, Tabuleiro]
};
new Phaser.Game(config);