export default function onEvent(eventName, callback) {
  this.on(eventName, callback);
  return () => {
    this.removeEvent(eventName, callback);
  };
}
