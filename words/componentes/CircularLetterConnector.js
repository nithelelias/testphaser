export default class CircularLetterConnector extends Phaser.GameObjects
  .Container {
  constructor(scene, x, y, letters, callback) {
    super(scene, x, y);

    this.letters = letters;
    this.callback = callback;
    this.selectedLetters = [];
    this.lines = [];
    this.radius = 100;
    this.isDragging = false;
    this.currentLine = null;
    this.add(scene.add.circle(0, 0, this.radius + 20, 0xff0000).setOrigin(0.5));
    this.createLetters();
    this.setupInputHandlers();

    scene.add.existing(this);
  }

  createLetters() {
    const angleStep = (2 * Math.PI) / this.letters.length;
    this.letters.forEach((letter, index) => {
      const angle = index * angleStep;
      const letterX = this.radius * Math.cos(angle);
      const letterY = this.radius * Math.sin(angle);

      const text = this.scene.add
        .text(letterX, letterY, letter, {
          fontSize: "32px",
          fill: "#ffffff",
        })
        .setOrigin(0.5)
        .setInteractive();
      text.name = letter + "_" + index;
      this.add(text);
      text.setData("letter", letter);
    });
  }

  setupInputHandlers() {
    this.scene.input.on("pointerdown", (pointer, target) => {
      if (target.length === 0) return;
      this.selectedLetters = [target[0]];
      this.isDragging = true;
    });

    this.scene.input.on("pointermove", (pointer, target) => {
      if (!this.isDragging) return;
      if (target.length === 0) return;

      this.selectLetter(target[0]);
    });

    this.scene.input.on("pointerup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.callback(this.selectedLetters.map((obj) => obj.getData("letter")));
        this.selectedLetters = [];
        this.clearLines();
      }
    });
  }

  selectLetter(letterObj) {
    if (!letterObj) return;

    if (
      this.selectedLetters.some(
        (currentLetterItem) => currentLetterItem.name === letterObj.name
      )
    )
      return;
    this.selectedLetters.push(letterObj);
    letterObj.setStyle({
      fill: "#ff0000",
      stroke: "#ffffff",
      strokeThickness: 4,
    });

    if (this.selectedLetters.length > 1) {
      const lastLetter = this.selectedLetters[this.selectedLetters.length - 2];
      this.drawLine(lastLetter, letterObj);
    }

    // Iniciar una nueva línea desde la letra actual hacia el puntero
    this.currentLine = this.scene.add
      .line(0, 0, letterObj.x, letterObj.y, letterObj.x, letterObj.y, 0xffffff)
      .setOrigin(0, 0)
      .setLineWidth(2);
    this.add(this.currentLine);
  }

  drawLine(from, to) {
    const line = this.scene.add
      .line(0, 0, from.x, from.y, to.x, to.y, 0xffffff)
      .setOrigin(0, 0)
      .setLineWidth(2);

    this.add(line);
    this.lines.push(line);
  }

  clearLines() {
    this.lines.forEach((line) => line.destroy());
    this.lines = [];
    if (this.currentLine) {
      this.currentLine.destroy();
      this.currentLine = null;
    }
  }
  update() {}
}
