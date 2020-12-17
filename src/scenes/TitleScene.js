import Phaser from 'phaser';

class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.startButton = this.add
      .text(100, 100, 'New Game', {
        fill: '#fff',
      })
      .setInteractive()
      .on('pointerdown', () => this.clickButton())
      .on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState());

    this.add.text(
      100,
      120,
      'Move with arrows\nor wasd keys\nThrow knives with space'
    );
  }

  clickButton() {
    this.scene.switch('Game');
  }

  enterButtonHoverState() {
    this.startButton.setStyle({ fill: '#ff0' });
  }

  enterButtonRestState() {
    this.startButton.setStyle({ fill: '#fff' });
  }
}

export default TitleScene;
