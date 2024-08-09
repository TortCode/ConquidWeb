/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppDispatch, useAppSelector } from '../hooks'
import { Button } from '@chakra-ui/react'
import { joinGame } from '../slices/boardHistorySlice'

interface GameInfo {
  gameId: string
  playerIds: string[]
}

const findAllGames = async (): Promise<GameInfo[]> => {
  const baseUrl = 'http://localhost:3000/api/games'
  const games: GameInfo[] = await axios.get(baseUrl)
  return games
}

const GameFinderView = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const userId = useAppSelector((state) => state.user?.id)!
  const [gameList, setGameList] = useState<GameInfo[] | null>(null)

  useEffect(() => {
    const runEffect = async (): Promise<void> => {
      setGameList(await findAllGames())
    }
    void runEffect()
  })

  if (gameList === null) {
    return <>Loading ...</>
  }

  const onJoinClick = (gameId: string): void => {
    console.log('Joining game', gameId)
    dispatch(joinGame())
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      justifyContent: 'center'
    }}>
      {gameList.map(({ gameId, playerIds }) => (
        <div key={gameId}>
          <p>{playerIds.length}/2 players</p>
          {playerIds.includes(userId) ? (
            <>
              <p>You are in this game</p>
              <Button onClick={() => onJoinClick(gameId)}>Rejoin Game</Button>
            </>
          ) : (
            (playerIds.length < 2) && (
              <Button onClick={() => onJoinClick(gameId)}>Join Game</Button>
            )
          )}
        </div>
      ))}
    </div>
  )
}

export default GameFinderView
