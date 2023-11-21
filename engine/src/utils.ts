export function make2dArray<Type> (rows: number, cols: number, init: () => Type): Type[][] {
  const arr: Type[][] = []
  for (let i = 0; i < rows; i++) {
    const row: Type[] = []
    for (let j = 0; j < cols; j++) {
      row.push(init())
    }
    arr.push(row)
  }
  return arr
}
