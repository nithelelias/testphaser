
export default function FreeDraw(canvas) {   
   const context = canvas.getContext('2d'); 
   context.strokeStyle = "#913d88";
   context.lineWidth = 2;
   var isDrawing=false;
   canvas.onmousedown = startDrawing;
   canvas.onmouseup = stopDrawing;
   canvas.onmousemove = draw;
   
   function startDrawing(e) {
      isDrawing = true;
      context.beginPath();
      context.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
   }
   
   function draw(e) {
      if (isDrawing == true) {
         var x = e.pageX - canvas.offsetLeft;
         var y = e.pageY - canvas.offsetTop;
      
         context.lineTo(x, y);
         context.stroke();
      }
   }
   
   function stopDrawing() {
      isDrawing = false;
   }
   
   /*var coord = document.getElementById("coord");
   canvas.onmousemove = function(e) {
      coord.value = e.pageX+" "+e.pageY+" / "+(e.pageX-canvas.offsetLeft)+" "+(e.pageY-canvas.offsetTop);
   }*/
}