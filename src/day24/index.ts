import run from "aocrunner"
import { fromPairs } from "lodash-es"
import { partition, pipe, range, length, prop, add } from "ramda"
import { log, splitLines, todo } from "../utils/index.js"

const BLIZZARDS = [0, 1, 2, 3].map((i) => 2 << i)
const [N, E, S, W] = BLIZZARDS
const dir = (c: string) => 2 << ["^", ">", "v", "<"].indexOf(c)

const hasDir = (v: number, d: number) => (v & d) === d

const parseLines = (lines: string[]) => ({
  start: { x: 1, y: 0 },
  finish: { x: [lines[0].length, lines.length][0] - 2, y: [lines[0].length, lines.length][1] - 1 },
  grid: lines.map((row) => row.split("").map((c) => (c === "#" ? -1 : dir(c)))),
})
type Input = ReturnType<typeof parseLines>

const wrapY = (grid: number[][], x: number, y: number) =>
  grid[y][x] === -1 ? (y === 0 ? grid.length - 2 : 1) : y
const wrapX = (grid: number[][], x: number, y: number) =>
  grid[y][x] === -1 ? (x === 0 ? grid[y].length - 2 : 1) : x
const moveBlizzard = (grid: number[][], x: number, y: number, blizzard: number) => {
  switch (blizzard) {
    case N:
      return [x, wrapY(grid, x, y - 1)] as const
    case E:
      return [wrapX(grid, x + 1, y), y] as const
    case S:
      return [x, wrapY(grid, x, y + 1)] as const
    case W:
      return [wrapX(grid, x - 1, y), y] as const
  }
  return [x, y] as const
}

const step = (grid: Input["grid"]) => {
  const blizzards = grid
    .flatMap((row, y) => row.map((v, x) => (v > 0 ? [x, y, v] : null)))
    .filter((r: number[] | null): r is [number, number, number] => r?.length === 3)
  return blizzards.reduce(
    (grid, [x, y, v]) => {
      BLIZZARDS.forEach((dir) => {
        if (hasDir(v, dir)) {
          const [nx, ny] = moveBlizzard(grid, x, y, dir)
          grid[ny][nx] |= dir
        }
      })
      return grid
    },
    grid.map((row, y) => row.map((v, x) => (v === -1 ? -1 : 0))),
  )
}

const validMoves = (x: number, y: number, grid: Input["grid"]) =>
  (
    [
      [x, y - 1, "u"],
      [x + 1, y, "r"],
      [x, y + 1, "d"],
      [x - 1, y, "l"],
      [x, y, "w"],
    ] as const
  ).filter(([nx, ny]) => grid[ny]?.[nx] === 0)

type Node = { x: number; y: number; grid: Input["grid"]; path: string[] }
const keyFn = ({ x, y, path }: Node) => `${x},${y}@${path.length}`
const findPath = ({ start, finish, grid }: Input) => {
  const initial: Node = { x: start.x, y: start.y, grid, path: [] }
  const backlog = [initial]
  const visited = new Set<string>([keyFn(initial)])
  const grids = [initial.grid]
  while (backlog.length) {
    const { x, y, grid, path } = backlog.shift()!

    const next = (grids[path.length + 1] ??= step(grid))
    for (const [mx, my, move] of validMoves(x, y, next)) {
      const nextPath = [...path, move]
      if (mx === finish.x && my === finish.y) return { path: nextPath, grid: next }

      const nextNode = { x: mx, y: my, grid: next, path: nextPath }
      const key = keyFn(nextNode)
      if (!visited.has(key)) {
        visited.add(key)
        backlog.push(nextNode)
      }
    }
  }

  return { path: [], grid }
}

const parseInput = pipe(splitLines, parseLines)

const part1 = pipe(parseInput, findPath, prop("path"), length)

const part2 = pipe(parseInput, ({ start, finish, grid }) => {
  const r1 = findPath({ start, finish, grid })
  const r2 = findPath({ start: finish, finish: start, grid: r1.grid })
  const r3 = findPath({ start, finish, grid: r2.grid })
  return [r1, r2, r3].map(({ path }) => path.length).reduce(add)
})

run({
  part1: {
    tests: [
      {
        input: `
          #.######
          #>>.<^<#
          #.<..<<#
          #>v.><>#
          #<^v^^>#
          ######.#
        `,
        expected: "",
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
  trimTestInputs: true,
  onlyTests: false,
})
