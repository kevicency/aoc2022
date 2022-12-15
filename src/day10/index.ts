import run from "aocrunner"
import { chain, join, lensIndex, map, pipe, repeat, set, split, splitEvery, trim } from "ramda"
import { inRange } from "ramda-adjunct"

const getInstructions = pipe(
  trim,
  split("\n"),
  map(trim),
  chain((x) => (x.startsWith("addx") ? ["addx 0", x] : [x])),
  map(split(" ")),
)

async function part1(input: string): Promise<number> {
  const [x, _] = getInstructions(input).reduce(
    ([strength, register], x, idx) => [
      (idx + 1 - 20) % 40 === 0 ? strength + (idx + 1) * register : strength,
      x.length === 1 ? register : register + parseInt(x[1], 10),
    ],
    [0, 1],
  )
  return x
}

async function part2(input: string): Promise<string> {
  const [_, crt] = getInstructions(input).reduce(
    ([register, crt], x, idx) => {
      const [row, col] = [Math.floor(idx / 40), idx % 40]
      const draw = inRange(register - 1, register + 2, col) ? "█" : " "
      return [
        x.length === 1 ? register : register + parseInt(x[1], 10),
        set(lensIndex(row), set(lensIndex(col), draw, crt[row]), crt),
      ]
    },
    [1, splitEvery(40, repeat(" ", 40 * 6))] as [number, string[][]],
  )
  console.log("Part 2:", "\n" + join("\n", map(join(""), crt)))
  return "PAPJCBHP"
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
