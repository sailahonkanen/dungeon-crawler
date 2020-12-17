import Phaser from 'phaser';

const HealtState = {
  IDLE: 'IDLE',
  DAMAGE: 'DAMAGE',
  DEAD: 'DEAD',
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, attackAudio) {
    super(scene, x, y, texture, frame, attackAudio);
    this.attackAudio = attackAudio;
    this.currentHealtState = HealtState.IDLE;
    this.damageTime = 0;
    this.scene = scene;
    this.velocity = 160;

    this.health = 3;
    this.attack = 1;
    this.defense = 1;
    this.coins = 0;
    this.maxhealth = 3;

    this.knifes = Phaser.Physics.Arcade.Group;

    this.anims.play('faune-idle-down');

    this.scene.physics.world.enable(this);

    this.scene.add.existing(this);
  }

  setKnifes(knifes) {
    this.knifes = knifes;
  }

  handleDamage(dir) {
    if (this.health <= 0) {
      return;
    }

    if (this.currentHealtState === HealtState.DAMAGE) return;

    this.health--;

    if (this.health <= 0) {
      this.currentHealtState = HealtState.DEAD;
      this.anims.play('faune-faint');
      this.setVelocity(0, 0);
    } else {
      this.setVelocity(dir.x, dir.y);

      this.setTint(0xff0000);

      this.currentHealtState = HealtState.DAMAGE;
      this.damageTime = 0;
    }
  }

  throwKnife() {
    if (!this.knifes) {
      return;
    }
    const knife = this.knifes.get(this.x, this.y, 'knife');
    knife.setActive(true);
    knife.setVisible(true);
    this.attackAudio.play();

    if (!knife) {
      return;
    }

    const parts = this.anims.currentAnim.key.split('-');
    const direction = parts[2];

    const vec = new Phaser.Math.Vector2(0, 0);

    switch (direction) {
      case 'up':
        vec.y = -1;
        break;

      case 'down':
        vec.y = 1;
        break;

      default:
      case 'side':
        if (this.scaleX < 0) {
          vec.x = -1;
        } else {
          vec.x = 1;
        }
        break;
    }

    const angle = vec.angle();

    knife.setRotation(angle);

    knife.x += vec.x * 16;
    knife.y += vec.y * 16;

    knife.setVelocity(vec.x * 300, vec.y * 300);
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

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

  update(cursors, wasd) {
    if (
      !cursors ||
      !wasd ||
      this.currentHealtState === HealtState.DAMAGE ||
      this.currentHealtState === HealtState.DEAD
    )
      return;

    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      this.throwKnife();
      return;
    }

    this.body.setVelocity(0);

    const leftDown = cursors.left.isDown || wasd.left.isDown;
    const rightDown = cursors.right.isDown || wasd.right.isDown;
    const upDown = cursors.up.isDown || wasd.up.isDown;
    const downDown = cursors.down.isDown || wasd.down.isDown;

    if (leftDown) {
      this.anims.play('faune-run-side', true);
      this.setVelocity(-this.velocity, 0);

      this.scaleX = -1;
      this.body.offset.x = 24;
    } else if (rightDown) {
      this.anims.play('faune-run-side', true);
      this.setVelocity(this.velocity, 0);

      this.scaleX = 1;
      this.body.offset.x = 8;
    } else if (upDown) {
      this.anims.play('faune-run-up', true);
      this.setVelocity(0, -this.velocity);
    } else if (downDown) {
      this.anims.play('faune-run-down', true);
      this.setVelocity(0, this.velocity);
    } else {
      const parts = this.anims.currentAnim.key.split('-');
      parts[1] = 'idle';
      this.anims.play(parts.join('-'));
      this.setVelocity(0, 0);
    }
  }
}
