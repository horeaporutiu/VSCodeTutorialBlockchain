'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./_idwallet');

async function main(){

    // Main try/catch block
    try {

        // define the identity to use
        const cert = fs.readFileSync('./local_fabric/certificate').toString();
        const key = fs.readFileSync('./local_fabric/privateKey').toString();
        const identityLabel = 'User1@org1.example.com';

        // prep wallet and test it at the same time
        await wallet.import(identityLabel, X509WalletMixin.createIdentity('Org1MSP', cert, key));

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(()=>{
    console.log('done');
}).catch((e)=>{
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});