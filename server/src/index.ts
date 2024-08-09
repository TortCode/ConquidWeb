import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { authMiddleware } from './utils/middleware'
import usersRouter from './controllers/users'
import loginRouter from './controllers/login'
import { gameJoinHandler, moveHandler } from './controllers/games'

dotenv.config()

// connect to MongoDB
const DB_NAME = process.env.NODE_ENV === 'test' ? 'testdb' : 'proddb'
const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASSWORD as string)}@${process.env.MONGO_HOST}/${DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(MONGODB_URL).then(() => {
  console.log('connected to MongoDB')
}).catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
  throw error
})

// create express app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// create socket.io server
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
})
io.use(authMiddleware)
io.on('connection', (socket) => {
  socket.on('game_join', gameJoinHandler(socket))
  socket.on('move', moveHandler(socket))
})

// listen
const PORT = 3000
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
