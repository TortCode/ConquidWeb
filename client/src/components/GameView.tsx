import { Button } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import BoardView from './BoardView'
import { conquer, conquest, remoteCommit, restore, vanquish, acquireOne, unacquireOne } from '../slices/boardHistorySlice'
import socket from '../services/socket'
import { Board, type Position } from '../../../engine/src/ConquidBoard'
import { useAppDispatch, useAppSelector } from '../hooks'

enum ActionMode {
  Acquire = 'acquire',
  Conquer = 'conquer',
  Vanquish = 'vanquish',
  Conquest = 'conquest',
  None = 'none',
}

const getPlayerNo = async (): Promise<number> => {
  const sspno = sessionStorage.getItem('pno')
  if (sspno !== null) {
    return parseInt(sspno)
  }
  const res = await socket.emitWithAck('getpno')
  sessionStorage.setItem('pno', res)
  return res
}

function GameView (): JSX.Element {
  const dispatch = useAppDispatch()
  const board = useAppSelector(state => state.boardHistory.preview)
  const pendingMove = useAppSelector(state => state.boardHistory.pendingMove)
  const [pno, setPno] = useState<number | null>(null)
  const [action, setAction] = useState<ActionMode>(ActionMode.None)
  useEffect(() => {
    const runEffect = async (): Promise<void> => {
      const pno = await getPlayerNo()
      setPno(pno)
    }
    void runEffect()
    return () => {
      sessionStorage.removeItem('pno')
    }
  }, [])

  if (board === null || pno === null) {
    return (
      <>
      </>
    )
  }

  const onAcquire = (): void => {
    if (pno === null || action !== ActionMode.None) return
    setAction(ActionMode.Acquire)
  }

  const onConquer = (): void => {
    if (pno === null || action !== ActionMode.None) return
    setAction(ActionMode.Conquer)
    dispatch(conquer({ player: pno }))
  }

  const onVanquish = (): void => {
    if (pno === null || action !== ActionMode.None) return
    setAction(ActionMode.Vanquish)
  }

  const onConquest = (): void => {
    if (pno === null || action !== ActionMode.None) return
    setAction(ActionMode.Conquest)
    try {
      Board.prototype.check_conquest.call(board, pno)
      dispatch(conquest({ player: pno }))
    } catch (e) {
      console.log(e)
    }
  }

  const onUndo = (): void => {
    if (pno === null || action === ActionMode.None) return
    setAction(ActionMode.None)
    dispatch(restore())
  }

  const onConfirm = (): void => {
    if (pno === null || action === ActionMode.None) return
    setAction(ActionMode.None)
    void dispatch(remoteCommit())
  }

  const handleCellClick = (loc: Position): void => {
    if (pno === null) return

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
