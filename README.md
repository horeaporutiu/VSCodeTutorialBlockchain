# Use IBM Blockchain Platform extension in VSCode to develop a Smart Contract

In this tutorial, we will learn the process of using IBM Blockchain Platform's VSCode extension 
to  streamline the 
process of developing, testing, and deploying a smart contract. Once we finish the 
tutorial, we will understand how to quickly develop, demo, and deploy blockchain
application on a local Hyperledger Fabric network using VSCode. This tutorial assumes some
basic understanding of Hyperledger Fabric.

# Watch the Videos

[![](docs/thumbnail.png)](https://www.youtube.com/watch?v=r77p-8k4Mpk)

[![](docs/thumbnail2.png)](https://www.youtube.com/watch?v=ixu8tyXsCwY)

### Prerequisites

- [Node v8.x or greater and npm v5.x or greater](https://nodejs.org/en/download/)
- [Yeoman (yo) v2.x](http://yeoman.io/)
- [Docker version v17.06.2-ce or greater](https://www.docker.com/get-docker)
- [Docker Compose v1.14.0 or greater](https://docs.docker.com/compose/install/)
- [VSCode 1.28.2 or higher](https://code.visualstudio.com/download)

If you are using Windows, you must also ensure the following:
- Your version of Windows supports Hyper-V and Docker:
  - Windows 10 Enterprise, Pro, or Education with 1607 Anniversary Update or later
- Docker for Windows is configured to use Linux containers (this is the default)
- You have installed the C++ Build Tools for Windows from [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools#windows-build-tools)
- You have installed OpenSSL v1.0.2 from [Win32 OpenSSL](http://slproweb.com/products/Win32OpenSSL.html)
  - Install the normal version, not the version marked as "light"
  - Install the Win32 version into `C:\OpenSSL-Win32` on 32-bit systems
  - Install the Win64 version into `C:\OpenSSL-Win64` on 64-bit systems

You can check your installed versions by running the following commands from a terminal:
- `node --version`
- `npm --version`
- `yo --version`
- `docker --version`
- `docker-compose --version`

### Learning Objectives
- Install the IBM Blockchain Platform VSCode Extension
- Create a new JavaScript smart contract
- Package a smart contract
- Create, explore and understand a Hyperledger Fabric Network
- Deploy the smart contract on a local Hyperledger Fabric instance
- Use Node.js SDK to interact with deployed Smart Contract package

### Estimated time
- After the prerequisites are installed, this should take <b>approximately 30-45 minutes</b> to complete.

# Steps

1. [Creating a new smart contract project](#step-1-creating-a-new-smart-contract-project)
2. [Modifying the smart contract](#step-2-modifying-the-smart-contract)
3. [Packaging the smart contract](#step-3-Packaging-the-smart-contract)
4. [Installing the smart contract](#step-4-Installing-the-smart-contract)
5. [Instantiating the smart contract](#step-5-instantiating-the-smart-contract)
6. [Importing the certificate and key](#step-6-importing-the-certificate-and-key)
7. [Adding an identity](#step-7-adding-an-identity)
8. [Updating network ports](#step-8-updating-network-ports)
9. [Invoking the smart contract](#step-9-invoking-the-smart-contract)
10. [Updating the smart contract](#step-10-updating-the-smart-contract)
11. [Querying the ledger](#step-11-querying-the-ledger)
12. [Conclusion](#step-12-conclusion)

## Let's get started
![packageFile](/docs/installExtension.gif)
First thing we need to do is to install the IBM Blockchain Platform VSCode extension. You 
will need to install the latest version of VSCode to do this. To see if you have the latest 
VSCode extension, go to `Code` -> `Check for Updates`. If VSCode crashes at this point 
(which it did for me), it likely means you don't have the latest version. If so, 
update your VSCode, and once you're done, click on `extensions` on the side bar on the left 
part of your screen. At the top, search the extension marketplace for 
`IBM Blockchain Platform`. Click on `Install`. Then click on `reload`. Nice, you 
are all set to use the extension!

## Step 1. Creating a New Smart Contract Project
![packageFile](/docs/createSmartContract.gif)

To create a smart contract project: 

1. Click on your newly downloaded IBM Blockchain Platform extension. It should be the extension
all the way at the bottom of the left side bar.
2. Next, use the keyboard shortcut `Shift` + `CMD` + `P` to 
bring up the command pallete. Choose **IBM Blockchain Platform: Create Smart Contract Project** from the dropdown.
3. Click **JavaScript** from the dropdown. 
4. Click **New Folder**, and name the project what you want. I named mine `demoContract`.
5. Click **Create** and then **Open** your new folder which you just created. Next, from the dropdown, click **Add to Workspace**.
6. Once the extension is done packaging your contract, you can open the `lib/my-contract.js` file to see your smart 
contract code scaffold. Nice job!

## Step 2. Modifying the Smart Contract 
![packageFile](/docs/addChaincode.gif)
Inside your `lib/my-contract.js` file, go ahead and copy 
and paste this code: 

```
'use strict';

const { Contract } = require('fabric-contract-api');

class MyContract extends Contract {

  //update ledger with a greeting to show that the function was called
  async instantiate(ctx) {
    let greeting = { text: 'Instantiate was called!' };
    await ctx.stub.putState('GREETING', Buffer.from(JSON.stringify(greeting)));
  }

  //take argument and create a greeting object to be updated to the ledger
  async transaction1(ctx, arg1) {
    console.info('transaction1', arg1);
    let greeting = { text: arg1 };
    await ctx.stub.putState('GREETING', Buffer.from(JSON.stringify(greeting)));
    return JSON.stringify(greeting);
  }

}

module.exports = MyContract;
```

**Note:** the gifs may not **exactly** match the above smart contract, but this is the one 
you should have in your `lib/my-contract.js` file now!

Let's examine the functions we defined. The `instantiate` function creates a greeting 
object and then stores that on the ledger with the key `GREETING`. 
The `transaction1` function takes the Hyperledger
Fabric context, and one argument, `arg1` which is used to store a greeting as defined by the user.
The `ctx.stub.putState` method is used to record the `greeting` on the ledger and then we 
return that object back. Save the file, and proceed!

## Step 3. Packaging the Smart Contract
![packageFile](/docs/packageSmartContract.gif)
Now that we have created our smart contract and understood which functions we defined,
it's time to package it so we can install it on a peer.

1. Open the command pallete with `Shift` + `CMD` + `P` and select **package smart contract**
2. In the left sidebar, click on the IBM Blockchain Platform icon (it looks like a square). 
On the top-left corner, you will have all of your smart contract packages. You should 
see `demoContract@0.0.1` if everything went well. 

## Step 4. Installing the Smart Contract
![packageFile](/docs/installSmartContract.gif)

Ok, we're more than halfway there. Now for the fun part! Let's install this contract on the peer!
To do this, we must first connect to a Hyperledger Fabric network. The network that comes with
the VSCode extension is perfect for development - it offers the minimal resources to develop and 
test your contract.

The following Docker containers are started on your local machine, each with a different role in
the network: Orderer, Certificate Authority, CouchDB, and Peer. 

To start our network, look at your IBM Blockchain Platform extension, at the bottom-right corner
where it says `Blockchain Connections`. 

1. You should see `local_fabric`. Go ahead and click that.
That should automatically run a script and you should see the output as follows: 
```
Starting fabricvscodelocalfabric_orderer.example.com_1 ... done
Starting fabricvscodelocalfabric_ca.example.com_1      ... done
Starting fabricvscodelocalfabric_couchdb_1             ... done
Starting fabricvscodelocalfabric_peer0.org1.example.com_1 ... done
``` 

2. Click the `local_fabric` connection again. Now that it's up and running, it should 
take you to your channel view, which should show one channel, named `mychannel`. Click on 
`mychannel`.
3. This will expand your channel and show the peers and smart contracts. Click on 
`peers` and you should see `peer0.org1.example.com`. Right-click on that peer, and click on
`Install Smart Contract`.
4. The extension will ask you which package to install, so choose `demoContract@0.0.1`. That's it! Nice job!

## Step 5. Instantiating the Smart Contract
![packageFile](/docs/instantiateSmartContract.gif)

This is the real test - will our smart contract instantiate properly? Let's see.
1. From the IBM Blockchain extension, in the bottom-left corner, under `Blockchain Connections`,
right-click on `mychannel` and then on `Instantiate / Upgrade Smart Contract`.
2. The extension will then ask you which contract and version to instantiate - choose `demoContract@0.0.1`.
3. The extension will then ask you which function to call - type in `instantiate`.
4. Next, it will ask you the arguments, for which there are none, so just hit enter.

The extension will do some work, and then you should see in the bottom-right corner that the contract
was successfully instantiated. Hooray!!

## Step 6. Importing the certificate and key
![packageFile](/docs/gitPull.gif)

At this point, we need to start interacting a bit more closely with our
Fabric instance. We'll need to prove to the certificate authority that we are allowed
to create a digital identity on the network. This is done by showing the certificate
authority our certificate and private key.

1. In VSCode, click on the IBM Blockchain Platform extension in the left sidebar.

2. Under `Blockchain Connections` in the bottom-left corner, right-click on the `local_fabric`
connection, and select `Export Connection Details`. Then you can choose the current smart 
contract folder to save the connection profile. 

3. You should see something like: 

```
Successfully exported connection details to /Users/Horea.Porutiu@ibm.com/Workdir/demoContract/local_fabric
```

4. We now need a script to create a new identity on the network. Clone this
Github Repo outside of your smart contract directory 
to get the script. You can find the script under `VSCodeLocalNetwork/addIdentity.js`.

  ```
  $ git clone https://github.com/horeaporutiu/VSCodeLocalNetwork.git
  ```

5. Import this folder into your VSCode workspace by right-clicking an empty space
under your smart contract directory in VSCode and selecting **Add folder to workspace**. 
Find the recently clone folder `VSCodeLocalNetwork` and double-click it.

6. Take a look at `VSCodeLocalNetwork/addIdentity.js`. You will find the 
following code: 

```
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
        const cert = fs.readFileSync('./cert').toString();
        const key = fs.readFileSync('./key').toString();
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
```

This code creates an identity by passing in our certificate and private key.
Notice we are using the `fabric-network` NPM package to call the `createIdentity` method, 
and then using the `import` function to add that identity to our wallet. The most important line of this file
is the `await wallet.import(identityLabel, X509WalletMixin.createIdentity('Org1MSP', cert, key));` line
which actually creates a new MSP identity using our cert and key file. This [MSP(Membership Service Provider)](https://hyperledger-fabric.readthedocs.io/en/release-1.3/msp.html) identity will be able to connect to the 
network and invoke smart contracts.

## Step 7. Adding an Identity
![packageFile](/docs/addIdentityScript.gif)
Now that we have an identity that can interact with our network, we need to 
to run `npm install` to install all the dependencies that are needed to connect to our local Fabric network. 

1. Run `npm install` in the `VSCodeLocalNetwork`.
2. Then, run `node addIdentity`. You should see that this command creates a new folder called `_idwallet`
 and populates that folder with the MSP identity, which in our case goes by the name of
`User1@org1.example.com`. Nice job! 

## Step 8. Updating network ports
![packageFile](/docs/addPorts.gif)

1. Next, open the `network.yaml` in the `VSCodeLocalNetwork` folder. We will use this file to connect 
to our Docker containers running locally.

2. To see your docker containers running locally, open the `demoContract/local_fabric/connection.json`
file.

![packageFile](/docs/ports.png)

**Important Note: your ports will differ from those shown** 

3. Next, look for the urls to connect to your peer, orderer, and certificate authority in the 
`demoContract/local_fabric/connection.json` file. Copy the corresponding url field from
 `orderer.example.com`, `peer0.org1.example.com`, and `ca.org1.example.com`.
 
In the picture above the ports in `network.yaml` would be set as follows:

First the orderer: 

```
orderers:
  orderer.example.com:
    url: grpc://localhost:17050
```
Then the peer: 

```
peers:
  peer0.org1.example.com:
    # this URL is used to send endorsement and query requests
    url: grpc://localhost:17051

```

Then the CA: 

```
certificateAuthorities:
  ca-org1:
    url: http://localhost:17054
```
4. Great job. Save the file.

## Step 9. Invoking the Smart Contract
![packageFile](/docs/invoke.gif)

Ok, so we've instantiated our contract, created our identity, so now what?
Well now, let's actually invoke the functions in our contract! To do this, 
we will need to invoke a script from our `VSCodeLocalNetwork` directory. 

1. From our `VSCodeLocalNetwork` directory, we should have a file called `invoke.js`. 
Let's examine this file.

2. After we create an instance of the `fabric-network`, we connect to the network with the following code:
```
await gateway.connect(connectionProfile, connectionOptions);
```

Notice here that the connection profile is the `network.yaml` file that we updated in the previous step, and the `connectionOptions` is an object which contains the credentials from our `_idwallet` directory. 

3. After we connect to the network, we need to specify the channel to connect to, which 
in our case happens to be `mychannel`. This line connects to our channel:

```
const network = await gateway.getNetwork('mychannel');
```

4. Our channel may have many contracts installed, so in the next line, we specify which contract
to invoke. In our case, this is `demoContract`. 

```
const contract = await network.getContract('demoContract');
```

5. The final part of our script picks which function to invoke, and specifies the arguments. In 
our case we are invoking `transaction1` with an arg of `hello` as can be seen
here: 

```
let response = await contract.submitTransaction('transaction1', 'hello');
```

6. Now, we can run the script, with this command:

```
$ node invoke.js
```
If you get an error, check your `network.yaml` file and make sure the ports are the same as shown in your 
logs from the `docker ps` command.

If all goes well, you should see the following output:

```
VSCodeLocalNetwork$ node invoke.js
Connected to Fabric gateway.
Connected to mychannel.

Submit hello world transaction.
info: [TransactionEventHandler]: _strategySuccess: strategy success for transaction "9bf00460721a9d42dfe0d3bf93151f10be8b0a57011d4b24262ef03d5a33ee5e"

{ text: 'hello' }
Disconnect from Fabric gateway.
done
```

Woo!! That's it! Nice job!

## Step 10. Updating the smart contract
![packageFile](/docs/upgrade.gif)
In the previous step, we updated the ledger by using the `putState` API, passing in a key and a value.
The key happened to be "GREETING" and the value happened to be the object 
```
{
  text: 'hello'
}
```
The last thing we should learn is how to query - how to retrieve data from the ledger. We will do this
by using the `getState` API, which takes in a key, and returns the value associated with that key, if it finds it.

Let's add a query function to our `demoContract`.

1. Copy and paste the following code into your `lib/my-contract.js` file:
```
'use strict';

const { Contract } = require('fabric-contract-api');

class MyContract extends Contract {

  //update ledger with a greeting 
  async instantiate(ctx) {
    let greeting = { text: 'Instantiate was called!' };
    await ctx.stub.putState('GREETING', Buffer.from(JSON.stringify(greeting)));
  }

  //add a member along with their email, name, address, and number
  async addMember(ctx, email, name, address, phoneNumber) {
    let member = {
      name: name,
      address: address,
      number: phoneNumber,
      email: email
    };
    await ctx.stub.putState(email, Buffer.from(JSON.stringify(member)));
    return JSON.stringify(member);
  }

  // look up data by key
  async query(ctx, key) {
    console.info('querying for key: ' + key  );
    let returnAsBytes = await ctx.stub.getState(key);
    let result = JSON.parse(returnAsBytes);
    return JSON.stringify(result);
  }

}

module.exports = MyContract;
```

The code adds an `addMember` function which takes in arguments from the user such as 
email, name, address, and phone number, and saves that data on the ledger as a key-value pair. 

This code also adds a `query` function - this function takes in one argument, which is the key to look up. 
The function returns the value associated with a given key, if there is any.

2. Update the `package.json` file such that the line 3, which 
contains the version number, now reads:

```
  "version": "0.0.2",
```

Save the file.

3. After we have updated our package.json, go back and follow steps 3 and 4 to package and install our 
our new smart contract.

4. To upgrade our existing smart contract to our new version, in the bottom left corner 
of our IBM Blockchain extension, expand the `Instantiated Smart Contract` link, and then
right-click on `demoContract` and choose **Upgrade Smart Contract**. If all goes
well you should get a notification in the bottom right corner saying 
**Successfully upgraded smart contract**.

![packageFile](/docs/addMember.gif)

5. Now, we can invoke our transactions from the VSCode extension. Under `Blockchain Connections` from the bottom-left
corner of our IBM Blockchain Extension, under `mychannel` expand `peer0.org1.example.com` and then expand the `demoContract`
to view the functions we have defined in `my-contract.js`, namely `instantiate`, `addMember` and `query`.

6. Right-click on `addMember` and click `Submit Transaction`. For the arguments, copy and paste the following:

```
ginny@ibm.com, Ginny Rometty, Wall Street NY, 1234567890
```

In the output, you should see the following:
```
Submitting transaction addMember with args Ginny Rometty, Wall Street NY, 1234567890, ginny@ibm.com
```

Let's add one more member, so repeat this step, bbut for the arguments, copy and paste the following: 

```
arvind@ibm.com, Arvind Krishna, Broadway Street NY, 1231231111
```

Nice job. Now on to the last step!


## Step 11. Querying the ledger
![packageFile](/docs/query.gif)
After we have added some objects on the ledger, it's time to query the ledger to see if 
our data is properly stored on the CouchDB instance of our local fabric network.

1. Take a look at our `query.js` file. It's very similar to our `invoke.js` file, except it has a few 
key differences:

```
const channel = network.getChannel();
    
//set up our request - specify which chaincode, which function, and which arguments
let request = { chaincodeId: 'demoContract', fcn: 'query', args: ['GREETING'] };

//query the ledger by the key in the args above
let resultBuffer = await channel.queryByChaincode(request);
```

The main difference is that in this file, we use the `queryByChaincode` API, which 
**reads** from the ledger. This is very important. In our `invoke.js` file, we submit 
transactions to the ledger, which will all get **written to the ledger** 
but here, in our `query.js` file, we will not update the ledger. 

2. Run the script, to find the value stored in the `GREETING` variable:

```
$ node query.js
```

You should get the following output: 

```
Connected to Fabric gateway.
{ text: 'Instantiate was called!' }
Disconnect from Fabric gateway.
done
```

3. Next, let's query for Ginny Rometty. Change the following line:

```
let request = { chaincodeId: 'demoContract', fcn: 'query', args: ['GREETING'] };
```

to this:

```
let request = { chaincodeId: 'demoContract', fcn: 'query', args: ['ginny@ibm.com'] };
```

Your output should be as follows: 

```
VSCodeLocalNetwork$ node query.js
Connected to Fabric gateway.
{"address":" Wall Street NY","email":"ginny@ibm.com","name":" Ginny Rometty","number":" 1234567890"}
Disconnect from Fabric gateway.
done
```

4. Lastly, let's query for Arvind. Modify the request to be as follows:

```
let request = { chaincodeId: 'demoContract', fcn: 'query', args: ['arvind@ibm.com'] };
```

The output should be similar to the one above, except with Arvind's data.

### Step 12. Conclusion

Nice job! You are done! You learned how to create, package, install, instantiate, 
invoke, AND query a smart contract using Hyperledger's newest API's. At this point, 
you can focus on developing your smart contract, and update your `my-contract.js`
file knowing that you have taken care of the networking aspects of blockchain, 
and that you can successfully invoke, and update your ledger using just VSCode,
Node.js, and Docker. Please, please, please reach out to me if there are bugs,
comment on this post, and tell me, and I will fix them. Thanks so much for 
reading this post, and hope you enjoyed it! Horea Blockchain out!

# Links

* [IBM Blockchain - Marbles demo](https://github.com/IBM-Blockchain/marbles)
* [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/en/release-1.2/)


# Learn more

* **Blockchain Code Patterns**: Enjoyed this Code Pattern? Check out our other [Blockchain Code Patterns](https://developer.ibm.com/code/technologies/blockchain/)

* **Blockchain 101**: Learn why IBM believes that blockchain can transform businesses, industries – and even the world. [Blockchain 101](https://developer.ibm.com/code/technologies/blockchain/)

# License
[Apache 2.0](LICENSE) 
