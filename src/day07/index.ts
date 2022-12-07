import run from "aocrunner"
import {
  map,
  pipe,
  reduce,
  slice,
  path,
  prop,
  join,
  assocPath,
  lte,
  filter,
  gt,
  sum,
  values,
  head,
  sort,
  identity,
  comparator,
  lt,
  converge,
} from "ramda"
import { log, splitLines, todo } from "../utils/index.js"

const mergePath = <T extends Object, U>(props: string[], fn: (value?: U) => U, obj: T) => {
  const value = path(props, obj) as U
  return assocPath(props, fn(value), obj)
}

type FS = {
  [name: string]: number | FS
}

type Line =
  | {
      type: "cd"
      dir: string
    }
  | {
      type: "ls"
    }
  | {
      type: "dir"
      name: string
    }
  | {
      type: "file"
      name: string
      size: number
    }

const parseLine = (line: string): Line => {
  const args = line.split(" ")
  switch (true) {
    case args[1] === "cd":
      return { type: "cd", dir: args[2] }
    case args[1] === "ls":
      return { type: "ls" }
    case args[0] === "dir":
      return { type: "dir", name: args[1] }
    default:
      return { type: "file", name: args[1], size: +args[0] }
  }
}
const reduceLine = ([cwd, fs]: [string[], FS], line: Line) => {
  switch (line.type) {
    case "cd":
      return line.dir === ".." ? [slice(0, -1)(cwd), fs] : [[...cwd, line.dir], fs]
    case "dir":
      return [cwd, mergePath(cwd, (path?: FS) => ({ ...path, [line.name]: {} }), fs)]
    case "file":
      return [cwd, mergePath(cwd, (path?: FS) => ({ ...path, [line.name]: line.size }), fs)]
    default:
      return [cwd, fs]
  }
}

const size = (fs: FS): number =>
  Object.entries(fs).reduce(
    (acc, [_, value]) => acc + (typeof value === "number" ? value : size(value)),
    0,
  )

const walk = (fs: FS, fn: (path: string[], node: FS | number) => void, cwd: string[] = []) => {
  Object.entries(fs).forEach(([name, value]) => {
    const path = [...cwd, name]
    fn(path, value)
    if (typeof value !== "number") walk(value, fn, path)
  })
}

const dirSizes = (fs: FS) => {
  const dirs = {} as Record<string, number>
  walk(fs, (cwd, node) => {
    if (typeof node === "number") {
      const paths = slice(0, -1)(cwd.map((_, i) => cwd.slice(0, i + 1)))
      paths.forEach((path) => {
        const key = path.join("/").replace(/^\/\//, "/")
        dirs[key] = (dirs[key] ?? 0) + node
      })
    }
  })
  return dirs
}

const parseInput = pipe(pipe(splitLines, map(parseLine)), reduce(reduceLine, [[], {}]), prop(1))

const part1 = pipe(parseInput, dirSizes, filter(gt(100000)), Object.values, sum)

const part2 = pipe(
  parseInput,
  dirSizes,
  converge(filter, [(dirs) => lte(-40000000 + dirs["/"]), identity]),
  Object.values,
  sort(comparator(lt)),
  head,
)

run({
  part1: {
    tests: [
      {
        input: `
          $ cd /
          $ ls
          dir a
          14848514 b.txt
          8504156 c.dat
          dir d
          $ cd a
          $ ls
          dir e
          29116 f
          2557 g
          62596 h.lst
          $ cd e
          $ ls
          584 i
          $ cd ..
          $ cd ..
          $ cd d
          $ ls
          4060174 j
          8033020 d.log
          5626152 d.ext
          7214296 k
        `,
        expected: 95437,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          $ cd /
          $ ls
          dir a
          14848514 b.txt
          8504156 c.dat
          dir d
          $ cd a
          $ ls
          dir e
          29116 f
          2557 g
          62596 h.lst
          $ cd e
          $ ls
          584 i
          $ cd ..
          $ cd ..
          $ cd d
          $ ls
          4060174 j
          8033020 d.log
          5626152 d.ext
          7214296 k
        `,
        expected: 24933642,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
