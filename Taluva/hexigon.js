//IIFE function call
(function(){
	window.addEventListener("load", windowLoadHandler, false);
	
	function windowLoadHandler() {
		canvasApp();
	}
	
	function canvasSupport() {
		return Modernizr.canvas;
	}
	
	function canvasApp() {
		if(!canvasSupport()) {
			return;
		}
		
		var canvas = document.getElementById('hexmap');

		//Hexagon Values
		var hexHeight,
			hexRadius,
			hexRectangleHeight,
			hexRectangleWidth,
			hexagonAngle = 0.523598776, // 30 degrees in radians
			sideLength = 50,
			boardWidth, 
			boardHeight,
			buffer =  10;

		var NUMOFPLAYER = 4;

		var JUNGLECOLOR  = 'rgba(0, 100, 0, 255)'; 
		var GRASSCOLOR   = 'rgba(0, 225, 0, 255)'; 
		var DESERTCOLOR  = 'rgba(255, 201, 102, 255)';
		var QUARRYCOLOR  = 'rgba(123, 123, 139, 255)';
		var LAGOONCOLOR  = 'rgba(0, 191, 255, 255)';
		var VOLCANOCOLOR = 'rgba(255, 48, 48, 255)'; 

		var PlayerStateEnum = {
			PLACETILES: 0,
			PLACEBUILDING: 1,
		};

		var GameStateEnum = {
			INIT: 0,
			PLAYER1: 1,
			PLAYER2: 2,
		};

		var ArrowDirectionEnum = {
			NONE: 0,
			RIGHT: 1,
			BOTRIGHT: 2,
			BOTLEFT: 3,
			LEFT: 4,
			TOPLEFT: 5,
			TOPRIGHT: 6,
		};

		var ArrowPositionEnum = {
			TOPLEFT: 0,
			TOPRIGHT: 1,
			MIDDLE: 2,
			BOTLEFT: 3,
			BOTRIGHT: 4,
		};

		var SubtileTypeEnum = {
			JUNGLE: 0,
			GRASS:  1,
			DESERT: 2,
			QUARRY: 3,
			LAGOON: 4,
			VOLCANO: 5,};

		var stack = new Array();
		var hexagons = initalizeArray(25, 25);
		var dragging;
		var mouseX;
		var mouseY;
		var dragHoldX;
		var dragHoldY;
		var currentPiece;
		var lastSpot;
		var validPlacement = false;
		var flipped = false;
		var gameState = GameStateEnum.INIT;
		var validLevelUp = true;
		var playerState = PlayerStateEnum.PLACETILES;
		hexHeight = Math.sin(hexagonAngle) * sideLength;
		hexRadius = Math.cos(hexagonAngle) * sideLength;
		hexRectangleHeight = sideLength + 2 * hexHeight;
		hexRectangleWidth = 2 * hexRadius;
		boardWidth = Math.floor(canvas.width /(hexRadius * 2));
		boardHeight = Math.floor(canvas.height /(hexRadius * 2));

		if (canvas.getContext){
			var ctx = canvas.getContext('2d');
			
		
			ctx.fillStyle = "red";
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
		
			initializePieces(ctx);
			getPiece(ctx);

			canvas.addEventListener("mousedown", mouseDownListener, false);

		}

		function initalizeArray(d1, d2) {
			var arr = [];
    		for(i = 0; i < d2; i++) {
        		arr.push(new Array(d1));
    		}
    		return arr;
		}
		
		function mouseDownListener(evt) {
			//getting mouse position correctly, being mindful of resizing that may have occured in the browser:
			var bRect = canvas.getBoundingClientRect();
			mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
			mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

			if(playerState == PlayerStateEnum.PLACETILES) {
				functionPlaceItem();
			}
			
			if (dragging) {
				window.addEventListener("mousemove", mouseMoveListener, false);
			}
			window.addEventListener("mouseup", mouseUpListener, false);
		
			//code below prevents the mouse down from having an effect on the main browser window:
			if (evt.preventDefault) {
				evt.preventDefault();
			} //standard
			else if (evt.returnValue) {
				evt.returnValue = false;
			} //older IE
			return false;
		}
		
		function mouseUpListener(evt) {
			canvas.addEventListener("mousedown", mouseDownListener, false);
			window.addEventListener("keydown", keyDownListener, false);
		}

		function keyDownListener(evt) {
			var code = evt.keyCode;
			var temp = currentPiece.arrowDir;
			//Rotated
			if(code == 82) {
				if(currentPiece.arrowDir == ArrowDirectionEnum.BOTRIGHT) {
					temp = ArrowDirectionEnum.TOPRIGHT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.TOPRIGHT) {
					temp = ArrowDirectionEnum.LEFT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.LEFT) {
					temp = ArrowDirectionEnum.BOTRIGHT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.TOPLEFT) {
					temp = ArrowDirectionEnum.BOTLEFT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.BOTLEFT) {
					temp = ArrowDirectionEnum.RIGHT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.RIGHT) {
					temp = ArrowDirectionEnum.TOPLEFT
				}
				currentPiece = {colorT:currentPiece.colorR, colorL:currentPiece.colorT, colorR:currentPiece.colorL, x: currentPiece.x, y:currentPiece.y, arrowDir:temp};
			}
			else if(code == 70) {
				if(currentPiece.arrowDir == ArrowDirectionEnum.BOTRIGHT) {
					currentPiece.arrowDir = ArrowDirectionEnum.TOPLEFT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.TOPLEFT) {
					currentPiece.arrowDir = ArrowDirectionEnum.BOTRIGHT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.LEFT) {
					currentPiece.arrowDir = ArrowDirectionEnum.RIGHT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.RIGHT) {
					currentPiece.arrowDir = ArrowDirectionEnum.LEFT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.BOTLEFT) {
					currentPiece.arrowDir = ArrowDirectionEnum.TOPRIGHT;
				}
				else if(currentPiece.arrowDir == ArrowDirectionEnum.TOPRIGHT) {
					currentPiece.arrowDir = ArrowDirectionEnum.BOTLEFT;
				}
				flipped = !flipped;
			}
		}
		
		function mouseMoveListener(evt) {
			var x,
                y,
                hexX,
                hexY,
                screenX,
                screenY;
			var posX;
			var posY;
			var shapeRad = hexRadius;
			var minX = shapeRad;
			var maxX = canvas.width - shapeRad;
			var minY = shapeRad;
			var maxY = canvas.height - shapeRad;

			x = evt.offsetX || evt.layerX;
            y = evt.offsetY || evt.layerY;

            hexY = Math.floor(y / (hexHeight + sideLength));
            hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

            screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
            screenY = hexY * (hexHeight + sideLength);
			
			//getting mouse position correctly 
			var bRect = canvas.getBoundingClientRect();
			mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
			mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
		
			//clamp x and y positions to prevent object from dragging outside of canvas
			posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
			posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

			// Check if the mouse's coords are on the board
            if(hexX >= 0 && hexX < boardWidth) {
                if(hexY >= 0 && hexY < boardHeight) {
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(0,0,canvas.width,canvas.height);

            		drawBoard(ctx, boardWidth, boardHeight);
            		if(playerState == PlayerStateEnum.PLACETILES) {
                    	drawBoardPiece(ctx, currentPiece.colorT, currentPiece.colorL, currentPiece.colorR, screenX - 2 * hexRadius,  screenY, currentPiece.arrowDir);
                    }
                    checkValidPlacement();

                    lastSpot = {x: hexX, y: hexY};
                }
            }
		}

		function changeState() {
			if(gameState == GameStateEnum.INIT) {
				gameState = GameStateEnum.PLAYER2;
			}
			else if(gameState == GameStateEnum.PLAYER2) {
				gameState = GameStateEnum.PLAYER1;
			}
			else if(gameState == GameStateEnum.PLAYER1) {
				gameState = GameStateEnum.PLAYER2;
			}
		}

		function checkValidPlacement() {
			if (gameState == GameStateEnum.INIT) {
				validPlacement = true;
			}
			else if(!flipped && (checkNeighbors(lastSpot.x, lastSpot.y) || checkNeighbors(lastSpot.x - (lastSpot.y + 1) % 2, lastSpot.y + 1) || checkNeighbors(lastSpot.x + (lastSpot.y) % 2, lastSpot.y + 1))) {
				validPlacement = true;
			}
			else if(flipped && (checkNeighbors(lastSpot.x, lastSpot.y) || checkNeighbors(lastSpot.x - (lastSpot.y + 1) % 2, lastSpot.y - 1) || checkNeighbors(lastSpot.x + (lastSpot.y) % 2, lastSpot.y - 1))) {
				validPlacement = true;
			}
			else {
				validPlacement = false;
			}
		}

		function checkNeighbors(spotx, spoty) {
			if((spotx - 1 < 0 || spoty - 1 < 0)) {
				return false;
			}

			else if((spoty % 2 == 0) && (
				hexagons[spotx - 1][spoty - 1] != undefined ||
				hexagons[spotx][spoty - 1] != undefined ||
				hexagons[spotx][spoty + 1] != undefined ||
				hexagons[spotx - 1][spoty] != undefined ||
				hexagons[spotx + 1][spoty] != undefined ||
				hexagons[spotx - 1][spoty + 1] != undefined ||
				hexagons[spotx][spoty] != undefined
				)) {
				return true;
			}
			else if((spoty % 2 == 1) && (
				hexagons[spotx + 1][spoty - 1] != undefined ||
				hexagons[spotx][spoty - 1] != undefined ||
				hexagons[spotx][spoty + 1] != undefined ||
				hexagons[spotx - 1][spoty] != undefined ||
				hexagons[spotx + 1][spoty] != undefined ||
				hexagons[spotx + 1][spoty + 1] != undefined ||
				hexagons[spotx][spoty] != undefined
			)) {
				return true;
			}
			else {
				return false;
			}
		}
		
		function hitTest(mx,my) {
			var dx;
			var dy;
			dx = mx - hexRadius * 3 - 20;
			dy = my - hexHeight * 2 - 170;
		
			//a "hit" will be registered if the distance away from the center is less than the radius of the circular object		
			if (dx*dx + dy*dy < hexRadius * hexRadius) {
				return true;
			}
			else {
				return false;
			}
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
		
		
		function getPiece(canvasContext) {
			var tempItem = stack.pop();
			var colorTop = VOLCANOCOLOR;
			var colorLeft = getColor(tempItem.left);
			var colorRight = getColor(tempItem.right)
			var currentDir = ArrowDirectionEnum.BOTRIGHT;
			draw_background();
			flipped = false;
			draw_counter(canvasContext);
			drawBoardPiece(canvasContext, colorTop, colorLeft, getColor(tempItem.right), 20, 170, ArrowDirectionEnum.BOTRIGHT);
			currentPiece = {colorT:colorTop, colorL:colorLeft, colorR:colorRight, x: 20, y:170, arrowDir:currentDir}
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
		}


		function drawBoardPiece(canvasContext, top, left, right, x, y, arrowDir) {
			if(!flipped) {
				drawHexagon(canvasContext, x + hexRectangleWidth + 5, y + 1 + 5, true, top, arrowDir);
				drawHexagon(canvasContext, x + hexRectangleWidth - hexRadius + 5, y + sideLength + hexHeight + 5, true, left, arrowDir);
				drawHexagon(canvasContext, x + hexRectangleWidth + hexRadius + 5, y + sideLength + hexHeight + 5, true, right, arrowDir);
			}
			else {
				drawHexagon(canvasContext, x + hexRectangleWidth - hexRadius + 5, y - sideLength - hexHeight , true, right, arrowDir);
				drawHexagon(canvasContext, x + hexRectangleWidth + hexRadius + 5, y - sideLength - hexHeight , true, left, arrowDir);	
				drawHexagon(canvasContext, x + hexRectangleWidth + 5, y + 1, true, top, arrowDir);
			}
		}


		function drawBoard(canvasContext, width, height) {
			var i, j;

			for(i = 0; i < width; i++) {
				for(j = 0; j < height; j++) {
					if(hexagons[i][j] != undefined && hexagons[i][j].position != undefined) {
						drawHexagon(ctx, 
						i * hexRectangleWidth + ((j % 2) * hexRadius) + buffer, 
						j * (sideLength + hexHeight) + buffer, 
						true, 
						hexagons[i][j].color,
						hexagons[i][j].position,
						hexagons[i][j].level);
					}
					else {
						canvasContext.shadowOffsetX=0;
						canvasContext.shadowOffsetY=0;
						canvasContext.shadowColor='black';
						canvasContext.shadowBlur=0;
						canvasContext.font = "30px Arial";
						canvasContext.fillStyle = "black";
						drawHexagon(ctx, 
							i * hexRectangleWidth + ((j % 2) * hexRadius) + buffer, 
							j * (sideLength + hexHeight) + buffer, 
							false
						);
					}
				}
			}
		}

		function canvas_arrow(context, fromx, fromy, tox, toy, rotate){
			var headlen = 10;   // length of head in pixels
			var angle = Math.atan2(toy-fromy,tox-fromx);
			context.moveTo(fromx, fromy);
			context.lineTo(tox, toy);
			context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
			context.moveTo(tox, toy);
			context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
			
		}

		function drawHexagon(canvasContext, x, y, fill, FILLCOLOR, arrow, level, huts) {           
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
				if(!validPlacement) {
					canvasContext.strokeStyle='red';
				}
				else {
					canvasContext.strokeStyle='black';
				}
				canvasContext.shadowOffsetX=4;
				canvasContext.shadowOffsetY=4;
				canvasContext.shadowColor='black';
				canvasContext.shadowBlur=4;
				canvasContext.stroke();
				canvasContext.fillStyle=FILLCOLOR;
				canvasContext.fill();
				if(level) {
					draw_level(canvasContext, x + hexRadius, y + hexHeight, level);
				}

			} else {
				canvasContext.stroke();
			}
			
			if(arrow == ArrowDirectionEnum.BOTRIGHT && FILLCOLOR == VOLCANOCOLOR) {
				canvasContext.beginPath();
				canvasContext.moveTo(x + hexRadius,y + hexHeight * 2);
				canvasContext.lineTo(x + (45 * Math.cos(Math.PI * .323)) + hexRadius, y + (45 * Math.sin(Math.PI * .323)) + hexHeight * 2);
				canvasContext.stroke();
				canvasContext.closePath();
			}
			else if(arrow == ArrowDirectionEnum.TOPLEFT && FILLCOLOR == VOLCANOCOLOR) {
				canvasContext.beginPath();
				canvasContext.moveTo(x + hexRadius,y + hexHeight * 2);
				canvasContext.lineTo(x + (-45 * Math.cos(Math.PI * .323)) + hexRadius, y + (-45 * Math.sin(Math.PI * .323)) + hexHeight * 2);
				canvasContext.stroke();
				canvasContext.closePath();
			}
		    else if(arrow == ArrowDirectionEnum.BOTLEFT && FILLCOLOR == VOLCANOCOLOR) {
				canvasContext.beginPath();
				canvasContext.moveTo(x + hexRadius,y + hexHeight * 2);
				canvasContext.lineTo(x + (45 * Math.cos(Math.PI * .65)) + hexRadius, y + (45 * Math.sin(Math.PI * .65)) + hexHeight * 2);
				canvasContext.stroke();
				canvasContext.closePath();
		    }
		    else if(arrow == ArrowDirectionEnum.TOPRIGHT && FILLCOLOR == VOLCANOCOLOR) {
				canvasContext.beginPath();
				canvasContext.moveTo(x + hexRadius,y + hexHeight * 2);
				canvasContext.lineTo(x + (-45 * Math.cos(Math.PI * .65)) + hexRadius, y + (-45 * Math.sin(Math.PI * .65)) + hexHeight * 2);
				canvasContext.stroke();
				canvasContext.closePath();
		    }
		    else if(arrow == ArrowDirectionEnum.LEFT && FILLCOLOR == VOLCANOCOLOR) {
				canvasContext.beginPath();
				canvasContext.moveTo(x + hexRadius,y + hexHeight * 2);
				canvasContext.lineTo(x + (45 * Math.cos(Math.PI)) + hexRadius, y + (45 * Math.sin(Math.PI)) + hexHeight * 2);
				canvasContext.stroke();
				canvasContext.closePath();
		    }
		    else if(arrow == ArrowDirectionEnum.RIGHT && FILLCOLOR == VOLCANOCOLOR) {
				canvasContext.beginPath();
				canvasContext.moveTo(x + hexRadius,y + hexHeight * 2);
				canvasContext.lineTo(x + (-45 * Math.cos(Math.PI)) + hexRadius, y + (-45 * Math.sin(Math.PI)) + hexHeight * 2);
				canvasContext.stroke();
				canvasContext.closePath();
		    }
		}
		
		function draw_background() {
			ctx.shadowOffsetX=4;
			ctx.shadowOffsetY=4;
			ctx.shadowColor='black';
			ctx.shadowBlur=4;
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = "#BDB76B";
			ctx.fillRect(0,0,320,canvas.height);
		}

		function draw_counter(canvasContext) {
			canvasContext.shadowOffsetX=0;
			canvasContext.shadowOffsetY=0;
			canvasContext.shadowColor='black';
			canvasContext.shadowBlur=0;
			canvasContext.font = "30px Arial";
			canvasContext.fillStyle = "black";
			if(gameState == GameStateEnum.INIT) {
				canvasContext.fillText("Player 1", 100, 50);
			}
			else if(gameState == GameStateEnum.PLAYER2) {
				canvasContext.fillText("Player 2", 100, 50);
			}
			else if(gameState == GameStateEnum.PLAYER1) {
				canvasContext.fillText("Player 1", 100, 50);
			}
			canvasContext.fillText("Remainder " + (stack.length - (48 - NUMOFPLAYER * 12)),70,100);
		}

		function draw_level(canvasContext, x, y, level) {
			canvasContext.shadowOffsetX=0;
			canvasContext.shadowOffsetY=0;
			canvasContext.shadowColor='black';
			canvasContext.shadowBlur=0;
			canvasContext.font = "12px Arial";
			canvasContext.fillStyle = "black";
			canvasContext.fillText("L" + level, x - 5, y + 3);
		}

		function checkValidPlacementForLevel() {
			var allowed = false;

			if(!flipped) {
				var hex1 = hexagons[lastSpot.x][lastSpot.y];
				var hex2 = hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y + 1];
				var hex3 = hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y + 1];
			}
			else if(flipped) {
				var hex1 = hexagons[lastSpot.x][lastSpot.y];
				var hex2 = hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y - 1];
				var hex3 = hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y - 1];
			}

			if(hex1.level != hex2.level || hex2.level != hex3.level || hex3.level != hex1.level) {
				window.alert("Can Only Errupt Tiles Only If all Tiles are Same Level!");
				return false;
			}

			if(hex1.color == VOLCANOCOLOR && (currentPiece.arrowDir != hex1.position)) {
				if(currentPiece.colorT == VOLCANOCOLOR) {
					allowed = true;
				}
			}
			else if(hex2.color == VOLCANOCOLOR && (currentPiece.arrowDir != hex1.position)) {
				if(!flipped && currentPiece.colorL == VOLCANOCOLOR) {
					allowed = true;
				}
				else if(flipped && currentPiece.colorR == VOLCANOCOLOR) {
					allowed = true;
				}
			}
			else if(hex3.color == VOLCANOCOLOR && (currentPiece.arrowDir != hex1.position)) {
				if(!flipped && currentPiece.colorR == VOLCANOCOLOR) {
					allowed = true;
				}
				else if(flipped && currentPiece.colorL == VOLCANOCOLOR) {
					allowed = true;
				}
			}

			return allowed;
		}

		function functionPlaceItem() {

			checkValidPlacement();

			//Place Tile On Board
			if(dragging && validPlacement && !flipped) {
				if(hexagons[lastSpot.x][lastSpot.y] == undefined
					&& hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y + 1] == undefined
					&& hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y + 1] == undefined) {
					hexagons[lastSpot.x][lastSpot.y] = {color:currentPiece.colorT, position:currentPiece.arrowDir, level:1}
					hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y + 1] = {color:currentPiece.colorL, position:currentPiece.arrowDir, level:1};
					hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y + 1] = {color:currentPiece.colorR, position:currentPiece.arrowDir, level:1};
					dragging = false;
					window.removeEventListener("mousemove", mouseMoveListener, false);

					changeState();
					if(stack.length - (48 - NUMOFPLAYER * 12) != 0) {
						getPiece(ctx);

					}
				}
				else if (hexagons[lastSpot.x][lastSpot.y] != undefined
					&& hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y + 1] != undefined
					&& hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y + 1] != undefined
					&& checkValidPlacementForLevel()){
						hexagons[lastSpot.x][lastSpot.y] = {color:currentPiece.colorT, position:currentPiece.arrowDir, level:(hexagons[lastSpot.x][lastSpot.y].level + 1)}
						hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y + 1] = {color:currentPiece.colorL, position:currentPiece.arrowDir, level:(hexagons[lastSpot.x][lastSpot.y].level)};
						hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y + 1] = {color:currentPiece.colorR, position:currentPiece.arrowDir, level:(hexagons[lastSpot.x][lastSpot.y].level)};
						dragging = false;
						window.removeEventListener("mousemove", mouseMoveListener, false);

						changeState();
						if(stack.length - (48 - NUMOFPLAYER * 12) != 0) {
							getPiece(ctx);

						}
				}
				else {
					window.alert("Invalid Tile Placement!");
				}
			}

			//Place Tile On Board
			else if(dragging && validPlacement && flipped) {
				if(hexagons[lastSpot.x][lastSpot.y] == undefined
					&& hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y - 1] == undefined
					&& hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y - 1] == undefined) {
					hexagons[lastSpot.x][lastSpot.y] = {color:currentPiece.colorT, position:currentPiece.arrowDir, level:1};
					hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y - 1] = {color:currentPiece.colorR, position:currentPiece.arrowDir, level:1};
					hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y - 1] = {color:currentPiece.colorL, position:currentPiece.arrowDir, level:1};
					dragging = false;
					window.removeEventListener("mousemove", mouseMoveListener, false);
					changeState();
					if(stack.length - (48 - NUMOFPLAYER * 12) != 0) {
						getPiece(ctx);
					}
				}
				else if(hexagons[lastSpot.x][lastSpot.y] != undefined
					&& hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y - 1] != undefined
					&& hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y - 1] != undefined
					&& checkValidPlacementForLevel()) {
						hexagons[lastSpot.x][lastSpot.y] = {color:currentPiece.colorT, position:currentPiece.arrowDir, level:(hexagons[lastSpot.x][lastSpot.y].level + 1)};
						hexagons[lastSpot.x - (lastSpot.y + 1) % 2][lastSpot.y - 1] = {color:currentPiece.colorR, position:currentPiece.arrowDir, level:(hexagons[lastSpot.x][lastSpot.y].level)};
						hexagons[lastSpot.x + (lastSpot.y) % 2][lastSpot.y - 1] = {color:currentPiece.colorL, position:currentPiece.arrowDir, level:(hexagons[lastSpot.x][lastSpot.y].level)};
						dragging = false;
						window.removeEventListener("mousemove", mouseMoveListener, false);
						changeState();
						if(stack.length - (48 - NUMOFPLAYER * 12) != 0) {
							getPiece(ctx);
						}
				}
				else {
					window.alert("Invalid Tile Placement!");
				}
			}

			else if(dragging) {
				window.alert("Can't Place Tile Here!");
			}
			
			
			if(hitTest(mouseX, mouseY)) {
				dragging = true;
			}
		}
		
	}

})();