export default function imageMask(
  backgroundImage,
  mask,
  { width = 10, height = 10, x = 0, y = 0 }
) {
  const imagecanvas = document.createElement("canvas");
  const imagecontext = imagecanvas.getContext("2d");

  return new Promise((resolve) => {
    var newImg = document.createElement("img");
    newImg.src = backgroundImage;
    newImg.onload = function () {
      imagecanvas.width = mask.width;
      imagecanvas.height = mask.height;

      var newmask = document.createElement("img");
      newmask.src = mask.src;
      newmask.onload = function () {
        imagecontext.drawImage(mask, 0, 0, mask.width, mask.height);
        imagecontext.globalCompositeOperation = "source-in";
        imagecontext.drawImage(newImg, -x, -y, width, height);

        resolve(imagecanvas.toDataURL());
        imagecanvas.remove();
      };
    };
  });
}
