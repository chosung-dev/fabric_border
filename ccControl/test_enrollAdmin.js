'use strict';
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
var ccControl = {
    enrollAdmin : async function(){
        try {

            // Create a new CA client for interacting with the CA.
            const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
            const ca = new FabricCAServices(caURL);

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join('..','ccControl','wallet');
            const wallet = new FileSystemWallet(walletPath);

            // Check to see if we've already enrolled the admin user.
            const adminExists = await wallet.exists('admin');
            if (adminExists) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }
            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
            wallet.import('admin', identity);
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
            await sleep(5000);

        } catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
            process.exit(1);
        }
    }
};

ccControl.enrollAdmin();