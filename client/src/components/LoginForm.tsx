import React from 'react'
import { useAppDispatch } from '../hooks'
import { setUserStorage } from '../slices/userSlice'
import loginService from '../services/login'

const LoginForm = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const target = event.target as typeof event.target & {
      username: { value: string }
      password: { value: string }
    }
    const username = target.username.value
    const password = target.password.value
    try {
      const user = await loginService.login(username, password)
      dispatch(setUserStorage(user))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" placeholder="Username" />
      <input type="password" name="password" placeholder="Password" />
      <input type="submit" value="Login" />
    </form>
  )
}

export default LoginForm
