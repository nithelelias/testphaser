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
  UI_textAndBar,
} from "../ui/ui.js";
import { random, tweenOnPromise } from "../utils.js";
import KNOWLEDGE_ROADMAP from "../data/knowledgeMap.js";
import DayTimer from "../ui/daytimer.js";
import Calendar from "../ui/calendar.js";
import {
  addHour,
  canAdanceSeniority,
   
  getSeniority,
} from "../context.js";
import Sleep from "../actions/sleep.js";
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
    let anim = new AnimFadeIn(this, () => {
      this.initClock();
      anim.destroy();
    });
  }

  _initSounds() {
    this.sounds = {
      step: this.sound.add("step", { loop: false, volume: 0.2, rate: 2 }),
      step2: this.sound.add("step", { loop: false, volume: 0.1 }),
      typing: this.sound.add("typing", { loop: false, volume: 0.5 }),
      tap: this.sound.add("tap", { loop: false, volume: 0.3, rate: 3 }),
      click: this.sound.add("click", { loop: false, volume: 0.3, rate: 1 }),
    };
    // TYPING KEYS
    {
      this.sounds.typing.addMarker({ name: "key1", start: 2.3, duration: 0.2 });
      this.sounds.typing.addMarker({ name: "key2", start: 2.5, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key3", start: 2.6, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key4", start: 2.7, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key5", start: 2.8, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key6", start: 2.9, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key7", start: 3.0, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key8", start: 3.1, duration: 0.1 });
      this.sounds.typing.addMarker({ name: "key9", start: 3.2, duration: 0.1 });
      this.sounds.typing.addMarker({
        name: "key10",
        start: 3.3,
        duration: 0.1,
      });
      this.sounds.typing.addMarker({
        name: "key11",
        start: 3.4,
        duration: 0.1,
      });
    }
    //TAP
    {
      this.sounds.tap.addMarker({
        name: "t1",
        start: 0,
        duration: 0.4,
      });
      this.sounds.tap.addMarker({
        name: "t2",
        start: 0.4,
        duration: 0.3,
      });
      this.sounds.tap.addMarker({
        name: "t3",
        start: 0.7,
        duration: 0.3,
      });
    }
  }

  _initPlayer() {
    var location = {
      x: this.scale.width / 2,
      y: this.scale.height / 2 + 100,
    };
    const bed = this.add.image(200, 48, "bed", 0).setDisplaySize(128, 192);
    const sheet = this.add.image(200, 48, "bed", 1).setDisplaySize(128, 192);
    const pc = this.add.image(0, 0, "computer", 0).setDisplaySize(102, 102);
    this.player = this.add.sprite(0, 20, "player", 1).setDisplaySize(128, 128);
    this.player.hinge = async () => {
      if (this.player.higing) {
        return;
      }
      this.player.higing = true;
      if (!this.player.hinge_dir) {
        this.player.hinge_dir = 1;
      }

      this.player.setAngle(0);
      await tweenOnPromise(this, {
        targets: this.player,
        angle: 12 * this.player.hinge_dir,
        y: "-=5",
        yoyo: true,
        duration: 100,
      });
      this.player.higing = false;
      this.player.hinge_dir *= -1;
    };
    this.player.goToBed = async () => {
      if (this.player.walking) {
        return;
      }
      this.menu.hide();
      this.player.walking = true;
      this.player.setFrame(2);
      this.player.setFlipX(true);
      await tweenOnPromise(this, {
        targets: [pc, bed, sheet],
        x: "-=200",
        duration: 2200,
        onUpdate: () => {
          this.player.hinge();
        },
      });
      await Sleep(this);
      this.player.setFlipX(false);
      await tweenOnPromise(this, {
        targets: [pc, bed, sheet],
        x: "+=200",
        duration: 2200,
        onUpdate: () => {
          this.player.hinge();
        },
      });
      this.player.setFrame(1);
      this.player.walking = false;
      this.menu.show();
    };
    this.player.onAct = (_callback) => {
      this.player.__onAct = _callback;
      return () => {
        this.player.__onAct = null;
      };
    };
    this;
    let onPointerDown = () => {
      // SPEED UP
      this.input.once(
        "pointerup",
        () => {
          // SPEED DOWN

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
    const playerContainer = this.add.container(location.x, location.y, [
      pc,
      bed,
      this.player,
      sheet,
    ]);
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

    const btnDormir = new Button(this, minX, minY, "Dormir", 20).onClick(() => {
      this.player.goToBed();
    });
    const btneat = new Button(
      this,
      btnDormir.x + btnDormir.width / 2 + margin,
      minY,
      "    Comer"
    )

      .addIcon(this.add.sprite(0, 0, "icons", 27).setDisplaySize(32, 32))
      .onClick(() => {});
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

    this.menu = this.add.container(0, 0, [
      btnDormir.getContent(),
      btneat.getContent(),
      btnrelax.getContent(),
      btnfindjob.getContent(),
      btnlearn.getContent(),
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
      "$0",
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
        // offerView.applyBtn.setVisible(false);
        offerView.applyBtn.text.setText("Trabajar");
        offerView.rateText.setText("Maestria: " + offerView, rate + "%");
        offerView.onClick((job, mastery) => this._doJobWork(job, mastery));
        lastJobOfferList = [offerView];
      } else {
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
      }
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
                this.learningPanel.hide();
                learn(this, topic).then(() => {
                  this.updateInformation();
                });
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
  _todo() {
    var position = {
      x: this.scale.width - 40,
      y: 180,
    };
    var todoText = this.add
      .bitmapText(
        position.x / 2,
        position.y + 50,
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
    const btn = new Button(this, position.x, position.y, "   ").addIcon(
      btnIcon
    );
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
  }
  _initUI() {
    this._todo();
    this._initMenuUI();
    this._initCalendar();
    this._initLifeBar();
    this._initInfoViews();
    this._initPanelViews();
  }
  initClock() {
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
    jobInterview(this, job, successRate).then((success) => {
      STATE.ACTUAL_JOB = job;
      STATE.ACTUAL_JOB.progress = 0;
      STATE.save();
    });
    removeJobFromPool(job);
    // REMOVE JOB FROM POOL
  }
  _doJobWork(job, mastery) {
    this.workPanel.hide();
    workOnJob(this, job, mastery).then((finished) => {
      if (finished) {
        // GET PAID!
      }
    });
  }
  recoverHP() {
    if (STATE.HEALTH < 100) {
      STATE.HEALTH = Math.min(100, STATE.HEALTH + STATE.HEALT_RECOVER_RATE);
    }
    this.lifeBar.setValue(STATE.HEALTH);
  }
  spendHP() {
    STATE.HEALTH = Math.max(1, STATE.HEALTH - STATE.ACTION_COST);
    this.lifeBar.setValue(STATE.HEALTH);
  }
  updateInformation() {
    console.log("UPDATE INFORMATION", getSeniority());
    this.seniorityPanel.text.setText(getSeniority());
  }
  __everyTick() {
    addHour();
    this.calendar.update();
    this.recoverHP();
  }
}
