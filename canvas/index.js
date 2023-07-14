import FreeDraw from "./freeDraw.js";

let map;

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 6,
  });
}
function downImage() {
  const apiKey = "AIzaSyB7HbTNHf8S2CSZtABku7-tCWMAm0NWbJs";
  // Convierte el mapa en una imagen utilizando la API Static Maps de Google Maps
  var imageUrl =
    "https://maps.googleapis.com/maps/api/staticmap?center=" +
    map.center.lat() +
    "," +
    map.center.lng() +
    "&zoom=" +
    map.zoom +
    `&size=${innerWidth}x${innerHeight}` +
    "&key=" +
    apiKey;
  console.log(imageUrl)
  // Crea un elemento de enlace temporal para descargar la imagen
  var enlaceTemporal = document.createElement("a");
  enlaceTemporal.href = imageUrl;
  enlaceTemporal.download = "mapa.png";
  enlaceTemporal.target="_BLANK"
  enlaceTemporal.style.display = "none";
  document.body.appendChild(enlaceTemporal);

  // Simula un clic en el enlace temporal para iniciar la descarga
  enlaceTemporal.click();

  // Elimina el enlace temporal del DOM
  document.body.removeChild(enlaceTemporal);
}
function printTocanvas() {
  let imgList = document.querySelectorAll("img[role='presentation']");
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.style.zIndex = 100;
  canvas.style.backgroundColor = "cyan";

  document.body.appendChild(canvas);
  imgList.forEach((img) => {
    img.setAttribute("crossorigin", "anonymous");
  });
  setTimeout(() => {
    imgList.forEach((img) => {
      let position = img.getClientRects()[0];
      context.drawImage(img, position.x, position.y);
    });
  }, 100);

  FreeDraw(canvas);
  return {
    canvas,
    imgList,
    save: () => {
      var imgData = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream"); // here is the most important part because if you dont replace you will get a DOM 18 exception.
      var link = document.createElement("a");
      link.setAttribute("download", "mapa.png");
      link.setAttribute("href", imgData);

      link.click();
    },
  };
}
window.printTocanvas = printTocanvas;
window.initMap = initMap;
window.downImage = downImage;
