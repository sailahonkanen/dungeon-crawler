import Phaser from 'phaser';

import { debugDraw } from '../utils/debug';
import { createLizardAnims } from '../anims/EnemyAnims';
import { createCharacterAnims } from '../anims/CharacterAnims';

import Lizard from '../classes/Lizard';
import Player from '../classes/Player';
import Item from '../classes/Item';

import { sceneEvents } from '../events/EventCenter';

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.playBackgroundMusic('backgroundMusic');

    this.playerAttackSound = this.sound.add('playerAttackSound', {
      loop: false,
      volume: 0.1,
    });

    this.map = this.make.tilemap({ key: 'map' });
    const tileset = this.map.addTilesetImage('map', 'tiles');

    this.map.createStaticLayer('Ground', tileset);
    const wallsLayer = this.map.createStaticLayer('Walls', tileset);

    wallsLayer.setCollisionByProperty({ collides: true });

    const chestsLayer = this.map.getObjectLayer('Chests');

    this.chests = this.physics.add.group({
      classType: Item,
      defaultKey: 'chest',
    });

    chestsLayer.objects.forEach((chestObj) => {
      this.chests.get(
        chestObj.x + chestObj.width * 0.5,
        chestObj.y - chestObj.height * 0.5,
        'chest'
      );
      this.chests.itemType = 'Chest';
    });

    // console.log(this.chests);

    const healthLayer = this.map.getObjectLayer('Health');

    this.healths = this.physics.add.group({
      classType: Item,
    });

    healthLayer.objects.forEach((healthObj) => {
      this.healths.get(
        healthObj.x + healthObj.width * 0.5,
        healthObj.y - healthObj.height * 0.5,
        'health'
      );
    });

    // debugDraw(wallsLayer, this);

    createCharacterAnims(this.anims);
    createLizardAnims(this.anims);

    this.faune = new Player(
      this,
      128,
      128,
      'faune',
      'sprites/walk-down/walk-down-3.png',
      this.playerAttackSound
    );

    this.scene.run('Ui', {
      playerAttack: this.faune.attack,
      playerCoins: this.faune.coins,
    });

    this.faune.body.setSize(this.faune.width * 0.5, this.faune.height * 0.8);

    this.cameras.main.startFollow(this.faune, true);

    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const body = go.body;
        body.onCollide = true;
      },
    });

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.faune.setKnifes(this.knives);

    this.lizards.get(200, 200, 'lizard');
    this.lizards.get(100, 400, 'lizard');
    this.lizards.get(800, 200, 'lizard');

    //colliders
    this.physics.add.collider(this.faune, wallsLayer);
    this.physics.add.collider(this.lizards, wallsLayer);
    this.physics.add.collider(
      this.knives,
      wallsLayer,
      this.handleKnifeWallCollision,
      undefined,
      this
    );

    this.physics.add.collider(
      this.knives,
      this.lizards,
      this.handleKnifeEnemiesCollision,
      undefined,
      this
    );

    this.playerEnemiesCollider = this.physics.add.collider(
      this.lizards,
      this.faune,
      this.handlePlayerEnemyCollision,
      undefined,
      this
    );

    this.goldPickupAudio = this.sound.add('goldSound', {
      loop: false,
      volume: 0.2,
    });

    this.physics.add.overlap(
      this.faune,
      this.chests,
      this.handlePlayerItemOverlap,
      null,
      this
    );

    this.physics.add.overlap(
      this.faune,
      this.healths,
      this.handlePlayerItemOverlap,
      null,
      this
    );

    this.createInput();
  }

  update() {
    if (this.faune) this.faune.update(this.cursors, this.wasd);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };
  }

  playBackgroundMusic(music) {
    this.backgroundMusic = this.sound.add(music, {
      loop: true,
      volume: 0.1,
    });
    this.backgroundMusic.play();
  }

  handlePlayerItemOverlap(player, item) {
    this.goldPickupAudio.play();

    if (item.texture.key === 'chest') {
      player.coins += 10;
      sceneEvents.emit('player-coins-changed', player.coins);
    } else if (
      item.texture.key === 'health' &&
      player.health < player.maxhealth
    ) {
      player.health++;
      sceneEvents.emit('player-health-changed', player.health);
    }
    item.makeInactive();
  }

  handlePlayerEnemyCollision(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

    player.handleDamage(dir);

    sceneEvents.emit('player-health-changed', this.faune.health);

    if (this.faune.health <= 0) {
      this.playerEnemiesCollider.destroy();
    }
  }

  handleKnifeEnemiesCollision(knife, enemy) {
    enemy.handleDamage(this.faune.attack);

    sceneEvents.emit('enemy-health-changed', enemy.health);

    this.knives.remove(knife, true);
  }

  handleKnifeWallCollision(knife, wall) {
    this.knives.remove(knife, true);
  }
}
export default GameScene;
