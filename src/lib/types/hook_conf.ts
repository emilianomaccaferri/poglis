import { enumOf, objectOf, } from "@altostra/type-validations"
import { string } from "@altostra/type-validations/lib/primitives"

type Methods = 'get' | 'post';

export interface HookConfiguration {
    name: string,
    route: string, 
    method: Methods
}

export const validConf = objectOf({
    name: string,
    route: string,
    method: enumOf<Methods>('get', 'post')
})