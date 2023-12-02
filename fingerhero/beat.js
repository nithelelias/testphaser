const default_options = {
  filterFrequency: 100,
  peakGain: 15,
  threshold: 0.8,
  sampleSkip: 350,
  minAnimationTime: 0.4,
};
export default class BeatBeat {
  isPlaying = false;

  /**
   * offlineContext!: OfflineAudioContext
   */
  offlineContext;
  /**
   *  buffer!: AudioBuffer
   */
  buffer;

  channels = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  constructor(
    context, // AudioContext
    name,
    options = default_options
  ) {
    let _options = { ...default_options, ...options };
    for (let prop in _options) {
      this[prop] = _options[prop];
    }
    this.context = context;
    this.name = name;
  }

  load() {
    return new Promise(async (resolve) => {
      const resp = await fetch(this.name);
      const file = await resp.arrayBuffer();
      this.context.decodeAudioData(file, async (buffer) => {
        this.buffer = buffer;
        await this.analyze();
        resolve();
      });
    });
  }

  play() {
    this.isPlaying = true;
    let pausedAt = 0;
    let source;
    let _play = () => {
      source = this.context.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.context.destination);
      console.log(pausedAt);
      source.start(0, pausedAt);
    };
    _play();
    return {
      source,
      play: _play,
      pause: () => {
        source.stop(0);
        pausedAt = source.context.currentTime;
      },
    };
  }

  async analyze() {
    await this.analyzeFilter(0);
    await this.analyzeFilter(1);
    await this.analyzeFilter(2);
    await this.analyzeFilter(3);
  }

  async analyzeFilter(channelIdx) {
    const offlineContext = new OfflineAudioContext(
      1,
      this.buffer.length,
      this.buffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = this.buffer;
    if (channelIdx === 0) {
      this.getLowFilter(source, offlineContext);
    }

    if (channelIdx === 1) {
      this.getMidLowFilter(source, offlineContext);
    }
    if (channelIdx === 2) {
      this.getHighFilter(source, offlineContext);
    }
    if (channelIdx === 3) {
      this.getMidHighFilter(source, offlineContext);
    }

    source.start();
    const buffer = await offlineContext.startRendering();

    const data = buffer.getChannelData(0);
    console.log(buffer)
    let songData = [];
    for (let i = 0; i < data.length; ++i) {
      if (data[i] > this.threshold) {
        const time = i / buffer.sampleRate;
        const previousTime = songData.length
          ? songData[songData.length - 1].time
          : 0;
        if (time - previousTime > this.minAnimationTime) {
          songData.push({
            data: data[i],
            time,
          });
        }
      }
      i += this.sampleSkip;
    }
    this.channels[channelIdx] = songData;
  }
  getLowFilter(source, offlineContext) {
    const filter = offlineContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    const filter2 = offlineContext.createBiquadFilter();
    filter2.type = "peaking";
    filter2.frequency.value = 1000;
    filter2.Q.value = 1;
    filter2.gain.value = this.peakGain;

    source.connect(filter2);
    filter2.connect(filter);
    filter.connect(offlineContext.destination);
  }
  getMidLowFilter(source, offlineContext) {
    const filter = offlineContext.createBiquadFilter();
    filter.type = "allpass";
    filter.gain.value = 0;

    const filterhigh = offlineContext.createBiquadFilter();
    filterhigh.type = "highpass";
    filterhigh.frequency.value = 440;
    filterhigh.Q.value = 0;

    const filter2 = offlineContext.createBiquadFilter();
    filter2.type = "peaking";
    filter2.frequency.value = 720;
    filter2.Q.value = 1;
    filter2.gain.value = this.peakGain;

    source.connect(filterhigh);
    filterhigh.connect(filter2)
    filter2.connect(filter);
    filter.connect(offlineContext.destination);
  }
  getMidHighFilter(source, offlineContext) {
    const filter = offlineContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 440;
    filter.Q.value = 0;

    const filter2 = offlineContext.createBiquadFilter();
    filter2.type = "peaking";
    filter2.frequency.value = 320;
    filter2.Q.value = 1;
    filter2.gain.value = this.peakGain;

    source.connect(filter2);
    filter2.connect(filter);
    filter.connect(offlineContext.destination);
  }
  getHighFilter(source, offlineContext) {
    const filter = offlineContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 100;
    filter.Q.value = 1;

    const filter2 = offlineContext.createBiquadFilter();
    filter2.type = "peaking";
    filter2.frequency.value = 100;
    filter2.Q.value = 1;
    filter2.gain.value = this.peakGain;

    source.connect(filter2);
    filter2.connect(filter);
    filter.connect(offlineContext.destination);
  }
}
