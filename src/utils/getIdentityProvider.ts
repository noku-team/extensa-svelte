import isTestnet from "./dfinity/isTestnet";

const getIdentityProviderUrl = () => {
	const isLocalDevelopment = isTestnet()
	return !isLocalDevelopment
		? 'https://identity.ic0.app/#authorize'
		: `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`
}

export default getIdentityProviderUrl
