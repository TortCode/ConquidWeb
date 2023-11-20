//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
//import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import GameView from './components/GameView'

function App() {

  return (
    <ChakraProvider>
      <GameView/>
    </ChakraProvider>
  )
}

export default App
