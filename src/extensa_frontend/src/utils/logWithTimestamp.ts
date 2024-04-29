import isNode from "./isNode"

const logWithTimestamp = (...args: Array<unknown>): void => {
	if (isNode() === true) return
	const time = `[${new Date().toISOString().split('T')[1].replace('Z', '')}]`
	console.debug.call(console, ...[time, ...args])
}
export default logWithTimestamp
