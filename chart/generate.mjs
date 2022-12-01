import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import screenshot from "./screenshot.mjs"
import { pipe, takeWhile, dropWhile, filter, length, range } from "ramda"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import aocdata from "../.aocrunner.json" assert { type: "json" }

const loc = (day) => {
  const sourceFile = path.join(
    __dirname,
    `../src/day${String(day).padStart(2, "0")}/index.ts`,
  )
  const lines = fs.existsSync(sourceFile)
    ? fs
        .readFileSync(
          path.join(
            path.dirname(__filename),
            `../src/day${String(day).padStart(2, "0")}/index.ts`,
          ),
          "utf8",
        )
        .split("\n")
    : ["x"]

  return pipe(
    dropWhile((line) => line === ""),
    takeWhile((line) => !line.startsWith("run({")),
    filter((line) => /^\s*$/.test(line) === false),
    length,
  )(lines)
}

const time1 = (day) => aocdata.days[day - 1]?.part1?.time ?? 0
const time2 = (day) => aocdata.days[day - 1]?.part2?.time ?? 0

await screenshot(
  {
    data: {
      columns: [
        ["part1", 0, ...range(1, 25).map((day) => time1(day))],
        ["part2", 0, ...range(1, 25).map((day) => time2(day))],
        ["loc", 0, ...range(1, 25).map((day) => loc(day))],
      ],
      types: {
        loc: "area-spline",
        part1: "bar",
        part2: "bar",
      },
      colors: {
        loc: "#ff0000",
        part1: "#9999cc",
        part2: "#ffff66",
      },
      axes: {
        loc: "y",
        part1: "y2",
        part2: "y2",
      },
    },
    axis: {
      x: {
        label: { text: "Day", position: "outer-center" },
      },
      y: {
        label: "Lines of code",
      },
      y2: {
        show: true,
        label: "Execution time in ms",
      },
    },
    bar: {
      padding: 2,
      width: {
        ratio: 0.5,
        max: 30,
      },
    },
  },
  "chart.png",
)
