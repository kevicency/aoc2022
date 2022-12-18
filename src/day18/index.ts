import run from "aocrunner"
import { add, join, map, max, min, pipe, split } from "ramda"
import { splitLines } from "../utils/index.js"

type Coords = [number, number, number]

const cube = join(",")
const uncube = pipe(split(","), map(Number)) as (cube: string) => Coords
const reduceRows = (rows: number[][]) =>
  rows.reduce(
    (acc, row) => {
      acc.cubes.add(cube(row))
      acc.maxCoords = acc.maxCoords.map((s, i) => max(s, row[i])) as Coords
      acc.minCoords = acc.minCoords.map((s, i) => min(s, row[i])) as Coords

      return acc
    },
    {
      cubes: new Set<string>(),
      maxCoords: [0, 0, 0] as Coords,
      minCoords: [1e9, 1e9, 1e9] as Coords,
    },
  )

const parseInput = pipe(splitLines, map(pipe(split(","), map(Number))), reduceRows)

const neighbors = ([x, y, z]: Coords): Coords[] => [
  [x + 1, y, z],
  [x - 1, y, z],
  [x, y + 1, z],
  [x, y - 1, z],
  [x, y, z + 1],
  [x, y, z - 1],
]
const countSurfaceArea = ({ cubes }: ReturnType<typeof reduceRows>) =>
  [...cubes]
    .map(uncube)
    .flatMap(neighbors)
    .filter((c) => !cubes.has(cube(c))).length
const part1 = pipe(parseInput, countSurfaceArea)

const floodFill = ({ cubes, maxCoords, minCoords }: ReturnType<typeof reduceRows>) => {
  const visited = new Set<string>()
  const backlog: Coords[] = [minCoords]

  while (backlog.length) {
    const current = backlog.pop()!
    if (visited.has(cube(current))) continue

    visited.add(cube(current))
    backlog.push(
      ...neighbors(current)
        .filter((c) => !visited.has(cube(c)))
        .filter((c) => !cubes.has(cube(c)))
        .filter(
          ([x, y, z]) => x >= minCoords[0] - 1 && y >= minCoords[1] - 1 && z >= minCoords[2] - 1,
        )
        .filter(
          ([x, y, z]) => x <= maxCoords[0] + 1 && y <= maxCoords[1] + 1 && z <= maxCoords[2] + 1,
        ),
    )
  }

  return visited
}

const countExteriorSurfaceArea = ({ cubes, ...coords }: ReturnType<typeof reduceRows>) => {
  const flooded = floodFill({ cubes, ...coords })

  return [...cubes]
    .map((cube) => neighbors(uncube(cube)))
    .map((neighbors) => neighbors.filter((neighbor) => flooded.has(cube(neighbor))).length)
    .reduce(add)
}

const part2 = pipe(parseInput, countExteriorSurfaceArea)

run({
  part1: {
    tests: [
      {
        input: `
          1,1,1
          2,1,1
        `,
        expected: 10,
      },
      {
        input: `
          2,2,2
          1,2,2
          3,2,2
          2,1,2
          2,3,2
          2,2,1
          2,2,3
          2,2,4
          2,2,6
          1,2,5
          3,2,5
          2,1,5
          2,3,5
        `,
        expected: 64,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          2,2,2
          1,2,2
          3,2,2
          2,1,2
          2,3,2
          2,2,1
          2,2,3
          2,2,4
          2,2,6
          1,2,5
          3,2,5
          2,1,5
          2,3,5
        `,
        expected: 58,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
