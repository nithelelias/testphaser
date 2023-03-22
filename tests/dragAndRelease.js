function DragAndRelase(element) {
  let tmpCLick = element.onclick;
  var dragged = false;
  element.onclick = (evt) => {
    console.log("just clicked but was dragged?", dragged);
    evt.preventDefault();
    return false
  };
  // Variables para almacenar la posición inicial del elemento y las coordenadas de inicio del arrastre
  var posInicialX, posInicialY, coordenadasInicioArrastre;

  const onmove = (evt) => {
    var coordenadasActuales = evt.touches ? evt.touches[0] : evt;
    var distanciaX =
      coordenadasActuales.clientX - coordenadasInicioArrastre.clientX;
    var distanciaY =
      coordenadasActuales.clientY - coordenadasInicioArrastre.clientY;
    element.style.left = posInicialX + distanciaX + "px";
    element.style.top = posInicialY + distanciaY + "px";
    evt.preventDefault();
    limitar();
    dragged = true;
  };
  const ondown = (evt) => {
    dragged = false;
    posInicialX = element.offsetLeft;
    posInicialY = element.offsetTop;
    coordenadasInicioArrastre = evt.touches ? evt.touches[0] : evt;
    evt.preventDefault();
    element.addEventListener("mousemove", onmove, true);
    element.addEventListener("touchmove", onmove, true);
    window.document.addEventListener("mouseup", onrelease, true);
    window.document.addEventListener("touchend", onrelease, true);
  };
  const onrelease = (evt) => {
    element.removeEventListener("mousemove", onmove, true);
    element.removeEventListener("touchmove", onmove, true);
    window.document.removeEventListener("mouseup", onrelease, false);
    window.document.removeEventListener("touchend", onrelease, false);
    evt.preventDefault();
    return false;
  };
  const limitar = () => {
    let x = parseFloat(element.style.left),
      y = parseFloat(element.style.top);

    x = Math.max(0, Math.min(window.innerWidth - 60, x));
    y = Math.max(0, Math.min(window.innerHeight - 60, y));
    element.style.left = x + "px";
    element.style.top = y + "px";
  };

  element.addEventListener("mousedown", ondown, true);
  element.addEventListener("touchstart", ondown, true);
}
