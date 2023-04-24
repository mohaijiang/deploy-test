<script setup>
// import {useSuiWallet} from "../dist/vue-sui-wallet.es";
import {useSuiWallet} from "../lib/lib";
import {
  TransactionBlock,
} from '@mysten/sui.js';

const {suiWallet, suiAddress, suiProvider} = useSuiWallet();

const testWallet = () => {

  const tx = new TransactionBlock();
  tx.moveCall({
    target: "0x0000000000000000000000000000000000000002::devnet_nft::mint",
    arguments: [
      tx.pure("some hamster "),
      tx.pure("some hamster description"),
      tx.pure(
          "https://develop.hamster.newtouch.com/static/logo-dark.6da8722b.svg"
      ),
    ],
  });

  suiWallet.signAndExecuteTransactionBlock(tx).then(res=>{
      alert('Transaction completed successfully. <br>' +res.certificate.transactionDigest+ '')
      console.log(res);
    }).catch(e=>{
      console.log(e);
    });
}

</script>

<template>
  <div style="height:100vh;display:flex;align-items: center;justify-content: center">
<!--/*    <div style="justify-content: end;display:flex;">*/-->
      <sui-connect-button></sui-connect-button>
<!--    </div>-->
    <button @click="testWallet" class="sui-login-button"> Try a transaction</button>

  </div>

</template>

