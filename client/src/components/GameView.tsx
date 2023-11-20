import Board from "./Board";

function GameView() {
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
      endCol: 23,
    }
  ]

  return (
    <Board rows={14} cols={28} bases={bases} />
  )
}

export default GameView;