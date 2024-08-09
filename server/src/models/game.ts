import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import type { BoardLike, Move } from '../../../engine/src/ConquidBoard'
import { randomUUID, type UUID } from 'crypto'

export interface IGame {
  gameId: string
  board: BoardLike
  moves: Move[]
  playerIds: string[]
  hasStarted: boolean
  hasEnded: boolean
}

const cellSchema = new mongoose.Schema({
  owner: { type: Number, required: true },
  isBase: { type: Boolean, required: true }
}, { _id: false })

const positionSchema = new mongoose.Schema({
  r: { type: Number, required: true },
  c: { type: Number, required: true }
}, { _id: false })

const moveSchema = new mongoose.Schema<Move>({
  player: { type: Number, required: true }
}, { discriminatorKey: 'kind', _id: false })

const baseLocationSchema = new mongoose.Schema({
  owner: { type: Number, required: true },
  startRow: { type: Number, required: true },
  endRow: { type: Number, required: true },
  startCol: { type: Number, required: true },
  endCol: { type: Number, required: true }
}, { _id: false })

const gameSchema = new mongoose.Schema<IGame>({
  gameId: { type: mongoose.Schema.Types.UUID, default: () => randomUUID(), unique: true },
  board: {
    type: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true },
      grid: { type: [[cellSchema]], required: true },
      path: { type: [positionSchema], required: true },
      bases: { type: [baseLocationSchema], required: true }
    },
    required: true
  },
  moves: { type: [moveSchema], required: true },
  playerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hasStarted: { type: Boolean, required: true },
  hasEnded: { type: Boolean, required: true }
})

const moveList: mongoose.Schema.Types.DocumentArray = gameSchema.path('moves')

const acquireSchema = new mongoose.Schema({ locs: [positionSchema] }, { _id: false })
const conquerSchema = new mongoose.Schema({}, { _id: false })
const vanquishSchema = new mongoose.Schema({ topLeft: positionSchema }, { _id: false })
const conquestSchema = new mongoose.Schema({}, { _id: false })

moveList.discriminator('acquire', acquireSchema)
moveList.discriminator('conquer', conquerSchema)
moveList.discriminator('vanquish', vanquishSchema)
moveList.discriminator('conquest', conquestSchema)

gameSchema.plugin(uniqueValidator)

gameSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id
    delete obj._id
    delete obj.__v
  }
})

const model = mongoose.model<IGame>('Game', gameSchema)

export default model
