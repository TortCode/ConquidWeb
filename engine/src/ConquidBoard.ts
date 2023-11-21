import { make2dArray } from './utils'

type Player = number
class Cell {
  owner: Player = 0
  isBase: boolean = false
  onPath: boolean = false
}

interface Position {
  r: number
  c: number
}

interface BaseLocation {
  owner: number
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

class InvalidMoveError extends Error {
}

export class Board {
  private readonly rows: number
  private readonly cols: number
  private readonly baseMap: Map<Player, BaseLocation>
  private readonly _grid: Cell[][]
  get grid (): Cell[][] {
    return this._grid
  }

  constructor (rows: number, cols: number, bases: BaseLocation[]) {
    this.rows = rows
    this.cols = cols
    this._grid = make2dArray<Cell>(rows, cols, () => (new Cell(0, false)))
    this.baseMap = new Map()

    bases.forEach((loc) => {
      this.baseMap.set(loc.owner, loc)
      for (let i = loc.startRow; i <= loc.endRow; i++) {
        for (let j = loc.startCol; j <= loc.endCol; j++) {
          this._grid[i][j].owner = loc.owner
        }
      }
    })
  }

  acquire (player: Player, locs: Position[]): void {
    locs.forEach(loc => {
      if (this._grid[loc.r][loc.c].owner !== 0) {
        throw new InvalidMoveError(`Position ${loc.r},${loc.c} is not empty`)
      }
    })
    locs.forEach(loc => {
      this._grid[loc.r][loc.c].owner = player
    })
  }

  conquer (player: Player): void {
    const touched: number[][] = new Array(this.rows)
    const q: Position[] = []
    for (let i = 0; i < this.rows; i++) {
      touched[i] = new Array(this.cols)
      for (let j = 0; j < this.cols; j++) {
        touched[i][j] = 0
        if (this._grid[i][j].owner === player && !this._grid[i][j].isBase) {
          q.push({ r: i, c: j })
        }
      }
    }

    // begin teh konker
    while (q.length > 0) {
      const curr = q.shift()!
      this.adjacent(curr).forEach(adj => {
        if (this._grid[adj.r][adj.c].owner !== player && !this._grid[adj.r][adj.c].isBase) {
          touched[adj.r][adj.c] += 1
          if (touched[adj.r][adj.c] >= 2) {
            this._grid[adj.r][adj.c].owner = player
            q.push(adj)
          }
        }
      })
    }
  }

  vanquish (player: Player, topLeft: Position): void {
    let surrounding = 0
    this.surround4x4(topLeft).forEach(surr => {
      if (this._grid[surr.r][surr.c].owner === player) {
        surrounding += 1
      }
    })
    if (surrounding < 4) {
      throw new InvalidMoveError(`Square at ${topLeft.r},${topLeft.c} is not sufficiently surrounded`)
    }

    let squareOwner = 0
    let foundOwner = false
    const square: Cell[] = []
    for (let i = topLeft.r; i < topLeft.r + 4; i++) {
      for (let j = topLeft.c; j < topLeft.c + 4; j++) {
        if (this.posValid({ r: i, c: j })) {
          const curr = this._grid[i][j]
          if (!foundOwner && !curr.isBase) {
            squareOwner = curr.owner
            foundOwner = true
          } else if (curr.owner !== squareOwner) {
            throw new InvalidMoveError(`Cell at ${i},${j} has a color mismatch with the square`)
          }
          if (!curr.isBase) {
            square.push(curr)
          }
        }
      }
    }

    square.forEach(sq => {
      sq.owner = 0
    })
  }

  conquest (player: Player): void {
    const visited = make2dArray<boolean>(this.rows, this.cols, () => false)
    const prev = make2dArray<Position | null>(this.rows, this.cols, () => null)

    const baseRegion = this.baseMap.get(player)
    if (baseRegion === undefined) {
      throw new InvalidMoveError(`Cannot find base for player ${player}`)
    }

    const q: Position[] = []
    const base: Position = { r: baseRegion.startRow, c: baseRegion.endCol }
    q.push(base)

    let found = false
    while (q.length > 0 && !found) {
      const curr = q.shift()!
      visited[curr.r][curr.c] = true
      this.adjacent(curr).forEach(adj => {
        const adjCell = this._grid[adj.r][adj.c]
        if (!visited[curr.r][curr.c] &&
          adjCell.owner === player) {
          prev[adj.r][adj.c] = curr
          q.push(adj)
        }
        if (adjCell.isBase && adjCell.owner !== 0 && adjCell.owner !== player) {
          let currPos = curr
          let currCell = this._grid[curr.r][curr.c]
          while (!(currCell.isBase && currCell.owner === player)) {
            currCell.onPath = true
            currPos = prev[currPos.r][currPos.c]!
            currCell = this._grid[curr.r][curr.c]
          }
          found = true
        }
      })
    }

    if (!found) {
      throw new InvalidMoveError(`Could not find conquest path for ${player}`)
    }
  }

  private posValid (curr: Position): boolean {
    return curr.r >= 0 && curr.r < this.rows && curr.c >= 0 && curr.c < this.cols
  }

  private adjacent (curr: Position): Position[] {
    const offsets = [
      [0, 1], [0, -1],
      [1, 0], [-1, 0]
    ]

    return offsets
      .map(offset => ({
        r: curr.r + offset[0],
        c: curr.c + offset[1]
      }))
      .filter(pos => (this.posValid(pos)))
  }

  private surround4x4 (topLeft: Position): Position[] {
    const offsets = [
      [-1, 0], [-1, 1], [-1, 2], [-1, 3],
      [4, 0], [4, 1], [4, 2], [4, 3],
      [0, -1], [1, -1], [2, -1], [3, -1],
      [0, 4], [1, 4], [2, 4], [3, 4]
    ]

    return offsets
      .map(offset => ({
        r: topLeft.r + offset[0],
        c: topLeft.c + offset[1]
      }))
      .filter(pos => (this.posValid(pos)))
  }
}

interface AcquireMove {
  kind: 'acquire'
  player: Player
  locs: Position[]
}

interface ConquerMove {
  kind: 'conquer'
  player: Player
}

interface VanquishMove {
  kind: 'vanquish'
  player: Player
  topLeft: Position
}

interface ConquestMove {
  kind: 'conquest'
  player: Player
}

export type Move = AcquireMove | ConquerMove | VanquishMove | ConquestMove
