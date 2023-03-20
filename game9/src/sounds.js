const SOUNDS = {};

export function initSounds() {
  (SOUNDS.step = this.sound.add("step", { loop: false, volume: 0.2, rate: 2 })),
    (SOUNDS.step2 = this.sound.add("step", { loop: false, volume: 0.1 })),
    (SOUNDS.typing = this.sound.add("typing", { loop: false, volume: 0.5 })),
    (SOUNDS.tap = this.sound.add("tap", { loop: false, volume: 0.3, rate: 3 })),
    (SOUNDS.click = this.sound.add("click", {
      loop: false,
      volume: 0.3,
      rate: 1,
    })),
    (SOUNDS.money = this.sound.add("money", {
      loop: false,
      volume: 0.3,
      rate: 1,
    })),
    (SOUNDS.melody1 = this.sound.add("melody1", { loop: true, volume: 0.01 })),
    (SOUNDS.moneyCome = this.sound.add("money-come", {
      loop: false,
      volume: 0.3,
      rate: 1,
    })),
    SOUNDS.typing.addMarker({ name: "key1", start: 2.3, duration: 0.2 });
  SOUNDS.typing.addMarker({ name: "key2", start: 2.5, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key3", start: 2.6, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key4", start: 2.7, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key5", start: 2.8, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key6", start: 2.9, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key7", start: 3.0, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key8", start: 3.1, duration: 0.1 });
  SOUNDS.typing.addMarker({ name: "key9", start: 3.2, duration: 0.1 });
  SOUNDS.typing.addMarker({
    name: "key10",
    start: 3.3,
    duration: 0.1,
  });
  SOUNDS.typing.addMarker({
    name: "key11",
    start: 3.4,
    duration: 0.1,
  });

  SOUNDS.tap.addMarker({
    name: "t1",
    start: 0,
    duration: 0.4,
  });
  SOUNDS.tap.addMarker({
    name: "t2",
    start: 0.4,
    duration: 0.3,
  });
  SOUNDS.tap.addMarker({
    name: "t3",
    start: 0.7,
    duration: 0.3,
  });

  SOUNDS.coffee_preparation = this.sound.add("coffee_preparation", {
    loop: false,
    volume: 0.2,
  });
  SOUNDS.coffee_pour = this.sound.add("coffee_pour", {
    loop: false,
    volume: 0.2,
  });
}
export default SOUNDS;
