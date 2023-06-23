export  default class UserKeyControls {
  constructor(context) {
    /** @type {Phaser.Scene} */
    this.context = context;
    this.lastMoveTime = 0;
    this.repeatMoveDelay=80;
    this.velocity={x:0,y:0};
    const cursor = context.input.keyboard.createCursorKeys();
    const customKeys = {
      'A': false,
      'W': false,
      'S': false,
      'D': false
    };
    this.squeme = {
      isUp: () => {
        return cursor.up.isDown || customKeys.W;
      },
      isDown: () => {
        return cursor.down.isDown || customKeys.S;
      },
      isLeft: () => {
        return cursor.left.isDown || customKeys.A;
      },
      isRight: () => {
        return cursor.right.isDown || customKeys.D;
      }
    }

    context.input.keyboard.on('keydown', (keyboard) => {
      customKeys[keyboard.key.toUpperCase()] = true;
    });
    context.input.keyboard.on('keyup', (keyboard) => {
      customKeys[keyboard.key.toUpperCase()] = false;
    });

    
   
  }
  getMovingVelocity(){
    return this.velocity;
  }
  update(time, delta) {
    

    if (time <= this.lastMoveTime + this.repeatMoveDelay) {
      return  ;
    }
    let vx = 0,
      vy = 0;
    if (this.squeme.isDown()) {
      vy = 1;
    } else if (this.squeme.isUp()) {
      vy = -1;
    }

    if (this.squeme.isLeft()) {
      vx = -1;
    } else if (this.squeme.isRight()) {
      vx = 1;
    }
    this.velocity.x=vx;
    this.velocity.y=vy;
    if (vx != 0 || vy != 0) {
      this.lastMoveTime = time;
    }
  
    
  }
}