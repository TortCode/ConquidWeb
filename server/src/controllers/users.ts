import { Router } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user'

const router = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', async (req, res) => {
  const body = req.body
  const { username, name, password } = body

  if (password === undefined) {
    res.status(400).json({ error: 'password missing' })
    return
  }
  if (typeof password !== 'string') {
    res.status(400).json({ error: 'password must be of type string' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

export default router
