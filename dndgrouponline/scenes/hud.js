import Button from "../src/components/button.js";
import { saveToLocal } from "../src/components/storage.js";
import ThrowDice from "../src/components/throwdice.js";
import { CLIENT } from "../src/constants/data.js";
import RESOURCES from "../src/constants/resources.js";
import { COLORS, GRID } from "../src/constants/values.js";
export default class SceneHud extends Phaser.Scene {
  mainScene;
  constructor() {
    super("hub");
  }
  create({ main }) {
    this.mainScene = main;
    this.createZoomControl();
    this.createChronometer();
    if (CLIENT.type === 2) this.createCenterButton();
  }
  createZoomControl() {
    const rec = this.add.rectangle(0, 0, 200, 30, COLORS.color1).setOrigin(0.5);

    const zoomTextCaption = this.add
      .bitmapText(0, 0, "font1", "Hello World", 16)
      .setOrigin(0, 0.5)
      .setTint(COLORS.color2);

    this.add
      .container(10, this.scale.height - 16, [rec, zoomTextCaption])
      .setScrollFactor(0);

    this.events.on("update", () => {
      const main = this.mainScene;
      zoomTextCaption.setText(`Zoom: ${main.cameras.main.zoom.toFixed(1)}`);
    });
  }
  createMouseCursor() {
    const cursor = this.add
      .image(0, 0, RESOURCES.name, RESOURCES.frames.cursor)
      .setDepth(100)
      .setTint(COLORS.color1);
    cursor.setScale(GRID.size / cursor.width);
    this.input.on("pointermove", (pointer) => {
      cursor.setPosition(pointer.worldX, pointer.worldY);
    });
  }
  createCenterButton() {
    const container = this.add.container(
      this.scale.width / 2,
      this.scale.height - 20,
      []
    );
    const btnCenter = new Button(this, 0, 0, "centrar", () => {
      const main = this.mainScene;
      main.centerOnGrid();
    });
    const btnSave = new Button(this, 0, 0, "Guardar", () => {
      saveToLocal();
    });

    const thrower = new ThrowDice(this);
    thrower.setVisible(false);
    const dceButton = new Button(this, 0, 0, "Dado", () => {
      thrower.toggle();
      /* thrower.throwDice().then(() => {
        thrower.setVisible(false);
      }); */
    });

    const buttons = [btnCenter, btnSave, dceButton];
    container.add(buttons);
    let startX = 0;
    buttons.forEach((btn, i) => {
      btn.x = startX;
      startX += btn.width + 10;
    });
  }
  createChronometer() {
    const timerText = this.add
      .text(this.scale.width, 100, "00:00", {
        color: "#000000",
        fontSize: 24,
        align: "right",
        backgroundColor: "#ffffff",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(1);
    const calcTimeRemain = () => {
      const ahora = new Date();
      const objetivo = new Date(ahora);

      // Establecer la hora objetivo (18:00)
      objetivo.setHours(18, 0, 0, 0);

      // Si ya pasó las 6 PM, establecer para mañana
      if (ahora > objetivo) {
        objetivo.setDate(objetivo.getDate() + 1);
      }

      // Calcular la diferencia en milisegundos
      const diferencia = objetivo - ahora;

      // Convertir a horas, minutos y segundos
      const segundosTotales = Math.floor(diferencia / 1000);
      const horas = Math.floor(segundosTotales / 3600);
      const minutos = Math.floor((segundosTotales % 3600) / 60);
      const segundos = segundosTotales % 60;

      // Formatear con ceros a la izquierda
      const horasStr = horas.toString().padStart(2, "0");
      const minutosStr = minutos.toString().padStart(2, "0");
      const segundosStr = segundos.toString().padStart(2, "0");

      return `${horasStr}:${minutosStr}:${segundosStr}`;
    };
    const updateTimer = () => {
      const timeRemain = calcTimeRemain();
      timerText.setText(
        `${timeRemain} tiempo restante `
      );
    };

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: updateTimer,
    });

    updateTimer();
  }
}
