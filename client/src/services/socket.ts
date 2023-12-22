import { io } from 'socket.io-client'
import store from '../store'

const socket = io('ws://localhost:3000', {
  auth: (cb) => {
    // eslint-disable-next-line n/no-callback-literal
    cb({
      token: store.getState().user?.token
    })
  },
  autoConnect: false
})

export default socket
