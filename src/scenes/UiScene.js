import Phaser from 'phaser';

import { sceneEvents } from '../events/EventCenter';

class UiScene extends Phaser.Scene {
  constructor() {
    super('Ui');
  }

  init(data) {
    this.playerAttack = data.playerAttack;
    this.playerCoins = data.playerCoins;
  }

  create() {
    this.hearts = this.add.group({
      classType: Phaser.GameObjects.Image,
    });

    this.hearts.createMultiple({
      key: 'ui-heart-full',
      setXY: {
        x: 10,
        y: 10,
        stepX: 16,
      },
      quantity: 3,
    });

    this.add.text(2, 18, `attack: ${this.playerAttack}`);
    this.coinsText = this.add.text(2, 30, `coins: ${this.playerCoins}`);

    sceneEvents.on(
      'player-health-changed',
      this.handlePlayerHealthChanged,
      this
    );

    sceneEvents.on('player-coins-changed', this.updateCoins, this);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off(
        'player-health-changed',
        this.handlePlayerHealthChanged,
        this
      );
    });
  }

  handlePlayerHealthChanged(health) {
    this.hearts.children.each((heart, idx) => {
      if (idx < health) {
        heart.setTexture('ui-heart-full');
      } else {
        heart.setTexture('ui-heart-empty');
      }
    });
  }

  updateCoins(coins) {
    this.playerCoins = coins;
    // console.log(coins);
    // console.log(this.playerCoins);
    this.coinsText.setText(`coins: ${this.playerCoins}`);
  }
}

export default UiScene;
