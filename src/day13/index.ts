import run from "aocrunner"
import { chain, concat, equals, identity, pipe, product, split, sum, zip } from "ramda"
import { isNumber, mapIndexed } from "ramda-adjunct"

const parseInput = pipe(split(/\n\s*\n/), (pairs) =>
  pairs.map((pair) => pair.split("\n").map((x) => JSON.parse(x.trim()))),
)

type Packet = number | Packet[]

const compare = (left: Packet, right: Packet): number => {
  if (isNumber(left) && isNumber(right)) return Math.sign(right - left)
  if (isNumber(left)) {
    left = [left]
  }
  if (isNumber(right)) {
    right = [right]
  }

  for (const c of zip(left, right).map(([lxs, rxs]) => compare(lxs, rxs))) {
    if (c !== 0) return c
  }

  return Math.sign(right.length - left.length)
}

const part1 = pipe(
  parseInput,
  mapIndexed(([left, right], i) => (compare(left, right) >= 0 ? i + 1 : 0)),
  sum,
)

const dividers: Packet[] = [[[2]], [[6]]]
const part2 = pipe(
  parseInput,
  chain(identity),
  concat(dividers),
  (packets: Packet[]) => packets.sort(compare).reverse(),
  mapIndexed((packet, i) => (dividers.some((divider) => equals(packet, divider)) ? i + 1 : 1)),
  product,
)

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
        expected: 140,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
