import { nonNullish } from '@dfinity/utils'

const isNode = (): boolean => typeof process !== 'undefined' && nonNullish(process.versions?.node)

export default isNode
