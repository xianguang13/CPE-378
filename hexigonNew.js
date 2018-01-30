//IIFE function call
(function(){
    var canvas = document.getElementById('hexmap');

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        sideLength = 50,
        boardWidth = 1,
        boardHeight = 1,
        buffer = 10,
        numberOfSides = 6;

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;

    if (canvas.getContext){
        var ctx = canvas.getContext('2d');
        var gradient=ctx.createLinearGradient(0,0,170,0);
        gradient.addColorStop("0","magenta");
        gradient.addColorStop("0.5","blue");
        gradient.addColorStop("1.0","red");
        
        ctx.fillStyle = "black";
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;

        drawBoard(ctx, boardWidth, boardHeight);
    }

    function drawBoard(canvasContext, width, height) {
        var i, j;

        for(i = 0; i < width; i++) {
            for(j = 0; j < height; j++) {
                drawHexagon(ctx, 
                    i * hexRectangleWidth + ((j % 2) * hexRadius) + buffer, 
                    j * (sideLength + hexHeight) + buffer, 
                    false
                );
            }
        }
    }

    function drawHexagon(canvasContext, x, y, fill) {           
        var fill = fill || false;

        canvasContext.beginPath();
        canvasContext.moveTo(x + sideLength * Math.cos(0), y + size * Math.sine(0));

        for (var i = 1; i <= numberOfSides; i++) {
       		canvasContext.moveTo(x, + sideLength * Math.cos(i * 2 * Math.PI / numberOfSides),
        		y + size * Math.sin(i * 2 * Math.PI / numberOfSides)
        	);
    	}

    	canvasContext.closePath();

        if(fill) {
            canvasContext.fill();
        } else {
            canvasContext.stroke();
        }
    }

})();