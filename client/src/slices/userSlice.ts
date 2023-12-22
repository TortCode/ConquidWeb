import { createSlice } from '@reduxjs/toolkit'
import { type AppDispatch } from '../store'
import socket from '../services/socket'

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

const USER_STORAGE_KEY = 'user'

export const initUserStorage = () => {
  return (dispatch: AppDispatch) => {
    const userJSON = window.localStorage.getItem(USER_STORAGE_KEY)
    if (userJSON !== null) {
      const user = JSON.parse(userJSON)
      dispatch(setUser(user))
      socket.connect()
    }
  }
}

export const setUserStorage = (user: UserData) => {
  return (dispatch: AppDispatch) => {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    dispatch(setUser(user))
    socket.connect()
  }
}

export const clearUserStorage = () => {
  return (dispatch: AppDispatch) => {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    socket.disconnect()
    dispatch(clearUser())
  }
}

export const { setUser, clearUser } = slice.actions
export default slice.reducer
