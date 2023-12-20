import { Router } from 'express'
import User from '../models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  const passwordCorrect = user !== null && await bcrypt.compare(password, user.passwordHash)
  if (!passwordCorrect) {
    return res.status(401).json({ error: 'invalid username or password' })
  }

  const signingUser = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(signingUser, process.env.SECRET as string, {
    expiresIn: 60 * 60 * 6 // 6 hours
  })
  res.json({ token, ...signingUser })
})

export default router
