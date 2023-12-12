import { io } from 'socket.io-client'
import { Button } from '@chakra-ui/react'
import React from 'react'
import BoardView from './BoardView'

const socket = io('http://localhost:3000')

function GameView (): JSX.Element {
  const bases = [
    {
      owner: 1,
      startRow: 6,
      endRow: 7,
      startCol: 4,
      endCol: 5
    },
    {
      owner: 2,
      startRow: 6,
      endRow: 7,
      startCol: 22,
      endCol: 23
    }
  ]

  const onAcquire = () => {

  }

  const onConquer = () => {

  }

  const onVanquish = () => {

  }

  const onConquest = () => {

  }

  const onConfirm = () => {

  }

  return (
    <>
      <BoardView rows={14} cols={28} bases={bases} />
      <Button onClick={onAcquire}>
        Acquire
      </Button>
      <Button onClick={onConquer}>
        Conquer
      </Button>
      <Button onClick={onVanquish}>
        Vanquish
      </Button>
      <Button onClick={onConquest}>
        Conquest
      </Button>
      <Button onClick={onConfirm}>
        CONFIRM
      </Button>
    </>
  )
}

export default GameView
