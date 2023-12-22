import { Board, type Move } from '../../engine/src/ConquidBoard'

export default class GameManager {
  private readonly gameId: string = 'theOne'
  private readonly board: Board
  private readonly moves: Move[]
  private readonly playerIds: string[]
  private hasStarted: boolean = false
  private hasEnded: boolean = false

  constructor () {
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
    this.board = new Board(14, 28, bases, 3)
    this.moves = []
    this.playerIds = []
  }
}
