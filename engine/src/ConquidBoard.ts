import { make2dArray } from './utils'

type Player = number
export interface Cell {
  owner: Player
  isBase: boolean
}

export interface Position {
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

export type BadMoveErrorLike = {
  name: 'acquireCount'
  count: number
} | {
  name: 'nonEmptyCell'
  pos: Position
} | {
  name: 'notSurroundedCell'
  pos: Position
} | {
  name: 'colorMismatch'
  pos: Position
} | {
  name: 'pathNotFound'
} | {
  name: 'outOfBounds',
  pos: Position
}

export class BadMoveError {
  constructor(private readonly err: BadMoveErrorLike) {
  }

  unwrap() {
    return this.err
  }

  static acquireCount(count: number) {
    return new BadMoveError({
      name: 'acquireCount',
      count
    })
  }

  static nonEmptyCell(pos: Position) {
    return new BadMoveError({
      name: 'nonEmptyCell',
      pos
    })
  }

  static notSurroundedCell(pos: Position) {
    return new BadMoveError({
      name: 'notSurroundedCell',
      pos
    })
  }

  static outOfBounds(pos: Position) {
    return new BadMoveError({
      name: 'outOfBounds',
      pos
    })
  }

  static pathNotFound() {
    return new BadMoveError({
      name: 'pathNotFound'
    })
  }

  static colorMismatch(pos: Position) {
    return new BadMoveError({
      name: 'colorMismatch',
      pos
    })
  }
}

export interface BoardLike {
  rows: number
  cols: number
  grid: Cell[][]
  path: Position[]
  bases: BaseLocation[]
  acquireCellCount: number
}

export class Board implements BoardLike {
  public path: Position[]
  public grid: Cell[][]

  constructor (
    public readonly rows: number,
    public readonly cols: number,
    public readonly bases: BaseLocation[], 
    public readonly acquireCellCount: number) {
    this.grid = make2dArray<Cell>(rows, cols, () => ({ owner: 0, isBase: false }))
    this.path = []

    bases.forEach((loc) => {
      for (let i = loc.startRow; i <= loc.endRow; i++) {
        for (let j = loc.startCol; j <= loc.endCol; j++) {
          this.grid[i][j].owner = loc.owner
          this.grid[i][j].isBase = true
        }
      }
    })
  }

  toObject(): BoardLike {
    return {
      rows: this.rows,
      cols: this.cols,
      grid: this.grid,
      path: this.path,
      bases: this.bases,
      acquireCellCount: this.acquireCellCount
    }
  }

  clone(): Board {
    const board = new Board(this.rows, this.cols, this.bases, this.acquireCellCount)
    board.grid = JSON.parse(JSON.stringify(this.grid))
    board.path = JSON.parse(JSON.stringify(this.path))
    return board
  }

  check_acquire (player: Player, locs: Position[], desiredLength: number = this.acquireCellCount): void {
    // deduplicate values
    locs = [...new Set(locs)]
    if (locs.length !== desiredLength) {
      throw BadMoveError.acquireCount(locs.length)
    }
    locs.forEach(loc => {
      if (!Board.prototype.posValid.call(this, loc)) {
        throw BadMoveError.outOfBounds(loc)
      }
      if (this.grid[loc.r][loc.c].owner !== 0) {
        throw BadMoveError.nonEmptyCell(loc)
      }
    })
  }

  acquireOne (player: Player, loc: Position): void {
    console.log(this)
    Board.prototype.check_acquire.call(this, player, [loc], 1)
    this.grid[loc.r][loc.c].owner = player
  }

  acquire (player: Player, locs: Position[]): void {
    Board.prototype.check_acquire.call(this, player, locs)
    locs.forEach(loc => {
      this.grid[loc.r][loc.c].owner = player
    })
  }

