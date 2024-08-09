import { type Socket } from 'socket.io'
import { type JoinGameResponse } from '../../../engine/src/comm'
import User from '../models/user'
import Game from '../models/game'
import GameManager from '../GameManager'
import { BadMoveError, type Move } from '../../../engine/src/ConquidBoard'

export const gameJoinHandler = (socket: Socket) =>
  async (cb: (v: JoinGameResponse) => void) => {
    try {
      // validate userId
      const userId = socket.data.userId as string
      const user = await User.findById(userId)
      if (user === null) {
        throw new Error(`user ${userId} not found`)
      }

      // get gameManager for gameId
      let gameId = socket.data.gameId
      if (gameId === undefined) {
        const newGameObject = new Game(GameManager.create().toObject())
        const savedGameObject = await newGameObject.save()
        gameId = savedGameObject.gameId
      }
      const gameObject = await Game.findOne({ gameId })
      if (gameObject === null) {
        throw new Error(`game ${gameId} not found`)
      }
      const gameManager = GameManager.fromObject(gameObject as any)
      console.log('game_join', socket.data.userId)

      // add player to gameManager if not already there
      if (gameManager.hasPlayer(userId)) {
        console.log(`user ${userId} already joined`)
      } else {
        gameManager.addPlayer(userId)
        socket.broadcast.emit('player_joined', userId)
      }
      // save changes
      await gameObject.save()
      // join room for game
      await socket.join(gameManager.getRoomName())

      // eslint-disable-next-line n/no-callback-literal
      cb({ moves: gameManager.getMoves(), players: gameManager.getPlayerIds() })
    } catch (err) {
      console.log(err)
    }
  }

export const moveHandler = (socket: Socket) =>
  async (move: Move) => {
    const userId = socket.data.userId as string

    // get gameManager for gameId
    const gameId = socket.data.gameId
    const gameObject = await Game.findOne({ gameId })
    const gameManager = GameManager.fromObject(gameObject as any)

    console.log('MOVE', userId, move)
    try {
      if (gameManager.getPlayerNo(userId) !== move.player) {
        throw new Error('STOP MESSING WITH THE SYSTEM')
      }
      const indexedMove = gameManager.executeMove(move)
      socket.to(gameManager.getRoomName()).emit('move_done', { move: indexedMove })
    } catch (err: unknown) {
      if (err instanceof BadMoveError) {
        console.log('user error:', err.unwrap())
      } else {
        console.log(err)
      }
    }
  }
