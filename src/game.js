import Phaser, { Game } from 'phaser';
import TitleScene from './scenes/TitleScene';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import UiScene from './scenes/UiScene';

const canvas = document.getElementById('game-canvas');
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 250,
  canvas,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  scene: [BootScene, TitleScene, GameScene, UiScene],
  scale: {
    zoom: 2,
  },
};

const game = new Game(config);
