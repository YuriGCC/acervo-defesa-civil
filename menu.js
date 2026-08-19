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
        this.bloqueioInteracao = false;
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

        this.events.on('resume', () => {
            this.bloqueioInteracao = false;
        });
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
        const btnY = height * 0.86; // Ajustado levemente para cima para acomodar o botão maior

        const btnContainer = this.add.container(btnX, btnY).setDepth(101);

        // Aumentamos um pouco a largura e altura para caber confortavelmente as duas linhas
        const btnW = width * 0.26;
        const btnH = height * 0.12;

        const bg = this.add.rectangle(0, 0, btnW, btnH, 0x000000, 0.7)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(6, 0xFFD700, 1); // Borda amarela indicando foco ativo

        const fontSizeMain = Math.round(height * 0.038);
        const fontSizeSub = Math.round(height * 0.022);

        // Texto Principal (Deslocado um pouco para cima)
        const txt = this.add.text(0, -height * 0.018, 'PROSSEGUIR', {
            fontSize: `${fontSizeMain}px`,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // SUBTEXTO ACESSÍVEL: Sugestão visual direta para o uso do teclado
        const subTxt = this.add.text(0, height * 0.022, '[ PRESSIONE ENTER ]', {
            fontSize: `${fontSizeSub}px`,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#FFD700' // Amarelo de alto contraste combinando com a borda
        }).setOrigin(0.5);

        // Adiciona todos os elementos ao grupo/container
        btnContainer.add([bg, txt, subTxt]);

        // Animação de pulsação global do botão
        this.tweens.add({
            targets: btnContainer,
            scale: 1.04,
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
        bg.on('pointerover', () => {
            bg.setFillStyle(0x333333, 0.9);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x000000, 0.7);
            bg.setStrokeStyle(6, 0xFFD700, 1);
        });

        const teclaIntro = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        teclaIntro.once('down', prosseguir);
        teclaEspaco.once('down', prosseguir);

        this._anunciar('Tela de apresentação. Botão Prosseguir selecionado. Pressione Enter ou Espaço para ir ao menu de jogos.');
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

        // Selo de "concluído": aparece se este jogo já foi jogado até o fim nesta tela.
        const concluido = typeof obterProgresso === 'function' && obterProgresso().includes(jogo.id);
        if (concluido) {
            const seloRaio = alturaBotao * 0.11;
            const seloX = larguraBotao / 2 - seloRaio - 8;
            const seloY = -alturaBotao / 2 + seloRaio + 8;
            const seloFundo = this.add.circle(seloX, seloY, seloRaio, 0x27ae60, 1)
                .setStrokeStyle(3, 0xffffff);
            const seloTexto = this.add.text(seloX, seloY, '✓', {
                fontSize: `${Math.round(seloRaio * 1.3)}px`,
                fontFamily: 'Arial Black',
                fill: '#ffffff'
            }).setOrigin(0.5);
            container.add([seloFundo, seloTexto]);
        }

        // Ações de ponteiro (mouse e touch via pointerdown)
        let acionado = false;

        const selecionarJogo = () => {
            // Ignora se estiver travado ou se já tiver sido acionado (evita múltiplos cliques rápidos)
            if (this.bloqueioInteracao) return; 
            // Trava a tela inteira para evitar múltiplas seleções rápidas, que podem causar bugs ou sobrecarga
            this.bloqueioInteracao = true;      
            
            container.setScale(0.93);
            this.time.delayedCall(100, () => this.iniciarTrocaDeJogo(jogo));
        };

        fundo.on('pointerdown', selecionarJogo);
        fundo.on('pointerup', () => container.setScale(1));

        /*
            Destaca visualmente o card quando recebe foco via teclado.
        */
        fundo.on('pointerover', () => {
            fundo.setStrokeStyle(6, 0xFFD700, 1);
        });

        // Guarda a posição exata deste card no array
        const indexRef = this._cardRefs.length;
        
        fundo.on('pointerout', () => {
            // Só tira o brilho se o teclado NÃO estiver focando este card
            if (this.indiceFoco !== indexRef) {
                fundo.setStrokeStyle(4, 0xffffff, 0.8);
            }
        });

        // Insere o card com métodos padronizados de foco e ação no array de referências, para navegação por teclado    
        this._cardRefs.push({
            tipo: 'jogo',
            container: container,
            fundo: fundo,
            acao: () => selecionarJogo(),
            focar: () => {
                fundo.setStrokeStyle(8, 0xFFD700, 1);
                container.setScale(1.04);
                this._anunciar(`${jogo.nome}${concluido ? ', concluído' : ''}. Pressione Enter para jogar.`);
            },
            desfocar: () => {
                fundo.setStrokeStyle(4, 0xffffff, 0.8);
                container.setScale(1);
            }
        });
        
        this.botoesGrupo.add(container);
    }

    /**
     * Aplica o indicador de foco visual ao card pelo índice.
     */
    _aplicarFoco(novoIndice) {
        if (!this._cardRefs[novoIndice]) return;

        // Avisa o elemento antigo para perder o foco
        if (this._cardRefs[this.indiceFoco]) {
            this._cardRefs[this.indiceFoco].desfocar();
        }

        this.indiceFoco = novoIndice;

        // Avisa o elemento novo para ganhar o foco
        this._cardRefs[this.indiceFoco].focar();
    }

    /**
     * Registra navegação por teclado nos cards do menu.
     */
    _registrarNavegacaoTeclado() {
        // Remove listener anterior para evitar duplicação entre páginas
        if (this._keyListener) {
            this.input.keyboard.off('keydown', this._keyListener);
        }

        const colunas = 3;
        const totalPaginas = Math.ceil(LISTA_JOGOS.length / this.jogosPorPagina);
        
        // Conta quantos itens são jogos
        const qtdJogos = this._cardRefs.filter(c => c.tipo === 'jogo').length;
        
        // IDENTIFICAÇÃO ESPACIAL DOS BOTÕES:
        // Procura no array quem é a seta da Esquerda (Anterior) e quem é a da Direita (Próximo)
        // usando a posição (x) deles na tela para não ter erro de ordem.
        const idxAnterior = this._cardRefs.findIndex(c => c.tipo === 'seta' && c.container.x < this.scale.width / 2);
        const idxProximo = this._cardRefs.findIndex(c => c.tipo === 'seta' && c.container.x > this.scale.width / 2);

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
                // Seta direita / D
                case Phaser.Input.Keyboard.KeyCodes.RIGHT:
                case 68: // D
                    if (this.indiceFoco === idxAnterior) {
                        // Se estiver no botão Anterior, volta para o primeiro jogo da tela
                        if (qtdJogos > 0) this._aplicarFoco(0);
                    } else if (this.indiceFoco < qtdJogos - 1) {
                        // Se estiver em um jogo normal, avança um
                        this._aplicarFoco(this.indiceFoco + 1);
                    } else if (this.indiceFoco === qtdJogos - 1 && idxProximo !== -1) {
                        // Se chegou no último jogo, pula para o botão Próximo
                        this._aplicarFoco(idxProximo);
                    }
                    break;

                // Seta esquerda / A
                case Phaser.Input.Keyboard.KeyCodes.LEFT:
                case 65: // A
                    if (this.indiceFoco === idxProximo) {
                        // Se estiver no botão Próximo, volta para o último jogo da tela
                        if (qtdJogos > 0) this._aplicarFoco(qtdJogos - 1);
                    } else if (this.indiceFoco > 0 && this.indiceFoco < qtdJogos) {
                        // Se estiver em um jogo normal, volta um
                        this._aplicarFoco(this.indiceFoco - 1);
                    } else if (this.indiceFoco === 0 && idxAnterior !== -1) {
                        // Se chegou no primeiro jogo, pula para o botão Anterior
                        this._aplicarFoco(idxAnterior);
                    }
                    break;

                // Seta baixo / S
                case Phaser.Input.Keyboard.KeyCodes.DOWN:
                case 83: // S
                    if (this.indiceFoco < qtdJogos) {
                        if (this.indiceFoco + colunas < qtdJogos) {
                            this._aplicarFoco(this.indiceFoco + colunas);
                        } else if (this.paginaAtual < totalPaginas - 1) {
                            this.paginaAtual++;
                            this.renderizarInterfaceMenu();
                        }
                    }
                    break;

                // Seta cima / W
                case Phaser.Input.Keyboard.KeyCodes.UP:
                case 87: // W
                    if (this.indiceFoco < qtdJogos) {
                        if (this.indiceFoco - colunas >= 0) {
                            this._aplicarFoco(this.indiceFoco - colunas);
                        } else if (this.paginaAtual > 0) {
                            this.paginaAtual--;
                            this.renderizarInterfaceMenu();
                        }
                    }
                    break;

                // Enter / Espaço: executa a ação do item que estiver focado
                case Phaser.Input.Keyboard.KeyCodes.ENTER:
                case Phaser.Input.Keyboard.KeyCodes.SPACE:
                    if (this._cardRefs[this.indiceFoco] && !this.bloqueioInteracao) {
                        const itemSelecionado = this._cardRefs[this.indiceFoco];
                        
                        // Efeito visual de clique (reduz o tamanho do card)
                        itemSelecionado.container.setScale(0.93);
                          
                        // Apenas chama a ação do item. 
                        // Se for um jogo, o 'selecionarJogo()' vai cuidar de travar no momento certo.
                        // Se for uma seta, ela vai mudar de página sem travar o menu.
                        this.time.delayedCall(100, () => itemSelecionado.acao());
                    }
                    break;

                // Page Down: próxima página
                case Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN:
                    if (this.paginaAtual < totalPaginas - 1) {
                        this.paginaAtual++;
                        this.renderizarInterfaceMenu();
                    }
                    break;

                // Page Up: página anterior
                case Phaser.Input.Keyboard.KeyCodes.PAGE_UP:
                    if (this.paginaAtual > 0) {
                        this.paginaAtual--;
                        this.renderizarInterfaceMenu();
                    }
                    break;
            }
        };

        this.input.keyboard.on('keydown', this._keyListener);

        // Aplica o foco inicial
        if (this._cardRefs.length > 0) {
            // Focamos sempre no índice 0, que, por conta da montagem, 
            // será OBRIGATORIAMENTE o primeiro jogo da página atual!
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
            Raio do círculo proporcional à altura do canvas.
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

        // Guarda a posição exata deste card no array para controle de foco via teclado
        const indexRef = this._cardRefs.length;
        
        // Só remove o hover se o teclado NÃO estiver focando este card, para não apagar o indicador de foco
        circulo.on('pointerout', () => {
            if (this.indiceFoco !== indexRef) {
                circulo.setStrokeStyle(4, 0xffffff, 1);
            }
        });

        circulo.on('pointerdown', () => {
            this.paginaAtual += direcao;
            this.renderizarInterfaceMenu();
        });

        // Adiciona a seta no array de navegação do teclado
        this._cardRefs.push({
            tipo: 'seta',
            container: setaContainer,
            fundo: circulo,
            acao: () => {
                this.paginaAtual += direcao;
                this.renderizarInterfaceMenu();
            },
            focar: () => {
                circulo.setStrokeStyle(6, 0xFFD700, 1);
                setaContainer.setScale(1.05);
                this._anunciar(`Página ${direcao > 0 ? 'Seguinte' : 'Anterior'}. Pressione Enter.`);
            },
            desfocar: () => {
                circulo.setStrokeStyle(4, 0xffffff, 1);
                setaContainer.setScale(1);
            }
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
        
        // Inicia o escurecimento (Fade Out) primeiro
        this.cameras.main.fadeOut(500, 0, 0, 0);

        // Aguarda o Fade Out terminar para então pausar e trocar o jogo
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.pause();
            window.ponte.emitir('TROCAR_JOGO', { caminho: jogo.caminho, nome: jogo.nome });
        });
    }
}
