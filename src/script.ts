const TILE_MIN: number = 1; //tslint:disable-line
const IS_DEBUG: boolean = false;
let BOARD: any = null;

const initGameDivElement: any = document.getElementById('initGameDiv');
const inputTileLengthElement: any = document.getElementById('inputTileLength');
const inputTotalBombElement: any = document.getElementById('inputTotalBomb')
const playGameDivElement: any = document.getElementById('playGameDiv');
const inputCoordElement: any = document.getElementById('inputCoord');
const boardGameElement: any = document.getElementById('boardGame');
const cheatBoardGameElement: any = document.getElementById('cheatBoardGame');
const resetGameButtonElement: any = document.getElementById('resetGameButton');
const messageGameElement: any = document.getElementById('messageGame');

class TileClass {
  public coord: number;
  public num: number;
  public isBomb: boolean;
  public isOpen: boolean;

  constructor(coord: number, num: number, isBomb: boolean) {
    this.coord = coord;
    this.num = num;
    this.isBomb = isBomb;
    this.isOpen = false;
  }

  print(debug: boolean): string {
    let str: string = '';

    (debug === true)
      // IF DEBUG TRUE
      ? (this.isBomb === true) ? str = '*' : str = String(this.num)
      // IF DEBUG FALSE
      : (this.isOpen === true)
        ? (this.isBomb === true) ? str = '*' : str = String(this.num)
        : str = '?';

    return str;
  }

  toElement(debug: boolean): string {
    return `<td class="tdClass">${this.print(debug)}</td>`
  }
}

class BoardClass {
  public tileLength: number;
  public totalBomb: number;
  public floor: Array<TileClass>;

  constructor(tileLength: number, totalBomb: number) {
    this.tileLength = tileLength;
    this.totalBomb = totalBomb;
    this.floor = []

    this.initFloor();
    this.generateBomb();
  }

  initFloor(): void {
    for (let idx: number = 1; idx <= this.tileLength; idx++) {
      this.floor.push(new TileClass(idx, 0, false));
    }
  }

  generateBomb(): void {
    let maxBomb: number = this.totalBomb;
    while (maxBomb > 0) {
      let randCoord: number = Math.ceil(Math.random() * this.tileLength)

      this.floor.map(data => {
        if (data.coord === randCoord && data.isBomb === false) {
          data.isBomb = true;
          data.num = 0
          
          this.assignNumberAroundTile(data.coord);
          maxBomb--
        }
      })
    }
  }

  assignNumberAroundTile(coord: number): void {
    let aroundTile: Array<number> = this.getAroundTile(coord)

    this.floor.map(tile => {
      if (aroundTile.includes(tile.coord)) {
        if (tile.isBomb === false) tile.num++
      }
    })
  }

  getAroundTile(coord: number): Array<number> {
    let aroundTile: Array<TileClass> = this.floor.filter(tile => {
      if (
        tile.coord === coord - 1 ||
        tile.coord === coord + 1
      ) return true
    })

    return aroundTile.map(tile => tile.coord)
  }

  checkWin(): void | any {
    let unOpenedTile: Array<TileClass> = this.floor.filter(tile => tile.isOpen === false)
    if (unOpenedTile.length === this.totalBomb) {
      showOrHideResetButton(true)
      return alert('Anda telah membuka semua kotak kecuali bomb. Anda MENANG!!!')
    }
  }

  play(coord: number, debug: boolean): void {
    this.openTile(coord);
    this.renderBoardAndCheat(debug)
    this.checkWin()
  }

  openTile(coord: number): any {
    this.floor.map(tile => {
      if (tile.coord === coord) {
        if (tile.isOpen === true) {
          return renderMessage('Tile sudah anda buka!');
        } else {
          renderMessage('');
        }
        tile.isOpen = true;

        if (tile.isBomb === true) throw new Error('Anda kalah. Anda membuka bomb!');
        if (tile.num === 0) this.openAround(coord)
      }
    })
  }

  openAround(coord: number): any {
    const selectedTile = this.floor.filter(tile => tile.coord === coord)[0];
    if (selectedTile.isBomb === false && selectedTile.num > 0) return
    
    const aroundTile = this.getAroundTile(coord)
    this.floor.map(tile => {
      if (aroundTile.includes(tile.coord)) {
        if(tile.isOpen === false) this.openTile(tile.coord)
      }
    })
  }

  render(debug: boolean, element: any) {
    let header: string = '<tr>'
    for (let idx = 1; idx <= this.tileLength; idx++) {
      header += `<td class="tdClass">${idx}</td>`
    }
    header += '</tr>'

    let boardString: string = '<tr>'
    boardString += this.floor.map( tile => tile.toElement(debug) ).join('')
    boardString += '</tr>'
    element.innerHTML = header + boardString
  }

  renderBoardAndCheat(debug: boolean) {
    this.render(debug, boardGameElement);
    this.render(true, cheatBoardGameElement);
  }

}

const resetGame = (): void => {
  startOrResetElement(false);
  showOrHideResetButton(false);
  renderMessage('');
}

const startOrResetElement = (status: boolean): void => {
  initGameDivElement.style.display = (status === true) ? 'none' : 'block';
  playGameDivElement.style.display = (status === true) ? 'block' : 'none';
  renderMessage('');
}

const showOrHideResetButton = (status: boolean): void => {
  resetGameButtonElement.style.display = (status === true) ? 'block' : 'none';
}

const renderMessage = (message: string): void => {
  messageGameElement.innerHTML = message;
}

/**========================== */

const initGame = (): any => {
  const tileLength: number = Number(inputTileLengthElement.value);
  const totalBomb: number = Number(inputTotalBombElement.value);
  const maxBomb: number = Math.ceil(tileLength/3);

  if (tileLength < TILE_MIN) return alert(`Jumlah kotak tidak boleh kurang dari nol!`);
  if (totalBomb < 0) return alert('Jumlah bomb tidak boleh negatif!')
  if (totalBomb > maxBomb) return alert(`Jumlah bomb maksimal ${maxBomb}!`);

  BOARD = new BoardClass(tileLength, totalBomb);
  startOrResetElement(true);
  BOARD.renderBoardAndCheat(IS_DEBUG);
}

const checkCoord = (): any => {
  const coord: number = Number(inputCoordElement.value);
  if (
    coord < 1 ||
    coord > BOARD.tileLength
  ) return alert('Koordinat yang dimasukkan keluar batas!')

  try {
    BOARD.play(coord, IS_DEBUG)
  } catch (err) {
    BOARD.renderBoardAndCheat(true);
    showOrHideResetButton(true);
    renderMessage(err.message)
  }
}
