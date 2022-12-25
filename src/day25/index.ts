import run from "aocrunner"
import { pipe, reduce } from "ramda"
import { log, splitLines, todo } from "../utils/index.js"

const parseInput = splitLines

const snafuAddSingle = (a: string, b: string): string => {
  if (a === "0") return b
  if (a === "1") {
    if (b === "1") return "2"
    if (b === "2") return "=1"
    if (b === "=") return "-"
    if (b === "-") return "0"
  }
  if (a === "2") {
    if (b === "2") return "-1"
    if (b === "=") return "0"
    if (b === "-") return "1"
  }
  if (a === "=") {
    if (b === "=") return "1-"
    if (b === "-") return "2-"
  }
  if (a === "-") {
    if (b === "-") return "="
  }
  return snafuAddSingle(b, a)
}
const snafuAddSingleArr = (a: string, b: string): string[] => {
  const sum = snafuAddSingle(a, b)
  return sum.length === 2 ? sum.split("") : [sum]
}
const snafuAddArr = (a: string[], b: string[]): string[] => {
  if (a.length === 0) return b
  if (b.length === 0) return a
  const [ha, ...ta] = a
  const [hb, ...tb] = b
  const [hs, ...ts] = snafuAddSingleArr(ha, hb)
  if (ts.length) {
    return [hs, ...snafuAddArr(ts, snafuAddArr(ta, tb))]
  }

  return [hs, ...snafuAddArr(ta, tb)]
}

const snafuAdd = (a: string, b: string): string => {
  return snafuAddArr(a.split("").reverse(), b.split("").reverse()).reverse().join("").trim()
}

const part1 = pipe(parseInput, reduce(snafuAdd, "0"))

const part2 = () => "💯"

run({
  part1: {
    tests: [
      {
        input: `
          1=-0-2
          12111
          2=0=
          21
          2=01
          111
          20012
          112
          1=-1=
          1-12
          12
          1=
          122
        `,
        expected: "2=-1=0",
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
