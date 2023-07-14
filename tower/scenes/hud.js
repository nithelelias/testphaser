import { GRIDSIZE } from "../src/constants.js";
import {
  DATA_STORES, 
} from "../src/context/data.js";
import cursorMovement from "../src/cursor.movement.js";
import { getAliveEnemies } from "../src/enemy.js";
import UIActionBar from "../src/hud/UIActionBars.js";
import UITickTempo from "../src/hud/UITickTempo.js";
import UiActionInfoPanel from "../src/hud/UiActionInfoPanel.js";
import DataView from "../src/hud/dataView.js";
import RESOURCES from "../src/resources.js";
import WORLD from "../src/world.js";
const GAP = GRIDSIZE * 1.2;

export default class Hud extends Phaser.Scene {
  static current;
  static infoView;
  stage = "idle";
  constructor() {
    super({ key: "HUD", active: true });
    window.hud = this;
    Hud.current = this;
  }

  create() {
    /// keys
    this.game.events.on("game-ready", () => {
      this.onGameReady();
    });
  }
  onGameReady() {
    this.tickTempo = new UITickTempo(this, 0, 0);
    this.cursor = cursorMovement(this, {
      onPointerMove: (pos, pointer,objects) => {
        if(objects.length>0){
          return
        }
        let at = WORLD.getEntityAt(pos);
        if (!at) {
          this.cursor.hideToolTip();
          this.infoView.hide();
          return;
        }

        if (at.isBuilding) {
          
          this.infoView.setInfo(at,at.buildType);
          return;
        }
        console.log("at pos", at);
      },
    });
    let zone = this.add
      .zone(0, 0, this.scale.width, this.scale.height)
      .setOrigin(0);
    this.actionBar = new UIActionBar(this, 0, 0);
    Hud.infoView = this.infoView = new UiActionInfoPanel(this, 0, 0);
    this.topBar = this.add.container(0, 0, [
      new DataView(
        this,
        16,
        16,
        RESOURCES.frames.resource_icons.gold,
        DATA_STORES.gold
      ),
      new DataView(
        this,
        0,
        16,
        RESOURCES.frames.resource_icons.food,
        DATA_STORES.food
      ),
      new DataView(
        this,
        0,
        16,
        RESOURCES.frames.resource_icons.population,
        DATA_STORES.population
      ),
    ]);
    const alignRight = (elem, alignTo, gap = 4) => {
      elem.x = alignTo.x + alignTo.width + gap;
    };

    alignRight(this.topBar.list[1], this.topBar.list[0]);
    alignRight(this.topBar.list[2], this.topBar.list[1]);

    Phaser.Display.Align.In.TopRight(this.tickTempo, zone, -GAP * 2, -GAP);
    Phaser.Display.Align.In.BottomLeft(this.actionBar, zone, -GAP, -GAP);
    Phaser.Display.Align.In.BottomRight(
      this.infoView,
      zone,
      -UiActionInfoPanel.width - GAP / 4,
      -UiActionInfoPanel.height - GAP / 4
    );
  }
  battleStage() {
    if (this.stage === "battle") {
      return;
    }
    console.log("start battle stage");
    this.infoView.hide();
    this.stage = "battle";
    //this.actionBar.goPrevAction();
    this.actionBar.setVisible(false);
    this.cursor.listen({});
    this.storeCursorFrames = [...this.cursor.currentFrames];
    this.cursor.setFrame(RESOURCES.frames.weapons.sword);
  }
  endBattleStage() {
    if (this.stage === "idle") {
      return;
    }
    this.stage = "idle";
    console.log("end battle stage");
    this.cursor.clearListeners();
    this.actionBar.setVisible(true);
    this.cursor.setFrame(this.storeCursorFrames[0], this.storeCursorFrames[1]);
  }

  update() {
    if (!this.actionBar) {
      return;
    }
    let totalEnemies = getAliveEnemies().length;
    if (totalEnemies > 0) {
      console.log(totalEnemies);
      this.battleStage();
    } else {
      this.endBattleStage();
    }
  }
}
