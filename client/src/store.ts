import { configureStore } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import boardHistoryReducer, { acquire, commit, conquer, conquest, vanquish } from './reducers/boardHistoryReducer'
import socket from './socketService'
import type { Socket } from 'socket.io-client'
import type { Move } from '../../engine/src/ConquidBoard'

const socketMiddleware = (socket: Socket): Middleware => {
  return (api) => {
    socket.on('move', (move: Move) => {
      console.log('received move', move)
      switch (move.kind) {
        case 'acquire':
          api.dispatch(acquire(move))
          break
        case 'conquer':
          api.dispatch(conquer(move))
          break
        case 'vanquish':
          api.dispatch(vanquish(move))
          break
        case 'conquest':
          api.dispatch(conquest(move))
          break
      }
      api.dispatch(commit())
    })
    return (next) => (action) => next(action)
  }
}

const store = configureStore({
  reducer: {
    boardHistory: boardHistoryReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware(socket))
})

// inferred states for state and dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
