import run from "aocrunner"
import { equals, map, max, min, pipe, range, split, tail, xprod, zip } from "ramda"
import { curryRight } from "ramda-adjunct"
import { splitLines } from "../utils/index.js"

const parse = (arg: string) => arg.split(",").map(Number)
const encode = (...arg: number[]) => arg.join(",")

const generateMap = (rows: string[][]) => {
  return rows
    .flatMap((row) => zip(row, tail(row)))
    .flatMap(([start, end]) => {
      const [x1, y1] = parse(start)
      const [x2, y2] = parse(end)
      return xprod(range(min(x1, x2), max(x1, x2) + 1), range(min(y1, y2), max(y1, y2) + 1))
    })
    .reduce(
      (acc, [x, y]) => {
        acc.blocked.add(encode(x, y))
        acc.maxY = Math.max(acc.maxY, y)
        return acc
      },
      {
        blocked: new Set<string>(),
        maxY: 0,
      },
    )
}

const parseInput = pipe(splitLines, map(split(" -> ")), generateMap)

const simulateSand = curryRight(
  ({ blocked, maxY }: ReturnType<typeof generateMap>, hasFloor: boolean) => {
    const origin = [500, 0]
    let size = blocked.size
    let [sx, sy] = origin

    while (true) {
      if (sy >= maxY && !hasFloor) break

      const next = [
        [sx, sy + 1],
        [sx - 1, sy + 1],
        [sx + 1, sy + 1],
      ].find(([x, y]) => !blocked.has(encode(x, y)) && y < maxY + 2)
      if (next) {
        ;[sx, sy] = next
      } else {
        blocked.add(encode(sx, sy))
        if (hasFloor && equals([sx, sy], origin)) break
        ;[sx, sy] = origin
      }
    }

    return blocked.size - size
  },
)

const part1 = pipe(parseInput, simulateSand(false))

const part2 = pipe(parseInput, simulateSand(true))

run({
  part1: {
    tests: [
      {
        input: `
        498,4 -> 498,6 -> 496,6
        503,4 -> 502,4 -> 502,9 -> 494,9
      `,
        expected: 24,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
        498,4 -> 498,6 -> 496,6
        503,4 -> 502,4 -> 502,9 -> 494,9
      `,
        expected: 93,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
