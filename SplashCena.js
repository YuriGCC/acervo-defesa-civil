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

        this.time.delayedCall(5000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuCena');
            });
        });
    }
}