import React from 'react'
import { Routes, Route } from 'react-router-dom'

import GameView from './components/GameView'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'

import Navbar from './components/Navbar'

function App (): JSX.Element {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/game" element={<GameView/>}/>
        <Route path="/signup" element={<SignupForm/>}/>
        <Route path="/login" element={<LoginForm/>}/>
      </Routes>
    </div>
  )
}

export default App
