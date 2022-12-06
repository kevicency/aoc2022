import run from "aocrunner"
import { pair, pipe, reduce, reduced, takeLast, uniq } from "ramda"
import { mapIndexed } from "../utils/index.js"

const parseInput = (rawInput: string) => rawInput.split("")

const findMarker =
  (length: number) =>
  (acc: string[], [char, idx]: [string, number]) => {
    const next = takeLast(length, [...acc, char])
    return uniq(next).length === length ? reduced(idx + 1) : next
  }

const part1 = pipe(parseInput, mapIndexed(pair), reduce(findMarker(4), []))
const part2 = pipe(parseInput, mapIndexed(pair), reduce(findMarker(14), []))

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
