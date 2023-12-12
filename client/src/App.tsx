import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider as ReduxProvider } from 'react-redux'
import GameView from './components/GameView'
import store from './store'

function App() {

  return (
    <ReduxProvider store={store}>
      <ChakraProvider>
        <GameView/>
      </ChakraProvider>
    </ReduxProvider>
  )
}

export default App
