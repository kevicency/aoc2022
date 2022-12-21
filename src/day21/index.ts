import run from "aocrunner"
import { isNumber } from "lodash-es"
import { pipe } from "ramda"
import { log, splitLines, todo } from "../utils/index.js"
import { Equation, Expression, parse } from "algebra.js"

const gEval = eval
const parseInput = pipe(splitLines)

const parseMonkeys = (lines: string[]) =>
  lines.reduce(
    (acc, line) => {
      const [name, job] = line.split(":").map((x) => x.trim())
      acc.monkeys.add(name)
      acc.jobs.push(`${name} = ${job}`)
      if (/[-+*/]/.test(job)) {
        job.match(/\w+/g)?.forEach((m) => acc.monkeys.add(m))
      }
      return acc
    },
    { monkeys: new Set<string>(), jobs: [] as string[] },
  )

const evalMonkeys = (lines: string[]) => {
  const { monkeys, jobs } = parseMonkeys(lines)
  gEval([...monkeys].map((m) => `var ${m}=NaN`).join(";"))
  let root = NaN
  while (isNaN(root)) {
    jobs.forEach(gEval)
    root = gEval("root")
  }
  return root
}

const part1 = pipe(parseInput, evalMonkeys)

type Formula = { lhs: string; op: string; rhs: string }
type MonkeyExpr = number | Formula | "x"
const parseMonkeyExpressions = (lines: string[]) =>
  lines.reduce((acc, line) => {
    const [name, job] = line.split(":").map((x) => x.trim())
    const match = job.match(/(\w+) ([+-/*]) (\w+)/)
    let expr: MonkeyExpr = match ? { lhs: match[1], op: match[2], rhs: match[3] } : +job

    if (name === "root" && expr instanceof Object) {
      expr.op = "="
    }
    if (name === "humn") {
      expr = "x"
    }

    acc.set(name, expr)
    return acc
  }, new Map<string, MonkeyExpr>())

const stringify = (expr: MonkeyExpr | string, lookup: Map<string, MonkeyExpr>): string => {
  if (expr instanceof Object) {
    return `(${stringify(expr.lhs, lookup)} ${expr.op} ${stringify(expr.rhs, lookup)})`
  } else if (expr === "x" || isNumber(expr)) {
    return String(expr)
  } else {
    return stringify(lookup.get(expr)!, lookup)
  }
}
const solveMonkeyExpressions = (lookup: Map<string, MonkeyExpr>) => {
  const root = lookup.get("root") as Formula
  const [lhs, rhs] = [root.lhs, root.rhs].map((x) => stringify(x, lookup))
  // console.log(`${lhs} ${root.op} ${rhs}`)
  const lExpr = parse(lhs) as Expression
  const rExpr = parse(rhs) as Expression
  const equation = new Equation(lExpr, rExpr)
  console.log(equation.toString())
  return equation.solveFor("x")?.toString()
}

const part2 = pipe(parseInput, parseMonkeyExpressions, solveMonkeyExpressions, log)

run({
  part1: {
    tests: [
      {
        input: `
          root: pppw + sjmn
          dbpl: 5
          cczh: sllz + lgvd
          zczc: 2
          ptdq: humn - dvpt
          dvpt: 3
          lfqf: 4
          humn: 5
          ljgn: 2
          sjmn: drzm * dbpl
          sllz: 4
          pppw: cczh / lfqf
          lgvd: ljgn * ptdq
          drzm: hmdt - zczc
          hmdt: 32
        `,
        expected: 152,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          root: pppw + sjmn
          dbpl: 5
          cczh: sllz + lgvd
          zczc: 2
          ptdq: humn - dvpt
          dvpt: 3
          lfqf: 4
          humn: 5
          ljgn: 2
          sjmn: drzm * dbpl
          sllz: 4
          pppw: cczh / lfqf
          lgvd: ljgn * ptdq
          drzm: hmdt - zczc
          hmdt: 32
        `,
        expected: "301",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
