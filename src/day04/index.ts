import run from "aocrunner"
import { chain, filter, length, map, pipe, split } from "ramda"
import { splitLines } from "../utils/index.js"

const parseInput = pipe(splitLines, map(pipe(split(","), chain(split("-")), map(Number))))

const contained = ([f1, t1, f2, t2]: number[]) => (f1 <= f2 && t1 >= t2) || (f2 <= f1 && t2 >= t1)
const overlapped = ([f1, t1, f2, t2]: number[]) =>
  contained([f1, t1, f2, t2]) || (f1 <= f2 && t1 >= f2) || (f2 <= f1 && t2 >= f1)

const part1 = pipe(parseInput, filter(contained), length)

const part2 = pipe(parseInput, filter(overlapped), length)

run({
  part1: {
    tests: [
      {
        input: `
          2-4,6-8
          2-3,4-5
          5-7,7-9
          2-8,3-7
          6-6,4-6
          2-6,4-8 
        `,
        expected: 2,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          2-4,6-8
          2-3,4-5
          5-7,7-9
          2-8,3-7
          6-6,4-6
          2-6,4-8 
        `,
        expected: 4,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
