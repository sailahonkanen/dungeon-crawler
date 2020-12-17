import Phaser from 'phaser';

const Direction = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

const HealtState = {
  IDLE: 'IDLE',
  DAMAGE: 'DAMAGE',
  DEAD: 'DEAD',
};

const randomDirection = (exclude) => {
  let newDirection = Phaser.Math.Between(0, 3);

  while (newDirection === exclude) {
    newDirection = Phaser.Math.Between(0, 3);
  }

  return newDirection;
};

export default class Lizard extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.attack = 1;
    this.health = 2;

    this.currentDirection = Direction.RIGHT;
    this.moveEvent = Phaser.Time.TimerEvent;

    this.anims.play('lizard-idle');

    this.currentHealtState = HealtState.IDLE;
    this.damageTime = 0;

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );

    this.moveEvent = scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.currentDirection = randomDirection(this.currentDirection);
      },
      loop: true,
    });
  }

  destroy(fromScene) {
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  handleTileCollision(go, tile) {
    if (go !== this) {
      return;
    }

    this.currentDirection = randomDirection(this.currentDirection);
  }

  handleDamage(attack) {
    if (this.health <= 0) {
      return;
    }

    if (this.currentHealtState === HealtState.DAMAGE) return;

    this.health -= attack;

    if (this.health <= 0) {
      this.currentHealtState = HealtState.DEAD;
      this.setActive(false);
      this.setVisible(false);
      this.body.checkCollision.none = true;
    } else {
      this.setTint(0xff0000);
      this.currentHealtState = HealtState.DAMAGE;
      this.damageTime = 0;
    }
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    const speed = 50;

    switch (this.currentDirection) {
      case Direction.UP:
        this.setVelocity(0, -speed);
        break;
      case Direction.DOWN:
        this.setVelocity(0, speed);
        break;
      case Direction.LEFT:
        this.setVelocity(-speed, 0);
        break;
      case Direction.RIGHT:
        this.setVelocity(speed, 0);
        break;
    }

    switch (this.currentHealtState) {
      case HealtState.IDLE:
        break;

      case HealtState.DAMAGE:
        this.damageTime += dt;
        if (this.damageTime >= 250) {
          this.currentHealtState = HealtState.IDLE;
          this.setTint(0xffffff);
          this.damageTime = 0;
        }
        break;
    }
  }
}
