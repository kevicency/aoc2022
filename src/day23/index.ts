import run from "aocrunner"
import { map, pipe, range, split } from "ramda"
import { splitLines } from "../utils/index.js"

const p = (x: number, y: number) => `${x},${y}`
const xy = pipe(split(","), map(Number))

const parseElves = (lines: string[]) =>
  new Set(
    lines
      .flatMap((line, y) => line.split("").map((c, x) => (c === "#" ? p(x, y) : null)))
      .filter(Boolean) as string[],
  )

const parseInput = pipe(splitLines, parseElves)

const DIRECTIONS = [0, 1, 2, 3, 4, 5, 6, 7]
const [N, NE, E, SE, S, SW, W, NW] = DIRECTIONS
const LOOK_DIRECTIONS = [
  [N, NW, NE],
  [S, SE, SW],
  [W, NW, SW],
  [E, NE, SE],
]
const deltas = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]
const move = (x: number, y: number, dir: number) => {
  const [dx, dy] = deltas[dir]
  return p(x + dx, y + dy)
}
const neighbours = (x: number, y: number, dirs = DIRECTIONS) => dirs.map((dir) => move(x, y, dir))

const findFirstValidDir = (queue: number[][], x: number, y: number, elves: Set<string>) => {
  for (const dirs of queue) {
    const ns = neighbours(x, y, dirs)

    if (ns.some((n) => elves.has(n))) {
      continue
    }

    return dirs[0]
  }
  return null
}

const step = (elves: Set<string>, gen: number) => {
  const proposals = Array.from(elves)
    .map(xy)
    .reduce((acc, [x, y]) => {
      const ns = neighbours(x, y)
      if (ns.some((n) => elves.has(n))) {
        acc.set(p(x, y), null)
      }
      return acc
    }, new Map<string, string | null>())

  const lookDirectionQueue = range(0, 4).map(
    (i) => LOOK_DIRECTIONS[(i + gen) % LOOK_DIRECTIONS.length]!,
  )
  Array.from(proposals.keys())
    .map(xy)
    .forEach(([x, y]) => {
      const dir = findFirstValidDir(lookDirectionQueue, x, y, elves)

      if (dir !== null) {
        proposals.set(p(x, y), move(x, y, dir))
      } else {
        proposals.delete(p(x, y))
      }
    })

  const validDestinations = Array.from(proposals.values())
    .filter((s: string | null): s is string => Boolean(s))
    .reduce((acc, pos) => {
      acc.set(pos, !acc.has(pos))
      return acc
    }, new Map<string, boolean>())

  return new Set(
    [...elves.keys()]
      .map((pos) => [pos, proposals.get(pos)] as const)
      .map(([curr, next]) => (next && validDestinations.get(next!) ? next : curr)),
  )
}

const prettyPrint = (elves: Set<string>) => {
  const xys = Array.from(elves).map(xy)
  const [minX, maxX] = [Math.min(...xys.map(([x]) => x)), Math.max(...xys.map(([x]) => x))]
  const [minY, maxY] = [Math.min(...xys.map(([, y]) => y)), Math.max(...xys.map(([, y]) => y))]

  range(minY, maxY + 1).forEach((y) => {
    range(minX, maxX + 1).forEach((x) => {
      process.stdout.write(elves.has(p(x, y)) ? "#" : ".")
    })
    process.stdout.write("\n")
  })
  console.log()
}

const setEquals = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a.keys()].every((k) => b.has(k))

const simulate = (steps: number) => (elves: Set<string>) => {
  let gen = 0
  // prettyPrint(elves)
  while (true) {
    const next = step(elves, gen)
    gen += 1

    // console.log(`ROUND: ${gen}`)
    // prettyPrint(elves)
    // console.log()

    if (gen > steps) {
      break
    }
    if (steps === Infinity && setEquals(elves, next)) {
      break
    }

    elves = next
  }
  return [elves, gen] as const
}

const countEmptyGround = (elves: Set<string>) => {
  const [minX, maxX, minY, maxY] = Array.from(elves)
    .map(xy)
    .reduce(
      ([minX, maxX, minY, maxY], [x, y]) => [
        Math.min(minX, x),
        Math.max(maxX, x),
        Math.min(minY, y),
        Math.max(maxY, y),
      ],
      [Infinity, -Infinity, Infinity, -Infinity],
    )
  const area = (maxX - minX + 1) * (maxY - minY + 1)

  return area - elves.size
}

const part1 = pipe(parseInput, simulate(10), ([elves]) => countEmptyGround(elves))

const part2 = pipe(parseInput, simulate(Infinity), ([_, gen]) => gen)

run({
  part1: {
    tests: [
      {
        input: `
          .....
          ..##.
          ..#..
          .....
          ..##.
          .....
        `,
        expected: 25,
      },
      {
        input: `
          ....#..
          ..###.#
          #...#.#
          .#...##
          #.###..
          ##.#.##
          .#..#..
        `,
        expected: 110,
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
