import run from "aocrunner"
import {
  comparator,
  gt,
  head,
  map,
  max,
  pipe,
  reduce,
  sort,
  split,
  sum,
  take,
} from "ramda"

const parseInput = (rawInput: string) =>
  pipe(
    split(/\n{2,}/g),
    map(pipe(split("\n"), map(Number))),
    map(sum),
    sort(comparator(gt)),
  )(rawInput)

const part1 = (rawInput: string) => head(parseInput(rawInput))

const part2 = (rawInput: string) => pipe(take(3), sum)(parseInput(rawInput))

run({
  part1: {
    tests: [
      {
        input: `
          1000
          2000
          3000

          4000

          5000
          6000

          7000
          8000
          9000

          10000
      `,
        expected: 24000,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          1000
          2000
          3000

          4000

          5000
          6000

          7000
          8000
          9000

          10000
      `,
        expected: 45000,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
