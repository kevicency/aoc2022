import run from "aocrunner"
import { isNumber, noop } from "lodash-es"
import { max, pipe, split } from "ramda"
import { log, Print, splitBlocks, todo } from "../utils/index.js"

const print: Print = noop

const parseInput = pipe(splitBlocks, ([cells, commands]) => ({
  cells: cells
    .split("\n")
    .map((x) => x.split("").map((c) => (c === "" ? " " : c)))
    .filter((row) => row.length > 0),
  commands: commands.match(/(\d+|[RL])/g)!.map((x) => (/\d/.test(x) ? +x : x)),
}))

type State = { x: number; y: number; dir: number }
type Cells = ReturnType<typeof parseInput>["cells"]
type Command = ReturnType<typeof parseInput>["commands"][number]
type Grid = {
  cells: Cells
  width: number
  height: number
}

const [E, S, W, N] = [0, 1, 2, 3]
const dirChars = [">", "v", "<", "^"]
const delta = (dir: number) =>
  [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ][dir]
const wrap = (n: number, max: number) => (n < 0 ? max - 1 : n % max)
const peekNext = (grid: Grid, state: State) => {
  const [dx, dy] = delta(state.dir)
  let { x, y } = state
  let c = undefined
  do {
    x = wrap(x + dx, grid.width)
    y = wrap(y + dy, grid.height)
    c = grid.cells[y][x]
  } while (c === " " || c === undefined)
  return [c, { x, y }] as const
}
const handle = (state: State, cmd: Command, grid: Grid): State => {
  if (isNumber(cmd)) {
    const [c, next] = cmd !== 0 ? peekNext(grid, state) : ["#", state]
    if (c === "#") {
      return state
    }
    return handle(
      {
        ...state,
        ...next,
      },
      cmd - 1,
      grid,
    )
  } else {
    return {
      ...state,
      dir: (state.dir + (cmd === "R" ? 1 : 3)) % 4,
    }
  }
}
const prettyPrint = (state: State, { cells }: Grid) => {
  cells.forEach((row, y) => {
    const line = row
      .map((c, x) => (x === state.x && y === state.y ? dirChars[state.dir] : c))
      .join("")
    print(line)
  })
}

const part1 = pipe(parseInput, ({ cells, commands }: ReturnType<typeof parseInput>) => {
  const grid = {
    width: cells.map((row) => row.length).reduce(max),
    height: cells.length,
    cells,
  }
  const state = commands.reduce(
    (curr, cmd) => {
      print(`=== === CMD: ${cmd} === ===`)
      const next = handle(curr, cmd, grid)
      prettyPrint(next, grid)
      print()
      return next
    },
    { x: cells[0].findIndex((c) => c !== " "), y: 0, dir: E },
  )

  return 1000 * (state.y + 1) + 4 * (state.x + 1) + state.dir
})

const part2 = pipe(parseInput, todo)

run({
  part1: {
    tests: [
      {
        input: `
        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5
        `,
        expected: 6032,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: false,
  onlyTests: false,
})
