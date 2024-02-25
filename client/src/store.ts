import { configureStore } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import boardHistorySlice, { executeMove, commit, addPlayerId, type BoardHistoryState } from './slices/boardHistorySlice'
import userSlice from './slices/userSlice'
import socket from './services/socket'
import type { Socket } from 'socket.io-client'
import type { Move } from '../../engine/src/ConquidBoard'

const socketMiddleware = (socket: Socket): Middleware => {
  return (api) => {
    socket.on('player_joined', (playerId: string) => {
      console.log('player joined', playerId)
      api.dispatch(addPlayerId(playerId))
    })
    socket.on('move_done', ([i, move]: [number, Move]) => {
      console.log('received move', move)
      const state = api.getState().boardHistory as BoardHistoryState
      if (state.boards.length === i) {
        executeMove(api, move)
        api.dispatch(commit())
      } else {
        console.log('received move too early')
      }
    })
    return (next) => (action) => next(action)
  }
}

const store = configureStore({
  reducer: {
    boardHistory: boardHistorySlice,
    user: userSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware(socket))
})

// inferred states for state and dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
