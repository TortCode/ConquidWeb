import { Button } from '@chakra-ui/react'
import React, { useState } from 'react'
import BoardView from './BoardView'
import { conquer, conquest, remoteCommit, restore, vanquish, acquireOne, unacquireOne } from '../slices/boardHistorySlice'
import { Board, type Position } from '../../../engine/src/ConquidBoard'
import { useAppDispatch, useAppSelector } from '../hooks'

enum ActionMode {
  Acquire = 'acquire',
  Conquer = 'conquer',
  Vanquish = 'vanquish',
  Conquest = 'conquest',
  None = 'none',
}

function GameView (): JSX.Element {
  const dispatch = useAppDispatch()
  const board = useAppSelector(state => state.boardHistory.preview)
  const pendingMove = useAppSelector(state => state.boardHistory.pendingMove)
  const pno = useAppSelector(state => state.boardHistory.playerNo)
  const [action, setAction] = useState<ActionMode>(ActionMode.None)

  if (board === null) {
    return (
      <>
      </>
    )
  }

  const onAcquire = (): void => {
    if (action !== ActionMode.None) return
    setAction(ActionMode.Acquire)
  }

  const onConquer = (): void => {
    if (action !== ActionMode.None) return
    setAction(ActionMode.Conquer)
    dispatch(conquer({ player: pno }))
  }

  const onVanquish = (): void => {
    if (action !== ActionMode.None) return
    setAction(ActionMode.Vanquish)
  }

  const onConquest = (): void => {
    if (action !== ActionMode.None) return
    setAction(ActionMode.Conquest)
    try {
      Board.prototype.check_conquest.call(board, pno)
      dispatch(conquest({ player: pno }))
    } catch (e) {
      console.log(e)
    }
  }

  const onUndo = (): void => {
    if (action === ActionMode.None) return
    setAction(ActionMode.None)
    dispatch(restore())
  }

  const onConfirm = (): void => {
    if (action === ActionMode.None) return
    setAction(ActionMode.None)
    void dispatch(remoteCommit())
  }

  const handleCellClick = (loc: Position): void => {
    switch (action) {
      case 'acquire': {
        if (pendingMove !== null && pendingMove.kind === 'acquire') {
          const l = pendingMove.locs.find(l => l.r === loc.r && l.c === loc.c)
          if (l === undefined && pendingMove.locs.length < board.acquireCount) {
            if (pendingMove.locs.length < board.acquireCount) {
              dispatch(acquireOne({ player: pno, loc }))
            }
          } else {
            dispatch(unacquireOne({ loc }))
          }
        } else {
          dispatch(acquireOne({ player: pno, loc }))
        }
        return
      }
      case 'vanquish': {
        if (pendingMove !== null) {
          dispatch(restore())
        }
        try {
          Board.prototype.check_vanquish.call(board, pno, loc)
          dispatch(vanquish({ player: pno, topLeft: loc }))
        } catch (e) {
          console.log(e)
        }
      }
    }
  }

  return (
    <>
      <BoardView
        handleClick={handleCellClick}
      />
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
      <Button onClick={onUndo}>
        UNDO
      </Button>
      <Button onClick={onConfirm}>
        CONFIRM
      </Button>
    </>
  )
}

export default GameView
