import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

interface IUser {
  username: string
  name: string
  passwordHash: string
}

const schema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 2
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  }
})

schema.plugin(uniqueValidator)

schema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id
    delete obj._id
    delete obj.__v
    delete obj.passwordHash
  }
})

const model = mongoose.model<IUser>('User', schema)

export default model
