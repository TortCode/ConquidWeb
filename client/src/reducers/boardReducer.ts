import { createSlice } from '@reduxjs/toolkit'
import { Board, AcquireMove, ConquerMove, VanquishMove } from '../../../engine/src/ConquidBoard'

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

const board = new Board(14, 28, bases)

const slice = createSlice({
  name: 'board',
  initialState: board,
  reducers: {
    acquire: (state, action: { payload: Omit<AcquireMove, 'kind'> }) => {
      const { player, locs } = action.payload
      state.acquire(player, locs)
    },
    conquer: (state, action: { payload: Omit<ConquerMove, 'kind'> }) => {
      const { player } = action.payload
      state.conquer(player)
    },
    vanquish: (state, action: { payload: Omit<VanquishMove, 'kind'> }) => {
      const { player, topLeft } = action.payload
      state.vanquish(player, topLeft)
    }
  }
})

export default slice.reducer