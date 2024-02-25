import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import GameView from './components/GameView'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Navbar from './components/Navbar'
import GameFinderView from './components/GameFinderView'

import { useAppDispatch } from './hooks'
import { initUserStorage } from './slices/userSlice'

const App = (): JSX.Element => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(initUserStorage())
  }, [])
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/game" element={<GameView/>}/>
        <Route path="/signup" element={<SignupForm/>}/>
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/gamefinder" element={<GameFinderView/>}/>
        <Route path="/" element={<Navigate replace to="/login"/>}/>
      </Routes>
    </div>
  )
}

export default App
