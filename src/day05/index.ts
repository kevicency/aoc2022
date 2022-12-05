import run from "aocrunner"
import {
  addIndex,
  adjust,
  apply,
  complement,
  concat,
  converge,
  drop,
  dropLast,
  equals,
  filter,
  fromPairs,
  head,
  identity,
  join,
  map,
  match,
  pipe,
  prop,
  reduce,
  reverse,
  split,
  splitEvery,
  take,
  transpose,
  values,
} from "ramda"
import { splitBlocks, splitLines } from "../utils/index.js"

const parseCrates: (line: string) => string[] = pipe(split(""), splitEvery(4), map(prop<string>(1)))
const buildStack: (block: string) => Record<string, string[]> = pipe(
  splitLines,
  map(parseCrates),
  dropLast(1),
  transpose,
  map(filter((x) => x !== " ")),
  mapIndexed((val, index) => [index, val]),
  fromPairs,
)

const parseCommands: (block: string) => number[][] = pipe(
  match(/(\d+)/g),
  map(Number),
  splitEvery(3) as (xs: number[]) => number[][],
  map(mapIndexed((val, index) => val - 1 * (index !== 0))),
)

const parseInput: (raw: string) => [Record<string, string[]>, number[][]] = pipe(
  splitBlocks,
  adjust(0, buildStack),
  adjust(1, parseCommands),
)

const solve = (part1: boolean) =>
  pipe(
    parseInput,
    apply(
      reduce((acc, [count, from, to]) => ({
        ...acc,
        [from]: drop(count, acc[from]),
        [to]: converge(concat, [
          pipe(prop(from), take(count), part1 ? reverse : identity),
          prop(to),
        ])(acc),
      })),
    ),
    values,
    map(head),
    join(""),
  )

const part1 = solve(true)
const part2 = solve(false)

run({
  part1: {
    tests: [
      {
        input: `    [D]    
[N] [C]    
[Z] [M] [P]
1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`,
        expected: "CMZ",
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
  trimTestInputs: false,
  onlyTests: false,
})
