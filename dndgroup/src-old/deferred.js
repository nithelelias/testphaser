export default function Deffered() {
  this.promise = new Promise((resolve) => {
    this.resolve = resolve;
  });
}
