import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface BaseLocation {
  owner: number;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface BoardProps {
  rows: number;
  cols: number;
  bases: Array<BaseLocation>;
}

interface Cell {
  owner: number;
  isBase: boolean;
}

function createBoard(rows: number, cols: number, bases: BaseLocation[]): Cell[][] {
  const boardStates: Cell[][] = new Array(rows);
  for (let i = 0; i < boardStates.length; i++) {
    boardStates[i] = new Array(cols);
    for (let j = 0; j < boardStates[i].length; j++) {
      boardStates[i][j] = {
        owner: 0,
        isBase: false
      };
    }
  }

  bases.forEach(loc => {
    for (let i = loc.startRow; i <= loc.endRow; i++) {
      for (let j = loc.startCol; j <= loc.endCol; j++) {
        boardStates[i][j] = {
          owner: loc.owner,
          isBase: true,
        }
      }
    }
  })

  return boardStates;
}

function Board(props: BoardProps) {
  const [boardState, setBoardState] = useState([] as Cell[][]);
  useEffect(() => {
    console.log("RERENDERING");
    setBoardState(createBoard(props.rows, props.cols, props.bases) as never[])
  }, [])


  const colors = ["#fff", "#f8a", "#8fa", "#a8f", "#af8", "#fa8", "#8af"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        justifyContent: "center",
        backgroundColor: "#eeeeee",
      }}
    >
      {boardState.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1px",
            justifyContent: "center",
          }}
        >
          {row.map((val, j) => (
            <Button
              key={j}
              size="sm"
              maxWidth="2em"
              maxHeight="3em"
              backgroundColor={colors[val.owner]}
              borderWidth={val.isBase ? "0.10em" : "0"}
              borderRadius={0}
              borderColor="black"
              margin="1px"
              isDisabled={val.isBase}
              onClick={() => {
                const newBoardState = boardState.map((rowValue, rowIndex) => {
                  if (rowIndex !== i) return rowValue; 
                  return rowValue.map((colValue, colIndex) => {
                    if (colIndex !== j) return colValue;
                    return {
                      ...colValue,
                      owner: 1,
                    }
                  })
                })
                setBoardState(newBoardState);
              }}
            >
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
