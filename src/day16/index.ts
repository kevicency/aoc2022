import run from "aocrunner"
import { map, pipe } from "ramda"
import { log, splitLines, todo } from "../utils/index.js"

type Node = string
type VisitedNode = {
  label: string
  /** Valves that are open */
  valveMask: number
  /** How many minutes left */
  remainingTime: number
  totalFlow: number
}

const parseLine = (line: string) => {
  const [, node, flowRate, destinations] =
    /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)/.exec(line) ?? []

  return { node, flowRate: +flowRate, destinations: destinations.split(", ") }
}
const parseInput = pipe(splitLines, map(parseLine))

const edge = (a: Node, b: Node) => `${a}:${b}`
const generateGraph = (lines: ReturnType<typeof parseLine>[]) => {
  const nodes = lines.map((line) => line.node)
  const nodeFlowRates = new Map(lines.map((line) => [line.node, line.flowRate]))
  const flowNodes = lines.filter((line) => line.flowRate > 0).map((line) => line.node)
  const flowNodeIndices = new Map(flowNodes.map((node, index) => [node, index + 1]))

  const shortestPaths = lines.reduce((acc, { node, destinations }) => {
    acc.set(edge(node, node), 0)
    for (const destination of destinations) {
      acc.set(edge(node, destination), 1)
    }
    return acc
  }, new Map<string, number>())

  const getShortestPath = (n: Node, m: Node) => shortestPaths.get(edge(n, m)) ?? 1e9

  // Floyd-Warshall
  for (const k of nodes) {
    for (const i of nodes) {
      for (const j of nodes) {
        const [ij, ik, kj] = [getShortestPath(i, j), getShortestPath(i, k), getShortestPath(k, j)]
        if (ij > ik + kj) {
          shortestPaths.set(edge(i, j), ik + kj)
        }
      }
    }
  }

  return { nodes, nodeFlowRates, flowNodes, flowNodeIndices, shortestPaths }
}
const traverseGraph = (
  { flowNodeIndices, flowNodes, nodeFlowRates, shortestPaths }: ReturnType<typeof generateGraph>,
  initialTime: number,
  onVisit: (x: VisitedNode) => void,
) => {
  const openValve = (node: Node, mask: number) => mask | (1 << flowNodeIndices.get(node)!)
  const hasOpenValve = (node: Node, mask: number) => (mask & (1 << flowNodeIndices.get(node)!)) > 0

  const visited = new Set<string>()
  const backlog: VisitedNode[] = [
    { label: "AA", remainingTime: initialTime, valveMask: 0, totalFlow: 0 },
  ]
  while (backlog.length > 0) {
    const current = backlog.pop()!
    const { label, remainingTime, totalFlow, valveMask } = current

    const key = `${label}:${valveMask}:${totalFlow}:${remainingTime}`

    if (visited.has(key)) continue

    visited.add(key)
    onVisit(current)

    if (remainingTime === 0) {
      continue
    }

    for (const nextNode of flowNodes) {
      if (hasOpenValve(nextNode, current.valveMask)) continue
      const nextRemainingTime =
        remainingTime - shortestPaths.get(edge(current.label, nextNode))! - 1
      if (nextRemainingTime <= 0) continue
      backlog.push({
        label: nextNode,
        remainingTime: nextRemainingTime,
        valveMask: openValve(nextNode, current.valveMask),
        totalFlow: totalFlow + (nodeFlowRates.get(nextNode) ?? 0) * nextRemainingTime,
      })
    }
  }
}

const part1 = (input: string) => {
  const graph = pipe(parseInput, generateGraph)(input)

  let result = 0
  traverseGraph(graph, 30, (visitedNode) => {
    result = Math.max(visitedNode.totalFlow, result)
  })

  return result
}

const part2 = (input: string) => {
  const graph = pipe(parseInput, generateGraph)(input)
  const maxFlowRatePerValveMask = new Map<number, number>()

  let result = 0
  traverseGraph(graph, 26, ({ valveMask, totalFlow }) => {
    maxFlowRatePerValveMask.set(
      valveMask,
      Math.max(maxFlowRatePerValveMask.get(valveMask) ?? 0, totalFlow),
    )
  })

  for (const [valveMask, flowRate] of maxFlowRatePerValveMask) {
    for (const [otherValveMask, otherFlowRate] of maxFlowRatePerValveMask) {
      const hasDuplicateValves = (valveMask & otherValveMask) !== 0
      if (hasDuplicateValves) continue

      result = Math.max(result, flowRate + otherFlowRate)
    }
  }

  return result
}

run({
  part1: {
    tests: [
      {
        input: `
          Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
          Valve BB has flow rate=13; tunnels lead to valves CC, AA
          Valve CC has flow rate=2; tunnels lead to valves DD, BB
          Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
          Valve EE has flow rate=3; tunnels lead to valves FF, DD
          Valve FF has flow rate=0; tunnels lead to valves EE, GG
          Valve GG has flow rate=0; tunnels lead to valves FF, HH
          Valve HH has flow rate=22; tunnel leads to valve GG
          Valve II has flow rate=0; tunnels lead to valves AA, JJ
          Valve JJ has flow rate=21; tunnel leads to valve II
        `,
        expected: 1651,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
          Valve BB has flow rate=13; tunnels lead to valves CC, AA
          Valve CC has flow rate=2; tunnels lead to valves DD, BB
          Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
          Valve EE has flow rate=3; tunnels lead to valves FF, DD
          Valve FF has flow rate=0; tunnels lead to valves EE, GG
          Valve GG has flow rate=0; tunnels lead to valves FF, HH
          Valve HH has flow rate=22; tunnel leads to valve GG
          Valve II has flow rate=0; tunnels lead to valves AA, JJ
          Valve JJ has flow rate=21; tunnel leads to valve II
        `,
        expected: 1707,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
