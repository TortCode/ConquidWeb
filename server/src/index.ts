import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { BadMoveError, Board } from '../../engine/src/ConquidBoard'
import type { Move } from '../../engine/src/ConquidBoard'

import usersRouter from './controllers/users'
import loginRouter from './controllers/login'

dotenv.config()

mongoose.connect(`mongodb+srv://conquiddb:${encodeURIComponent(process.env.MONGODB_PASSWORD!)}@cluster0.nu2w891.mongodb.net/testdb?retryWrites=true&w=majority`).then(() => {
  console.log('connected to MongoDB')
}).catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
  throw error
})

const assertNever = (x: never): never => {
  throw new Error('Unexpected object: ' + (x as string))
}

const app = express()
app.use(express.json())
app.use(cors())

console.log(usersRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

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

const boards = [new Board(14, 28, bases, 3)]
let pno = 1

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log(msg)
  })
  socket.on('getpno', (cb: (v: number) => void) => {
    cb(pno)
    console.log('ASSIGNED PNO', pno)
    pno++
  })
  socket.on('move', (move: Move) => {
    console.log('MOVE', move)
    try {
      const expectedPlayer = (boards.length - 1) % 2 + 1
      if (expectedPlayer !== move.player) {
        throw new Error('NOT YOUR TURN!!!')
      }
      const board = boards[boards.length - 1].clone()
      switch (move.kind) {
        case 'acquire':
          board.acquire(move.player, move.locs)
          break
        case 'conquer':
          board.conquer(move.player)
          break
        case 'vanquish':
          board.vanquish(move.player, move.topLeft)
          break
        case 'conquest':
          board.conquest(move.player)
          break
        default: {
          assertNever(move)
        }
      }
      boards.push(board)
      socket.broadcast.emit('move', move)
    } catch (err: unknown) {
      if (err instanceof BadMoveError) {
        console.log('user error:', err.unwrap())
      } else {
        console.log(err)
      }
    }
  })
})

const PORT = 3000

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
