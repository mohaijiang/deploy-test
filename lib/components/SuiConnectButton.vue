<template>

  <div class="sui-login-wrapper">

    <div>
      <label>network:</label>
      <select v-model="currentNetwork">
        <optgroup label="Ethereum">
          <option value="eth:1">Mainnet</option>
          <option value="eth:6688">IRISHub</option>
        </optgroup>
        <optgroup label="Sui">
          <option value="sui:mainnet">Mainnet</option>
        </optgroup>

      </select>
    </div>

    <div>
      <button
              class="sui-login-button"
              @click="toggleWalletAuthModal = true">
        {{ connectText }}
      </button>

      <button class="sui-logout-btn" @click="logout">
        {{ logoutText }}
      </button>
    </div>


    <div v-if="showInformationText" v-show="hasWalletPermissions" class="sui-account-details">
      <p class="wallet-text">
        {{connectedWalletText}}: {{suiProvider}}
      </p>
      <p class="address-text">
        {{addressText}}: {{suiAddress}}
      </p>
    </div>

    <div>
      <label>wallet account</label>
      <div>
        <li :key="wallet" v-for="{wallet,address} in accounts">
          {{wallet}}--{{ address}}-- <button @click="logout(wallet,address)" class="sui-logout-btn"> {{ logoutText }}</button>
        </li>
      </div>
    </div>


    <sui-connect-modal v-show="toggleWalletAuthModal"
                       :connect="connect"
                       :choose-provider="chooseProvider"
                       :no-wallet-extension-installed="noWalletExtensionInstalled"
                       @closeModal="toggleWalletAuthModal = false;"></sui-connect-modal>
  </div>

</template>
<script setup>

import {computed, ref,watch} from "vue";
import SuiConnectModal from "./SuiConnectModal.vue";
import {useSuiWallet} from "../composables/useSuiWallet";


const props = defineProps({
  /*
    Determines if the modal will instantly show upon rendering the button.
    Default value is false
   */
  startToggled: {
    type: Boolean,
    default: false
  },
  /*
    It determines whether to show information about the wallet that is connected
    as well as the address of the user on the left of the button.
    Default value is true.
 */
  showInformationText:{
    type: Boolean,
    default: true
  },
    /*
      The following ones are text based that control the actual words used in the component
   */
  connectedWalletText:{
    type: String,
    default: "Connected Wallet"
  } ,
  addressText: {
    type: String,
    default: "Address"
  },
  connectText:{
    type: String,
    default: "Connect Your Wallet"
  },
  logoutText:{
    type: String,
    default: "Logout"
  } ,
  chooseProvider: {
    type: String,
    default: "Select wallet provider:"
  },
  connect: {
    type: String,
    default: ""
  },
  noWalletExtensionInstalled:{
    type: String,
    default: 'No wallet extensions found. Maybe try Sui\'s default one?'
  }
})

const toggleWalletAuthModal = ref(props.startToggled);
const {suiWallet, suiAddress, suiProvider,changeNetwork,accountMap} = useSuiWallet();

const currentNetwork = ref('eth:mainnet')

watch(currentNetwork,(newVal,oldVal) =>{
  changeNetwork(newVal)
})

const accounts = computed(() => {
  const list = []
  for(let item of suiWallet.accountMap){
    list.push({
      wallet: item[0],
      address: item[1]
    })
  }
  return list
})


const hasWalletPermissions = computed(()=>{
  return !!suiAddress.value
});

const logout = (wallet, account) => {
  suiAddress.value = null;

  const provider = suiWallet.providerMap.get(wallet)

  suiWallet.logout(provider).then(()=>{
    suiWallet.activeProvider = null; // clear activeProvider too.
  }).catch().finally(() => {
    console.log(suiWallet.accountMap)
  }); // logout.
}

// This one verifies that the logged in state is actually valid by
// trying to re-login the user upon login. It actually re-initializes the state
// with the current active address & Provider.
const verifyLoggedInStatus = () => {

  if(!suiWallet.activeProvider) return;

  // console.info('There is an active wallet connection from previous session. Attempting to re-establish.');

  // login with current provider.
  suiWallet.login().then(res=>{
    if(res.error) return logout();
    suiAddress.value = res.account;

  }).catch(e => {
    logout(); // logout if we fail the re-connect phase.
  })
}

verifyLoggedInStatus();


</script>

<style scoped>
</style>
