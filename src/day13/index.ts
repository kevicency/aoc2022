import run from "aocrunner"
import { head, sort, split, sum } from "ramda"
import { isArray, isNumber } from "ramda-adjunct"

type Val = number | Vals
type Vals = Val[]
type Group = {
  first: Vals
  second: Vals
}

type EvalResult = "ordered" | "unordered" | "unsure"

const checkOrder = ([left, right]: [Val, Val]): EvalResult => {
  if (isNumber(left) && isNumber(right)) {
    return left === right ? "unsure" : left < right ? "ordered" : "unordered"
  }
  if (isArray(left) && isArray(right)) {
    if (left.length === 0 && right.length === 0) {
      return "unsure"
    }
    if (left.length === 0 || right.length === 0) {
      return left.length === 0 ? "ordered" : "unordered"
    }
    const headRes = checkOrder([head(left)!, head(right)!])
    return headRes === "unsure" ? checkOrder([left.slice(1), right.slice(1)]) : headRes
  }
  if (isNumber(left) && isArray(right)) {
    return checkOrder([[left], right])
  }
  if (isArray(left) && isNumber(right)) {
    return checkOrder([left, [right]])
  }
  return "unordered"
}

async function part1(input: string): Promise<number> {
  const groups = split(/\n\s*\n/, input).map((group) => {
    const [first, second] = group.split("\n").map((x) => JSON.parse(x.trim()))
    return { first, second } as Group
  })

  return sum(
    groups.map((group, idx) =>
      checkOrder([group.first, group.second]) === "ordered" ? idx + 1 : 0,
    ),
  )
}

async function part2(input: string): Promise<number> {
  const targets = [[[2]], [[6]]]
  const groups: Vals[] = split(/\n\s*\n/, input)
    .flatMap((group) => group.split("\n").map((x) => JSON.parse(x.trim())))
    .concat(targets)
  const sorted = sort((a, b) => (checkOrder([a, b]) === "ordered" ? -1 : 1), groups)
  const indices = targets.map((target) => sorted.indexOf(target) + 1)
  return indices[0] * indices[1]
}

run({
  part1: {
    tests: [
      {
        input: `
          [1,1,3,1,1]
          [1,1,5,1,1]

          [[1],[2,3,4]]
          [[1],4]

          [9]
          [[8,7,6]]

          [[4,4],4,4]
          [[4,4],4,4,4]

          [7,7,7,7]
          [7,7,7]

          []
          [3]

          [[[]]]
          [[]]

          [1,[2,[3,[4,[5,6,7]]]],8,9]
          [1,[2,[3,[4,[5,6,0]]]],8,9]
        `,
        expected: 13,
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
