import run from "aocrunner"
import { add, equals, lensIndex, map, over, pipe, range } from "ramda"
import { noop } from "ramda-adjunct"
import { threadId } from "worker_threads"

const maxX = 6
type Point = [number, number]
type Shape = Point[]
type Rock = {
  id: number
  shape: Shape
}
const [PUSH, DROP] = [0, 1]

const xLens = lensIndex<number>(0)
const yLens = lensIndex<number>(1)

class BlockedMap {
  private rows: boolean[][] = []
  add(x: number, y: number) {
    this.rows[y] = this.rows[y] ?? range(0, maxX + 1).map(() => false)
    this.rows[y][x] = true
  }
  has(x: number, y: number) {
    const row = this.rows[y]
    return row && row[x]
  }

  getTopRowKey() {
    return parseInt(this.rows[this.rows.length - 1].map((x) => (x ? 1 : 0)).join(""), 2)
  }

  checkCycle(hdiff: number, print: boolean) {
    const log = print ? console.log : noop
    const xs = range(-1, maxX + 2)
    for (const dy of range(0, hdiff)) {
      const y = this.rows.length - 1 - dy
      const y2 = this.rows.length - 1 - hdiff - dy

      if (y < 0 || y2 < 0) break

      log(
        xs.map((x) => (x === -1 || x === 7 ? "|" : this.has(x, y) ? "#" : ".")).join("") +
          ` ` +
          xs.map((x) => (x === -1 || x === 7 ? "|" : this.has(x, y2) ? "#" : ".")).join("") +
          ` ${y} ${y2}`,
      )
      if (!equals(this.rows[y], this.rows[y2])) {
        log("xxxxxxxxx xxxxxxxxx")
        log("")

        return false
      }
    }
    log("+-------+ +-------+")
    log("")

    return true
  }

  prettyPrint() {
    const xs = range(-1, maxX + 2)
    range(0, this.height + 1)
      .map((dy) => this.height - dy)
      .forEach((y) => {
        console.log(
          xs.map((x) => (x === -1 || x === 7 ? "|" : this.has(x, y) ? "#" : ".")).join(""),
        )
      })
    console.log("+-------+")
    console.log("")
  }

  get height() {
    return this.rows.length
  }
}

function* createJetStream(rawInput: string): Generator<1 | -1, 1 | -1, void> {
  const dxs = rawInput.split("").map((x) => (x === ">" ? 1 : -1))
  let i = 0
  while (true) yield dxs[i++ % dxs.length]
}
const createRockShape = (n: number, dx: number, dy: number): Point[] => {
  switch (n) {
    case 0:
      return range(0, 4).map((x) => [x + dx, dy])
    case 1:
      return [[dx + 1, dy], ...range(0, 3).map<Point>((x) => [x + dx, dy + 1]), [dx + 1, dy + 2]]
    case 2:
      return [
        ...range(0, 3).map<Point>((x) => [x + dx, dy]),
        ...range(0, 2).map<Point>((y) => [dx + 2, dy + y + 1]),
      ]
    case 3:
      return range(0, 4).map((y) => [dx, dy + y])
    case 4:
      return range(0, 2).flatMap((x) => [
        [dx + x, dy],
        [dx + x, dy + 1],
      ])
  }
  return []
}
function* createRockStream(height = 0): Generator<Rock, Rock, number> {
  const dx = 2
  let rock = 0

  while (true) {
    height = yield { id: rock, shape: createRockShape(rock % 5, dx, height + 3) }
    rock++
  }
}
const safePush =
  (dx: 1 | -1) =>
  (shape: Point[]): Point[] => {
    if ((dx === 1 && shape.some(([x]) => x === 6)) || (dx === -1 && shape.some(([x]) => x === 0))) {
      return shape
    }
    return map(over(xLens, add(dx)), shape) as Point[]
  }

const parseInput = (raw: string) => ({
  jetStream: createJetStream(raw),
  rockStream: createRockStream(),
  blocked: new BlockedMap(),
})

const simulate =
  (rocks: number) =>
  ({ jetStream, rockStream, blocked }: ReturnType<typeof parseInput>) => {
    const cycleCanditates = new Map<string, { height: number; rock: number }[]>()
    let cycle: { height: number; rock: number; dh: number; dr: number } | null = null
    let rock: Rock

    while (true) {
      rock = rockStream.next(blocked.height).value

      if (cycle && (rocks - rock.id) % cycle.dr === 0) {
        break
      }
      if (rock.id === rocks) {
        break
      }

      let op = PUSH
      let shape = rock.shape
      let stream: 1 | -1 = 1
      while (true) {
        stream = op === PUSH ? jetStream.next().value : stream
        const translate = op === PUSH ? safePush(stream) : map(over(yLens, add(-1)))
        const nextShape = translate(shape) as Point[]

        if (nextShape.some(([x, y]) => blocked.has(x, y) || y === -1)) {
          if (op === DROP) {
            shape.forEach(([x, y]) => {
              blocked.add(x, y)
            })
            if (!cycle && rock.id % 5 === 0 && rock.id > 0) {
              const { height } = blocked
              const cycleKey = `${blocked.getTopRowKey()}:${stream}`
              if (!cycleCanditates.has(cycleKey)) {
                cycleCanditates.set(cycleKey, [])
              }
              const canditates = cycleCanditates.get(cycleKey)!
              for (const candidate of canditates) {
                if (blocked.checkCycle(height - candidate.height, false)) {
                  cycle = {
                    height: height,
                    rock: rock.id,
                    dh: height - candidate.height,
                    dr: rock.id - candidate.rock,
                  }
                  break
                }
              }
              cycleCanditates.set(cycleKey, [...canditates, { height, rock: rock.id }])
            }

            break
          }
        } else {
          shape = nextShape
        }

        op = 1 - op
      }
    }

    if (cycle) {
      const remainingCycles = (rocks - rock.id) / cycle.dr
      return blocked.height + cycle.dh * remainingCycles
    }
    return blocked.height
  }

const part1 = pipe(parseInput, simulate(2022))
const part2 = pipe(parseInput, simulate(1000000000000))

run({
  part1: {
    tests: [
      {
        input: `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`,
        expected: 3068,
      },
    ],
    solution: part1,
  },
  part2: {
    // tests: [
    //   {
    //     input: `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`,
    //     expected: 1514285714288,
    //   },
    // ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
