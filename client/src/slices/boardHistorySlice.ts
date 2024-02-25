import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Board } from '../../../engine/src/ConquidBoard'
import socket from '../services/socket'
import type { BoardLike, Move, AcquireMove, ConquerMove, VanquishMove, ConquestMove, Position, BaseLocation } from '../../../engine/src/ConquidBoard'
import type { JoinGameResponse } from '../../../engine/src/comm'

export interface BoardHistoryState {
  boards: BoardLike[]
  playerIds: string[]
  playerNo: number
  preview: BoardLike | null
  pendingMove: Move | null
  canCommit: boolean
}
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
const defaultConfig = {
  rows: 14,
  cols: 28,
  bases,
  acquireCount: 3
}

const slice = createSlice({
  name: 'boardHistory',
  initialState: {
    boards: [] as BoardLike[],
    playerIds: [] as string[],
    playerNo: -1 as number,
    preview: null as BoardLike | null,
    pendingMove: null as Move | null,
    canCommit: false as boolean
  } satisfies BoardHistoryState,
  reducers: {
    setPlayerIds: (state, action: PayloadAction<string[]>) => {
      state.playerIds = action.payload
    },
    addPlayerId: (state, action: PayloadAction<string>) => {
      state.playerIds.push(action.payload)
    },
    resetAll: (state) => {
      state.boards = []
      state.playerIds = []
      state.playerNo = -1
      state.preview = null
      state.pendingMove = null
      state.canCommit = false
    },
    initBoard: (state, action: PayloadAction<{ rows: number, cols: number, bases: BaseLocation[], acquireCount: number }>) => {
      const { rows, cols, bases, acquireCount } = action.payload
      const board = Board.fromConfig(rows, cols, bases, acquireCount).toObject()
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
      Board.fromObject(state.preview).acquireOne(player, loc)
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
      Board.fromObject(state.preview).acquire(player, locs)
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
      Board.fromObject(state.preview).conquer(player)
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
      Board.fromObject(state.preview).vanquish(player, topLeft)
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
      Board.fromObject(state.preview).conquest(player)
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

export const { setPlayerIds, addPlayerId, resetAll, initBoard, unacquireOne, acquireOne, acquire, conquer, vanquish, conquest, commit, restore } = slice.actions
export default slice.reducer

export const executeMove = (api: any, move: Move): void => {
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
    default:
      throw new Error('Unknown move kind')
  }
}

export const joinGame = createAsyncThunk<unknown, undefined>(
  'boardHistory/joinGame',
  async (_payload: unknown, thunkApi) => {
    const { moves, players }: JoinGameResponse = await socket.emitWithAck('game_join')
    thunkApi.dispatch(setPlayerIds(players))
    thunkApi.dispatch(initBoard(defaultConfig))
    moves.forEach((move) => {
      executeMove(thunkApi, move)
    })
  }
)

export const remoteCommit = createAsyncThunk<unknown, undefined>(
  'boardHistory/remoteCommit',
  async (_payload: unknown, thunkApi: any) => {
    const state = thunkApi.getState().boardHistory as BoardHistoryState
    const pendingMove = state.pendingMove
    if (pendingMove === null) return

    socket.emit('move', pendingMove)
    thunkApi.dispatch(commit())
  }
)
