import {
  COLORS,
  SENIORITY_LEVELS,
  TICK_HOUR,
  TODO_LIST,
} from "../constants.js";
import STATE from "../state.js";
import {
  Button,
  ButtonSkill,
  ButtonWithProgress,
  FullPanelWrapper,
  PanelInfo,
  typedMessage,
  UI_textAndBar,
} from "../ui/ui.js";
import { Deffered, shakeObject, tweenOnPromise } from "../utils.js";
import KNOWLEDGE_ROADMAP from "../data/knowledgeMap.js";
import DayTimer from "../ui/daytimer.js";
import Calendar from "../ui/calendar.js";
import {
  addHour,
  buySkill,
  canAdanceSeniority,
  getKnowledgeLevel,
  getSeniority,
  saveState,
  spendHP,
} from "../context.js";
import learn from "../actions/learn.js";
import {
  getJobPool,
  populateNewJobOfferts,
  removeJobFromPool,
} from "../jobOfferPool.js";
import JobOffert from "../ui/jobOffert.js";
import { AnimFadeIn } from "../ui/transitions.js";
import jobInterview from "../actions/jobInterview.js";
import workOnJob from "../actions/workOnJob.js";
import Player from "../player.js";
import getPaidByJob from "../actions/getPaidByJob.js";
import SOUNDS from "../sounds.js";
import Kitchen from "../kitchen.js";
import GameBroadcast from "../GameBroadcast.js";
import Skill from "../models/skill.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.$main = this;
  }
  create() {
    this._initLight();
    this._initSounds();
    this._initPlayer();
    this._initUI();
    this.__everyTick();
    AnimFadeIn(this);

    this._initClock();
    this.updateInformation();

    this._initTutorial();
  }
  async _initTutorial() {
    if (!STATE.tutorial) {
      return;
    }

    this.clock.timeScale = 0.5;
    this.player.setBusy(true);
    this.player.setFrame(0);
    this.menu.hide();
    await this.printMessageUntilClick(["HOLA MUNDO!!"]);
    await this.printMessageUntilClick([
      "Ayudame, no se nada sobre ser un DEVELOPER",
    ]);
    this.menu.show();

    this.menu.list.forEach((btn) => {
      btn.setVisible(false);
    });

    // LETSW MOCK ONCLICK
    var deferred = new Deffered();
    this._continueTutorial = () => {
      deferred.resolve();
    };
    let startHealt = 0 + STATE.HEALTH;
    this.player.setBusy(false);
    this.player.setFrame(1);
    await this.printMessage(["Elije algo que aprender"]);
    this.menu.btnLearn.setVisible(true);
    shakeObject(this.menu.btnLearn, 100, 0.1);
    await deferred.promise;
    this.menu.btnLearn.setVisible(false);
    this.player.setBusy(true);
    this.player.setFrame(0);
    await this.printMessageUntilClick([
      "Gracias!",
      "siento que subi de nivel!!",
    ]);
    if (startHealt === STATE.HEALTH) {
      await this.printMessageUntilClick([
        "Aunque siento que pude esforzarme mas!!",
      ]);
    }
    await this.printMessage("RECUERDA!");
    await this.printMessageUntilClick([
      "cuando CLICK entonces ESFUERZO",
      "si ESFUERZO entonces VIDA-1",
    ]);

    this.player.setBusy(false);
    this.player.setFrame(1);
    await this.printMessage(["Veamos si encuentro trabajo!"]);
    this.menu.btnWork.setVisible(true);
    shakeObject(this.menu.btnWork, 100, 0.1);
    deferred = new Deffered();
    await deferred.promise;
    this.menu.btnWork.setVisible(false);
    this.player.setBusy(true);
    this.player.setFrame(0);
    this.player.hinge();
    await this.printMessage(["Wow!!", "A la primera ! "]);

    this.player.setBusy(false);
    this.player.setFrame(1);
    deferred = new Deffered();
    await this.printMessage(["Ahora vamos a trabajar "]);
    this.menu.btnWork.setVisible(true);
    shakeObject(this.menu.btnWork, 100, 0.1);
    await deferred.promise;
    this.menu.hide();
    this.menu.list.forEach((btn) => {
      btn.setVisible(true);
    });
    await this.printMessageUntilClick(["el dia aveces no alcanza"]);
    await this.printMessageUntilClick(["No se te olvide comer y dormir"]);

    this.menu.show();
    this._continueTutorial = () => {};
    // SAVE THE CURRENT STATE
    this.clock.timeScale = 1;
    STATE.tutorial = false;
    saveState();
  }
  _initSounds() {
    this.sounds = SOUNDS;
    this.sounds.melody1.play();
  }

  _initPlayer() {
    var location = {
      x: this.scale.width / 2,
      y: this.scale.height / 2 + 100,
    };

    const bed = this.add.image(200, 48, "bed", 0).setDisplaySize(128, 192);
    const sheet = this.add.image(200, 48, "bed", 1).setDisplaySize(128, 192);
    const pc = this.add.image(0, 0, "computer", 0).setDisplaySize(102, 102);
    const kitchen = new Kitchen(this, -200, -32);
    this.player = new Player(this, 0, 20, [kitchen, pc, bed, sheet]);
    const playerContainer = this.add.container(location.x, location.y, [
      kitchen,
      pc,
      bed,
      this.player,
      sheet,
    ]);
    let onPointerDown = () => {
      // SPEED UP
      this.input.once(
        "pointerup",
        () => {
          // SPEED DOWN
          this.player.doTyping();
          GameBroadcast.emit("playerclick", true);
          if (this.player.__onAct) {
            this._doSpendHP();
            this.player.__onAct();
          }
        },
        true
      );
    };
    playerContainer.setSize(this.scale.width * 0.5, 140);
    playerContainer.setInteractive();
    playerContainer.on("pointerdown", onPointerDown, true);

    //this.input.enableDebug(playerContainer, 0xff00ff);
  }
  _initLight() {
    //  Enable lights and set a dark ambient color
    this.lights.enable().setAmbientColor(0x111111);
    this.sunLight = this.add
      .image(this.scale.width, -100, "white")
      .setDisplaySize(this.scale.height, this.scale.height)
      .setBlendMode(1)
      .setPipeline("Light2D");
    this.lights
      .addLight(this.scale.width, 0, 200)
      .setColor(0xffffff)
      .setIntensity(5);
    let lastColor = COLORS.night;
    this.sunLight.update = () => {
      //let progress = STATE.DATE.hour / 24;
      let color = COLORS.night;
      if (STATE.DATE.hour >= 6 && STATE.DATE.hour <= 12) {
        color = COLORS.yellow;
      }
      if (STATE.DATE.hour >= 13 && STATE.DATE.hour <= 16) {
        color = COLORS.white;
      }
      if (STATE.DATE.hour > 16 && STATE.DATE.hour < 18) {
        color = COLORS.blue;
      }
      if (color != lastColor) {
        let holder = { value: 0 };
        let fromColor = new Phaser.Display.Color.ColorToRGBA(lastColor);
        let toColor = new Phaser.Display.Color.ColorToRGBA(color);
        lastColor = color;
        this.add.tween({
          targets: holder,
          value: 1,
          duration: 1000,
          onUpdate: () => {
            let rgbColor = Phaser.Display.Color.Interpolate.ColorWithColor(
              fromColor,
              toColor,
              1,
              holder.value
            );
            let colornum = Phaser.Display.Color.GetColor(
              rgbColor.r,
              rgbColor.g,
              rgbColor.b
            );
            this.sunLight.setTintFill(colornum);
          },
          onComplete: () => {
            //this.sunLight.setTintFill(color);
          },
        });
      }
    };
  }
  _initLifeBar() {
    this.lifeBar = new UI_textAndBar(
      this,
      42,
      132,
      this.scale.width - 52,
      "VITALIDAD",
      (value) => {
        this.lifeBar.title.setText(`VIT [${parseInt(value)}%]`);
        if (this.lifeBar.lastTimeout) {
          clearTimeout(this.lifeBar.lastTimeout);
        }
        this.lifeBar.lastTimeout = setTimeout(() => {
          if (value < 20) {
            this.lifeBar.title.setText(`CANSADO`);
          } else {
            this.lifeBar.title.setText(`VITALIDAD`);
          }
        }, 3000);
      },
      {
        color: COLORS.red,
        backgroundColor: COLORS.red_darker,
      }
    );
    this.lifeBar.update = () => {
      this.lifeBar.setValue((STATE.HEALTH / STATE.MAX_HEALTH) * 100);
    };
    {
      let backgroundBar = this.lifeBar.getContainer().list[0];
      let backgroundBarShadow = this.lifeBar.getContainer().list[1];
      backgroundBar.setDisplaySize(
        backgroundBar.displayWidth + 32,
        backgroundBar.displayHeight
      );
      backgroundBarShadow.setDisplaySize(
        backgroundBarShadow.displayWidth + 32,
        backgroundBarShadow.displayHeight
      );
      backgroundBar.x -= 32;
      backgroundBarShadow.x -= 32;
    }
    //this.lifeBar.bar.x += 16;
    let icon = this.add.sprite(-16, 0, "icons", 4).setDisplaySize(32, 32);
    this.lifeBar.getContainer().add(icon);
  }

  _initCalendar() {
    this.dayClock = new DayTimer(this, this.scale.width - 60, 64, 128, 32);
    this.dayClock.getContainer().setScale(0.8);
    this.calendar = new Calendar(this, 2, 8);
    this.calendar.getContainer().setScale(0.7);
  }
  _initMenuUI() {
    var minX = 16;
    var maxY = this.scale.height - 32;
    var margin = 16;

    const btnDormir = new Button(
      this,
      this.scale.width - 32,
      this.scale.height / 2,
      "Dormir",
      20
    ).onClick(async () => {
      this.__goToBed();
    });
    btnDormir.x -= btnDormir.width;
    const btnEat = new Button(this, 32, this.scale.height / 2, "    Comer")

      .addIcon(this.add.sprite(0, 0, "icons", 27).setDisplaySize(32, 32))
      .onClick(() => {
        this.__goToKitchen();
      });

    //
    const cellWidth = (this.scale.width - margin * 3) / 3;
    const btnLearn = new Button(this, margin, maxY, "   Aprender", 16)
      .addIcon(this.add.sprite(0, 0, "icons", 2).setDisplaySize(32, 32))
      .onClick(() => {
        this.learningPanel.show();
      });

    const btnWork = new Button(
      this,
      cellWidth + margin,
      maxY,
      "    Trabajos",
      16
    )
      .addIcon(this.add.sprite(0, 0, "icons", 3).setDisplaySize(32, 32))
      .onClick(() => {
        this.workPanel.show();
      });
    const btnSkill = new Button(
      this,
      cellWidth * 2 + margin * 2,
      maxY,
      "    Habilidad",
      16
    )
      .addIcon(
        this.add
          .sprite(0, 0, "icons", 38)
          .setTintFill(COLORS.blue)
          .setDisplaySize(32, 32)
      )
      .onClick(() => {
        this.skillPanel.show();
      });
    const btnSave = new Button(this, this.scale.width - 40, 180, "   ")
      .addIcon(
        this.add
          .sprite(0, 0, "icons", 31)
          .setDisplaySize(32, 32)
          .setTintFill(COLORS.green_dark)
      )
      .onClick(() => {
        saveState();
      });
    const btnTodo = this._BtnTodo(this.scale.width - 40, 220);
    this.menu = this.add.container(0, 0, [
      btnDormir,
      btnEat,
      btnWork,
      btnLearn,
      btnTodo,
      btnSave,
      btnSkill,
    ]);
    this.menu.hide = function () {
      this.setVisible(false);
    };

    this.menu.show = function () {
      this.setVisible(true);
      btnWork.text.setText(STATE.ACTUAL_JOB ? "    Trabajar" : "    Trabajos");
      btnWork.icon.setTintFill(
        STATE.ACTUAL_JOB ? COLORS.green_real : COLORS.brown
      );
    };
    this.menu.btnWork = btnWork;
    this.menu.btnLearn = btnLearn;
    this.menu.btnSkill = btnSkill;
    this.menu.show();
  }
  _initInfoViews() {
    this.seniorityPanel = new PanelInfo(
      this,
      100,
      20,
      getSeniority(),
      130
    ).alignCenter();
    this.seniorityPanel.text.setFontSize(28);
    this.seniorityPanel.text.setDropShadow(0, 0);
    this.moneyPanel = new PanelInfo(
      this,
      100,
      60,
      "$" + STATE.MONEY,
      130,
      32,
      0x11af11
    ).alignCenter();
    this.moneyPanel.text.setDropShadow(0, 2, 0x111111, 1);
  }
  _initPanelWork() {
    populateNewJobOfferts();
    const maxW = this.scale.width * 0.8;
    //
    const addTitle = (_text) => {
      let t = this.add
        .bitmapText(0, 0, "font1", _text, 32)
        .setDropShadow(1, 1)
        .setOrigin(0.5)
        .setMaxWidth(maxW);
      return t;
    };
    const addSubTitle = (_text) => {
      let t = this.add
        .bitmapText(0, 0, "font1", _text, 22)
        .setDropShadow(1, 1)
        .setOrigin(0.5)
        .setMaxWidth(maxW);
      return t;
    };
    const template_page1 = {
      title: addTitle("Trabajos"),
      subtitle: addSubTitle(["Busca trabajos abajo", ""]),
    };

    this.workPanel = new FullPanelWrapper(this, [
      template_page1.title,
      template_page1.subtitle,
    ]);
    this.workPanel.panelBG.setTintFill(0x010101).setAlpha(1);
    this.workPanel.hide();
    let lastJobOfferList = [];
    this.workPanel.onShow(() => {
      // UPDATE VIEW

      lastJobOfferList.forEach((element) => {
        element.destroy();
      });

      if (STATE.ACTUAL_JOB) {
        let offerView = new JobOffert(this, 0, 0, STATE.ACTUAL_JOB, maxW);
        offerView.makeThisAsWorking();
        offerView.onClick(() => this._doActualWork());
        lastJobOfferList = [offerView];
        template_page1.title.setVisible(false);
        template_page1.subtitle.setVisible(false);
        this.workPanel.bodycontent.setContent([offerView]);
        return;
      }
      template_page1.title.setVisible(true);
      template_page1.subtitle.setVisible(true);
      const jobpool = getJobPool();
      lastJobOfferList = [
        ...jobpool.map((job) => {
          let offerView = new JobOffert(this, 0, 0, job, maxW);
          offerView.onClick((job, successRate) =>
            this._onJobOfferApply(job, successRate)
          );
          return offerView;
        }),
      ];

      this.workPanel.bodycontent.setContent([
        template_page1.title,
        template_page1.subtitle,
        ...lastJobOfferList,
      ]);
    });
  }

  _initPanelLearn() {
    let learningList = [];
    const maxWidth = 300;
    const addLearnButton = (topic) => {
      const progressValue = getKnowledgeLevel(topic.text);
      const btn = new ButtonWithProgress(this, 0, 0, topic.text);
      btn.updateWidth(maxWidth);
      btn.progress.backgroundBar.setTintFill(COLORS.yello_dark);
      btn.progress.bar.setTintFill(
        progressValue < 20
          ? COLORS.red
          : progressValue < 50
          ? COLORS.orange
          : progressValue < 80
          ? COLORS.yellow
          : COLORS.green
      );
      btn.topic = topic;
      btn.isButton = true;
      btn.seniority_level = SENIORITY_LEVELS.indexOf(topic.seniority);
      btn.progress.setValue(progressValue);
      btn.onClick(() => {
        this._doLearning(topic);
      });
      return btn;
    };

    const updateLearningList = () => {
      // CLEAR LIST!

      let maxSeniorityLevel = STATE.SENIORITY;
      if (canAdanceSeniority()) {
        maxSeniorityLevel += 1;
      }

      learningList.forEach((element) => {
        element.destroy();
      });
      {
        let current_cost = 0;
        learningList = [];
        for (let seniority in KNOWLEDGE_ROADMAP) {
          if (SENIORITY_LEVELS.indexOf(seniority) > maxSeniorityLevel) {
            return;
          }
          let title = this.add
            .bitmapText(0, 0, "font1", seniority, 32)
            .setDropShadow(1, 1)
            .setOrigin(0.5);

          learningList.push(title);

          for (let i in KNOWLEDGE_ROADMAP[seniority]) {
            current_cost += 1;
            let topic = {
              text: KNOWLEDGE_ROADMAP[seniority][i],
              seniority,
              cost: current_cost + 0,
              index: parseInt(i),
            };

            learningList.push(addLearnButton(topic));
          }
          current_cost -= 2;
        }
      }
    };

    this.learningPanel = new FullPanelWrapper(this, learningList);
    this.learningPanel.hide();
    this.learningPanel.onShow(() => {
      updateLearningList();
      this.learningPanel.bodycontent.setContent(learningList);
    });
  }
  _initPanelSkills() {
    const maxWidth = 250;
    const maxLevel = 12;
    let skillBtnList = Object.keys(STATE.SKILLS).map((skill_name, idx) => {
      const btn = new ButtonSkill(
        this,
        0,
        0,
        new Skill(0, skill_name, 0),
        maxWidth
      );

      btn.onClick((skill) => {
        if (!this._doBuySkill(skill)) {
          this.skillPanel.hide();
        } else {
          updateSkillList();
        }
      });
      return btn;
    });

    const updateSkillList = () => {
      skillBtnList.forEach((skillBtn) => {
        if (skillBtn.skill.level >= maxLevel) {
          skillBtn.setAsMaxLevel();
          return;
        }
        skillBtn.skill.level = STATE.SKILLS[skillBtn.skill.name] + 1;
        skillBtn.skill.cost = Math.pow(2, skillBtn.skill.level);
        skillBtn.update();
        if (skillBtn.skill.level > maxLevel) {
          skillBtn.setAsMaxLevel();
        }
      });
    };
    this.skillPanel = new FullPanelWrapper(this, skillBtnList);
    this.skillPanel.hide();
    this.skillPanel.onShow(() => {
      updateSkillList();
      // this.skillPanel.bodycontent.setContent(skillBtnList);
    });
  }
  _initPanelViews() {
    this._initPanelLearn();
    this._initPanelWork();
    this._initPanelSkills();
  }
  _BtnTodo(x, y) {
    var todoText = this.add
      .bitmapText(
        x / 2,
        y - 50,
        "font1",
        TODO_LIST.map((t) => "* " + t),
        16
      )
      .setOrigin(0.5, 0)
      .setMaxWidth(this.scale.width * 0.8)
      .setVisible(false);

    const btnIcon = this.add
      .sprite(0, 0, "icons", 10)
      .setDisplaySize(32, 32)
      .setTint(0x111);
    const btn = new Button(this, x, y, "   ").addIcon(btnIcon);
    this.add.existing(btn);
    btn.onClick(() => {
      todoText.setVisible(!todoText.visible);
      if (!todoText.visible) {
        btnIcon.setTexture("icons", 10);
      } else {
        btnIcon.setTexture("icons", 28);
      }
      // btn.text.setText(todoText.visible ? "X" : "?");
    });
    return btn;
  }
  hideUI() {
    let visible = false;
    this.menu.hide();
    this.dayClock.getContainer().setVisible(visible);
    this.calendar.getContainer().setVisible(visible);
    this.lifeBar.getContainer().setVisible(visible);
    this.seniorityPanel.getContainer().setVisible(visible);
    this.moneyPanel.getContainer().setVisible(visible);
  }
  showUI() {
    let visible = true;
    this.menu.show();
    this.dayClock.getContainer().setVisible(visible);
    this.calendar.getContainer().setVisible(visible);
    this.lifeBar.getContainer().setVisible(visible);
    this.seniorityPanel.getContainer().setVisible(visible);
    this.moneyPanel.getContainer().setVisible(visible);
  }
  _initUI() {
    this._initMenuUI();
    this._initCalendar();
    this._initLifeBar();
    this._initInfoViews();
    this._initPanelViews();
  }
  _initClock() {
    if (this.clock) {
      return;
    }
    this.clock = this.time.addEvent({
      delay: TICK_HOUR,
      loop: true,
      callback: () => {
        this.__everyTick();
      },
    });
  }
  _onJobOfferApply(job, successRate) {
    this.workPanel.hide();
    this.menu.hide();

    jobInterview(this, job, STATE.tutorial ? 100 : successRate).then(
      (success) => {
        if (success) {
          STATE.ACTUAL_JOB = job;
          STATE.ACTUAL_JOB.progress = 0;
        }

        this.menu.show();

        if (STATE.tutorial) {
          this._continueTutorial();
        }
      }
    );
    removeJobFromPool(job);
    // REMOVE JOB FROM POOL
  }
  _doActualWork() {
    this.workPanel.hide();
    this.menu.hide();
    workOnJob(this, STATE.ACTUAL_JOB).then(
      async ({ expired, finished, progress }) => {
        if (expired) {
          STATE.ACTUAL_JOB = null;
        }
        if (finished) {
          // GET PAID!

          this.clock.timeScale = 0;
          STATE.MONEY += STATE.ACTUAL_JOB.salary;
          await getPaidByJob(this, STATE.ACTUAL_JOB);
          this.clock.timeScale = 1;

          STATE.ACTUAL_JOB = null;
        }
        this._validateTutorial();
        this.menu.show();
      }
    );
  }
  _doLearning(topic) {
    this.learningPanel.hide();
    this.menu.hide();
    learn(this, topic).then(() => {
      this.menu.show();
      this._validateTutorial();
    });
  }
  _doSpendHP() {
    spendHP(STATE.ACTION_COST);
    this.lifeBar.update();
  }
  _doBuySkill(skill) {
    if (!buySkill(skill)) {
      this.menu.hide();
      this.printMessage("No tienes suficiente dinero").then(() => {
        this.menu.show();
      });

      return false;
    }
    return true;
  }

  _validateTutorial() {
    if (!this.player.isFainted() && STATE.tutorial) {
      this._continueTutorial();
    }
  }
  async __goToBed() {
    if (!this.player.isBusy()) {
      this.menu.hide();
      await this.player.goToBed();
      this.menu.show();
    }
  }
  async __goToKitchen() {
    if (!this.player.isBusy()) {
      this.menu.hide();
      await this.player.goToKitchen();
      await Kitchen.start();
      await this.player.goToPcFromKitchen();
      this.menu.show();
    }
  }
  async printMessage(textMessage, doDestroy = true) {
    var location = {
      x: 20,
      y: this.scale.height - 200,
    };
    let message1 = typedMessage(this, textMessage, location.x, location.y, 32);
    message1.bitmapText.setMaxWidth(300);
    message1.doEnd = async () => {
      await tweenOnPromise(this, {
        targets: [message1.bitmapText],
        duration: 1000,
        alpha: 0,
        delay: 1000,
      });
      message1.destroy();
    };
    await message1.promise;

    if (doDestroy) {
      await message1.doEnd();
    }
    return message1;
  }
  async printMessageUntilClick(textMessage) {
    var deferred = new Deffered();
    let message = await this.printMessage(textMessage, false);
    var click = () => {
      this.input.once(
        "pointerup",
        () => {
          SOUNDS.click.play();
          this.input.removeListener("pointerdown", click);
          message.doEnd().then(() => {
            deferred.resolve();
          });
        },
        true
      );
    };
    this.input.on("pointerdown", click, true);

    await deferred.promise;
  }

  updateInformation() {
    this.seniorityPanel.text.setText(getSeniority());
    this.moneyPanel.text.setText("$" + STATE.MONEY);
    //
  }
  async _validateLife() {
    if (STATE.HEALTH < 1) {
      // STOP EVERYTHING!
      this.menu.hide();
      if (!this.player.isFainted()) {
        await this.player.faint();
        this.menu.show();
        this._validateTutorial();
      }
    }
    this.lifeBar.update();
  }

  __everyTick() {
    let tempday = STATE.DATE.day + 0;
    addHour();
    GameBroadcast.emit("hour", {
      hour: STATE.DATE.hour,
    });
    if (tempday !== STATE.DATE.day) {
      // DAY PASS
      GameBroadcast.emit("day", {
        day: STATE.DATE.day,
      });
      populateNewJobOfferts();
    }
    this.calendar.update();
    this.sunLight.update();
  }

  update() {
    this._validateLife();
    this.updateInformation();
  }
}
