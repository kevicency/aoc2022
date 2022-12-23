import run from "aocrunner"
import { isNumber, minBy, noop, omit } from "lodash-es"
import { max, pipe } from "ramda"
import { padCharsEnd } from "ramda-adjunct"
import { Print, splitBlocks } from "../utils/index.js"

let log: Print = noop

const parseInput = pipe(splitBlocks, ([cells, commands]) => ({
  cells: cells
    .split("\n")
    .map((x) => x.split("").map((c) => (c === "" ? " " : c)))
    .filter((row) => row.length > 0),
  commands: commands.match(/(\d+|[RL])/g)!.map((x) => (/\d/.test(x) ? +x : x)),
}))

type Cells = ReturnType<typeof parseInput>["cells"]
type Command = ReturnType<typeof parseInput>["commands"][number]
type Region = { id: number; cells: Cells; size: number; x: number; y: number }
type Cube = Map<number, Region>
type State = { x: number; y: number; dir: number; region: Region }

const [E, S, W, N] = [0, 1, 2, 3]
const dirChars = [">", "v", "<", "^"]
const delta = (dir: number) =>
  [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ][dir]
const flip = (dir: number) => (dir + 2) % 4
const isVoid = (c?: string) => c === " " || c === undefined
const wrap = (n: number, max: number) => (n < 0 ? max - 1 : n % max)

type Peek = (state: State) => readonly [string, State]
const peekRegion =
  ({ size, cells }: Region): Peek =>
  (state: State) => {
    const [dx, dy] = delta(state.dir)
    let { x, y } = state
    let c = undefined
    do {
      x = wrap(x + dx, size)
      y = wrap(y + dy, size)
      c = cells[y]?.[x]
    } while (isVoid(c))
    return [c, { ...state, x, y }] as const
  }

const move = (
  state: State,
  cmd: Command,
  peek: (state: State) => readonly [string, State],
  initial?: State, // just for logging
): State => {
  if (isNumber(cmd)) {
    const [c, next] = cmd > 0 ? peek(state) : [state.region.cells[state.y][state.x], state]

    if (c === "#" || cmd === 0) {
      const curr = initial ?? state
      log(
        `peek: ${c}`,
        { x: curr.x, y: curr.y, dir: dirChars[curr.dir], r: curr.region.id },
        { x: next.x, y: next.y, dir: dirChars[next.dir], r: next.region.id },
      )
      prettyPrint2(curr, next)
      log("\n")
      return state
    }
    return move(next, cmd - 1, peek, initial ?? state)
  } else {
    const next = { ...state, dir: (state.dir + (cmd === "R" ? 1 : 3)) % 4 }
    log(`turn: ${dirChars[state.dir]} -> ${dirChars[next.dir]}`)
    return next
  }
}

const solve = (initialState: State, commands: Command[], peek: Peek) => {
  const state = commands.reduce((curr, cmd) => {
    log(`=== === CMD: ${cmd} === ===`)
    return move(curr, cmd, peek)
  }, initialState)

  const x = state.region.size * state.region.x + state.x + 1
  const y = state.region.size * state.region.y + state.y + 1

  return 1000 * y + 4 * x + state.dir
}

const part1 = pipe(parseInput, ({ cells, commands }: ReturnType<typeof parseInput>) => {
  const size = Math.max(cells.map((row) => row.length).reduce(max), cells.length)
  const initialState = {
    x: cells[0].findIndex((c) => c !== " "),
    y: 0,
    dir: E,
    region: { id: 0, cells, size, x: 0, y: 0 },
  }

  return solve(initialState, commands, peekRegion(initialState.region))
})

