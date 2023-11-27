const COLOR_BY_POINTS = [
  0xfff275, 0xfff275, 0xfe4a49, 0xfed766, 0x009fb7, 0xe6e6ea, 0xf4f4f8,
  0x6699cc, 0xff8c42, 0xff3c38, 0xa23e48,
];
const animals = [
  "chick",
  "chicken",
  "duck",
  "frog",
  "dog",
  "parrot",
  "owl",
  "cow",
  "bear",
  "gorilla",
  "crocodile",
  "panda",
  "elephant",

  "giraffe",
  "goat",
  "hippo",
  "horse",
  "monkey",
  "moose",
  "narwhal",
];
class Main extends Phaser.Scene {
  preload() {
    generateGraphics(this);
    this.load.atlasXML("animals", "assets/round.png", "assets/round.xml");
  }

  create() {
    window.main = this;
    this.current = null;
    this.collisionPool = {};
    this.matter.world.setBounds();

    const Matter = Phaser.Physics.Matter;

    this.matter.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 20,
      this.scale.width,
      100,
      {
        isStatic: true,
      }
    );

    this.createNew(this.scale.width / 2);
    //  This body isn't effected by Gravity
    this.input.on("pointermove", (pointer) => {
      if (!this.current) {
        return;
      }
      this.current.x = pointer.x;
    });
    this.input.on("pointerdown", () => {
      if (!this.current) {
        return;
      }
      this.input.once("pointerup", (pointer) => {
        this.current.setIgnoreGravity(false);
        this.current = null;
        setTimeout(() => this.createNew(pointer.x), 1200);
      });
    });
    /*  this.matter.world.on("collisionend", this.validateCollision.bind(this));
    this.matter.world.on("collisionstart", this.validateCollision.bind(this)); */
  }
  validateCollision_2(event, bodyA, bodyB) {
    if (bodyA.gameObject && bodyB.gameObject) {
      if (this.validateMerge(bodyA.gameObject, bodyB.gameObject)) {
        this.matter.world.remove(bodyA);
        this.matter.world.remove(bodyB);
      }
    }
  }
  validateCollision(bodyA, bodyB) {
    let dist = Phaser.Math.Distance.BetweenPoints(
      { x: bodyA.x, y: bodyA.y },
      { x: bodyB.x, y: bodyB.y }
    );

    dist -= bodyA.radius;
    dist -= bodyB.radius;
    if (dist > 0) {
      return;
    }

    this.validateMerge(bodyA, bodyB);
  }
  validateMerge(objectA, objectB) {
    if (!objectA.points || !objectB.points) {
      return false;
    }
    if (objectA.points !== objectB.points) {
      console.log("not same points", objectA.points, objectB.points);
      return false;
    }
    let mid = {
      x: objectA.x + (objectB.x - objectA.x) / 2,
      y: objectA.y + (objectB.y - objectA.y) / 2,
    };
    this.createCirc(mid.x, mid.y, objectA.points + 1);

    this.matter.world.remove(objectA.body);
    this.matter.world.remove(objectB.body);
    objectA.eat();
    objectB.eat();
    /*  this.tweens.add({
      targets: [objectA, objectB],
      alpha: { value: 0, duration: 150, ease: "Power1" },
      onComplete: (ball) => {
       
      },
    }); */

    return true;
  }
  createNew(x) {
    console.log("create new!");
    const circle = this.createCirc(x, 100, 1);
    circle.setIgnoreGravity(true);
    this.current = circle;
  }
  createCirc(x, y, points = 1) {
    const radius = 32 * points;
    const Matter = Phaser.Physics.Matter;
    let circle = this.matter.add
      .sprite(x, y, "animals", animals[points - 1]+".png", {
        mass: 0.1 * points,
      })
      .setDisplaySize(radius, radius);
    circle.setExistingBody(
      Matter.Matter.Bodies.circle(circle.x, circle.y, radius / 2)
    );
    circle.radius = radius / 2;
    circle.points = points;
    //  circle.setTint(COLOR_BY_POINTS[points]);
    circle.eat = () => {
      for (let i in this.collisionPool[points]) {
        if (this.collisionPool[points][i] === circle) {
          this.collisionPool[points].splice(i, 1);
          break;
        }
      }
      circle.destroy();
    };
    if (!this.collisionPool[points]) {
      this.collisionPool[points] = [];
    }
    this.collisionPool[points].push(circle);
    return circle;
  }
  update() {
    for (let i in this.collisionPool) {
      for (let j in this.collisionPool[i]) {
        let current = this.collisionPool[i][j];
        for (let k in this.collisionPool[i]) {
          if (k !== j) {
            this.validateCollision(current, this.collisionPool[i][k]);
          }
        }
      }
    }
  }
}
export default function generateGraphics(scene) {
  if (!scene.textures.list.hasOwnProperty("rect")) {
    let g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff);
    g.fillCircle(128, 128, 128, 128);
    g.generateTexture("circle", 128 * 2, 128 * 2);
    g.clear();
    g.fillRect(0, 0, 128, 128);
    g.generateTexture("rectangle", 128 * 2, 128 * 2);
    g.destroy();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 460,
  height: 720,
  backgroundColor: "#1b1464",
  parent: "gameWrapper",
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 2 },
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: Main,
};

const game = new Phaser.Game(config);
