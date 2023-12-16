import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { Board } from '../engine/src/ConquidBoard'
import type { Move } from '../engine/src/ConquidBoard'

const assertNever = (x: never): never => {
  throw new Error('Unexpected object: ' + (x as string))
}

const app = express()
app.use(cors())
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
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

const board = new Board(14, 28, bases, 3)
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
    socket.broadcast.emit('move', move)
  })
})

const PORT = 3000

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
