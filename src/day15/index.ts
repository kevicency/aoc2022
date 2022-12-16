import run from "aocrunner"

type Point = { x: number; y: number }

const part1 = (rawInput: string) => {
  const sensors = parseInput(rawInput)

  //We use different y for tests and final solution.
  let y = sensors.length > 14 ? 2000000 : 10

  return getRowCoverage(sensors, y).reduce((sum, curr) => sum + (curr[1] - curr[0]), 0)
}

const part2 = (rawInput: string) => {
  const sensors = parseInput(rawInput)

  //We use different rowRange for tests and final solution.
  let rowRange = sensors.length > 14 ? 4000000 : 20

  for (let y = 0; y <= rowRange; y++) {
    let rowCoverage = getRowCoverage(sensors, y)
    if (rowCoverage.length > 1) {
      return (rowCoverage[0][1] + 1) * 4000000 + y
    }
  }
}

const parseInput = (rawInput: string) => {
  const getPosition = (pos: string) => {
    return {
      x: Number(pos.substring(pos.indexOf("x=") + 2, pos.lastIndexOf(","))),
      y: Number(pos.substring(pos.indexOf("y=") + 2)),
    }
  }
  const manhattanDistance = (from: Point, to: Point) =>
    Math.abs(from.x - to.x) + Math.abs(from.y - to.y)

  return rawInput
    .split("\n")
    .map((line) => line.split(":").map((half) => getPosition(half)))
    .map((pair: any) => {
      pair.dist = manhattanDistance(pair[0], pair[1])
      return pair
    })
}

const getRowCoverage = (sensors: any, row: any) => {
  const coverage = []
  for (const s of sensors) {
    let sensorCoverage = getSensorRowCoverage(s, row)
    if (sensorCoverage) coverage.push(sensorCoverage)
  }

  return mergeIntervals(coverage)
}

const getSensorRowCoverage = (sensor, y) => {
  let coverageWidth = sensor.dist - Math.abs(sensor[0].y - y)
  if (coverageWidth < 0) return null

  return [sensor[0].x - coverageWidth, sensor[0].x + coverageWidth]
}

const mergeIntervals = (intervals) => {
  intervals.sort((a, b) => a[0] - b[0])

  const merged = []
  let prev = intervals[0]

  for (let i = 0; i < intervals.length; i++) {
    let curr = intervals[i]
    if (prev[1] >= curr[0] - 1) {
      prev = [prev[0], Math.max(prev[1], curr[1])]
    } else {
      merged.push(prev)
      prev = curr
    }
  }

  merged.push(prev)
  return merged
}

run({
  part1: {
    tests: [
      {
        input: `
          Sensor at x=2, y=18: closest beacon is at x=-2, y=15
          Sensor at x=9, y=16: closest beacon is at x=10, y=16
          Sensor at x=13, y=2: closest beacon is at x=15, y=3
          Sensor at x=12, y=14: closest beacon is at x=10, y=16
          Sensor at x=10, y=20: closest beacon is at x=10, y=16
          Sensor at x=14, y=17: closest beacon is at x=10, y=16
          Sensor at x=8, y=7: closest beacon is at x=2, y=10
          Sensor at x=2, y=0: closest beacon is at x=2, y=10
          Sensor at x=0, y=11: closest beacon is at x=2, y=10
          Sensor at x=20, y=14: closest beacon is at x=25, y=17
          Sensor at x=17, y=20: closest beacon is at x=21, y=22
          Sensor at x=16, y=7: closest beacon is at x=15, y=3
          Sensor at x=14, y=3: closest beacon is at x=15, y=3
          Sensor at x=20, y=1: closest beacon is at x=15, y=3
        `,
        expected: 26,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          Sensor at x=2, y=18: closest beacon is at x=-2, y=15
          Sensor at x=9, y=16: closest beacon is at x=10, y=16
          Sensor at x=13, y=2: closest beacon is at x=15, y=3
          Sensor at x=12, y=14: closest beacon is at x=10, y=16
          Sensor at x=10, y=20: closest beacon is at x=10, y=16
          Sensor at x=14, y=17: closest beacon is at x=10, y=16
          Sensor at x=8, y=7: closest beacon is at x=2, y=10
          Sensor at x=2, y=0: closest beacon is at x=2, y=10
          Sensor at x=0, y=11: closest beacon is at x=2, y=10
          Sensor at x=20, y=14: closest beacon is at x=25, y=17
          Sensor at x=17, y=20: closest beacon is at x=21, y=22
          Sensor at x=16, y=7: closest beacon is at x=15, y=3
          Sensor at x=14, y=3: closest beacon is at x=15, y=3
          Sensor at x=20, y=1: closest beacon is at x=15, y=3
        `,
        expected: 56000011,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
