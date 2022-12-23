import run from "aocrunner"
import { entries } from "lodash-es"
import { map, pipe, sum, uniq } from "ramda"
import { log, splitLines, todo } from "../utils/index.js"

const parseInput = pipe(splitLines, map(Number))

const mix =
  (times = 1) =>
  (xs: number[]) => {
    const acc = xs.map((x, i) => [x, i])

    for (let t = 0; t < times; t++) {
      for (let i = 0; i < acc.length; i++) {
        const start = acc.findIndex(([, x]) => x === i)
        const x = acc[start][0]
        acc.splice(start, 1)
        acc.splice((start + x) % acc.length, 0, [x, i])
      }
    }
    return acc.map(([x]) => x)
  }

const coords = (xs: number[]) =>
  [1000, 2000, 3000].map((i) => {
    const zi = xs.findIndex((x) => x === 0)
    return xs[(zi + i) % xs.length]
  })

const part1 = pipe(parseInput, mix(), coords, sum)

const part2 = pipe(
  parseInput,
  map((x) => x * 811589153),
  mix(10),
  coords,
  sum,
)

run({
  part1: {
    tests: [
      {
        input: `
          1
          2
          -3
          3
          -2
          0
          4
        `,
        expected: 3,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          1
          2
          -3
          3
          -2
          0
          4
        `,
        expected: 1623178306,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
