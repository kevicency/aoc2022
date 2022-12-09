import run from "aocrunner"
import {
  identity,
  map,
  max,
  maxBy,
  multiply,
  pipe,
  product,
  range,
  reduce,
  sum,
  T,
  takeWhile,
  xprod,
} from "ramda"
import { log, todo } from "../utils/index.js"

const parseInput = (rawInput: string) => Array.from(rawInput.matchAll(/\d/g)).map(Number)

const solve1 = (trees: number[]) => {
  const size = Math.sqrt(trees.length)
  const coords = xprod(range(1, size - 1), range(1, size - 1))
  const isVisibleTree = trees.map((_) => true)
  const idx = (x: number, y: number) => x + y * size
  for (const [x, y] of coords) {
    const i = idx(x, y)
    const tree = trees[i]
    isVisibleTree[i] =
      range(0, x).every((dx) => trees[idx(dx, y)] < tree) ||
      range(x + 1, size).every((dx) => trees[idx(dx, y)] < tree) ||
      range(0, y).every((dy) => trees[idx(x, dy)] < tree) ||
      range(y + 1, size).every((dy) => trees[idx(x, dy)] < tree)
  }
  return isVisibleTree.filter(identity).length
}

const part1 = pipe(parseInput, solve1)

const countTrees = (arr: boolean[]) =>
  arr.every(identity) ? arr.length : takeWhile(identity, arr).length + 1

const solve2 = (trees: number[]) => {
  const size = Math.sqrt(trees.length)
  const coords = xprod(range(0, size), range(0, size))
  const visibleTrees = trees.map((_) => [] as number[])
  const idx = (x: number, y: number) => x + y * size
  for (const [x, y] of coords) {
    const i = idx(x, y)
    const tree = trees[i]
    visibleTrees[i] = [
      map((dx) => trees[idx(x - dx + 1, y)] < tree, range(0, x)),
      map((dx) => trees[idx(x + dx + 1, y)] < tree, range(0, size - x - 1)),
      map((dy) => trees[idx(x, y - dy - 1)] < tree, range(0, y)),
      map((dy) => trees[idx(x, y + dy + 1)] < tree, range(0, size - y - 1)),
    ].map(countTrees)
  }
  const scenic = visibleTrees.map((arr) => reduce(multiply, 1, arr))
  return reduce(max, 0, scenic)
}
const part2 = pipe(parseInput, solve2)

run({
  part1: {
    tests: [
      {
        input: `
          30373
          25512
          65332
          33549
          35390
        `,
        expected: 21,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          30373
          25512
          65332
          33549
          35390
        `,
        expected: 8,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: true,
})
