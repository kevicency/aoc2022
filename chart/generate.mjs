import fs from "fs"
import _ from "lodash"
import path from "path"
import { fileURLToPath } from "url"
import screenshot from "./screenshot.mjs"

const { takeWhile } = _
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

  return (
    takeWhile(lines, (line) => !line.startsWith("run({")).filter(
      (line) => /^\s*$/.test(line) === false,
    ).length - 1
  )
}

const time1 = (day) => aocdata.days[day - 1]?.part1?.time ?? 0
const time2 = (day) => aocdata.days[day - 1]?.part2?.time ?? 0

await screenshot(
  {
    data: {
      columns: [
        ["time1", ..._.range(1, 25).map((day) => time1(day) * 1000)],
        ["time2", ..._.range(1, 25).map((day) => time2(day) * 1000)],
        ["loc", ..._.range(1, 25).map((day) => loc(day))],
      ],
      types: {
        loc: "area-spline",
        time1: "bar",
        time2: "bar",
      },
      colors: {
        loc: "#ff0000",
        time1: "#9999cc",
        time2: "#ffff66",
      },
      axes: {
        loc: "y",
        time1: "y2",
        time2: "y2",
      },
    },
    axis: {
      x: {
        label: { text: "Day", position: "outer-center" },
      },
      y: {
        label: "Lines",
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
