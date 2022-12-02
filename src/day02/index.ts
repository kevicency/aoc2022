import run from "aocrunner"
import { map, pipe, sum } from "ramda"
import { splitLines, splitPair, toCharCode } from "../utils/index.js"

const normalize = (char: string) =>
  toCharCode(char) - toCharCode(char >= "X" ? "X" : "A") + 1

const parseInput = (rawInput: string) =>
  pipe(splitLines, map(pipe(splitPair, map(normalize))))(rawInput)

const score = ([op, me]: number[]) =>
  me + 3 * (me === (op % 3) + 1 ? 2 : +(me === op))

const part1 = (rawInput: string) => pipe(map(score), sum)(parseInput(rawInput))

const choosePlay = ([op, me]: number[]) => [
  op,
  [(op + 3) % 4 || 3, op, (op % 3) + 1][me - 1],
]

const part2 = (rawInput: string) =>
  pipe(map(choosePlay), map(score), sum)(parseInput(rawInput))

run({
  part1: {
    tests: [
      {
        input: `
          A Y
          B X
          C Z
        `,
        expected: 15,
      },
      {
        input: `
          A X
          A Y
          A Z
          B X
          B Y
          B Z
          C X
          C Y
          C Z
        `,
        expected: 45,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          A Y
          B X
          C Z
        `,
        expected: 12,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: true,
})
