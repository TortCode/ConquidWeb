import React from 'react'
import { useAppDispatch } from '../hooks'
import { setUserStorage } from '../slices/userSlice'
import signupService from '../services/users'
import loginService from '../services/login'

const SignupForm = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const target = event.target as typeof event.target & {
      username: { value: string }
      name: { value: string }
      password: { value: string }
    }
    const username = target.username.value
    const name = target.name.value
    const password = target.password.value
    try {
      await signupService.createUser(username, name, password)
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
      <input type="text" name="name" placeholder="Display Name" />
      <input type="password" name="password" placeholder="Password" />
      <input type="submit" value="Signup" />
    </form>
  )
}

export default SignupForm
