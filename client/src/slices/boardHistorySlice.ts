import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Board } from '../../../engine/src/ConquidBoard'
import socket from '../services/socket'
import type { RootState } from '../store'
import type { BoardLike, Move, AcquireMove, ConquerMove, VanquishMove, ConquestMove, Position, BaseLocation } from '../../../engine/src/ConquidBoard'

const slice = createSlice({
  name: 'boardHistory',
  initialState: {
    boards: [] as BoardLike[],
    preview: null as BoardLike | null,
    pendingMove: null as Move | null,
    canCommit: false
  },
  reducers: {
    initBoard: (state, action: PayloadAction<{ rows: number, cols: number, bases: BaseLocation[], acquireCount: number }>) => {
      const { rows, cols, bases, acquireCount } = action.payload
      const board = (new Board(rows, cols, bases, acquireCount)).toObject()
      state.boards.push(board)
      state.preview = board
      state.pendingMove = null
      state.canCommit = false
    },
    unacquireOne: (state, action: PayloadAction<{ loc: Position }>) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      const { loc } = action.payload
      if (state.pendingMove === null || state.pendingMove.kind !== 'acquire') {
        throw new Error('No acquire move pending')
      }
      const index = state.pendingMove.locs.findIndex(l => l.r === loc.r && l.c === loc.c)
      if (index < 0) {
        throw new Error('Cell not selected')
      }
      state.preview.grid[loc.r][loc.c].owner = 0
      state.pendingMove.locs.splice(index, 1)
      state.canCommit = false
    },
    acquireOne: (state, action: PayloadAction<{ player: number, loc: Position }>) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      const { player, loc } = action.payload
      if (state.pendingMove !== null) {
        if (state.pendingMove.kind !== 'acquire') {
          throw new Error('Move pending already')
        } else if (state.pendingMove.locs.length >= state.preview.acquireCount) {
          throw new Error('Too many cells selected already')
        }
      }
      if (state.pendingMove === null) {
        state.pendingMove = { kind: 'acquire', player, locs: [] }
      }
      state.pendingMove.locs.push(loc)
      Board.prototype.acquireOne.call(state.preview, player, loc)
      if (state.pendingMove.locs.length === state.preview.acquireCount) {
        state.canCommit = true
      }
    },
    acquire: (state, action: PayloadAction<Omit<AcquireMove, 'kind'>>) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      const { player, locs } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'acquire', player, locs }
      Board.prototype.acquire.call(state.preview, player, locs)
      state.canCommit = true
    },
    conquer: (state, action: PayloadAction<Omit<ConquerMove, 'kind'>>) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      const { player } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'conquer', player }
      Board.prototype.conquer.call(state.preview, player)
      state.canCommit = true
    },
    vanquish: (state, action: PayloadAction<Omit<VanquishMove, 'kind'>>) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      const { player, topLeft } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'vanquish', player, topLeft }
      Board.prototype.vanquish.call(state.preview, player, topLeft)
      state.canCommit = true
    },
    conquest: (state, action: PayloadAction<Omit<ConquestMove, 'kind'>>) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      const { player } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'conquest', player }
      Board.prototype.conquest.call(state.preview, player)
      state.canCommit = true
    },
    commit: (state) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      state.boards.push(state.preview)
      state.pendingMove = null
      state.canCommit = false
    },
    restore: (state) => {
      if (state.preview === null) {
        throw new Error('No board yet')
      }
      state.preview = state.boards[state.boards.length - 1]
      state.pendingMove = null
      state.canCommit = false
    }
  }
})

export const remoteCommit = createAsyncThunk<unknown, undefined>(
  'boardHistory/remoteCommit',
  async (_payload: unknown, thunkApi) => {
    const state = thunkApi.getState() as RootState
    const pendingMove = state.boardHistory.pendingMove
    if (pendingMove === null) return

    socket.emit('move', pendingMove)
    thunkApi.dispatch(commit())
  }
)

export const { initBoard, unacquireOne, acquireOne, acquire, conquer, vanquish, conquest, commit, restore } = slice.actions
export default slice.reducer
