import { Board, type Move } from '../../engine/src/ConquidBoard'
import type { IGame } from './models/game'
import { assertNever } from './utils/assert'
import { randomUUID } from 'crypto'

export class GameNotStartedError extends Error {
  constructor () {
    super('Game not started')
    this.name = 'GameNotStarted'
  }
}

export class GameEndedError extends Error {
  constructor () {
    super('Game ended')
    this.name = 'GameEnded'
  }
}

export class GameFullError extends Error {
  constructor () {
    super('Game is full')
    this.name = 'GameFull'
  }
}

export class GameTurnError extends Error {
  constructor () {
    super('Not your turn')
    this.name = 'GameTurn'
  }
}

export default class GameManager {
  constructor (
    private readonly gameId: string = 'theOne',
    private readonly board: Board,
    private readonly moves: Move[] = [],
    private readonly playerIds: string[] = [],
    private hasStarted: boolean = false,
    private hasEnded: boolean = false
  ) {
  }

  static create (): GameManager {
    const bases = [
      {
        owner: 1,
        startRow: 6,
        endRow: 7,
        startCol: 4,
        endCol: 5
      },
      {
        owner: 2,
        startRow: 6,
        endRow: 7,
        startCol: 22,
        endCol: 23
      }
    ]
    const gameId = randomUUID()
    const gm = new GameManager(gameId, new Board(14, 28, bases, 3))
    return gm
  }

  static fromObject (obj: IGame): GameManager {
    return new GameManager(
      obj.gameId,
      Board.fromObject(obj.board),
      obj.moves,
      obj.playerIds,
      obj.hasStarted,
      obj.hasEnded
    )
  }

  toObject (): IGame {
    return {
      gameId: this.gameId,
      board: this.board.toObject(),
      moves: this.moves,
      playerIds: this.playerIds,
      hasStarted: this.hasStarted,
      hasEnded: this.hasEnded
    }
  }

  getRoomName (): string {
    return `game:${this.gameId}`
  }

  addPlayer (playerId: string): void {
    if (this.hasStarted) throw new GameNotStartedError()
    if (this.playerIds.length === 2) throw new GameFullError()
    this.playerIds.push(playerId)
    if (this.playerIds.length === 2) this.hasStarted = true
  }

  hasPlayer (playerId: string): boolean {
    return this.playerIds.includes(playerId)
  }

  getPlayerNo (playerId: string): number {
    return this.playerIds.indexOf(playerId) + 1
  }

  getCurrentTurn (): number {
    return (this.moves.length % this.playerIds.length) + 1
  }

  getIndexedMoves (): Array<[number, Move]> {
    return this.moves.map((move, i) => [i, move])
  }

  getMoves (): Move[] {
    return this.moves
  }

  getPlayerIds (): string[] {
    return this.playerIds
  }

  executeMove (move: Move): [number, Move] {
    if (!this.hasStarted) throw new GameNotStartedError()
    if (this.hasEnded) throw new GameEndedError()
    if (this.getCurrentTurn() !== move.player) throw new GameTurnError()
    switch (move.kind) {
      case 'acquire':
        this.board.acquire(move.player, move.locs)
        break
      case 'conquer':
        this.board.conquer(move.player)
        break
      case 'vanquish':
        this.board.vanquish(move.player, move.topLeft)
        break
      case 'conquest':
        this.board.conquest(move.player)
        this.hasEnded = true
        break
      default: {
        assertNever(move)
      }
    }
    this.moves.push(move)
    return [this.moves.length - 1, move]
  }
}
