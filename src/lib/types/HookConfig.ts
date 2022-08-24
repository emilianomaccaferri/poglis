import { arrayOf, enumOf, maybe, objectOf, } from "@altostra/type-validations"
import { string } from "@altostra/type-validations/lib/primitives"

export type Methods = 'get' | 'post';

export interface HookConfiguration {
    name?: string,
    route?: string, 
    method: Methods,
    task: string[]
}

export const validConf = objectOf({
    name: maybe(string),
    route: maybe(string),
    method: enumOf<Methods>('get', 'post'),
    task: arrayOf(string)
})