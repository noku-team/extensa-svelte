const isTestnet = () => {
	const isLocalDevelopment = process.env.DFX_NETWORK === 'local'
	return isLocalDevelopment
}

export default isTestnet
