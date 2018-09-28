var TILE_MIN = 1; //tslint:disable-line
var IS_DEBUG = false;
var BOARD = null;
var initGameDivElement = document.getElementById('initGameDiv');
var inputTileLengthElement = document.getElementById('inputTileLength');
var inputTotalBombElement = document.getElementById('inputTotalBomb');
var playGameDivElement = document.getElementById('playGameDiv');
var inputCoordElement = document.getElementById('inputCoord');
var boardGameElement = document.getElementById('boardGame');
var cheatBoardGameElement = document.getElementById('cheatBoardGame');
var resetGameButtonElement = document.getElementById('resetGameButton');
var messageGameElement = document.getElementById('messageGame');
var TileClass = /** @class */ (function () {
    function TileClass(coord, num, isBomb) {
        this.coord = coord;
        this.num = num;
        this.isBomb = isBomb;
        this.isOpen = false;
    }
    TileClass.prototype.print = function (debug) {
        var str = '';
        (debug === true)
            // IF DEBUG TRUE
            ? (this.isBomb === true) ? str = '*' : str = String(this.num)
            // IF DEBUG FALSE
            : (this.isOpen === true)
                ? (this.isBomb === true) ? str = '*' : str = String(this.num)
                : str = '?';
        return str;
    };
    TileClass.prototype.toElement = function (debug) {
        return "<td class=\"tdClass\">" + this.print(debug) + "</td>";
    };
    return TileClass;
}());
var BoardClass = /** @class */ (function () {
    function BoardClass(tileLength, totalBomb) {
        this.tileLength = tileLength;
        this.totalBomb = totalBomb;
        this.floor = [];
        this.initFloor();
        this.generateBomb();
    }
    BoardClass.prototype.initFloor = function () {
        for (var idx = 1; idx <= this.tileLength; idx++) {
            this.floor.push(new TileClass(idx, 0, false));
        }
    };
    BoardClass.prototype.generateBomb = function () {
        var _this = this;
        var maxBomb = this.totalBomb;
        var _loop_1 = function () {
            var randCoord = Math.ceil(Math.random() * this_1.tileLength);
            this_1.floor.map(function (data) {
                if (data.coord === randCoord && data.isBomb === false) {
                    data.isBomb = true;
                    data.num = 0;
                    _this.assignNumberAroundTile(data.coord);
                    maxBomb--;
                }
            });
        };
        var this_1 = this;
        while (maxBomb > 0) {
            _loop_1();
        }
    };
    BoardClass.prototype.assignNumberAroundTile = function (coord) {
        var aroundTile = this.getAroundTile(coord);
        this.floor.map(function (tile) {
            if (aroundTile.includes(tile.coord)) {
                if (tile.isBomb === false)
                    tile.num++;
            }
        });
    };
    BoardClass.prototype.getAroundTile = function (coord) {
        var aroundTile = this.floor.filter(function (tile) {
            if (tile.coord === coord - 1 ||
                tile.coord === coord + 1)
                return true;
        });
        return aroundTile.map(function (tile) { return tile.coord; });
    };
    BoardClass.prototype.checkWin = function () {
        var unOpenedTile = this.floor.filter(function (tile) { return tile.isOpen === false; });
        if (unOpenedTile.length === this.totalBomb) {
            showOrHideResetButton(true);
            return renderMessage('Anda telah membuka semua kotak kecuali bomb. Anda MENANG!!!');
        }
    };
    BoardClass.prototype.play = function (coord, debug) {
        this.openTile(coord);
        this.renderBoardAndCheat(debug);
        this.checkWin();
    };
    BoardClass.prototype.openTile = function (coord) {
        var _this = this;
        this.floor.map(function (tile) {
            if (tile.coord === coord) {
                if (tile.isOpen === true) {
                    return renderMessage('Tile sudah anda buka!');
                }
                else {
                    renderMessage('');
                }
                tile.isOpen = true;
                if (tile.isBomb === true)
                    throw new Error('Anda kalah. Anda membuka bomb!');
                if (tile.num === 0)
                    _this.openAround(coord);
            }
        });
    };
    BoardClass.prototype.openAround = function (coord) {
        var _this = this;
        var selectedTile = this.floor.filter(function (tile) { return tile.coord === coord; })[0];
        if (selectedTile.isBomb === false && selectedTile.num > 0)
            return;
        var aroundTile = this.getAroundTile(coord);
        this.floor.map(function (tile) {
            if (aroundTile.includes(tile.coord)) {
                if (tile.isOpen === false)
                    _this.openTile(tile.coord);
            }
        });
    };
    BoardClass.prototype.render = function (debug, element) {
        var header = '<tr>';
        for (var idx = 1; idx <= this.tileLength; idx++) {
            header += "<td class=\"tdClass\">" + idx + "</td>";
        }
        header += '</tr>';
        var boardString = '<tr>';
        boardString += this.floor.map(function (tile) { return tile.toElement(debug); }).join('');
        boardString += '</tr>';
        element.innerHTML = header + boardString;
    };
    BoardClass.prototype.renderBoardAndCheat = function (debug) {
        this.render(debug, boardGameElement);
        this.render(true, cheatBoardGameElement);
    };
    return BoardClass;
}());
var resetGame = function () {
    startOrResetElement(false);
    showOrHideResetButton(false);
    renderMessage('');
};
var startOrResetElement = function (status) {
    initGameDivElement.style.display = (status === true) ? 'none' : 'block';
    playGameDivElement.style.display = (status === true) ? 'block' : 'none';
    renderMessage('');
};
var showOrHideResetButton = function (status) {
    resetGameButtonElement.style.display = (status === true) ? 'block' : 'none';
};
var renderMessage = function (message) {
    messageGameElement.innerHTML = message;
};
/**========================== */
var initGame = function () {
    var tileLength = Number(inputTileLengthElement.value);
    var totalBomb = Number(inputTotalBombElement.value);
    var maxBomb = Math.ceil(tileLength / 3);
    if (tileLength < TILE_MIN)
        return alert("Jumlah kotak tidak boleh kurang dari nol!");
    if (totalBomb < 0)
        return alert('Jumlah bomb tidak boleh negatif!');
    if (totalBomb > maxBomb)
        return alert("Jumlah bomb maksimal " + maxBomb + "!");
    BOARD = new BoardClass(tileLength, totalBomb);
    startOrResetElement(true);
    BOARD.renderBoardAndCheat(IS_DEBUG);
};
var checkCoord = function () {
    var coord = Number(inputCoordElement.value);
    if (coord < 1 ||
        coord > BOARD.tileLength)
        return alert('Koordinat yang dimasukkan keluar batas!');
    try {
        BOARD.play(coord, IS_DEBUG);
    }
    catch (err) {
        BOARD.renderBoardAndCheat(true);
        showOrHideResetButton(true);
        renderMessage(err.message);
    }
};
