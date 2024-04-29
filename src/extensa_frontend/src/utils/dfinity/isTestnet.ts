const isTestnet = () => {
	console.warn("PTO", process.env.DFX_NETWORK);
	const isLocalDevelopment = process.env.DFX_NETWORK === 'local'
	return isLocalDevelopment
}

export default isTestnet
