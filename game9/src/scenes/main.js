import {
  COLORS,
  SENIORITY_LEVELS,
  TICK_HOUR,
  TODO_LIST,
} from "../constants.js";
import STATE from "../state.js";
import {
  Button,
  FullPanelWrapper,
  PanelInfo,
  ProgressBar,
  typedMessage,
  UI_textAndBar,
} from "../ui/ui.js";
import { random, tweenOnPromise, waitTimeout } from "../utils.js";
import KNOWLEDGE_ROADMAP from "../data/knowledgeMap.js";
import DayTimer from "../ui/daytimer.js";
import Calendar from "../ui/calendar.js";
import { addHour, canAdanceSeniority, getSeniority } from "../context.js";
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

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.$main = this;
  }
  create() {
    this._initSounds();
    this._initPlayer();
    this._initUI();
    this.__everyTick();

    AnimFadeIn(this);

    this._initClock();
    this.updateInformation();
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
          if (this.player.isBusy()) {
            return;
          }
          this.sounds.typing.play("key" + random(1, 9), 0.1);
          this.player.hinge();
          if (this.player.__onAct) {
            this.spendHP();
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
    var minY = 180;
    var maxY = this.scale.height - 32;
    var margin = 16;

    const btnDormir = new Button(this, minX, minY, "Dormir", 20).onClick(
      async () => {
        this.__goToBed();
      }
    );
    const btneat = new Button(
      this,
      btnDormir.x + btnDormir.width / 2 + margin,
      minY,
      "    Comer"
    )

      .addIcon(this.add.sprite(0, 0, "icons", 27).setDisplaySize(32, 32))
      .onClick(() => {
        this.__goToKitchen();
      });

    const btnrelax = new Button(
      this,
      btneat.x + btneat.width / 2 + margin,
      minY,
      "    Relax"
    )

      .addIcon(
        this.add
          .sprite(0, 0, "icons", 30)
          .setTint(0x00afa1)
          .setDisplaySize(32, 32)
      )
      .onClick(() => {});
    const btnExercise = new Button(
      this,
      btnrelax.x + btneat.width / 2 + margin,
      minY,
      "Entrenar"
    ).onClick(() => {});
    //
    const btnlearn = new Button(this, minX + 50, maxY, "   Aprender", 20)

      .addIcon(this.add.sprite(0, 0, "icons", 2).setDisplaySize(32, 32))
      .onClick(() => {
        this.learningPanel.show();
      });

    const btnfindjob = new Button(
      this,
      btnlearn.x + btnlearn.width / 2 + margin,
      maxY,
      "    Trabajos"
    )
      .addIcon(this.add.sprite(0, 0, "icons", 3).setDisplaySize(32, 32))
      .onClick(() => {
        this.workPanel.show();
      });

    const btnTodo = this._BtnTodo(this.scale.width - 40, btnExercise.y + 40);
    this.menu = this.add.container(0, 0, [
      btnDormir,
      btneat,
      btnrelax,
      btnfindjob,
      btnlearn,
      btnExercise,
      btnTodo,
    ]);
    this.menu.hide = function () {
      this.setVisible(false);
    };
    this.menu.show = function () {
      this.setVisible(true);
    };
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
      populateNewJobOfferts();
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
    let maxWidth = 300;

    let updateLearningList = () => {
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
            let btn = new Button(this, 10, 0, topic.text)
              .onClick(() => {
                this._doLearning(topic);
              })
              .setMaxWidth(maxWidth);
            btn.progress = new ProgressBar(
              this,
              -btn.displayWidth / 2,
              btn.displayHeight / 2,
              btn.displayWidth,
              1,
              {
                color: 0xff0000,
              }
            );
            btn.add(btn.progress.getContainer());
            btn.progress.setValue(0);
            btn.topic = topic;
            btn.isButton = true;
            btn.text.setDropShadow(0, 0);
            btn.seniority_level = SENIORITY_LEVELS.indexOf(seniority);
            learningList.push(btn);
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
  _initPanelViews() {
    this._initPanelLearn();
    this._initPanelWork();
  }
  _BtnTodo(x, y) {
    var todoText = this.add
      .bitmapText(
        x / 2,
        y + 50,
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

    jobInterview(this, job, successRate).then((success) => {
      STATE.ACTUAL_JOB = job;
      STATE.ACTUAL_JOB.progress = 0;
      STATE.save();

      this.menu.show();
    });
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
        STATE.save();
        this.menu.show();
      }
    );
  }
  _doLearning(topic) {
    this.learningPanel.hide();
    this.menu.hide();
    learn(this, topic).then(() => {
      this.menu.show();
    });
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
  async printMessage(textMessage) {
    var location = {
      x: 20,
      y: this.scale.height - 200,
    };
    let message1 = typedMessage(this, textMessage, location.x, location.y, 32);
    message1.bitmapText.setMaxWidth(300);
    await message1.promise;
    await tweenOnPromise(this, {
      targets: [message1.bitmapText],
      duration: 1000,
      alpha: 0,
      delay: 1000,
    });
    message1.destroy();
  }

  spendHP() {
    STATE.HEALTH = Math.max(0, STATE.HEALTH - STATE.ACTION_COST);
    this.lifeBar.setValue(STATE.HEALTH);
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
        STATE.save();
      }
    }
    this.lifeBar.setValue(STATE.HEALTH);
  }

  __everyTick() {
    addHour();
    this.calendar.update();
  }
  update() {
    this._validateLife();
    this.updateInformation();
  }
}
