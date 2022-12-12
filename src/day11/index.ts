import run from "aocrunner"
import {
  add,
  append,
  divide,
  head,
  length,
  lensIndex,
  lensProp,
  match,
  modulo,
  multiply,
  over,
  pluck,
  range,
  reduce,
  sort,
  view,
} from "ramda"
import { floor } from "ramda-adjunct"

import lcm from "lcm"

type Item = number

type Monkey = {
  items: Item[]
  op: (x: Item) => Item
  test: number
  trueMonkey: number
  falseMonkey: number
  inspections: number
}

type Transfer = [Item, number]

const square = (x: number) => x * x
const double = (x: number) => x + x

const parseMonkeys = (input: string): Monkey[] =>
  input
    .trim()
    .split("\n\n")
    .map((block) => {
      const lines = block.split("\n").map((x) => x.trim())
      const items = match(/\d+/g, lines[1]).map((x) => parseInt(x, 10))

      const opNum = head(match(/\d+/g, lines[2]).map((x) => parseInt(x, 10)))
      const isMult = lines[2].includes("*")
      const op = isMult ? (opNum ? multiply(opNum) : square) : opNum ? add(opNum) : double

      const test = match(/\d+/g, lines[3]).map((x) => parseInt(x, 10))[0]
      const trueMonkey = match(/\d+/g, lines[4]).map((x) => parseInt(x, 10))[0]
      const falseMonkey = match(/\d+/g, lines[5]).map((x) => parseInt(x, 10))[0]

      return {
        items,
        op,
        test,
        trueMonkey,
        falseMonkey,
        inspections: 0,
      }
    })

const runMonkey = (monkey: Monkey, lcm: number): Transfer[] =>
  monkey.items.reduce((acc, item) => {
    const result = lcm ? modulo(monkey.op(item), lcm) : floor(divide(monkey.op(item), 3))
    return append(
      [result, modulo(result, monkey.test) ? monkey.falseMonkey : monkey.trueMonkey],
      acc,
    )
  }, [] as Transfer[])

const resetMonkey =
  (inspections: number) =>
  (monkey: Monkey): Monkey => ({
    ...monkey,
    inspections: inspections + monkey.inspections,
    items: [],
  })

const runMonkeys = (monkeys: Monkey[], lcm: number): Monkey[] =>
  monkeys.reduce((acc, _, idx) => {
    const transfers = runMonkey(view(lensIndex(idx), acc), lcm)
    return over(
      lensIndex(idx),
      resetMonkey(length(transfers)),
      transfers.reduce(
        (acc2, [item, monkeyIdx]) =>
          over(lensIndex(monkeyIdx), over(lensProp("items"), append(item)), acc2),
        acc,
      ),
    )
  }, monkeys)

const simulate = (monkeys: Monkey[], rounds: number, lcm: number): Monkey[] =>
  reduce((acc, _) => runMonkeys(acc, lcm), monkeys, range(0, rounds))

const monkeyBusiness = (monkeys: Monkey[]): number => {
  const top: number[] = sort((l, r) => r - l, pluck("inspections", monkeys))
  return multiply(top[0], top[1])
}

async function part1(input: string): Promise<number> {
  return monkeyBusiness(simulate(parseMonkeys(input), 20, 0))
}

async function part2(input: string): Promise<number> {
  const monkeys = parseMonkeys(input)
  return monkeyBusiness(simulate(monkeys, 10000, pluck("test", monkeys).reduceRight(lcm, 1)))
}

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
