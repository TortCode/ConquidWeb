import { type Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

export const authMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
  const token = socket.handshake.auth.token
  if (token == null) {
    next(new Error('Authentication error'))
  }
  try {
    const payload = jwt.verify(token, process.env.SECRET as string)
    if (payload !== null && typeof (payload) === 'object' && typeof (payload.id) === 'string') {
      socket.data.userId = payload.id
      next()
    } else {
      next(new Error('Invalid payload'))
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      next(err)
    } else {
      next(new Error('Unknown error'))
    }
  }
}
