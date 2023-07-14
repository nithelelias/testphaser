import Hud from "../../scenes/hud.js";
import Main from "../../scenes/main.js";
import ActionBarButtonOption from "../ActionBarButtonOption.js";
import { BUILDING_TYPES } from "../building_types.js";
import { COLORS } from "../constants.js";
import { DATA_STORES } from "../context/data.js";
import Cursor from "../cursor.js";
import PopMessage from "../popMessage.js";
import RESOURCES from "../resources.js";
import WORLD from "../world.js";

const cancel_action = { icon: RESOURCES.frames.cancel, name: "cancel" };
const BUILD_ACTIONS = Object.values(BUILDING_TYPES);

BUILD_ACTIONS.shift(); // REMOVE HQ
const MAIN_ACTIONS = [
  { icon: RESOURCES.frames.pickaxe, name: "pickaxe", tooltip: "Construir" },
  { icon: RESOURCES.frames.shovel, name: "shovel", tooltip: "Quitar" },
  // { icon: RESOURCES.frames.hoe, name: "hoe" },
];

export default class UIActionBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);
    scene.add.existing(this);
    this.current_actions = [];
    this.hist_actions = [];
    this.cancelButton = new ActionBarButtonOption(
      this.scene,
      0,
      0,
      cancel_action.icon,
      {
        onClick: () => this.goPrevAction(),
        onHover: () => {
          Cursor.setAsPointer();
          this.cancelButton.icon.setTintFill(0xff0000);
          Cursor.setToolTip("cancel and return");
        },
        onHoverOut: () => {
          Cursor.reset();
          Cursor.hideToolTip();
          this.cancelButton.icon.setTintFill(0x111);
        },
      }
    );

    this.main_actions = [...MAIN_ACTIONS].map(
      (action, idx) =>
        new ActionBarButtonOption(
          this.scene,
          idx * ActionBarButtonOption.BUTTON_SIZE,
          0,
          action.icon,
          {
            onClick: () => this.triggerMainAction(action),
            onHover: () => {
              Cursor.setAsPointer();
              Cursor.setToolTip(action.tooltip);
            },
            onHoverOut: () => {
              Cursor.reset();
              Cursor.hideToolTip();
            },
          }
        )
    );
    this.build_actions = [this.cancelButton].concat(
      [...BUILD_ACTIONS].map((action, idx) => {
        let active = false;
        return new ActionBarButtonOption(
          this.scene,
          (idx + 1) * ActionBarButtonOption.BUTTON_SIZE,
          0,
          action.icon,
          {
            onClick: () => {
              active = true;
              this.triggerBuildAction(action);
            },
            onHover: () => {
              Cursor.setAsPointer();
              Cursor.setToolTip(action.name);
              Hud.infoView.setInfo(null, action);
            },
            onHoverOut: () => {
              if (active) {
                active = false;
                return;
              }
              Cursor.reset();
              Hud.infoView.hide();
              Cursor.hideToolTip();
            },
          }
        );
      })
    );
    this.renderUpdate(this.main_actions, false);
  }
  clear() {
    if (this.hist_actions.length > 0) {
      Cursor.reset();
      Cursor.hideToolTip();
    }
    if (this.currentCursorListener) {
      this.currentCursorListener.remove();
      this.currentCursorListener = null;
    }
    Main.hideGrid();
    Main.hideValidBuildArea();
    this.remove(this.current_actions);
    this.current_actions.forEach((actionButton) =>
      actionButton.setVisible(false)
    );
    this.current_actions = [];
  }
  validateCost(action) {
    if (!action.cost) {
      return true;
    }

    for (let key in action.cost) {
      if (DATA_STORES[key].get() < action.cost[key]) {
        return false;
      }
    }

    return true;
  }
  spend(action) {
    if (!action.cost) {
      return true;
    }
    for (let key in action.cost) {
      DATA_STORES[key].set(DATA_STORES[key].get() - action.cost[key]);
    }
  }
  goPrevAction() {
    Hud.infoView.hide();
    let actions = this.hist_actions.pop();
    this.renderUpdate(actions, false);
  }
  triggerMainAction(action) {
    if (action.name === "pickaxe") {
      this.renderUpdate(this.build_actions);
      return;
    }
    if (action.name === "shovel") {
      this.triggerClearBuildAction(action);
      return;
    }
  }
  triggerClearBuildAction(action) {
    this.renderUpdate([this.cancelButton]);
    Main.showGrid();
    Cursor.setFrame(action.icon);
    this.currentCursorListener = Cursor.current.listen({
      onPointerMove: (pos, pointer) => {
        let at = WORLD.getEntityAt(pos);
        if (!at) {
          this.infoView.hide();
          return;
        }
        if (at.isBuilding) {
          this.infoView.setInfo(at, at.buildType);
          return;
        }
      },
      onPointerDown: (pos, _pointer) => {
        let at = WORLD.getEntityAt(pos);
        if (at && at.isBuilding) {
          at.explode();
        }
      },
    });
  }
  triggerBuildAction(action) {
    this.renderUpdate([this.cancelButton]);
    Hud.infoView.setInfo(null,action);
    Main.showGrid();
    Main.showValidBuildArea();
    Cursor.setFrame(action.icon);

    const updateCursor = (pos) => {
      if (!Main.isValidBuildDistance(pos)) {
        Cursor.setFrame(action.icon, RESOURCES.frames.cancel);
        Cursor.current.setColor(null, COLORS.red);
        return false;
      }
      Cursor.setFrame(action.icon);
      Cursor.current.clearTint();

      return true;
    };
    this.currentCursorListener = Cursor.current.listen({
      onPointerDown: (pos, _pointer) => {
        if (!updateCursor(pos)) {
          return;
        }
        if (!this.validateCost(action)) {
          PopMessage.create(_pointer.x, _pointer.y, ["Insuficiente"], true);
          return;
        }
        this.spend(action);
        Main.addBuilding(pos.x, pos.y, action);
      },
      onPointerMove: (pos, _pointer) => {
        updateCursor(pos);
      },
    });
  }
  renderUpdate(actions, store = true) {
    if (store) {
      this.hist_actions.push(this.current_actions);
    }
    this.clear();
    this.current_actions = actions;
    this.current_actions.forEach((actionButton) =>
      actionButton.setVisible(true)
    );
    this.add(this.current_actions);
  }
}
