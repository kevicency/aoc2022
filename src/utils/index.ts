import { addIndex, converge, curry, head, map, nthArg, reduce, split, tail, tap } from "ramda"

export const log = tap(console.log)
export const splitLines = split("\n")
export const splitBlocks = split(/\n{2,}/g)
export const toCharCode = (char: string) => char.charCodeAt(0)
export const chars = split("")
export const splitPair = split(" ") as (input: string) => [string, string]
export const todo = () => undefined
export const mapIndexed = addIndex(map)
