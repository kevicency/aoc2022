import { addIndex, map, split, tap } from "ramda"

export type Print = typeof console.log

export const log = tap(console.log)
export const logJson = tap((x) => console.log(JSON.stringify(x, null, 2)))
export const logM = (msg?: string) => tap((...args: any[]) => console.log(msg, ...args))
export const splitLines = split("\n")
export const splitBlocks = split(/\n{2,}/g)
export const toCharCode = (char: string) => char.charCodeAt(0)
export const chars = split("")
export const splitPair = split(" ") as (input: string) => [string, string]
export const todo = () => undefined
export const mapIndexed = addIndex(map)
