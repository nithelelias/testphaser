let storeMessage = [];
const debounceDelay = 300;
let lastTimeout = setTimeout(() => {}, 0);
export default function debounceMessage(char) {
  storeMessage.push(char);
  clearTimeout(lastTimeout);
  lastTimeout = setTimeout(() => {
    addMessage(storeMessage.join(""));
    storeMessage = [];
  }, debounceDelay);
}

const addMessage = (t) => {
  const message = new SpeechSynthesisUtterance(t); 
  speechSynthesis.speak(message);
};
