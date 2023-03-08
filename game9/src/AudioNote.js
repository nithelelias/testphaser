export const NOTES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "B",
];
const getPitchNote = (note, octave) => {
  var step = NOTES.indexOf(note);
  var power = Math.pow(2, (octave * 12 + step - 57) / 12);
  var pitch = 440 * power;
  return pitch;
};
export default function createAudioNote() {
  const context = new AudioContext();
  const fadeTime = 1;
  const types = {
    Sine: "sine",
    Square: "square",
    Triangle: "triangle",
    Sawtooth: "sawtooth",
  }; 

  /**
   *
   * @param {string} note 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'
   * @param {*} octave 0,1,2,3,4,5...
   * @param {*} type 'sine', 'square', 'triangle', 'sawtooth'
   */
  const play = (note = "C", octave = 1, type = types.Sine) => {
    const o = context.createOscillator();
    const g = context.createGain();
    o.connect(g);
    g.connect(context.destination);
    o.type = type;
    o.frequency.value = getPitchNote(note, octave);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(
      0.00001,
      context.currentTime + fadeTime
    );
  };
  return {
    play,
    types,
  };
}
