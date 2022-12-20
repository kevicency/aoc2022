import run from "aocrunner"
import { maxBy, uniq } from "lodash-es"
import { map, max, pipe, product, range, sum, take } from "ramda"
import { noop } from "ramda-adjunct"
import { splitLines } from "../utils/index.js"

type Print = typeof console.log

const resourceTypes = [0, 1, 2, 3]
const [ORE, CLAY, OBSIDIAN, GEODE] = resourceTypes

type Blueprint = {
  id: number
  costs: number[][]
}
const parseBlueprint = (line: string): Blueprint => {
  const [id, oreOre, clayOre, obsOre, obsClay, geoOre, geoObs] = line.match(/(\d+)/g)!.map(Number)
  return {
    id,
    costs: [
      [oreOre, 0, 0, 0],
      [clayOre, 0, 0, 0],
      [obsOre, obsClay, 0, 0],
      [geoOre, 0, geoObs, 0],
    ],
  }
}

type Factory = {
  blueprint: Blueprint
  robots: number[]
  resources: number[]
}
const createFactory = (blueprint: Blueprint): Factory => ({
  blueprint,
  robots: [1, 0, 0, 0],
  resources: [0, 0, 0, 0],
})

const parseInput = pipe(splitLines, map(pipe(parseBlueprint, createFactory)))

const simulate =
  (minutes: number, print: Print = noop) =>
  ({ blueprint: { id, costs }, ...initial }: Factory) => {
    const maxRequiredRobots = [ORE, CLAY, OBSIDIAN]
      .map((type) => costs.map((cost) => cost[type]).reduce(max))
      .concat([1e9])
    let backlog = [{ ...initial, blacklist: [] as number[], score: 0 }]

    for (const m of range(1, minutes + 1)) {
      print(`Minute ${m}, backlog: ${backlog.length}`)

      const score = ({ resources, robots }: typeof backlog[0]) =>
        1e9 * (resources[GEODE] + (minutes - m) * robots[GEODE]) +
        1e6 * robots[OBSIDIAN] +
        1e3 * robots[CLAY] +
        robots[ORE]

      backlog = backlog
        .flatMap(({ robots, resources, blacklist }) => {
          const branches: number[] = [GEODE, OBSIDIAN, CLAY, ORE].filter(
            (type) =>
              !blacklist.includes(type) &&
              maxRequiredRobots[type]! > robots[type] &&
              resources.every((count, i) => count >= costs[type][i]),
          )

          return [
            ...branches.map((type) => ({
              resources: resources.map((amount, i) => amount + robots[i] - costs[type][i]),
              robots: robots.map((r, i) => r + (i === type ? 1 : 0)),
              blacklist: [],
              score: 0,
            })),
            // do nothing
            {
              resources: resources.map((count, i) => count + robots[i]),
              robots: [...robots],
              blacklist: uniq([...blacklist, ...branches]),
              score: 0,
            },
          ].map((x) => ({ ...x, score: score(x) }))
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, backlog.length > m * 100 ? Math.ceil(backlog.length / 2) : undefined)
    }

    const anyBest = maxBy(backlog, ({ score }) => score)!
    return { ...anyBest, blueprint: { id, costs } }
  }

const getQualityLevel = (factory: Factory) => factory.resources[GEODE] * factory.blueprint.id

const part1 = pipe(parseInput, map(simulate(24, noop)), map(getQualityLevel), sum)
const part2 = pipe(
  parseInput,
  take(3),
  map(simulate(32, noop)),
  map((factory) => factory.resources[GEODE]),
  product,
)

run({
  part1: {
    tests: [
      {
        input: `
          Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
          Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
        `,

        expected: 33,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
          Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
        `,

        expected: 56 * 62,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
