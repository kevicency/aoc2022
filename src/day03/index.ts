import run from "aocrunner"
import {
  apply,
  chain,
  converge,
  divide,
  head,
  identity,
  intersection,
  length,
  map,
  o,
  pipe,
  reduce,
  splitAt,
  splitEvery,
  sum,
  tail,
  __,
} from "ramda"
import { splitLines, toCharCode } from "../utils/index.js"

const parseInput = (rawInput: string) => splitLines(rawInput)

const toPriority = (char: string) => toCharCode(char) - (char >= "a" ? 96 : 38)

const part1 = (rawInput: string) =>
  pipe(
    map(converge(splitAt, [o(divide(__, 2), length), identity])),
    chain(apply(intersection)),
    map(toPriority),
    sum,
  )(parseInput(rawInput))

const part2 = (rawInput: string) => {
  return pipe(
    splitEvery(3),
    chain(converge(reduce<string[], string[]>(intersection), [head, tail])),
    map(toPriority),
    sum,
  )(parseInput(rawInput))
}

run({
  part1: {
    tests: [
      {
        input: `
          vJrwpWtwJgWrhcsFMMfFFhFp
          jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
          PmmdzqPrVvPwwTWBwg
          wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
          ttgJtRGJQctTZtZT
          CrZsJsPPZsGzwwsLwLmpwMDw
        `,
        expected: 157,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
        vJrwpWtwJgWrhcsFMMfFFhFp
        jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
        PmmdzqPrVvPwwTWBwg
        wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
        ttgJtRGJQctTZtZT
        CrZsJsPPZsGzwwsLwLmpwMDw
      `,
        expected: 70,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: true,
})
