import run from "aocrunner"
import { flip, pair, pipe, reduce, reduced, split, takeLast, uniq } from "ramda"
import { mapIndexed } from "../utils/index.js"

const parseInput = pipe(split(""), mapIndexed(flip(pair)))

const findMarker =
  (length: number) =>
  (acc: [string[]], [idx, char]: [number, string]) => {
    const next = takeLast(length, [...acc, char])
    return uniq(next).length === length ? reduced(idx + 1) : next
  }

const part1 = pipe(parseInput, reduce(findMarker(4), []))
const part2 = pipe(parseInput, reduce(findMarker(14), []))

run({
  part1: {
    tests: [
      {
        input: `mjqjpqmgbljsphdztnvjfqwrcgsmlb`,
        expected: 7,
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
