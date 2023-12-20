import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Board } from '../../../engine/src/ConquidBoard'
import socket from '../socketService'
import type { RootState } from '../store'
import type { Move, AcquireMove, ConquerMove, VanquishMove, ConquestMove, Position } from '../../../engine/src/ConquidBoard'

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

const board = (new Board(14, 28, bases, 3)).toObject()

const slice = createSlice({
  name: 'boardHistory',
  initialState: {
    boards: [board],
    preview: board,
    pendingMove: null as Move | null,
    canCommit: false
  },
  reducers: {
    unacquireOne: (state, action: PayloadAction<{ loc: Position }>) => {
      const { loc } = action.payload
      if (state.pendingMove === null || state.pendingMove.kind !== 'acquire') {
        throw new Error('No acquire move pending')
      }
      const index = state.pendingMove.locs.findIndex(l => l.r === loc.r && l.c === loc.c)
      if (index < 0) {
        throw new Error('Cell not selected')
      }
      state.preview.grid[loc.r][loc.c].owner = 0
      state.canCommit = false
    },
    acquireOne: (state, action: PayloadAction<{ player: number, loc: Position }>) => {
      const { player, loc } = action.payload
      if (state.pendingMove !== null) {
        if (state.pendingMove.kind !== 'acquire') {
          throw new Error('Move pending already')
        } else if (state.pendingMove.locs.length >= state.preview.acquireCellCount) {
          throw new Error('Too many cells selected already')
        }
      }
      if (state.pendingMove === null) {
        state.pendingMove = { kind: 'acquire', player, locs: [] }
      }
      state.pendingMove.locs.push(loc)
      Board.prototype.acquireOne.call(state.preview, player, loc)
      if (state.pendingMove.locs.length === state.preview.acquireCellCount) {
        state.canCommit = true
      }
    },
    acquire: (state, action: PayloadAction<Omit<AcquireMove, 'kind'>>) => {
      const { player, locs } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'acquire', player, locs }
      Board.prototype.acquire.call(state.preview, player, locs)
      state.canCommit = true
    },
    conquer: (state, action: PayloadAction<Omit<ConquerMove, 'kind'>>) => {
      const { player } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'conquer', player }
      Board.prototype.conquer.call(state.preview, player)
      state.canCommit = true
    },
    vanquish: (state, action: PayloadAction<Omit<VanquishMove, 'kind'>>) => {
      const { player, topLeft } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'vanquish', player, topLeft }
      Board.prototype.vanquish.call(state.preview, player, topLeft)
      state.canCommit = true
    },
    conquest: (state, action: PayloadAction<Omit<ConquestMove, 'kind'>>) => {
      const { player } = action.payload
      if (state.pendingMove !== null) {
        throw new Error('Move pending already')
      }
      state.pendingMove = { kind: 'conquest', player }
      Board.prototype.conquest.call(state.preview, player)
      state.canCommit = true
    },
    commit: (state) => {
      state.boards.push(state.preview)
      state.pendingMove = null
      state.canCommit = false
    },
    restore: (state) => {
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

export const { unacquireOne, acquireOne, acquire, conquer, vanquish, conquest, commit, restore } = slice.actions
export default slice.reducer
