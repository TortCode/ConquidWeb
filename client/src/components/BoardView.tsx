import { Button } from '@chakra-ui/react'
import React from 'react'
import { useAppSelector } from '../hooks'
import type { Position } from '../../../engine/src/ConquidBoard'

interface BoardViewProps {
  handleClick: (pos: Position) => void
}

function blendColors (colorA: string, colorB: string): string {
  const mix = (a: number, b: number): number => Math.round(Math.sqrt((a * a + b * b) / 2))

  function toHexString (n: number): string {
    return n.toString(16).padStart(2, '0')
  }

  function matchHexByte (s: string): RegExpMatchArray {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return s.match(/[0-9A-F][0-9A-F]/g)!
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [rA, gA, bA] = matchHexByte(colorA).map((c: string) => parseInt(c, 16))
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [rB, gB, bB] = matchHexByte(colorB).map((c: string) => parseInt(c, 16))

  const r = mix(rA, rB)
  const g = mix(gA, gB)
  const b = mix(bA, bB)
  return '#' + toHexString(r) + toHexString(g) + toHexString(b)
}

function BoardView (props: BoardViewProps): JSX.Element {
  const originalBoard = useAppSelector(state => state.boardHistory.boards[state.boardHistory.boards.length - 1])
  const previewBoard = useAppSelector(state => state.boardHistory.preview)

  if (previewBoard === null) {
    return (
      <div>
        <p>So um the preview is somehow null</p>
        <p>Gl finding the error</p>
      </div>
    )
  }

  const colors = ['#ffffff', '#ff88aa', '#88ffaa', '#aa88ff', '#aaff88', '#ffaa88', '#88aaff']

  const getColor = (r: number, c: number): string => {
    const cA = colors[previewBoard.grid[r][c].owner % colors.length]
    const cB = colors[originalBoard.grid[r][c].owner % colors.length]
    const mixed = blendColors(cA, cB)
    // console.log(`color @ (${r}, ${c}) is ${mixed}`)
    return mixed
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        justifyContent: 'center',
        backgroundColor: '#eeeeee'
      }}
    >
      {previewBoard.grid.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1px',
            justifyContent: 'center'
          }}
        >
          {row.map((val, j) => (
            <Button
              key={j}
              size="sm"
              maxWidth="2em"
              maxHeight="3em"
              backgroundColor={getColor(i, j)}
              borderWidth={val.isBase ? '0.10em' : '0'}
              borderRadius={0}
              borderColor="black"
              margin="1px"
              isDisabled={val.isBase}
              onClick={() => {
                props.handleClick({ r: i, c: j })
              }}
            ></Button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default BoardView
