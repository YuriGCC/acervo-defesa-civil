class Splash extends Phaser.Scene {
    constructor() {
        super({ key: 'SplashCena' });
    }

    preload() {
        this.load.image('logo-parceria', 'assets/intro.jpeg');
    }

    create() {
        const { width, height } = this.scale;

        let logo = this.add.image(width / 2, height / 2, 'logo-parceria');
        logo.setDisplaySize(width, height);

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        /*
            ACESSIBILIDADE (WCAG 2.2.1 - Timing Adjustable / WCAG 2.1.1 - Keyboard):
            Usuários não devem ser forçados a esperar 6s sem controle.
            Permite pular a splash com qualquer tecla ou toque.
            Sem isso, usuários de teclado e leitores de tela ficam bloqueados.
        */
        this._anunciarSplash();

        // Timer que avança automaticamente após 5s
        const timer = this.time.delayedCall(5000, () => this._avancar());

        // Pula com qualquer tecla
        this.input.keyboard.once('keydown', () => {
            timer.remove();
            this._avancar();
        });

        // Pula com toque ou clique (pointerdown cobre mouse e touch — WCAG 2.5.1)
        this.input.once('pointerdown', () => {
            timer.remove();
            this._avancar();
        });
    }

    /**
     * Anuncia a splash para leitores de tela.
     * WCAG 4.1.3 - Status Messages.
     */
    _anunciarSplash() {
        const el = document.getElementById('aria-announcer');
        if (!el) return;
        el.textContent = '';
        requestAnimationFrame(() => {
            el.textContent = 'Tela de apresentação. Pressione qualquer tecla ou toque na tela para continuar.';
        });
    }

    _avancar() {
        // Guarda para não disparar duas vezes se teclado e pointer colidirem
        if (this._avancando) return;
        this._avancando = true;

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuCena');
        });
    }
}