const findRegions = (cells: Cells) => {
  const width = cells.map((row) => row.length).reduce(max)
  const height = cells.length
  const size = [50, 4].find((x) => width % x === 0)!
  const regions = [] as Region[]
  for (let y = 0; y < height; y += size) {
    const row = cells[y]
    for (let x = 0; x < width; x += size) {
      if (isVoid(row[x])) continue
      const region = cells.slice(y, y + size).map((row) => row.slice(x, x + size))
      regions.push({
        id: regions.length + 1,
        cells: region,
        size: size,
        x: x / size,
        y: y / size,
      })
    }
  }
  return regions
}
const outOfBounds = (n: number, size: number) => n < 0 || n >= size
const moveToNextRegion = ({ region: { id, size }, dir, x, y }: State, cube: Cube): State => {
  const max = size - 1
  const region = (id: number) => cube.get(id)!
  switch (`${id}${dirChars[dir]}`) {
    case "1>":
      return { region: region(2), x: 0, y, dir }
    case "1v":
      return { region: region(3), x, y: 0, dir }
    case "1<":
      return { region: region(4), x: 0, y: max - y, dir: flip(dir) }
    case "1^":
      return { region: region(6), x: 0, y: x, dir: E }
    case "2>":
      return { region: region(5), x: max, y: max - y, dir: flip(dir) }
    case "2v":
      return { region: region(3), x: max, y: x, dir: W }
    case "2<":
      return { region: region(1), x: max, y, dir }
    case "2^":
      return { region: region(6), x, y: max, dir }
    case "3>":
      return { region: region(2), x: y, y: max, dir: N }
    case "3v":
      return { region: region(5), x, y: 0, dir }
    case "3<":
      return { region: region(4), x: y, y: 0, dir: S }
    case "3^":
      return { region: region(1), x, y: max, dir }
    case "4>":
      return { region: region(5), x: 0, y, dir }
    case "4v":
      return { region: region(6), x, y: 0, dir }
    case "4<":
      return { region: region(1), x: 0, y: max - y, dir: flip(dir) }
    case "4^":
      return { region: region(3), x: 0, y: x, dir: E }
    case "5>":
      return { region: region(2), x: max, y: max - y, dir: flip(dir) }
    case "5v":
      return { region: region(6), x: max, y: x, dir: W }
    case "5<":
      return { region: region(4), x: max, y, dir }
    case "5^":
      return { region: region(3), x, y: max, dir }
    case "6>":
      return { region: region(5), x: y, y: max, dir: N }
    case "6v":
      return { region: region(2), x, y: 0, dir }
    case "6<":
      return { region: region(1), x: y, y: 0, dir: S }
    case "6^":
      return { region: region(4), x, y: max, dir }
  }
  throw new Error(`Unknown region transiton ${id}${dirChars[dir]}`)
}
const peekCube = (cube: Cube) => (state: State) => {
  const [dx, dy] = delta(state.dir)
  let next: State = {
    ...state,
    x: state.x + dx,
    y: state.y + dy,
  }
  if (outOfBounds(next.x, state.region.size) || outOfBounds(next.y, state.region.size)) {
    next = moveToNextRegion(next, cube)
  }
  const c = next.region.cells[next.y][next.x]!

  return [c, next] as const
}

const prettyPrint2 = (state: State, next: State) => {
  const region = state.region
  const other = next.region

  log(
    padCharsEnd(" ", region.size, `R: ${region.id}`) + "  " + other
      ? padCharsEnd(" ", region.size, `R: ${other.id}`)
      : "",
  )
  region.cells.forEach((row, y) => {
    const line = row
      .map((c, x) => (x === state.x && y === state.y ? dirChars[state.dir] : c))
      .join("")
    const lineOther = other
      ? other.cells[y]
          .map((c, x) => {
            if (x === next.x && y === next.y) {
              return c === "#" ? "X" : dirChars[next.dir]
            }
            return c
          })
          .join("")
      : ""
    log(line + "  " + lineOther)
  })
}

const part2 = pipe(parseInput, ({ cells, commands }: ReturnType<typeof parseInput>) => {
  const regions = findRegions(cells)
  const cube = new Map(regions.map((r) => [r.id, r]))
  const initialRegion = minBy(
    regions.filter((r) => r.y === 0),
    (r) => r.x,
  )!
  const initialState: State = {
    x: initialRegion.cells[0].findIndex((c) => c !== " "),
    y: 0,
    dir: E,
    region: initialRegion,
  }

  return solve(initialState, commands, peekCube(cube))
})

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
    tests: [],
    solution: part2,
  },
  trimTestInputs: false,
  onlyTests: false,
})
