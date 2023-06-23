export default function playerWeaponBehavior({ onShoot }) {
  const scene = this.scene;
  const weapon = this.weapon;
  const avatar = this.sprite;
  const dist_to_owner = this.width;
  const cam = scene.cameras.main; 
  var isDown = false,
    pointer = scene.input.mousePointer;

  const getOwnerGlobalPos = () => {
    return {
      x: this.x - cam.scrollX,
      y: this.y - cam.scrollY,
    };
  };
  const getPointerAngle = () => {
    const pos = getOwnerGlobalPos();
    return Phaser.Math.Angle.Between(pos.x, pos.y, pointer.x, pointer.y);
  };
  const moveWeapon = () => {
    const ang = getPointerAngle();
    weapon.setRotation(ang);
    let vx = Math.cos(ang),
      vy = Math.sin(ang);
    weapon.x = vx * dist_to_owner;
    weapon.y = vy * dist_to_owner;
    //bullet_start_position.x = vx * (dist_to_owner + size);
    //bullet_start_position.y = vy * (dist_to_owner + size);
    weapon.flipY = weapon.x < avatar.x;
  };
 

  scene.input.on("pointerdown", () => {
    isDown = true;
  });
  scene.input.on("pointerup", () => {
    isDown = false;
  });

  scene.time.addEvent({
    delay: 6,
    loop: true,
    callback: () => {
      moveWeapon();
      if (isDown) {
        onShoot();
      }
    },
  });
}
