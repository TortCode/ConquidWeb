import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/user'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { authMiddleware } from './utils/middleware'

import { BadMoveError } from '../../engine/src/ConquidBoard'
import type { Move } from '../../engine/src/ConquidBoard'
import type { JoinGameResponse } from '../../engine/src/comm'

import usersRouter from './controllers/users'
import loginRouter from './controllers/login'
import GameManager from './GameManager'

dotenv.config()

const DB_NAME = process.env.NODE_ENV === 'test' ? 'testdb' : 'proddb'

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASSWORD as string)}@${process.env.MONGO_HOST}/${DB_NAME}?retryWrites=true&w=majority`
).then(() => {
  console.log('connected to MongoDB')
}).catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
  throw error
})

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

const bm = new GameManager()

io.use(authMiddleware)

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log(msg)
  })
  socket.on('game_join', async (cb: (v: JoinGameResponse) => void) => {
    try {
      console.log('game_join', socket.data.userId)
      const userId = socket.data.userId as string
      const user = await User.findById(userId)
      if (user === null) {
        console.log(`user ${userId} not found`)
        return
      }
      if (bm.hasPlayer(userId)) {
        console.log(`user ${userId} already joined`)
      } else {
        bm.addPlayer(userId)
        socket.broadcast.emit('player_joined', userId)
      }
      // eslint-disable-next-line n/no-callback-literal
      cb({ moves: bm.getMoves(), players: bm.getPlayerIds() })
    } catch (err) {
      console.log(err)
    }
  })
  socket.on('move', (move: Move) => {
    const userId = socket.data.userId as string
    console.log('MOVE', userId, move)
    try {
      if (bm.getPlayerNo(userId) !== move.player) {
        throw new Error('STOP MESSING WITH THE SYSTEM')
      }
      const indexedMove = bm.executeMove(move)
      socket.broadcast.emit('move_done', { move: indexedMove })
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
