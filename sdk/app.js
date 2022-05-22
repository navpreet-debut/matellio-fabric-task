/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./AppUtil.js');

//Channel name
const channelName = 'mychannel';

//Chaincode name
const chaincodeName = 'student';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

/**
 *  A test application to show basic queries operations with any of the student-chaincodes methods
 */
async function main() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client		
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.matelliofabric.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
				
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.		
		const gateway = new Gateway();

		try {
			// setup the gateway instance			
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of students on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			// Let's try a query type operation (function).			
			console.log('\n--> Evaluate Transaction: GetAllStudents, function returns all the students on the ledger');
			let result = await contract.evaluateTransaction('GetAllStudents');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			
			console.log('\n--> Submit Transaction: AddNewStudent ');
			result = await contract.submitTransaction('AddNewStudent', 'SD102', 'Manpreet', 'Singh', 'manpreet.skingh@debutinfotech.com', '8888888888', 'Mohali, Punjab', 'Mohali');
			console.log('*** Result: committed');
			
			if (`${result}` !== '') {
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			}

			console.log('\n--> Evaluate Transaction: GetSingleStudent, function returns an student with a given ID');
			result = await contract.evaluateTransaction('GetSingleStudent', 'SD102');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			
			console.log('\n--> Submit Transaction: EditStudent edit the student');
			await contract.submitTransaction('EditStudent', 'SD102', 'Manpreet', 'Singh', 'manpreet.singh@debutinfotech.com', '8888888888', 'Mohali, Punjab', 'Amritsar');
			console.log('*** Result: committed');

		} finally {
			// Disconnect from the gateway when the application is closing			
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
