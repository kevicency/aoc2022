import run from "aocrunner"
import {
  chain,
  converge,
  head,
  intersection,
  length,
  map,
  pipe,
  reduce,
  splitAt,
  splitEvery,
  sum,
  tail,
} from "ramda"
import { chars, splitLines, toCharCode } from "../utils/index.js"

const prio = (char: string) => toCharCode(char) - (char >= "a" ? 96 : 38)

const parseInput = pipe(splitLines, map(pipe(chars, map(prio))))

const splitHalf = <T>(arr: T[]): [T[], T[]] => splitAt(length(arr) / 2, arr)
const intersectAll = converge(reduce<number[], number[]>(intersection), [head, tail])

const part1 = pipe(parseInput, map(splitHalf), chain(intersectAll), sum)
const part2 = pipe(parseInput, splitEvery(3), chain(intersectAll), sum)

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
  onlyTests: false,
})
