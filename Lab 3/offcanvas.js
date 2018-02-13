var map = {
    cols: 10,
    rows: 10,
    tsize: 32, // 64 pix x 64 pix
    layers: [[
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
        3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
        3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
        3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
        3, 1, 2, 2, 1, 1, 1, 1, 1, 1, 
        3, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        3, 1, 2, 2, 1, 1, 1, 1, 1, 1, 
        3, 1, 2, 2, 1, 1, 1, 1, 1, 1,
        3, 1, 2, 2, 1, 1, 1, 1, 1, 1,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,]],
    getTile: function (layer, col, row) {
        return this.layers[layer][row * map.cols + col];
    }
};

function Camera(map, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = map.cols * map.tsize - width; 	// How much the camera moves x
    this.maxY = map.rows * map.tsize - height; 	// How much the camera moves y
}

Camera.SPEED = 256; // pixels per second

Camera.prototype.move = function (delta, dirx, diry) {
    // move camera
    this.x += dirx * Camera.SPEED * delta;
    this.y += diry * Camera.SPEED * delta;
    // clamp values
    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));
};

Game.load = function () {
    return [
        Loader.loadImage('tiles', 'tiles.png'),
    ];
};

Game.init = function () {
    Keyboard.listenForEvents(
        [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
    this.tileAtlas = Loader.getImage('tiles');
    this.camera = new Camera(map, 500, 500);
};

Game.update = function (delta) {
    // handle camera movement with arrow keys
    var dirx = 0;
    var diry = 0;
    if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
    if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
    if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
    if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

    this.camera.move(delta, dirx, diry);
};

Game._drawLayer = function (layer) {
    var startCol = Math.floor(this.camera.x / map.tsize);
    var endCol = startCol + (this.camera.width / map.tsize);
    var startRow = Math.floor(this.camera.y / map.tsize);
    var endRow = startRow + (this.camera.height / map.tsize);
    var offsetX = -this.camera.x + startCol * map.tsize;
    var offsetY = -this.camera.y + startRow * map.tsize;

    for (var c = startCol; c <= endCol; c++) {
        for (var r = startRow; r <= endRow; r++) {
            var tile = map.getTile(layer, c, r);
            var x = (c - startCol) * map.tsize + offsetX;
            var y = (r - startRow) * map.tsize + offsetY;
            if (tile !== 0) { // 0 => empty tile
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    (tile - 1) * 64, // source x
                    0, // source y
                    map.tsize, // source width
                    map.tsize, // source height
                    c * map.tsize,  // target x
                    r * map.tsize, // target y
                    map.tsize, // target width
                    map.tsize // target height
                );
            }
        }
    }
};

Game.render = function () {
    // draw map background layer
    this._drawLayer(0);
    // draw map top layer
    //this._drawLayer(1);
};