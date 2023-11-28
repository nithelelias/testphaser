console.log("hola mundo");

const div = document.createElement("div");
div.style.width = "100px";
div.style.height = "100px";
div.style.border = "solid red";
div.style.position="fixed"
div.x = 0;
div.y = 0;
div.update = () => {
  let css = `translate(${div.x}px,${div.y}px)`;
  div.innerHTML=css
  div.style.transform=css
};
document.body.appendChild(div);

window.player = div;
function loop() {
  div.update();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
