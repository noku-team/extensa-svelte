import isTestnet from "./isTestnet"

const getIdentityProviderUrl = () => {
	const isLocalDevelopment = isTestnet()
	return !isLocalDevelopment
		? 'https://identity.ic0.app/#authorize'
		: `${process.env.PRIVATE_AVRVM_HOST}?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`
}

export default getIdentityProviderUrl
