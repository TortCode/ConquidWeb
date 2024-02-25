import { io } from 'socket.io-client'

let token: string = ''
let gameId: string = 'bork'

export const setToken = (newToken: string): void => {
  token = newToken
}

export const setGameId = (newGameId: string): void => {
  gameId = newGameId
}

const socket = io('ws://localhost:3000', {
  auth: (cb) => {
    // eslint-disable-next-line n/no-callback-literal
    cb({
      token,
      gameId
    })
  },
  autoConnect: false
})

export default socket