  conquer (player: Player): void {
    const touched: number[][] = make2dArray<number>(this.rows, this.cols, () => 0)
    const q: Position[] = []
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].owner === player && !this.grid[r][c].isBase) {
          q.push({ r, c })
        }
      }
    }

    // begin teh konker
    while (q.length > 0) {
      const curr = q.shift()!
      Board.prototype.adjacent.call(this, curr).forEach(adj => {
        const { r, c } = adj
        if (
          this.grid[r][c].owner !== 0
          && this.grid[r][c].owner !== player 
          && !this.grid[r][c].isBase) {
          touched[r][c] += 1
          if (touched[r][c] >= 2) {
            this.grid[r][c].owner = player
            q.push(adj)
          }
        }
      })
    }
  }

  check_vanquish(player: Player, topLeft: Position): void {
    let surrounding = 0
    Board.prototype.surround4x4.call(this, topLeft).forEach(surr => {
      if (Board.prototype.posValid.call(this, surr)
      && this.grid[surr.r][surr.c].owner === player) {
        surrounding += 1
      }
    })
    if (surrounding < 4) {
      throw BadMoveError.notSurroundedCell(topLeft)
    }

    let squareOwner = 0
    let foundOwner = false
    for (let r = topLeft.r; r < topLeft.r + 4; r++) {
      for (let c = topLeft.c; c < topLeft.c + 4; c++) {
        if (!Board.prototype.posValid({ r, c })) {
          throw BadMoveError.outOfBounds({ r, c })
        }
        const curr = this.grid[r][c]
        if (!foundOwner && !curr.isBase) {
          squareOwner = curr.owner
          foundOwner = true
        } else if (curr.owner !== squareOwner) {
          throw BadMoveError.colorMismatch(topLeft)
        }
      }
    }
  }

  vanquish (player: Player, topLeft: Position): void {
    Board.prototype.check_vanquish.call(this, player, topLeft)

    const square: Cell[] = []
    for (let r = topLeft.r; r < topLeft.r + 4; r++) {
      for (let c = topLeft.c; c < topLeft.c + 4; c++) {
        if (Board.prototype.posValid.call(this, { r, c })) {
          const curr = this.grid[r][c]
          if (!curr.isBase) {
            curr.owner = 0
          }
        }
      }
    }
  }

  check_conquest (player: Player): Position[] {
    const visited = make2dArray<boolean>(this.rows, this.cols, () => false)
    const prev = make2dArray<Position | null>(this.rows, this.cols, () => null)

    const baseRegion = this.bases[player - 1]
    if (baseRegion === undefined) {
      throw new Error(`Cannot find base for player ${player}`)
    }

    const q: Position[] = []
    const base: Position = { r: baseRegion.startRow, c: baseRegion.endCol }
    q.push(base)

    const path = [base]

    let found = false
    while (q.length > 0 && !found) {
      const curr = q.shift()!
      visited[curr.r][curr.c] = true
      Board.prototype.adjacent.call(this, curr).forEach(adj => {
        const adjCell = this.grid[adj.r][adj.c]
        if (!visited[curr.r][curr.c] &&
          adjCell.owner === player) {
          prev[adj.r][adj.c] = curr
          q.push(adj)
        }
        if (adjCell.isBase && adjCell.owner !== 0 && adjCell.owner !== player) {
          let currPos = curr
          let currCell = this.grid[curr.r][curr.c]
          while (!(currCell.isBase && currCell.owner === player)) {
            path.push(currPos)
            currPos = prev[currPos.r][currPos.c]!
            currCell = this.grid[curr.r][curr.c]
          }
          found = true
        }
      })
    }

    if (!found) {
      throw BadMoveError.pathNotFound()
    }
    return path
  }

  conquest (player: Player): void {
    const path = Board.prototype.check_conquest.call(this, player)
    this.path = path
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
      .filter(pos => (Board.prototype.posValid.call(this,pos)))
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
      .filter(pos => (Board.prototype.posValid.call(this,pos)))
  }
}

export interface AcquireMove {
  kind: 'acquire'
  player: Player
  locs: Position[]
}

export interface ConquerMove {
  kind: 'conquer'
  player: Player
}

export interface VanquishMove {
  kind: 'vanquish'
  player: Player
  topLeft: Position
}

export interface ConquestMove {
  kind: 'conquest'
  player: Player
}

export type Move = AcquireMove | ConquerMove | VanquishMove | ConquestMove
