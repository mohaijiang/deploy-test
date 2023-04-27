import {reactive, ref} from "vue";

import SuiConnectButton from "./components/SuiConnectButton.vue";
import StandardWallet , {localStorageKeys} from "./helpers/SuiWallet";
import {populateWalletList} from "./helpers/walletStandard";

export default {
    install: (app, options) => {


        const suiAddress = localStorage.getItem(localStorageKeys.address) || null;
        app.provide("suiAddress", ref(suiAddress));

        const suiProvider = localStorage.getItem(localStorageKeys.provider) || null;
        app.provide("suiProvider", ref(suiProvider));

        const wallet = reactive(StandardWallet);
        app.provide("suiWallet", wallet);

        let walletProviders = [];
        app.provide("suiWalletProviders", walletProviders);
        // populate wallet list by listening to events of chrome extensions.
        populateWalletList(walletProviders);

        // add provider reference to wallet if logged in.
        if(suiProvider) wallet.activeProvider = walletProviders.find(x => x.name === suiProvider);

        app.provide('changeNetwork',wallet.switchNetwork)
        // register component globally
        app.component('sui-connect-button', SuiConnectButton);

    },
}

export {useSuiWallet} from "./composables/useSuiWallet";
