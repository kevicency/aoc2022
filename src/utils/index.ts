import { converge, curry, head, nthArg, reduce, split, tail, tap } from "ramda"

export const log = tap(console.log)
export const splitLines = split("\n")
export const toCharCode = (char: string) => char.charCodeAt(0)
export const splitPair = split(" ") as (input: string) => [string, string]
