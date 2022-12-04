import run from "aocrunner"
import { pipe } from "ramda"
import { log } from "../utils/index.js"

const parseInput = (rawInput: string) => rawInput

const part1 = pipe(parseInput, log)

const part2 = pipe(parseInput, log)

run({
  part1: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
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
