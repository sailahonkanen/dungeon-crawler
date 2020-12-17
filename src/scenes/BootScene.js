import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('tiles', 'assets/tiles/dungeon_tiles.png');
    this.load.tilemapTiledJSON('map', 'assets/tiles/map.json');

    this.load.image('chest', 'assets/items/chest.png');

    this.load.atlas(
      'faune',
      'assets/character/faune.png',
      'assets/character/faune.json'
    );

    this.load.atlas(
      'lizard',
      'assets/enemies/lizard.png',
      'assets/enemies/lizard.json'
    );

    this.load.audio('goldSound', ['assets/audio/Pickup.wav']);
    this.load.audio('playerAttackSound', ['assets/audio/PlayerAttack.wav']);

    this.load.audio('backgroundMusic', ['assets/audio/BackgroundMusic.mp3']);

    this.load.image('ui-heart-empty', 'assets/ui/ui_heart_empty.png');
    this.load.image('ui-heart-full', 'assets/ui/ui_heart_full.png');

    this.load.image('knife', 'assets/weapons/weapon_knife.png');
    this.load.image('health', 'assets/items/health.png');
  }

  create() {
    this.scene.start('Title');
  }
}

export default BootScene;
