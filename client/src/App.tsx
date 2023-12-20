import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider as ReduxProvider } from 'react-redux'

import GameView from './components/GameView'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'

import store from './store'

function App (): JSX.Element {
  return (
    <Router>
      <ReduxProvider store={store}>
        <ChakraProvider>
          <Routes>
            <Route path="/game" element={<GameView/>}/>
            <Route path="/signup" element={<SignupForm/>}/>
            <Route path="/login" element={<LoginForm/>}/>
          </Routes>
        </ChakraProvider>
      </ReduxProvider>
    </Router>
  )
}

export default App
