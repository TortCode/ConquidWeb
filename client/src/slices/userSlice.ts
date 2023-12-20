import { createSlice } from '@reduxjs/toolkit'
import { type AppDispatch } from '../store'

export interface UserData {
  token: string
  username: string
  id: string
}

const slice = createSlice({
  name: 'user',
  initialState: null as UserData | null,
  reducers: {
    setUser (_state, action) {
      return action.payload
    },
    clearUser (_state) {
      return null
    }
  }
})

export const initUserStorage = () => {
  return (dispatch: AppDispatch) => {
    const loggedUserJSON = window.localStorage.getItem('conquidUser')
    if (loggedUserJSON !== null) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
    }
  }
}

export const setUserStorage = (user: UserData) => {
  return (dispatch: AppDispatch) => {
    window.localStorage.setItem('conquidUser', JSON.stringify(user))
    dispatch(setUser(user))
  }
}

export const clearUserStorage = () => {
  return (dispatch: AppDispatch) => {
    window.localStorage.removeItem('conquidUser')
    dispatch(clearUser())
  }
}

export const { setUser, clearUser } = slice.actions
export default slice.reducer
