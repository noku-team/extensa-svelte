import isTestnet from "./isTestnet";

const getIdentityProviderUrl = () => {
	const isLocalDevelopment = isTestnet()
	return !isLocalDevelopment
		? 'https://identity.ic0.app/#authorize'
		: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/#authorize`
		
}

export default getIdentityProviderUrl
