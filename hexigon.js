//IIFE function call
(function(){
    var canvas = document.getElementById('hexmap');
    var counter = document.getElementById('counter');

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        sideLength = 50,
        boardWidth = 5,
        boardHeight = 5,
        buffer =  10;

    var totalPiecesLeft;

    var NUMOFPLAYER = 4;

    var JUNGLECOLOR  = 'rgba(0, 100, 0, 255)'; 
    var GRASSCOLOR   = 'rgba(0, 225, 0, 255)'; 
    var DESERTCOLOR  = 'rgba(255, 201, 102, 255)';
    var QUARRYCOLOR  = 'rgba(123, 123, 139, 255)';
    var LAGOONCOLOR  = 'rgba(0, 191, 255, 255)';
    var VOLCANOCOLOR = 'rgba(255, 48, 48, 255)'; 

    var SubtileTypeEnum = {
        JUNGLE: 0,
        GRASS:  1,
        DESERT: 2,
        QUARRY: 3,
        LAGOON: 4,
        VOLCANO: 5,};

    var stack = new Array();

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;

    if (canvas.getContext){
        var ctx = canvas.getContext('2d');
        
        
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        //drawBoard(ctx, boardWidth, boardHeight);

        //drawBoardPiece(ctx, 0, 0);
        canvas.addEventListener('click', function(event) {
            if(stack.length - (48 - NUMOFPLAYER * 12) != 0) {
         
                var tempItem = stack.pop();
                counter.textContent=""+(stack.length - ( 48 - NUMOFPLAYER * 12));
                ctx.clearRect(0,0, canvas.width, canvas.height);
                drawBoardPiece(ctx, getColor(tempItem.left), getColor(tempItem.right));
            }
        }, false);

        initializePieces(ctx);


    }

    function getColor(outColor) {
        if(outColor == SubtileTypeEnum.JUNGLE) {
            return JUNGLECOLOR;
        }
        else if (outColor == SubtileTypeEnum.GRASS) {
            return GRASSCOLOR;
        }
        else if (outColor == SubtileTypeEnum.DESERT) {
            return DESERTCOLOR;
        }
        else if (outColor == SubtileTypeEnum.QUARRY) {
            return QUARRYCOLOR;
        }
        else if (outColor == SubtileTypeEnum.LAGOON) {
            return LAGOONCOLOR;
        }
        else {
            return VOLCANOCOLOR;
        }
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    function initializePieces(canvasContext) {
        var organizedPieces = new Array();
        var tileDistrabution = [
            [1, 6, 4, 2, 2],
            [5, 1, 2, 2, 1],
            [4, 2, 1, 2, 1],
            [2, 2, 1, 1, 1],
            [1, 1, 1, 1, 1]]
        // Create 
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 5; j++) {
                var x = tileDistrabution[i][j];
                    for(w = 0; w < x; w++) {
                        organizedPieces.push({right: i, left: j});
                    }
            }
        }
        shuffle(organizedPieces);
        stack = organizedPieces;

        var tempItem = stack.pop();
        counter.textContent=""+(stack.length - (48 - NUMOFPLAYER * 12));
        ctx.clearRect(0,0, canvas.width, canvas.height);
        drawBoardPiece(canvasContext, getColor(tempItem.left), getColor(tempItem.right));
        
    }


    function drawBoardPiece(canvasContext, left, right) {
        drawHexagon(canvasContext, hexRectangleWidth, 1, true, VOLCANOCOLOR);
        drawHexagon(canvasContext, hexRectangleWidth - hexRadius, sideLength + hexHeight, true, left);
        drawHexagon(canvasContext, hexRectangleWidth + hexRadius, sideLength + hexHeight, true, right);
        canvasContext.beginPath();
        canvas_arrow(canvasContext, hexRectangleWidth * 1.5, hexRectangleWidth/ 2,  hexRectangleWidth + hexRadius * 1.45,  sideLength + hexHeight);
        canvasContext.stroke();
        canvasContext.closePath();
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

    function canvas_arrow(context, fromx, fromy, tox, toy){
        var headlen = 10;   // length of head in pixels
        var angle = Math.atan2(toy-fromy,tox-fromx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        context.moveTo(tox, toy);
        context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    }

    function drawHexagon(canvasContext, x, y, fill, FILLCOLOR) {           
        var fill = fill || false;

        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

        if(fill) {
            canvasContext.shadowOffsetX=4;
            canvasContext.shadowOffsetY=4;
            canvasContext.shadowColor='black';
            canvasContext.shadowBlur=4;
            canvasContext.stroke();
            canvasContext.fillStyle=FILLCOLOR;
            canvasContext.fill();
        } else {
            canvasContext.stroke();
        }
    }

})();