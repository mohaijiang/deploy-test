export const localStorageKeys = {
    provider: 'sui.provider',
    address: 'sui.address',
    accounts: 'hamster.accounts'
}

// list of features of providers.
export const features = {
    connect: "standard:connect",
    disconnect: "standard:disconnect",
    events: "standard:events",
    switchNetwork: "standard:switchNetwork",
    signAndExecuteTransactionBlock: "sui:signAndExecuteTransactionBlock"
}

// checks if a provider has the specified feature.
const hasStandardFeature = (feature, provider) => {
    // if the feature we are asking about is not in the list of supported features, reject.
    if(!Object.values(features).find(x => x === feature)) return false;

    // verify that the provider has the feature list and it has the function asked.
    return provider.features && provider.features.hasOwnProperty(feature);
}

const errors = {
    NO_ACTIVE_PROVIDER_ERROR: "You do not have an active provider.",
    NOT_AVAILABLE_FEATURE: "This feature is unavailable on this provider.",
    NO_SELECTED_PROVIDER: "Please select a wallet provider to continue."
};

const StandardWallet = {

    activeProvider: null,
    address: null,
    accounts: [],
    providerMap: new Map(),

    /*
        Tries to connect the client to the wallet and get a valid wallet address.

        1. Saves the client account in localStorage if it's valid and returns the data
        2. Redirects to the wallet address if the wallet is valid (included in the list).

     */
    login: async (provider = StandardWallet.activeProvider) => {

        if(!provider) throw new Error(errors.NO_SELECTED_PROVIDER);

        // we request permissions.
        try{
            const res = await StandardWallet.connect(provider);
            if(!res) throw new Error();

            // save state in localStorage
            localStorage.setItem(localStorageKeys.provider, provider.name);
            localStorage.setItem(localStorageKeys.address, res.accounts[0].address);

            StandardWallet.providerMap.set(provider.name, provider)

            if(!StandardWallet.accounts.find(t => t.wallet === provider.name)){
                StandardWallet.accounts.push({
                    "wallet": provider.name,
                    "address": res.accounts[0].address
                })
            }


            return {
                provider: provider,
                account: res.accounts[0].address
            }

        }catch(e){

            return {
                error: `You need to give ${provider.name} permissions to continue.`,
                account: null
            }
        }

    },

    /*
        A function to logout users from the Sui Wallet.
        We just remove the keys from localStorage and if the wallet supports "disconnect", it is called first.
     */
    logout: async (provider = StandardWallet.activeProvider) => {

        if(!provider) throw new Error(errors.NO_ACTIVE_PROVIDER_ERROR);
        if(hasStandardFeature(features.disconnect, provider)){
            await provider.features[features.disconnect].disconnect();
        }

        // clear client persistent state
        localStorage.removeItem(localStorageKeys.provider);
        localStorage.removeItem(localStorageKeys.address);

        StandardWallet.providerMap.delete(provider.name)
        StandardWallet.accounts = StandardWallet.accounts.filter(item => item.wallet !== provider.name)
        console.log('StandardWallet.accounts',StandardWallet.accounts)
        return StandardWallet.accounts
    },

    /*
        A function to return the active account of the wallet.
     */
    getAccount: async () => {

        if(!StandardWallet.activeProvider) throw new Error(errors.NO_ACTIVE_PROVIDER_ERROR);

        return StandardWallet.activeProvider.accounts[0];
    },

    /*
        Signs and executes a smart contract transaction.
     */
    signAndExecuteTransactionBlock: async (tx) => {
        if(!StandardWallet.activeProvider) throw new Error(errors.NO_ACTIVE_PROVIDER_ERROR);
        if(!hasStandardFeature(features.signAndExecuteTransactionBlock, StandardWallet.activeProvider))
            throw new Error(errors.NOT_AVAILABLE_FEATURE);

        return StandardWallet.activeProvider?.features[features.signAndExecuteTransactionBlock]
            .signAndExecuteTransactionBlock({ transactionBlock: tx });

    },

    /*
        Requests wallet permissions.
     */
    connect: async (provider) => {

        if(!hasStandardFeature(features.connect, provider)){
            throw new Error(errors.NOT_AVAILABLE_FEATURE)
        }

        return provider.features[features.connect].connect()

    },
    switchNetwork: async (value) => {

        if(!StandardWallet.activeProvider) throw new Error(errors.NO_ACTIVE_PROVIDER_ERROR);

        const targetChain = value.split(":")[0]
        const targetNetworkId = value.split(":")[1]

        if(StandardWallet.activeProvider.name === 'MetaMask' || targetChain === 'eth'){
            return StandardWallet.activeProvider.features[features.switchNetwork].switchNetwork(targetNetworkId)
        }




        console.log('switchNetwork:', value)
    }
}

export default StandardWallet;
